import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import { error } from './api-response'

// ──────────────────────────────────────────────
// ACCOUNT LOCKOUT CONSTANTS
// ──────────────────────────────────────────────

export const LOCKOUT_DURATION_MS = 20 * 60 * 1000 // 20 minutes
export const MAX_LOGIN_ATTEMPTS = 5

// ──────────────────────────────────────────────
// ACCOUNT LOCKOUT TYPES
// ──────────────────────────────────────────────

export interface LockoutStatus {
  locked: boolean
  remainingMs: number
  failCount: number
}

// ──────────────────────────────────────────────
// ACCOUNT LOCKOUT FUNCTIONS
// ──────────────────────────────────────────────

/**
 * Check if an account (by NIP) is currently locked out due to too many failed login attempts.
 */
export async function checkAccountLockout(nip: string): Promise<LockoutStatus> {
  const now = new Date()

  const attempt = await db.loginAttempt.findFirst({
    where: {
      nip,
      lockedUntil: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (attempt && attempt.lockedUntil) {
    const remainingMs = attempt.lockedUntil.getTime() - now.getTime()
    return { locked: true, remainingMs, failCount: attempt.failCount }
  }

  return { locked: false, remainingMs: 0, failCount: 0 }
}

/**
 * Record a login attempt. On success, resets the failure counter.
 * On failure, increments the counter and locks the account if >= MAX_LOGIN_ATTEMPTS.
 * Returns the updated LoginAttempt record.
 */
export async function recordLoginAttempt(
  nip: string,
  success: boolean,
  ip: string,
  ua: string,
): Promise<{ locked: boolean; failCount: number }> {
  if (success) {
    // Reset on successful login
    await db.loginAttempt.create({
      data: {
        nip,
        ipAddress: ip,
        userAgent: ua,
        success: true,
        failCount: 0,
      },
    })
    return { locked: false, failCount: 0 }
  }

  // Get the most recent attempt for this NIP to determine current fail count
  const lastAttempt = await db.loginAttempt.findFirst({
    where: { nip },
    orderBy: { createdAt: 'desc' },
  })

  const currentFailCount = lastAttempt && !lastAttempt.success ? lastAttempt.failCount + 1 : 1
  const shouldLock = currentFailCount >= MAX_LOGIN_ATTEMPTS

  await db.loginAttempt.create({
    data: {
      nip,
      ipAddress: ip,
      userAgent: ua,
      success: false,
      failCount: currentFailCount,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
    },
  })

  return { locked: shouldLock, failCount: currentFailCount }
}

// ──────────────────────────────────────────────
// AUTH TYPES & VERIFICATION
// ──────────────────────────────────────────────

export interface AuthPayload {
  userId: string
  nip: string
  nama: string
  role: string
  roleLabel: string
  roleId: string
}

/**
 * Verify Bearer token from Authorization header.
 * Token format: {userId}-{timestamp}
 * Looks up user in DB, validates active status, returns AuthPayload.
 */
export async function verifyAuth(request: NextRequest): Promise<AuthPayload | NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return error('UNAUTHORIZED_ACCESS', 'Token tidak valid atau telah kadaluwarsa', 401)
  }

  const token = authHeader.slice(7)
  if (!token) {
    return error('UNAUTHORIZED_ACCESS', 'Token tidak valid atau telah kadaluwarsa', 401)
  }

  // Token format: {userId}-{timestamp}
  const userId = token.split('-')[0]
  if (!userId) {
    return error('UNAUTHORIZED_ACCESS', 'Token tidak valid atau telah kadaluwarsa', 401)
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } },
  })

  if (!user || !user.isActive) {
    return error('UNAUTHORIZED_ACCESS', 'Token tidak valid atau telah kadaluwarsa', 401)
  }

  const primaryRole = user.userRoles[0]?.role
  if (!primaryRole) {
    return error('FORBIDDEN_ACCESS', 'Pengguna tidak memiliki role', 403)
  }

  return {
    userId: user.id,
    nip: user.nip,
    nama: user.nama,
    role: primaryRole.code,
    roleLabel: primaryRole.name,
    roleId: primaryRole.id,
  }
}

/**
 * Check if authenticated user has one of the allowed roles.
 */
export function hasRole(auth: AuthPayload, roles: string[]): boolean {
  return roles.includes(auth.role)
}
