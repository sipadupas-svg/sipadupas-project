import { NextRequest } from 'next/server'
import { generateQrPng } from '@/lib/qr'

// GET /api/public/qr/{kode}?size=280 — QR code di-generate LOKAL (same-origin).
// Dipakai untuk <img> e-tiket dan penggambaran ke <canvas> untuk unduhan —
// gambar same-origin tidak membuat canvas tainted sehingga toDataURL() berhasil.
// Sebelumnya mem-proxies api.qrserver.com (pihak ketiga) — kini tanpa dependensi eksternal.
export async function GET(request: NextRequest) {
  const kode = request.nextUrl.pathname.split('/').filter(Boolean).pop() || ''
  const sizeParam = parseInt(request.nextUrl.searchParams.get('size') || '280', 10)
  const size = Math.min(1000, Math.max(80, isNaN(sizeParam) ? 280 : sizeParam))

  if (!kode || kode.length > 200) {
    return new Response('Bad Request', { status: 400 })
  }

  try {
    const buffer = await generateQrPng(kode, size)
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        // Kode bersifat stabil — aman di-cache agresif
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (err) {
    console.error('[GET /api/public/qr/[kode]] Error:', err)
    return new Response('Gagal membuat QR', { status: 500 })
  }
}
