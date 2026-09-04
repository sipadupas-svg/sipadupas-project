import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_DASHBOARD } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

export const GET = authenticatedEndpoint(
  [PERM_DASHBOARD],
  async () => {
    try {
      const totalWBP = await db.wBP.count({
        where: { status: { not: 'Bebas' } },
      })

      const kapasitasResult = await db.wBPBlockRoom.aggregate({
        _sum: { maxCapacity: true },
      })
      const kapasitas = kapasitasResult._sum.maxCapacity || 0

      const occupancyRate =
        kapasitas > 0 ? Math.round((totalWBP / kapasitas) * 10000) / 100 : 0

      const rawatInapCount = await db.wBP.count({
        where: { status: 'Rawat Inap' },
      })
      const kerjaLuarCount = await db.wBP.count({
        where: { status: 'Kerja Luar' },
      })
      const isolasiCount = await db.wBP.count({
        where: { status: 'Isolasi' },
      })

      const today = new Date().toISOString().split('T')[0]
      const kunjunganHariIni = await db.kunjungan.count({
        where: { tanggal: today },
      })

      const pengaduanAktif = await db.pengaduan.count({
        where: { status: { in: ['Baru', 'Diverifikasi', 'Diproses'] } },
      })

      const gangguanAktif = await db.gangguan.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      })

      const totalKehadiran = await db.kehadiranPembinaan.count()
      const kehadiranHadir = await db.kehadiranPembinaan.count({
        where: { status: 'Hadir' },
      })
      const kehadiranPembinaan =
        totalKehadiran > 0
          ? Math.round((kehadiranHadir / totalKehadiran) * 10000) / 100
          : 0

      const skmResult = await db.sKMResponse.aggregate({ _avg: { nilai: true } })
      // SKM responses are stored on a 1–5 scale, while the dashboard displays
      // the KPI as a percentage (0–100).
      const skmScore = skmResult._avg.nilai
        ? Math.round((skmResult._avg.nilai / 5) * 10000) / 100
        : 0

      const wbpPerRoom = await db.wBP.groupBy({
        by: ['currentRoomId'],
        _count: { id: true },
        where: { status: { not: 'Bebas' }, currentRoomId: { not: null } },
      })

      const allRooms = await db.wBPBlockRoom.findMany({
        select: { id: true, blockName: true, maxCapacity: true },
        orderBy: { blockName: 'asc' },
      })

      const roomMap = new Map(allRooms.map((r) => [r.id, r]))
      const blockAgg = new Map<string, { kapasitas: number; terisi: number }>()
      for (const room of allRooms) {
        const existing = blockAgg.get(room.blockName)
        if (existing) {
          existing.kapasitas += room.maxCapacity
        } else {
          blockAgg.set(room.blockName, { kapasitas: room.maxCapacity, terisi: 0 })
        }
      }
      for (const row of wbpPerRoom) {
        if (row.currentRoomId) {
          const room = roomMap.get(row.currentRoomId)
          if (room) {
            const agg = blockAgg.get(room.blockName)
            if (agg) agg.terisi += row._count.id
          }
        }
      }

      const distribusiBlok = Array.from(blockAgg.entries()).map(
        ([blok, agg]) => ({
          blok,
          kapasitas: agg.kapasitas,
          terisi: agg.terisi,
        }),
      )

      const statusWBP = await db.wBP.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { status: { not: 'Bebas' } },
      })
      const statusWBPArray = statusWBP.map((s) => ({
        status: s.status,
        total: s._count.id,
      }))

      return NextResponse.json({
        totalWBP,
        kapasitas,
        occupancyRate,
        rawatInapCount,
        kerjaLuarCount,
        isolasiCount,
        kunjunganHariIni,
        pengaduanAktif,
        gangguanAktif,
        kehadiranPembinaan,
        skmScore,
        distribusiBlok,
        statusWBP: statusWBPArray,
      })
    } catch (err) {
      console.error('Dashboard API error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data dashboard', 500)
    }
  },
)
