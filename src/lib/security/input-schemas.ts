import { z } from 'zod'
import { NextResponse } from 'next/server'
import { error } from '@/lib/api-response'

// ---------------------------------------------------------------------------
// Reusable validators
// ---------------------------------------------------------------------------

/** Indonesian phone number: 08xx or +62xx, 10-15 digits */
const phoneSchema = z
  .string()
  .regex(/^(\+62|62|08)[0-9]{8,13}$/, 'Format nomor telepon tidak valid')

/** NIK: exactly 16 digits */
const nikSchema = z
  .string()
  .regex(/^[0-9]{16}$/, 'NIK harus terdiri dari 16 digit')

/** Email format */
const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .max(255, 'Email maksimal 255 karakter')

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const loginBody = z.object({
  nip: z.string().min(1, 'NIP wajib diisi').max(50, 'NIP maksimal 50 karakter'),
  password: z.string().min(1, 'Password wajib diisi').max(255, 'Password maksimal 255 karakter'),
})

export const kunjunganCreateBody = z.object({
  namaPengunjung: z.string().min(1, 'Nama pengunjung wajib diisi').max(200, 'Nama pengunjung maksimal 200 karakter'),
  nik: nikSchema,
  noHp: phoneSchema,
  email: emailSchema.optional(),
  hubunganWbp: z.string().min(1, 'Hubungan dengan WBP wajib diisi').max(100, 'Hubungan maksimal 100 karakter'),
  wbpId: z.string().min(1, 'WBP ID wajib diisi'),
  tanggalKunjungan: z.string().min(1, 'Tanggal kunjungan wajib diisi'),
  keperluan: z.string().min(1, 'Keperluan kunjungan wajib diisi').max(500, 'Keperluan maksimal 500 karakter'),
  jumlahPengunjung: z.number().int().min(1, 'Jumlah pengunjung minimal 1').max(10, 'Jumlah pengunjung maksimal 10'),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
})

export const pengaduanCreateBody = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(200, 'Nama maksimal 200 karakter'),
  nik: nikSchema.optional(),
  noHp: phoneSchema.optional(),
  email: emailSchema.optional(),
  kategori: z.enum([
    'pelayanan',
    'fasilitas',
    'keamanan',
    'pembinaan',
    'lainnya',
  ], { error: 'Kategori tidak valid' }),
  subjek: z.string().min(1, 'Subjek wajib diisi').max(255, 'Subjek maksimal 255 karakter'),
  isi: z.string().min(10, 'Isi pengaduan minimal 10 karakter').max(5000, 'Isi pengaduan maksimal 5000 karakter'),
})

export const barangTitipanCreateBody = z.object({
  namaPengirim: z.string().min(1, 'Nama pengirim wajib diisi').max(200, 'Nama pengirim maksimal 200 karakter'),
  nik: nikSchema,
  noHp: phoneSchema,
  wbpId: z.string().min(1, 'WBP ID wajib diisi'),
  jenisBarang: z.string().min(1, 'Jenis barang wajib diisi').max(200, 'Jenis barang maksimal 200 karakter'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi').max(1000, 'Deskripsi maksimal 1000 karakter'),
  jumlah: z.number().int().min(1, 'Jumlah minimal 1'),
  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
})

export const wbpCreateBody = z.object({
  nama: z.string().min(1, 'Nama WBP wajib diisi').max(200, 'Nama WBP maksimal 200 karakter'),
  nik: nikSchema,
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi').max(200, 'Tempat lahir maksimal 200 karakter'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['L', 'P'], { error: 'Jenis kelamin harus L atau P' }),
  perkara: z.string().min(1, 'Perkara wajib diisi').max(500, 'Perkara maksimal 500 karakter'),
  pasal: z.string().min(1, 'Pasal wajib diisi').max(200, 'Pasal maksimal 200 karakter'),
  tanggalMasuk: z.string().min(1, 'Tanggal masuk wajib diisi'),
  blokId: z.string().min(1, 'Blok ID wajib diisi'),
  kamarId: z.string().min(1, 'Kamar ID wajib diisi'),
  foto: z.string().max(1000, 'URL foto maksimal 1000 karakter').optional(),
  catatan: z.string().max(2000, 'Catatan maksimal 2000 karakter').optional(),
})

export const gangguanCreateBody = z.object({
  jenisGangguan: z.enum([
    'perkelahian',
    'narkoba',
    'pelarian',
    'keributan',
    'lainnya',
  ], { error: 'Jenis gangguan tidak valid' }),
  tingkatKeparahan: z.enum(['rendah', 'sedang', 'tinggi', 'kritis'], {
    error: 'Tingkat keparahan tidak valid',
  }),
  lokasi: z.string().min(1, 'Lokasi wajib diisi').max(200, 'Lokasi maksimal 200 karakter'),
  deskripsi: z.string().min(5, 'Deskripsi minimal 5 karakter').max(5000, 'Deskripsi maksimal 5000 karakter'),
  wbpTerlibat: z.array(z.string()).optional(),
  reguPengamananId: z.string().optional(),
})

export const serahTerimaCreateBody = z.object({
  reguId: z.string().min(1, 'Regu ID wajib diisi'),
  reguSebelumId: z.string().min(1, 'Regu sebelum ID wajib diisi'),
  catatan: z.string().max(2000, 'Catatan maksimal 2000 karakter').optional(),
  wbpYangDiantar: z.array(z.string()).optional(),
  statusPengamanan: z.enum(['aman', 'waspada', 'siaga'], {
    error: 'Status pengamanan tidak valid',
  }).optional(),
})

// ---------------------------------------------------------------------------
// Validate body helper
// ---------------------------------------------------------------------------

/**
 * Validates the request body against a Zod schema.
 * Strips unknown keys automatically.
 * Returns parsed data on success, or a NextResponse error on failure.
 *
 * Usage:
 *   const parsed = validateBody(loginBody, body);
 *   if ('error' in parsed) return parsed.error;
 *   // parsed.data is typed
 */
export function validateBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
): { data: T } | { error: NextResponse } {
  const result = schema.safeParse(body)

  if (!result.success) {
    // Format Zod errors into a flat list of messages
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return {
      error: error(
        'VALIDATION_ERROR',
        'Data yang dikirim tidak valid',
        400,
        details,
      ),
    }
  }

  return { data: result.data }
}

// ---------------------------------------------------------------------------
// Type exports for use in route handlers
// ---------------------------------------------------------------------------

export type LoginBody = z.infer<typeof loginBody>
export type KunjunganCreateBody = z.infer<typeof kunjunganCreateBody>
export type PengaduanCreateBody = z.infer<typeof pengaduanCreateBody>
export type BarangTitipanCreateBody = z.infer<typeof barangTitipanCreateBody>
export type WbpCreateBody = z.infer<typeof wbpCreateBody>
export type GangguanCreateBody = z.infer<typeof gangguanCreateBody>
export type SerahTerimaCreateBody = z.infer<typeof serahTerimaCreateBody>
