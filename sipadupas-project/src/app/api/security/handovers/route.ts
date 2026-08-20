import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, hasRole } from '@/lib/auth'
import { error, created } from '@/lib/api-response'

// POST /api/security/handovers — Create shift handover report (UF-05)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (auth instanceof Response) return auth
    if (!hasRole(auth, ['SUPER_ADMIN', 'SECURITY_OFFICER'])) {
      return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki akses untuk membuat laporan serah terima', 403)
    }

    const body = await request.json()
    const {
      incoming_leader_id,
      total_inmates_inside,
      total_inmates_hospital,
      total_inmates_work_outside,
      inventory_notes,
    } = body

    if (!incoming_leader_id) {
      return error('BAD_REQUEST', 'incoming_leader_id wajib diisi', 400)
    }

    // Find an active regu, or use the first available
    let regu = await db.reguPengamanan.findFirst({ where: { status: 'Aktif' } })
    if (!regu) {
      regu = await db.reguPengamanan.findFirst()
    }

    const serahTerima = await db.serahTerima.create({
      data: {
        reguId: regu?.id || '',
        reguDariId: auth.userId,
        reguKeId: incoming_leader_id,
        totalWBP: total_inmates_inside || 0,
        wbpRawatInap: total_inmates_hospital || 0,
        wbpKerjaLuar: total_inmates_work_outside || 0,
        catatanKeamanan: inventory_notes || null,
        status: 'SUBMITTED',
      },
      include: {
        regu: { select: { id: true, nama: true } },
        reguDari: { select: { id: true, nama: true, nip: true } },
        reguKe: { select: { id: true, nama: true, nip: true } },
      },
    })

    return created({
      id: serahTerima.id,
      incoming_leader_id: serahTerima.reguKeId,
      total_inmates_inside: serahTerima.totalWBP,
      total_inmates_hospital: serahTerima.wbpRawatInap,
      total_inmates_work_outside: serahTerima.wbpKerjaLuar,
      inventory_notes: serahTerima.catatanKeamanan,
      status: serahTerima.status,
      created_at: serahTerima.createdAt,
    }, 'Laporan serah terima berhasil dibuat')
  } catch (err) {
    console.error('[POST /api/security/handovers] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal membuat laporan serah terima', 500)
  }
}
