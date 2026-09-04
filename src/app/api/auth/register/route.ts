import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { created, error } from '@/lib/api-response'
import { hashPassword } from '@/lib/auth'
import { sensitiveRateLimit } from '@/lib/security/rate-limiter'

/**
 * POST /api/auth/register
 *
 * Self-registration endpoint for Petugas Lapas.
 * Creates a new User with accountStatus='PENDING' and the requested role.
 * The account must be approved by a SUPER_ADMIN or ADMIN_LAPAS before the
 * user can log in.
 *
 * Body:
 *   - nip       (string, required, unique)
 *   - nama      (string, required)
 *   - email     (string, required, unique)
 *   - password  (string, required, min 6)
 *   - jabatan   (string, optional)
 *   - noHp      (string, optional)
 *   - requestedRole (string, required) — one of:
 *       SECURITY_OFFICER, COACHING_OFFICER, ADMIN_LAPAS
 *     (SUPER_ADMIN and MANAGEMENT cannot be self-registered.)
 */
export async function POST(request: NextRequest) {
  try {
    // ── Rate limit: mencegah spam pendaftaran akun (5 req/menit per IP) ──
    const rateLimited = sensitiveRateLimit(request)
    if (rateLimited) {
      return rateLimited
    }

    const body = await request.json()
    const { nip, nama, email, password, jabatan, noHp, requestedRole } = body

    // ── Validation ──────────────────────────────────────────
    if (!nip || !nama || !email || !password || !requestedRole) {
      return error('VALIDATION_ERROR', 'NIP, Nama, Email, Password, dan Role wajib diisi', 400)
    }
    if (typeof password !== 'string' || password.length < 6) {
      return error('VALIDATION_ERROR', 'Password minimal 6 karakter', 400)
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(nip)) {
      return error('VALIDATION_ERROR', 'Format NIP tidak valid', 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error('VALIDATION_ERROR', 'Format email tidak valid', 400)
    }

    // Only allow self-registration for these roles
    const allowedRoles = ['SECURITY_OFFICER', 'COACHING_OFFICER', 'ADMIN_LAPAS']
    if (!allowedRoles.includes(requestedRole)) {
      return error(
        'VALIDATION_ERROR',
        'Role yang dipilih tidak valid untuk pendaftaran mandiri',
        400,
      )
    }

    // ── Uniqueness checks ───────────────────────────────────
    const existingNip = await db.user.findUnique({ where: { nip } })
    if (existingNip) {
      return error('CONFLICT', 'NIP sudah terdaftar dalam sistem', 409)
    }
    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) {
      return error('CONFLICT', 'Email sudah terdaftar dalam sistem', 409)
    }

    // ── Resolve role ────────────────────────────────────────
    const role = await db.role.findUnique({ where: { code: requestedRole } })
    if (!role) {
      return error('NOT_FOUND', 'Role tidak ditemukan', 404)
    }

    // ── Create user as PENDING ──────────────────────────────
    const user = await db.user.create({
      data: {
        nip,
        nama,
        email,
        password: await hashPassword(password),
        jabatan: jabatan || null,
        noHp: noHp || null,
        isActive: false,        // disabled until approved
        accountStatus: 'PENDING',
        requestedRole,
        statusReason: 'Menunggu persetujuan administrator',
      },
    })

    // Attach the requested role (so the user has the role when approved)
    await db.userRole.create({
      data: { userId: user.id, roleId: role.id },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entityName: 'user',
        entityId: user.id,
        detail: `Pendaftaran akun baru (PENDING) untuk ${nama} (${nip}) — role: ${requestedRole}`,
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    return created({
      userId: user.id,
      nip: user.nip,
      nama: user.nama,
      accountStatus: user.accountStatus,
      requestedRole,
      message:
        'Pendaftaran berhasil. Akun Anda akan diaktifkan setelah disetujui oleh administrator.',
    })
  } catch (err) {
    console.error('Register error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Terjadi kesalahan pada server', 500)
  }
}
