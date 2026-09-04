import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { compressDataUrlImage, LARGE_IMAGE_THRESHOLD_BYTES } from '@/lib/image'
import { error } from '@/lib/api-response'

// GET /api/public/site-settings — public site content settings (hero image, running text)
export const GET = publicEndpoint(async () => {
  try {
    const [hero, rt] = await Promise.all([
      db.galeri.findFirst({
        where: { kategori: 'HERO' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, gambar: true },
      }),
      db.galeri.findFirst({
        where: { kategori: 'RUNNING_TEXT' },
        orderBy: { createdAt: 'desc' },
        select: { judul: true, deskripsi: true },
      }),
    ])

    // Write-back compression: hero lama yang masih besar dikompres sekali
    // lalu disimpan ulang — request berikutnya langsung dapat versi kecil.
    let heroImage = hero?.gambar ?? null
    if (heroImage && hero && heroImage.length > LARGE_IMAGE_THRESHOLD_BYTES) {
      const compressed = await compressDataUrlImage(heroImage)
      if (compressed.length < heroImage.length) {
        heroImage = compressed
        await db.galeri
          .update({ where: { id: hero.id }, data: { gambar: compressed } })
          .catch(() => {})
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OK',
        data: {
          heroImage,
          runningText: rt?.judul ?? '',
          runningTextActive: rt ? rt.deskripsi !== 'nonaktif' && !!rt.judul : false,
        },
      },
      // Cache singkat di browser/CDN — konten admin berubah jarang
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } },
    )
  } catch (err) {
    console.error('Public site-settings GET error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil pengaturan situs', 500)
  }
})
