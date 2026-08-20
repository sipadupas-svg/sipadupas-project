import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { kunjunganCreateBody } from '@/lib/security/input-schemas'
import { error, created } from '@/lib/api-response'
import type { KunjunganCreateBody } from '@/lib/security/input-schemas'

const SESI_MAP: Record<string, string> = {
  SESI_PAGI: 'Sesi 1 Pagi',
  SESI_SIANG: 'Sesi 2 Siang',
}

function generateBookingCode(): string {
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `BK-${rand}`
}

// POST /api/public/visit-bookings — Public visit booking (no auth required)
export const POST = publicEndpoint(
  async (request: NextRequest, _auth, body: KunjunganCreateBody) => {
    // Find WBP by ID
    const wbp = await db.wBP.findUnique({
      where: { id: body.wbpId },
      select: { id: true, nama: true, status: true },
    })

    if (!wbp) {
      return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
    }

    if (wbp.status !== 'Aktif') {
      return error('BAD_REQUEST', 'WBP tidak dalam status aktif untuk dikunjungi', 400)
    }

    const kodeBooking = generateBookingCode()
    const sesi = SESI_MAP['SESI_PAGI'] || 'Sesi 1 Pagi'

    const kunjungan = await db.kunjungan.create({
      data: {
        kodeBooking,
        namaPemohon: body.namaPengunjung,
        nikPemohon: body.nik,
        noHp: body.noHp,
        hubungan: body.hubunganWbp,
        wbpId: body.wbpId,
        tanggal: body.tanggalKunjungan,
        sesi,
        keperluan: body.keperluan,
        jumlahPengunjung: body.jumlahPengunjung,
        catatan: body.catatan || null,
        status: 'Menunggu',
      },
      include: {
        wbp: {
          select: {
            id: true,
            nama: true,
            nomorRegister: true,
          },
        },
      },
    })

    return created({
      booking_code: kunjungan.kodeBooking,
      visit_date: kunjungan.tanggal,
      session_time: kunjungan.sesi,
      visitor_name: kunjungan.namaPemohon,
      inmate_name: kunjungan.wbp.nama,
      inmate_registration_number: kunjungan.wbp.nomorRegister,
      status: kunjungan.status,
      qr_code_url: `https://api.sipadupas-lapasbontang.go.id/qr/${kunjungan.kodeBooking}.png`,
    }, 'Pendaftaran kunjungan berhasil')
  },
  { validateBody: kunjunganCreateBody },
)
