"use client";

import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  AlertTriangle,
  MessageSquareWarning,
  CalendarCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ---------- Types ----------
interface NotifikasiItem {
  id: string;
  judul: string;
  isi: string | null;
  jenis: string | null;
  isRead: boolean;
  createdAt: string;
}

const jenisIcon: Record<string, typeof Bell> = {
  "Gangguan Keamanan": AlertTriangle,
  "Pengaduan": MessageSquareWarning,
  "Booking": CalendarCheck,
  "Reminder": Clock,
  "urgent": AlertTriangle,
  "info": Bell,
  "reminder": Clock,
};

function getTimeAgo(iso: string): string {
  try {
    const now = new Date();
    const then = new Date(iso);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam lalu`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

import { useAppStore } from "@/lib/store";

function getPriority(jenis: string | null, judul: string): string {
  if (jenis === "urgent" || judul.toLowerCase().includes("gangguan") || judul.toLowerCase().includes("darurat")) return "Tinggi";
  if (jenis === "info" || jenis === null) return "Rendah";
  return "Sedang";
}

const prioritasColor: Record<string, string> = {
  "Tinggi": "bg-red-500/15 text-red-600 border-red-600/20",
  "Sedang": "bg-amber-500/15 text-amber-700 border-amber-600/20",
  "Rendah": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
};

export function NotifikasiView() {
  const [items, setItems] = useState<NotifikasiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = useAppStore((s) => s.currentUser?.token);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const fetchNotifikasi = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifikasi", {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setItems(json.data || []);
      setUnreadCount(json.unreadCount || 0);
    } catch {
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchNotifikasi();
  }, [fetchNotifikasi]);

  async function markAllRead() {
    const unreadIds = items.filter((i) => !i.isRead).map((i) => i.id);
    if (unreadIds.length === 0) {
      toast.info("Tidak ada notifikasi yang belum dibaca");
      return;
    }
    try {
      const res = await fetch("/api/notifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ids: unreadIds }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnreadCount(0);
      toast.success("Semua notifikasi ditandai dibaca");
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  }

  async function markRead(id: string) {
    try {
      const res = await fetch("/api/notifikasi", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isRead: true } : i))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  }

  function remove(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item && !item.isRead) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((i) => i.id !== id);
    });
    toast.success("Notifikasi dihapus");
  }

  const unread = items.filter((i) => !i.isRead);
  const read = items.filter((i) => i.isRead);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notifikasi" description="Pusat notifikasi SIPADUPAS" badge="Memuat..." icon={Bell} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Pusat notifikasi SIPADUPAS — jadwal regu, serah terima, gangguan, booking, pengaduan, dan approval."
        badge={`${unreadCount} baru`}
        icon={Bell}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchNotifikasi}>
              <RefreshCw className="size-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={markAllRead}>
              <CheckCheck className="size-4 mr-1" /> Tandai Semua Dibaca
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Belum Dibaca" value={unread.length} icon={Bell} sub="Perlu perhatian" accent="warning" />
        <StatCard label="Sudah Dibaca" value={read.length} icon={BellOff} sub="Arsip" accent="primary" />
        <StatCard label="Prioritas Tinggi" value={unread.filter((i) => getPriority(i.jenis, i.judul) === "Tinggi").length} icon={AlertTriangle} sub="Wajib tindak lanjut" accent="danger" />
        <StatCard label="Total" value={items.length} icon={MessageSquareWarning} sub="Semua notifikasi" accent="accent" />
      </div>

      <Tabs defaultValue="unread">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="unread">Belum Dibaca ({unread.length})</TabsTrigger>
          <TabsTrigger value="all">Semua ({items.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4">
          {unread.length === 0 ? (
            <SectionCard title="Tidak ada notifikasi baru" description="Semua sudah dibaca">
              <div className="text-center py-8 text-sm text-muted-foreground">
                <CheckCheck className="size-12 mx-auto text-emerald-600/40 mb-3" />
                Anda sudah membaca semua notifikasi. Mantap!
              </div>
            </SectionCard>
          ) : (
            <div className="space-y-2">
              {unread.map((n) => <NotifItem key={n.id} n={n} onRead={markRead} onRemove={remove} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {items.length === 0 ? (
            <SectionCard title="Tidak ada notifikasi" description="Belum ada notifikasi">
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Bell className="size-12 mx-auto text-muted-foreground/40 mb-3" />
                Belum ada notifikasi.
              </div>
            </SectionCard>
          ) : (
            <div className="space-y-2">
              {items.map((n) => <NotifItem key={n.id} n={n} onRead={markRead} onRemove={remove} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotifItem({ n, onRead, onRemove }: { n: NotifikasiItem; onRead: (id: string) => void; onRemove: (id: string) => void }) {
  const prioritas = getPriority(n.jenis, n.judul);
  const displayJenis = n.jenis || "Info";
  const Icon = jenisIcon[n.jenis || ""] || Bell;
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-all",
      !n.isRead && "border-primary/30 bg-primary/5"
    )}>
      <div className={cn(
        "size-10 rounded-lg flex items-center justify-center shrink-0",
        prioritas === "Tinggi" ? "bg-red-500/15 text-red-600" :
        prioritas === "Sedang" ? "bg-amber-500/15 text-amber-700" :
        "bg-primary/10 text-primary"
      )}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <Badge variant="outline" className="text-[10px]">{displayJenis}</Badge>
          <Badge className={cn("text-[10px]", prioritasColor[prioritas])}>{prioritas}</Badge>
          {!n.isRead && <span className="size-2 rounded-full bg-primary animate-pulse" />}
          <span className="text-[11px] text-muted-foreground ml-auto">{getTimeAgo(n.createdAt)}</span>
        </div>
        <h3 className={cn("text-sm font-semibold leading-tight", !n.isRead && "text-foreground")}>{n.judul}</h3>
        {n.isi && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.isi}</p>}
        <div className="flex items-center gap-2 mt-2">
          {!n.isRead && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onRead(n.id)}>
              <CheckCheck className="size-3 mr-1" /> Tandai dibaca
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600 hover:text-red-700" onClick={() => onRemove(n.id)}>
            <Trash2 className="size-3 mr-1" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
