// ---------------------------------------------------------------------------
// Permission Constants
// ---------------------------------------------------------------------------

// WBP (Warga Binaan Pemasyarakatan)
export const PERM_WBP_READ = 'wbp:read'
export const PERM_WBP_CREATE = 'wbp:create'
export const PERM_WBP_UPDATE = 'wbp:update'
export const PERM_WBP_DELETE = 'wbp:delete'

// Kunjungan
export const PERM_KUNJUNGAN_READ = 'kunjungan:read'
export const PERM_KUNJUNGAN_CREATE = 'kunjungan:create'
export const PERM_KUNJUNGAN_UPDATE = 'kunjungan:update'
export const PERM_KUNJUNGAN_APPROVE = 'kunjungan:approve'
export const PERM_KUNJUNGAN_CHECKIN = 'kunjungan:checkin'

// Gangguan Keamanan
export const PERM_GANGGUAN_READ = 'gangguan:read'
export const PERM_GANGGUAN_CREATE = 'gangguan:create'
export const PERM_GANGGUAN_UPDATE = 'gangguan:update'
export const PERM_GANGGUAN_ASSIGN = 'gangguan:assign'
export const PERM_GANGGUAN_RESOLVE = 'gangguan:resolve'

// Pengaduan
export const PERM_PENGADUAN_READ = 'pengaduan:read'
export const PERM_PENGADUAN_RESPOND = 'pengaduan:respond'
export const PERM_PENGADUAN_DELETE = 'pengaduan:delete'
export const PERM_PENGADUAN_CREATE = 'pengaduan:create'

// Barang Titipan
export const PERM_BARANG_TITIPAN_READ = 'barang-titipan:read'
export const PERM_BARANG_TITIPAN_VERIFY = 'barang-titipan:verify'
export const PERM_BARANG_TITIPAN_DELIVER = 'barang-titipan:deliver'
export const PERM_BARANG_TITIPAN_REJECT = 'barang-titipan:reject'
export const PERM_BARANG_TITIPAN_CREATE = 'barang-titipan:create'

// Audit
export const PERM_AUDIT_READ = 'audit:read'

// Admin (full admin capabilities)
export const PERM_ADMIN_FULL = 'admin:full'

// Dashboard
export const PERM_DASHBOARD = 'dashboard'

// Laporan
export const PERM_LAPORAN = 'laporan'

// Pembinaan
export const PERM_PEMBINAAN_READ = 'pembinaan:read'
export const PERM_PEMBINAAN_CREATE = 'pembinaan:create'
export const PERM_PEMBINAAN_UPDATE = 'pembinaan:update'

// Pengamanan
export const PERM_PENGAMANAN_READ = 'pengamanan:read'
export const PERM_PENGAMANAN_CREATE = 'pengamanan:create'
export const PERM_PENGAMANAN_UPDATE = 'pengamanan:update'

// Publikasi
export const PERM_PUBLIKASI_READ = 'publikasi:read'
export const PERM_PUBLIKASI_CREATE = 'publikasi:create'
export const PERM_PUBLIKASI_UPDATE = 'publikasi:update'
export const PERM_PUBLIKASI_DELETE = 'publikasi:delete'

// Backup
export const PERM_BACKUP = 'backup'

// Serah Terima
export const PERM_SERAH_TERIMA = 'serah-terima'

// Regu
export const PERM_REGU = 'regu'

// Notifikasi
export const PERM_NOTIFIKASI = 'notifikasi'

// SKM (Survei Kepuasan Masyarakat)
export const PERM_SKM_CREATE = 'skm:create'

// ---------------------------------------------------------------------------
// Role Codes
// ---------------------------------------------------------------------------

export const ROLE_SUPER_ADMIN = 'SUPER_ADMIN'
export const ROLE_ADMIN_LAPAS = 'ADMIN_LAPAS'
export const ROLE_SECURITY_OFFICER = 'SECURITY_OFFICER'
export const ROLE_COACHING_OFFICER = 'COACHING_OFFICER'
export const ROLE_MANAGEMENT = 'MANAGEMENT'
export const ROLE_PUBLIC_USER = 'PUBLIC_USER'

// ---------------------------------------------------------------------------
// Role → Permission Mapping
// ---------------------------------------------------------------------------

/**
 * Maps each role code to the full set of granular permissions it grants.
 * Permissions are additive — a role inherits all permissions listed here.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLE_SUPER_ADMIN]: [
    // WBP
    PERM_WBP_READ,
    PERM_WBP_CREATE,
    PERM_WBP_UPDATE,
    PERM_WBP_DELETE,
    // Kunjungan
    PERM_KUNJUNGAN_READ,
    PERM_KUNJUNGAN_CREATE,
    PERM_KUNJUNGAN_UPDATE,
    PERM_KUNJUNGAN_APPROVE,
    PERM_KUNJUNGAN_CHECKIN,
    // Gangguan
    PERM_GANGGUAN_READ,
    PERM_GANGGUAN_CREATE,
    PERM_GANGGUAN_UPDATE,
    PERM_GANGGUAN_ASSIGN,
    PERM_GANGGUAN_RESOLVE,
    // Pengaduan
    PERM_PENGADUAN_READ,
    PERM_PENGADUAN_RESPOND,
    PERM_PENGADUAN_DELETE,
    PERM_PENGADUAN_CREATE,
    // Barang Titipan
    PERM_BARANG_TITIPAN_READ,
    PERM_BARANG_TITIPAN_VERIFY,
    PERM_BARANG_TITIPAN_DELIVER,
    PERM_BARANG_TITIPAN_REJECT,
    PERM_BARANG_TITIPAN_CREATE,
    // Audit
    PERM_AUDIT_READ,
    // Admin
    PERM_ADMIN_FULL,
    // Dashboard
    PERM_DASHBOARD,
    // Laporan
    PERM_LAPORAN,
    // Pembinaan
    PERM_PEMBINAAN_READ,
    PERM_PEMBINAAN_CREATE,
    PERM_PEMBINAAN_UPDATE,
    // Pengamanan
    PERM_PENGAMANAN_READ,
    PERM_PENGAMANAN_CREATE,
    PERM_PENGAMANAN_UPDATE,
    // Publikasi
    PERM_PUBLIKASI_READ,
    PERM_PUBLIKASI_CREATE,
    PERM_PUBLIKASI_UPDATE,
    PERM_PUBLIKASI_DELETE,
    // Backup
    PERM_BACKUP,
    // Serah Terima
    PERM_SERAH_TERIMA,
    // Regu
    PERM_REGU,
    // Notifikasi
    PERM_NOTIFIKASI,
    // SKM
    PERM_SKM_CREATE,
  ],

  [ROLE_ADMIN_LAPAS]: [
    // WBP
    PERM_WBP_READ,
    PERM_WBP_CREATE,
    PERM_WBP_UPDATE,
    PERM_WBP_DELETE,
    // Kunjungan
    PERM_KUNJUNGAN_READ,
    PERM_KUNJUNGAN_CREATE,
    PERM_KUNJUNGAN_UPDATE,
    PERM_KUNJUNGAN_APPROVE,
    PERM_KUNJUNGAN_CHECKIN,
    // Gangguan
    PERM_GANGGUAN_READ,
    PERM_GANGGUAN_CREATE,
    PERM_GANGGUAN_UPDATE,
    PERM_GANGGUAN_ASSIGN,
    PERM_GANGGUAN_RESOLVE,
    // Pengaduan
    PERM_PENGADUAN_READ,
    PERM_PENGADUAN_RESPOND,
    PERM_PENGADUAN_DELETE,
    PERM_PENGADUAN_CREATE,
    // Barang Titipan
    PERM_BARANG_TITIPAN_READ,
    PERM_BARANG_TITIPAN_VERIFY,
    PERM_BARANG_TITIPAN_DELIVER,
    PERM_BARANG_TITIPAN_REJECT,
    PERM_BARANG_TITIPAN_CREATE,
    // Audit
    PERM_AUDIT_READ,
    // Dashboard
    PERM_DASHBOARD,
    // Laporan
    PERM_LAPORAN,
    // Pembinaan
    PERM_PEMBINAAN_READ,
    PERM_PEMBINAAN_CREATE,
    PERM_PEMBINAAN_UPDATE,
    // Pengamanan
    PERM_PENGAMANAN_READ,
    PERM_PENGAMANAN_CREATE,
    PERM_PENGAMANAN_UPDATE,
    // Publikasi
    PERM_PUBLIKASI_READ,
    PERM_PUBLIKASI_CREATE,
    PERM_PUBLIKASI_UPDATE,
    PERM_PUBLIKASI_DELETE,
    // Backup
    PERM_BACKUP,
    // Serah Terima
    PERM_SERAH_TERIMA,
    // Regu
    PERM_REGU,
    // Notifikasi
    PERM_NOTIFIKASI,
    // SKM
    PERM_SKM_CREATE,
  ],

  [ROLE_SECURITY_OFFICER]: [
    // WBP
    PERM_WBP_READ,
    // Kunjungan
    PERM_KUNJUNGAN_READ,
    PERM_KUNJUNGAN_CREATE,
    PERM_KUNJUNGAN_UPDATE,
    PERM_KUNJUNGAN_CHECKIN,
    // Gangguan
    PERM_GANGGUAN_READ,
    PERM_GANGGUAN_CREATE,
    PERM_GANGGUAN_UPDATE,
    PERM_GANGGUAN_ASSIGN,
    PERM_GANGGUAN_RESOLVE,
    // Pengaduan
    PERM_PENGADUAN_READ,
    // Barang Titipan
    PERM_BARANG_TITIPAN_READ,
    PERM_BARANG_TITIPAN_VERIFY,
    PERM_BARANG_TITIPAN_DELIVER,
    PERM_BARANG_TITIPAN_REJECT,
    // Dashboard
    PERM_DASHBOARD,
    // Pengamanan
    PERM_PENGAMANAN_READ,
    PERM_PENGAMANAN_CREATE,
    PERM_PENGAMANAN_UPDATE,
    // Serah Terima
    PERM_SERAH_TERIMA,
    // Regu
    PERM_REGU,
    // Notifikasi
    PERM_NOTIFIKASI,
  ],

  [ROLE_COACHING_OFFICER]: [
    // WBP
    PERM_WBP_READ,
    PERM_WBP_CREATE,
    PERM_WBP_UPDATE,
    // Kunjungan
    PERM_KUNJUNGAN_READ,
    // Gangguan
    PERM_GANGGUAN_READ,
    // Pengaduan
    PERM_PENGADUAN_READ,
    PERM_PENGADUAN_RESPOND,
    // Pembinaan
    PERM_PEMBINAAN_READ,
    PERM_PEMBINAAN_CREATE,
    PERM_PEMBINAAN_UPDATE,
    // Dashboard
    PERM_DASHBOARD,
    // Laporan
    PERM_LAPORAN,
    // Notifikasi
    PERM_NOTIFIKASI,
  ],

  [ROLE_MANAGEMENT]: [
    // WBP
    PERM_WBP_READ,
    // Kunjungan
    PERM_KUNJUNGAN_READ,
    // Gangguan
    PERM_GANGGUAN_READ,
    // Pengaduan
    PERM_PENGADUAN_READ,
    PERM_PENGADUAN_RESPOND,
    // Barang Titipan
    PERM_BARANG_TITIPAN_READ,
    // Audit
    PERM_AUDIT_READ,
    // Dashboard
    PERM_DASHBOARD,
    // Laporan
    PERM_LAPORAN,
    // Pembinaan
    PERM_PEMBINAAN_READ,
    // Pengamanan
    PERM_PENGAMANAN_READ,
    // Publikasi
    PERM_PUBLIKASI_READ,
    PERM_PUBLIKASI_CREATE,
    PERM_PUBLIKASI_UPDATE,
    PERM_PUBLIKASI_DELETE,
    // Notifikasi
    PERM_NOTIFIKASI,
  ],

  [ROLE_PUBLIC_USER]: [
    // Public can only submit
    PERM_KUNJUNGAN_CREATE,
    PERM_PENGADUAN_CREATE,
    PERM_BARANG_TITIPAN_CREATE,
    PERM_SKM_CREATE,
  ],
}

// ---------------------------------------------------------------------------
// Permission Checking
// ---------------------------------------------------------------------------

/**
 * Check whether a given role has a specific permission.
 */
export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role]
  if (!perms) return false
  return perms.includes(permission)
}

/**
 * Returns a checker function that verifies whether a given role
 * satisfies ALL of the required permissions.
 *
 * Usage:
 *   const check = requirePermissions([PERM_WBP_READ, PERM_WBP_CREATE]);
 *   if (!check(userRole)) return forbiddenResponse;
 */
export function requirePermissions(permissions: string[]): (role: string) => boolean {
  return function (role: string): boolean {
    return permissions.every((perm) => hasPermission(role, perm))
  }
}
