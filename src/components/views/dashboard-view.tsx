"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  CalendarCheck,
  MessageSquareWarning,
  AlertTriangle,
  Stethoscope,
  Wrench,
  Activity,
  ShieldCheck,
  LayoutDashboard,
  Clock,
  FileBarChart,
  Award,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

// ---------- API response types ----------
interface DashboardData {
  totalWBP: number;
  kapasitas: number;
  occupancyRate: number;
  rawatInapCount: number;
  kerjaLuarCount: number;
  isolasiCount: number;
  kunjunganHariIni: number;
  pengaduanAktif: number;
  gangguanAktif: number;
  kehadiranPembinaan: number;
  skmScore: number;
  distribusiBlok: { blok: string; kapasitas: number; terisi: number }[];
  statusWBP: { status: string; total: number }[];
}

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];

const STATUS_COLOR_MAP: Record<string, string> = {
  Aktif: "var(--chart-1)",
  "Rawat Inap": "var(--chart-2)",
  "Kerja Luar": "var(--chart-3)",
  Isolasi: "var(--chart-4)",
  Bebas: "var(--chart-5)",
};

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = useAppStore((state) => state.currentUser?.token);

  const fetchDashboard = useCallback(async () => {
    if (!token) {
      setData(null);
      setErrorMessage("Sesi login tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Data dashboard gagal dimuat");
      }

      // Dashboard API returns the data directly. Keep compatibility with
      // the standard { success, data } response shape used by other APIs.
      const payload = json?.data && json?.success ? json.data : json;
      if (!payload || typeof payload.totalWBP !== "number") {
        throw new Error("Format data dashboard tidak valid");
      }
      setData(payload as DashboardData);
    } catch (err) {
      setData(null);
      setErrorMessage(err instanceof Error ? err.message : "Data dashboard belum dapat dimuat. Silakan coba lagi.");
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Pimpinan"
          description="Ringkasan operasional harian Lapas Kelas IIA Bontang"
          badge="LIVE"
          icon={LayoutDashboard}
        />
        {errorMessage ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive mb-3">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
              Coba Lagi
            </Button>
          </div>
        ) : null}
        {/* Skeleton grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-3 bg-muted rounded w-20 mb-3" />
              <div className="h-8 bg-muted rounded w-12 mb-2" />
              <div className="h-3 bg-muted rounded w-28" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-40 mb-1" />
            <div className="h-3 bg-muted rounded w-24 mb-4" />
            <div className="h-52 bg-muted/50 rounded" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-1" />
            <div className="h-3 bg-muted rounded w-20 mb-4" />
            <div className="h-36 bg-muted/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const occupancyRate = data.kapasitas > 0 ? Math.round((data.totalWBP / data.kapasitas) * 100) : 0;

  const blokChartData = data.distribusiBlok.map((b) => ({
    blok: b.blok,
    wbp: b.terisi,
    kapasitas: b.kapasitas,
  }));

  const statusChartData = data.statusWBP.map((s, i) => ({
    name: s.status,
    value: s.total,
    color: STATUS_COLOR_MAP[s.status] || CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Refresh button in header */}
      <PageHeader
        title="Dashboard Pimpinan"
        description="Ringkasan operasional harian Lapas Kelas IIA Bontang — pemantauan terpadu seluruh modul SIPADUPAS."
        badge="LIVE"
        icon={LayoutDashboard}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Laporan berhasil diunduh")}>
              <FileBarChart className="size-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total WBP"
          value={data.totalWBP}
          icon={Users}
          sub={`Kapasitas ${data.kapasitas} · ${occupancyRate}% terisi`}
          accent="primary"
        />
        <StatCard
          label="Kunjungan Hari Ini"
          value={data.kunjunganHariIni}
          icon={CalendarCheck}
          sub="Kunjungan tercatat"
          accent="accent"
        />
        <StatCard
          label="Pengaduan Aktif"
          value={data.pengaduanAktif}
          icon={MessageSquareWarning}
          sub="Menunggu & diproses"
          accent="warning"
        />
        <StatCard
          label="Gangguan Keamanan"
          value={data.gangguanAktif}
          icon={AlertTriangle}
          sub="Open & in progress"
          accent="danger"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard
          title="Distribusi WBP per Blok"
          description="Okupansi blok/kamar"
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blokChartData} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="blok" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="kapasitas" name="Kapasitas" fill="var(--muted)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wbp" name="Terisi" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Status WBP"
          description={`${data.totalWBP} WBP total`}
        >
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {statusChartData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-semibold ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SectionCard
          title="Indikator Kinerja"
          description="SKM & kepatuhan operasional"
          className="lg:col-span-2"
        >
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
            <KpiItem label="SKM (Survei Kepuasan)" value={`${data.skmScore}`} max={100} suffix="/100" tone="primary" icon={Award} />
            <KpiItem label="Kehadiran Pembinaan" value={`${data.kehadiranPembinaan}`} max={100} suffix="%" tone="accent" icon={Activity} />
            <KpiItem label="Okupansi Lapas" value={`${occupancyRate}`} max={100} suffix="%" tone="warning" icon={Users} />
            <KpiItem label="Kunjungan Hari Ini" value={`${data.kunjunganHariIni}`} max={Math.max(data.kapasitas, 1)} suffix="" tone="primary" icon={CalendarCheck} />
          </div>
        </SectionCard>

        <SectionCard
          title="Snapshot Pengamanan"
          description="Status khusus WBP"
        >
          <div className="grid grid-cols-2 gap-3">
            <SnapshotMini icon={Stethoscope} label="Rawat Inap" value={data.rawatInapCount} tone="warning" />
            <SnapshotMini icon={Wrench} label="Kerja Luar" value={data.kerjaLuarCount} tone="primary" />
            <SnapshotMini icon={ShieldCheck} label="Isolasi" value={data.isolasiCount} tone="danger" />
            <SnapshotMini icon={Clock} label="Pengaduan Aktif" value={data.pengaduanAktif} tone="accent" />
          </div>
          <Separator className="my-4" />
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Gangguan aktif</span>
              <span className="font-semibold text-red-600">{data.gangguanAktif}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WBP total (aktif)</span>
              <span className="font-semibold">{data.totalWBP}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kapasitas</span>
              <span className="font-semibold">{data.kapasitas}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function KpiItem({
  label,
  value,
  max,
  suffix,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  max: number;
  suffix: string;
  tone: "primary" | "accent" | "warning" | "danger";
  icon: typeof Award;
}) {
  const num = parseFloat(value);
  const pct = Math.min(100, Math.round((num / max) * 100));
  const toneClass = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  }[tone];
  const iconClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    warning: "bg-amber-500/15 text-amber-700",
    danger: "bg-red-500/15 text-red-600",
  }[tone];

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`size-7 rounded-md flex items-center justify-center ${iconClass} group-hover:scale-110 transition-transform`}>
            <Icon className="size-3.5" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {value}
          <span className="text-xs text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${toneClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SnapshotMini({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Stethoscope;
  label: string;
  value: number;
  tone: "primary" | "accent" | "warning" | "danger";
}) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    warning: "bg-amber-500/15 text-amber-700",
    danger: "bg-red-500/15 text-red-600",
  }[tone];
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all">
      <div className={`size-10 rounded-lg flex items-center justify-center ${cls}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}