import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_BARANG_TITIPAN_VERIFY } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// PUT /api/barang-titipan/[id]/verify — Verify/approve barang titipan
export const PUT = authenticatedEndpoint(
  [PERM_BARANG_TITIPAN_VERIFY],
  async (request: NextRequest, auth) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean)
    const id = segments[2] // api/barang-titipan/{id}/verify
    const body = await request.json()
    const { catatan_petugas, items } = body as {
      catatan_petugas?: string
      items: { item_id: string; status: string; alasan_penolakan?: string }[]
    }

    // Validate body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('BAD_REQUEST', 'Data items wajib diisi untuk verifikasi', 400)
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].item_id) {
        return error('BAD_REQUEST', `item_id pada item ke-${i + 1} wajib diisi`, 400)
      }
      if (!['Diterima', 'Ditolak'].includes(items[i].status)) {
        return error('BAD_REQUEST', `status item ke-${i + 1} harus 'Diterima' atau 'Ditolak'`, 400)
      }
      // If status is Ditolak, alasan_penolakan is required
      if (items[i].status === 'Ditolak' && !items[i].alasan_penolakan) {
        return error('BAD_REQUEST', `alasan_penolakan wajib diisi untuk item ditolak (item ke-${i + 1})`, 400)
      }
    }

    // Fetch existing record
    const existing = await db.barangTitipan.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existing) {
      return error('NOT_FOUND', 'Data barang titipan tidak ditemukan', 404)
    }

    if (existing.status !== 'Menunggu') {
      return error('BAD_REQUEST', `Barang titipan dengan status "${existing.status}" tidak dapat diverifikasi`, 400)
    }

    // Determine overall status based on items
    const allRejected = items.every((item) => item.status === 'Ditolak')
    const newStatus = allRejected ? 'Ditolak' : 'Diverifikasi'

    // Update in transaction
    const updated = await db.$transaction(async (tx) => {
      // Update each item
      for (const item of items) {
        await tx.itemBarang.update({
          where: { id: item.item_id },
          data: {
            status: item.status,
            alasanPenolakan: item.status === 'Ditolak' ? (item.alasan_penolakan || null) : null,
          },
        })
      }

      // Update the parent BarangTitipan
      const result = await tx.barangTitipan.update({
        where: { id },
        data: {
          status: newStatus,
          catatanPetugas: catatan_petugas || null,
          verifiedById: auth.userId,
          verifiedAt: new Date(),
          // If all rejected, set rejection info
          ...(allRejected ? {
            alasanPenolakan: 'Semua item barang ditolak oleh petugas',
            rejectedAt: new Date(),
          } : {}),
        },
        include: {
          wbp: { select: { id: true, nomorRegister: true, nama: true } },
          verifiedBy: { select: { id: true, nama: true, nip: true } },
          items: true,
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
        newValues: JSON.stringify({
          status: newStatus,
          items: items.map((i) => ({
            id: i.item_id,
            status: i.status,
            alasan_penolakan: i.alasan_penolakan,
          })),
        }),
        detail: `Verifikasi barang titipan ${updated.kodeTitipan} — status: ${newStatus}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    const acceptedCount = updated.items.filter((i) => i.status === 'Diterima').length
    const rejectedCount = updated.items.filter((i) => i.status === 'Ditolak').length

    const data = {
      id: updated.id,
      kode_titipan: updated.kodeTitipan,
      status: updated.status,
      verified_at: updated.verifiedAt,
      accepted_count: acceptedCount,
      rejected_count: rejectedCount,
      items: updated.items.map((item) => ({
        id: item.id,
        nama_barang: item.namaBarang,
        status: item.status,
        alasan_penolakan: item.alasanPenolakan,
      })),
    }

    return success(data, `Barang titipan berhasil diverifikasi — status: ${newStatus}`)
  },
)
