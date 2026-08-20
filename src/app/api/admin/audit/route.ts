import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_AUDIT_READ } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/admin/audit — List audit logs with pagination and optional entityName filter
export const GET = authenticatedEndpoint(
  [PERM_AUDIT_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
      const entityNameFilter = searchParams.get('entityName') || undefined

      const where = entityNameFilter ? { entityName: entityNameFilter } : {}

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          include: {
            user: {
              select: { nama: true, nip: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.auditLog.count({ where }),
      ])

      const formattedLogs = logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.nama || null,
        userNip: log.user?.nip || null,
        action: log.action,
        entityName: log.entityName,
        entityId: log.entityId,
        oldValues: log.oldValues,
        newValues: log.newValues,
        detail: log.detail,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      }))

      return NextResponse.json({
        success: true,
        data: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data audit log', 500)
    }
  },
)
