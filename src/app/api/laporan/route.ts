import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_LAPORAN } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

export const GET = authenticatedEndpoint(
  [PERM_LAPORAN],
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'wbp'

    try {
      switch (type) {
        case 'wbp': {
          const wbpByStatus = await db.wBP.groupBy({
            by: ['status'],
            _count: { id: true },
          })

          const wbpWithRoom = await db.wBP.findMany({
            where: { currentRoomId: { not: null } },
            select: { currentRoomId: true },
          })

          const roomIds = [...new Set(wbpWithRoom.map((w) => w.currentRoomId!))]
          const rooms = await db.wBPBlockRoom.findMany({
            where: { id: { in: roomIds } },
            select: { id: true, blockName: true },
          })
          const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r.blockName]))

          const blokCountMap: Record<string, number> = {}
          for (const w of wbpWithRoom) {
            const blockName = roomMap[w.currentRoomId!] || 'Tidak Ditentukan'
            blokCountMap[blockName] = (blokCountMap[blockName] || 0) + 1
          }
          const wbpBlokData = Object.entries(blokCountMap).map(([blok, total]) => ({
            blok,
            total,
          }))

          const allRooms = await db.wBPBlockRoom.findMany({
            select: { blockName: true, maxCapacity: true },
          })
          const capacityMap: Record<string, number> = {}
          for (const r of allRooms) {
            capacityMap[r.blockName] = (capacityMap[r.blockName] || 0) + r.maxCapacity
          }
          const capacityData = Object.entries(capacityMap).map(([blok, kapasitas]) => ({
            blok,
            kapasitas,
            terisi: blokCountMap[blok] || 0,
          }))

          const wbpByRisiko = await db.wBP.groupBy({
            by: ['risiko'],
            _count: { id: true },
          })

          return NextResponse.json({
            totalWBP: await db.wBP.count(),
            byStatus: wbpByStatus.map((s) => ({ status: s.status, total: s._count.id })),
            byBlok: wbpBlokData,
            capacity: capacityData,
            byRisiko: wbpByRisiko.map((r) => ({ risiko: r.risiko, total: r._count.id })),
          })
        }

        case 'kunjungan': {
          const startDate = searchParams.get('startDate')
          const endDate = searchParams.get('endDate')

          const where: Record<string, unknown> = {}
          if (startDate || endDate) {
            where.tanggal = {}
            if (startDate) (where.tanggal as Record<string, unknown>).gte = startDate
            if (endDate) (where.tanggal as Record<string, unknown>).lte = endDate
          }

          const kunjunganByStatus = await db.kunjungan.groupBy({
            by: ['status'],
            _count: { id: true },
            where,
          })

          const totalKunjungan = await db.kunjungan.count({ where })

          return NextResponse.json({
            total: totalKunjungan,
            byStatus: kunjunganByStatus.map((s) => ({ status: s.status, total: s._count.id })),
            dateRange: { startDate: startDate || null, endDate: endDate || null },
          })
        }

        case 'gangguan': {
          const gangguanByJenis = await db.gangguan.groupBy({
            by: ['jenis'],
            _count: { id: true },
          })

          const gangguanByTingkat = await db.gangguan.groupBy({
            by: ['tingkat'],
            _count: { id: true },
          })

          const gangguanByStatus = await db.gangguan.groupBy({
            by: ['status'],
            _count: { id: true },
          })

          const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()
          const yearEnd = new Date(new Date().getFullYear(), 11, 31).toISOString()
          const gangguanThisYear = await db.gangguan.findMany({
            where: { createdAt: { gte: new Date(yearStart), lte: new Date(yearEnd) } },
            select: { createdAt: true },
          })
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
          const perMonth: { bulan: string; total: number }[] = monthNames.map((m) => ({
            bulan: m,
            total: 0,
          }))
          for (const g of gangguanThisYear) {
            const month = g.createdAt.getMonth()
            perMonth[month].total++
          }

          return NextResponse.json({
            total: await db.gangguan.count(),
            byJenis: gangguanByJenis.map((g) => ({ jenis: g.jenis, total: g._count.id })),
            byTingkat: gangguanByTingkat.map((g) => ({ tingkat: g.tingkat, total: g._count.id })),
            byStatus: gangguanByStatus.map((g) => ({ status: g.status, total: g._count.id })),
            perMonth,
          })
        }

        case 'pembinaan': {
          const programs = await db.programPembinaan.findMany({
            include: {
              _count: { select: { peserta: true, kehadiran: true } },
            },
          })

          const programStats = await Promise.all(
            programs.map(async (p) => {
              const kehadiranHadir = await db.kehadiranPembinaan.count({
                where: { programId: p.id, status: 'Hadir' },
              })
              const totalKehadiran = await db.kehadiranPembinaan.count({
                where: { programId: p.id },
              })
              const kehadiranPercentage = totalKehadiran > 0 ? (kehadiranHadir / totalKehadiran) * 100 : 0

              return {
                id: p.id,
                nama: p.nama,
                kategori: p.kategori,
                status: p.status,
                pesertaCount: p._count.peserta,
                kehadiranPercentage: Math.round(kehadiranPercentage * 100) / 100,
              }
            })
          )

          return NextResponse.json({
            totalProgram: programs.length,
            programs: programStats,
          })
        }

        case 'pengaduan': {
          const pengaduanByKategori = await db.pengaduan.groupBy({
            by: ['kategori'],
            _count: { id: true },
          })

          const pengaduanByStatus = await db.pengaduan.groupBy({
            by: ['status'],
            _count: { id: true },
          })

          const selesaiPengaduan = await db.pengaduan.findMany({
            where: { status: 'Selesai', selesaiAt: { not: null } },
            select: { createdAt: true, selesaiAt: true },
          })
          let avgResolutionHours = 0
          if (selesaiPengaduan.length > 0) {
            const totalHours = selesaiPengaduan.reduce((sum, p) => {
              const diff = p.selesaiAt!.getTime() - p.createdAt.getTime()
              return sum + diff / (1000 * 60 * 60)
            }, 0)
            avgResolutionHours = Math.round((totalHours / selesaiPengaduan.length) * 100) / 100
          }

          return NextResponse.json({
            total: await db.pengaduan.count(),
            byKategori: pengaduanByKategori.map((p) => ({ kategori: p.kategori, total: p._count.id })),
            byStatus: pengaduanByStatus.map((p) => ({ status: p.status, total: p._count.id })),
            avgResolutionHours,
          })
        }

        default:
          return error('BAD_REQUEST', 'Tipe laporan tidak valid', 400)
      }
    } catch (err) {
      console.error('Laporan API error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data laporan', 500)
    }
  },
)
