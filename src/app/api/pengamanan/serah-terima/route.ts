import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_SERAH_TERIMA } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pengamanan/serah-terima — List serah terima with filters (UF-05)
export const GET = authenticatedEndpoint(
  [PERM_SERAH_TERIMA],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || ''

      const where: Record<string, unknown> = {}
      if (status) where.status = status

      const list = await db.serahTerima.findMany({
        where,
        include: {
          regu: true,
          reguDari: { select: { id: true, nama: true, nip: true } },
          reguKe: { select: { id: true, nama: true, nip: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: list })
    } catch (err) {
      console.error('[GET /api/pengamanan/serah-terima] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data serah terima', 500)
    }
  },
)

// POST /api/pengamanan/serah-terima — Create serah terima (UF-05)
export const POST = authenticatedEndpoint(
  [PERM_SERAH_TERIMA],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const {
        reguId,
        reguDariId,
        reguKeId,
        totalWBP,
        wbpRawatInap,
        wbpKerjaLuar,
        catatanKeamanan,
        catatanInventaris,
        catatanKejadian,
      } = body

      if (!reguId || !reguDariId || !reguKeId) {
        return error('BAD_REQUEST', 'reguId, reguDariId, dan reguKeId wajib diisi', 400)
      }

      const serahTerima = await db.serahTerima.create({
        data: {
          reguId,
          reguDariId,
          reguKeId,
          totalWBP: totalWBP || 0,
          wbpRawatInap: wbpRawatInap || 0,
          wbpKerjaLuar: wbpKerjaLuar || 0,
          catatanKeamanan: catatanKeamanan || null,
          catatanInventaris: catatanInventaris || null,
          catatanKejadian: catatanKejadian || null,
          status: 'DRAFT',
        },
        include: {
          regu: true,
          reguDari: { select: { id: true, nama: true, nip: true } },
          reguKe: { select: { id: true, nama: true, nip: true } },
        },
      })

      return NextResponse.json({ data: serahTerima }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pengamanan/serah-terima] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat data serah terima', 500)
    }
  },
)
