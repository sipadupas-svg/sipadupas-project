"use client";

import {
  ShieldCheck,
  CalendarCheck,
  MessageSquareWarning,
  Info,
  Newspaper,
  Image,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  BarChart3,
  GraduationCap,
  ClipboardList,
  Lock,
  Building2,
  Star,
  Package,
} from "lucide-react";
import type { ViewKey } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

interface LandingViewProps {
  onNavigate: (v: ViewKey) => void;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const publicServices: {
  key: ViewKey;
  icon: typeof Info;
  title: string;
  desc: string;
}[] = [
  {
    key: "kunjungan",
    icon: CalendarCheck,
    title: "Kunjungan Online",
    desc: "Daftar kunjungan secara online, pilih sesi, dan dapatkan tiket digital ber-QR Code.",
  },
  {
    key: "pengaduan",
    icon: MessageSquareWarning,
    title: "Pengaduan",
    desc: "Sampaikan aspirasi atau laporan dugaan pelanggaran dengan kode tracking rahasia.",
  },
  {
    key: "informasi",
    icon: Info,
    title: "Informasi PB/CB/CMB",
    desc: "Persyaratan, alur, dan dokumen layanan Pembebasan Bersyarat, Cuti Bersyarat, dan CMB.",
  },
  {
    key: "berita",
    icon: Newspaper,
    title: "Berita",
    desc: "Berita resmi, kegiatan, prestasi, dan pengumuman Lapas Kelas IIA Bontang.",
  },
  {
    key: "galeri",
    icon: Image,
    title: "Galeri",
    desc: "Dokumentasi visual kegiatan, pembinaan, dan prestasi Warga Binaan Pemasyarakatan.",
  },
  {
    key: "skm",
    icon: Star,
    title: "SKM",
    desc: "Survei Kepuasan Masyarakat — sampaikan penilaian Anda atas layanan Lapas Bontang.",
  },
  {
    key: "barangTitipan",
    icon: Package,
    title: "Titip Barang",
    desc: "Titipkan barang untuk WBP tanpa perlu antri kunjungan. Daftar online, lacak status.",
  },
];

const modules = [
  {
    icon: ShieldCheck,
    name: "Pengamanan",
    desc: "Monitoring WBP, blok/kamar, jadwal regu, gangguan keamanan, dan serah terima.",
  },
  {
    icon: Users,
    name: "Manajemen WBP",
    desc: "Data WBP, riwayat aktivitas, dokumen, mutasi, dan status tahanan.",
  },
  {
    icon: CalendarCheck,
    name: "Pelayanan Kunjungan",
    desc: "Booking online, kuota, tiket digital, QR Code, check-in, dan riwayat.",
  },
  {
    icon: GraduationCap,
    name: "Pembinaan",
    desc: "Program pembinaan, peserta, kehadiran, evaluasi, dokumentasi, dan prestasi.",
  },
  {
    icon: BarChart3,
    name: "Dashboard & Laporan",
    desc: "Dashboard pimpinan, statistik, SKM, dan laporan PDF/Excel.",
  },
  {
    icon: Newspaper,
    name: "Publikasi",
    desc: "Berita, informasi publik, galeri kegiatan, dan produk/karya WBP.",
  },
];

const processSteps = [
  {
    step: 1,
    icon: FileText,
    title: "Daftar",
    desc: "Isi formulir layanan secara online melalui platform SIPADUPAS.",
  },
  {
    step: 2,
    icon: ClipboardList,
    title: "Verifikasi",
    desc: "Petugas memverifikasi data dan dokumen permohonan Anda.",
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: "Persetujuan",
    desc: "Permohonan disetujui dan jadwal layanan ditentukan.",
  },
  {
    step: 4,
    icon: CalendarCheck,
    title: "Pelaksanaan",
    desc: "Layanan dilaksanakan sesuai jadwal yang telah ditentukan.",
  },
];

const statsBar = [
  { label: "Total WBP", value: "312", icon: Users },
  { label: "Kapasitas", value: "350", icon: Building2 },
  { label: "SKM Score", value: "88.4", icon: Star },
  { label: "Kunjungan Bulan Ini", value: "486", icon: CalendarCheck },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LandingView({ onNavigate }: LandingViewProps) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-blue-900">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-900 to-blue-800/80" />
        {/* Subtle decorative pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-center">
            {/* Left — Text content (3 cols) */}
            <div className="lg:col-span-3 text-center lg:text-left">
              {/* Logo / emblem area */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="size-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <ShieldCheck className="size-7 text-teal-400" strokeWidth={1.75} />
                </div>
                <div className="text-left">
                  <div className="text-blue-200 text-xs font-medium tracking-widest uppercase">
                    Kementerian Hukum dan HAM RI
                  </div>
                  <div className="text-blue-200/70 text-[11px]">
                    Direktorat Jenderal Pemasyarakatan
                  </div>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                LAPAS Kelas IIA{" "}
                <span className="text-teal-400">BONTANG</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-blue-100/90 font-medium">
                Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan
              </p>
              <p className="mt-4 text-blue-100/70 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Platform digital terpadu yang mengintegrasikan kebutuhan internal
                Lapas dengan pelayanan publik. Mewujudkan pengelolaan
                pengamanan dan pelayanan pemasyarakatan yang terintegrasi, cepat,
                transparan, akuntabel, terdokumentasi, dan aman.
              </p>

              {/* CTA buttons */}
              <div className="mt-7 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  onClick={() => onNavigate("kunjungan")}
                >
                  <CalendarCheck className="size-4 mr-2" strokeWidth={1.75} />
                  Daftar Kunjungan Online
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold"
                  onClick={() => onNavigate("pengaduan")}
                >
                  <MessageSquareWarning
                    className="size-4 mr-2"
                    strokeWidth={1.75}
                  />
                  Pengaduan Masyarakat
                </Button>
              </div>

              {/* Quick trust badges */}
              <div className="mt-6 flex items-center gap-4 sm:gap-5 text-xs text-blue-200/70 flex-wrap justify-center lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-teal-400"
                    strokeWidth={1.75}
                  />{" "}
                  {modules.length} Modul Terpadu
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-teal-400"
                    strokeWidth={1.75}
                  />{" "}
                  6 Peran Pengguna
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-3.5 text-teal-400"
                    strokeWidth={1.75}
                  />{" "}
                  PWA Siap Pakai
                </span>
              </div>
            </div>

            {/* Right — Decorative card (2 cols) */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-6 space-y-4">
                <div className="text-white font-semibold text-sm flex items-center gap-2">
                  <Lock className="size-4" strokeWidth={1.75} />
                  Akses Sistem Internal
                </div>
                <p className="text-blue-100/80 text-sm leading-relaxed">
                  Petugas Lapas dapat masuk ke dashboard internal untuk mengakses
                  modul pengamanan, kunjungan, pembinaan, dan laporan.
                </p>
                {isAuthenticated ? (
                  <Button
                    size="sm"
                    className="w-full bg-white text-blue-900 hover:bg-blue-50 font-medium"
                    onClick={() => onNavigate("dashboard")}
                  >
                    Buka Dashboard
                    <ArrowRight className="size-4 ml-2" strokeWidth={1.75} />
                  </Button>
                ) : (
                  <div className="text-xs text-blue-100/60 flex items-center gap-1.5">
                    <Info className="size-3" strokeWidth={1.75} />
                    Silakan masuk melalui tombol di pojok kanan atas
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <MiniStat label="Modul" value={String(modules.length)} />
                  <MiniStat label="WBP Terdata" value="312" />
                  <MiniStat label="Kunjungan" value="486" />
                  <MiniStat label="SKM" value="88.4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white shadow-sm relative z-10 -mt-px">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200">
            {statsBar.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 py-4 sm:py-5 px-3 sm:px-5 first:pl-0 last:pr-0"
              >
                <div className="size-10 rounded-lg bg-blue-900/5 text-blue-900 flex items-center justify-center shrink-0">
                  <s.icon className="size-5" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">
                    {s.label}
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    {s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAYANAN PUBLIK */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
            Layanan Publik
          </h2>
          <p className="mt-2 text-slate-500">
            Akses cepat seluruh layanan publik Lapas Kelas IIA Bontang.
            Seluruh layanan <strong className="text-slate-700">gratis</strong>{" "}
            dan dapat diakses 24 jam.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {publicServices.map((svc) => (
            <div
              key={svc.key}
              className="card-standard group cursor-pointer flex flex-col"
              onClick={() => onNavigate(svc.key)}
            >
              <div className="size-11 rounded-xl bg-blue-900/5 text-blue-900 flex items-center justify-center mb-4 group-hover:bg-teal-600/10 group-hover:text-teal-600 transition-colors">
                <svc.icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-slate-900 text-[15px]">
                {svc.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {svc.desc}
              </p>
              <button
                type="button"
                className="pt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors self-start mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(svc.key);
                }}
              >
                Selengkapnya
                <ArrowRight className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MODUL TERPADU */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
              Modul Terpadu SIPADUPAS
            </h2>
            <p className="mt-2 text-slate-500">
              Satu platform terintegrasi yang menghubungkan seluruh kebutuhan
              operasional Lapas dengan pelayanan publik.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m) => (
              <div
                key={m.name}
                className="flex gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-900/20 hover:shadow-sm transition-all"
              >
                <div className="size-10 rounded-lg bg-blue-900/5 text-blue-900 flex items-center justify-center shrink-0">
                  <m.icon className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALUR LAYANAN */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
            Alur Layanan
          </h2>
          <p className="mt-2 text-slate-500">
            Proses layanan SIPADUPAS dirancang sederhana dan transparan.
          </p>
        </div>
        <div className="relative">
          {/* Connector line (hidden on mobile, visible sm+) */}
          <div className="hidden sm:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-0.5 bg-blue-900/10" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-5">
            {processSteps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {/* Step circle */}
                <div className="relative z-10 size-20 rounded-full bg-white border-2 border-blue-900/15 flex items-center justify-center mb-4">
                  <div className="size-12 rounded-full bg-blue-900 text-white flex items-center justify-center">
                    <s.icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <span className="absolute -top-1 -right-1 size-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                {/* Arrow (mobile only, between items) */}
                {i < processSteps.length - 1 && (
                  <div className="sm:hidden text-blue-900/20 mb-1">
                    <ArrowRight className="size-5 rotate-90" strokeWidth={1.75} />
                  </div>
                )}
                <h3 className="font-semibold text-blue-900 text-[15px]">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-[220px]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TAGLINE STRIP */}
      <section className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5 text-center text-sm sm:text-base font-medium italic">
          &ldquo;Pengamanan Terintegrasi, Pelayanan Lebih Pasti.&rdquo;
        </div>
      </section>


    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2.5">
      <div className="text-[10px] text-blue-200/60 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-lg font-bold text-white mt-0.5">{value}</div>
    </div>
  );
}
