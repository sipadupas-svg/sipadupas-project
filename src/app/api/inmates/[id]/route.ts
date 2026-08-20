import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, hasRole } from '@/lib/auth'
import { success, error } from '@/lib/api-response'

// GET /api/inmates/:id — Get single WBP
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    if (auth instanceof NextResponse) return auth

    if (!hasRole(auth, ['SUPER_ADMIN', 'ADMIN_LAPAS', 'SECURITY_OFFICER', 'COACHING_OFFICER', 'MANAGEMENT'])) {
      return error('FORBIDDEN_ACCESS', 'Akses ditolak', 403)
    }

    const { id } = await params

    const wbp = await db.wBP.findUnique({
      where: { id },
      include: { currentRoom: true },
    })

    if (!wbp) {
      return error('NOT_FOUND', 'Data WBP tidak ditemukan', 404)
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

    return success(data, 'Data WBP berhasil diambil')
  } catch (err) {
    console.error('[GET /api/inmates/:id] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data WBP', 500)
  }
}
