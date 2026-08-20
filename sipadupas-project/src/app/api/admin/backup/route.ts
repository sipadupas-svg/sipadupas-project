import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_BACKUP } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/admin/backup — List all backups ordered by createdAt desc
export const GET = authenticatedEndpoint(
  [PERM_BACKUP],
  async () => {
    try {
      const backups = await db.backup.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ success: true, data: backups })
    } catch (err) {
      console.error('Error fetching backups:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data backup', 500)
    }
  },
)

// POST /api/admin/backup — Create a backup record (metadata only for demo)
export const POST = authenticatedEndpoint(
  [PERM_BACKUP],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { fileName, fileSize } = body || {}

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFileName = fileName || `sipadupas-backup-${timestamp}.db`
      const backupFileSize = fileSize || 0

      const backup = await db.backup.create({
        data: {
          fileName: backupFileName,
          fileSize: backupFileSize,
          status: 'SUCCESS',
        },
      })

      return NextResponse.json({ success: true, data: backup }, { status: 201 })
    } catch (err) {
      console.error('Error creating backup:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat backup', 500)
    }
  },
)
