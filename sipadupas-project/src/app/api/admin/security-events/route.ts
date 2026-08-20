import { NextRequest } from 'next/server'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_ADMIN_FULL, PERM_AUDIT_READ, hasPermission } from '@/lib/security/permissions'
import { getSecurityEvents, getSecurityStats } from '@/lib/security/security-events'
import { success, error } from '@/lib/api-response'

/**
 * GET /api/admin/security-events
 *
 * Returns security events with optional filters and aggregated stats.
 * Requires PERM_ADMIN_FULL or PERM_AUDIT_READ (OR logic).
 */
export const GET = authenticatedEndpoint(async (request: NextRequest, auth) => {
  // OR permission check: user needs at least one of these
  const hasAccess =
    hasPermission(auth.role, PERM_ADMIN_FULL) ||
    hasPermission(auth.role, PERM_AUDIT_READ)

  if (!hasAccess) {
    return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki izin untuk mengakses data keamanan.', 403)
  }

  const { searchParams } = request.nextUrl

  const type = searchParams.get('type') || undefined
  const severity = searchParams.get('severity') || undefined
  let limit = parseInt(searchParams.get('limit') || '50', 10)
  if (isNaN(limit) || limit < 1) limit = 50
  if (limit > 200) limit = 200

  const events = getSecurityEvents({ type, severity, limit })
  const stats = getSecurityStats()

  return success(
    { events, stats },
    'Data keamanan berhasil dimuat',
  )
})
