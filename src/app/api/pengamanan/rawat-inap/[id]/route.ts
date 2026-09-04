import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/security/security-pipeline'
import { PERM_PENGAMANAN_UPDATE } from '@/lib/security/permissions'

// PUT /api/pengamanan/rawat-inap/[id] — Kembali action (UF-09)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, [PERM_PENGAMANAN_UPDATE])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { action, tanggalKembali, kondisiKembali } = body

    const existing = await db.wBPRawatInap.findUnique({
      where: { id },
      select: { id: true, status: true, wbpId: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Data rawat inap tidak ditemukan' },
        { status: 404 },
      )
    }

    if (action === 'kembali') {
      if (existing.status !== 'AKTIF') {
        return NextResponse.json(
          { error: 'Hanya data dengan status AKTIF yang dapat dikembalikan' },
          { status: 400 },
        )
      }

      const rawatInap = await db.wBPRawatInap.update({
        where: { id },
        data: {
          tanggalKembali: tanggalKembali ? new Date(tanggalKembali) : new Date(),
          kondisiKembali: kondisiKembali || null,
          status: 'KEMBALI',
        },
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true, currentRoom: { select: { blockName: true, roomNumber: true } } } },
        },
      })

      // Auto-update WBP status back to Aktif
      await db.wBP.update({
        where: { id: existing.wbpId },
        data: { status: 'Aktif' },
      })

      return NextResponse.json({ data: rawatInap })
    }

    return NextResponse.json(
      { error: 'Aksi tidak dikenali. Gunakan action: kembali' },
      { status: 400 },
    )
  } catch (error) {
    console.error('[PUT /api/pengamanan/rawat-inap/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data rawat inap' },
      { status: 500 },
    )
  }
}
