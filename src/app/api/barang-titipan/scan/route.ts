import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_BARANG_TITIPAN_READ } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/barang-titipan/scan?kode=... — Cari titipan by kodeTitipan (UF petugas)
// Dipakai petugas memindai barcode / mengetik Kode Titipan pengunjung saat
// datang mengantar barang, sebelum melakukan verifikasi item barang.
export const GET = authenticatedEndpoint(
  [PERM_BARANG_TITIPAN_READ],
  async (request: NextRequest) => {
    try {
      const kode = request.nextUrl.searchParams.get('kode')?.trim()

      if (!kode) {
        return error('BAD_REQUEST', 'Kode titipan wajib diisi', 400)
      }

      const record = await db.barangTitipan.findUnique({
        where: { kodeTitipan: kode },
        include: {
          wbp: {
            include: {
              currentRoom: {
                select: { blockName: true, roomNumber: true },
              },
            },
          },
          verifiedBy: {
            select: { id: true, nama: true, nip: true },
          },
          items: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!record) {
        return error('NOT_FOUND', `Titipan dengan kode ${kode} tidak ditemukan`, 404)
      }

      const data = {
        id: record.id,
        kode_titipan: record.kodeTitipan,
        nama_pengirim: record.namaPengirim,
        nik_pengirim: record.nikPengirim,
        no_hp: record.noHp,
        hubungan: record.hubungan,
        kategori: record.kategori,
        tanggal_penitipan: record.tanggalPenitipan,
        jam_penitipan: record.jamPenitipan,
        catatan_pengirim: record.catatanPengirim,
        status: record.status,
        catatan_petugas: record.catatanPetugas,
        alasan_penolakan: record.alasanPenolakan,
        verified_at: record.verifiedAt,
        delivered_at: record.deliveredAt,
        rejected_at: record.rejectedAt,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        nama_wbp: record.namaWbp || record.wbp?.nama || null,
        nomor_register_wbp: record.nomorRegisterWbp || record.wbp?.nomorRegister || null,
        wbp: record.wbp
          ? {
              id: record.wbp.id,
              nomor_register: record.wbp.nomorRegister,
              nama: record.wbp.nama,
              status: record.wbp.status,
              blok: record.wbp.currentRoom?.blockName || null,
              kamar: record.wbp.currentRoom?.roomNumber || null,
            }
          : null,
        verified_by: record.verifiedBy
          ? { id: record.verifiedBy.id, nama: record.verifiedBy.nama, nip: record.verifiedBy.nip }
          : null,
        items: record.items.map((item) => ({
          id: item.id,
          nama_barang: item.namaBarang,
          jumlah: item.jumlah,
          satuan: item.satuan,
          keterangan: item.keterangan,
          status: item.status,
          alasan_penolakan: item.alasanPenolakan,
          created_at: item.createdAt,
        })),
      }

      return NextResponse.json({ data })
    } catch (err) {
      console.error('[GET /api/barang-titipan/scan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal memindai kode titipan', 500)
    }
  },
)
