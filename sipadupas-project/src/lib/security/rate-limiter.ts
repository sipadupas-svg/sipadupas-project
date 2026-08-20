import { NextRequest, NextResponse } from 'next/server'
import { error } from '@/lib/api-response'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  timestamps: number[]
}

interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
}

interface RateLimitConfig {
  limit: number
  windowMs: number
}

// ---------------------------------------------------------------------------
// In-memory store — maps "ip:endpoint" → { timestamps: number[] }
// ---------------------------------------------------------------------------

const store = new Map<string, RateLimitEntry>()

// ---------------------------------------------------------------------------
// Auto-cleanup: prune entries older than 10 minutes every 5 minutes
// ---------------------------------------------------------------------------

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 min
const ENTRY_TTL_MS = 10 * 60 * 1000 // 10 min

let cleanupTimer: ReturnType<typeof setInterval> | null = null

function scheduleCleanup(): void {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      // Remove timestamps older than ENTRY_TTL_MS
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < ENTRY_TTL_MS)
      // Remove empty entries
      if (entry.timestamps.length === 0) {
        store.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)

  // Don't prevent the process from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref()
  }
}

// Start cleanup on first import
scheduleCleanup()

// ---------------------------------------------------------------------------
// Core rate limit check
// ---------------------------------------------------------------------------

/**
 * Check whether a request from the given IP to the given endpoint
 * should be allowed based on a sliding window counter.
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const windowStart = now - windowMs

  let entry = store.get(key)

  if (!entry) {
    entry = { timestamps: [now] }
    store.set(key, entry)
    return { allowed: true, retryAfterMs: 0 }
  }

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)

  if (entry.timestamps.length >= limit) {
    // Find the oldest timestamp in the window to calculate retryAfter
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = oldestInWindow + windowMs - now
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) }
  }

  entry.timestamps.push(now)
  return { allowed: true, retryAfterMs: 0 }
}

// ---------------------------------------------------------------------------
// Default configurations
// ---------------------------------------------------------------------------

const DEFAULT_GENERAL_LIMIT = 60
const DEFAULT_GENERAL_WINDOW_MS = 60 * 1000 // 1 minute

const DEFAULT_SENSITIVE_LIMIT = 5
const DEFAULT_SENSITIVE_WINDOW_MS = 60 * 1000 // 1 minute

// ---------------------------------------------------------------------------
// Middleware helpers
// ---------------------------------------------------------------------------

export interface RateLimitMiddlewareConfig {
  limit?: number
  windowMs?: number
}

/**
 * Rate-limit middleware that can be used inside API route handlers.
 * Returns a NextResponse if rate-limited, or `null` if the request is allowed.
 *
 * Usage:
 *   const rateLimited = await rateLimit({ limit: 60, windowMs: 60000 })(request);
 *   if (rateLimited) return rateLimited;
 */
export function rateLimit(config?: RateLimitMiddlewareConfig) {
  const limit = config?.limit ?? DEFAULT_GENERAL_LIMIT
  const windowMs = config?.windowMs ?? DEFAULT_GENERAL_WINDOW_MS

  return function (request: NextRequest): NextResponse | null {
    const ip = extractIp(request)
    const endpoint = request.nextUrl.pathname

    const result = checkRateLimit(ip, endpoint, limit, windowMs)

    if (!result.allowed) {
      return error(
        'TOO_MANY_REQUESTS',
        'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        429,
      )
    }

    return null
  }
}

/**
 * Preconfigured rate limiter for sensitive endpoints (login, reset-password, etc.)
 * 5 requests per minute.
 */
export const sensitiveRateLimit = rateLimit({
  limit: DEFAULT_SENSITIVE_LIMIT,
  windowMs: DEFAULT_SENSITIVE_WINDOW_MS,
})

/**
 * Preconfigured rate limiter for general API endpoints.
 * 60 requests per minute.
 */
export const generalRateLimit = rateLimit({
  limit: DEFAULT_GENERAL_LIMIT,
  windowMs: DEFAULT_GENERAL_WINDOW_MS,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract client IP from request, handling common proxy headers.
 */
export function extractIp(request: NextRequest): string {
  // Prefer X-Forwarded-For header (set by gateway / reverse proxy)
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    return xff.split(',')[0].trim()
  }

  // Fallback to X-Real-IP
  const xri = request.headers.get('x-real-ip')
  if (xri) {
    return xri.trim()
  }

  return '127.0.0.1'
}

/**
 * Extract User-Agent from request.
 */
export function extractUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') ?? 'unknown'
}
