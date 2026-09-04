// SIPADUPAS — Authentication Utilities
// Helpers for role mapping, localStorage persistence, and API response normalization.

import type { AuthUser } from "@/lib/store";
import type { ViewKey } from "@/lib/data";

// ──────────────────────────────────────────────
// Role Label Mapping
// Mirrors prisma/seed.ts and data.ts roleList
// ──────────────────────────────────────────────

export const ROLE_LABEL_MAP: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_LAPAS: "Admin Lapas",
  SECURITY_OFFICER: "Petugas Pengamanan",
  COACHING_OFFICER: "Petugas Pembinaan",
  MANAGEMENT: "Pimpinan",
  PUBLIC_USER: "Masyarakat",
};

export function getRoleLabel(role: string): string {
  return ROLE_LABEL_MAP[role] ?? role;
}

// ──────────────────────────────────────────────
// Role → Default View Mapping (post-login redirect)
// ──────────────────────────────────────────────

export const ROLE_DEFAULT_VIEW: Record<string, ViewKey> = {
  SUPER_ADMIN: "admin",
  ADMIN_LAPAS: "dashboard",
  SECURITY_OFFICER: "dashboard",
  COACHING_OFFICER: "dashboard",
  MANAGEMENT: "dashboard",
};

export function getDefaultViewForRole(role: string): ViewKey {
  return ROLE_DEFAULT_VIEW[role] ?? "dashboard";
}

// ──────────────────────────────────────────────
// LocalStorage Persistence (Remember Me)
// ──────────────────────────────────────────────

const STORAGE_KEY = "sipadupas_auth_user";

export function saveAuthToStorage(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // localStorage might be unavailable
  }
}

export function loadAuthFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    // Basic validity check
    if (!user?.id || !user?.token || !user?.role) return null;
    return user;
  } catch {
    return null;
  }
}

export function clearAuthFromStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ──────────────────────────────────────────────
// API Response Normalization
// Handles both /api/auth (legacy) and /api/auth/login (secure) response formats
// ──────────────────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown[] };
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

/** Union type for any API response */
export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

/**
 * Extract a user-friendly error message from an API response.
 * Never exposes technical backend errors to the user.
 */
export function getErrorMessage(
  response: ApiResponse | { success: boolean; message?: string; error?: { message?: string } },
): string {
  if (!response.success) {
    // Standardized error format
    if ("error" in response && response.error?.message) {
      return response.error.message;
    }
    // Legacy or direct message format
    if ("message" in response && response.message) {
      return response.message;
    }
    return "Terjadi kesalahan. Silakan coba lagi.";
  }
  return "";
}
