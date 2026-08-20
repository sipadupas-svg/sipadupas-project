import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_KUNJUNGAN_READ, PERM_KUNJUNGAN_UPDATE } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// GET /api/kunjungan/[id] — Get single kunjungan with WBP (UF-12)
export const GET = authenticatedEndpoint(
  [PERM_KUNJUNGAN_READ],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

    const kunjungan = await db.kunjungan.findUnique({
      where: { id },
      include: {
        wbp: {
          select: {
            id: true,
            nama: true,
            nomorRegister: true,
            currentRoom: { select: { blockName: true, roomNumber: true } },
          },
        },
      },
    })

    if (!kunjungan) {
      return error('NOT_FOUND', 'Kunjungan tidak ditemukan', 404)
    }

    return success(kunjungan)
  },
)

// PUT /api/kunjungan/[id] — Update kunjungan with action support (UF-12)
export const PUT = authenticatedEndpoint(
  [PERM_KUNJUNGAN_UPDATE],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!
    const body = await request.json()
    const { action, catatanPetugas } = body as {
      action?: string
      catatanPetugas?: string
      [key: string]: unknown
    }

    const existing = await db.kunjungan.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return error('NOT_FOUND', 'Kunjungan tidak ditemukan', 404)
    }

    const updateData: Record<string, unknown> = {}

    switch (action) {
      case 'checkin':
        updateData.status = 'Check-in'
        updateData.checkedInAt = new Date()
        break
      case 'selesai':
        updateData.status = 'Selesai'
        updateData.selesaiAt = new Date()
        break
      case 'tolak':
        updateData.status = 'Ditolak'
        updateData.catatanPetugas = catatanPetugas || null
        break
      default:
        if (body.namaPemohon !== undefined)
          updateData.namaPemohon = body.namaPemohon
        if (body.nikPemohon !== undefined)
          updateData.nikPemohon = body.nikPemohon || null
        if (body.noHp !== undefined) updateData.noHp = body.noHp || null
        if (body.alamat !== undefined) updateData.alamat = body.alamat || null
        if (body.hubungan !== undefined) updateData.hubungan = body.hubungan
        if (body.tanggal !== undefined) updateData.tanggal = body.tanggal
        if (body.sesi !== undefined) updateData.sesi = body.sesi
        break
    }

    const kunjungan = await db.kunjungan.update({
      where: { id },
      data: updateData,
      include: {
        wbp: {
          select: {
            id: true,
            nama: true,
            nomorRegister: true,
            currentRoom: { select: { blockName: true, roomNumber: true } },
          },
        },
      },
    })

    return success(kunjungan)
  },
)
