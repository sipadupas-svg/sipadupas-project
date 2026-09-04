import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_KUNJUNGAN_UPDATE } from '@/lib/security/permissions'
import { qrImageUrl } from '@/lib/qr'
import { error } from '@/lib/api-response'

function generateKodeBooking(): string {
  const now = new Date()
  const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `SJY-${date}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
}

// Staff-created booking. Public submissions must use /api/kunjungan and include uploads.
// Petugas tidak perlu memilih WBP dari daftar — cukup tulis nama WBP;
// verifikasi & pencocokan data WBP dilakukan petugas pelayanan saat kunjungan.
export const POST = authenticatedEndpoint(
  [PERM_KUNJUNGAN_UPDATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { namaPemohon, nikPemohon, noHp, alamat, hubungan, namaWbp, nomorRegisterWbp, tanggal, sesi } = body
      if (!namaPemohon || !hubungan || !namaWbp || !tanggal || !sesi) {
        return error('BAD_REQUEST', 'Data pemohon, hubungan, nama WBP, tanggal, dan sesi wajib diisi', 400)
      }
      const kunjungan = await db.kunjungan.create({
        data: {
          kodeBooking: generateKodeBooking(), namaPemohon, nikPemohon: nikPemohon || null,
          noHp: noHp || null, alamat: alamat || null, hubungan,
          namaWbp: String(namaWbp).trim(),
          nomorRegisterWbp: nomorRegisterWbp ? String(nomorRegisterWbp).trim() : null,
          tanggal, sesi,
          keperluan: 'Booking dibuat petugas', status: 'Menunggu',
        },
        include: { wbp: { select: { id: true, nama: true, nomorRegister: true, currentRoom: { select: { blockName: true, roomNumber: true } } } } },
      })
      return NextResponse.json({ data: kunjungan, qrCodeUrl: qrImageUrl(kunjungan.kodeBooking) }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/kunjungan/internal] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat booking kunjungan', 500)
    }
  },
)