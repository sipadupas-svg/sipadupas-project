import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, hasRole } from '@/lib/auth'
import { error, created } from '@/lib/api-response'

const TINGKAT_MAP: Record<string, string> = {
  HIGH: 'Tinggi',
  MEDIUM: 'Sedang',
  LOW: 'Rendah',
}

// POST /api/security/incidents — Report security incident (UF-07)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (auth instanceof Response) return auth
    if (!hasRole(auth, ['SUPER_ADMIN', 'SECURITY_OFFICER'])) {
      return error('FORBIDDEN_ACCESS', 'Anda tidak memiliki akses untuk melaporkan insiden', 403)
    }

    const body = await request.json()
    const {
      incident_type,
      severity_level,
      location_details,
      chronology,
      initial_action,
      block,
      room,
      involved_wbp_ids,
    } = body

    if (!incident_type) {
      return error('BAD_REQUEST', 'incident_type wajib diisi', 400)
    }

    // Auto-generate incident number: INS-YYYY-NNN
    const year = new Date().getFullYear()
    const countThisYear = await db.gangguan.count({
      where: {
        nomorInsiden: { startsWith: `INS-${year}-` },
      },
    })
    const nomorInsiden = `INS-${year}-${String(countThisYear + 1).padStart(3, '0')}`

    const gangguan = await db.gangguan.create({
      data: {
        nomorInsiden,
        tanggal: new Date(),
        blok: block || null,
        kamar: room || null,
        jenis: incident_type,
        tingkat: TINGKAT_MAP[severity_level] || 'Sedang',
        kronologi: chronology || null,
        tindakanAwal: initial_action || null,
        wbpTerlibat: involved_wbp_ids ? JSON.stringify(involved_wbp_ids) : null,
        reporterId: auth.userId,
        status: 'OPEN',
      },
      include: {
        reporter: { select: { id: true, nama: true, nip: true } },
      },
    })

    return created({
      id: gangguan.id,
      incident_number: gangguan.nomorInsiden,
      incident_type: gangguan.jenis,
      severity_level: gangguan.tingkat,
      location_details: gangguan.blok ? `${gangguan.blok}${gangguan.kamar ? ' - ' + gangguan.kamar : ''}` : null,
      chronology: gangguan.kronologi,
      initial_action: gangguan.tindakanAwal,
      status: gangguan.status,
      reported_by: gangguan.reporter?.nama || null,
      created_at: gangguan.createdAt,
    }, 'Laporan insiden berhasil dibuat')
  } catch (err) {
    console.error('[POST /api/security/incidents] Error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal membuat laporan insiden', 500)
  }
}
