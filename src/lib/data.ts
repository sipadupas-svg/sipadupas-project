// SIPADUPAS mock data layer
// All data is illustrative for Lapas Kelas IIA Bontang demonstration.

export type ViewKey =
  // Public Portal
  | "landing"
  | "berita"
  | "galeri"
  | "produk"
  | "tentang"
  | "skm"
  // Internal Portal
  | "dashboard"
  | "pengamanan"
  | "kunjungan"
  | "pengaduan"
  | "informasi"
  | "wbp"
  | "pembinaan"
  | "publikasi"
  | "laporan"
  | "notifikasi"
  | "keamanan"
  | "profil"
  | "barangTitipan"
  // Administration
  | "admin";

export type RoleKey =
  | "SUPER_ADMIN"
  | "ADMIN_LAPAS"
  | "SECURITY_OFFICER"
  | "COACHING_OFFICER"
  | "MANAGEMENT"
  | "PUBLIC_USER";

export interface RoleInfo {
  key: RoleKey;
  label: string;
  desc: string;
  modules: ViewKey[];
}

export interface WBP {
  id: string;
  nama: string;
  register: string;
  blok: string;
  kamar: string;
  status: "Aktif" | "Rawat Inap" | "Kerja Luar" | "Isolasi" | "Libas";
  kasus: string;
  sisaPidana: string;
  tanggalMasuk: string;
  risiko: "Rendah" | "Sedang" | "Tinggi";
  dokumen: number;
  aktivitas: number;
}

export interface Kunjungan {
  id: string;
  tiket: string;
  pemohon: string;
  hubungan: string;
  wbp: string;
  tanggal: string;
  sesi: string;
  status: "Menunggu" | "Disetujui" | "Check-in" | "Selesai" | "Ditolak";
  kuota: number;
}

export interface Pengaduan {
  id: string;
  kode: string;
  pelapor: string;
  kategori: string;
  subjek: string;
  tanggal: string;
  status: "Baru" | "Diproses" | "Selesai" | "Ditolak";
  prioritas: "Rendah" | "Sedang" | "Tinggi";
}

export interface Regu {
  id: string;
  nama: string;
  shift: "Pagi" | "Siang" | "Malam";
  jam: string;
  petugas: number;
  serahTerima: string;
  status: "Aktif" | "Off";
}

export interface Gangguan {
  id: string;
  tanggal: string;
  jenis: string;
  lokasi: string;
  deskripsi: string;
  status: "Baru" | "Ditangani" | "Selesai";
  pelapor: string;
}

export interface PembinaanProgram {
  id: string;
  nama: string;
  jenis: "Kemandirian" | "Keagamaan" | "Pendidikan" | "Kesehatan" | "Sosial";
  peserta: number;
  kehadiran: number;
  jadwal: string;
  status: "Berjalan" | "Selesai" | "Rencana";
  pembina: string;
}

export interface Publikasi {
  id: string;
  jenis: "Berita" | "Pengumuman" | "Galeri" | "Karya WBP";
  judul: string;
  tanggal: string;
  ringkas: string;
}

export interface AuditLog {
  id: string;
  waktu: string;
  user: string;
  aksi: string;
  modul: string;
  ip: string;
}

export interface UserInfo {
  nama: string;
  peran: "Pimpinan" | "Admin Lapas" | "Petugas Pengamanan" | "Petugas Pembinaan" | "Operator";
}

// ---------- Dashboard Stats ----------
export const dashboardStats = {
  totalWBP: 412,
  kapasitas: 450,
  rawatInap: 6,
  kerjaLuar: 18,
  isolasi: 2,
  kunjunganHariIni: 84,
  kuotaKunjungan: 120,
  pengaduanAktif: 11,
  pengaduanBaru: 4,
  gangguanBulan: 7,
  serahTerimaRegu: 3,
  kehadiranPembinaan: 92,
  skm: 88.4,
};

// trend data: kunjungan & WBP last 7 days
export const trendKunjungan = [
  { hari: "Sen", kunjungan: 76, wbp: 405 },
  { hari: "Sel", kunjungan: 82, wbp: 408 },
  { hari: "Rab", kunjungan: 91, wbp: 410 },
  { hari: "Kam", kunjungan: 88, wbp: 411 },
  { hari: "Jum", kunjungan: 95, wbp: 412 },
  { hari: "Sab", kunjungan: 64, wbp: 412 },
  { hari: "Min", kunjungan: 32, wbp: 412 },
];

export const distribusiBlok = [
  { blok: "Blok A", wbp: 102, kapasitas: 110 },
  { blok: "Blok B", wbp: 96, kapasitas: 100 },
  { blok: "Blok C", wbp: 88, kapasitas: 95 },
  { blok: "Blok D", wbp: 64, kapasitas: 75 },
  { blok: "Blok E", wbp: 42, kapasitas: 50 },
  { blok: "Blok F (Khusus)", wbp: 20, kapasitas: 20 },
];

export const statusWBP = [
  { name: "Aktif", value: 386, color: "var(--chart-1)" },
  { name: "Rawat Inap", value: 6, color: "var(--chart-2)" },
  { name: "Kerja Luar", value: 18, color: "var(--chart-3)" },
  { name: "Isolasi", value: 2, color: "var(--chart-4)" },
];

export const kategoriPengaduan = [
  { kategori: "Pelayanan", jumlah: 14 },
  { kategori: "Pengamanan", jumlah: 9 },
  { kategori: "Kunjungan", jumlah: 22 },
  { kategori: "Fasilitas", jumlah: 7 },
  { kategori: "WBP", jumlah: 5 },
  { kategori: "Lainnya", jumlah: 3 },
];

// ---------- Pengamanan ----------
export const dataWBP: WBP[] = [
  { id: "1", nama: "Ahmad Fauzi", register: "BTG-2023-001", blok: "A", kamar: "A-04", status: "Aktif", kasus: "Pidana Umum", sisaPidana: "1y 4m", tanggalMasuk: "12 Mar 2023", risiko: "Rendah", dokumen: 5, aktivitas: 28 },
  { id: "2", nama: "Budi Santoso", register: "BTG-2022-045", blok: "A", kamar: "A-08", status: "Aktif", kasus: "Narkotika", sisaPidana: "3y 2m", tanggalMasuk: "08 Jul 2022", risiko: "Sedang", dokumen: 7, aktivitas: 41 },
  { id: "3", nama: "Cecep Hidayat", register: "BTG-2021-112", blok: "B", kamar: "B-03", status: "Kerja Luar", kasus: "Pidana Umum", sisaPidana: "8m", tanggalMasuk: "21 Feb 2021", risiko: "Rendah", dokumen: 6, aktivitas: 65 },
  { id: "4", nama: "Dadang Suryana", register: "BTG-2023-098", blok: "B", kamar: "B-09", status: "Aktif", kasus: "Narkotika", sisaPidana: "2y 6m", tanggalMasuk: "03 Nov 2023", risiko: "Sedang", dokumen: 4, aktivitas: 22 },
  { id: "5", nama: "Eko Prasetyo", register: "BTG-2024-021", blok: "C", kamar: "C-02", status: "Rawat Inap", kasus: "Pidana Umum", sisaPidana: "1y 1m", tanggalMasuk: "18 Jan 2024", risiko: "Tinggi", dokumen: 3, aktivitas: 12 },
  { id: "6", nama: "Faisal Rahman", register: "BTG-2022-077", blok: "C", kamar: "C-07", status: "Aktif", kasus: "Narkotika", sisaPidana: "4y 3m", tanggalMasuk: "29 May 2022", risiko: "Tinggi", dokumen: 8, aktivitas: 38 },
  { id: "7", nama: "Gunawan Wibowo", register: "BTG-2023-066", blok: "D", kamar: "D-01", status: "Aktif", kasus: "Pidana Umum", sisaPidana: "10m", tanggalMasuk: "14 Aug 2023", risiko: "Rendah", dokumen: 4, aktivitas: 31 },
  { id: "8", nama: "Hendra Kusuma", register: "BTG-2024-033", blok: "D", kamar: "D-06", status: "Isolasi", kasus: "Narkotika", sisaPidana: "5y", tanggalMasuk: "27 Feb 2024", risiko: "Tinggi", dokumen: 2, aktivitas: 8 },
  { id: "9", nama: "Iwan Setiawan", register: "BTG-2021-088", blok: "E", kamar: "E-02", status: "Aktif", kasus: "Pidana Umum", sisaPidana: "6m", tanggalMasuk: "10 Apr 2021", risiko: "Rendah", dokumen: 9, aktivitas: 72 },
  { id: "10", nama: "Joko Hartono", register: "BTG-2022-102", blok: "E", kamar: "E-05", status: "Libas", kasus: "Pidana Umum", sisaPidana: "2m", tanggalMasuk: "03 Jun 2022", risiko: "Rendah", dokumen: 5, aktivitas: 45 },
];

export const dataRegu: Regu[] = [
  { id: "R1", nama: "Regu A — Garuda", shift: "Pagi", jam: "06.00 - 14.00", petugas: 8, serahTerima: "06.00 WITA", status: "Aktif" },
  { id: "R2", nama: "Regu B — Rajawali", shift: "Siang", jam: "14.00 - 22.00", petugas: 8, serahTerima: "14.00 WITA", status: "Off" },
  { id: "R3", nama: "Regu C — Elang", shift: "Malam", jam: "22.00 - 06.00", petugas: 6, serahTerima: "22.00 WITA", status: "Off" },
  { id: "R4", nama: "Regu D — Nusa", shift: "Pagi", jam: "06.00 - 14.00", petugas: 7, serahTerima: "06.00 WITA", status: "Off" },
];

export const dataGangguan: Gangguan[] = [
  { id: "G1", tanggal: "18 Agu 2026", jenis: "Perkelahian", lokasi: "Blok B — Halaman", deskripsi: "Ringan, sudah ditangani petugas jaga.", status: "Selesai", pelapor: "Regu A — Garuda" },
  { id: "G2", tanggal: "17 Agu 2026", jenis: "Pelanggaran Tata Tertib", lokasi: "Blok D — Kamar D-06", deskripsi: "Ditemukan alat terlarang saat razia.", status: "Ditangani", pelapor: "Regu B — Rajawali" },
  { id: "G3", tanggal: "17 Agu 2026", jenis: "Keluhan Kesehatan", lokasi: "Blok C — Kamar C-02", deskripsi: "WBP Eko Prasetyo dilaporkan demam, dirujuk ke klinik.", status: "Selesai", pelapor: "Regu A — Garuda" },
  { id: "G4", tanggal: "16 Agu 2026", jenis: "Upaya Kabur", lokasi: "Tembok Blok F", deskripsi: "Indikasi pelanggaran zona aman, ditangkapi petugas.", status: "Ditangani", pelapor: "Regu C — Elang" },
  { id: "G5", tanggal: "15 Agu 2026", jenis: "Benda Terlarang", lokasi: "Pos Pintu Masuk", deskripsi: "Pengunjung membawa HP berlebih saat kunjungan.", status: "Selesai", pelapor: "Regu D — Nusa" },
];

// ---------- Kunjungan ----------
export const dataKunjungan: Kunjungan[] = [
  { id: "K1", tiket: "SJY-240818-001", pemohon: "Siti Aminah", hubungan: "Istri", wbp: "Ahmad Fauzi (BTG-2023-001)", tanggal: "18 Agu 2026", sesi: "09.00 - 10.00", status: "Check-in", kuota: 3 },
  { id: "K2", tiket: "SJY-240818-002", pemohon: "Rina Marlina", hubungan: "Anak", wbp: "Budi Santoso (BTG-2022-045)", tanggal: "18 Agu 2026", sesi: "09.00 - 10.00", status: "Disetujui", kuota: 2 },
  { id: "K3", tiket: "SJY-240818-003", pemohon: "Tatang Sumarna", hubungan: "Saudara", wbp: "Cecep Hidayat (BTG-2021-112)", tanggal: "18 Agu 2026", sesi: "10.00 - 11.00", status: "Disetujui", kuota: 4 },
  { id: "K4", tiket: "SJY-240818-004", pemohon: "Nuraini", hubungan: "Istri", wbp: "Dadang Suryana (BTG-2023-098)", tanggal: "18 Agu 2026", sesi: "10.00 - 11.00", status: "Menunggu", kuota: 3 },
  { id: "K5", tiket: "SJY-240818-005", pemohon: "Wawan Setiadi", hubungan: "Saudara", wbp: "Faisal Rahman (BTG-2022-077)", tanggal: "18 Agu 2026", sesi: "11.00 - 12.00", status: "Check-in", kuota: 2 },
  { id: "K6", tiket: "SJY-240818-006", pemohon: "Lestari", hubungan: "Ibu", wbp: "Gunawan Wibowo (BTG-2023-066)", tanggal: "18 Agu 2026", sesi: "11.00 - 12.00", status: "Selesai", kuota: 3 },
  { id: "K7", tiket: "SJY-240818-007", pemohon: "Rudi Hartono", hubungan: "Saudara", wbp: "Iwan Setiawan (BTG-2021-088)", tanggal: "18 Agu 2026", sesi: "13.00 - 14.00", status: "Ditolak", kuota: 0 },
  { id: "K8", tiket: "SJY-240818-008", pemohon: "Maya Sari", hubungan: "Istri", wbp: "Joko Hartono (BTG-2022-102)", tanggal: "18 Agu 2026", sesi: "13.00 - 14.00", status: "Disetujui", kuota: 4 },
];

export const sesiKunjungan = [
  { sesi: "Sesi 1", jam: "09.00 - 10.00", kuota: 20, terpakai: 18 },
  { sesi: "Sesi 2", jam: "10.00 - 11.00", kuota: 20, terpakai: 16 },
  { sesi: "Sesi 3", jam: "11.00 - 12.00", kuota: 20, terpakai: 20 },
  { sesi: "Sesi 4", jam: "13.00 - 14.00", kuota: 20, terpakai: 12 },
  { sesi: "Sesi 5", jam: "14.00 - 15.00", kuota: 20, terpakai: 8 },
  { sesi: "Sesi 6", jam: "15.00 - 16.00", kuota: 20, terpakai: 10 },
];

// ---------- Pengaduan ----------
export const dataPengaduan: Pengaduan[] = [
  { id: "P1", kode: "PDG-2408-0017", pelapor: "Hartono (masyarakat)", kategori: "Pelayanan", subjek: "Antrian kunjungan terlalu lama", tanggal: "17 Agu 2026", status: "Diproses", prioritas: "Sedang" },
  { id: "P2", kode: "PDG-2408-0016", pelapor: "Yuli Astuti", kategori: "Kunjungan", subjek: "Booking online tidak diterima", tanggal: "17 Agu 2026", status: "Baru", prioritas: "Sedang" },
  { id: "P3", kode: "PDG-2408-0015", pelapor: "Warga Bontang Utara", kategori: "Fasilitas", subjek: "Akses jalan menuju Lapas rusak", tanggal: "16 Agu 2026", status: "Diproses", prioritas: "Tinggi" },
  { id: "P4", kode: "PDG-2408-0014", pelapor: "Rahmat Hidayat", kategori: "WBP", subjek: "Permintaan informasi kunjungan keluarga", tanggal: "16 Agu 2026", status: "Selesai", prioritas: "Rendah" },
  { id: "P5", kode: "PDG-2408-0013", pelapor: "Mulyadi", kategori: "Pengamanan", subjek: "Lampu penerangan germa mati", tanggal: "15 Agu 2026", status: "Selesai", prioritas: "Tinggi" },
  { id: "P6", kode: "PDG-2408-0012", pelapor: "Inem Juwita", kategori: "Pelayanan", subjek: "Petugas kurang responsif", tanggal: "14 Agu 2026", status: "Selesai", prioritas: "Sedang" },
  { id: "P7", kode: "PDG-2408-0011", pelapor: "Anonim", kategori: "Pengamanan", subjek: "Dugaan penyelundupan benda terlarang", tanggal: "13 Agu 2026", status: "Diproses", prioritas: "Tinggi" },
];

// ---------- Layanan Informasi ----------
export const layananInfoList = [
  {
    kode: "PB",
    nama: "Pembebasan Bersyarat (PB)",
    ringkas:
      "Pembebasan WBP sebelum menjalani seluruh masa pidana dengan syatan tertentu dan masa percobaan.",
    durasi: "Proses 14 - 30 hari kerja",
    biaya: "Gratis",
    dokumen: [
      "Surat permohonan WBP",
      "Salinan putusan pengadilan",
      "Surat keterangan sehat",
      "Daftar hadir pembinaan",
      "Risalah sidang pembebasan",
    ],
  },
  {
    kode: "CB",
    nama: "Cuti Bersyarat (CB)",
    ringkas:
      "Pemberian cuti kepada WBP yang memenuhi syarat untuk menjalani cuti di luar Lapas pada masa tertentu.",
    durasi: "Proses 14 - 21 hari kerja",
    biaya: "Gratis",
    dokumen: [
      "Surat permohonan cuti",
      "Surat keterangan sehat",
      "Risalah pemantauan perilaku",
      "Daftar kemajuan pembinaan",
      "Surat jaminan keluarga",
    ],
  },
  {
    kode: "CMB",
    nama: "Cuti Menghadap ke Bersalin (CMB)",
    ringkas:
      "Cuti khusus WBP perempuan untuk menjalani persalinan di luar Lapas dengan pendampingan petugas.",
    durasi: "Proses 7 - 14 hari kerja",
    biaya: "Gratis",
    dokumen: [
      "Surat keterangan hamil dari dokter",
      "Surat permohonan CMB",
      "Risalah tim pembinaan",
      "Kartu identitas WBP",
      "Surat jaminan keluarga",
    ],
  },
  {
    kode: "Remisi",
    nama: "Remisi Umum & Khusus",
    ringkas:
      "Pengurangan masa pidana bagi WBP yang berkelakuan baik dan memenuhi syarat administratif.",
    durasi: "Proses 21 - 30 hari kerja",
    biaya: "Gratis",
    dokumen: [
      "Daftar hadir pembinaan",
      "Risalah perilaku",
      "Surat keterangan sehat",
      "Catatan pelanggaran",
      "Rekomendasi kalapas",
    ],
  },
];

export const faqList = [
  {
    q: "Bagaimana cara melakukan booking kunjungan online?",
    a: "Masyarakat dapat melakukan booking kunjungan online melalui menu Pelayanan Kunjungan di SIPADUPAS. Pilih tanggal dan sesi yang tersedia, lalu lengkapi data pemohon. Tiket digital beserta QR Code akan diterbitkan setelah disetujui petugas.",
  },
  {
    q: "Apa saja persyaratan untuk mengajukan Pembebasan Bersyarat (PB)?",
    a: "WBP yang telah menjalani 2/3 masa pidana, berkelakuan baik, mengikuti program pembinaan, dan memenuhi syarat administratif dapat mengajukan PB. Detail dokumen terdapat pada menu Layanan Informasi.",
  },
  {
    q: "Berapa lama waktu penyelesaian pengaduan?",
    a: "Pengaduan dengan prioritas tinggi ditangani maksimal 1x24 jam. Prioritas sedang 3x24 jam, dan prioritas rendah 5x24 kerja. Status pengaduan dapat dilacak melalui kode tracking.",
  },
  {
    q: "Apakah ada biaya untuk layanan di Lapas Bontang?",
    a: "Seluruh layanan publik di Lapas Kelas IIA Bontang — booking kunjungan, PB, CB, CMB, remisi, dan pengaduan — tidak dipungut biaya. Hindari oknum yang meminta imbalan.",
  },
  {
    q: "Bagaimana cara melacak status pengaduan?",
    a: "Setiap pengaduan yang masuk akan otomatis mendapatkan kode tracking dengan format PDG-YYMM-XXXX. Kode tersebut dapat dimasukkan pada menu Lacak Pengaduan di SIPADUPAS.",
  },
];

// ---------- Pembinaan ----------
export const dataPembinaan: PembinaanProgram[] = [
  { id: "B1", nama: "Pelatihan Menjahit", jenis: "Kemandirian", peserta: 18, kehadiran: 16, jadwal: "Senin & Rabu, 09.00 - 11.00", status: "Berjalan", pembina: "Pak Hadi" },
  { id: "B2", nama: "Tahsin Al-Quran", jenis: "Keagamaan", peserta: 24, kehadiran: 22, jadwal: "Selasa & Kamis, 14.00 - 15.30", status: "Berjalan", pembina: "Ustadz Yusuf" },
  { id: "B3", nama: "Kejar Paket B", jenis: "Pendidikan", peserta: 12, kehadiran: 11, jadwal: "Sabtu, 09.00 - 12.00", status: "Berjalan", pembina: "Ibu Wati" },
  { id: "B4", nama: "Bengkel Sepeda Motor", jenis: "Kemandirian", peserta: 15, kehadiran: 14, jadwal: "Senin - Jumat, 13.00 - 16.00", status: "Berjalan", pembina: "Pak Rizal" },
  { id: "B5", nama: "Klinik Konseling Adiksi", jenis: "Kesehatan", peserta: 20, kehadiran: 17, jadwal: "Rabu, 10.00 - 12.00", status: "Berjalan", pembina: "Psikolog Vera" },
  { id: "B6", nama: "Pelatihan Pertanian Urban", jenis: "Kemandirian", peserta: 10, kehadiran: 10, jadwal: "Jumat, 08.00 - 10.00", status: "Rencana", pembina: "Pak Surya" },
];

// ---------- Publikasi ----------
export const dataPublikasi: Publikasi[] = [
  { id: "PU1", jenis: "Berita", judul: "Lapas Bontang Gelar Upacara HUT Kemerdekaan ke-81", tanggal: "17 Agu 2026", ringkas: "Seluruh WBP, petugas, dan tamu mengikuti upacara bendera di lapang utama." },
  { id: "PU2", jenis: "Berita", judul: "Pelatihan Menjahit Luluskan 18 WBP Angkatan ke-5", tanggal: "12 Agu 2026", ringkas: "WBP dinyatakan lulus dan siap mandiri setelah bebas." },
  { id: "PU3", jenis: "Pengumuman", judul: "Jadwal Kunjungan Hari Raya Idul Adha 1447 H", tanggal: "10 Agu 2026", ringkas: "Penambahan kuota kunjungan khusus hari raya dengan tetap menerapkan protokol keamanan." },
  { id: "PU4", jenis: "Galeri", judul: "Kegiatan Donor Darah WBP & Petugas", tanggal: "05 Agu 2026", ringkas: "UTPM bekerja sama dengan PMI Bontang menyelenggarakan donor darah." },
  { id: "PU5", jenis: "Karya WBP", judul: "Produk Tas & Dompet Hasil Pelatihan Menjahit", tanggal: "01 Agu 2026", ringkas: "Kerajinan tangan WBP dari program pembinaan kemandirian." },
  { id: "PU6", jenis: "Pengumuman", judul: "Pemberitahuan Pendaftaran Remisi Umum 2026", tanggal: "28 Jul 2026", ringkas: "WBP yang memenuhi syarat dapat mendaftarkan diri melalui subbagian Pembinaan." },
];

// ---------- Audit Log ----------
export const dataAudit: AuditLog[] = [
  { id: "A1", waktu: "18 Agu 2026 08:14", user: "Kalapas", aksi: "Approval serah terima regu A → B", modul: "Pengamanan", ip: "10.10.2.14" },
  { id: "A2", waktu: "18 Agu 2026 08:09", user: "Operator Kunjungan", aksi: "Tiket SJY-240818-001 check-in", modul: "Kunjungan", ip: "10.10.2.27" },
  { id: "A3", waktu: "18 Agu 2026 07:55", user: "Petugas Pengamanan", aksi: "Tambah data gangguan G1", modul: "Pengamanan", ip: "10.10.2.31" },
  { id: "A4", waktu: "17 Agu 2026 22:10", user: "Kasi Pembinaan", aksi: "Update kehadiran B5", modul: "Pembinaan", ip: "10.10.2.18" },
  { id: "A5", waktu: "17 Agu 2026 19:48", user: "Admin Lapas", aksi: "Reset password user: petugas.d", modul: "Admin", ip: "10.10.2.10" },
  { id: "A6", waktu: "17 Agu 2026 16:33", user: "Operator", aksi: "Tanggapi pengaduan PDG-2408-0017", modul: "Pengaduan", ip: "10.10.2.27" },
];

export const dataUser = [
  { id: "U1", nama: "Bpk. H. Sutrisno", peran: "Pimpinan", email: "kalapas@lapasbontang.go.id", status: "Aktif", terakhirLogin: "18 Agu 2026 08:00" },
  { id: "U2", nama: "Bpk. Andi Wijaya", peran: "Admin Lapas", email: "admin@lapasbontang.go.id", status: "Aktif", terakhirLogin: "18 Agu 2026 07:45" },
  { id: "U3", nama: "Bpk. Dedi Kurnia", peran: "Petugas Pengamanan", email: "pengamanan@lapasbontang.go.id", status: "Aktif", terakhirLogin: "18 Agu 2026 06:00" },
  { id: "U4", nama: "Ibu Vera Lestari", peran: "Petugas Pembinaan", email: "pembinaan@lapasbontang.go.id", status: "Aktif", terakhirLogin: "17 Agu 2026 16:30" },
  { id: "U5", nama: "Bpk. Rudi Hartono", peran: "Operator", email: "operator@lapasbontang.go.id", status: "Aktif", terakhirLogin: "18 Agu 2026 07:50" },
  { id: "U6", nama: "Bpk. Joko Susilo", peran: "Petugas Pengamanan", email: "joko.s@lapasbontang.go.id", status: "Nonaktif", terakhirLogin: "10 Agu 2026 09:00" },
];

export const userInfo: UserInfo = {
  nama: "Bpk. Andi Wijaya",
  peran: "Admin Lapas",
};

// ---------- Format helpers ----------
export function formatTanggal(tanggal: string) {
  return tanggal;
}

export function persentase(used: number, total: number) {
  if (!total) return 0;
  return Math.round((used / total) * 100);
}

// ---------- Role Definitions (per sitemap §47) ----------
const PUBLIC_NAV: ViewKey[] = ["landing", "berita", "galeri", "produk", "tentang", "skm", "barangTitipan", "kunjungan", "pengaduan"];
const ALL_INTERNAL: ViewKey[] = ["dashboard", "wbp", "pengamanan", "kunjungan", "pembinaan", "pengaduan", "informasi", "publikasi", "laporan", "notifikasi", "keamanan", "profil", "barangTitipan"];
const ADMIN_MODULES: ViewKey[] = ["admin"];

export const roleList: RoleInfo[] = [
  {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    desc: "Akses penuh seluruh modul termasuk Administration.",
    modules: [...ALL_INTERNAL, ...ADMIN_MODULES],
  },
  {
    key: "ADMIN_LAPAS",
    label: "Admin Lapas",
    desc: "Pengelolaan operasional tanpa akses Administration penuh.",
    modules: ALL_INTERNAL,
  },
  {
    key: "SECURITY_OFFICER",
    label: "Petugas Pengamanan",
    desc: "Fokus pada modul pengamanan, WBP, kunjungan, dan laporan pengamanan.",
    modules: ["dashboard", "wbp", "pengamanan", "kunjungan", "laporan", "notifikasi", "keamanan", "profil"],
  },
  {
    key: "COACHING_OFFICER",
    label: "Petugas Pembinaan",
    desc: "Fokus pada modul pembinaan, WBP, galeri, dan laporan pembinaan.",
    modules: ["dashboard", "wbp", "pembinaan", "publikasi", "laporan", "notifikasi", "profil"],
  },
  {
    key: "MANAGEMENT",
    label: "Pimpinan",
    desc: "Akses dashboard, monitoring, laporan, dan approval.",
    modules: ["dashboard", "laporan", "pengamanan", "notifikasi", "profil"],
  },
  {
    key: "PUBLIC_USER",
    label: "Masyarakat",
    desc: "Akses layanan publik tanpa login (beranda, kunjungan, layanan, pengaduan, berita, galeri, produk, SKM).",
    modules: PUBLIC_NAV,
  },
];

// ---------- Master Blok & Kamar (§15) ----------
export interface MasterBlok {
  id: string;
  nama: string;
  kapasitas: number;
  terisi: number;
  jumlahKamar: number;
  status: "Aktif" | "Renovasi" | "Khusus";
  penanggungJawab: string;
}

export interface MasterKamar {
  id: string;
  blok: string;
  nama: string;
  kapasitas: number;
  terisi: number;
  status: "Aktif" | "Kosong" | "Renovasi";
}

export const dataMasterBlok: MasterBlok[] = [
  { id: "B1", nama: "Blok A", kapasitas: 110, terisi: 102, jumlahKamar: 22, status: "Aktif", penanggungJawab: "Serka Andi" },
  { id: "B2", nama: "Blok B", kapasitas: 100, terisi: 96, jumlahKamar: 20, status: "Aktif", penanggungJawab: "Serka Budi" },
  { id: "B3", nama: "Blok C", kapasitas: 95, terisi: 88, jumlahKamar: 19, status: "Aktif", penanggungJawab: "Serka Cecep" },
  { id: "B4", nama: "Blok D", kapasitas: 75, terisi: 64, jumlahKamar: 15, status: "Renovasi", penanggungJawab: "Serka Dadang" },
  { id: "B5", nama: "Blok E", kapasitas: 50, terisi: 42, jumlahKamar: 10, status: "Aktif", penanggungJawab: "Serka Eko" },
  { id: "B6", nama: "Blok F (Khusus)", kapasitas: 20, terisi: 20, jumlahKamar: 5, status: "Khusus", penanggungJawab: "Serka Faisal" },
];

export const dataMasterKamar: MasterKamar[] = [
  { id: "K1", blok: "A", nama: "A-01", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K2", blok: "A", nama: "A-02", kapasitas: 5, terisi: 4, status: "Aktif" },
  { id: "K3", blok: "A", nama: "A-03", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K4", blok: "A", nama: "A-04", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K5", blok: "B", nama: "B-01", kapasitas: 5, terisi: 4, status: "Aktif" },
  { id: "K6", blok: "B", nama: "B-03", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K7", blok: "B", nama: "B-09", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K8", blok: "C", nama: "C-02", kapasitas: 5, terisi: 1, status: "Renovasi" },
  { id: "K9", blok: "C", nama: "C-07", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K10", blok: "D", nama: "D-01", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K11", blok: "D", nama: "D-06", kapasitas: 5, terisi: 1, status: "Renovasi" },
  { id: "K12", blok: "E", nama: "E-02", kapasitas: 5, terisi: 5, status: "Aktif" },
  { id: "K13", blok: "E", nama: "E-05", kapasitas: 5, terisi: 0, status: "Kosong" },
  { id: "K14", blok: "F", nama: "F-01", kapasitas: 4, terisi: 4, status: "Aktif" },
];

// ---------- Serah Terima Regu (§19) ----------
export interface SerahTerima {
  id: string;
  tanggal: string;
  reguSebelum: string;
  reguPenerima: string;
  waktu: string;
  status: "DRAFT" | "SUBMITTED" | "CONFIRMED";
  kondisiWBP: string;
  kondisiBlok: string;
  kejadian: string;
  catatan: string;
  petugas: string;
}

export const dataSerahTerima: SerahTerima[] = [
  {
    id: "ST1",
    tanggal: "18 Agu 2026",
    reguSebelum: "Regu C — Elang (Malam)",
    reguPenerima: "Regu A — Garuda (Pagi)",
    waktu: "06.00 WITA",
    status: "CONFIRMED",
    kondisiWBP: "410 WBP aman, 2 isolasi, 1 rawat inap",
    kondisiBlok: "Seluruh blok terkunci, tidak ada anomali",
    kejadian: "Tidak ada gangguan signifikan",
    catatan: "Serah terima lancar, gerbang utama tertutup rapat.",
    petugas: "Serka Andi → Serka Budi",
  },
  {
    id: "ST2",
    tanggal: "18 Agu 2026",
    reguSebelum: "Regu A — Garuda (Pagi)",
    reguPenerima: "Regu B — Rajawali (Siang)",
    waktu: "14.00 WITA",
    status: "SUBMITTED",
    kondisiWBP: "412 WBP aman, 4 kunjungan aktif",
    kondisiBlok: "Blok D kamar D-06 dalam isolasi",
    kejadian: "Ditemukan alat terlarang saat razia di Blok D-06",
    catatan: "WBP Hendra Kusuma diisolasi, menunggu pemeriksaan.",
    petugas: "Serka Budi → Serka Cecep",
  },
  {
    id: "ST3",
    tanggal: "17 Agu 2026",
    reguSebelum: "Regu B — Rajawali (Siang)",
    reguPenerima: "Regu C — Elang (Malam)",
    waktu: "22.00 WITA",
    status: "CONFIRMED",
    kondisiWBP: "412 WBP aman, semua terkunci di kamar",
    kondisiBlok: "Seluruh blok aman, lampu penerangan normal",
    kejadian: "Tidak ada",
    catatan: "Malam berjalan tenang, tidak ada pelanggaran.",
    petugas: "Serka Cecep → Serka Dadang",
  },
];

// ---------- WBP Rawat Inap (§21) ----------
export interface WBPRawatInap {
  id: string;
  wbp: string;
  register: string;
  lokasi: string;
  rumahSakit: string;
  tanggalMulai: string;
  pendamping: string;
  status: "Dirawat" | "Rencana Kembali" | "Selesai";
  tanggalKembali?: string;
}

export const dataWBPRawatInap: WBPRawatInap[] = [
  { id: "RI1", wbp: "Eko Prasetyo", register: "BTG-2024-021", lokasi: "Blok C → Klinik Lapas", rumahSakit: "Klinik Lapas Bontang", tanggalMulai: "17 Agu 2026", pendamping: "Petugas Gunawan", status: "Dirawat" },
  { id: "RI2", wbp: "Slamet Riyadi", register: "BTG-2022-058", lokasi: "Blok A → RSUD Bontang", rumahSakit: "RSUD Bontang Lestari", tanggalMulai: "15 Agu 2026", pendamping: "Petugas Hendra", status: "Dirawat" },
  { id: "RI3", wbp: "Wahyu Hidayat", register: "BTG-2023-094", lokasi: "Blok B → Klinik Lapas", rumahSakit: "Klinik Lapas Bontang", tanggalMulai: "12 Agu 2026", pendamping: "Petugas Indra", status: "Rencana Kembali", tanggalKembali: "19 Agu 2026" },
  { id: "RI4", wbp: "Marwan Ali", register: "BTG-2021-076", lokasi: "Blok E → RSUD", rumahSakit: "RSUD Bontang Lestari", tanggalMulai: "05 Agu 2026", pendamping: "Petugas Joko", status: "Selesai", tanggalKembali: "10 Agu 2026" },
  { id: "RI5", wbp: "Bayu Aji", register: "BTG-2024-018", lokasi: "Blok D → Klinik Lapas", rumahSakit: "Klinik Lapas Bontang", tanggalMulai: "02 Agu 2026", pendamping: "Petugas Krisna", status: "Selesai", tanggalKembali: "04 Agu 2026" },
  { id: "RI6", wbp: "Doni Pratama", register: "BTG-2022-039", lokasi: "Blok A → RSUD", rumahSakit: "RSUD Bontang Lestari", tanggalMulai: "20 Jul 2026", pendamping: "Petugas Lukman", status: "Selesai", tanggalKembali: "25 Jul 2026" },
];

// ---------- WBP Kerja Luar (§22) ----------
export interface WBPKerjaLuar {
  id: string;
  wbp: string;
  register: string;
  kegiatan: string;
  lokasi: string;
  penanggungJawab: string;
  waktuKeluar: string;
  estimasiKembali: string;
  waktuKembali?: string;
  status: "Keluar" | "Kembali" | "Terlambat";
}

export const dataWBPKerjaLuar: WBPKerjaLuar[] = [
  { id: "KL1", wbp: "Cecep Hidayat", register: "BTG-2021-112", kegiatan: "Proyek Pertanian Urban", lokasi: "Lahan pertanian kelompok", penanggungJawab: "Pak Surya", waktuKeluar: "07.30 WITA", estimasiKembali: "16.00 WITA", status: "Keluar" },
  { id: "KL2", wbp: "Asep Sutisna", register: "BTG-2022-088", kegiatan: "Bengkel Sepeda Motor", lokasi: "Bengkel Lapas", penanggungJawab: "Pak Rizal", waktuKeluar: "08.00 WITA", estimasiKembali: "16.00 WITA", status: "Keluar" },
  { id: "KL3", wbp: "Bambang Wijaya", register: "BTG-2023-014", kegiatan: "Pertanian Urban", lokasi: "Lahan pertanian kelompok", penanggungJawab: "Pak Surya", waktuKeluar: "07.30 WITA", estimasiKembali: "16.00 WITA", status: "Keluar" },
  { id: "KL4", wbp: "Irfan Maulana", register: "BTG-2022-045", kegiatan: "Service AC", lokasi: "Kantor Lapas", penanggungJawab: "Pak Toni", waktuKeluar: "09.00 WITA", estimasiKembali: "12.00 WITA", waktuKembali: "12.15 WITA", status: "Terlambat" },
  { id: "KL5", wbp: "Yusuf Rahman", register: "BTG-2021-098", kegiatan: "Pelatihan Menjahit", lokasi: "Ruang produktif Lapas", penanggungJawab: "Pak Hadi", waktuKeluar: "08.30 WITA", estimasiKembali: "11.30 WITA", waktuKembali: "11.25 WITA", status: "Kembali" },
];

// ---------- WBP Bebas (§23) ----------
export interface WBPBebas {
  id: string;
  wbp: string;
  register: string;
  tanggalBebas: string;
  statusProses: "PB Disetujui" | "CB Aktif" | "CMB Aktif" | "Selesai" | "Remisi";
  dokumen: number;
  catatan: string;
}

export const dataWBPBebas: WBPBebas[] = [
  { id: "WB1", wbp: "Joko Hartono", register: "BTG-2022-102", tanggalBebas: "28 Jul 2026", statusProses: "Selesai", dokumen: 8, catatan: "PB disetujui, sudah diambil keluarga." },
  { id: "WB2", wbp: "Rudi Setiawan", register: "BTG-2021-066", tanggalBebas: "15 Agu 2026", statusProses: "PB Disetujui", dokumen: 6, catatan: "Menunggu pengambilan oleh keluarga." },
  { id: "WB3", wbp: "Sahrul Munir", register: "BTG-2020-045", tanggalBebas: "10 Agu 2026", statusProses: "CB Aktif", dokumen: 7, catatan: "Cuti bersyarat aktif hingga 10 Sep 2026." },
  { id: "WB4", wbp: "Andi Mappangara", register: "BTG-2019-088", tanggalBebas: "01 Agu 2026", statusProses: "Remisi", dokumen: 5, catatan: "Remisi khusus diberikan, status pembebasan diproses." },
  { id: "WB5", wbp: "Tono Sutomo", register: "BTG-2022-077", tanggalBebas: "25 Jul 2026", statusProses: "Selesai", dokumen: 9, catatan: "Selesai seluruh proses administrasi." },
];

// ---------- Notifikasi (§36) ----------
export interface Notifikasi {
  id: string;
  jenis: "Jadwal Regu" | "Serah Terima" | "Gangguan Keamanan" | "Booking" | "Pengaduan" | "Approval" | "Reminder";
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  prioritas: "Tinggi" | "Sedang" | "Rendah";
}

export const dataNotifikasi: Notifikasi[] = [
  { id: "N1", jenis: "Gangguan Keamanan", judul: "Gangguan baru di Blok D", pesan: "WBP Hendra Kusuma ditemukan membawa alat terlarang. Perlu tindak lanjut.", waktu: "5 menit lalu", dibaca: false, prioritas: "Tinggi" },
  { id: "N2", jenis: "Pengaduan", judul: "Pengaduan baru: PDG-2408-0017", pesan: "Antrian kunjungan terlalu lama. Pelapor: Hartono (masyarakat).", waktu: "12 menit lalu", dibaca: false, prioritas: "Sedang" },
  { id: "N3", jenis: "Booking", judul: "3 booking menunggu approval", pesan: "Terdapat 3 booking kunjungan yang menunggu verifikasi petugas.", waktu: "30 menit lalu", dibaca: false, prioritas: "Sedang" },
  { id: "N4", jenis: "Serah Terima", judul: "Serah terima Regu A → B menunggu konfirmasi", pesan: "Serah terima pukul 14.00 WITA menunggu konfirmasi penerima.", waktu: "1 jam lalu", dibaca: false, prioritas: "Sedang" },
  { id: "N5", jenis: "Reminder", judul: "Jadwal kegiatan pembinaan", pesan: "Tahsin Al-Quran akan dimulai pukul 14.00 WITA di aula.", waktu: "2 jam lalu", dibaca: true, prioritas: "Rendah" },
  { id: "N6", jenis: "Approval", judul: "Approval Pembebasan Bersyarat", pesan: "2 WBP menunggu persetujuan kalapas untuk PB.", waktu: "3 jam lalu", dibaca: true, prioritas: "Tinggi" },
  { id: "N7", jenis: "Jadwal Regu", judul: "Jadwal regu minggu depan sudah dirilis", pesan: "Jadwal regu untuk minggu 25-31 Agu 2026 sudah dipublikasikan.", waktu: "5 jam lalu", dibaca: true, prioritas: "Rendah" },
  { id: "N8", jenis: "Gangguan Keamanan", judul: "Lampu gerbang utama mati", pesan: "Laporan gangguan lampu penerangan gerbang utama, sudah ditangani.", waktu: "1 hari lalu", dibaca: true, prioritas: "Sedang" },
];

// ---------- Berita (§8) ----------
export interface Berita {
  id: string;
  slug: string;
  judul: string;
  tanggal: string;
  ringkas: string;
  kategori: "Kegiatan" | "Prestasi" | "Pengumuman" | "Sosial" | "Lainnya";
  penulis: string;
  durasiBaca: string;
}

export const dataBerita: Berita[] = [
  { id: "BR1", slug: "hut-kemerdekaan-81", judul: "Lapas Bontang Gelar Upacara HUT Kemerdekaan ke-81", tanggal: "17 Agu 2026", ringkas: "Seluruh WBP, petugas, dan tamu mengikuti upacara bendera di lapang utama Lapas Kelas IIA Bontang.", kategori: "Kegiatan", penulis: "Humas Lapas Bontang", durasiBaca: "3 menit" },
  { id: "BR2", slug: "pelatihan-menjahit-lulusan-5", judul: "Pelatihan Menjahit Luluskan 18 WBP Angkatan ke-5", tanggal: "12 Agu 2026", ringkas: "WBP dinyatakan lulus dan siap mandiri setelah bebas. Pelatihan ini bekerja sama dengan UPTD.", kategori: "Prestasi", penulis: "Kasi Pembinaan", durasiBaca: "4 menit" },
  { id: "BR3", slug: "donor-darah-pmi-2026", judul: "Donor Darah WBP & Petugas Bersama PMI Bontang", tanggal: "05 Agu 2026", ringkas: "Kegiatan sosial bekerja sama dengan PMI Bontang, total 42 kantong darah berhasil dikumpulkan.", kategori: "Sosial", penulis: "Humas Lapas Bontang", durasiBaca: "2 menit" },
  { id: "BR4", slug: "pemenangan-tahsin-kaltim", judul: "Tim Tahsin WBP Raih Juara 2 Tingkat Kemenkumham Kaltim", tanggal: "28 Jul 2026", ringkas: "Tim WBP Lapas Bontang meraih juara 2 lomba Tahsin tingkat regional Kemenkumham Kaltim.", kategori: "Prestasi", penulis: "Kasi Pembinaan", durasiBaca: "3 menit" },
  { id: "BR5", slug: "kerja-sama-umkm-bontang", judul: "MoU Lapas Bontang dengan UMKM Bontang untuk Pemasaran Produk WBP", tanggal: "22 Jul 2026", ringkas: "Kerja sama pemasaran produk kerajinan WBP hasil program pembinaan kemandirian.", kategori: "Kegiatan", penulis: "Humas Lapas Bontang", durasiBaca: "4 menit" },
  { id: "BR6", slug: "kunjungan-kemenkumham", judul: "Kunjungan Ditjen PAS ke Lapas Kelas IIA Bontang", tanggal: "15 Jul 2026", ringkas: "Direktur Jenderal Pemasyarakatan melakukan kunjungan kerja untuk meninjau implementasi pembinaan.", kategori: "Kegiatan", penulis: "Humas Lapas Bontang", durasiBaca: "5 menit" },
];

// ---------- Galeri (§9) ----------
export interface Galeri {
  id: string;
  judul: string;
  tanggal: string;
  kategori: "Pembinaan" | "Kegiatan" | "Pengamanan" | "Pelayanan" | "Prestasi" | "Sosial" | "Lainnya";
  ringkas: string;
  jumlahFoto: number;
}

export const dataGaleri: Galeri[] = [
  { id: "GL1", judul: "Upacara HUT Kemerdekaan ke-81", tanggal: "17 Agu 2026", kategori: "Kegiatan", ringkas: "Dokumentasi upacara bendera di lapang utama Lapas.", jumlahFoto: 24 },
  { id: "GL2", judul: "Donor Darah PMI 2026", tanggal: "05 Agu 2026", kategori: "Sosial", ringkas: "Kegiatan donor darah WBP & petugas bersama PMI.", jumlahFoto: 18 },
  { id: "GL3", judul: "Pelatihan Menjahit Angkatan 5", tanggal: "12 Agu 2026", kategori: "Pembinaan", ringkas: "Kegiatan pelatihan kemandirian WBP.", jumlahFoto: 32 },
  { id: "GL4", judul: "Lomba Tahsin Kemenkumham Kaltim", tanggal: "28 Jul 2026", kategori: "Prestasi", ringkas: "Dokumentasi perlombaan tahsin tingkat regional.", jumlahFoto: 21 },
  { id: "GL5", judul: "Kunjungan Ditjen PAS", tanggal: "15 Jul 2026", kategori: "Kegiatan", ringkas: "Kunjungan kerja Direktur Jenderal Pemasyarakatan.", jumlahFoto: 28 },
  { id: "GL6", judul: "Pertanian Urban WBP", tanggal: "10 Jul 2026", kategori: "Pembinaan", ringkas: "Program pertanian urban sebagai bagian pembinaan kemandirian.", jumlahFoto: 16 },
  { id: "GL7", judul: "Bengkel Sepeda Motor", tanggal: "05 Jul 2026", kategori: "Pembinaan", ringkas: "Pelatihan service sepeda motor untuk WBP.", jumlahFoto: 19 },
  { id: "GL8", judul: "Pemeriksaan Kesehatan Rutin", tanggal: "01 Jul 2026", kategori: "Pelayanan", ringkas: "Pemeriksaan kesehatan rutin WBP bersama tim klinik.", jumlahFoto: 12 },
];

// ---------- Produk / Karya WBP (§10) ----------
export interface ProdukWBP {
  id: string;
  slug: string;
  nama: string;
  kategori: "Kerajinan Tangan" | "Fashion" | "Kuliner" | "Pertanian" | "Otomotif" | "Lainnya";
  harga: string;
  ketersediaan: "Tersedia" | "Pre-order" | "Habis";
  deskripsi: string;
  asalProgram: string;
}

export const dataProduk: ProdukWBP[] = [
  { id: "PR1", slug: "tas-selempang-jahit", nama: "Tas Selempang Hasil Jahit", kategori: "Fashion", harga: "Rp 85.000", ketersediaan: "Tersedia", deskripsi: "Tas selempang kulit imitasi hasil pelatihan menjahit WBP. Tersedia dalam berbagai warna.", asalProgram: "Pelatihan Menjahit" },
  { id: "PR2", slug: "dompet-kulit", nama: "Dompet Kulit Premium", kategori: "Fashion", harga: "Rp 65.000", ketersediaan: "Tersedia", deskripsi: "Dompet kulit dengan kualitas jahitan rapi, hasil program kemandirian.", asalProgram: "Pelatihan Menjahit" },
  { id: "PR3", slug: "sayur-hidroponik", nama: "Sayur Hidroponik Segar", kategori: "Pertanian", harga: "Rp 15.000/ikat", ketersediaan: "Tersedia", deskripsi: "Sayur hidroponik segar dari kebun pertanian urban WBP. Dapatkan setiap Jumat.", asalProgram: "Pertanian Urban" },
  { id: "PR4", slug: "service-motor", nama: "Jasa Service Sepeda Motor", kategori: "Otomotif", harga: "Rp 50.000/jasa", ketersediaan: "Pre-order", deskripsi: "Jasa service ringan sepeda motor oleh WBP bersertifikat dari bengkel Lapas.", asalProgram: "Bengkel Sepeda Motor" },
  { id: "PR5", slug: "kerajinan-bambu", nama: "Kerajinan Bambu Dekoratif", kategori: "Kerajinan Tangan", harga: "Rp 45.000", ketersediaan: "Tersedia", deskripsi: "Aneka kerajinan bambu dekoratif untuk hiasan rumah dan souvenir.", asalProgram: "Kerajinan Bambu" },
  { id: "PR6", slug: "kue-kering-lebaran", nama: "Kue Kering Lebaran", kategori: "Kuliner", harga: "Rp 50.000/toples", ketersediaan: "Habis", deskripsi: "Kue kering aneka rasa hasil pelatihan wirausaha kuliner WBP.", asalProgram: "Wirausaha Kuliner" },
  { id: "PR7", slug: "tanaman-hias", nama: "Tanaman Hias Pot", kategori: "Pertanian", harga: "Rp 25.000/pot", ketersediaan: "Tersedia", deskripsi: "Tanaman hias dalam pot, cocok untuk dekorasi ruangan.", asalProgram: "Pertanian Urban" },
  { id: "PR8", slug: "tas-belanja-eco", nama: "Tas Belanja Eco-friendly", kategori: "Fashion", harga: "Rp 35.000", ketersediaan: "Tersedia", deskripsi: "Tas belanja ramah lingkungan dari kain perca, hasil daur ulang kreatif WBP.", asalProgram: "Pelatihan Menjahit" },
];

// ---------- SKM (§35) ----------
export interface SKMSurvey {
  id: string;
  periode: string;
  pertanyaan: number;
  responden: number;
  nilai: number;
  predikat: string;
  status: "Aktif" | "Selesai" | "Draft";
}

export const dataSKMSurvey: SKMSurvey[] = [
  { id: "SKM1", periode: "Agustus 2026", pertanyaan: 9, responden: 412, nilai: 88.4, predikat: "A (Sangat Baik)", status: "Aktif" },
  { id: "SKM2", periode: "Juli 2026", pertanyaan: 9, responden: 387, nilai: 87.9, predikat: "A (Sangat Baik)", status: "Selesai" },
  { id: "SKM3", periode: "Juni 2026", pertanyaan: 9, responden: 365, nilai: 87.1, predikat: "A (Sangat Baik)", status: "Selesai" },
  { id: "SKM4", periode: "Mei 2026", pertanyaan: 9, responden: 342, nilai: 86.4, predikat: "A (Sangat Baik)", status: "Selesai" },
  { id: "SKM5", periode: "April 2026", pertanyaan: 9, responden: 318, nilai: 85.8, predikat: "A (Sangat Baik)", status: "Selesai" },
  { id: "SKM6", periode: "September 2026", pertanyaan: 9, responden: 0, nilai: 0, predikat: "Belum ada", status: "Draft" },
];

export interface SKMPertanyaan {
  id: string;
  no: number;
  pertanyaan: string;
  kategori: "Pelayanan" | "Pengamanan" | "Fasilitas" | "Petugas";
}

export const dataSKMPertanyaan: SKMPertanyaan[] = [
  { id: "Q1", no: 1, pertanyaan: "Bagaimana pendapat Anda tentang kemudahan prosedur pelayanan?", kategori: "Pelayanan" },
  { id: "Q2", no: 2, pertanyaan: "Bagaimana kualitas pelayanan yang diberikan petugas?", kategori: "Petugas" },
  { id: "Q3", no: 3, pertanyaan: "Bagaimana kondisi fasilitas dan sarana prasarana Lapas?", kategori: "Fasilitas" },
  { id: "Q4", no: 4, pertanyaan: "Bagaimana kecepatan penyelesaian layanan Anda?", kategori: "Pelayanan" },
  { id: "Q5", no: 5, pertanyaan: "Bagaimana kinerja petugas keamanan selama kunjungan?", kategori: "Pengamanan" },
  { id: "Q6", no: 6, pertanyaan: "Apakah informasi layanan mudah didapatkan?", kategori: "Pelayanan" },
  { id: "Q7", no: 7, pertanyaan: "Bagaimana kebersihan ruang tunggu dan area kunjungan?", kategori: "Fasilitas" },
  { id: "Q8", no: 8, pertanyaan: "Bagaimana sikap petugas dalam melayani pengunjung?", kategori: "Petugas" },
  { id: "Q9", no: 9, pertanyaan: "Apakah Anda akan merekomendasikan layanan Lapas Bontang?", kategori: "Pelayanan" },
];

// ---------- Tentang Lapas (§11) ----------
export const tentangLapas = {
  profil: "Lapas Kelas IIA Bontang adalah Unit Pelaksana Teknis Pemasyarakatan di bawah Kementerian Hukum dan HAM RI yang berkedudukan di Kota Bontang, Kalimantan Timur. Lapas ini berfungsi melaksanakan pembinaan terhadap Warga Binaan Pemasyarakatan (WBP) dengan pendekatan humanis, integratif, dan berkeadilan.",
  sejarah: "Lapas Kelas IIA Bontang resmi berdiri pada tahun 1985 sebagai Cabang Lapas Tenggarong. Seiring peningkatan kapasitas dan pemekaran wilayah, statusnya ditingkatkan menjadi Lapas Kelas IIA Bontang pada tahun 2003. Sejak saat itu, Lapas Bontang terus berinovasi dalam program pembinaan WBP dan modernisasi sistem pengamanan.",
  visi: "Menjadi Lembaga Pemasyarakatan yang profesional, modern, dan humanis dalam mendukung sistem pemidanaan nasional yang berkeadilan.",
  misi: [
    "Melaksanakan pembinaan WBP secara terpadu dan berkelanjutan",
    "Mewujudkan pengamanan Lapas yang handal dan adaptif terhadap dinamika keamanan",
    "Meningkatkan kualitas pelayanan publik melalui digitalisasi sistem informasi",
    "Mengembangkan kemitraan dengan stakeholder untuk pemberdayaan WBP pasca bebas",
    "Membangun tata kelola yang transparan, akuntabel, dan berbasis data",
  ],
  struktur: [
    { jabatan: "Kalapas", nama: "Bpk. H. Sutrisno, S.H., M.H." },
    { jabatan: "Waka Lapas", nama: "Bpk. Rahmat Hidayat, S.Sos." },
    { jabatan: "Kasi Pemasyarakatan", nama: "Bpk. Dedi Kurnia, S.H." },
    { jabatan: "Kasi Pembinaan", nama: "Ibu Vera Lestari, M.Psi." },
    { jabatan: "Kasi Tata Bina", nama: "Bpk. Andi Wijaya, S.T." },
    { jabatan: "Kasi Program & Evaluasi", nama: "Bpk. Rudi Hartono, M.M." },
  ],
  kontak: {
    alamat: "Jl. Diponegoro No. 1, Bontang Utara, Kota Bontang, Kalimantan Timur 75311",
    telepon: "(0548) 000-0000",
    email: "lapasbontang@kemenkumham.go.id",
    jamLayanan: "Senin – Jumat: 08.00 – 16.00 WITA",
    jamKunjungan: "Senin – Jumat: 09.00 – 16.00 WITA · Sabtu: 09.00 – 12.00 WITA",
  },
  statistik: {
    kapasitas: 450,
    wbp: 412,
    petugas: 87,
    programAktif: 6,
    lulusanPembinaan: 156,
  },
};

// ---------- Permissions & Roles detail (§40) ----------
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
  roles: RoleKey[];
}

export const dataPermissions: Permission[] = [
  { id: "P1", resource: "WBP", action: "view", description: "Lihat daftar WBP", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER", "COACHING_OFFICER"] },
  { id: "P2", resource: "WBP", action: "create", description: "Tambah WBP baru", roles: ["SUPER_ADMIN", "ADMIN_LAPAS"] },
  { id: "P3", resource: "WBP", action: "edit", description: "Ubah data WBP", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER"] },
  { id: "P4", resource: "Pengamanan", action: "view", description: "Lihat dashboard pengamanan", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER", "MANAGEMENT"] },
  { id: "P5", resource: "Pengamanan", action: "manage", description: "Kelola jadwal regu & gangguan", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER"] },
  { id: "P6", resource: "Kunjungan", action: "approve", description: "Setujui booking kunjungan", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER"] },
  { id: "P7", resource: "Pembinaan", action: "manage", description: "Kelola program pembinaan", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "COACHING_OFFICER"] },
  { id: "P8", resource: "Pengaduan", action: "respond", description: "Tanggapi pengaduan publik", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER", "COACHING_OFFICER"] },
  { id: "P9", resource: "Publikasi", action: "publish", description: "Publikasikan berita/galeri", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "COACHING_OFFICER"] },
  { id: "P10", resource: "Laporan", action: "view", description: "Akses laporan & dashboard", roles: ["SUPER_ADMIN", "ADMIN_LAPAS", "MANAGEMENT"] },
  { id: "P11", resource: "Administration", action: "manage", description: "Kelola user, role, dan sistem", roles: ["SUPER_ADMIN"] },
  { id: "P12", resource: "Backup", action: "restore", description: "Restore data dari backup", roles: ["SUPER_ADMIN"] },
];

// ---------- Master Data Kategori (§41) ----------
export interface MasterDataItem {
  kategori: string;
  jumlah: number;
  items: string[];
}

export const dataMasterData: MasterDataItem[] = [
  { kategori: "Blok", jumlah: 6, items: ["Blok A", "Blok B", "Blok C", "Blok D", "Blok E", "Blok F (Khusus)"] },
  { kategori: "Kamar", jumlah: 91, items: ["A-01", "A-02", "B-01", "C-02", "D-06", "E-05", "F-01"] },
  { kategori: "Jenis Perkara", jumlah: 5, items: ["Pidana Umum", "Narkotika", "Pidana Khusus", "Tindak Pidana Korupsi", "Lainnya"] },
  { kategori: "Status WBP", jumlah: 5, items: ["Aktif", "Rawat Inap", "Kerja Luar", "Isolasi", "Libas"] },
  { kategori: "Kategori Gangguan", jumlah: 8, items: ["Perkelahian", "Pelanggaran Tata Tertib", "Benda Terlarang", "Upaya Kabur", "Keluhan Kesehatan", "Pemberontakan", "Sabotase", "Lainnya"] },
  { kategori: "Jenis Pembinaan", jumlah: 6, items: ["Pendidikan", "Keagamaan", "Pelatihan Kerja", "Keterampilan", "Olahraga", "Sosial"] },
  { kategori: "Kategori Pengaduan", jumlah: 6, items: ["Pelayanan", "Pengamanan", "Kunjungan", "Fasilitas", "WBP", "Lainnya"] },
  { kategori: "Kategori Berita", jumlah: 5, items: ["Kegiatan", "Prestasi", "Pengumuman", "Sosial", "Lainnya"] },
  { kategori: "Jenis Layanan", jumlah: 4, items: ["PB", "CB", "CMB", "Remisi"] },
  { kategori: "Jenis Dokumen", jumlah: 7, items: ["SK", "Surat Keterangan", "Risalah", "Formulir", "Lampiran", "Dokumen Pendukung", "Arsip"] },
];

// ---------- Audit Log Detail (§42) ----------
export interface AuditLogDetail {
  id: string;
  waktu: string;
  user: string;
  aksi: string;
  modul: string;
  ip: string;
  userAgent: string;
  resource: string;
  resourceId: string;
  dataSebelum?: string;
  dataSesudah?: string;
}

export const dataAuditDetail: AuditLogDetail[] = [
  {
    id: "A1",
    waktu: "18 Agu 2026 08:14:23",
    user: "Bpk. H. Sutrisno (Kalapas)",
    aksi: "Approval serah terima regu A → B",
    modul: "Pengamanan",
    ip: "10.10.2.14",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/127",
    resource: "SerahTerima",
    resourceId: "ST1",
    dataSebelum: "status: SUBMITTED",
    dataSesudah: "status: CONFIRMED",
  },
  {
    id: "A2",
    waktu: "18 Agu 2026 08:09:45",
    user: "Bpk. Rudi Hartono (Operator)",
    aksi: "Tiket SJY-240818-001 check-in",
    modul: "Kunjungan",
    ip: "10.10.2.27",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/127",
    resource: "Kunjungan",
    resourceId: "K1",
    dataSebelum: "status: Disetujui",
    dataSesudah: "status: Check-in, check_in_time: 08:09:45",
  },
  {
    id: "A3",
    waktu: "18 Agu 2026 07:55:12",
    user: "Bpk. Dedi Kurnia (Petugas Pengamanan)",
    aksi: "Tambah data gangguan G1",
    modul: "Pengamanan",
    ip: "10.10.2.31",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Mobile",
    resource: "Gangguan",
    resourceId: "G1",
    dataSesudah: "create: { jenis: Perkelahian, lokasi: Blok B, status: Baru }",
  },
  {
    id: "A4",
    waktu: "17 Agu 2026 22:10:33",
    user: "Ibu Vera Lestari (Kasi Pembinaan)",
    aksi: "Update kehadiran B5 (Klinik Konseling Adiksi)",
    modul: "Pembinaan",
    ip: "10.10.2.18",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/17",
    resource: "Kehadiran",
    resourceId: "B5",
    dataSebelum: "kehadiran: 15",
    dataSesudah: "kehadiran: 17",
  },
  {
    id: "A5",
    waktu: "17 Agu 2026 19:48:01",
    user: "Bpk. Andi Wijaya (Admin Lapas)",
    aksi: "Reset password user: petugas.d",
    modul: "Admin",
    ip: "10.10.2.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/127",
    resource: "User",
    resourceId: "U3",
    dataSesudah: "password_changed_at: 2026-08-17T19:48:01Z",
  },
  {
    id: "A6",
    waktu: "17 Agu 2026 16:33:18",
    user: "Bpk. Rudi Hartono (Operator)",
    aksi: "Tanggapi pengaduan PDG-2408-0017",
    modul: "Pengaduan",
    ip: "10.10.2.27",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/127",
    resource: "Pengaduan",
    resourceId: "P1",
    dataSebelum: "status: Baru",
    dataSesudah: "status: Diproses, response_time: 4h 12m",
  },
];

// ---------- Backup History (§43) ----------
export interface BackupRecord {
  id: string;
  tanggal: string;
  ukuran: string;
  jenis: "Otomatis" | "Manual";
  status: "Sukses" | "Gagal" | "Berjalan";
  lokasi: string;
  duration: string;
}

export const dataBackup: BackupRecord[] = [
  { id: "BK1", tanggal: "18 Agu 2026 02:00", ukuran: "248 MB", jenis: "Otomatis", status: "Sukses", lokasi: "Cloud Storage (S3-compatible)", duration: "3m 42s" },
  { id: "BK2", tanggal: "17 Agu 2026 02:00", ukuran: "247 MB", jenis: "Otomatis", status: "Sukses", lokasi: "Cloud Storage (S3-compatible)", duration: "3m 28s" },
  { id: "BK3", tanggal: "16 Agu 2026 02:00", ukuran: "246 MB", jenis: "Otomatis", status: "Sukses", lokasi: "Cloud Storage (S3-compatible)", duration: "3m 51s" },
  { id: "BK4", tanggal: "15 Agu 2026 14:23", ukuran: "245 MB", jenis: "Manual", status: "Sukses", lokasi: "Cloud Storage (S3-compatible)", duration: "4m 02s" },
  { id: "BK5", tanggal: "15 Agu 2026 02:00", ukuran: "245 MB", jenis: "Otomatis", status: "Sukses", lokasi: "Cloud Storage (S3-compatible)", duration: "3m 15s" },
  { id: "BK6", tanggal: "14 Agu 2026 02:00", ukuran: "244 MB", jenis: "Otomatis", status: "Sukses", lokasi: "Cloud Storage (S3-compatible)", duration: "3m 22s" },
];

// ---------- System Settings Categories (§44) ----------
export interface SystemSetting {
  kategori: string;
  items: { key: string; label: string; value: string; type: "text" | "toggle" | "number" | "select" }[];
}

export const dataSystemSettings: SystemSetting[] = [
  {
    kategori: "General",
    items: [
      { key: "app_name", label: "Nama Aplikasi", value: "SIPADUPAS", type: "text" },
      { key: "organization", label: "Instansi", value: "Lapas Kelas IIA Bontang", type: "text" },
      { key: "timezone", label: "Zona Waktu", value: "Asia/Makassar (WITA)", type: "select" },
      { key: "language", label: "Bahasa Default", value: "Indonesia (id-ID)", type: "select" },
    ],
  },
  {
    kategori: "Organization",
    items: [
      { key: "address", label: "Alamat", value: "Jl. Diponegoro No. 1, Bontang Utara", type: "text" },
      { key: "phone", label: "Telepon", value: "(0548) 000-0000", type: "text" },
      { key: "email", label: "Email", value: "lapasbontang@kemenkumham.go.id", type: "text" },
      { key: "capacity", label: "Kapasitas Lapas", value: "450", type: "number" },
    ],
  },
  {
    kategori: "Visit",
    items: [
      { key: "max_quota", label: "Kuota Kunjungan Harian", value: "120", type: "number" },
      { key: "session_count", label: "Jumlah Sesi per Hari", value: "6", type: "number" },
      { key: "max_visitors", label: "Maksimum Pengunjung per Tiket", value: "4", type: "number" },
      { key: "auto_approve", label: "Auto-approve Booking", value: "false", type: "toggle" },
    ],
  },
  {
    kategori: "Notification",
    items: [
      { key: "email_notif", label: "Notifikasi Email", value: "true", type: "toggle" },
      { key: "push_notif", label: "Push Notification", value: "true", type: "toggle" },
      { key: "sms_notif", label: "Notifikasi SMS", value: "false", type: "toggle" },
    ],
  },
  {
    kategori: "Security",
    items: [
      { key: "password_min", label: "Minimum Panjang Password", value: "8", type: "number" },
      { key: "2fa_required", label: "2FA Wajib untuk Admin", value: "true", type: "toggle" },
      { key: "session_timeout", label: "Sesi Timeout (menit)", value: "30", type: "number" },
      { key: "max_login_attempts", label: "Maksimum Percobaan Login", value: "5", type: "number" },
    ],
  },
  {
    kategori: "Backup",
    items: [
      { key: "auto_backup", label: "Backup Otomatis", value: "true", type: "toggle" },
      { key: "backup_time", label: "Waktu Backup Harian", value: "02:00", type: "text" },
      { key: "retention_days", label: "Retensi Backup (hari)", value: "30", type: "number" },
    ],
  },
];

// ---------- User Info with role ----------
export const userInfoWithRole = {
  nama: "Bpk. Andi Wijaya",
  email: "admin@lapasbontang.go.id",
  role: "ADMIN_LAPAS" as RoleKey,
  avatar: "AW",
};
