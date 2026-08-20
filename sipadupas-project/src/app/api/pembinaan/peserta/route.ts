import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/security/security-pipeline'
import { PERM_PEMBINAAN_UPDATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// POST /api/pembinaan/peserta — Add peserta to program (check uniqueness → 409)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, [PERM_PEMBINAAN_UPDATE])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { programId, wbpId } = body

    if (!programId || !wbpId) {
      return error('BAD_REQUEST', 'programId dan wbpId wajib diisi', 400)
    }

    const program = await db.programPembinaan.findUnique({
      where: { id: programId },
      select: { id: true },
    })

    if (!program) {
      return error('NOT_FOUND', 'Program pembinaan tidak ditemukan', 404)
    }

    const wbp = await db.wBP.findUnique({
      where: { id: wbpId },
      select: { id: true },
    })

    if (!wbp) {
      return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
    }

    const existing = await db.pesertaPembinaan.findUnique({
      where: {
        programId_wbpId: { programId, wbpId },
      },
    })

    if (existing) {
      return error('CONFLICT', 'WBP sudah terdaftar sebagai peserta di program ini', 409)
    }

    const peserta = await db.pesertaPembinaan.create({
      data: { programId, wbpId },
      include: {
        wbp: { select: { id: true, nama: true, nomorRegister: true } },
      },
    })

    return NextResponse.json({ data: peserta }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/pembinaan/peserta] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal menambahkan peserta', 500)
  }
}

// DELETE /api/pembinaan/peserta — Remove peserta via query params ?programId= & ?wbpId=
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request, [PERM_PEMBINAAN_UPDATE])
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const wbpId = searchParams.get('wbpId')

    if (!programId || !wbpId) {
      return error('BAD_REQUEST', 'programId dan wbpId wajib diisi sebagai query parameter', 400)
    }

    const existing = await db.pesertaPembinaan.findUnique({
      where: {
        programId_wbpId: { programId, wbpId },
      },
    })

    if (!existing) {
      return error('NOT_FOUND', 'Peserta tidak ditemukan', 404)
    }

    await db.pesertaPembinaan.delete({
      where: {
        programId_wbpId: { programId, wbpId },
      },
    })

    return NextResponse.json({ message: 'Peserta berhasil dihapus dari program' })
  } catch (err) {
    console.error('[DELETE /api/pembinaan/peserta] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal menghapus peserta', 500)
  }
}
