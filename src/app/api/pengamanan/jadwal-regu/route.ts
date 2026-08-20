import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_REGU } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pengamanan/jadwal-regu — List jadwal with filters (UF-04)
export const GET = authenticatedEndpoint(
  [PERM_REGU],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const tanggal = searchParams.get('tanggal') || ''
      const reguId = searchParams.get('reguId') || ''

      const where: Record<string, unknown> = {}
      if (tanggal) where.tanggal = tanggal
      if (reguId) where.reguId = reguId

      const list = await db.jadwalRegu.findMany({
        where,
        include: {
          regu: true,
        },
        orderBy: [{ tanggal: 'desc' }, { shift: 'asc' }],
      })

      return NextResponse.json({ data: list })
    } catch (err) {
      console.error('[GET /api/pengamanan/jadwal-regu] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data jadwal regu', 500)
    }
  },
)

// POST /api/pengamanan/jadwal-regu — Create jadwal (UF-04)
export const POST = authenticatedEndpoint(
  [PERM_REGU],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { reguId, tanggal, shift, pos } = body

      if (!reguId || !tanggal || !shift) {
        return error('BAD_REQUEST', 'reguId, tanggal, dan shift wajib diisi', 400)
      }

      const jadwal = await db.jadwalRegu.create({
        data: {
          reguId,
          tanggal,
          shift,
          pos: pos || null,
        },
        include: {
          regu: true,
        },
      })

      return NextResponse.json({ data: jadwal }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pengamanan/jadwal-regu] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat jadwal regu', 500)
    }
  },
)
