import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PENGAMANAN_READ, PERM_PENGAMANAN_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pengamanan/kerja-luar — List kerja luar with WBP relation (UF-10)
export const GET = authenticatedEndpoint(
  [PERM_PENGAMANAN_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || ''

      const where: Record<string, unknown> = {}
      if (status) where.status = status

      const list = await db.wBPKerjaLuar.findMany({
        where,
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true, currentRoom: { select: { blockName: true, roomNumber: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: list })
    } catch (err) {
      console.error('[GET /api/pengamanan/kerja-luar] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data kerja luar', 500)
    }
  },
)

// POST /api/pengamanan/kerja-luar — Create kerja luar, auto-update WBP status (UF-10)
export const POST = authenticatedEndpoint(
  [PERM_PENGAMANAN_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { wbpId, kegiatan, lokasi, estimasiKembali, petugasPengawal } = body

      if (!wbpId || !kegiatan) {
        return error('BAD_REQUEST', 'wbpId dan kegiatan wajib diisi', 400)
      }

      const wbp = await db.wBP.findUnique({
        where: { id: wbpId },
        select: { id: true, status: true },
      })

      if (!wbp) {
        return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
      }

      const kerjaLuar = await db.wBPKerjaLuar.create({
        data: {
          wbpId,
          kegiatan,
          lokasi: lokasi || null,
          estimasiKembali: estimasiKembali ? new Date(estimasiKembali) : null,
          petugasPengawal: petugasPengawal || null,
          status: 'AKTIF',
        },
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true, currentRoom: { select: { blockName: true, roomNumber: true } } } },
        },
      })

      await db.wBP.update({
        where: { id: wbpId },
        data: { status: 'Kerja Luar' },
      })

      return NextResponse.json({ data: kerjaLuar }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pengamanan/kerja-luar] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat data kerja luar', 500)
    }
  },
)
