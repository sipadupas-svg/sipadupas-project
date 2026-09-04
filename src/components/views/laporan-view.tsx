"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileBarChart,
  FileText,
  FileSpreadsheet,
  Download,
  Award,
  TrendingUp,
  Users,
  CalendarCheck,
  MessageSquareWarning,
  Activity,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, SectionCard } from "./shared";
import { toast } from "sonner";

// ---------- Types ----------
interface WBPReport {
  totalWBP: number;
  byStatus: { status: string; total: number }[];
  byBlok: { blok: string; total: number }[];
  byRisiko: { risiko: string; total: number }[];
}

interface KunjunganReport {
  total: number;
  byStatus: { status: string; total: number }[];
  dateRange: { startDate: string | null; endDate: string | null };
}

interface GangguanReport {
  total: number;
  byJenis: { jenis: string; total: number }[];
  byTingkat: { tingkat: string; total: number }[];
  byStatus: { status: string; total: number }[];
  perMonth: { bulan: string; total: number }[];
}

interface PembinaanReport {
  totalProgram: number;
  programs: {
    id: string;
    nama: string;
    kategori: string;
    status: string;
    pesertaCount: number;
    kehadiranPercentage: number;
  }[];
}

interface PengaduanReport {
  total: number;
  byKategori: { kategori: string; total: number }[];
  byStatus: { status: string; total: number }[];
  avgResolutionHours: number;
}

const laporanList = [
  { nama: "Laporan Harian Operasional", periode: "Harian", format: "PDF", ukuran: "248 KB", tanggal: "18 Agu 2026" },
  { nama: "Laporan Mingguan Pengamanan", periode: "Mingguan", format: "PDF", ukuran: "1.2 MB", tanggal: "17 Agu 2026" },
  { nama: "Laporan Bulanan WBP", periode: "Bulanan", format: "Excel", ukuran: "3.8 MB", tanggal: "01 Agu 2026" },
  { nama: "Laporan SKM Triwulan II", periode: "Triwulanan", format: "PDF", ukuran: "5.4 MB", tanggal: "05 Jul 2026" },
  { nama: "Laporan Kunjungan Bulanan", periode: "Bulanan", format: "Excel", ukuran: "2.1 MB", tanggal: "01 Agu 2026" },
  { nama: "Laporan Pembinaan Semester I", periode: "Semester", format: "PDF", ukuran: "8.7 MB", tanggal: "30 Jun 2026" },
];

const radarAspek = [
  { aspek: "Pelayanan", nilai: 88 },
  { aspek: "Pengamanan", nilai: 92 },
  { aspek: "Pembinaan", nilai: 85 },
  { aspek: "Kunjungan", nilai: 89 },
  { aspek: "Fasilitas", nilai: 82 },
  { aspek: "Kecepatan", nilai: 86 },
];

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

export function LaporanView() {
  const [activeTab, setActiveTab] = useState("wbp");

  // WBP report
  const [wbpData, setWbpData] = useState<WBPReport | null>(null);
  const [wbpLoading, setWbpLoading] = useState(true);

  // Kunjungan report
  const [kunjunganData, setKunjunganData] = useState<KunjunganReport | null>(null);
  const [kunjunganLoading, setKunjunganLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Gangguan report
  const [gangguanData, setGangguanData] = useState<GangguanReport | null>(null);
  const [gangguanLoading, setGangguanLoading] = useState(false);

  // Pembinaan report
  const [pembinaanData, setPembinaanData] = useState<PembinaanReport | null>(null);
  const [pembinaanLoading, setPembinaanLoading] = useState(false);

  // Pengaduan report
  const [pengaduanData, setPengaduanData] = useState<PengaduanReport | null>(null);
  const [pengaduanLoading, setPengaduanLoading] = useState(false);

  // Dashboard stats for SKM tab
  const [skmScore, setSkmScore] = useState(0);

  const fetchReport = useCallback(async (type: string) => {
    try {
      let url = `/api/laporan?type=${type}`;
      if (type === "kunjungan" && startDate) url += `&startDate=${startDate}`;
      if (type === "kunjungan" && endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${type} report`);
      return await res.json();
    } catch {
      toast.error(`Gagal memuat laporan ${type}`);
      return null;
    }
  }, [startDate, endDate]);

  // Initial loads
  useEffect(() => {
    async function loadInitial() {
      setWbpLoading(true);
      const [wbp, dashboard] = await Promise.all([
        fetchReport("wbp"),
        fetch("/api/dashboard").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (wbp) setWbpData(wbp);
      if (dashboard) setSkmScore(dashboard.skmScore ?? 0);
      setWbpLoading(false);
    }
    loadInitial();
  }, [fetchReport]);

  // Load other reports on tab change
  useEffect(() => {
    if (activeTab === "kunjungan" && !kunjunganData) {
      setKunjunganLoading(true);
      fetchReport("kunjungan").then((d) => {
        if (d) setKunjunganData(d);
        setKunjunganLoading(false);
      });
    }
    if (activeTab === "gangguan" && !gangguanData) {
      setGangguanLoading(true);
      fetchReport("gangguan").then((d) => {
        if (d) setGangguanData(d);
        setGangguanLoading(false);
      });
    }
    if (activeTab === "pembinaan" && !pembinaanData) {
      setPembinaanLoading(true);
      fetchReport("pembinaan").then((d) => {
        if (d) setPembinaanData(d);
        setPembinaanLoading(false);
      });
    }
    if (activeTab === "pengaduan" && !pengaduanData) {
      setPengaduanLoading(true);
      fetchReport("pengaduan").then((d) => {
        if (d) setPengaduanData(d);
        setPengaduanLoading(false);
      });
    }
  }, [activeTab, kunjunganData, gangguanData, pembinaanData, pengaduanData, fetchReport]);

  function handleFilterKunjungan() {
    setKunjunganLoading(true);
    fetchReport("kunjungan").then((d) => {
      if (d) setKunjunganData(d);
      setKunjunganLoading(false);
    });
  }

  function handleExport() {
    toast.success("Laporan berhasil diunduh");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard & Reporting"
        description="Statistik, indikator kinerja, SKM, dan laporan operasional dalam format PDF/Excel."
        badge="Analitik"
        icon={FileBarChart}
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleExport}>
              <Download className="size-4 mr-1" /> Generate Laporan
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="wbp">WBP</TabsTrigger>
          <TabsTrigger value="kunjungan">Kunjungan</TabsTrigger>
          <TabsTrigger value="gangguan">Gangguan</TabsTrigger>
          <TabsTrigger value="pembinaan">Pembinaan</TabsTrigger>
          <TabsTrigger value="pengaduan">Pengaduan</TabsTrigger>
          <TabsTrigger value="skm">SKM</TabsTrigger>
          <TabsTrigger value="laporan">Generate Laporan</TabsTrigger>
        </TabsList>

        {/* ========== WBP TAB ========== */}
        <TabsContent value="wbp" className="space-y-4">
          {wbpLoading ? <LoadingState /> : wbpData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiBlock label="Total WBP" value={`${wbpData.totalWBP}`} sub="Seluruh status" icon={Users} />
                <KpiBlock label="WBP per Blok" value={`${wbpData.byBlok.length}`} sub="Blok terisi" icon={ShieldCheck} />
                <KpiBlock label="Tingkat Risiko" value={`${wbpData.byRisiko.length}`} sub="Kategori risiko" icon={Activity} />
                <KpiBlock label="Status Aktif" value={`${wbpData.byStatus.length}`} sub="Kategori status" icon={CheckCircle2} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <SectionCard title="WBP per Blok" description="Distribusi blok">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={wbpData.byBlok} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="blok" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="total" name="Jumlah WBP" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="WBP per Status" description="Status terkini">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wbpData.byStatus}
                          dataKey="total"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ status, total }) => `${status}: ${total}`}
                          labelLine={false}
                        >
                          {wbpData.byStatus.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
            </>
          )}
        </TabsContent>

        {/* ========== KUNJUNGAN TAB ========== */}
        <TabsContent value="kunjungan" className="space-y-4">
          <SectionCard
            title="Statistik Kunjungan"
            description="Total kunjungan per status"
            action={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36 h-9 text-xs" />
                  <span className="text-xs text-muted-foreground">s/d</span>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36 h-9 text-xs" />
                </div>
                <Button size="sm" variant="outline" onClick={handleFilterKunjungan}>
                  <Filter className="size-4 mr-1" /> Filter
                </Button>
              </div>
            }
          >
            {kunjunganLoading ? <LoadingState /> : kunjunganData && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <KpiBlock label="Total Kunjungan" value={`${kunjunganData.total}`} sub={kunjunganData.dateRange.startDate ? `${kunjunganData.dateRange.startDate} s/d ${kunjunganData.dateRange.endDate}` : "Semua periode"} icon={CalendarCheck} />
                  {kunjunganData.byStatus.map((s) => (
                    <KpiBlock key={s.status} label={s.status} value={`${s.total}`} sub="kunjungan" icon={CalendarCheck} />
                  ))}
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kunjunganData.byStatus} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="status" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="total" name="Jumlah" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </SectionCard>
        </TabsContent>

        {/* ========== GANGGUAN TAB ========== */}
        <TabsContent value="gangguan" className="space-y-4">
          {gangguanLoading ? <LoadingState /> : gangguanData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiBlock label="Total Gangguan" value={`${gangguanData.total}`} sub="Seluruh waktu" icon={ShieldCheck} />
                <KpiBlock label="Jenis" value={`${gangguanData.byJenis.length}`} sub="Kategori" icon={MessageSquareWarning} />
                <KpiBlock label="Aktif" value={`${gangguanData.byStatus.filter((s) => s.status === "OPEN" || s.status === "IN_PROGRESS").reduce((a, b) => a + b.total, 0)}`} sub="Open + In Progress" icon={AlertTriangle} />
                <KpiBlock label="Tingkat" value={`${gangguanData.byTingkat.length}`} sub="Kategori tingkat" icon={Activity} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <SectionCard title="Gangguan per Jenis" description="Distribusi jenis">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gangguanData.byJenis} layout="vertical" margin={{ left: 30, right: 16, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="jenis" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="total" name="Jumlah" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="Tren Gangguan Bulanan" description="Per bulan tahun ini">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={gangguanData.perMonth} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="bulan" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="total" name="Gangguan" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
            </>
          )}
        </TabsContent>

        {/* ========== PEMBINAAN TAB ========== */}
        <TabsContent value="pembinaan" className="space-y-4">
          {pembinaanLoading ? <LoadingState /> : pembinaanData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiBlock label="Total Program" value={`${pembinaanData.totalProgram}`} sub="Terdaftar" icon={Activity} />
                <KpiBlock label="Total Peserta" value={`${pembinaanData.programs.reduce((a, p) => a + p.pesertaCount, 0)}`} sub="Seluruh program" icon={Users} />
                <KpiBlock label="Rata-rata Kehadiran" value={`${Math.round(pembinaanData.programs.reduce((a, p) => a + p.kehadiranPercentage, 0) / (pembinaanData.programs.length || 1))}%`} sub="Kehadiran" icon={TrendingUp} />
                <KpiBlock label="Program Berjalan" value={`${pembinaanData.programs.filter((p) => p.status === "Berjalan").length}`} sub="Aktif" icon={CheckCircle2} />
              </div>

              <SectionCard title="Daftar Program Pembinaan" description={`${pembinaanData.totalProgram} program`}>  
                <div className="max-h-96 overflow-y-auto scroll-thin">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pembinaanData.programs.map((p) => (
                      <div key={p.id} className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-[10px]">{p.kategori}</Badge>
                          <Badge className={p.status === "Berjalan" ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20" : "bg-muted text-muted-foreground"}>{p.status}</Badge>
                        </div>
                        <h3 className="text-sm font-semibold mt-1">{p.nama}</h3>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>Peserta</span><span className="font-medium text-foreground">{p.pesertaCount}</span></div>
                          <div className="flex justify-between"><span>Kehadiran</span><span className="font-medium text-foreground">{p.kehadiranPercentage}%</span></div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${p.kehadiranPercentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </>
          )}
        </TabsContent>

        {/* ========== PENGADUAN TAB ========== */}
        <TabsContent value="pengaduan" className="space-y-4">
          {pengaduanLoading ? <LoadingState /> : pengaduanData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiBlock label="Total Pengaduan" value={`${pengaduanData.total}`} sub="Seluruh" icon={MessageSquareWarning} />
                <KpiBlock label="Selesai" value={`${pengaduanData.byStatus.find((s) => s.status === "Selesai")?.total ?? 0}`} sub="Ditangani" icon={CheckCircle2} />
                <KpiBlock label="Aktif" value={`${pengaduanData.byStatus.filter((s) => ["Baru", "Diverifikasi", "Diproses"].includes(s.status)).reduce((a, b) => a + b.total, 0)}`} sub="Menunggu tindak lanjut" icon={AlertTriangle} />
                <KpiBlock label="Avg. Resolusi" value={`${pengaduanData.avgResolutionHours}h`} sub="Waktu penyelesaian" icon={TrendingUp} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <SectionCard title="Pengaduan per Kategori" description="Distribusi kategori">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pengaduanData.byKategori} layout="vertical" margin={{ left: 30, right: 16, top: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="kategori" type="category" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="total" name="Jumlah" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="Pengaduan per Status" description="Status terkini">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pengaduanData.byStatus}
                          dataKey="total"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ status, total }) => `${status}: ${total}`}
                          labelLine={false}
                        >
                          {pengaduanData.byStatus.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
            </>
          )}
        </TabsContent>

        {/* ========== SKM TAB ========== */}
        <TabsContent value="skm" className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide opacity-80">SKM Saat Ini</span>
                  <Award className="size-5 opacity-80" />
                </div>
                <div className="text-4xl font-bold">{skmScore || "-"}</div>
                <div className="text-xs opacity-80 mt-1">dari 100</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Sumber Data</span>
                  <TrendingUp className="size-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold flex items-baseline gap-2">
                  Real-time
                </div>
                <div className="text-xs text-muted-foreground mt-1">Data dari SKM Response</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Predikat</span>
                  <Users className="size-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{skmScore >= 88 ? "A" : skmScore >= 76 ? "B" : skmScore >= 60 ? "C" : "D"}</div>
                <div className="text-xs text-muted-foreground mt-1">Berdasarkan skor SKM</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <SectionCard title="Indeks Kinerja per Aspek" description="Radar 6 dimensi pelayanan">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarAspek} outerRadius={90}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="aspek" stroke="var(--muted-foreground)" fontSize={11} />
                    <PolarRadiusAxis stroke="var(--muted-foreground)" fontSize={10} angle={90} domain={[0, 100]} />
                    <Radar name="Nilai" dataKey="nilai" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Keterangan" description="Interpretasi SKM">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <span>Predikat A (88-100)</span>
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-600/20">Sangat Baik</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <span>Predikat B (76-87)</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Baik</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <span>Predikat C (60-75)</span>
                  <Badge className="bg-amber-500/15 text-amber-700 border-amber-600/20">Kurang</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <span>Predikat D (&lt;60)</span>
                  <Badge className="bg-red-500/15 text-red-600 border-red-600/20">Buruk</Badge>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ========== GENERATE LAPORAN TAB ========== */}
        <TabsContent value="laporan" className="space-y-4">
          <SectionCard
            title="Generate Laporan"
            description="Unduh laporan operasional dalam format PDF atau Excel"
            action={
              <Button size="sm" variant="outline">
                <Filter className="size-4 mr-1" /> Filter
              </Button>
            }
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {laporanList.map((l) => (
                <Card key={l.nama} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`size-11 rounded-lg flex items-center justify-center ${l.format === "PDF" ? "bg-red-500/15 text-red-600" : "bg-emerald-500/15 text-emerald-700"}`}>
                        {l.format === "PDF" ? <FileText className="size-5" /> : <FileSpreadsheet className="size-5" />}
                      </div>
                      <Badge variant="outline" className="text-[10px]">{l.periode}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight">{l.nama}</h3>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
                      <span>{l.format}</span>
                      <span>·</span>
                      <span>{l.ukuran}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Terakhir: {l.tanggal}</div>
                    <Button size="sm" variant="outline" className="w-full mt-4" onClick={() => toast.success("Laporan berhasil diunduh")}>
                      <Download className="size-4 mr-1" /> Unduh
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiBlock({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Users }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
