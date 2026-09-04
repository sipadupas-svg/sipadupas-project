import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_KUNJUNGAN_READ } from '@/lib/security/permissions'
import { qrImageUrl } from '@/lib/qr'
import { error } from '@/lib/api-response'

// GET /api/kunjungan/scan?kode=... — Scan/lookup tiket by kodeBooking (UF-12)
// Digunakan petugas pendaftaran saat pemunjung datang: scan barcode / ketik
// Nomor Booking, lalu petugas WAJIB memverifikasi (setujui/tolak) sebelum check-in.
export const GET = authenticatedEndpoint(
  [PERM_KUNJUNGAN_READ],
  async (request: NextRequest) => {
    try {
      const kode = request.nextUrl.searchParams.get('kode')?.trim()

      if (!kode) {
        return error('BAD_REQUEST', 'Kode booking wajib diisi', 400)
      }

      const kunjungan = await db.kunjungan.findFirst({
        where: { kodeBooking: kode },
        include: {
          berkas: {
            select: { id: true, jenis: true, namaFile: true, mimeType: true, ukuran: true, data: true, createdAt: true },
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
      })

      if (!kunjungan) {
        return error('NOT_FOUND', `Tiket dengan kode ${kode} tidak ditemukan`, 404)
      }

      return NextResponse.json({
        data: kunjungan,
        qrCodeUrl: qrImageUrl(kunjungan.kodeBooking),
      })
    } catch (err) {
      console.error('[GET /api/kunjungan/scan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal memindai tiket kunjungan', 500)
    }
  },
)
