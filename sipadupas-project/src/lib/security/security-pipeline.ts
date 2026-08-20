import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, type AuthPayload } from '@/lib/auth'
import { error } from '@/lib/api-response'
import { checkRateLimit, extractIp, extractUserAgent, generalRateLimit, sensitiveRateLimit } from '@/lib/security/rate-limiter'
import { hasPermission, requirePermissions } from '@/lib/security/permissions'
import { logSecurityEvent, logRateLimited, logPermissionDenied } from '@/lib/security/security-events'
import { validateBody } from '@/lib/security/input-schemas'
import type { z } from 'zod'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SecureEndpointConfig {
  /** Whether authentication is required (default: true unless publicAccess is set) */
  requireAuth?: boolean
  /** Granular permissions required — user must have ALL listed */
  requiredPermissions?: string[]
  /** Role codes allowed — user must match at least one */
  requiredRoles?: string[]
  /** Custom rate limit config (overrides defaults) */
  rateLimit?: {
    limit: number
    windowMs: number
  }
  /** Zod schema to validate request body */
  validateBody?: z.ZodType<unknown>
  /** Skip authentication entirely (for truly public endpoints) */
  publicAccess?: boolean
}

type ApiHandler = (
  request: NextRequest,
  auth: AuthPayload,
) => Promise<NextResponse> | NextResponse

// ---------------------------------------------------------------------------
// secureEndpoint — Unified security middleware
// ---------------------------------------------------------------------------

/**
 * Wraps an API route handler with the full security pipeline.
 *
 * Pipeline order:
 *   1. Rate Limit
 *   2. Authenticate (unless publicAccess)
 *   3. Authorize (role + permission check)
 *   4. Validate Input (if validateBody schema provided)
 *   5. Execute Handler
 *
 * Never exposes stack traces — all errors return generic messages.
 */
export function secureEndpoint<T = unknown>(
  config: SecureEndpointConfig,
): (handler: (request: NextRequest, auth: AuthPayload, body: T) => Promise<NextResponse> | NextResponse) =>
  (request: NextRequest) => Promise<NextResponse> {

  return function (handler) {
    return async function securedHandler(request: NextRequest): Promise<NextResponse> {
      const ip = extractIp(request)
      const userAgent = extractUserAgent(request)
      const endpoint = request.nextUrl.pathname

      // -----------------------------------------------------------------------
      // 1. Rate Limit
      // -----------------------------------------------------------------------
      const rl = config.rateLimit
      if (rl) {
        const rlResult = checkRateLimit(ip, endpoint, rl.limit, rl.windowMs)
        if (!rlResult.allowed) {
          logRateLimited(ip, endpoint)
          return error('BAD_REQUEST', 'Terlalu banyak permintaan. Silakan coba lagi nanti.', 429)
        }
      } else if (config.publicAccess) {
        // Public endpoints get general rate limiting
        const blocked = generalRateLimit(request)
        if (blocked) return blocked
      } else {
        // Authenticated endpoints also get general rate limiting by default
        const blocked = generalRateLimit(request)
        if (blocked) return blocked
      }

      // -----------------------------------------------------------------------
      // 2. Authenticate
      // -----------------------------------------------------------------------
      const isPublic = config.publicAccess === true || config.requireAuth === false
      let auth: AuthPayload | null = null

      if (!isPublic) {
        const authResult = await verifyAuth(request)
        if (authResult instanceof NextResponse) {
          // Auth failed — log and return generic error
          logSecurityEvent({
            type: 'INVALID_TOKEN',
            severity: 'medium',
            ipAddress: ip,
            userAgent,
            detail: 'Autentikasi gagal',
          })
          return error('UNAUTHORIZED_ACCESS', 'Sesi tidak valid atau telah kadaluwarsa. Silakan login kembali.', 401)
        }
        auth = authResult
      }

      // -----------------------------------------------------------------------
      // 3. Authorize (role + permission)
      // -----------------------------------------------------------------------
      if (auth) {
        // Role check
        if (config.requiredRoles && config.requiredRoles.length > 0) {
          if (!config.requiredRoles.includes(auth.role)) {
            logPermissionDenied(auth.userId, auth.role, `roles:[${config.requiredRoles.join(',')}]`, ip)
            return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki akses untuk operasi ini.', 403)
          }
        }

        // Permission check
        if (config.requiredPermissions && config.requiredPermissions.length > 0) {
          const check = requirePermissions(config.requiredPermissions)
          if (!check(auth.role)) {
            logPermissionDenied(auth.userId, auth.role, config.requiredPermissions.join(', '), ip)
            return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki izin untuk operasi ini.', 403)
          }
        }
      }

      // -----------------------------------------------------------------------
      // 4. Validate Input
      // -----------------------------------------------------------------------
      let parsedBody: T | undefined
      if (config.validateBody && request.method !== 'GET' && request.method !== 'HEAD') {
        let rawBody: unknown
        try {
          rawBody = await request.json()
        } catch {
          return error('BAD_REQUEST', 'Body request harus berupa JSON yang valid.', 400)
        }

        const result = validateBody(config.validateBody, rawBody)
        if ('error' in result) {
          return result.error
        }
        parsedBody = result.data as T
      }

      // -----------------------------------------------------------------------
      // 5. Execute Handler
      // -----------------------------------------------------------------------
      try {
        // For public endpoints, provide a dummy auth payload
        const effectiveAuth = auth ?? {
          userId: 'public',
          nip: '',
          nama: 'Public User',
          role: 'PUBLIC_USER',
          roleLabel: 'Public User',
          roleId: '',
        }
        return await handler(request, effectiveAuth, parsedBody as T)
      } catch (err) {
        // Never expose stack traces
        console.error(`[Security Pipeline] Unhandled error on ${endpoint}:`, err)
        logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'high',
          ipAddress: ip,
          userAgent,
          userId: auth?.userId,
          detail: `Unhandled error pada endpoint: ${endpoint}`,
        })
        return error('INTERNAL_SERVER_ERROR', 'Terjadi kesalahan pada server. Silakan coba lagi nanti.', 500)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/**
 * Create a public endpoint handler with rate limiting.
 * No authentication required.
 *
 * Usage:
 *   export const POST = publicEndpoint(async (req, auth) => {
 *     const body = await req.json();
 *     return success(body);
 *   });
 */
export function publicEndpoint<T = unknown>(
  handler: (request: NextRequest, auth: AuthPayload, body?: T) => Promise<NextResponse> | NextResponse,
  config?: Omit<SecureEndpointConfig, 'publicAccess' | 'requireAuth'>,
) {
  return secureEndpoint<T>({
    publicAccess: true,
    ...config,
  })(handler)
}

/**
 * Create an authenticated endpoint handler with optional permission checks.
 *
 * Usage:
 *   export const GET = authenticatedEndpoint(
 *     [PERM_WBP_READ],
 *     async (req, auth) => {
 *       return success(data);
 *     },
 *   );
 */
export function authenticatedEndpoint<T = unknown>(
  permissionsOrHandler: string[] | ((request: NextRequest, auth: AuthPayload, body?: T) => Promise<NextResponse> | NextResponse),
  maybeHandler?: (request: NextRequest, auth: AuthPayload, body?: T) => Promise<NextResponse> | NextResponse,
  extraConfig?: Omit<SecureEndpointConfig, 'requireAuth' | 'publicAccess'>,
) {
  // Overloaded usage: authenticatedEndpoint(permissions, handler, config?) or authenticatedEndpoint(handler)
  let perms: string[] | undefined
  let handler: (request: NextRequest, auth: AuthPayload, body?: T) => Promise<NextResponse> | NextResponse
  let config: Omit<SecureEndpointConfig, 'requireAuth' | 'publicAccess'> = {}

  if (Array.isArray(permissionsOrHandler)) {
    perms = permissionsOrHandler
    handler = maybeHandler!
    config = extraConfig ?? {}
  } else {
    handler = permissionsOrHandler
  }

  return secureEndpoint<T>({
    requireAuth: true,
    requiredPermissions: perms,
    ...config,
  })(handler)
}

// ---------------------------------------------------------------------------
// requireAuth — For dynamic routes that receive { params } from Next.js
// ---------------------------------------------------------------------------

/**
 * Lightweight auth + permission guard for use inside dynamic route handlers.
 *
 * Call this at the top of any handler that receives `params` from Next.js:
 *
 * ```ts
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: Promise<{ id: string }> },
 * ) {
 *   const auth = await requireAuth(request, [PERM_WBP_READ])
 *   if (auth instanceof NextResponse) return auth
 *
 *   const { id } = await params  // safe to use params after auth check
 *   // ... business logic
 * }
 * ```
 *
 * Pipeline: Rate Limit → Authenticate → Authorize (permissions)
 * Returns `AuthPayload` on success, or a `NextResponse` error on failure.
 */
export async function requireAuth(
  request: NextRequest,
  permissions?: string[],
): Promise<AuthPayload | NextResponse> {
  const ip = extractIp(request)
  const userAgent = extractUserAgent(request)

  // 1. Rate limit
  const blocked = generalRateLimit(request)
  if (blocked) {
    logRateLimited(ip, request.nextUrl.pathname)
    return blocked
  }

  // 2. Authenticate
  const authResult = await verifyAuth(request)
  if (authResult instanceof NextResponse) {
    logSecurityEvent({
      type: 'INVALID_TOKEN',
      severity: 'medium',
      ipAddress: ip,
      userAgent,
      detail: 'Autentikasi gagal',
    })
    return authResult
  }

  // 3. Authorize (permissions)
  if (permissions && permissions.length > 0) {
    const check = requirePermissions(permissions)
    if (!check(authResult.role)) {
      logPermissionDenied(authResult.userId, authResult.role, permissions.join(', '), ip)
      return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki izin untuk operasi ini.', 403)
    }
  }

  return authResult
}
