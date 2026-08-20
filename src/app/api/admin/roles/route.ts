import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticatedEndpoint } from '@/lib/security/security-pipeline'
import { PERM_ADMIN_FULL } from '@/lib/security/permissions'
import { error } from '@/lib/api-response'

// GET /api/admin/roles — List all roles with their permissions
export const GET = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async () => {
    try {
      const roles = await db.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoles: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      const formattedRoles = roles.map((role) => ({
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        userCount: role.userRoles.length,
        permissions: role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          code: rp.permission.code,
          name: rp.permission.name,
          description: rp.permission.description,
        })),
      }))

      return NextResponse.json({ success: true, data: formattedRoles })
    } catch (err) {
      console.error('Error fetching roles:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal mengambil data role', 500)
    }
  },
)

// POST /api/admin/roles — Create a new role (optional)
export const POST = authenticatedEndpoint(
  [PERM_ADMIN_FULL],
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      const { code, name, description, permissions } = body

      if (!code || !name) {
        return error('BAD_REQUEST', 'Code dan Name wajib diisi', 400)
      }

      const existingCode = await db.role.findUnique({ where: { code } })
      if (existingCode) {
        return error('CONFLICT', 'Code role sudah terdaftar', 409)
      }

      const role = await db.role.create({
        data: {
          code,
          name,
          description: description || null,
        },
      })

      if (Array.isArray(permissions) && permissions.length > 0) {
        for (const perm of permissions) {
          const { code: permCode, name: permName, description: permDesc } = perm

          let permission = await db.permission.findUnique({ where: { code: permCode } })
          if (!permission) {
            permission = await db.permission.create({
              data: {
                code: permCode,
                name: permName,
                description: permDesc || null,
              },
            })
          }

          await db.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id,
            },
          })
        }
      }

      const roleWithPerms = await db.role.findUnique({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
          userRoles: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: roleWithPerms!.id,
          code: roleWithPerms!.code,
          name: roleWithPerms!.name,
          description: roleWithPerms!.description,
          createdAt: roleWithPerms!.createdAt,
          updatedAt: roleWithPerms!.updatedAt,
          userCount: 0,
          permissions: roleWithPerms!.rolePermissions.map((rp) => ({
            id: rp.permission.id,
            code: rp.permission.code,
            name: rp.permission.name,
            description: rp.permission.description,
          })),
        },
      })
    } catch (err) {
      console.error('Error creating role:', err)
      return error('INTERNAL_SERVER_ERROR', 'Gagal membuat role baru', 500)
    }
  },
)
