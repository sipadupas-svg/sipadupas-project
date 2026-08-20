import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PENGAMANAN_READ, PERM_PENGAMANAN_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pengamanan/rawat-inap — List rawat inap with WBP relation (UF-09)
export const GET = authenticatedEndpoint(
  [PERM_PENGAMANAN_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || ''

      const where: Record<string, unknown> = {}
      if (status) where.status = status

      const list = await db.wBPRawatInap.findMany({
        where,
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true, currentRoom: { select: { blockName: true, roomNumber: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: list })
    } catch (err) {
      console.error('[GET /api/pengamanan/rawat-inap] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data rawat inap', 500)
    }
  },
)

// POST /api/pengamanan/rawat-inap — Create rawat inap, auto-update WBP status (UF-09)
export const POST = authenticatedEndpoint(
  [PERM_PENGAMANAN_CREATE],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { wbpId, rumahSakit, tanggalKeluar, petugasPendamping } = body

      if (!wbpId || !rumahSakit) {
        return error('BAD_REQUEST', 'wbpId dan rumahSakit wajib diisi', 400)
      }

      const wbp = await db.wBP.findUnique({
        where: { id: wbpId },
        select: { id: true, status: true },
      })

      if (!wbp) {
        return error('NOT_FOUND', 'WBP tidak ditemukan', 404)
      }

      const rawatInap = await db.wBPRawatInap.create({
        data: {
          wbpId,
          rumahSakit,
          tanggalKeluar: tanggalKeluar ? new Date(tanggalKeluar) : new Date(),
          petugasPendamping: petugasPendamping || null,
          status: 'AKTIF',
        },
        include: {
          wbp: { select: { id: true, nama: true, nomorRegister: true, currentRoom: { select: { blockName: true, roomNumber: true } } } },
        },
      })

      await db.wBP.update({
        where: { id: wbpId },
        data: { status: 'Rawat Inap' },
      })

      return NextResponse.json({ data: rawatInap }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pengamanan/rawat-inap] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat data rawat inap', 500)
    }
  },
)
