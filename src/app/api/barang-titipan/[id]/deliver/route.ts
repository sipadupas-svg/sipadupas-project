import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_BARANG_TITIPAN_DELIVER } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// PUT /api/barang-titipan/[id]/deliver — Confirm delivery to WBP
export const PUT = authenticatedEndpoint(
  [PERM_BARANG_TITIPAN_DELIVER],
  async (request: NextRequest, auth) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    const id = segments[2] // api/barang-titipan/{id}/deliver
    const body = await request.json()
    const { catatan_petugas } = body as { catatan_petugas?: string }

    // Fetch existing record
    const existing = await db.barangTitipan.findUnique({
      where: { id },
      select: { id: true, kodeTitipan: true, status: true },
    })

    if (!existing) {
      return error('NOT_FOUND', 'Data barang titipan tidak ditemukan', 404)
    }

    if (existing.status !== 'Diverifikasi') {
      return error('BAD_REQUEST', `Barang titipan dengan status "${existing.status}" tidak dapat dikonfirmasi penyerahan`, 400)
    }

    // Update status
    const updated = await db.barangTitipan.update({
      where: { id },
      data: {
        status: 'Diterima',
        catatanPetugas: catatan_petugas || null,
        deliveredAt: new Date(),
      },
    })

    // Create AuditLog
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'UPDATE',
        entityName: 'BarangTitipan',
        entityId: id,
        oldValues: JSON.stringify({ status: existing.status }),
        newValues: JSON.stringify({ status: 'Diterima' }),
        detail: `Penyerahan barang titipan ${existing.kodeTitipan} ke WBP dikonfirmasi`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    const data = {
      id: updated.id,
      kode_titipan: updated.kodeTitipan,
      status: updated.status,
      delivered_at: updated.deliveredAt,
    }

    return success(data, 'Barang titipan berhasil diserahkan ke WBP')
  },
)
