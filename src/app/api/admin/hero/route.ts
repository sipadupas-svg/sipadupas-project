import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_ADMIN_FULL } from '@/lib/security/permissions'
import { compressDataUrlImage } from '@/lib/image'
import { error } from '@/lib/api-response'

const HERO_CATEGORY = 'HERO'
const MAX_IMAGE_BYTES = 3 * 1024 * 1024 // 3MB

async function findHero() {
  return db.galeri.findFirst({
    where: { kategori: HERO_CATEGORY },
    orderBy: { createdAt: 'desc' },
  })
}

// GET /api/admin/hero — current hero image (auth required)
export const GET = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async () => {
    try {
      const hero = await findHero()
      return NextResponse.json({ success: true, message: 'OK', data: { heroImage: hero?.gambar ?? null } })
    } catch (err) {
      console.error('Admin hero GET error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil foto hero', 500)
    }
  },
)

// PUT /api/admin/hero — upload/replace hero image (SUPER_ADMIN only)
export const PUT = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async (request: NextRequest) => {
    try {
      const body = (await request.json()) as { gambar?: unknown }
      const raw = typeof body.gambar === 'string' ? body.gambar : ''

      if (!raw.startsWith('data:image/')) {
        return error('BAD_REQUEST', 'File harus berupa gambar (PNG/JPG/WebP)', 400)
      }

      // Kompres otomatis sebelum simpan: max 1920px, WebP q80.
      // Menjaga payload /api/public/site-settings tetap kecil.
      const gambar = await compressDataUrlImage(raw)

      // Guard final SETELAH kompresi
      if (gambar.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3)) {
        return error('BAD_REQUEST', 'Ukuran gambar maksimal 3MB', 400)
      }

      const existing = await findHero()
      if (existing) {
        await db.galeri.update({ where: { id: existing.id }, data: { gambar } })
      } else {
        await db.galeri.create({
          data: {
            judul: 'Foto Hero Beranda',
            deskripsi: 'Foto utama hero section halaman publik SIPADUPAS',
            gambar,
            kategori: HERO_CATEGORY,
          },
        })
      }

      return NextResponse.json({ success: true, message: 'Foto hero berhasil disimpan', data: { heroImage: gambar } })
    } catch (err) {
      console.error('Admin hero PUT error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal menyimpan foto hero', 500)
    }
  },
)
