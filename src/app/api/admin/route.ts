import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_ADMIN_FULL } from '@/lib/security/permissions'
import { hashPassword } from '@/lib/auth'
import { error } from '@/lib/api-response'

// GET /api/admin — List all users with their role
export const GET = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async () => {
    try {
      const users = await db.user.findMany({
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const formattedUsers = users.map((user) => ({
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        email: user.email,
        jabatan: user.jabatan,
        noHp: user.noHp,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roleId: user.userRoles[0]?.roleId || null,
        role: user.userRoles[0]?.role.code || null,
        roleLabel: user.userRoles[0]?.role.name || null,
      }))

      return NextResponse.json({ success: true, data: formattedUsers })
    } catch (err) {
      console.error('Error fetching users:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data pengguna', 500)
    }
  },
)

// POST /api/admin — Create a new user
export const POST = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async (request: NextRequest, auth) => {
    try {
      const body = await request.json()
      const { nip, nama, email, password, roleId } = body

      if (!nip || !nama || !email || !password || !roleId) {
        return error('BAD_REQUEST', 'NIP, Nama, Email, Password, dan Role wajib diisi', 400)
      }

      const existingNip = await db.user.findUnique({ where: { nip } })
      if (existingNip) {
        return error('CONFLICT', 'NIP sudah terdaftar', 409)
      }

      const existingEmail = await db.user.findUnique({ where: { email } })
      if (existingEmail) {
        return error('CONFLICT', 'Email sudah terdaftar', 409)
      }

      const role = await db.role.findUnique({ where: { id: roleId } })
      if (!role) {
        return error('BAD_REQUEST', 'Role tidak ditemukan', 400)
      }

      const user = await db.user.create({
        data: {
          nip,
          nama,
          email,
          password: await hashPassword(password),
        },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      })

      await db.userRole.create({
        data: {
          userId: user.id,
          roleId,
        },
      })

      await db.auditLog.create({
        data: {
          userId: auth.userId,
          action: 'CREATE',
          entityName: 'user',
          entityId: user.id,
          newValues: JSON.stringify({ nip, nama, email, roleId }),
          detail: `Membuat pengguna baru: ${nama} (NIP: ${nip})`,
        },
      })

      const userWithRole = await db.user.findUnique({
        where: { id: user.id },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: userWithRole!.id,
          nip: userWithRole!.nip,
          nama: userWithRole!.nama,
          email: userWithRole!.email,
          isActive: userWithRole!.isActive,
          createdAt: userWithRole!.createdAt,
          roleId: userWithRole!.userRoles[0]?.roleId || null,
          role: userWithRole!.userRoles[0]?.role.code || null,
          roleLabel: userWithRole!.userRoles[0]?.role.name || null,
        },
      })
    } catch (err) {
      console.error('Error creating user:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat pengguna baru', 500)
    }
  },
)
