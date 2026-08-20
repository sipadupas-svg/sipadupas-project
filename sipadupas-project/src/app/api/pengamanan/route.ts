import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_PENGAMANAN_READ } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/pengamanan — Monitoring dashboard data (UF-06)
export const GET = authenticatedEndpoint(
  [PERM_PENGAMANAN_READ],
  async () => {
    try {
      const wbpAgg = await db.wBP.groupBy({
        by: ['status'],
        _count: { id: true },
      })

      const statusMap: Record<string, number> = {}
      for (const row of wbpAgg) {
        statusMap[row.status] = row._count.id
      }

      const totalWBP = wbpAgg.reduce((sum, r) => sum + r._count.id, 0)
      const diDalam = (statusMap['Aktif'] || 0) + (statusMap['Isolasi'] || 0)
      const rawatInap = statusMap['Rawat Inap'] || 0
      const kerjaLuar = statusMap['Kerja Luar'] || 0
      const isolasi = statusMap['Isolasi'] || 0

      const blokDistributionRaw = await db.$queryRaw<
        { roomId: string | null; blockName: string | null; roomNumber: string | null; count: bigint }[]
      >`
        SELECT r.id as "roomId", r."blockName", r."roomNumber", COUNT(w.id) as count
        FROM WBP w
        LEFT JOIN WBPBlockRoom r ON w."currentRoomId" = r.id
        WHERE w.status = 'Aktif'
        GROUP BY r.id, r."blockName", r."roomNumber"
        ORDER BY r."blockName", r."roomNumber"
      `
      const blokDistribution = blokDistributionRaw.map((r) => ({
        ...r,
        count: Number(r.count),
      }))

      const activeGangguan = await db.gangguan.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      })

      return NextResponse.json({
        data: {
          totalWBP,
          diDalam,
          rawatInap,
          kerjaLuar,
          isolasi,
          blokDistribution,
          activeGangguan,
        },
      })
    } catch (err) {
      console.error('[GET /api/pengamanan] Error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data monitoring pengamanan', 500)
    }
  },
)
