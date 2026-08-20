"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Activity,
  RefreshCw,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────────────

interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  detail: string;
  timestamp: number;
}

interface SecurityStats {
  totalToday: number;
  byType: Record<string, number>;
  failedLoginCount: number;
  lockedAccounts: number;
  rateLimitedCount: number;
  criticalEvents: number;
  suspiciousActivityCount: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    events: SecurityEvent[];
    stats: SecurityStats;
  };
}

// ─── Constants ──────────────────────────────────────────────────────────

const EVENT_TYPES = [
  "LOGIN_FAILED",
  "LOGIN_SUCCESS",
  "ACCOUNT_LOCKED",
  "ACCOUNT_UNLOCKED",
  "RATE_LIMITED",
  "SUSPICIOUS_ACTIVITY",
  "PERMISSION_DENIED",
  "IDOR_ATTEMPT",
  "INVALID_TOKEN",
  "SESSION_EXPIRED",
  "BRUTE_FORCE_DETECTED",
];

const SEVERITY_OPTIONS = ["low", "medium", "high", "critical"];

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const SEVERITY_LABELS: Record<string, string> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  critical: "Kritis",
};

const TYPE_LABELS: Record<string, string> = {
  LOGIN_FAILED: "Login Gagal",
  LOGIN_SUCCESS: "Login Berhasil",
  ACCOUNT_LOCKED: "Akun Terkunci",
  ACCOUNT_UNLOCKED: "Akun Terbuka",
  RATE_LIMITED: "Rate Limited",
  SUSPICIOUS_ACTIVITY: "Aktivitas Mencurigakan",
  PERMISSION_DENIED: "Izin Ditolak",
  IDOR_ATTEMPT: "Percobaan IDOR",
  INVALID_TOKEN: "Token Tidak Valid",
  SESSION_EXPIRED: "Sesi Kadaluwarsa",
  BRUTE_FORCE_DETECTED: "Brute Force",
};

// ─── Helpers ────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hh}:${mm}:${ss}`;
}

// ─── Component ──────────────────────────────────────────────────────────

export function KeamananView() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const token = useAppStore((s) => s.currentUser)?.token;

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterSeverity !== "all") params.set("severity", filterSeverity);

      const res = await fetch(`/api/admin/security-events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || `HTTP ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      if (json.success) {
        setEvents(json.data.events);
        setStats(json.data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data keamanan");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSeverity]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Keamanan"
        description="Pantau aktivitas keamanan sistem secara real-time"
      />

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Event Hari Ini
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && !stats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {stats?.totalToday ?? 0}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleRefresh}
                  aria-label="Refresh data"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Login Gagal
            </CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && !stats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {stats?.failedLoginCount ?? 0}
                </span>
                {(stats?.failedLoginCount ?? 0) > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Perhatian
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rate Limited
            </CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && !stats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-bold">
                {stats?.rateLimitedCount ?? 0}
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Akun Terkunci
            </CardTitle>
            <Lock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && !stats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {stats?.lockedAccounts ?? 0}
                </span>
                {(stats?.lockedAccounts ?? 0) > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Event Log Table ──────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Log Event Keamanan
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]" size="sm">
                <SelectValue placeholder="Tipe event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t] || t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[140px]" size="sm">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                {SEVERITY_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SEVERITY_LABELS[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && !events.length ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                Tidak ada event keamanan
              </p>
              <p className="text-xs text-muted-foreground/70">
                Event akan muncul saat terdeteksi aktivitas mencurigakan
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="hidden md:table-cell">IP Address</TableHead>
                    <TableHead className="hidden lg:table-cell">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {formatTimestamp(event.timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">
                          {TYPE_LABELS[event.type] || event.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={SEVERITY_STYLES[event.severity] || ""}
                        >
                          {SEVERITY_LABELS[event.severity] || event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden max-w-[140px] truncate font-mono text-xs md:table-cell">
                        {event.ipAddress || "-"}
                      </TableCell>
                      <TableCell className="hidden max-w-[280px] truncate text-xs lg:table-cell">
                        {event.detail}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Security Stats Panel ─────────────────────────────── */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Events by Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Event per Tipe</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.byType).length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(stats.byType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <li
                        key={type}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {TYPE_LABELS[type] || type}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Events by Severity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Event per Severity</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const severityCounts: Record<string, number> = {};
                for (const evt of events) {
                  severityCounts[evt.severity] =
                    (severityCounts[evt.severity] ?? 0) + 1;
                }
                const severities = Object.entries(severityCounts).sort(
                  (a, b) => {
                    const order = ["critical", "high", "medium", "low"];
                    return (
                      order.indexOf(a[0]) - order.indexOf(b[0])
                    );
                  },
                );
                return severities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada data
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {severities.map(([severity, count]) => (
                      <li
                        key={severity}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={SEVERITY_STYLES[severity] || ""}
                          >
                            {SEVERITY_LABELS[severity] || severity}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
