# Panduan Domain Custom `.go.id` — SIPADUPAS

> Aplikasi sudah LIVE di: https://sipadupas-project.vercel.app
> Dokumen ini memandu pendaftaran domain resmi `.go.id` dan penghubungannya ke Vercel.

---

## 1. Status Saat Ini

| Item | Status |
|---|---|
| Aplikasi production | ✅ Live di `https://sipadupas-project.vercel.app` |
| Database Supabase | ✅ Terhubung (pooler ap-southeast-1) |
| Domain `lapasbontang.go.id` | ❌ Belum terdaftar (cek DNS: tidak ada record SOA/NS) |
| Team Vercel | `dinsos` (akun: sipadupas-svg) |

---

## 2. Dua Jalur Mendapatkan Domain

### Jalur A — Subdomain dari instansi induk (paling cepat, jika tersedia)
Jika Kanwil Kemenimipas Kalimantan Timur atau Ditjen Pas memiliki domain `.go.id`
aktif, minta **admin domain/PDI TIK** di instansi tersebut membuatkan subdomain,
misalnya:

```
sipadupas.kanwilkalkaltim.go.id
```

Yang diminta ke admin: cukup **1 record CNAME** diatur di DNS mereka:

```
Tipe   : CNAME
Nama   : sipadupas
Nilai  : cname.vercel-dns.com
TTL    : 3600
```

Setelah diatur, lanjut ke **Langkah 4** di bawah. Tidak perlu surat permohonan ke Komdigi.

### Jalur B — Daftar domain `.go.id` baru via Komdigi (DNSI)
Untuk domain baru seperti `lapasbontang.go.id`:

1. Siapkan dokumen (lihat Bab 3 & draft surat di Bab 5).
2. Daftar melalui portal resmi **DNSI Komdigi**: https://dnsi.go.id
   (pengelola domain `.go.id`, Ditjen Aptika/Komdigi).
   Akun menggunakan email resmi instansi.
3. Isi formulir: nama domain yang diinginkan, identitas instansi (Lapas Kelas IIA
   Bontang, Kota Bontang, Kaltim), data admin teknis (nama, NIP, email instansi,
   no. HP).
4. **Nameserver (NS) yang diisi di formulir** agar langsung terhubung ke Vercel:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
   > Alternatif: pakai Cloudflare NS, lalu atur record A/CNAME di sana.
5. Unggah surat permohonan (draft siap cetak ada di Bab 5).
6. Tunggu verifikasi — biasanya **3–14 hari kerja**, **gratis** (tidak dipungut biaya).
7. Jika disetujui, domain aktif dan mengarah ke Vercel otomatis (karena NS Vercel).

---

## 3. Syarat Dokumen Pendaftaran `.go.id`

1. **Surat permohonan** resmi dari kepala instansi (format di Bab 5) — kop dinas,
   nomor surat, tanda tangan + cap.
2. **Data instansi**: nama lengkap, alamat, identitas instansi (jika ada).
3. **Data admin teknis domain**: nama lengkap, NIP, jabatan, email instansi
   (bukan gmail), nomor HP aktif.
4. **Justifikasi singkat** keperluan domain (contoh tercantum di draft surat).
5. Pastikan **email instansi aktif** untuk menerima notifikasi verifikasi.

> Info terbaru: cek https://dnsi.go.id atau cari "registrasi domain go id" di
> situs komdigi.go.id — prosedur/portal bisa berubah sewaktu-waktu.


---

## 4. Langkah Akhir Setelah Domain Aktif (dikerjakan oleh asisten/Cline)

Begitu domain disetujui & NS aktif, jalankan perintah ini (atau minta asisten):

```bash
# 1. Tambahkan domain ke project Vercel
vercel domains add lapasbontang.go.id
vercel domains add www.lapasbontang.go.id   # opsional

# 2. Verifikasi konfigurasi
vercel domains inspect lapasbontang.go.id

# 3. Hubungkan domain ke project
vercel alias set sipadupas-project.vercel.app lapasbontang.go.id

# 4. Update NEXTAUTH_URL ke domain baru
#    (vercel env rm NEXTAUTH_URL production, lalu add nilai baru)
#    NEXTAUTH_URL = https://lapasbontang.go.id

# 5. Redeploy agar env baru aktif
vercel --prod
```

Jika pakai **Jalur A (subdomain)**, ganti `lapasbontang.go.id` dengan subdomain
yang diberikan, dan NS tidak perlu — cukup CNAME.

---

## 5. Draft Surat Permohonan (siap cetak di kop dinas)

```
                                                                 Nomor  : R-.../.../2026
                                                                 Lampiran: -
                                                                 Perihal: Permohonan
                                                                 Pendaftaran Nama
                                                                 Domain .go.id

Kepada Yth.
Direktur Jenderal Aptika
Kementerian Komunikasi dan Digital RI
u.p. Tim Pengelola Nama Domain Instansi Pemerintah (DNSI)
di Jakarta

Dengan hormat,

Sehubungan dengan kebutuhan pelayanan informasi dan administrasi
kependananan pada Unit Pelaksana Teknis Lapas Kelas IIA Bontang,
Ditjen Pemasyarakatan, Kementerian Imigrasi dan Pemasyarakatan, dengan ini
kami mengajukan permohonan pendaftaran nama domain instansi pemerintah
sebagai berikut:

  1. Nama domain yang dimohonkan : lapasbontang.go.id
  2. Nama instansi pengguna      : Lapas Kelas IIA Bontang
  3. Alamat instansi             : Jl. Sei Pinang No. 2, Bontang Baru,
                                   Kec. Bontang Utara, Kota Bontang,
                                   Kalimantan Timur
  4. Keperluan/justifikasi       : Penyediaan Sistem Informasi Pengamanan
                                   dan Pelayanan Terpadu Pemasyarakatan
                                   (SIPADUPAS) yang meliputi layanan
                                   kunjungan, barang titipan, pengaduan,
                                   dan informasi publik bagi masyarakat
                                   serta kebutuhan administrasi internal.
  5. Admin teknis domain:
     Nama    : (isi nama pejabat/petugas TIK)
     NIP     : (isi NIP)
     Jabatan : (isi jabatan)
     Email   : (email resmi instansi)
     No. HP  : (nomor HP aktif)
  6. Nameserver yang digunakan   : ns1.vercel-dns.com / ns2.vercel-dns.com

Demikian permohonan ini kami sampaikan. Atas perhatian dan kerja sama
Bapak/Ibu, kami ucapkan terima kasih.

                                        Bontang, ... 2026
                                        Kepala Lapas Kelas IIA Bontang,



                                        (tanda tangan & cap dinas)
```

> Sesuaikan alamat, nomor surat, dan data admin teknis dengan kondisi instansi.

---

## 6. Catatan Teknis (untuk admin TIK)

- HTTPS/SSL otomatis oleh Vercel (Let's Encrypt) — tidak perlu sertifikat sendiri.
- Aplikasi berjalan pada infrastruktur Vercel (serverless), database PostgreSQL
  di Supabase (region Singapore) dengan connection pooling.
- Jika instansi mewajibkan hosting on-premise/VPS, aplikasi juga sudah
  disiapkan dukungan Docker (`Dockerfile`, `docker-compose.yml`) — beralih ke
  VPS hanya perlu mengubah `DATABASE_URL` dan `NEXTAUTH_URL`.
