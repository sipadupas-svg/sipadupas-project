import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_KUNJUNGAN_READ, PERM_KUNJUNGAN_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

function generateKodeBooking(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `SJY-${yy}${mm}${dd}-${rand}`
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

      const kunjunganList = await db.kunjungan.findMany({
        where,
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
export const POST = authenticatedEndpoint(
  [PERM_KUNJUNGAN_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const {
        namaPemohon,
        nikPemohon,
        noHp,
        alamat,
        hubungan,
        wbpId,
        tanggal,
        sesi,
      } = body

      const wbp = await db.wBP.findUnique({
        where: { id: wbpId },
        select: { id: true },
      })

      if (!wbp) {
        return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
      }

      const kodeBooking = generateKodeBooking()

      const kunjungan = await db.kunjungan.create({
        data: {
          kodeBooking,
          namaPemohon,
          nikPemohon: nikPemohon || null,
          noHp: noHp || null,
          alamat: alamat || null,
          hubungan,
          wbpId,
          tanggal,
          sesi,
          status: 'Menunggu',
        },
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

      return NextResponse.json({ data: kunjungan }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/kunjungan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat booking kunjungan', 500)
    }
  },
)
