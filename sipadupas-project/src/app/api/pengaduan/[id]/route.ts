import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PENGADUAN_READ, PERM_PENGADUAN_RESPOND } from '@/lib/security/permissions'
import { success, error } from '@/lib/api-response'

// GET /api/pengaduan/[id] — Get single pengaduan (UF-13)
export const GET = authenticatedEndpoint(
  [PERM_PENGADUAN_READ],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!

    const pengaduan = await db.pengaduan.findUnique({
      where: { id },
    })

    if (!pengaduan) {
      return error('NOT_FOUND', 'Pengaduan tidak ditemukan', 404)
    }

    return success(pengaduan)
  },
)

// PUT /api/pengaduan/[id] — Update pengaduan with action support (UF-13)
export const PUT = authenticatedEndpoint(
  [PERM_PENGADUAN_RESPOND],
  async (request: NextRequest) => {
    const id = request.nextUrl.pathname.split('/').filter(Boolean).pop()!
    const body = await request.json()
    const { action, ditanganiOleh, balasan } = body as {
      action?: string
      ditanganiOleh?: string
      balasan?: string
      [key: string]: unknown
    }

    const existing = await db.pengaduan.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return error('NOT_FOUND', 'Pengaduan tidak ditemukan', 404)
    }

    const updateData: Record<string, unknown> = {}

    switch (action) {
      case 'verifikasi':
        updateData.status = 'Diverifikasi'
        break
      case 'proses':
        updateData.status = 'Diproses'
        updateData.ditanganiOleh = ditanganiOleh || null
        break
      case 'selesai':
        updateData.status = 'Selesai'
        updateData.selesaiAt = new Date()
        updateData.balasan = balasan || null
        break
      case 'tolak':
        updateData.status = 'Ditolak'
        break
      default:
        if (body.namaPelapor !== undefined)
          updateData.namaPelapor = body.namaPelapor || null
        if (body.kontak !== undefined)
          updateData.kontak = body.kontak || null
        if (body.kategori !== undefined) updateData.kategori = body.kategori
        if (body.subjek !== undefined) updateData.subjek = body.subjek
        if (body.isi !== undefined) updateData.isi = body.isi
        if (body.balasan !== undefined)
          updateData.balasan = body.balasan || null
        break
    }

    const pengaduan = await db.pengaduan.update({
      where: { id },
      data: updateData,
    })

    return success(pengaduan)
  },
)
