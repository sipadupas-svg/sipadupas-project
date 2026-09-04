import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

async function main() {
  console.log('🌱 Seeding SIPADUPAS database (v2 — ERD-aligned)...')

  // ─── 1. ROLES ───────────────────────────────────────────
  console.log('  → Creating Roles...')
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: 'SUPER_ADMIN' },
      update: {},
      create: { code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Akses penuh ke seluruh sistem' },
    }),
    prisma.role.upsert({
      where: { code: 'ADMIN_LAPAS' },
      update: {},
      create: { code: 'ADMIN_LAPAS', name: 'Admin Lapas', description: 'Mengelola data operasional lapas' },
    }),
    prisma.role.upsert({
      where: { code: 'SECURITY_OFFICER' },
      update: {},
      create: { code: 'SECURITY_OFFICER', name: 'Petugas Keamanan', description: 'Mengelola pengamanan dan gangguan' },
    }),
    prisma.role.upsert({
      where: { code: 'COACHING_OFFICER' },
      update: {},
      create: { code: 'COACHING_OFFICER', name: 'Petugas Pembinaan', description: 'Mengelola program pembinaan WBP' },
    }),
    prisma.role.upsert({
      where: { code: 'MANAGEMENT' },
      update: {},
      create: { code: 'MANAGEMENT', name: 'Manajemen', description: 'Akses laporan dan dashboard' },
    }),
    prisma.role.upsert({
      where: { code: 'PUBLIC_USER' },
      update: {},
      create: { code: 'PUBLIC_USER', name: 'Pengguna Publik', description: 'Akses layanan publik' },
    }),
  ])

  // ─── 2. PERMISSIONS ─────────────────────────────────────
  console.log('  → Creating Permissions...')
  const permDefs = [
    // Dashboard and reporting permissions are used by the API guards.
    // Keep these codes aligned with src/lib/security/permissions.ts.
    { code: 'dashboard', name: 'Lihat Dashboard Pimpinan' },
    { code: 'laporan', name: 'Lihat Laporan' },
    { code: 'wbp:create', name: 'Tambah WBP' },
    { code: 'wbp:read', name: 'Lihat WBP' },
    { code: 'wbp:update', name: 'Edit WBP' },
    { code: 'wbp:delete', name: 'Hapus WBP' },
    { code: 'gangguan:create', name: 'Lapor Gangguan' },
    { code: 'gangguan:read', name: 'Lihat Gangguan' },
    { code: 'gangguan:update', name: 'Tangani Gangguan' },
    { code: 'kunjungan:create', name: 'Ajukan Kunjungan' },
    { code: 'kunjungan:read', name: 'Lihat Kunjungan' },
    { code: 'kunjungan:update', name: 'Kelola Kunjungan' },
    { code: 'kunjungan:approve', name: 'Setujui Kunjungan' },
    { code: 'kunjungan:checkin', name: 'Check-in Kunjungan' },
    { code: 'barang-titipan:create', name: 'Ajukan Barang Titipan' },
    { code: 'barang-titipan:read', name: 'Lihat Barang Titipan' },
    { code: 'barang-titipan:verify', name: 'Verifikasi Barang Titipan' },
    { code: 'barang-titipan:deliver', name: 'Serahkan Barang Titipan' },
    { code: 'barang-titipan:reject', name: 'Tolak Barang Titipan' },
    { code: 'pengaduan:create', name: 'Ajukan Pengaduan' },
    { code: 'pengaduan:read', name: 'Lihat Pengaduan' },
    { code: 'pengaduan:update', name: 'Tangani Pengaduan' },
    { code: 'admin:users', name: 'Kelola Pengguna' },
    { code: 'admin:roles', name: 'Kelola Roles' },
    { code: 'admin:audit', name: 'Lihat Audit Log' },
    { code: 'pembinaan:create', name: 'Buat Program Pembinaan' },
    { code: 'pembinaan:read', name: 'Lihat Pembinaan' },
    { code: 'pembinaan:update', name: 'Edit Pembinaan' },
  ]
  const permissions: Awaited<ReturnType<typeof prisma.permission.upsert>>[] = []
  for (const p of permDefs) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    })
    permissions.push(perm)
  }

  // ─── 3. ROLE-PERMISSIONS (SUPER_ADMIN gets all) ─────────
  console.log('  → Assigning Permissions to Roles...')
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles[0].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles[0].id, permissionId: perm.id },
    })
  }
  // ADMIN_LAPAS gets most permissions
  const adminPerms = permissions.filter(p => !p.code.startsWith('admin:'))
  for (const perm of adminPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles[1].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles[1].id, permissionId: perm.id },
    })
  }
  // SECURITY_OFFICER
  const secPerms = permissions.filter(p => ['wbp:read', 'gangguan:create', 'gangguan:read', 'gangguan:update', 'kunjungan:read', 'kunjungan:update', 'kunjungan:checkin', 'barang-titipan:read', 'barang-titipan:verify', 'barang-titipan:deliver', 'barang-titipan:reject'].includes(p.code))
  for (const perm of secPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles[2].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles[2].id, permissionId: perm.id },
    })
  }

  // COACHING_OFFICER
  const coachPerms = permissions.filter(p => ['wbp:read', 'pembinaan:create', 'pembinaan:read', 'pembinaan:update', 'kunjungan:read'].includes(p.code))
  for (const perm of coachPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles[3].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles[3].id, permissionId: perm.id },
    })
  }
  // MANAGEMENT
  const mgmtPerms = permissions.filter(p => ['dashboard', 'laporan', 'wbp:read', 'gangguan:read', 'kunjungan:read', 'pengaduan:read', 'pembinaan:read', 'pengamanan:read', 'barang-titipan:read'].includes(p.code))
  for (const perm of mgmtPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles[4].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles[4].id, permissionId: perm.id },
    })
  }
  // PUBLIC_USER
  const pubPerms = permissions.filter(p => ['kunjungan:create', 'kunjungan:read', 'pengaduan:create', 'pengaduan:read'].includes(p.code))
  for (const perm of pubPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roles[5].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roles[5].id, permissionId: perm.id },
    })
  }
  // ─── 4. DEFAULT SUPER_ADMIN USER ────────────────────────
  console.log('  → Creating default Super Admin...')
  const superAdmin = await prisma.user.upsert({
    where: { nip: 'admin' },
    update: {},
    create: {
      nip: 'admin',
      nama: 'Super Admin',
      email: 'admin@lapasbontang.go.id',
      password: await hashPassword('admin1234'),
      jabatan: 'Kepala Lapas',
      noHp: '081234567890',
      isActive: true,
    },
  })
  // Assign SUPER_ADMIN role via junction
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: roles[0].id } },
    update: {},
    create: { userId: superAdmin.id, roleId: roles[0].id },
  })

  // ─── 4b. OTHER ROLE USERS ─────────────────────────────
  console.log('  → Creating users for each role...')
  const otherUsers = [
    { nip: 'admin_lapas', nama: 'Admin Lapas', email: 'admin.lapas@lapasbontang.go.id', password: 'admin1234', jabatan: 'Petugas Administrasi', noHp: '081234567891', isActive: true, roleIdx: 1 },
    { nip: 'security', nama: 'Petugas Keamanan', email: 'security@lapasbontang.go.id', password: 'security1234', jabatan: 'Petugas Keamanan', noHp: '081234567892', isActive: true, roleIdx: 2 },
    { nip: 'coaching', nama: 'Petugas Pembinaan', email: 'coaching@lapasbontang.go.id', password: 'coaching1234', jabatan: 'Petugas Pembinaan', noHp: '081234567893', isActive: true, roleIdx: 3 },
    { nip: 'management', nama: 'Manajemen Lapas', email: 'management@lapasbontang.go.id', password: 'management1234', jabatan: 'Kepala Seksi', noHp: '081234567894', isActive: true, roleIdx: 4 },
    { nip: 'public', nama: 'Pengguna Publik', email: 'public@lapasbontang.go.id', password: 'public1234', jabatan: 'Masyarakat', noHp: '081234567895', isActive: true, roleIdx: 5 },
  ]
  for (const u of otherUsers) {
    const user = await prisma.user.upsert({
      where: { nip: u.nip },
      update: {},
      create: {
        nip: u.nip,
        nama: u.nama,
        email: u.email,
        password: await hashPassword(u.password),
        jabatan: u.jabatan,
        noHp: u.noHp,
        isActive: u.isActive,
      },
    })
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roles[u.roleIdx].id } },
      update: {},
      create: { userId: user.id, roleId: roles[u.roleIdx].id },
    })
  }

  // ─── 5. WBP BLOCK ROOMS (merged Blok + Kamar) ──────────
  console.log('  → Creating Block Rooms...')
  const blockRoomData = [
    { blockName: 'Blok A', roomNumber: 'Kamar A1', maxCapacity: 30 },
    { blockName: 'Blok A', roomNumber: 'Kamar A2', maxCapacity: 30 },
    { blockName: 'Blok A', roomNumber: 'Kamar A3', maxCapacity: 20 },
    { blockName: 'Blok B', roomNumber: 'Kamar B1', maxCapacity: 30 },
    { blockName: 'Blok B', roomNumber: 'Kamar B2', maxCapacity: 30 },
    { blockName: 'Blok B', roomNumber: 'Kamar B3', maxCapacity: 20 },
    { blockName: 'Blok C', roomNumber: 'Kamar C1', maxCapacity: 40 },
    { blockName: 'Blok C', roomNumber: 'Kamar C2', maxCapacity: 35 },
    { blockName: 'Blok D', roomNumber: 'Kamar D1', maxCapacity: 40 },
    { blockName: 'Blok D', roomNumber: 'Kamar D2', maxCapacity: 35 },
    { blockName: 'Blok E', roomNumber: 'Kamar E1', maxCapacity: 35 },
    { blockName: 'Blok E', roomNumber: 'Kamar E2', maxCapacity: 35 },
    { blockName: 'Blok F', roomNumber: 'Kamar F1', maxCapacity: 35 },
    { blockName: 'Blok F', roomNumber: 'Kamar F2', maxCapacity: 35 },
  ]
  const blockRooms: { id: string; blockName: string; roomNumber: string }[] = []
  for (const br of blockRoomData) {
    const room = await prisma.wBPBlockRoom.upsert({
      where: { blockName_roomNumber: { blockName: br.blockName, roomNumber: br.roomNumber } },
      update: { maxCapacity: br.maxCapacity },
      create: br,
    })
    blockRooms.push({ id: room.id, blockName: room.blockName, roomNumber: room.roomNumber })
  }

  // ─── 6. WBP (15 spread across rooms) ───────────────────
  console.log('  → Creating 15 WBP...')
  const wbpData = [
    { nomorRegister: 'WBP-2024-001', nama: 'Ahmad Suryadi', pasal: '338 KUHP', lamaHukuman: '8 Tahun', sentenceMonths: 96, risiko: 'Tinggi', status: 'Aktif', roomIdx: 0 },
    { nomorRegister: 'WBP-2024-002', nama: 'Budi Prasetyo', pasal: '362 KUHP', lamaHukuman: '2 Tahun', sentenceMonths: 24, risiko: 'Rendah', status: 'Aktif', roomIdx: 1 },
    { nomorRegister: 'WBP-2024-003', nama: 'Cahyo Wicaksono', pasal: '339 KUHP', lamaHukuman: '5 Tahun', sentenceMonths: 60, risiko: 'Sedang', status: 'Aktif', roomIdx: 2 },
    { nomorRegister: 'WBP-2024-004', nama: 'Deni Kurniawan', pasal: '351 KUHP', lamaHukuman: '3 Tahun', sentenceMonths: 36, risiko: 'Sedang', status: 'Aktif', roomIdx: 3 },
    { nomorRegister: 'WBP-2024-005', nama: 'Eko Prabowo', pasal: '363 KUHP', lamaHukuman: '1 Tahun 6 Bulan', sentenceMonths: 18, risiko: 'Rendah', status: 'Aktif', roomIdx: 4 },
    { nomorRegister: 'WBP-2024-006', nama: 'Fajar Nugroho', pasal: '340 KUHP', lamaHukuman: '10 Tahun', sentenceMonths: 120, risiko: 'Tinggi', status: 'Aktif', roomIdx: 5 },
    { nomorRegister: 'WBP-2024-007', nama: 'Gunawan Hidayat', pasal: '372 KUHP', lamaHukuman: '4 Tahun', sentenceMonths: 48, risiko: 'Sedang', status: 'Aktif', roomIdx: 6 },
    { nomorRegister: 'WBP-2024-008', nama: 'Hendra Saputra', pasal: '338 KUHP', lamaHukuman: '6 Tahun', sentenceMonths: 72, risiko: 'Tinggi', status: 'Rawat Inap', roomIdx: 8 },
    { nomorRegister: 'WBP-2024-009', nama: 'Irfan Maulana', pasal: '354 KUHP', lamaHukuman: '2 Tahun', sentenceMonths: 24, risiko: 'Rendah', status: 'Aktif', roomIdx: 9 },
    { nomorRegister: 'WBP-2024-010', nama: 'Joko Widodo Putra', pasal: '362 KUHP', lamaHukuman: '1 Tahun', sentenceMonths: 12, risiko: 'Rendah', status: 'Kerja Luar', roomIdx: 10 },
    { nomorRegister: 'WBP-2024-011', nama: 'Kurniawan Adi', pasal: '339 KUHP', lamaHukuman: '7 Tahun', sentenceMonths: 84, risiko: 'Tinggi', status: 'Aktif', roomIdx: 11 },
    { nomorRegister: 'WBP-2024-012', nama: 'Lukman Hakim', pasal: '373 KUHP', lamaHukuman: '3 Tahun', sentenceMonths: 36, risiko: 'Sedang', status: 'Aktif', roomIdx: 12 },
    { nomorRegister: 'WBP-2024-013', nama: 'Muhammad Rizki', pasal: '351 KUHP', lamaHukuman: '5 Tahun', sentenceMonths: 60, risiko: 'Sedang', status: 'Isolasi', roomIdx: 13 },
    { nomorRegister: 'WBP-2024-014', nama: 'Nur Hidayat', pasal: '338 KUHP', lamaHukuman: '12 Tahun', sentenceMonths: 144, risiko: 'Tinggi', status: 'Aktif', roomIdx: 0 },
    { nomorRegister: 'WBP-2024-015', nama: 'Oscar Pratama', pasal: '362 KUHP', lamaHukuman: '1 Tahun 6 Bulan', sentenceMonths: 18, risiko: 'Rendah', status: 'Bebas', roomIdx: 1 },
  ]

  const wbps: { id: string; nama: string; blockName: string; roomNumber: string; status: string }[] = []
  for (const w of wbpData) {
    const room = blockRooms[w.roomIdx] || blockRooms[0]
    const wbp = await prisma.wBP.upsert({
      where: { nomorRegister: w.nomorRegister },
      update: {},
      create: {
        nomorRegister: w.nomorRegister,
        nama: w.nama,
        tempatLahir: 'Samarinda',
        tanggalLahir: new Date('1990-01-15'),
        pasal: w.pasal,
        lamaHukuman: w.lamaHukuman,
        sentenceMonths: w.sentenceMonths,
        tanggalEksekusi: new Date('2024-01-10'),
        risiko: w.risiko,
        status: w.status,
        tanggalMasuk: new Date('2024-01-15'),
        currentRoomId: room.id,
      },
    })
    wbps.push({ id: wbp.id, nama: wbp.nama, blockName: room.blockName, roomNumber: room.roomNumber, status: wbp.status })
  }

  // Update currentOccupancy on block rooms
  // Simple approach: count WBP per room and update
  for (const br of blockRooms) {
    const count = wbpData.filter((w, i) => {
      const room = blockRooms[w.roomIdx]
      return room?.id === br.id && ['Aktif', 'Isolasi'].includes(w.status)
    }).length
    await prisma.wBPBlockRoom.update({
      where: { id: br.id },
      data: { currentOccupancy: count },
    })
  }

  // ─── 7. REGU PENGAMANAN (2) ────────────────────────────
  console.log('  → Creating Regu Pengamanan...')
  const getOrCreateRegu = async (nama: string) => {
    const existing = await prisma.reguPengamanan.findFirst({ where: { nama } })
    return existing ?? prisma.reguPengamanan.create({
      data: { nama, anggota: JSON.stringify([superAdmin.id]), status: 'Aktif' },
    })
  }
  const reguA = await getOrCreateRegu('Regu Alpha')
  const reguB = await getOrCreateRegu('Regu Bravo')

  // ─── 8. JADWAL REGU (3) ─────────────────────────────────
  console.log('  → Creating Jadwal Regu...')
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  await prisma.jadwalRegu.deleteMany({ where: { reguId: { in: [reguA.id, reguB.id] } } })
  await prisma.jadwalRegu.createMany({
    data: [
      { reguId: reguA.id, tanggal: yesterday, shift: 'Pagi', pos: 'Pos Utama', leaderUserId: superAdmin.id },
      { reguId: reguB.id, tanggal: today, shift: 'Siang', pos: 'Blok A', leaderUserId: superAdmin.id },
      { reguId: reguA.id, tanggal: tomorrow, shift: 'Malam', pos: 'Pos Utama', leaderUserId: superAdmin.id },
    ],
  })

  // ─── 9. KUNJUNGAN (5) ──────────────────────────────────
  console.log('  → Creating Kunjungan...')
  const kunjunganStatuses = ['Menunggu', 'Disetujui', 'Check-in', 'Selesai', 'Ditolak']
  await prisma.kunjungan.deleteMany({
    where: { kodeBooking: { in: ['KBJ-0001', 'KBJ-0002', 'KBJ-0003', 'KBJ-0004', 'KBJ-0005'] } },
  })
  const dummyUpload = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
  for (const [i, wbp] of wbps.slice(0, 5).entries()) {
    await prisma.kunjungan.create({
      data: {
        kodeBooking: `KBJ-${String(i + 1).padStart(4, '0')}`,
        namaPemohon: ['Siti Aminah', 'Budi Santoso', 'Rina Wati', 'Dewi Lestari', 'Agus Setiawan'][i],
        nikPemohon: `64710101010100${String(i + 1).padStart(2, '0')}`,
        noHp: `0812${String(34560000 + i)}`,
        alamat: 'Jl. Awang Long No. 1, Bontang',
        hubungan: ['Istri', 'Saudara', 'Anak', 'Istri', 'Teman'][i],
        wbpId: wbp.id,
        tanggal: today,
        sesi: i < 3 ? 'Sesi 1 Pagi' : 'Sesi 2 Siang',
        keperluan: i === 4 ? 'Kunjungan tidak disetujui karena dokumen tidak sesuai' : 'Kunjungan keluarga',
        jenisIdentitas: 'KTP',
        setujuPersyaratan: true,
        persetujuanAt: new Date(),
        status: kunjunganStatuses[i],
        checkedInAt: i >= 2 && i < 4 ? new Date() : null,
        selesaiAt: i === 3 ? new Date() : null,
        catatanPetugas: i === 4 ? 'Foto identitas tidak terbaca, silakan unggah ulang.' : i === 1 ? 'Data telah diverifikasi petugas.' : null,
        berkas: {
          create: [
            { jenis: 'IDENTITAS', namaFile: 'dummy-ktp.png', mimeType: 'image/png', ukuran: 1, data: dummyUpload },
            { jenis: 'SELFIE', namaFile: 'dummy-selfie.png', mimeType: 'image/png', ukuran: 1, data: dummyUpload },
          ],
        },
      },
    })
  }

  // ─── 9b. BARANG TITIPAN (4) with ITEMS ──────────────────
  console.log('  → Creating Barang Titipan...')
  await prisma.barangTitipan.deleteMany({
    where: { kodeTitipan: { in: ['TRP-2501-001', 'TRP-2501-002', 'TRP-2501-003', 'TRP-2501-004'] } },
  })
  const titipanData = [
    {
      kodeTitipan: 'TRP-2501-001', namaPengirim: 'Siti Aminah', nikPengirim: '6471010101010001', noHp: '081234567890',
      hubungan: 'Istri', wbpId: wbps[0].id, kategori: 'Pakaian', tanggalPenitipan: today, jamPenitipan: '09:15',
      status: 'Menunggu', catatanPengirim: 'Pakaian harian untuk WBP.',
      items: [{ namaBarang: 'Kaos', jumlah: 3, satuan: 'pcs', keterangan: 'Warna polos' }, { namaBarang: 'Celana panjang', jumlah: 2, satuan: 'pcs', keterangan: null }],
    },
    {
      kodeTitipan: 'TRP-2501-002', namaPengirim: 'Budi Santoso', nikPengirim: '6471010101010002', noHp: '081234567891',
      hubungan: 'Saudara', wbpId: wbps[1].id, kategori: 'Makanan', tanggalPenitipan: yesterday, jamPenitipan: '10:30',
      status: 'Diverifikasi', catatanPetugas: 'Seluruh item sesuai ketentuan.', verifiedById: superAdmin.id, verifiedAt: new Date(),
      items: [{ namaBarang: 'Biskuit', jumlah: 4, satuan: 'bungkus', keterangan: 'Kemasan tertutup' }],
    },
    {
      kodeTitipan: 'TRP-2501-003', namaPengirim: 'Rina Wati', nikPengirim: '6471010101010003', noHp: '081234567892',
      hubungan: 'Anak', wbpId: wbps[2].id, kategori: 'Kebutuhan Sehari-hari', tanggalPenitipan: yesterday, jamPenitipan: '13:00',
      status: 'Diterima', catatanPetugas: 'Barang telah diserahkan kepada WBP.', verifiedById: superAdmin.id, verifiedAt: new Date(Date.now() - 3600000), deliveredAt: new Date(),
      items: [{ namaBarang: 'Sabun mandi', jumlah: 2, satuan: 'pcs', keterangan: null }, { namaBarang: 'Pasta gigi', jumlah: 1, satuan: 'pcs', keterangan: null }],
    },
    {
      kodeTitipan: 'TRP-2501-004', namaPengirim: 'Dewi Lestari', nikPengirim: '6471010101010004', noHp: '081234567893',
      hubungan: 'Istri', wbpId: wbps[3].id, kategori: 'Obat-obatan', tanggalPenitipan: today, jamPenitipan: '08:45',
      status: 'Ditolak', alasanPenolakan: 'Obat wajib disertai surat dokter dan resep yang berlaku.', rejectedAt: new Date(),
      items: [{ namaBarang: 'Obat flu', jumlah: 1, satuan: 'kotak', status: 'Ditolak', alasanPenolakan: 'Dokumen pendukung tidak tersedia.' }],
    },
  ]
  for (const titipan of titipanData) {
    const { items, ...data } = titipan
    await prisma.barangTitipan.create({ data: { ...data, items: { create: items } } })
  }

  // ─── 10. PENGADUAN (3) ──────────────────────────────────
  console.log('  → Creating Pengaduan...')
  await prisma.pengaduan.deleteMany({
    where: { kodeTracking: { in: ['PGD-001', 'PGD-002', 'PGD-003'] } },
  })
  await prisma.pengaduan.createMany({
    data: [
      {
        kodeTracking: 'PGD-001',
        namaPelapor: 'Rudi Hartono',
        kontak: '081345678901',
        kategori: 'Pelayanan',
        subjek: 'Proses pengajuan PB lambat',
        isi: 'Sudah 2 minggu mengajukan PB namun belum ada kabar.',
        status: 'Baru',
      },
      {
        kodeTracking: 'PGD-002',
        namaPelapor: 'Dian Permata',
        kontak: '082345678901',
        kategori: 'Kunjungan',
        subjek: 'Jadwal kunjungan tidak sesuai',
        isi: 'Jadwal kunjungan yang diapprove berbeda dengan yang diajukan.',
        status: 'Diproses',
        ditanganiOleh: 'Admin Lapas',
        responderId: superAdmin.id,
      },
      {
        kodeTracking: 'PGD-003',
        namaPelapor: 'Andi Wijaya',
        kontak: '083345678901',
        kategori: 'Fasilitas',
        subjek: 'Fasilitas kamar perlu diperbaiki',
        isi: 'Atap kamar Blok C bocor saat hujan.',
        status: 'Selesai',
        ditanganiOleh: 'Admin Lapas',
        balasan: 'Atap sudah diperbaiki pada tanggal 15 Januari 2025.',
        selesaiAt: new Date('2025-01-15'),
        responderId: superAdmin.id,
      },
    ],
  })

  // ─── 11. GANGGUAN (2) ──────────────────────────────────
  console.log('  → Creating Gangguan...')
  await prisma.gangguan.deleteMany({
    where: { nomorInsiden: { in: ['INS-2025-001', 'INS-2025-002'] } },
  })
  await prisma.gangguan.createMany({
    data: [
      {
        nomorInsiden: 'INS-2025-001',
        tanggal: new Date(),
        blok: 'Blok A',
        kamar: 'Kamar A1',
        jenis: 'Perkelahian',
        tingkat: 'Sedang',
        kronologi: 'Dua WBP terlibat perkelahian di kamar karena masalah pribadi.',
        tindakanAwal: 'Petugas memisahkan kedua WBP dan memberikan perawatan.',
        wbpTerlibat: JSON.stringify([wbps[0].id, wbps[1].id]),
        status: 'IN_PROGRESS',
        reporterId: superAdmin.id,
      },
      {
        nomorInsiden: 'INS-2025-002',
        tanggal: new Date(),
        blok: 'Blok D',
        kamar: 'Kamar D1',
        jenis: 'Pengrusakan',
        tingkat: 'Rendah',
        kronologi: 'WBP merusak jendela kamar.',
        tindakanAwal: 'WBP ditegur dan jendela akan diperbaiki.',
        wbpTerlibat: JSON.stringify([wbps[7].id]),
        status: 'RESOLVED',
        resolvedAt: new Date(),
        reporterId: superAdmin.id,
        assignedToId: superAdmin.id,
      },
    ],
  })

  // ─── 12. PROGRAM PEMBINAAN (2) with Peserta ─────────────
  console.log('  → Creating Program Pembinaan...')
  await prisma.programPembinaan.deleteMany({
    where: { nama: { in: ['Pendidikan Paket B', 'Pelatihan Tata Boga'] } },
  })
  const prog1 = await prisma.programPembinaan.create({
    data: {
      nama: 'Pendidikan Paket B',
      kategori: 'Pendidikan',
      periode: '2025',
      pembina: 'Bapak Haris, S.Pd',
      jadwal: 'Senin - Jumat, 08:00 - 11:00',
      status: 'Berjalan',
    },
  })
  const prog2 = await prisma.programPembinaan.create({
    data: {
      nama: 'Pelatihan Tata Boga',
      kategori: 'Pelatihan Kerja',
      periode: '2025',
      pembina: 'Ibu Sri Wahyuni',
      jadwal: 'Selasa & Kamis, 13:00 - 15:00',
      status: 'Berjalan',
    },
  })

  const peserta1Ids = wbps.slice(0, 5).map(w => w.id)
  await prisma.pesertaPembinaan.createMany({
    data: peserta1Ids.map(wbpId => ({ programId: prog1.id, wbpId })),
  })
  const peserta2Ids = wbps.slice(3, 6).map(w => w.id)
  await prisma.pesertaPembinaan.createMany({
    data: peserta2Ids.map(wbpId => ({ programId: prog2.id, wbpId })),
  })

  await prisma.kehadiranPembinaan.createMany({
    data: [
      { programId: prog1.id, wbpId: peserta1Ids[0], tanggal: today, status: 'Hadir' },
      { programId: prog1.id, wbpId: peserta1Ids[1], tanggal: today, status: 'Hadir' },
      { programId: prog1.id, wbpId: peserta1Ids[2], tanggal: today, status: 'Hadir' },
      { programId: prog1.id, wbpId: peserta1Ids[3], tanggal: today, status: 'Tidak Hadir' },
      { programId: prog1.id, wbpId: peserta1Ids[4], tanggal: today, status: 'Izin' },
    ],
  })

  // ─── 13. SERAH TERIMA (2) ──────────────────────────────
  console.log('  → Creating Serah Terima...')
  await prisma.serahTerima.deleteMany({
    where: {
      reguId: { in: [reguA.id, reguB.id] },
      catatanKeamanan: { in: ['Semua kondisi aman, tidak ada kejadian.', '1 WBP di Blok A terlibat perkelahian, sedang ditangani.'] },
    },
  })
  await prisma.serahTerima.createMany({
    data: [
      {
        reguId: reguA.id,
        reguDariId: superAdmin.id,
        reguKeId: superAdmin.id,
        totalWBP: 15,
        wbpRawatInap: 1,
        wbpKerjaLuar: 1,
        catatanKeamanan: 'Semua kondisi aman, tidak ada kejadian.',
        status: 'CONFIRMED',
        confirmedAt: new Date(yesterday),
      },
      {
        reguId: reguB.id,
        reguDariId: superAdmin.id,
        reguKeId: superAdmin.id,
        totalWBP: 15,
        wbpRawatInap: 1,
        wbpKerjaLuar: 1,
        catatanKeamanan: '1 WBP di Blok A terlibat perkelahian, sedang ditangani.',
        catatanKejadian: 'Perkelahian di Kamar A1 antara Ahmad Suryadi dan Budi Prasetyo.',
        status: 'SUBMITTED',
      },
    ],
  })

  // ─── 14. WBP RAWAT INAP (1) ─────────────────────────────
  console.log('  → Creating WBP Rawat Inap...')
  const rawatInapWbp = wbps.find(w => w.status === 'Rawat Inap') || wbps[7]
  await prisma.wBPRawatInap.deleteMany({ where: { wbpId: rawatInapWbp.id, rumahSakit: 'RS Taman Husada Bontang' } })
  await prisma.wBPRawatInap.create({
    data: {
      wbpId: rawatInapWbp.id,
      rumahSakit: 'RS Taman Husada Bontang',
      tanggalKeluar: new Date(),
      petugasPendamping: 'Petugas Joko',
      status: 'AKTIF',
    },
  })

  // ─── 15. WBP KERJA LUAR (1) ─────────────────────────────
  console.log('  → Creating WBP Kerja Luar...')
  const kerjaLuarWbp = wbps.find(w => w.status === 'Kerja Luar') || wbps[9]
  await prisma.wBPKerjaLuar.deleteMany({ where: { wbpId: kerjaLuarWbp.id, kegiatan: 'Pemeliharaan Taman' } })
  await prisma.wBPKerjaLuar.create({
    data: {
      wbpId: kerjaLuarWbp.id,
      kegiatan: 'Pemeliharaan Taman',
      lokasi: 'Halaman Depan Lapas',
      jamKeluar: new Date(),
      estimasiKembali: new Date(Date.now() + 4 * 3600000),
      petugasPengawal: 'Petugas Agus',
      status: 'AKTIF',
    },
  })

  // ─── 16. NOTIFIKASI (3) ─────────────────────────────────
  console.log('  → Creating Notifikasi...')
  await prisma.notifikasi.deleteMany({
    where: { userId: superAdmin.id, judul: { in: ['Gangguan Keamanan Blok A', 'Kunjungan Baru', 'Pengaduan Selesai'] } },
  })
  await prisma.notifikasi.createMany({
    data: [
      { userId: superAdmin.id, judul: 'Gangguan Keamanan Blok A', isi: 'Perkelahian terdeteksi di Kamar A1. Segera tangani.', jenis: 'urgent' },
      { userId: superAdmin.id, judul: 'Kunjungan Baru', isi: 'Ada 3 kunjungan baru yang menunggu persetujuan.', jenis: 'info' },
      { userId: superAdmin.id, judul: 'Pengaduan Selesai', isi: 'Pengaduan PGD-003 telah diselesaikan.', jenis: 'info' },
    ],
  })

  // ─── 17. BERITA (3) ─────────────────────────────────────
  console.log('  → Creating Berita...')
  await prisma.berita.deleteMany({
    where: { slug: { in: ['pembinaan-tata-boga-2025', 'renovasi-blok-c', 'upacara-hut-ri'] } },
  })
  await prisma.berita.createMany({
    data: [
      {
        slug: 'pembinaan-tata-boga-2025',
        judul: 'Program Pembinaan Tata Boga Tahun 2025 Dimulai',
        ringkasan: 'Lapas Kelas IIA Bontang kembali menyelenggarakan program pembinaan tata boga bagi WBP.',
        isi: 'Program pembinaan tata boga tahun 2025 resmi dimulai pada bulan Januari. Program ini diikuti oleh 8 WBP yang antusias untuk mengembangkan keterampilan memasak.',
        kategori: 'Pembinaan',
        penulis: 'Humas Lapas Bontang',
        status: 'Terbit',
        publishedAt: new Date(),
      },
      {
        slug: 'renovasi-blok-c',
        judul: 'Renovasi Blok C Selesai Dilaksanakan',
        ringkasan: 'Renovasi Blok C telah selesai dan siap dihuni kembali.',
        isi: 'Setelah 3 bulan renovasi, Blok C kembali siap dihuni.',
        kategori: 'Fasilitas',
        penulis: 'Humas Lapas Bontang',
        status: 'Terbit',
        publishedAt: new Date(),
      },
      {
        slug: 'upacara-hut-ri',
        judul: 'Upacara Peringatan HUT RI ke-80',
        ringkasan: 'WBP dan petugas lapas mengikuti upacara peringatan HUT RI.',
        isi: 'Seluruh WBP dan petugas lapas mengikuti upacara bendera.',
        kategori: 'Kegiatan',
        penulis: 'Humas Lapas Bontang',
        status: 'Draft',
      },
    ],
  })

  // ─── 18. LAYANAN INFORMASI (3: PB, CB, CMB) ─────────────
  console.log('  → Creating Layanan Informasi...')
  await prisma.layananInformasi.deleteMany({
    where: { slug: { in: ['pembebasan-bersyarat-pb', 'cuti-bersyarat-cb', 'cuti-menjelang-bebas-cmb'] } },
  })
  await prisma.layananInformasi.createMany({
    data: [
      {
        slug: 'pembebasan-bersyarat-pb',
        nama: 'Pembebasan Bersyarat (PB)',
        kategori: 'PB',
        deskripsi: 'Pembebasan bersyarat adalah pemberian pembebasan kepada narapidana sebelum menjalani seluruh pidananya.',
        dasarHukum: 'PP No. 32 Tahun 2020, Permenkumham No. 3 Tahun 2018',
        persyaratan: JSON.stringify(['Telah menjalani sekurang-kurangnya 2/3 masa pidana', 'Berkelakuan baik selama menjalani pidana', 'Mengikuti program pembinaan', 'Memenuhi syarat integrasi masyarakat']),
        alur: '1. Pengajuan oleh WBP\n2. Verifikasi berkas oleh petugas\n3. Penelitian oleh Bapas\n4. Putusan Menteri',
        estimasiWaktu: '30-90 hari kerja',
        faq: JSON.stringify([{ q: 'Berapa lama proses PB?', a: 'Sekitar 30-90 hari kerja setelah berkas lengkap.' }, { q: 'Apakah bisa mengajukan PB jika belum 2/3 pidana?', a: 'Tidak, 2/3 masa pidana merupakan syarat wajib.' }]),
        status: 'Aktif',
      },
      {
        slug: 'cuti-bersyarat-cb',
        nama: 'Cuti Bersyarat (CB)',
        kategori: 'CB',
        deskripsi: 'Cuti bersyarat adalah pemberian cuti menjelang berakhirnya masa pidana.',
        dasarHukum: 'PP No. 32 Tahun 2020, Permenkumham No. 3 Tahun 2018',
        persyaratan: JSON.stringify(['Telah menjalani sekurang-kurangnya 2/3 masa pidana', 'Berkelakuan baik', 'Telah mengajukan PB sebelumnya']),
        alur: '1. Pengajuan CB setelah PB\n2. Verifikasi oleh petugas\n3. Persetujuan Kepala Lapas',
        estimasiWaktu: '14-30 hari kerja',
        faq: JSON.stringify([{ q: 'Berapa lama durasi cuti bersyarat?', a: 'Maksimal 3 bulan.' }]),
        status: 'Aktif',
      },
      {
        slug: 'cuti-menjelang-bebas-cmb',
        nama: 'Cuti Menjelang Bebas (CMB)',
        kategori: 'CMB',
        deskripsi: 'Cuti menjelang bebas diberikan kepada narapidana yang telah menjalani hampir seluruh masa pidananya.',
        dasarHukum: 'PP No. 32 Tahun 2020, Permenkumham No. 3 Tahun 2018',
        persyaratan: JSON.stringify(['Telah menjalani sekurang-kurangnya 2/3 masa pidana', 'Berkelakuan baik selama menjalani pidana', 'Telah mendapat PB dan CB']),
        alur: '1. Pengajuan CMB setelah CB\n2. Verifikasi berkas\n3. Persetujuan Direktorat Jenderal',
        estimasiWaktu: '14-30 hari kerja',
        faq: JSON.stringify([{ q: 'Berapa lama durasi CMB?', a: 'Maksimal 2 bulan.' }]),
        status: 'Aktif',
      },
    ],
  })

  // ─── 19. SKM RESPONSES (2) ─────────────────────────────
  console.log('  → Creating SKM Responses...')
  await prisma.sKMResponse.deleteMany({
    where: { nama: { in: ['Siti Aminah', 'Budi Santoso'] }, layanan: { in: ['Pembebasan Bersyarat', 'Kunjungan'] } },
  })
  await prisma.sKMResponse.createMany({
    data: [
      { nama: 'Siti Aminah', layanan: 'Pembebasan Bersyarat', nilai: 4.2, kritikSaran: 'Pelayanan sudah baik, namun informasi bisa lebih transparan.' },
      { nama: 'Budi Santoso', layanan: 'Kunjungan', nilai: 3.8, kritikSaran: 'Proses kunjungan cukup cepat, fasilitas ruang tunggu perlu diperbaiki.' },
    ],
  })

  // ─── 20. AUDIT LOG ENTRIES ──────────────────────────────
  console.log('  → Creating Audit Log entries...')
  await prisma.auditLog.deleteMany({
    where: { userId: superAdmin.id, ipAddress: '127.0.0.1', entityName: { in: ['auth', 'wbp', 'kunjungan', 'gangguan', 'pengaduan'] } },
  })
  await prisma.auditLog.createMany({
    data: [
      { userId: superAdmin.id, action: 'LOGIN', entityName: 'auth', detail: 'Super Admin login', ipAddress: '127.0.0.1' },
      { userId: superAdmin.id, action: 'CREATE', entityName: 'wbp', entityId: wbps[0].id, newValues: JSON.stringify({ nama: wbps[0].nama, nomorRegister: 'WBP-2024-001' }), detail: 'Menambahkan WBP baru: Ahmad Suryadi', ipAddress: '127.0.0.1' },
      { userId: superAdmin.id, action: 'CREATE', entityName: 'kunjungan', detail: 'Kunjungan baru diajukan', ipAddress: '127.0.0.1' },
      { userId: superAdmin.id, action: 'UPDATE', entityName: 'gangguan', detail: 'Status gangguan diubah menjadi IN_PROGRESS', ipAddress: '127.0.0.1' },
      { userId: superAdmin.id, action: 'CREATE', entityName: 'pengaduan', detail: 'Pengaduan baru diterima', ipAddress: '127.0.0.1' },
    ],
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
