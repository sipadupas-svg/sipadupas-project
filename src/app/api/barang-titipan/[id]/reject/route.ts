import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_BARANG_TITIPAN_REJECT } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// PUT /api/barang-titipan/[id]/reject — Reject entire barang titipan
export const PUT = authenticatedEndpoint(
  [PERM_BARANG_TITIPAN_REJECT],
  async (request: NextRequest, auth) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    const id = segments[2] // api/barang-titipan/{id}/reject
    const body = await request.json()
    const { alasan_penolakan } = body as { alasan_penolakan?: string }

    if (!alasan_penolakan) {
      return error('BAD_REQUEST', 'alasan_penolakan wajib diisi', 400)
    }

    // Fetch existing record
    const existing = await db.barangTitipan.findUnique({
      where: { id },
      select: { id: true, kodeTitipan: true, status: true },
    })

    if (!existing) {
      return error('NOT_FOUND', 'Data barang titipan tidak ditemukan', 404)
    }

    if (!['Menunggu', 'Diverifikasi'].includes(existing.status)) {
      return error('BAD_REQUEST', `Barang titipan dengan status "${existing.status}" tidak dapat ditolak`, 400)
    }

    // Update in transaction: reject parent + all pending items
    const updated = await db.$transaction(async (tx) => {
      // Reject all items that are still Menunggu
      await tx.itemBarang.updateMany({
        where: {
          barangTitipanId: id,
          status: 'Menunggu',
        },
        data: {
          status: 'Ditolak',
          alasanPenolakan: alasan_penolakan,
        },
      })

      const result = await tx.barangTitipan.update({
        where: { id },
        data: {
          status: 'Ditolak',
          alasanPenolakan,
          rejectedAt: new Date(),
        },
      })

      return result
    })

    // Create AuditLog
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'UPDATE',
        entityName: 'BarangTitipan',
        entityId: id,
        oldValues: JSON.stringify({ status: existing.status }),
        newValues: JSON.stringify({ status: 'Ditolak', alasan_penolakan }),
        detail: `Penolakan barang titipan ${existing.kodeTitipan} — alasan: ${alasan_penolakan}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    const data = {
      id: updated.id,
      kode_titipan: updated.kodeTitipan,
      status: updated.status,
      alasan_penolakan: updated.alasanPenolakan,
      rejected_at: updated.rejectedAt,
    }

    return success(data, 'Barang titipan ditolak')
  },
)
