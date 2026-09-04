import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/security/security-pipeline'
import { PERM_GANGGUAN_READ, PERM_GANGGUAN_UPDATE } from '@/lib/security/permissions'

// GET /api/pengamanan/gangguan/[id] — Get single gangguan (UF-08)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, [PERM_GANGGUAN_READ])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params

    const gangguan = await db.gangguan.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, nama: true, nip: true, jabatan: true } },
        assignedTo: { select: { id: true, nama: true, nip: true, jabatan: true } },
      },
    })

    if (!gangguan) {
      return NextResponse.json(
        { error: 'Gangguan tidak ditemukan' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: gangguan })
  } catch (err) {
    console.error('[GET /api/pengamanan/gangguan/:id] Error:', err)
    return NextResponse.json(
      { error: 'Gagal mengambil data gangguan' },
      { status: 500 },
    )
  }
}

// PUT /api/pengamanan/gangguan/[id] — Handle gangguan actions (UF-08)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, [PERM_GANGGUAN_UPDATE])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()
    const { action, assignedToId, tindakLanjut, rekomendasi } = body

    const existing = await db.gangguan.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Gangguan tidak ditemukan' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = {}

    if (action === 'assign') {
      if (!assignedToId) {
        return NextResponse.json(
          { error: 'assignedToId wajib diisi untuk aksi assign' },
          { status: 400 },
        )
      }
      updateData.assignedToId = assignedToId
      updateData.status = 'IN_PROGRESS'
    } else if (action === 'resolve') {
      if (!tindakLanjut) {
        return NextResponse.json(
          { error: 'tindakLanjut wajib diisi untuk aksi resolve' },
          { status: 400 },
        )
      }
      updateData.tindakLanjut = tindakLanjut
      updateData.rekomendasi = rekomendasi || null
      updateData.status = 'RESOLVED'
      updateData.resolvedAt = new Date()
    } else if (action === 'close') {
      updateData.status = 'CLOSED'
      updateData.closedAt = new Date()
    } else {
      // Generic field updates
      if (body.blok !== undefined) updateData.blok = body.blok || null
      if (body.kamar !== undefined) updateData.kamar = body.kamar || null
      if (body.jenis !== undefined) updateData.jenis = body.jenis
      if (body.tingkat !== undefined) updateData.tingkat = body.tingkat
      if (body.kronologi !== undefined) updateData.kronologi = body.kronologi || null
      if (body.tindakanAwal !== undefined) updateData.tindakanAwal = body.tindakanAwal || null
      if (body.wbpTerlibat !== undefined) {
        updateData.wbpTerlibat =
          typeof body.wbpTerlibat === 'string'
            ? body.wbpTerlibat
            : JSON.stringify(body.wbpTerlibat)
      }
    }

    const gangguan = await db.gangguan.update({
      where: { id },
      data: updateData,
      include: {
        reporter: { select: { id: true, nama: true, nip: true } },
        assignedTo: { select: { id: true, nama: true, nip: true } },
      },
    })

    return NextResponse.json({ data: gangguan })
  } catch (error) {
    console.error('[PUT /api/pengamanan/gangguan/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data gangguan' },
      { status: 500 },
    )
  }
}
