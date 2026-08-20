import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PEMBINAAN_READ, PERM_PEMBINAAN_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pembinaan — List all programs with peserta count (UF-15)
export const GET = authenticatedEndpoint(
  [PERM_PEMBINAAN_READ],
  async () => {
    try {
      const programs = await db.programPembinaan.findMany({
        include: {
          _count: {
            select: { peserta: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: programs })
    } catch (err) {
      console.error('[GET /api/pembinaan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data program pembinaan', 500)
    }
  },
)

// POST /api/pembinaan — Create program (UF-15)
export const POST = authenticatedEndpoint(
  [PERM_PEMBINAAN_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { nama, kategori, periode, pembina, jadwal } = body

      if (!nama || !kategori) {
        return error('BAD_REQUEST', 'nama dan kategori wajib diisi', 400)
      }

      const program = await db.programPembinaan.create({
        data: {
          nama,
          kategori,
          periode: periode || null,
          pembina: pembina || null,
          jadwal: jadwal || null,
        },
        include: {
          _count: {
            select: { peserta: true },
          },
        },
      })

      return NextResponse.json({ data: program }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pembinaan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat program pembinaan', 500)
    }
  },
)
