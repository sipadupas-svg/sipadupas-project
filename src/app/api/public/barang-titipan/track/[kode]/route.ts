import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { success, error } from '@/lib/api-response'

// GET /api/public/barang-titipan/track/[kode] — Track barang titipan by kode (public)
export const GET = publicEndpoint(async (request: NextRequest) => {
  const kode = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

  const record = await db.barangTitipan.findUnique({
    where: { kodeTitipan: kode },
    include: {
      wbp: {
        select: {
          nomorRegister: true,
          nama: true,
        },
      },
      items: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!record) {
    return error('NOT_FOUND', 'Data barang titipan tidak ditemukan', 404)
  }

  const data = {
    kode_titipan: record.kodeTitipan,
    nama_pengirim: record.namaPengirim,
    hubungan: record.hubungan,
    nama_wbp: record.namaWbp || record.wbp?.nama || null,
    nomor_register_wbp: record.nomorRegisterWbp || record.wbp?.nomorRegister || null,
    kategori: record.kategori,
    tanggal_penitipan: record.tanggalPenitipan,
    status: record.status,
    items: record.items.map((item) => ({
      id: item.id,
      nama_barang: item.namaBarang,
      jumlah: item.jumlah,
      satuan: item.satuan,
      keterangan: item.keterangan,
      status: item.status,
      alasan_penolakan: item.alasanPenolakan,
    })),
    catatan_petugas: record.catatanPetugas,
    alasan_penolakan: record.alasanPenolakan,
    verified_at: record.verifiedAt,
    delivered_at: record.deliveredAt,
  }

  return success(data, 'Data tracking barang titipan berhasil diambil')
})
