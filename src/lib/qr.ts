// SIPADUPAS — QR Code Generator (lokal, same-origin)
// Menggantikan dependensi ke layanan pihak ketiga api.qrserver.com:
// - Kode booking/titipan tidak lagi dikirim ke domain eksternal (privasi)
// - Tidak ada single point of failure saat layanan eksternal down
import QRCode from 'qrcode'

/** Generate QR code sebagai PNG buffer (untuk response binary). */
export async function generateQrPng(text: string, size = 400): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    type: 'png',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}

/** Generate QR code sebagai data URL PNG (untuk embed langsung). */
export async function generateQrDataUrl(text: string, size = 280): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  })
}

/**
 * URL QR same-origin. Frontend memakai ini untuk <img src> dan canvas
 * (same-origin → canvas tidak tainted, toDataURL() unduhan tetap berfungsi).
 */
export function qrImageUrl(kode: string, size = 280): string {
  return `/api/public/qr/${encodeURIComponent(kode)}?size=${size}`
}