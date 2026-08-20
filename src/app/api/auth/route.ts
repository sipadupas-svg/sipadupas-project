import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nip, password } = body

    if (!nip || !password) {
      return NextResponse.json(
        { success: false, message: 'NIP dan Password wajib diisi' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { nip },
      include: { userRoles: { include: { role: true } } },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'NIP atau Password salah' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun Anda dinonaktifkan. Hubungi administrator.' },
        { status: 403 }
      )
    }

    // Plain text comparison for demo
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'NIP atau Password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log to AuditLog with new schema fields
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityName: 'user',
        entityId: user.id,
        detail: `Login berhasil: ${user.nama} (${user.nip})`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    })

    // Generate a simple demo token (cuid from user id + timestamp)
    const token = `${user.id}-${Date.now()}`

    // Derive role from first userRole
    const primaryRole = user.userRoles[0]?.role

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        nip: user.nip,
        email: user.email,
        role: primaryRole?.code || 'STAFF',
        roleLabel: primaryRole?.name || 'Staff',
        roleId: primaryRole?.id || null,
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
