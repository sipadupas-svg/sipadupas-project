import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_ADMIN_FULL } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

const RT_CATEGORY = 'RUNNING_TEXT'
const MAX_LEN = 300

async function findRunningText() {
  return db.galeri.findFirst({
    where: { kategori: RT_CATEGORY },
    orderBy: { createdAt: 'desc' },
  })
}

// GET /api/admin/running-text — current running text config (auth required)
export const GET = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async () => {
    try {
      const rt = await findRunningText()
      return NextResponse.json({
        success: true,
        message: 'OK',
        data: { teks: rt?.judul ?? '', aktif: rt?.deskripsi !== 'nonaktif' },
      })
    } catch (err) {
      console.error('Admin running-text GET error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil pengaturan running text', 500)
    }
  },
)

// PUT /api/admin/running-text — save running text config (SUPER_ADMIN only)
export const PUT = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async (request: NextRequest) => {
    try {
      const body = (await request.json()) as { teks?: unknown; aktif?: unknown }
      const teks = typeof body.teks === 'string' ? body.teks.trim() : ''
      const aktif = Boolean(body.aktif)

      if (teks.length > MAX_LEN) {
        return error('BAD_REQUEST', `Teks maksimal ${MAX_LEN} karakter`, 400)
      }
      if (aktif && !teks) {
        return error('BAD_REQUEST', 'Teks tidak boleh kosong jika running text diaktifkan', 400)
      }

      const existing = await findRunningText()
      if (existing) {
        await db.galeri.update({
          where: { id: existing.id },
          data: { judul: teks, deskripsi: aktif ? 'aktif' : 'nonaktif' },
        })
      } else {
        await db.galeri.create({
          data: {
            judul: teks,
            deskripsi: aktif ? 'aktif' : 'nonaktif',
            kategori: RT_CATEGORY,
          },
        })
      }

      return NextResponse.json({ success: true, message: 'Running text berhasil disimpan', data: { teks, aktif } })
    } catch (err) {
      console.error('Admin running-text PUT error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal menyimpan running text', 500)
    }
  },
)
