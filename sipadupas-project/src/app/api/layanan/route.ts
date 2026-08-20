import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PUBLIKASI_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/layanan — Public: list active layanan informasi
export const GET = publicEndpoint(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const kategori = searchParams.get('kategori')

  try {
    const where: Record<string, unknown> = { status: 'Aktif' }
    if (kategori) where.kategori = kategori

    const layanan = await db.layananInformasi.findMany({
      where,
      orderBy: { nama: 'asc' },
    })

    return NextResponse.json({ data: layanan })
  } catch (err) {
    console.error('Layanan GET error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data layanan', 500)
  }
})

// POST /api/layanan — Create layanan (auth required)
export const POST = authenticatedEndpoint(
  [PERM_PUBLIKASI_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { slug, nama, kategori, deskripsi, dasarHukum, persyaratan, alur, estimasiWaktu, faq } = body

      if (!slug || !nama || !kategori) {
        return error('BAD_REQUEST', 'slug, nama, dan kategori wajib diisi', 400)
      }

      const layanan = await db.layananInformasi.create({
        data: {
          slug,
          nama,
          kategori,
          deskripsi: deskripsi || null,
          dasarHukum: dasarHukum || null,
          persyaratan: persyaratan || null,
          alur: alur || null,
          estimasiWaktu: estimasiWaktu || null,
          faq: faq || null,
          status: 'Aktif',
        },
      })

      return NextResponse.json({ data: layanan }, { status: 201 })
    } catch (err) {
      console.error('Layanan POST error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat layanan', 500)
    }
  },
)
