import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PUBLIKASI_READ, PERM_PUBLIKASI_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/publikasi — Public: list berita (published only for public, all for auth)
export const GET = publicEndpoint(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const kategori = searchParams.get('kategori')

  try {
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (kategori) where.kategori = kategori

    const berita = await db.berita.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: berita })
  } catch (err) {
    console.error('Publikasi GET error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data publikasi', 500)
  }
})

// POST /api/publikasi — Create berita (auth required)
export const POST = authenticatedEndpoint(
  [PERM_PUBLIKASI_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { judul, ringkasan, isi, gambar, kategori, penulis, status } = body

      if (!judul) {
        return error('BAD_REQUEST', 'Judul wajib diisi', 400)
      }

      const slug = judul
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      const uniqueSlug = `${slug}-${Date.now()}`

      const berita = await db.berita.create({
        data: {
          slug: uniqueSlug,
          judul,
          ringkasan: ringkasan || null,
          isi: isi || null,
          gambar: gambar || null,
          kategori: kategori || null,
          penulis: penulis || null,
          status: status || 'Draft',
          publishedAt: status === 'Terbit' ? new Date() : null,
        },
      })

      return NextResponse.json({ data: berita }, { status: 201 })
    } catch (err) {
      console.error('Publikasi POST error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat publikasi', 500)
    }
  },
)
