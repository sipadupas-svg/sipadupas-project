import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_WBP_READ, PERM_WBP_UPDATE, PERM_WBP_DELETE } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// GET /api/blok/[id] — Single WBPBlockRoom
export const GET = authenticatedEndpoint(
  [PERM_WBP_READ],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

    const room = await db.wBPBlockRoom.findUnique({
      where: { id },
      include: {
        _count: { select: { wbp: true } },
      },
    })

    if (!room) {
      return error('NOT_FOUND', 'Ruang tidak ditemukan', 404)
    }

    return success({
      id: room.id,
      blockName: room.blockName,
      roomNumber: room.roomNumber,
      maxCapacity: room.maxCapacity,
      currentOccupancy: room.currentOccupancy,
      status: room.status,
      wbpCount: room._count.wbp,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    })
  },
)

// PUT /api/blok/[id] — Update WBPBlockRoom
export const PUT = authenticatedEndpoint(
  [PERM_WBP_UPDATE],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!
    const body = await request.json() as {
      blockName?: string
      roomNumber?: string
      maxCapacity?: number
      status?: string
    }

    const room = await db.wBPBlockRoom.update({
      where: { id },
      data: {
        ...(body.blockName !== undefined && { blockName: body.blockName }),
        ...(body.roomNumber !== undefined && { roomNumber: body.roomNumber }),
        ...(body.maxCapacity !== undefined && { maxCapacity: body.maxCapacity }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    return success(room)
  },
)

// DELETE /api/blok/[id] — Delete WBPBlockRoom (restrict if WBP exists)
export const DELETE = authenticatedEndpoint(
  [PERM_WBP_DELETE],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

    const room = await db.wBPBlockRoom.findUnique({
      where: { id },
      include: { _count: { select: { wbp: true } } },
    })

    if (!room) {
      return error('NOT_FOUND', 'Ruang tidak ditemukan', 404)
    }

    if (room._count.wbp > 0) {
      return error('CONFLICT', 'Tidak dapat menghapus ruang yang masih memiliki WBP', 409)
    }

    await db.wBPBlockRoom.delete({ where: { id } })

    return success(null, 'Ruang berhasil dihapus')
  },
)
