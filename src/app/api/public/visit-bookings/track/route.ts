import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { success, error } from '@/lib/api-response'
import { qrImageUrl } from '@/lib/qr'

// GET /api/public/visit-bookings/track?kode=... — Public visit booking tracking (no auth required)
export const GET = publicEndpoint(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  const kode = searchParams.get('kode') || ''

  if (!kode) {
    return error('BAD_REQUEST', 'Kode booking wajib diisi', 400)
  }

  const kunjungan = await db.kunjungan.findFirst({
    where: { kodeBooking: kode },
    include: {
      wbp: {
        select: {
          id: true,
          nama: true,
          nomorRegister: true,
          currentRoom: {
            select: { blockName: true, roomNumber: true },
          },
        },
      },
    },
  })

  if (!kunjungan) {
    return error('NOT_FOUND', 'Tiket kunjungan tidak ditemukan', 404)
  }

  return success({
    id: kunjungan.id,
    kodeBooking: kunjungan.kodeBooking,
    namaPemohon: kunjungan.namaPemohon,
    nikPemohon: kunjungan.nikPemohon,
    noHp: kunjungan.noHp,
    alamat: kunjungan.alamat,
    hubungan: kunjungan.hubungan,
    wbpId: kunjungan.wbpId,
    namaWbp: kunjungan.namaWbp,
    nomorRegisterWbp: kunjungan.nomorRegisterWbp,
    tanggal: kunjungan.tanggal,
    sesi: kunjungan.sesi,
    status: kunjungan.status,
    checkedInAt: kunjungan.checkedInAt,
    selesaiAt: kunjungan.selesaiAt,
    catatanPetugas: kunjungan.catatanPetugas,
    keperluan: kunjungan.keperluan,
    jenisIdentitas: kunjungan.jenisIdentitas,
    qrCodeUrl: qrImageUrl(kunjungan.kodeBooking),
    createdAt: kunjungan.createdAt,
    updatedAt: kunjungan.updatedAt,
    wbp: kunjungan.wbp,
  })
})