import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { kunjunganCreateBody } from '@/lib/security/input-schemas'
import { qrImageUrl } from '@/lib/qr'
import { error, created } from '@/lib/api-response'
import type { KunjunganCreateBody } from '@/lib/security/input-schemas'

const SESI_MAP: Record<string, string> = {
  SESI_PAGI: 'Sesi Pagi',
  SESI_SIANG: 'Sesi Siang',
}

function generateBookingCode(): string {
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `BK-${rand}`
}

/** Create booking dengan retry otomatis jika kodeBooking bentrok (P2002). */
async function createBookingWithRetry(data: Prisma.KunjunganCreateInput, attempts = 3) {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await db.kunjungan.create({
        data: attempt === 0 ? data : { ...data, kodeBooking: generateBookingCode() },
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

// POST /api/public/visit-bookings — Public visit booking (no auth required)
// Pemohon tidak perlu memilih WBP dari daftar; cukup menuliskan nama WBP.
// Verifikasi data & pencocokan WBP dilakukan petugas pelayanan saat kunjungan (scan barcode).
export const POST = publicEndpoint<KunjunganCreateBody>(
  async (request: NextRequest, _auth, body) => {
    if (!body) {
      return error('BAD_REQUEST', 'Body request tidak boleh kosong', 400)
    }

    const kodeBooking = generateBookingCode()
    // Hormati sesi yang dipilih pemohon (sebelumnya selalu hardcode Sesi Pagi)
    const sesi = SESI_MAP[body.sesi ?? ''] || 'Sesi Pagi'

    const kunjungan = await createBookingWithRetry({
      kodeBooking,
      namaPemohon: body.namaPengunjung,
      nikPemohon: body.nik,
      noHp: body.noHp,
      hubungan: body.hubunganWbp,
      namaWbp: body.namaWbp.trim(),
      nomorRegisterWbp: body.nomorRegisterWbp ? body.nomorRegisterWbp.trim() : null,
      tanggal: body.tanggalKunjungan,
      sesi,
      keperluan: body.keperluan,
      catatanPetugas: body.catatan || null,
      status: 'Menunggu',
    })

    return created({
      booking_code: kunjungan.kodeBooking,
      visit_date: kunjungan.tanggal,
      session_time: kunjungan.sesi,
      visitor_name: kunjungan.namaPemohon,
      inmate_name: kunjungan.namaWbp,
      inmate_registration_number: kunjungan.nomorRegisterWbp,
      status: kunjungan.status,
      qr_code_url: qrImageUrl(kunjungan.kodeBooking),
      message:
        'Pendaftaran berhasil. Simpan Nomor Booking & barcode ini, tunjukkan kepada petugas pendaftaran saat datang untuk diverifikasi.',
    }, 'Pendaftaran kunjungan berhasil')
  },
  { validateBody: kunjunganCreateBody },
)