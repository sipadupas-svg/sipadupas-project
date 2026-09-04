import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { verifyAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

/**
 * GET /api/auth/pending
 *
 * List all users with accountStatus='PENDING' (and optionally REJECTED).
 * Restricted to SUPER_ADMIN or ADMIN_LAPAS.
 *
 * Query params:
 *   - status (optional) — 'PENDING' (default) | 'REJECTED' | 'ALL' | 'APPROVED'
 */
export async function GET(request: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────
    const auth = await verifyAuth(request)
    if (auth instanceof NextResponse) return auth

    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN_LAPAS') {
      return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki akses ke fitur ini', 403)
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = (searchParams.get('status') || 'PENDING').toUpperCase()

    const where: Prisma.UserWhereInput = {}
    if (statusFilter === 'ALL') {
      where.accountStatus = { in: ['PENDING', 'REJECTED'] }
    } else if (['PENDING', 'REJECTED', 'APPROVED'].includes(statusFilter)) {
      where.accountStatus = statusFilter
    } else {
      where.accountStatus = 'PENDING'
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        userRoles: { include: { role: true } },
        accountApprovedBy: { select: { id: true, nama: true, nip: true } },
      },
    })

    const data = users.map((u) => ({
      id: u.id,
      nip: u.nip,
      nama: u.nama,
      email: u.email,
      jabatan: u.jabatan,
      noHp: u.noHp,
      accountStatus: u.accountStatus,
      requestedRole: u.requestedRole,
      statusReason: u.statusReason,
      createdAt: u.createdAt,
      approvedAt: u.approvedAt,
      approvedBy: u.accountApprovedBy,
      roles: u.userRoles.map((ur) => ({
        code: ur.role.code,
        name: ur.role.name,
      })),
    }))

    return success({
      count: data.length,
      users: data,
    })
  } catch (err) {
    console.error('GET pending error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Terjadi kesalahan pada server', 500)
  }
}
