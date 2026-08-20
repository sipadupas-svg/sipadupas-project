import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error } from '@/lib/api-response'
import { sensitiveRateLimit, extractIp, extractUserAgent } from '@/lib/security/rate-limiter'
import { loginBody, validateBody } from '@/lib/security/input-schemas'
import { checkAccountLockout, recordLoginAttempt, LOCKOUT_DURATION_MS } from '@/lib/auth'
import {
  logLoginFailed,
  logLoginSuccess,
  logAccountLocked,
  logBruteForceDetected,
  logRateLimited,
} from '@/lib/security/security-events'

export async function POST(request: NextRequest) {
  try {
    const ip = extractIp(request)
    const ua = extractUserAgent(request)

    // ── Step 1: Rate limit check ──────────────────────────────
    const rateLimited = sensitiveRateLimit(request)
    if (rateLimited) {
      logRateLimited(ip, '/api/auth/login')
      return rateLimited
    }

    // ── Step 2: Validate body with Zod schema ─────────────────
    const body = await request.json()
    const parsed = validateBody(loginBody, body)
    if ('error' in parsed) {
      logLoginFailed(ip, ua, 'Validasi gagal: format data tidak valid', { nip: body?.nip })
      return parsed.error
    }
    const { nip, password } = parsed.data

    // ── Step 3: Check account lockout ─────────────────────────
    const lockoutStatus = await checkAccountLockout(nip)
    if (lockoutStatus.locked) {
      const remainingMin = Math.ceil(lockoutStatus.remainingMs / 60000)
      logLoginFailed(ip, ua, `Akun terkunci, percobaan: ${lockoutStatus.failCount}`, { nip })
      return error(
        'ACCOUNT_LOCKED',
        `Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingMin} menit.`,
        423,
      )
    }

    // ── Step 4: Verify credentials ────────────────────────────
    const user = await db.user.findUnique({
      where: { nip },
      include: { userRoles: { include: { role: true } } },
    })

    if (!user) {
      const result = await recordLoginAttempt(nip, false, ip, ua)
      logLoginFailed(ip, ua, `Login gagal: NIP ${nip} tidak ditemukan`)
      if (result.locked) {
        logAccountLocked(nip, ip, `BRUTE_FORCE_DETECTED: Akun terkunci setelah ${result.failCount} percobaan gagal`)
        logBruteForceDetected(ip, ua, result.failCount)
        return error(
          'ACCOUNT_LOCKED',
          `Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi dalam ${LOCKOUT_DURATION_MS / 60000} menit.`,
          423,
        )
      }
      return error('UNAUTHORIZED_ACCESS', 'NIP atau Password salah', 401)
    }

    if (!user.isActive) {
      logLoginFailed(ip, ua, `Login gagal: akun ${user.nip} dinonaktifkan`, { userId: user.id })
      return error('FORBIDDEN_ACCESS', 'Akun Anda dinonaktifkan. Hubungi administrator.', 403)
    }

    // Plain text comparison for demo
    if (user.password !== password) {
      const result = await recordLoginAttempt(nip, false, ip, ua)
      logLoginFailed(ip, ua, `Login gagal: password salah untuk NIP ${nip}`, { userId: user.id })
      if (result.locked) {
        logAccountLocked(user.id, ip, `BRUTE_FORCE_DETECTED: Akun terkunci setelah ${result.failCount} percobaan gagal`)
        logBruteForceDetected(ip, ua, result.failCount)
        return error(
          'ACCOUNT_LOCKED',
          `Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi dalam ${LOCKOUT_DURATION_MS / 60000} menit.`,
          423,
        )
      }
      return error('UNAUTHORIZED_ACCESS', 'NIP atau Password salah', 401)
    }

    // ── Step 5: Login success ─────────────────────────────────
    await recordLoginAttempt(nip, true, ip, ua)
    logLoginSuccess(user.id, ip, ua)

    // Generate demo token (userId-timestamp)
    const token = `${user.id}-${Date.now()}`

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log to AuditLog
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityName: 'user',
        entityId: user.id,
        detail: `Login berhasil: ${user.nama} (${user.nip})`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    // Derive role from first userRole
    const primaryRole = user.userRoles[0]?.role

    return success(
      {
        access_token: token,
        refresh_token: token, // same token for demo
        user: {
          id: user.id,
          nip: user.nip,
          name: user.nama,
          role: primaryRole?.code || 'STAFF',
        },
      },
      'Login berhasil',
    )
  } catch (err) {
    console.error('Login error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Terjadi kesalahan pada server', 500)
  }
}
