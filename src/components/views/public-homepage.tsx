"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  ShieldCheck,
  CalendarCheck,
  MessageSquareWarning,
  Info,
  Newspaper,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Package,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  Award,
  ShoppingBag,
  Eye,
  Camera,
  ClipboardList,
  Wrench,
  Stethoscope,
  Landmark,
  Shield,
  FileCheck,
  Search,
  BadgeCheck,
  LifeBuoy,
  QrCode,
} from "lucide-react";
import type { ViewKey } from "@/lib/data";
import { dataGaleri, dataPublikasi, dataProduk, dataSKMSurvey } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginDialog } from "@/components/login-dialog";
import { RegisterDialog } from "@/components/register-dialog";
import { Header } from "@/components/ui/header-3";

interface HomepageProps {
  onNavigate: (v: ViewKey) => void;
}

/* ────────────────────────────────────────────────────────────────────
   SIPADUPAS — Lapas Kelas IIA Bontang
   Premium Government Digital Service Platform
   Dark Navy #061C2C · Gold #C9A227 · White · Light Gray #F7F8FA
────────────────────────────────────────────────────────────────────── */

/* ── QUICK ACCESS CARDS (Section 5) ─────────────────────────────── */
const QUICK_ACCESS: { view: ViewKey; icon: typeof Info; title: string; desc: string; cta: string }[] = [
  {
    view: "kunjungan",
    icon: CalendarCheck,
    title: "Kunjungan Online",
    desc: "Rencanakan booking kunjungan secara online, pilih sesi, dan dapatkan tiket digital ber-QR Code.",
    cta: "Daftar Kunjungan",
  },
  {
    view: "pengaduan",
    icon: MessageSquareWarning,
    title: "Pengaduan Publik",
    desc: "Sampaikan pengaduan Anda dan pantau statusnya melalui kode pelacakan yang unik.",
    cta: "Daftar Pengaduan",
  },
  {
    view: "informasi",
    icon: FileText,
    title: "Informasi Layanan",
    desc: "Informasi PB, CB, CMB, serta layanan Pemasyarakatan lainnya.",
    cta: "Lihat Informasi",
  },
  {
    view: "pengaduan",
    icon: Search,
    title: "Cek Status",
    desc: "Cek status layanan atau pengaduan yang telah dikirim.",
    cta: "Cek Status",
  },
  {
    view: "tentang",
    icon: Landmark,
    title: "Informasi Publik",
    desc: "Akses informasi resmi Lapas Kelas IIA Bontang untuk keperluan publik.",
    cta: "Lihat Informasi",
  },
    {
    view: "produk",
    icon: ShoppingBag,
    title: "Produk WBP",
    desc: "Lihat karya dan produk hasil pembinaan Warga Binaan Pemasyarakatan.",
    cta: "Lihat Produk",
  },
  {
    view: "barangTitipan",
    icon: Package,
    title: "Titipan Barang",
    desc: "Lihat dan melacak barang titipan (barang yang harus dipindahkan/diperlakukan).",
    cta: "Lihat Titipan",
  },
];

/* ── LAYANAN / SERVICES GRID (Section 8) ────────────────────────── */
const MAIN_SERVICES: { view: string; icon: typeof Info; name: string; desc: string }[] = [
  { view: "kunjungan", icon: CalendarCheck, name: "Kunjungan Online", desc: "Booking jadwal kunjungan secara online dan dapatkan tiket digital dengan QR." },
  { view: "pengaduan", icon: MessageSquareWarning, name: "Pengaduan Publik", desc: "Sampaikan pengaduan dengan kode tracking untuk memantau status penanganan." },
  { view: "informasi", icon: FileText, name: "Informasi PB / CB / CMB", desc: "Informasi persyaratan, alur, dan prosedur layanan pembebasan." },
  { view: "publikasi", icon: Newspaper, name: "Informasi Pemasyarakatan", desc: "Informasi resmi dan transparansi publikasi pemasyarakatan." },
  { view: "galeri", icon: Camera, name: "Galeri Pembinaan", desc: "Dokumentasi kegiatan pembinaan, layanan, dan keterampilan." },
  { view: "produk", icon: ShoppingBag, name: "Produk WBP", desc: "Menampilkan karya dan produk Warga Binaan hasil keterampilan." },
  { view: "berita", icon: Newspaper, name: "Berita & Pengumuman", desc: "Berita resmi, pengumuman, dan kegiatan Lapas Kelas I A Bontang." },
  { view: "kontak", icon: MapPin, name: "Kontak & Informasi", desc: "Alamat, nomor kontak, dan informasi Lapas Kelas I A Bontang." },
];

/* ── STATS (Section 6) — editable via admin / database ──────────── */
const PUBLIC_STATS: { value: string; suffix: string; label: string; sub: string; icon: typeof Info }[] = [
  { value: "1000", suffix: "+", label: "Pengunjung", sub: "Portal diakses masyarakat setiap bulan", icon: Users },
  { value: "500", suffix: "+", label: "Layanan Publik", sub: "Berbagi layanan untuk masyarakat", icon: FileCheck },
  { value: "98", suffix: "%", label: "Pengaduan Ditangani", sub: "Penanganan pengaduan tepat waktu", icon: CheckCircle2 },
  { value: "100", suffix: "%", label: "Informasi Publik", sub: "Transparansi informasi resmi", icon: Eye },
  { value: "24", suffix: "/7", label: "Dukungan Layanan", sub: "Pelayanan siap mendukung kapan pun", icon: LifeBuoy },
];

/* ── MONITORING PEMASYARAKATAN (Section 9) ───────────────────────── */
/* Hanya data publik yang aman ditampilkan. Data internal tidak muncul. */
const MONITOR_DATA: { label: string; value: number; unit?: string; icon: typeof Info; note: string }[] = [
  { label: "Jumlah WBP", value: 412, icon: Users, note: "Penghuni pada laporan ini — data ter-update dari database" },
  { label: "WBP Bebas", value: 38, unit: "orang", icon: Award, note: "Akumulasi bebas pada periode berjalan" },
  { label: "Rawat Inap", value: 6, unit: "orang", icon: Stethoscope, note: "WBP sedang menjalani perawatan medis" },
  { label: "Kerja Luar", value: 18, unit: "orang", icon: Wrench, note: "WBP memperoleh izin kerja luar" },
  { label: "Regu Pengamanan", value: 4, unit: "regu", icon: Shield, note: "Serah terima regu pengamanan" },
  { label: "Jadwal Regu", value: 3, unit: "shift", icon: CalendarCheck, note: "Pagi · Siang · Malam (06.00 - 06.00)" },
];

/* ── LANGKAH KUNJUNGAN ONLINE (Section 14) ───────────────────────── */
const VISIT_STEPS: { title: string; desc: string; icon: typeof Info }[] = [
  { title: "Pilih Tanggal", desc: "Tentukan tanggal kunjungan yang tersedia.", icon: CalendarCheck },
  { title: "Pilih Waktu", desc: "Pilih sesi pagi/siang yang sesuai.", icon: Clock },
  { title: "Isi Data", desc: "Lengkapi data identitas pengunjung.", icon: ClipboardList },
  { title: "Pilih WBP", desc: "Sebutkan nama WBP yang akan dikunjungi.", icon: Users },
  { title: "Tiket Digital", desc: "Tiket + QR Code terbit setelah disetujui.", icon: BadgeCheck },
  { title: "Tunjukkan Tiket", desc: "Tunjukkan tiket saat check-in kedatangan.", icon: CheckCircle2 },
];

/* ── TESTIMONIAL (Section 15) ────────────────────────────────────── */
const TESTIMONIALS: { name: string; role: string; text: string; rating: number }[] = [
  { name: "Siti A.", role: "Keluarga WBP", text: "Booking kunjungan jadi mudah dan jelas. Kuota terlihat dan tiket digital sangat membantu.", rating: 5 },
  { name: "Budi S.", role: "Masyarakat", text: "Pengaduan direspons cepat dan statusnya bisa saya pantau. Transparan dan profesional.", rating: 5 },
  { name: "Rina M.", role: "Keluarga WBP", text: "Petugas pelayanan ramah dan informasinya akurat. SIPADUPAS sangat membantu.", rating: 5 },
];

/* ── PENDUKUNG SKM (Section 15) ──────────────────────────────────── */
const SKM_GRADE = ["Kurang Baik", "Cukup", "Baik", "Sangat Baik"];

/* ──────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────────────────── */
export function Homepage({ onNavigate }: HomepageProps) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [runningText, setRunningText] = useState("");
  const [rtActive, setRtActive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/public/site-settings")
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success) return;
        if (json.data?.runningTextActive && json.data?.runningText) {
          setRunningText(json.data.runningText);
          setRtActive(true);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setLoginOpen(false);
    setRegisterOpen(true);
  }, []);

  const go = (v: ViewKey) => onNavigate(v);
  const goAnchor = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white text-[#17212B] font-sans">
      <style>{`
        @keyframes sip-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes sip-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes sip-float2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        @keyframes sip-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-sip-marquee { animation: sip-marquee 28s linear infinite; }
        .animate-sip-float { animation: sip-float 5s ease-in-out infinite; }
        .animate-sip-float2 { animation: sip-float2 6s ease-in-out infinite; }
        .sip-grid-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0);
          background-size: 28px 28px;
        }
        .sip-reveal { opacity: 0; transform: translateY(18px); transition: opacity .7s ease, transform .7s ease; }
        .sip-reveal.sip-in { opacity: 1; transform: translateY(0); }
        .sip-gold-text {
          background: linear-gradient(120deg, #E0C15A, #C9A227 55%, #F4E3A8);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
      `}</style>

      <Header
        onNav={go}
        onAnchor={goAnchor}
        onLogin={() => setLoginOpen(true)}
        authenticated={isAuthenticated}
        userLabel={currentUser?.nama}
        onDashboard={() => go("dashboard")}
      />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onRegisterClick={handleSwitchToRegister}
      />

      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />

      <Hero go={go} goAnchor={goAnchor} runningText={runningText} rtActive={rtActive} />

      {/* TRUST STRIP */}
      <div className="bg-[#0B2A3D] border-y border-white/10 overflow-hidden">
        <div className="flex w-max animate-sip-marquee gap-10 py-3.5 px-6">
          {[0, 1].map((dup) =>
            ["Pengamanan Terintegrasi", "Pelayanan Lebih Pasti", "Transparan & Terpercaya", "Portal Resmi Pemasyarakatan", "Layanan Masyarakat 24/7"].map((t, i) => (
              <span key={`${dup}-${i}`} className="inline-flex items-center gap-2 text-sm text-white/70 whitespace-nowrap">
                <BadgeCheck className="size-4 text-[#C9A227]" strokeWidth={2} />
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      <QuickAccess go={go} />
      <StatsSection />
      <AboutSection go={go} />
      <ServicesSection go={go} />
      <MonitoringSection />
      <NewsSection go={go} />
      <GallerySection go={go} />
      <ProductSection go={go} />
      <ComplaintCta go={go} />
      <VisitSection go={go} />
      <SkmSection go={go} />
      <FinalCta go={go} />
      <Footer go={go} goAnchor={goAnchor} />
    </div>
  );
}

/* ═══ HERO ═══════════════════════════════════════════════════ */
function Hero({ go, goAnchor, runningText, rtActive }: { go: (v: ViewKey) => void; goAnchor: (id: string) => void; runningText: string; rtActive: boolean }) {
  return (
    <section id="beranda" className="relative overflow-hidden bg-[#061C2C]">
      {rtActive && runningText && (
        <div className="relative z-10 bg-gradient-to-r from-[#C9A227] via-[#E0C15A] to-[#C9A227] overflow-hidden">
          <div className="flex w-max animate-sip-marquee gap-16 py-2 px-6">
            {[0, 1, 2].map((dup) => (
              <span key={dup} className="inline-flex items-center gap-3 text-sm font-semibold whitespace-nowrap text-[#061C2C]">
                <span aria-hidden>📢</span>
                {runningText}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-[#061C2C] via-[#0B2A3D] to-[#123A52]" />
      <div className="absolute inset-0 sip-grid-pattern" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#061C2C]/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left */}
          <div className="text-center lg:col-span-6 lg:text-left">
            <span className="inline-flex items-center gap-3 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 py-1.5 pl-2 pr-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#E0C15A]">
              <img
                src="/logo-kemenimipas.png"
                alt="Logo Kementerian Imigrasi dan Pemasyarakatan"
                className="size-14 rounded-full ring-2 ring-[#C9A227]/50"
                width={56}
                height={56}
              />
              <span className="leading-snug">
                <span className="block">Kementerian Imigrasi dan Pemasyarakatan Republik Indonesia</span>
                <span className="block font-medium text-[#E0C15A]/80">Lembaga Pemasyarakatan Kelas IIA Bontang</span>
              </span>
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:mx-0 lg:text-[44px]">
              Pelayanan Pemasyarakatan yang{" "}
              <span className="sip-gold-text">Profesional, Transparan,</span> dan Terintegrasi
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base lg:mx-0">
              SIPADUPAS menghadirkan layanan informasi, kunjungan, pengaduan, dan
              pelayanan pemasyarakatan secara mudah, cepat, transparan, dan terpercaya
              — dalam satu platform digital terpadu.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button
                onClick={() => go("kunjungan")}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E0C15A] px-5 text-sm font-semibold text-[#061C2C] shadow-lg shadow-black/30 transition hover:brightness-110"
              >
                Kunjungan Online
                <ArrowRight className="size-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => goAnchor("layanan")}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat Semua Layanan
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/60 lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" strokeWidth={1.75} /> 1000+ Pengunjung
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileCheck className="size-3.5" strokeWidth={1.75} /> 500+ Layanan Publik
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" strokeWidth={1.75} /> 98% SKM Puas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" strokeWidth={1.75} /> Dukungan 24/7
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="relative hidden lg:col-span-6 lg:block">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/public/site-settings")
      .then((r) => r.json())
      .then((json) => {
        if (active && json?.success && json.data?.heroImage) setHeroImage(json.data.heroImage);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative ml-auto max-w-[520px] animate-sip-float">
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0B2A3D] via-[#082436] to-[#061C2C] p-8 shadow-2xl">
        <div className="sip-grid-pattern absolute inset-0 opacity-40" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#E0C15A]">
            <BadgeCheck className="size-3.5" /> Platform Resmi
          </span>

          <div className="mt-5 flex items-center gap-4">
            <img
              src="/logo-kemenimipas.png"
              alt="Logo Kementerian Imigrasi dan Pemasyarakatan"
              className="size-20 rounded-full ring-2 ring-[#C9A227]/40"
              width={80}
              height={80}
            />
            <div>
              <p className="text-lg font-bold text-white">SIPADUPAS</p>
              <p className="text-xs text-white/60">Lapas Kelas IIA Bontang</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { i: QrCode, l: "Tiket Digital QR" },
              { i: CalendarCheck, l: "Booking Online" },
              { i: Star, l: "SKM 98%" },
              { i: ShieldCheck, l: "Terpercaya" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5">
                <s.i className="size-4 text-[#E0C15A]" strokeWidth={1.75} />
                <span className="text-xs font-medium text-white/80">{s.l}</span>
              </div>
            ))}
          </div>

          {heroImage ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-[#C9A227]/30">
              <img
                src={heroImage}
                alt="Foto Lapas Kelas IIA Bontang"
                className="h-44 w-full object-cover sm:h-52"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ═══ QUICK ACCESS (SECTION 5) ═══════════════════════════════════ */
function QuickAccess({ go }: { go: (v: ViewKey) => void }) {
  const items: { icon: typeof Info; title: string; desc: string; go: ViewKey }[] = [
    { icon: CalendarCheck, title: "Kunjungan Online", desc: "Booking kunjungan dengan pilih sesi & tiket digital.", go: "kunjungan" },
    { icon: MessageSquareWarning, title: "Pengaduan Publik", desc: "Kirim pengaduan dengan kode lacak.", go: "pengaduan" },
    { icon: FileText, title: "Layanan", desc: " Info PB, CB, CMB & layanan lain.", go: "informasi" },
    { icon: Search, title: "Cek Status", desc: "Cek status layanan/pengaduan.", go: "pengaduan" },
    { icon: Landmark, title: "Informasi Publik", desc: "Akses info resmi Lapas.", go: "tentang" },
    { icon: ShoppingBag, title: "Produk WBP", desc: "Kerajinan warga binaan.", go: "produk" },
  ];

  return (
    <section id="layanan-cepat" className="border-b border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
            Akses Cepat
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17212B] sm:text-3xl">
            Layanan Utama SIPADUPAS
          </h2>
          <p className="mt-2 text-slate-500">
            Akses langsung ke layanan digital yang paling sering digunakan.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <button
              key={it.title}
              onClick={() => go(it.go)}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 animate-sip-fade-up hover:-translate-y-0.5 hover:border-[#C9A227]/40 hover:shadow-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#061C2C] text-white shadow-md transition-transform group-hover:scale-110">
                <it.icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-slate-900">{it.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">{it.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ STATISTICS (SECTION 6) ═══════════════════════════════════════ */
function StatsSection() {
  return (
    <section id="statistik" className="bg-[#0B2A3D] py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: Users, value: 1000, suffix: "+", label: "Pengunjung" },
            { icon: FileCheck, value: 500, suffix: "+", label: "Layanan Publik" },
            { icon: CheckCircle2, value: 98, suffix: "%", label: "Pengaduan Ditangani" },
            { icon: Eye, value: 100, suffix: "%", label: "Informasi Publik" },
            { icon: Clock, value: 24, suffix: "/7", label: "Dukungan 24/7" },
          ].map((s) => (
            <CountUpStat key={s.label} icon={s.icon} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUpStat({ icon: Ico, value, suffix, label }: { icon: typeof Info; value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const dur = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setDisplay(Math.round(p * value));
      if (p < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <Ico className="mx-auto size-5 text-[#E0C15A]" strokeWidth={1.75} />
      <div className="mt-2 text-2xl font-bold text-white">
        {display.toLocaleString("id-ID")}
        {suffix}
      </div>
      <div className="text-[11px] uppercase tracking-widest text-white/60">{label}</div>
    </div>
  );
}

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

/* ═══ TENTANG SIPADUPAS (SECTION 7) ════════════════════════════════ */
function AboutSection({ go }: { go: (v: ViewKey) => void }) {
  const bullets = [
    "Pelayanan lebih mudah",
    "Informasi lebih transparan",
    "Pengaduan lebih terstruktur",
    "Monitoring lebih efektif",
    "Data terdokumentasi",
  ];
  return (
    <section id="tentang" className="bg-[#F7F8FA] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-[#061C2C] p-8 shadow-xl">
              <div className="sip-grid-pattern absolute inset-0 opacity-30" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#C9A227]">
                    <Building2 className="size-5 text-[#061C2C]" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">Lapas Kelas IIA Bontang</p>
                    <p className="text-[11px] text-white/60">Kalimantan Timur, Indonesia</p>
                  </div>
                </div>
                <div className="h-px w-full bg-white/10" />
                <p className="text-sm leading-relaxed text-white/80">
                  Gedung Lapas · Pelayanan publik · Pembinaan Warga Binaan
                  dalam satu lingkungan pelayanan yang profesional dan humanis.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  {["412+", "38", "24/7"].map((v, i) => (
                    <div key={i} className="rounded-lg bg-white/5 px-2 py-3">
                      <p className="text-base font-bold text-[#E0C15A]">{v}</p>
                      <p className="text-[10px] text-white/60">Data Terkini</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right text */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
              Tentang SIPADUPAS
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17212B] sm:text-3xl">
              Satu Platform untuk Pelayanan Pemasyarakatan yang Lebih Mudah
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              SIPADUPAS merupakan sistem informasi dan pelayanan terpadu yang dikembangkan
              untuk mendukung transparansi, kemudahan akses informasi, pelayanan publik,
              serta pengelolaan data dan monitoring Pemasyarakatan di Lapas Kelas IIA Bontang.
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="size-4 text-[#C9A227]" strokeWidth={2} />
                  {b}
                </li>
              ))}
            </ul>
            <button
              onClick={() => go("tentang")}
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-[#061C2C] px-5 text-sm font-semibold text-white transition hover:bg-[#0B2A3D]"
            >
              Pelajari SIPADUPAS
              <ArrowRight className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ LAYANAN UTAMA (SECTION 8) ═════════════════════════════════════ */
function ServicesSection({ go }: { go: (v: ViewKey) => void }) {
  return (
    <section id="layanan" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
            Layanan Unggulan
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17212B] sm:text-3xl">
            Layanan Pemasyarakatan
          </h2>
          <p className="mt-2 text-slate-500">
            Layanan publik terpadu yang dapat diakses masyarakat secara mudah dan transparan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MAIN_SERVICES.map((s, i) => (
            <button
              key={s.name}
              onClick={() => {
                if (s.view === "kontak") {
                  document.getElementById("kontak")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  go(s.view as ViewKey);
                }
              }}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/50 hover:shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#F7F8FA] text-[#061C2C] ring-1 ring-slate-200 transition-all group-hover:bg-[#061C2C] group-hover:text-white">
                <s.icon className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{s.name}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ MONITORING PEMASYARAKATAN (SECTION 9) ═══════════════════════ */
function MonitoringSection() {
  return (
    <section id="monitoring" className="bg-[#061C2C] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E0C15A]">
            Transparansi Data
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Monitoring Pemasyarakatan
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Data pemasyarakatan yang aman untuk publik, dikelola dan diperbarui dari database.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MONITOR_DATA.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#C9A227]/50 hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#C9A227]/15 text-[#E0C15A]">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    Publik
                  </span>
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-bold text-white">{m.value}</span>
                  {m.unit && <span className="pb-1 text-xs text-white/50">{m.unit}</span>}
                </div>
                <p className="mt-1 text-sm font-semibold text-[#E0C15A]">{m.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{m.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══ BERITA (SECTION 10) ═══════════════════════════════════════════ */
function NewsSection({ go }: { go: (v: ViewKey) => void }) {
  const news = dataPublikasi.slice(0, 3);
  return (
    <section id="berita" className="bg-[#F7F8FA] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
              Berita & Informasi
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17212B] sm:text-3xl">
              Berita &amp; Informasi Terbaru
            </h2>
          </div>
          <button
            onClick={() => go("berita")}
            className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-[#061C2C] hover:text-[#C9A227] sm:inline-flex"
          >
            Lihat Semua Berita
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {news.map((n, i) => (
            <button
              key={n.id}
              onClick={() => go("berita")}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative flex h-36 items-center justify-center bg-[#061C2C]">
                <span className="absolute left-3 top-3 rounded-full bg-[#C9A227] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#061C2C]">
                  {n.jenis}
                </span>
                <Newspaper className="size-9 text-white/30 transition-transform group-hover:scale-110" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-medium text-slate-400">{n.tanggal}</p>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#0B2A3D]">
                  {n.judul}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{n.ringkas}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C9A227]">
                  Baca Selengkapnya
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <button
            onClick={() => go("berita")}
            className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-[#061C2C]"
          >
            Lihat Semua Berita
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══ GALERI KEGIATAN (SECTION 11) ═══════════════════════════════════ */
function GallerySection({ go }: { go: (v: ViewKey) => void }) {
  const galeriItems = dataGaleri.slice(0, 6);
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <>
    <section id="galeri" className="bg-[#061C2C] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E0C15A]">
              Dokumentasi Kegiatan
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Galeri Kegiatan
            </h2>
          </div>
          <button
            onClick={() => go("galeri")}
            className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-white hover:text-[#E0C15A] sm:inline-flex"
          >
            Lihat Semua Galeri
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {galeriItems.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setLightbox(g.id)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/50"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative flex h-32 items-center justify-center bg-[#0B2A3D]">
                <span className="absolute left-3 top-3 rounded-full bg-[#C9A227] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#061C2C]">
                  {g.kategori}
                </span>
                <Camera className="size-9 text-white/30 transition-transform group-hover:scale-110" />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-medium text-white/40">{g.tanggal}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white group-hover:text-[#E0C15A]">
                  {g.judul}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-white/50">
                    <ImageIcon className="size-3.5" strokeWidth={1.75} />
                    {g.jumlahFoto} foto
                  </span>
                  <Eye className="size-3.5 text-[#C9A227]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>

    {/* Lightbox */}
    <Dialog open={!!lightbox} onOpenChange={(o) => { if (!o) setLightbox(null); }}>
      <DialogContent className="max-w-3xl border-white/10 bg-[#0B2A3D] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{lightbox}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-white/60">
          {galeriItems.find((g) => g.id === lightbox)?.ringkas}
        </DialogDescription>
        <div className="mt-2 text-[11px] text-white/40">
          {galeriItems.find((g) => g.id === lightbox)?.tanggal} · {galeriItems.find((g) => g.id === lightbox)?.kategori}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

/* ═══ PRODUK WBP (SECTION 12) ═════════════════════════════════════ */
function ProductSection({ go }: { go: (v: ViewKey) => void }) {
  const products = dataProduk.slice(0, 4);
  return (
    <section id="produk" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
            Karya & Produk WBP
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17212B] sm:text-3xl">
            Karya &amp; Produk Warga Binaan
          </h2>
          <p className="mt-2 text-slate-500">
            Hasil karya dan keterampilan warga binaan yang dipasarkan secara resmi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <button
              key={p.id}
              onClick={() => go("produk")}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/50 hover:shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-[#061C2C] to-[#0B2A3D]">
                <span className="absolute left-3 top-3 rounded-full bg-[#C9A227] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#061C2C]">
                  {p.kategori}
                </span>
                <Package className="size-9 text-white/30 transition-transform group-hover:scale-110" />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-medium text-slate-400">{p.harga}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#0B2A3D]">
                  {p.nama}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{p.deskripsi}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C9A227]">
                  {p.ketersediaan}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <button
            onClick={() => go("produk")}
            className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-[#061C2C]"
          >
            Lihat Semua Produk
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══ PENGADUAN CTA (SECTION 13) ═══════════════════════════════════ */
function ComplaintCta({ go }: { go: (v: ViewKey) => void }) {
  return (
    <section className="bg-gradient-to-br from-[#061C2C] via-[#0B2A3D] to-[#061C2C] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-[#C9A227]/25 bg-[#0B2A3D] p-8 sm:p-12 relative">
          <div className="sip-grid-pattern absolute inset-0 opacity-20" />
          <div className="relative flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#E0C15A]">
              <MessageSquareWarning className="size-7 text-[#061C2C]" strokeWidth={1.75} />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Punya Pengaduan atau Masukan?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Sampaikan pengaduan Anda melalui SIPADUPAS dan pantau proses
              penanganannya secara transparan.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => go("pengaduan")}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E0C15A] px-5 text-sm font-semibold text-[#061C2C] shadow-lg transition hover:brightness-110"
              >
                Buat Pengaduan
                <ArrowRight className="size-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => go("pengaduan")}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lacak Pengaduan
              </button>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-white/50">
              <BadgeCheck className="size-4 text-[#E0C15A]" />
              Setiap pengaduan mendapatkan kode unik untuk memantau status penanganan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ KUNJUNGAN ONLINE (SECTION 14) ═════════════════════════════════ */
function VisitSection({ go }: { go: (v: ViewKey) => void }) {
  return (
    <section id="kunjungan" className="bg-[#F7F8FA] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
            Kunjungan Online
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17212B] sm:text-3xl">
            Rencanakan Kunjungan Anda
          </h2>
          <p className="mt-2 text-slate-500">
            Booking kunjungan dari mana saja, tanpa antre.
          </p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {VISIT_STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#C9A227]/40 hover:shadow-md"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#061C2C] text-white">
                    <s.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      <span className="mr-1 text-[#C9A227]">{i + 1}.</span>
                      {s.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#061C2C] to-[#0B2A3D] p-7">
              <div>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#E0C15A]">
                  <CalendarCheck className="size-6 text-[#061C2C]" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">Daftar Kunjungan Online</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  Pilih tanggal, sesi, dan lengkapi data pemohon. Tiket digital
                  ber-QR Code terbit otomatis setelah disetujui.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Pilih tanggal", "Pilih sesi", "Tiket + QR", "Check-in"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-3 py-1 text-[11px] font-medium text-[#E0C15A]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => go("kunjungan")}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E0C15A] text-sm font-semibold text-[#061C2C] shadow-lg transition hover:brightness-110"
                >
                  Daftar Kunjungan Online
                  <ArrowRight className="size-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() => go("kunjungan")}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <QrCode className="size-4" strokeWidth={1.75} />
                  Cek Tiket Kunjungan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ SKM SECTION (15) ═════════════════════════════════════════ */
function SkmSection({ go }: { go: (v: ViewKey) => void }) {
  const skmData = dataSKMSurvey.slice(0, 3);
  return (
    <section id="skm" className="bg-[#061C2C] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
            Survei Kepuasan Masyarakat
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            SKM — Suara Masyarakat
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Survei kepuasan terhadap layanan Lapas, diolah dan ditampilkan
            secara transparan dari database.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {skmData.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#C9A227]/50"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#C9A227]/15 text-[#E0C15A]">
                  <Star className="size-5" strokeWidth={1.75} />
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  {d.responden} responden
                </span>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{d.nilai}</span>
                <span className="pb-1 text-xs text-white/50">/ 100</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#E0C15A]">{d.predikat}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">{d.periode} · {d.status}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => go("skm")}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Lihat Detail SKM
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══ FINAL CTA (SECTION 16) ═════════════════════════════════════ */
function FinalCta({ go }: { go: (v: ViewKey) => void }) {
  return (
    <section className="relative overflow-hidden bg-[#0B2A3D] py-20">
      <div className="absolute inset-0 sip-grid-pattern opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E0C15A]">
          Akses Layanan SIPADUPAS
        </span>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Pelayanan Pemasyarakatan yang Mudah, Transparan, dan Terintegrasi
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => go("kunjungan")}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E0C15A] px-6 text-sm font-semibold text-[#061C2C] shadow-lg transition hover:brightness-110"
          >
            Kunjungan Online
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => go("pengaduan")}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Layanan Publik
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══ FOOTER (SECTION 17) ═══════════════════════════════════════ */
export function Footer({ go, goAnchor }: { go: (v: ViewKey) => void; goAnchor: (id: string) => void }) {
  return (
    <footer id="kontak" className="bg-[#061C2C] pt-16 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo SIPADUPAS"
                className="size-10 rounded-xl"
                width={40}
                height={40}
              />
              <div>
                <p className="text-base font-bold tracking-[0.08em]">SIPADUPAS</p>
                <p className="text-[11px] text-white/50">Lapas Kelas IIA Bontang</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan.
              Portal digital resmi pelayanan publik Lapas Kelas IIA Bontang.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#E0C15A]">
              Navigasi
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {[
                { label: "Beranda", act: () => go("landing") },
                { label: "Berita", act: () => go("berita") },
                { label: "Galeri", act: () => go("galeri") },
                { label: "Tentang Lapas", act: () => go("tentang") },
                { label: "SKM", act: () => go("skm") },
              ].map((n) => (
                <li key={n.label}>
                  <button onClick={n.act} className="transition-colors hover:text-[#E0C15A]">
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#E0C15A]">
              Layanan
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {[
                { label: "Kunjungan Online", act: () => go("kunjungan") },
                { label: "Pengaduan Publik", act: () => go("pengaduan") },
                { label: "Informasi Layanan", act: () => go("informasi") },
                { label: "Produk WBP", act: () => go("produk") },
                { label: "Cek Status", act: () => go("pengaduan") },
              ].map((n) => (
                <li key={n.label}>
                  <button onClick={n.act} className="transition-colors hover:text-[#E0C15A]">
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#E0C15A]">
              Hubungi Kami
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#C9A227]" strokeWidth={1.75} />
                Jl. Brigjen Katamso No. 1, Bontang, Kalimantan Timur
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#C9A227]" strokeWidth={1.75} />
                (0548) 222-333
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-[#C9A227]" strokeWidth={1.75} />
                lapas.bontang@kemenkumham.go.id
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-[#C9A227]" strokeWidth={1.75} />
                Senin – Jumat, 08.00 – 16.00 WITA
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} SIPADUPAS — Lapas Kelas IIA Bontang. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-white/70">Kebijakan Privasi</button>
            <button className="hover:text-white/70">Syarat &amp; Ketentuan</button>
            <button className="hover:text-white/70">Aksesibilitas</button>
          </div>
        </div>
      </div>
    </footer>
  );
}