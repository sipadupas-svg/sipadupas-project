import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/security/security-pipeline'
import { PERM_SERAH_TERIMA } from '@/lib/security/permissions'

// GET /api/pengamanan/serah-terima/[id] — Get single serah terima
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, [PERM_SERAH_TERIMA])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params

    const serahTerima = await db.serahTerima.findUnique({
      where: { id },
      include: {
        regu: true,
        reguDari: { select: { id: true, nama: true, nip: true, jabatan: true } },
        reguKe: { select: { id: true, nama: true, nip: true, jabatan: true } },
      },
    })

    if (!serahTerima) {
      return NextResponse.json(
        { error: 'Serah terima tidak ditemukan' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: serahTerima })
  } catch (error) {
    console.error('[GET /api/pengamanan/serah-terima/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data serah terima' },
      { status: 500 },
    )
  }
}

// PUT /api/pengamanan/serah-terima/[id] — Submit or confirm serah terima
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, [PERM_SERAH_TERIMA])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    const existing = await db.serahTerima.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Serah terima tidak ditemukan' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = {}

    if (action === 'submit') {
      if (existing.status !== 'DRAFT') {
        return NextResponse.json(
          { error: 'Hanya DRAFT yang dapat disubmit' },
          { status: 400 },
        )
      }
      updateData.status = 'SUBMITTED'
    } else if (action === 'confirm') {
      if (existing.status !== 'SUBMITTED') {
        return NextResponse.json(
          { error: 'Hanya SUBMITTED yang dapat dikonfirmasi' },
          { status: 400 },
        )
      }
      updateData.status = 'CONFIRMED'
      updateData.confirmedAt = new Date()
    } else {
      // Generic field updates
      if (body.totalWBP !== undefined) updateData.totalWBP = body.totalWBP
      if (body.wbpRawatInap !== undefined) updateData.wbpRawatInap = body.wbpRawatInap
      if (body.wbpKerjaLuar !== undefined) updateData.wbpKerjaLuar = body.wbpKerjaLuar
      if (body.catatanKeamanan !== undefined) updateData.catatanKeamanan = body.catatanKeamanan || null
      if (body.catatanInventaris !== undefined) updateData.catatanInventaris = body.catatanInventaris || null
      if (body.catatanKejadian !== undefined) updateData.catatanKejadian = body.catatanKejadian || null
    }

    const serahTerima = await db.serahTerima.update({
      where: { id },
      data: updateData,
      include: {
        regu: true,
        reguDari: { select: { id: true, nama: true, nip: true } },
        reguKe: { select: { id: true, nama: true, nip: true } },
      },
    })

    return NextResponse.json({ data: serahTerima })
  } catch (error) {
    console.error('[PUT /api/pengamanan/serah-terima/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data serah terima' },
      { status: 500 },
    )
  }
}
