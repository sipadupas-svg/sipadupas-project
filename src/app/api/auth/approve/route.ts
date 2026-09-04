import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { verifyAuth } from '@/lib/auth'

/**
 * POST /api/auth/approve
 *
 * Approve or reject a pending user registration.
 * Restricted to SUPER_ADMIN or ADMIN_LAPAS.
 *
 * Body:
 *   - userId  (string, required)
 *   - action  ('APPROVE' | 'REJECT', required)
 *   - reason  (string, optional) — rejection reason (required when action='REJECT')
 *   - roleCode (string, optional) — override the role on approval
 *     (defaults to user's requestedRole)
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────
    const auth = await verifyAuth(request)
    if (auth instanceof NextResponse) return auth

    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN_LAPAS') {
      return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki akses ke fitur ini', 403)
    }

    const body = await request.json()
    const { userId, action, reason, roleCode } = body

    if (!userId || !action) {
      return error('VALIDATION_ERROR', 'userId dan action wajib diisi', 400)
    }
    if (action !== 'APPROVE' && action !== 'REJECT') {
      return error('VALIDATION_ERROR', 'action harus APPROVE atau REJECT', 400)
    }
    if (action === 'REJECT' && !reason) {
      return error('VALIDATION_ERROR', 'Alasan penolakan wajib diisi', 400)
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    })
    if (!user) {
      return error('NOT_FOUND', 'User tidak ditemukan', 404)
    }
    if (user.accountStatus !== 'PENDING' && action === 'APPROVE') {
      return error('CONFLICT', `User berstatus ${user.accountStatus}, tidak dapat disetujui`, 409)
    }

    if (action === 'APPROVE') {
      // Determine role to assign
      const finalRoleCode = roleCode || user.requestedRole
      if (!finalRoleCode) {
        return error('VALIDATION_ERROR', 'Role belum ditentukan', 400)
      }
      const role = await db.role.findUnique({ where: { code: finalRoleCode } })
      if (!role) {
        return error('NOT_FOUND', `Role ${finalRoleCode} tidak ditemukan`, 404)
      }

      // Replace the user's roles with the approved one (clean slate)
      await db.userRole.deleteMany({ where: { userId: user.id } })
      await db.userRole.create({
        data: { userId: user.id, roleId: role.id },
      })

      await db.user.update({
        where: { id: user.id },
        data: {
          isActive: true,
          accountStatus: 'APPROVED',
          requestedRole: null,
          statusReason: 'Akun aktif',
          approvedById: auth.userId,
          approvedAt: new Date(),
        },
      })

      await db.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'APPROVE',
          entityName: 'user',
          entityId: user.id,
          detail: `Menyetujui akun ${user.nama} (${user.nip}) dengan role ${finalRoleCode}`,
          ipAddress: request.headers.get('x-forwarded-for') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      })

      return success({
        userId: user.id,
        nama: user.nama,
        nip: user.nip,
        accountStatus: 'APPROVED',
        role: finalRoleCode,
        message: `Akun ${user.nama} berhasil disetujui`,
      })
    } else {
      // REJECT
      await db.user.update({
        where: { id: user.id },
        data: {
          isActive: false,
          accountStatus: 'REJECTED',
          statusReason: reason,
          approvedById: auth.userId,
          approvedAt: new Date(),
        },
      })

      await db.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'REJECT',
          entityName: 'user',
          entityId: user.id,
          detail: `Menolak akun ${user.nama} (${user.nip}). Alasan: ${reason}`,
          ipAddress: request.headers.get('x-forwarded-for') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      })

      return success({
        userId: user.id,
        nama: user.nama,
        nip: user.nip,
        accountStatus: 'REJECTED',
        reason,
        message: `Akun ${user.nama} telah ditolak`,
      })
    }
  } catch (err) {
    console.error('Approve error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Terjadi kesalahan pada server', 500)
  }
}
