import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, hasRole } from '@/lib/auth'
import { success, created, error, parsePagination, buildMeta } from '@/lib/api-response'

// GET /api/inmates — List WBP with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (auth instanceof NextResponse) return auth

    if (!hasRole(auth, ['SUPER_ADMIN', 'ADMIN_LAPAS', 'SECURITY_OFFICER'])) {
      return error('FORBIDDEN_ACCESS', 'Akses ditolak', 403)
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = parsePagination(searchParams)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const blockId = searchParams.get('block_id') || ''

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

    if (blockId) {
      where.currentRoomId = blockId
    }

    const [total, inmates] = await Promise.all([
      db.wBP.count({ where }),
      db.wBP.findMany({
        where,
        include: { currentRoom: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    const data = inmates.map((w) => ({
      id: w.id,
      registration_number: w.nomorRegister,
      full_name: w.nama,
      status: w.status,
      room: w.currentRoom
        ? { block_name: w.currentRoom.blockName, room_number: w.currentRoom.roomNumber }
        : null,
    }))

    return success(data, 'Data WBP berhasil diambil', buildMeta(total, page, limit))
  } catch (err) {
    console.error('[GET /api/inmates] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data WBP', 500)
  }
}

// POST /api/inmates — Create new WBP
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (auth instanceof NextResponse) return auth

    if (!hasRole(auth, ['SUPER_ADMIN', 'ADMIN_LAPAS'])) {
      return error('FORBIDDEN_ACCESS', 'Akses ditolak', 403)
    }

    const body = await request.json()
    const { registration_number, nik, full_name, gender, current_room_id, crime_article, sentence_months } = body

    if (!registration_number || !full_name) {
      return error('BAD_REQUEST', 'registration_number dan full_name wajib diisi', 400)
    }

    // Check nomorRegister uniqueness
    const existing = await db.wBP.findUnique({ where: { nomorRegister: registration_number } })
    if (existing) {
      return error('CONFLICT', 'Nomor register sudah terdaftar', 409)
    }

    const wbp = await db.wBP.create({
      data: {
        nomorRegister: registration_number,
        nama: full_name,
        nik: nik || null,
        jenisKelamin: gender || 'Laki-laki',
        currentRoomId: current_room_id || null,
        pasal: crime_article || null,
        sentenceMonths: sentence_months ?? null,
      },
      include: { currentRoom: true },
    })

    // Increment room occupancy if room assigned
    if (current_room_id) {
      await db.wBPBlockRoom.update({
        where: { id: current_room_id },
        data: { currentOccupancy: { increment: 1 } },
      })
    }

    const data = {
      id: wbp.id,
      registration_number: wbp.nomorRegister,
      full_name: wbp.nama,
      nik: wbp.nik,
      gender: wbp.jenisKelamin,
      status: wbp.status,
      crime_article: wbp.pasal,
      sentence_months: wbp.sentenceMonths,
      room: wbp.currentRoom
        ? { block_name: wbp.currentRoom.blockName, room_number: wbp.currentRoom.roomNumber }
        : null,
    }

    return created(data, 'Data WBP berhasil dibuat')
  } catch (err) {
    console.error('[POST /api/inmates] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal membuat data WBP', 500)
  }
}
