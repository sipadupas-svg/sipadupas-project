import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicEndpoint } from '@/lib/security/security-pipeline'
import { error } from '@/lib/api-response'

// GET /api/skm — Public: get SKM aggregate scores
export const GET = publicEndpoint(async () => {
  try {
    const totalResponses = await db.sKMResponse.count()

    const avgResult = await db.sKMResponse.aggregate({
      _avg: { nilai: true },
    })
    const avgScore = avgResult._avg.nilai ? Math.round(avgResult._avg.nilai * 100) / 100 : 0

    const perLayanan = await db.sKMResponse.groupBy({
      by: ['layanan'],
      _count: { id: true },
      _avg: { nilai: true },
    })

    const layananScores = perLayanan
      .filter((l) => l.layanan)
      .map((l) => ({
        layanan: l.layanan,
        total: l._count.id,
        avgNilai: l._avg.nilai ? Math.round(l._avg.nilai * 100) / 100 : 0,
      }))

    return NextResponse.json({
      avgScore,
      totalResponses,
      layananScores,
    })
  } catch (err) {
    console.error('SKM GET error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data SKM', 500)
  }
})

// POST /api/skm — Public: submit SKM response (rate limited)
export const POST = publicEndpoint(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { nama, layanan, nilai, kritikSaran } = body

    if (nilai === undefined || nilai === null) {
      return error('BAD_REQUEST', 'Nilai wajib diisi', 400)
    }

    if (nilai < 1 || nilai > 5) {
      return error('BAD_REQUEST', 'Nilai harus antara 1-5', 400)
    }

    const response = await db.sKMResponse.create({
      data: {
        nama: nama || null,
        layanan: layanan || null,
        nilai: parseFloat(nilai),
        kritikSaran: kritikSaran || null,
      },
    })

    return NextResponse.json({ data: response }, { status: 201 })
  } catch (err) {
    console.error('SKM POST error:', err)
    return error('INTERNAL_SERVER_ERROR', 'Gagal mengirim respons SKM', 500)
  }
})
