import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PEMBINAAN_READ, PERM_PEMBINAAN_UPDATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pembinaan/kehadiran — List kehadiran with filters
export const GET = authenticatedEndpoint(
  [PERM_PEMBINAAN_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const programId = searchParams.get('programId') || ''
      const tanggal = searchParams.get('tanggal') || ''

      const where: Record<string, unknown> = {}
      if (programId) where.programId = programId
      if (tanggal) where.tanggal = tanggal

      const list = await db.kehadiranPembinaan.findMany({
        where,
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true } },
          program: { select: { id: true, nama: true } },
        },
        orderBy: [{ tanggal: 'desc' }, { createdAt: 'desc' }],
      })

      return NextResponse.json({ data: list })
    } catch (err) {
      console.error('[GET /api/pembinaan/kehadiran] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data kehadiran', 500)
    }
  },
)

// POST /api/pembinaan/kehadiran — Record kehadiran (check uniqueness → 409)
export const POST = authenticatedEndpoint(
  [PERM_PEMBINAAN_UPDATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { programId, wbpId, tanggal, status, catatan } = body

      if (!programId || !wbpId || !tanggal) {
        return error('BAD_REQUEST', 'programId, wbpId, dan tanggal wajib diisi', 400)
      }

      const program = await db.programPembinaan.findUnique({
        where: { id: programId },
        select: { id: true },
      })

      if (!program) {
        return error('NOT_FOUND', 'Program pembinaan tidak ditemukan', 404)
      }

      const existing = await db.kehadiranPembinaan.findUnique({
        where: {
          programId_wbpId_tanggal: { programId, wbpId, tanggal },
        },
      })

      if (existing) {
        return error('CONFLICT', 'Kehadiran untuk WBP ini pada tanggal tersebut sudah tercatat', 409)
      }

      const kehadiran = await db.kehadiranPembinaan.create({
        data: {
          programId,
          wbpId,
          tanggal,
          status: status || 'Hadir',
          catatan: catatan || null,
        },
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true } },
          program: { select: { id: true, nama: true } },
        },
      })

      return NextResponse.json({ data: kehadiran }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pembinaan/kehadiran] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mencatat kehadiran', 500)
    }
  },
)