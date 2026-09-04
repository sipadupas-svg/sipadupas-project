// SIPADUPAS — Image Compression Utilities (sharp)
// Kompres gambar base64 data-URL sebelum disimpan ke database agar
// payload API (hero image, dll) tetap kecil.
import sharp from 'sharp'

/** Perkiraan batas ukuran di mana kompresi read-timeworth it (bytes). */
export const LARGE_IMAGE_THRESHOLD_BYTES = 200 * 1024 // 200KB

/**
 * Kompres sebuah data-URL gambar (image/*;base64,...) menjadi WebP.
 * - Resize max width 1920px (tanpa memperbesar)
 * - Quality 80
 * Returns data-URL terkompresi, atau data-URL asli jika gagal/terjadi error.
 */
export async function compressDataUrlImage(
  dataUrl: string,
  maxWidth = 1920,
  quality = 80,
): Promise<string> {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return dataUrl
  const [, , base64] = match
  try {
    const input = Buffer.from(base64, 'base64')
    const output = await sharp(input)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()
    return `data:image/webp;base64,${output.toString('base64')}`
  } catch {
    // Bukan gambar valid — kembalikan apa adanya (caller memvalidasi sendiri)
    return dataUrl
  }
}