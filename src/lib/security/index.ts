// Security Library — barrel export

export {
  checkRateLimit,
  rateLimit,
  sensitiveRateLimit,
  generalRateLimit,
  extractIp,
  extractUserAgent,
} from './rate-limiter'
export type { RateLimitMiddlewareConfig } from './rate-limiter'

export {
  // Permission constants
  PERM_WBP_READ,
  PERM_WBP_CREATE,
  PERM_WBP_UPDATE,
  PERM_WBP_DELETE,
  PERM_KUNJUNGAN_READ,
  PERM_KUNJUNGAN_CREATE,
  PERM_KUNJUNGAN_UPDATE,
  PERM_KUNJUNGAN_APPROVE,
  PERM_KUNJUNGAN_CHECKIN,
  PERM_GANGGUAN_READ,
  PERM_GANGGUAN_CREATE,
  PERM_GANGGUAN_UPDATE,
  PERM_GANGGUAN_ASSIGN,
  PERM_GANGGUAN_RESOLVE,
  PERM_PENGADUAN_READ,
  PERM_PENGADUAN_RESPOND,
  PERM_PENGADUAN_DELETE,
  PERM_PENGADUAN_CREATE,
  PERM_BARANG_TITIPAN_READ,
  PERM_BARANG_TITIPAN_VERIFY,
  PERM_BARANG_TITIPAN_DELIVER,
  PERM_BARANG_TITIPAN_REJECT,
  PERM_BARANG_TITIPAN_CREATE,
  PERM_AUDIT_READ,
  PERM_ADMIN_FULL,
  PERM_DASHBOARD,
  PERM_LAPORAN,
  PERM_PEMBINAAN_READ,
  PERM_PEMBINAAN_CREATE,
  PERM_PEMBINAAN_UPDATE,
  PERM_PENGAMANAN_READ,
  PERM_PENGAMANAN_CREATE,
  PERM_PENGAMANAN_UPDATE,
  PERM_PUBLIKASI_READ,
  PERM_PUBLIKASI_CREATE,
  PERM_PUBLIKASI_UPDATE,
  PERM_PUBLIKASI_DELETE,
  PERM_BACKUP,
  PERM_SERAH_TERIMA,
  PERM_REGU,
  PERM_NOTIFIKASI,
  PERM_SKM_CREATE,
  // Role constants
  ROLE_SUPER_ADMIN,
  ROLE_ADMIN_LAPAS,
  ROLE_SECURITY_OFFICER,
  ROLE_COACHING_OFFICER,
  ROLE_MANAGEMENT,
  ROLE_PUBLIC_USER,
  // Functions
  ROLE_PERMISSIONS,
  hasPermission,
  requirePermissions,
} from './permissions'

export {
  secureEndpoint,
  publicEndpoint,
  authenticatedEndpoint,
  requireAuth,
} from './security-pipeline'
export type { SecureEndpointConfig } from './security-pipeline'

export {
  logSecurityEvent,
  getSecurityEvents,
  getSecurityStats,
  logLoginFailed,
  logLoginSuccess,
  logAccountLocked,
  logRateLimited,
  logPermissionDenied,
  logBruteForceDetected,
  logInvalidToken,
  logSessionExpired,
  logIdorAttempt,
  logSuspiciousActivity,
} from './security-events'
export type {
  SecurityEventType,
  SecuritySeverity,
  SecurityEventData,
  SecurityEvent,
  SecurityEventFilters,
  SecurityStats,
} from './security-events'

export {
  validateBody,
  loginBody,
  kunjunganCreateBody,
  pengaduanCreateBody,
  barangTitipanCreateBody,
  wbpCreateBody,
  gangguanCreateBody,
  serahTerimaCreateBody,
} from './input-schemas'
export type {
  LoginBody,
  KunjunganCreateBody,
  PengaduanCreateBody,
  BarangTitipanCreateBody,
  WbpCreateBody,
  GangguanCreateBody,
  SerahTerimaCreateBody,
} from './input-schemas'
