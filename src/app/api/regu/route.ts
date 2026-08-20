import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_REGU } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

export const GET = authenticatedEndpoint(
  [PERM_REGU],
  async () => {
    try {
      const regu = await db.reguPengamanan.findMany({
        orderBy: { nama: 'asc' },
      })

      return NextResponse.json({ data: regu })
    } catch (err) {
      console.error('Regu GET error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data regu', 500)
    }
  },
)

export const POST = authenticatedEndpoint(
  [PERM_REGU],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { nama, anggota } = body

      if (!nama) {
        return error('BAD_REQUEST', 'Nama regu wajib diisi', 400)
      }

      const regu = await db.reguPengamanan.create({
        data: {
          nama,
          anggota: anggota ? JSON.stringify(anggota) : null,
        },
      })

      return NextResponse.json({ data: regu }, { status: 201 })
    } catch (err) {
      console.error('Regu POST error:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat regu', 500)
    }
  },
)
