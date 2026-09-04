import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint, publicEndpoint } from '@/lib/security/security-pipeline'
import { PERM_BARANG_TITIPAN_READ } from '@/lib/security/permissions'
import { success, created, error, parsePagination, buildMeta } from '@/lib/api-response'
import { qrImageUrl } from '@/lib/qr'
import { Prisma } from '@prisma/client'

async function generateKodeTitipan(): Promise<string> {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `TRP-${yy}${mm}`

  // Find the max sequential number for this YYMM
  const lastRecord = await db.barangTitipan.findFirst({
    where: { kodeTitipan: { startsWith: prefix } },
    orderBy: { kodeTitipan: 'desc' },
    select: { kodeTitipan: true },
  })

  let nextNum = 1
  if (lastRecord) {
    const parts = lastRecord.kodeTitipan.split('-')
    nextNum = parseInt(parts[2], 10) + 1
  }

  return `${prefix}-${String(nextNum).padStart(3, '0')}`
}

// POST /api/barang-titipan — Create barang titipan (public: visitors submit without login)
// Sama seperti kunjungan online: pengirim tidak perlu memilih WBP dari daftar,
// cukup menuliskan nama WBP. Verifikasi & pencocokan dilakukan petugas.
export const POST = publicEndpoint(
  async (request: NextRequest) => {
    const body = await request.json()
    const {
      nama_pengirim,
      nik_pengirim,
      no_hp,
      hubungan,
      nama_wbp,
      nomor_register_wbp,
      wbp_id,
      kategori,
      tanggal_penitipan,
      jam_penitipan,
      catatan_pengirim,
      items,
    } = body as {
      nama_pengirim?: string
      nik_pengirim?: string
      no_hp?: string
      hubungan?: string
      nama_wbp?: string
      nomor_register_wbp?: string
      wbp_id?: string
      kategori?: string
      tanggal_penitipan?: string
      jam_penitipan?: string
      catatan_pengirim?: string
      items?: { nama_barang: string; jumlah?: number; satuan?: string; keterangan?: string }[]
    }

    // Validate required fields
    if (!nama_pengirim || !hubungan || !nama_wbp || !tanggal_penitipan) {
      return error('BAD_REQUEST', 'nama_pengirim, hubungan, nama_wbp, dan tanggal_penitipan wajib diisi', 400)
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('BAD_REQUEST', 'Minimal 1 item barang harus diisi', 400)
    }

    // Validate at least nama_barang in each item
    for (let i = 0; i < items.length; i++) {
      if (!items[i].nama_barang) {
        return error('BAD_REQUEST', `nama_barang pada item ke-${i + 1} wajib diisi`, 400)
      }
    }

    // Create BarangTitipan + ItemBarang in a transaction.
    // Auto-retry jika kode titipan bentrok (race condition generator kode).
    let createdResult: {
      kodeTitipan: string
      status: string
      tanggalPenitipan: string
      jumlahItem: number
    } | undefined
    let kodeTitipan = await generateKodeTitipan()
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        createdResult = await db.$transaction(async (tx) => {
          const created = await tx.barangTitipan.create({
            data: {
              kodeTitipan,
              namaPengirim: nama_pengirim,
              nikPengirim: nik_pengirim || null,
              noHp: no_hp || null,
              hubungan,
              namaWbp: String(nama_wbp).trim(),
              nomorRegisterWbp: nomor_register_wbp ? String(nomor_register_wbp).trim() : null,
              wbpId: wbp_id || null,
              kategori: kategori || 'Lainnya',
              tanggalPenitipan: tanggal_penitipan,
              jamPenitipan: jam_penitipan || null,
              catatanPengirim: catatan_pengirim || null,
              status: 'Menunggu',
              items: {
                create: items.map((item) => ({
                  namaBarang: item.nama_barang,
                  jumlah: item.jumlah || 1,
                  satuan: item.satuan || 'pcs',
                  keterangan: item.keterangan || null,
                  status: 'Menunggu',
                })),
              },
            },
            include: { items: true },
          })
          return {
            kodeTitipan: created.kodeTitipan,
            status: created.status,
            tanggalPenitipan: created.tanggalPenitipan,
            jumlahItem: created.items.length,
          }
        })
        break
      } catch (err) {
        const isCollision =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
        if (!isCollision || attempt === 2) throw err
        kodeTitipan = await generateKodeTitipan()
      }
    }

    if (!createdResult) {
      return error('CONFLICT', 'Gagal membuat kode titipan, silakan coba lagi', 409)
    }

    return created({
      kode_titipan: createdResult.kodeTitipan,
      status: createdResult.status,
      tracking_url: `/barang-titipan/lacak?kode=${createdResult.kodeTitipan}`,
      qr_code_url: qrImageUrl(createdResult.kodeTitipan),
      nama_wbp: String(nama_wbp).trim(),
      nomor_register_wbp: nomor_register_wbp ? String(nomor_register_wbp).trim() : null,
      jumlah_item: createdResult.jumlahItem,
      tanggal_penitipan: createdResult.tanggalPenitipan,
      message:
        'Penitipan berhasil didaftarkan. Simpan kode titipan & barcode ini, tunjukkan kepada petugas saat mengantar barang untuk diverifikasi.',
    }, 'Penitipan barang berhasil didaftarkan')
  },
)

// GET /api/barang-titipan — List all barang titipan (authenticated)
export const GET = authenticatedEndpoint(
  [PERM_BARANG_TITIPAN_READ],
  async (request: NextRequest) => {
    const { searchParams } = request.nextUrl
    const { page, limit, skip } = parsePagination(searchParams)

    const status = searchParams.get('status') || ''
    const kategori = searchParams.get('kategori') || ''
    const search = searchParams.get('search') || ''
    const wbpId = searchParams.get('wbp_id') || ''
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (kategori) where.kategori = kategori
    if (wbpId) where.wbpId = wbpId

    if (search) {
      where.OR = [
        { namaPengirim: { contains: search } },
        { kodeTitipan: { contains: search } },
      ]
    }

    if (dateFrom || dateTo) {
      const tanggalFilter: Record<string, unknown> = {}
      if (dateFrom) tanggalFilter.gte = dateFrom
      if (dateTo) tanggalFilter.lte = dateTo
      where.tanggalPenitipan = tanggalFilter
    }

    const [total, records] = await Promise.all([
      db.barangTitipan.count({ where }),
      db.barangTitipan.findMany({
        where,
        include: {
          wbp: {
            select: {
              id: true,
              nomorRegister: true,
              nama: true,
              status: true,
              currentRoom: {
                select: { blockName: true, roomNumber: true },
              },
            },
          },
          verifiedBy: {
            select: { id: true, nama: true, nip: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    const data = records.map((r) => ({
      id: r.id,
      kode_titipan: r.kodeTitipan,
      nama_pengirim: r.namaPengirim,
      no_hp: r.noHp,
      hubungan: r.hubungan,
      nama_wbp: r.namaWbp || r.wbp?.nama || null,
      nomor_register_wbp: r.nomorRegisterWbp || r.wbp?.nomorRegister || null,
      kategori: r.kategori,
      tanggal_penitipan: r.tanggalPenitipan,
      status: r.status,
      wbp: r.wbp
        ? {
            id: r.wbp.id,
            nomor_register: r.wbp.nomorRegister,
            nama: r.wbp.nama,
            status: r.wbp.status,
            blok: r.wbp.currentRoom?.blockName || null,
            kamar: r.wbp.currentRoom?.roomNumber || null,
          }
        : null,
      verified_by: r.verifiedBy
        ? { id: r.verifiedBy.id, nama: r.verifiedBy.nama, nip: r.verifiedBy.nip }
        : null,
      jumlah_item: r._count.items,
      verified_at: r.verifiedAt,
      delivered_at: r.deliveredAt,
      rejected_at: r.rejectedAt,
      created_at: r.createdAt,
    }))

    return success(data, 'Data barang titipan berhasil diambil', buildMeta(total, page, limit))
  },
)