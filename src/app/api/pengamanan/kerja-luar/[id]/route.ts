import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/pengamanan/kerja-luar/[id] — Kembali action (UF-10)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, jamKembali } = body

    const existing = await db.wBPKerjaLuar.findUnique({
      where: { id },
      select: { id: true, status: true, wbpId: true, estimasiKembali: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Data kerja luar tidak ditemukan' },
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

      const kembaliTime = jamKembali ? new Date(jamKembali) : new Date()
      let keterlambatan = false
      let finalStatus = 'KEMBALI'

      // Check if late: jamKembali > estimasiKembali
      if (existing.estimasiKembali && kembaliTime > existing.estimasiKembali) {
        keterlambatan = true
        finalStatus = 'TERLAMBAT'
      }

      const kerjaLuar = await db.wBPKerjaLuar.update({
        where: { id },
        data: {
          jamKembali: kembaliTime,
          keterlambatan,
          status: finalStatus,
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

      return NextResponse.json({ data: kerjaLuar })
    }

    return NextResponse.json(
      { error: 'Aksi tidak dikenali. Gunakan action: kembali' },
      { status: 400 },
    )
  } catch (error) {
    console.error('[PUT /api/pengamanan/kerja-luar/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data kerja luar' },
      { status: 500 },
    )
  }
}
