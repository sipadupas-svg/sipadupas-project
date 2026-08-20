import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_WBP_READ, PERM_WBP_UPDATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/blok — All WBPBlockRoom records grouped by blockName
export const GET = authenticatedEndpoint(
  [PERM_WBP_READ],
  async () => {
    try {
      const rooms = await db.wBPBlockRoom.findMany({
        include: {
          _count: { select: { wbp: true } },
        },
        orderBy: [{ blockName: 'asc' }, { roomNumber: 'asc' }],
      })

      const blockMap = new Map<string, typeof rooms>()
      for (const room of rooms) {
        const existing = blockMap.get(room.blockName)
        if (existing) {
          existing.push(room)
        } else {
          blockMap.set(room.blockName, [room])
        }
      }

      const data = Array.from(blockMap.entries()).map(([blockName, rooms]) => {
        const totalKapasitas = rooms.reduce((sum, r) => sum + r.maxCapacity, 0)
        const totalWBP = rooms.reduce((sum, r) => sum + r._count.wbp, 0)
        return {
          blockName,
          kapasitas: totalKapasitas,
          terisi: totalWBP,
          rooms: rooms.map((r) => ({
            id: r.id,
            blockName: r.blockName,
            roomNumber: r.roomNumber,
            maxCapacity: r.maxCapacity,
            currentOccupancy: r.currentOccupancy,
            status: r.status,
            wbpCount: r._count.wbp,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          })),
        }
      })

      return NextResponse.json({ data })
    } catch (err) {
      console.error('Blok GET error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data blok', 500)
    }
  },
)

// POST /api/blok — Create new WBPBlockRoom
export const POST = authenticatedEndpoint(
  [PERM_WBP_UPDATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { blockName, roomNumber, maxCapacity, status } = body

      if (!blockName || !roomNumber) {
        return error('BAD_REQUEST', 'Nama blok dan nomor kamar wajib diisi', 400)
      }

      const room = await db.wBPBlockRoom.create({
        data: {
          blockName,
          roomNumber,
          maxCapacity: maxCapacity || 0,
          status: status || 'Aktif',
        },
      })

      return NextResponse.json({ data: room }, { status: 201 })
    } catch (err) {
      console.error('Blok POST error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat data blok', 500)
    }
  },
)
