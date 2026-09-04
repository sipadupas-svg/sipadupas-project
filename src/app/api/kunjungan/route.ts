import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { authenticatedEndpoint, publicEndpoint } from '@/lib/security/security-pipeline'
import { qrImageUrl } from '@/lib/qr'
import { PERM_KUNJUNGAN_READ } from '@/lib/security/permissions'
import { error, parsePagination, buildMeta } from '@/lib/api-response'

const ALLOWED_DOCUMENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
const ALLOWED_SELFIE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE = 3 * 1024 * 1024

type UploadedDocument = {
  jenis: 'IDENTITAS' | 'SELFIE'
  namaFile: string
  mimeType: string
  ukuran: number
  data: string
}

function isValidUpload(file: unknown): file is UploadedDocument {
  if (!file || typeof file !== 'object') return false
  const candidate = file as Record<string, unknown>
  const jenis = candidate.jenis
  const mimeType = candidate.mimeType
  const ukuran = candidate.ukuran
  const data = candidate.data
  const namaFile = candidate.namaFile
  const permitted = jenis === 'SELFIE' ? ALLOWED_SELFIE_TYPES : ALLOWED_DOCUMENT_TYPES

  return (
    (jenis === 'IDENTITAS' || jenis === 'SELFIE') &&
    typeof namaFile === 'string' && namaFile.length > 0 && namaFile.length <= 255 &&
    typeof mimeType === 'string' && permitted.has(mimeType) &&
    typeof ukuran === 'number' && ukuran > 0 && ukuran <= MAX_FILE_SIZE &&
    typeof data === 'string' && data.startsWith(`data:${mimeType};base64,`) &&
    data.length <= Math.ceil(MAX_FILE_SIZE * 1.4)
  )
}

function generateKodeBooking(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `SJY-${yy}${mm}${dd}-${rand}`
}

/**
 * Create kunjungan dengan retry otomatis (maks 3x) jika kodeBooking bentrok
 * — unique constraint P2002 — dengan kode baru pada tiap percobaan.
 */
async function createKunjunganWithRetry(
  data: Prisma.KunjunganCreateInput,
  attempts = 3,
) {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await db.kunjungan.create({
        data: attempt === 0 ? data : { ...data, kodeBooking: generateKodeBooking() },
        include: {
          wbp: {
            select: {
              id: true,
              nama: true,
              nomorRegister: true,
              currentRoom: { select: { blockName: true, roomNumber: true } },
            },
          },
        },
      })
    } catch (err) {
      lastError = err
      const isCollision =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
      if (!isCollision) throw err
    }
  }
  throw lastError
}

// GET /api/kunjungan — List all kunjungan with optional status filter (UF-11)
export const GET = authenticatedEndpoint(
  [PERM_KUNJUNGAN_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || ''

      const where: Record<string, unknown> = {}
      if (status) {
        where.status = status
      }

      // Pagination opsional: ?page=&limit= → meta disertakan.
      // Tanpa param → full list (backward compatible dengan frontend lama).
      const wantsPagination = searchParams.get('page') || searchParams.get('limit')

      if (wantsPagination) {
        const { page, limit, skip } = parsePagination(searchParams)
        const [total, kunjunganPage] = await Promise.all([
          db.kunjungan.count({ where }),
          db.kunjungan.findMany({
            where,
            include: {
              berkas: {
                select: { id: true, jenis: true, namaFile: true, mimeType: true, ukuran: true, createdAt: true },
              },
              wbp: {
                select: {
                  id: true,
                  nama: true,
                  nomorRegister: true,
                  currentRoom: { select: { blockName: true, roomNumber: true } },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
        ])
        return NextResponse.json({ data: kunjunganPage, meta: buildMeta(total, page, limit) })
      }

      const kunjunganList = await db.kunjungan.findMany({
        where,
        include: {
          berkas: {
            // Jangan sertakan `data` (base64 file) di list — payload membengkak.
            // Metadata tetap dikirim; isi file tersedia via detail/scan endpoint.
            select: { id: true, jenis: true, namaFile: true, mimeType: true, ukuran: true, createdAt: true },
          },
          wbp: {
            select: {
              id: true,
              nama: true,
              nomorRegister: true,
              currentRoom: { select: { blockName: true, roomNumber: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: kunjunganList })
    } catch (err) {
      console.error('[GET /api/kunjungan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data kunjungan', 500)
    }
  },
)

// POST /api/kunjungan — Create kunjungan booking (UF-11)
// Public: this is the endpoint the public booking form (landing/kunjungan page)
// submits to without being logged in, so it must not require authentication.
export const POST = publicEndpoint(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const {
        namaPemohon,
        nikPemohon,
        noHp,
        alamat,
        hubungan,
        namaWbp,
        nomorRegisterWbp,
        tanggal,
        sesi,
        keperluan,
        jenisIdentitas,
        setujuPersyaratan,
        berkas,
      } = body

      if (!namaPemohon || !nikPemohon || !noHp || !alamat || !hubungan || !namaWbp || !tanggal || !sesi || !keperluan) {
        return error('BAD_REQUEST', 'Data pemohon, hubungan, keperluan, nama WBP, tanggal, dan sesi wajib diisi', 400)
      }
      if (!/^\d{16}$/.test(nikPemohon)) {
        return error('BAD_REQUEST', 'NIK harus terdiri dari 16 digit', 400)
      }
      if (!/^(\+62|62|08)\d{8,13}$/.test(noHp)) {
        return error('BAD_REQUEST', 'Nomor WhatsApp tidak valid', 400)
      }
      if (!setujuPersyaratan) {
        return error('BAD_REQUEST', 'Anda harus menyetujui persyaratan kunjungan', 400)
      }
      if (!['KTP', 'SIM', 'Paspor'].includes(jenisIdentitas)) {
        return error('BAD_REQUEST', 'Jenis identitas harus KTP, SIM, atau Paspor', 400)
      }
      if (!Array.isArray(berkas) || berkas.length !== 2 || !berkas.every(isValidUpload)) {
        return error('BAD_REQUEST', 'Unggah satu berkas identitas dan satu foto selfie (maksimum 3 MB per berkas)', 400)
      }
      const documentTypes = new Set(berkas.map((file) => file.jenis))
      if (!documentTypes.has('IDENTITAS') || !documentTypes.has('SELFIE')) {
        return error('BAD_REQUEST', 'Berkas identitas dan foto selfie wajib diunggah', 400)
      }

      // Tidak ada pencocokan WBP di database — pemohon menuliskan nama WBP bebas.
      // Pencocokan & verifikasi dilakukan petugas pelayanan saat kunjungan (scan barcode).
      const kodeBooking = generateKodeBooking()

      const kunjungan = await createKunjunganWithRetry({
        kodeBooking,
        namaPemohon,
        nikPemohon: nikPemohon || null,
        noHp: noHp || null,
        alamat: alamat || null,
        hubungan,
        namaWbp: String(namaWbp).trim(),
        nomorRegisterWbp: nomorRegisterWbp ? String(nomorRegisterWbp).trim() : null,
        tanggal,
        sesi,
        keperluan,
        jenisIdentitas,
        setujuPersyaratan: true,
        persetujuanAt: new Date(),
        status: 'Menunggu',
        berkas: {
          create: berkas.map((file) => ({
            jenis: file.jenis,
            namaFile: file.namaFile,
            mimeType: file.mimeType,
            ukuran: file.ukuran,
            data: file.data,
          })),
        },
      })

      return NextResponse.json({
        data: kunjungan,
        kodeBooking: kunjungan.kodeBooking,
        qrCodeUrl: qrImageUrl(kunjungan.kodeBooking),
        message: 'Pendaftaran berhasil. Simpan Nomor Booking & barcode ini, tunjukkan kepada petugas pendaftaran saat datang untuk diverifikasi.',
      }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/kunjungan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat booking kunjungan', 500)
    }
  },
)

