import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_WBP_READ, PERM_WBP_UPDATE, PERM_WBP_DELETE } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// GET /api/wbp/[id] — Get single WBP with currentRoom, riwayatMutasi (UF-03)
export const GET = authenticatedEndpoint(
  [PERM_WBP_READ],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

    const wbp = await db.wBP.findUnique({
      where: { id },
      include: {
        currentRoom: true,
        riwayatMutasi: {
          include: {
            wbp: { select: { nama: true, nomorRegister: true } },
            roomAsal: true,
            roomTujuan: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!wbp) {
      return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
    }

    return success(wbp)
  },
)

// PUT /api/wbp/[id] — Update WBP, auto-create RiwayatMutasi on room change (UF-03)
export const PUT = authenticatedEndpoint(
  [PERM_WBP_UPDATE],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!
    const body = await request.json()

    const existing = await db.wBP.findUnique({
      where: { id },
      select: {
        id: true,
        currentRoomId: true,
      },
    })

    if (!existing) {
      return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
    }

    const {
      nomorRegister,
      nama,
      nik,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      pasal,
      lamaHukuman,
      tanggalEksekusi,
      risiko,
      status,
      currentRoomId: newRoomId,
      catatan,
    } = body as {
      nomorRegister?: string
      nama?: string
      nik?: string | null
      tempatLahir?: string | null
      tanggalLahir?: string | null
      jenisKelamin?: string
      pasal?: string | null
      lamaHukuman?: string | null
      tanggalEksekusi?: string | null
      risiko?: string
      status?: string
      currentRoomId?: string | null
      catatan?: string | null
    }

    const updateData: Record<string, unknown> = {}

    if (nomorRegister !== undefined) updateData.nomorRegister = nomorRegister
    if (nama !== undefined) updateData.nama = nama
    if (nik !== undefined) updateData.nik = nik || null
    if (tempatLahir !== undefined) updateData.tempatLahir = tempatLahir || null
    if (tanggalLahir !== undefined)
      updateData.tanggalLahir = tanggalLahir ? new Date(tanggalLahir) : null
    if (jenisKelamin !== undefined) updateData.jenisKelamin = jenisKelamin
    if (pasal !== undefined) updateData.pasal = pasal || null
    if (lamaHukuman !== undefined) updateData.lamaHukuman = lamaHukuman || null
    if (tanggalEksekusi !== undefined)
      updateData.tanggalEksekusi = tanggalEksekusi
        ? new Date(tanggalEksekusi)
        : null
    if (risiko !== undefined) updateData.risiko = risiko
    if (status !== undefined) updateData.status = status
    if (catatan !== undefined) updateData.catatan = catatan || null

    const roomChanged =
      newRoomId !== undefined && newRoomId !== existing.currentRoomId

    if (newRoomId !== undefined) updateData.currentRoomId = newRoomId || null

    const wbp = await db.wBP.update({
      where: { id },
      data: updateData,
      include: {
        currentRoom: true,
      },
    })

    if (roomChanged) {
      const oldRoomId = existing.currentRoomId
      const targetRoomId = newRoomId || null

      await db.riwayatMutasi.create({
        data: {
          wbpId: id,
          roomAsalId: oldRoomId,
          roomTujuanId: targetRoomId,
          alasan: 'Mutasi otomatis dari pembaruan data WBP',
        },
      })

      if (oldRoomId) {
        await db.wBPBlockRoom.update({
          where: { id: oldRoomId },
          data: { currentOccupancy: { decrement: 1 } },
        })
      }

      if (targetRoomId) {
        await db.wBPBlockRoom.update({
          where: { id: targetRoomId },
          data: { currentOccupancy: { increment: 1 } },
        })
      }
    }

    return success(wbp)
  },
)

// DELETE /api/wbp/[id] — Delete WBP (cascade) (UF-03)
export const DELETE = authenticatedEndpoint(
  [PERM_WBP_DELETE],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

    const existing = await db.wBP.findUnique({
      where: { id },
      select: { id: true, currentRoomId: true },
    })

    if (!existing) {
      return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
    }

    if (existing.currentRoomId) {
      await db.wBPBlockRoom.update({
        where: { id: existing.currentRoomId },
        data: { currentOccupancy: { decrement: 1 } },
      })
    }

    await db.wBP.delete({
      where: { id },
    })

    return success(null, 'WBP berhasil dihapus')
  },
)
