import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_WBP_READ, PERM_WBP_CREATE } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// GET /api/wbp — List all WBP with optional filters (UF-02)
export const GET = authenticatedEndpoint(
  [PERM_WBP_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search') || ''
      const status = searchParams.get('status') || ''
      const blockName = searchParams.get('blok') || ''
      const risiko = searchParams.get('risiko') || ''

      const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { nama: { contains: search } },
          { nomorRegister: { contains: search } },
          { nik: { contains: search } },
        ]
      }

      if (status) {
        where.status = status
      }

      if (blockName) {
        const roomsInBlock = await db.wBPBlockRoom.findMany({
          where: { blockName },
          select: { id: true },
        })
        const roomIds = roomsInBlock.map((r) => r.id)
        if (roomIds.length > 0) {
          where.currentRoomId = { in: roomIds }
        } else {
          return NextResponse.json({ data: [] })
        }
      }

      if (risiko) {
        where.risiko = risiko
      }

      const wbpList = await db.wBP.findMany({
        where,
        include: {
          currentRoom: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: wbpList })
    } catch (err) {
      console.error('[GET /api/wbp] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data WBP', 500)
    }
  },
)

// POST /api/wbp — Create new WBP (UF-02)
export const POST = authenticatedEndpoint(
  [PERM_WBP_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
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
        currentRoomId,
        catatan,
      } = body

      const existing = await db.wBP.findUnique({
        where: { nomorRegister },
      })

      if (existing) {
        return error('CONFLICT', 'Nomor register sudah terdaftar', 409)
      }

      const wbp = await db.wBP.create({
        data: {
          nomorRegister,
          nama,
          nik: nik || null,
          tempatLahir: tempatLahir || null,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          jenisKelamin: jenisKelamin || 'Laki-laki',
          pasal: pasal || null,
          lamaHukuman: lamaHukuman || null,
          tanggalEksekusi: tanggalEksekusi ? new Date(tanggalEksekusi) : null,
          risiko: risiko || 'Rendah',
          currentRoomId: currentRoomId || null,
          catatan: catatan || null,
        },
        include: {
          currentRoom: true,
        },
      })

      if (currentRoomId) {
        await db.wBPBlockRoom.update({
          where: { id: currentRoomId },
          data: { currentOccupancy: { increment: 1 } },
        })
      }

      return NextResponse.json({ data: wbp }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/wbp] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat data WBP', 500)
    }
  },
)
