import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_NOTIFIKASI } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

export const GET = authenticatedEndpoint(
  [PERM_NOTIFIKASI],
  async (request: NextRequest, auth) => {
    const isRead = request.nextUrl.searchParams.get('isRead')

    try {
      // Anti-IDOR: notifikasi SELALU milik user yang sedang login.
      // (Sebelumnya userId bebas diisi via query param.)
      const where: Record<string, unknown> = { userId: auth.userId }
      if (isRead !== null && isRead !== undefined && isRead !== '') {
        where.isRead = isRead === 'true'
      }

      const notifikasi = await db.notifikasi.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      const unreadCount = await db.notifikasi.count({
        where: { ...where, isRead: false },
      })

      return NextResponse.json({ data: notifikasi, unreadCount })
    } catch (err) {
      console.error('Notifikasi GET error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil notifikasi', 500)
    }
  },
)

export const POST = authenticatedEndpoint(
  [PERM_NOTIFIKASI],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { userId, judul, isi, jenis } = body

      if (!judul) {
        return error('BAD_REQUEST', 'Judul wajib diisi', 400)
      }

      const notifikasi = await db.notifikasi.create({
        data: {
          userId: userId || null,
          judul,
          isi: isi || null,
          jenis: jenis || 'info',
        },
      })

      return NextResponse.json({ data: notifikasi }, { status: 201 })
    } catch (err) {
      console.error('Notifikasi POST error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat notifikasi', 500)
    }
  },
)

export const PUT = authenticatedEndpoint(
  [PERM_NOTIFIKASI],
  async (request: NextRequest, auth) => {
    try {
      const body = await request.json()
      const { ids } = body as { ids: string[] }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return error('BAD_REQUEST', 'ids array wajib dikirim', 400)
      }

      // Anti-IDOR: hanya notifikasi milik user login yang boleh ditandai dibaca
      const result = await db.notifikasi.updateMany({
        where: { id: { in: ids }, userId: auth.userId },
        data: { isRead: true },
      })

      return NextResponse.json({ updated: result.count })
    } catch (err) {
      console.error('Notifikasi PUT error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal memperbarui notifikasi', 500)
    }
  },
)
