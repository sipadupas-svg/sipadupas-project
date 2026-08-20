// ---------------------------------------------------------------------------
// Security Event Types
// ---------------------------------------------------------------------------

export type SecurityEventType =
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'RATE_LIMITED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'PERMISSION_DENIED'
  | 'IDOR_ATTEMPT'
  | 'INVALID_TOKEN'
  | 'SESSION_EXPIRED'
  | 'BRUTE_FORCE_DETECTED'

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityEventData {
  type: SecurityEventType
  severity: SecuritySeverity
  ipAddress?: string
  userAgent?: string
  userId?: string
  detail: string
  metadata?: Record<string, unknown>
}

export interface SecurityEvent extends SecurityEventData {
  id: string
  timestamp: number
}

export interface SecurityEventFilters {
  type?: string
  severity?: string
  limit?: number
}

export interface SecurityStats {
  totalToday: number
  byType: Record<string, number>
  failedLoginCount: number
  lockedAccounts: number
  rateLimitedCount: number
  criticalEvents: number
  suspiciousActivityCount: number
}

// ---------------------------------------------------------------------------
// In-memory event store
// ---------------------------------------------------------------------------

const MAX_EVENTS = 1000
const events: SecurityEvent[] = []
let eventIdCounter = 0

// ---------------------------------------------------------------------------
// Auto-cleanup: keep only the last MAX_EVENTS entries
// ---------------------------------------------------------------------------

function pruneEvents(): void {
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS)
  }
}

// ---------------------------------------------------------------------------
// Core: Log a security event
// ---------------------------------------------------------------------------

/**
 * Log a security event to the in-memory store.
 * Events are stored newest-first for efficient retrieval.
 */
export function logSecurityEvent(data: SecurityEventData): SecurityEvent {
  const event: SecurityEvent = {
    ...data,
    id: `se-${++eventIdCounter}-${Date.now().toString(36)}`,
    timestamp: Date.now(),
  }

  events.unshift(event)
  pruneEvents()

  return event
}

// ---------------------------------------------------------------------------
// Query: Get security events with optional filters
// ---------------------------------------------------------------------------

/**
 * Retrieve security events from the in-memory store.
 * Results are always returned newest-first.
 */
export function getSecurityEvents(filters?: SecurityEventFilters): SecurityEvent[] {
  let filtered = events

  if (filters?.type) {
    const t = filters.type.toUpperCase()
    filtered = filtered.filter((e) => e.type === t)
  }

  if (filters?.severity) {
    const s = filters.severity.toLowerCase()
    filtered = filtered.filter((e) => e.severity === s)
  }

  const limit = filters?.limit ?? 100
  return filtered.slice(0, limit)
}

// ---------------------------------------------------------------------------
// Query: Get summary statistics
// ---------------------------------------------------------------------------

/**
 * Returns aggregated security statistics for the current day.
 */
export function getSecurityStats(): SecurityStats {
  const now = Date.now()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const dayStartMs = startOfDay.getTime()

  const todayEvents = events.filter((e) => e.timestamp >= dayStartMs)

  // Count events by type
  const byType: Record<string, number> = {}
  for (const event of todayEvents) {
    byType[event.type] = (byType[event.type] ?? 0) + 1
  }

  return {
    totalToday: todayEvents.length,
    byType,
    failedLoginCount: byType['LOGIN_FAILED'] ?? 0,
    lockedAccounts: byType['ACCOUNT_LOCKED'] ?? 0,
    rateLimitedCount: byType['RATE_LIMITED'] ?? 0,
    criticalEvents: todayEvents.filter((e) => e.severity === 'critical').length,
    suspiciousActivityCount: byType['SUSPICIOUS_ACTIVITY'] ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Convenience helpers for common event types
// ---------------------------------------------------------------------------

export function logLoginFailed(ip: string, userAgent: string, detail: string, metadata?: Record<string, unknown>) {
  return logSecurityEvent({
    type: 'LOGIN_FAILED',
    severity: 'medium',
    ipAddress: ip,
    userAgent,
    detail,
    metadata,
  })
}

export function logLoginSuccess(userId: string, ip: string, userAgent: string) {
  return logSecurityEvent({
    type: 'LOGIN_SUCCESS',
    severity: 'low',
    userId,
    ipAddress: ip,
    userAgent,
    detail: 'Login berhasil',
  })
}

export function logAccountLocked(userId: string, ip: string, detail: string) {
  return logSecurityEvent({
    type: 'ACCOUNT_LOCKED',
    severity: 'high',
    userId,
    ipAddress: ip,
    detail,
  })
}

export function logRateLimited(ip: string, endpoint: string) {
  return logSecurityEvent({
    type: 'RATE_LIMITED',
    severity: 'medium',
    ipAddress: ip,
    detail: `Rate limit tercapai untuk endpoint: ${endpoint}`,
    metadata: { endpoint },
  })
}

export function logPermissionDenied(userId: string, role: string, permission: string, ip: string) {
  return logSecurityEvent({
    type: 'PERMISSION_DENIED',
    severity: 'medium',
    userId,
    ipAddress: ip,
    detail: `Akses ditolak: role ${role} tidak memiliki permission ${permission}`,
    metadata: { role, permission },
  })
}

export function logBruteForceDetected(ip: string, userAgent: string, attemptCount: number) {
  return logSecurityEvent({
    type: 'BRUTE_FORCE_DETECTED',
    severity: 'critical',
    ipAddress: ip,
    userAgent,
    detail: `Deteksi brute force: ${attemptCount} percobaan gagal berturut-turut`,
    metadata: { attemptCount },
  })
}

export function logInvalidToken(ip: string, userAgent: string, detail: string) {
  return logSecurityEvent({
    type: 'INVALID_TOKEN',
    severity: 'medium',
    ipAddress: ip,
    userAgent,
    detail,
  })
}

export function logSessionExpired(userId: string, ip: string) {
  return logSecurityEvent({
    type: 'SESSION_EXPIRED',
    severity: 'low',
    userId,
    ipAddress: ip,
    detail: 'Sesi kadaluwarsa',
  })
}

export function logIdorAttempt(userId: string, ip: string, resource: string, resourceId: string) {
  return logSecurityEvent({
    type: 'IDOR_ATTEMPT',
    severity: 'high',
    userId,
    ipAddress: ip,
    detail: `Percobaan IDOR terdeteksi pada ${resource} ID: ${resourceId}`,
    metadata: { resource, resourceId },
  })
}

export function logSuspiciousActivity(ip: string, userAgent: string, detail: string, metadata?: Record<string, unknown>) {
  return logSecurityEvent({
    type: 'SUSPICIOUS_ACTIVITY',
    severity: 'high',
    ipAddress: ip,
    userAgent,
    detail,
    metadata,
  })
}
