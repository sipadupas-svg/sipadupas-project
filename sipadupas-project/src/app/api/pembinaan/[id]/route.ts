import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pembinaan/[id] — Get single program with peserta and kehadiran
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const program = await db.programPembinaan.findUnique({
      where: { id },
      include: {
        peserta: {
          include: {
            wbp: { select: { id: true, nama: true, nomorRegister: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        kehadiran: {
          include: {
            wbp: { select: { id: true, nama: true, nomorRegister: true } },
          },
          orderBy: { tanggal: 'desc' },
        },
        _count: {
          select: { peserta: true },
        },
      },
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program pembinaan tidak ditemukan' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: program })
  } catch (error) {
    console.error('[GET /api/pembinaan/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data program pembinaan' },
      { status: 500 },
    )
  }
}

// PUT /api/pembinaan/[id] — Update program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.programPembinaan.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Program pembinaan tidak ditemukan' },
        { status: 404 },
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.nama !== undefined) updateData.nama = body.nama
    if (body.kategori !== undefined) updateData.kategori = body.kategori
    if (body.periode !== undefined) updateData.periode = body.periode || null
    if (body.pembina !== undefined) updateData.pembina = body.pembina || null
    if (body.jadwal !== undefined) updateData.jadwal = body.jadwal || null
    if (body.status !== undefined) updateData.status = body.status

    const program = await db.programPembinaan.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { peserta: true },
        },
      },
    })

    return NextResponse.json({ data: program })
  } catch (error) {
    console.error('[PUT /api/pembinaan/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui program pembinaan' },
      { status: 500 },
    )
  }
}

// DELETE /api/pembinaan/[id] — Delete program (cascade deletes peserta & kehadiran)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const existing = await db.programPembinaan.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Program pembinaan tidak ditemukan' },
        { status: 404 },
      )
    }

    await db.programPembinaan.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Program pembinaan berhasil dihapus' })
  } catch (error) {
    console.error('[DELETE /api/pembinaan/:id] Error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus program pembinaan' },
      { status: 500 },
    )
  }
}
