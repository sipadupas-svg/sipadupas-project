import { z } from "zod";

// ──────────────────────────────────────────────
// Reusable validators
// ──────────────────────────────────────────────

/** Indonesian phone number: 08xx or +62xx, 10-15 digits */
const phoneSchema = z
  .string()
  .optional()
  .refine(
    (v) => !v || /^(\+62|62|08)[0-9]{8,13}$/.test(v),
    "Format nomor HP tidak valid (contoh: 081234567890)",
  );

/** Email format */
const emailSchema = z
  .string()
  .min(1, "Email wajib diisi")
  .email("Format email tidak valid")
  .max(255, "Email maksimal 255 karakter");

/** Password: minimum 6 characters */
const passwordSchema = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(255, "Password maksimal 255 karakter");

// ──────────────────────────────────────────────
// Login Form Schema
// ──────────────────────────────────────────────

export const loginFormSchema = z.object({
  nip: z
    .string()
    .min(1, "NIP atau email wajib diisi")
    .max(50, "NIP atau email maksimal 50 karakter"),
  password: passwordSchema,
  remember: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// ──────────────────────────────────────────────
// Register Form Schema
// ──────────────────────────────────────────────

export const registerFormSchema = z
  .object({
    nip: z
      .string()
      .min(1, "NIP wajib diisi")
      .max(50, "NIP maksimal 50 karakter")
      .regex(/^[a-zA-Z0-9._-]+$/, "Format NIP tidak valid"),
    nama: z
      .string()
      .min(1, "Nama lengkap wajib diisi")
      .max(200, "Nama lengkap maksimal 200 karakter"),
    email: emailSchema,
    noHp: phoneSchema,
    jabatan: z.string().max(200, "Jabatan maksimal 200 karakter").optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    requestedRole: z.enum(
      ["SECURITY_OFFICER", "COACHING_OFFICER", "ADMIN_LAPAS"],
      {
        error: "Pilih peran yang valid untuk pendaftaran",
      },
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

// ──────────────────────────────────────────────
// Role options for registration dropdown
// ──────────────────────────────────────────────

export const REGISTER_ROLE_OPTIONS = [
  { value: "SECURITY_OFFICER", label: "Petugas Pengamanan" },
  { value: "COACHING_OFFICER", label: "Petugas Pembinaan" },
  { value: "ADMIN_LAPAS", label: "Admin Lapas" },
];

// ──────────────────────────────────────────────
// Forgot Password Form Schema
// ──────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  nip: z
    .string()
    .min(1, "NIP wajib diisi")
    .max(50, "NIP maksimal 50 karakter"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// ──────────────────────────────────────────────
// Reset Password Form Schema
// ──────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

// ──────────────────────────────────────────────
// Password Strength Evaluation
// ──────────────────────────────────────────────

export type PasswordStrength = "too-short" | "weak" | "medium" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  label: string;
  percentage: number; // 0–100 for progress bar width
}

/**
 * Evaluate password strength based on length and character variety.
 * - too-short: < 6 chars
 * - weak: 6–7 chars, or only one character type
 * - medium: 8+ chars with at least two character types
 * - strong: 12+ chars with all four character types (lower, upper, number, special)
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (password.length < 6) {
    return { strength: "too-short", label: "Terlalu pendek", percentage: 0 };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0;

  const total = score + lengthScore; // 0–6

  if (total <= 2) {
    return { strength: "weak", label: "Lemah", percentage: 33 };
  }
  if (total <= 4) {
    return { strength: "medium", label: "Sedang", percentage: 66 };
  }
  return { strength: "strong", label: "Kuat", percentage: 100 };
}

export const PASSWORD_STRENGTH_COLORS: Record<PasswordStrength, string> = {
  "too-short": "bg-slate-300",
  weak: "bg-red-500",
  medium: "bg-amber-500",
  strong: "bg-green-500",
};
