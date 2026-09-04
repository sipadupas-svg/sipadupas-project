import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_GANGGUAN_READ, PERM_GANGGUAN_CREATE } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pengamanan/gangguan — List gangguan with filters (UF-07, UF-08)
export const GET = authenticatedEndpoint(
  [PERM_GANGGUAN_READ],
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || ''
      const jenis = searchParams.get('jenis') || ''
      const tingkat = searchParams.get('tingkat') || ''

      const where: Record<string, unknown> = {}

      if (status) where.status = status
      if (jenis) where.jenis = jenis
      if (tingkat) where.tingkat = tingkat

      const gangguanList = await db.gangguan.findMany({
        where,
        include: {
          reporter: { select: { id: true, nama: true, nip: true } },
          assignedTo: { select: { id: true, nama: true, nip: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ data: gangguanList })
    } catch (err) {
      console.error('[GET /api/pengamanan/gangguan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data gangguan', 500)
    }
  },
)

// POST /api/pengamanan/gangguan — Create gangguan (UF-07)
export const POST = authenticatedEndpoint(
  [PERM_GANGGUAN_CREATE],
  async (request: NextRequest, auth) => {
    try {
      const body = await request.json()
      const {
        nomorInsiden,
        tanggal,
        blok,
        kamar,
        jenis,
        tingkat,
        kronologi,
        tindakanAwal,
        wbpTerlibat,
      } = body

      if (!jenis) {
        return error('BAD_REQUEST', 'Jenis gangguan wajib diisi', 400)
      }

      const autoNomorInsiden = nomorInsiden || `INC-${Date.now()}`

      const gangguan = await db.gangguan.create({
        data: {
          nomorInsiden: autoNomorInsiden,
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          blok: blok || null,
          kamar: kamar || null,
          jenis,
          tingkat: tingkat || 'Sedang',
          kronologi: kronologi || null,
          tindakanAwal: tindakanAwal || null,
          wbpTerlibat: wbpTerlibat
            ? typeof wbpTerlibat === 'string'
              ? wbpTerlibat
              : JSON.stringify(wbpTerlibat)
            : null,
          // Reporter SELALU user yang login — cegah atribusi palsu via body
          reporterId: auth.userId,
          status: 'OPEN',
        },
        include: {
          reporter: { select: { id: true, nama: true, nip: true } },
          assignedTo: { select: { id: true, nama: true, nip: true } },
        },
      })

      return NextResponse.json({ data: gangguan }, { status: 201 })
    } catch (err) {
      console.error('[POST /api/pengamanan/gangguan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat laporan gangguan', 500)
    }
  },
)
