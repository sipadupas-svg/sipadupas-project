import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PENGADUAN_READ, PERM_PENGADUAN_CREATE } from '@/lib/security/permissions'
import { error, parsePagination, buildMeta } from '@/lib/api-response'

function generateKodeTracking(): string {
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

// GET /api/pengaduan — List all pengaduan with optional filters (UF-13)
export const GET = authenticatedEndpoint(
  [PERM_PENGADUAN_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || ''
      const kategori = searchParams.get('kategori') || ''

      const where: Record<string, unknown> = {}
      if (status) {
        where.status = status
      }
      if (kategori) {
        where.kategori = kategori
      }

      // Pagination opsional: ?page=&limit= → meta disertakan.
      const wantsPagination = searchParams.get('page') || searchParams.get('limit')

      if (wantsPagination) {
        const { page, limit, skip } = parsePagination(searchParams)
        const [total, pengaduanPage] = await Promise.all([
          db.pengaduan.count({ where }),
          db.pengaduan.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
        ])
        return NextResponse.json({ data: pengaduanPage, meta: buildMeta(total, page, limit) })
      }

      const pengaduanList = await db.pengaduan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: pengaduanList })
    } catch (err) {
      console.error('[GET /api/pengaduan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data pengaduan', 500)
    }
  },
)

// POST /api/pengaduan — Create pengaduan (UF-13)
export const POST = authenticatedEndpoint(
  [PERM_PENGADUAN_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { namaPelapor, kontak, kategori, subjek, isi, isAnonim } = body

      const kodeTracking = generateKodeTracking()

      const pengaduan = await db.pengaduan.create({
        data: {
          kodeTracking,
          namaPelapor: isAnonim ? null : namaPelapor || null,
          kontak: isAnonim ? null : kontak || null,
          kategori,
          subjek,
          isi,
          isAnonim: isAnonim || false,
          status: 'Baru',
        },
      })

      return NextResponse.json({ data: pengaduan }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pengaduan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat pengaduan', 500)
    }
  },
)
