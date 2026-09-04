import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { error } from './api-response'

// ──────────────────────────────────────────────
// PASSWORD HASHING (bcryptjs)
// ──────────────────────────────────────────────

const BCRYPT_ROUNDS = 10

/** Hash a plain-text password with bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

/** Returns true if the stored value looks like a bcrypt hash. */
export function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$/.test(stored)
}

/**
 * Verify a password against the stored value.
 * Supports legacy plain-text storage (demo data) and bcrypt hashes.
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored)
  }
  // Legacy plain-text comparison (pre-migration demo data)
  return stored === plain
}

// ──────────────────────────────────────────────
// SIGNED TOKEN (HMAC-SHA256) — format: base64url(payload).base64url(signature)
// ──────────────────────────────────────────────

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getTokenSecret(): string {
  return process.env.NEXTAUTH_SECRET || 'sipadupas-dev-secret-change-me'
}

interface TokenPayload {
  sub: string
  iat: number
  exp: number
}

/** Sign a new access token for the given user id (expires in 7 days). */
export function signToken(userId: string): string {
  const payload: TokenPayload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(body)
    .digest('base64url')
  return `${body}.${signature}`
}

/** Verify signature + expiry of a signed token. Returns the payload or null. */
export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, signature] = parts

  const expected = crypto
    .createHmac('sha256', getTokenSecret())
    .update(body)
    .digest('base64url')

  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload
    if (typeof payload.sub !== 'string' || !payload.sub) return null
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

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
 * Token format: base64url(payload).base64url(HMAC-SHA256 signature)
 * Validates signature + expiry, looks up user in DB, validates active status.
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

  // Verify HMAC signature + expiry, extract user id
  const payload = verifyToken(token)
  if (!payload) {
    return error('UNAUTHORIZED_ACCESS', 'Token tidak valid atau telah kadaluwarsa', 401)
  }

  const user = await db.user.findUnique({
    where: { id: payload.sub },
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