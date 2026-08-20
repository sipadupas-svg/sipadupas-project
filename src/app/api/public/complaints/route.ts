import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { pengaduanCreateBody } from '@/lib/security/input-schemas'
import { created } from '@/lib/api-response'
import type { PengaduanCreateBody } from '@/lib/security/input-schemas'

function generateTrackingCode(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let rand = ''
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `SPD-${yy}${mm}-${rand}`
}

// POST /api/public/complaints — Public complaint submission (no auth required)
export const POST = publicEndpoint(
  async (request: NextRequest, _auth, body: PengaduanCreateBody) => {
    const kodeTracking = generateTrackingCode()

    const pengaduan = await db.pengaduan.create({
      data: {
        kodeTracking,
        namaPelapor: body.nama,
        kontak: body.noHp || body.email || null,
        kategori: body.kategori,
        subjek: body.subjek,
        isi: body.isi,
        isAnonim: !body.nama,
        status: 'Baru',
      },
    })

    return created({
      tracking_code: pengaduan.kodeTracking,
      category: pengaduan.kategori,
      subject: pengaduan.subjek,
      status: pengaduan.status,
      is_anonymous: pengaduan.isAnonim,
      created_at: pengaduan.createdAt,
    }, 'Pengaduan berhasil dikirim')
  },
  { validateBody: pengaduanCreateBody },
)
