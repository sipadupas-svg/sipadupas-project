"use client";

import {
  MessageSquareWarning,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Send,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types from API ─────────────────────────────────────────
interface PengaduanItem {
  id: string;
  kodeTracking: string;
  namaPelapor?: string | null;
  kontak?: string | null;
  kategori: string;
  subjek: string;
  isi: string;
  isAnonim: boolean;
  balasan?: string | null;
  status: string;
  ditanganiOleh?: string | null;
  selesaiAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const KATEGORI_OPTIONS = ["Pelayanan", "Pengamanan", "Kunjungan", "Fasilitas", "Lainnya"];

// ─── Main Component ─────────────────────────────────────────
export function PengaduanView() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PengaduanItem | null>(null);
  const [q, setQ] = useState("");
  const [pengaduanList, setPengaduanList] = useState<PengaduanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPengaduan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengaduan");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      setPengaduanList(json.data || []);
    } catch {
      toast.error("Gagal memuat data pengaduan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPengaduan();
  }, [fetchPengaduan]);

  const filtered = pengaduanList.filter((p) =>
    !q ||
    p.subjek.toLowerCase().includes(q.toLowerCase()) ||
    p.kodeTracking.toLowerCase().includes(q.toLowerCase())
  );

  // Stats
  const aktifCount = pengaduanList.filter((p) => p.status !== "Selesai" && p.status !== "Ditolak").length;
  const baruCount = pengaduanList.filter((p) => p.status === "Baru").length;
  const selesaiCount = pengaduanList.filter((p) => p.status === "Selesai").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaduan Publik"
        description="Sampaikan aspirasi, keluhan, atau laporan dugaan pelanggaran. Setiap pengaduan memperoleh kode tracking rahasia."
        badge="SLA Aktif"
        icon={MessageSquareWarning}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1" /> Buat Pengaduan
              </Button>
            </DialogTrigger>
            <PengaduanDialog onClose={() => { setOpen(false); fetchPengaduan(); }} />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pengaduan Aktif" value={aktifCount} icon={MessageSquareWarning} sub="Sedang diproses" accent="warning" />
        <StatCard label="Baru" value={baruCount} icon={AlertCircle} sub="Belum ditangani" accent="danger" />
        <StatCard label="Selesai" value={selesaiCount} icon={CheckCircle2} sub={"Total selesai"} accent="primary" />
        <StatCard label="Total Pengaduan" value={pengaduanList.length} icon={Clock} sub="Semua status" accent="accent" />
      </div>

      <Tabs defaultValue="aktif">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="aktif">Aktif ({aktifCount})</TabsTrigger>
          <TabsTrigger value="semua">Semua ({pengaduanList.length})</TabsTrigger>
          <TabsTrigger value="lacak">Lacak Pengaduan</TabsTrigger>
        </TabsList>

        <TabsContent value="aktif" className="space-y-4">
          <SectionCard
            title="Pengaduan yang Diproses"
            description={`${filtered.filter((p) => p.status !== "Selesai" && p.status !== "Ditolak").length} pengaduan menunggu tindak lanjut`}
            action={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode/subjek…" className="w-48 pl-8 h-9" />
              </div>
            }
          >
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : filtered.filter((p) => p.status !== "Selesai" && p.status !== "Ditolak").length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Tidak ada pengaduan aktif.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filtered.filter((p) => p.status !== "Selesai" && p.status !== "Ditolak").map((p) => (
                  <PengaduanCard key={p.id} p={p} onClick={() => setDetail(p)} />
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="semua" className="space-y-4">
          <SectionCard title="Semua Pengaduan" description={`${pengaduanList.length} pengaduan tercatat`}>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border max-h-[480px] overflow-y-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                    <TableRow>
                      <TableHead className="text-xs">Kode</TableHead>
                      <TableHead className="text-xs">Subjek</TableHead>
                      <TableHead className="text-xs">Kategori</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setDetail(p)}>
                        <TableCell className="text-xs font-mono">{p.kodeTracking}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{p.subjek}</div>
                          <div className="text-xs text-muted-foreground">{p.isAnonim ? "Anonim" : (p.namaPelapor || "-")}</div>
                        </TableCell>
                        <TableCell className="text-xs">{p.kategori}</TableCell>
                        <TableCell className="text-xs">{formatDate(p.createdAt)}</TableCell>
                        <TableCell><PengaduanStatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">Tidak ada data pengaduan.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="lacak" className="space-y-4">
          <SectionCard title="Lacak Status Pengaduan" description="Masukkan kode tracking untuk memantau tindak lanjut">
            <TrackForm />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          {detail && (
            <PengaduanDetail
              p={detail}
              onClose={() => setDetail(null)}
              onRefresh={() => fetchPengaduan()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────
function PengaduanStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Baru: "bg-red-500/15 text-red-600 border-red-600/20",
    Diverifikasi: "bg-amber-500/15 text-amber-700 border-amber-600/20",
    Diproses: "bg-primary/10 text-primary border-primary/20",
    Selesai: "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
    Ditolak: "bg-muted text-muted-foreground border-border",
  };
  return <Badge className={`text-[10px] ${cls[status] ?? ""}`}>{status}</Badge>;
}

// ─── Card ───────────────────────────────────────────────────
function PengaduanCard({ p, onClick }: { p: PengaduanItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:shadow-sm transition-all bg-card"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-mono text-primary">{p.kodeTracking}</div>
          <div className="text-sm font-medium mt-0.5">{p.subjek}</div>
        </div>
        <PengaduanStatusBadge status={p.status} />
      </div>
      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
        <span>{p.kategori}</span>
        <span>·</span>
        <span>{formatDate(p.createdAt)}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{p.isAnonim ? "Anonim" : (p.namaPelapor || "-")}</span>
        <PengaduanStatusBadge status={p.status} />
      </div>
    </button>
  );
}

// ─── Create Dialog (UF-13) ──────────────────────────────────
function PengaduanDialog({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [isAnonim, setIsAnonim] = useState(false);
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [kategori, setKategori] = useState("");
  const [subjek, setSubjek] = useState("");
  const [isi, setIsi] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPelapor: isAnonim ? "" : nama,
          kontak: isAnonim ? "" : kontak,
          kategori,
          subjek,
          isi,
          isAnonim,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal membuat pengaduan");
      }
      const json = await res.json();
      toast.success("Pengaduan terkirim!", {
        description: `Kode tracking Anda: ${json.data.kodeTracking}. Simpan kode ini untuk melacak status.`,
      });
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pengaduan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Buat Pengaduan Baru</DialogTitle>
        <DialogDescription>
          Identitas pelapor dapat dirahasiakan. Kode tracking akan diterbitkan otomatis.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            id="anonim"
            type="checkbox"
            checked={isAnonim}
            onChange={(e) => setIsAnonim(e.target.checked)}
            className="size-4 rounded border-input"
          />
          <Label htmlFor="anonim" className="text-sm font-normal cursor-pointer">Kirim sebagai anonim</Label>
        </div>
        {!isAnonim && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pelapor">Nama Pelapor</Label>
              <Input id="pelapor" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Bpk/Ibu …" />
            </div>
            <div>
              <Label htmlFor="kontak">Kontak</Label>
              <Input id="kontak" value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="No. HP / Email" />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="kategori">Kategori Pengaduan</Label>
          <Select value={kategori} onValueChange={setKategori} required>
            <SelectTrigger id="kategori"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
            <SelectContent>
              {KATEGORI_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subjek">Subjek Pengaduan</Label>
          <Input id="subjek" required value={subjek} onChange={(e) => setSubjek(e.target.value)} placeholder="Ringkasan singkat pengaduan" />
        </div>
        <div>
          <Label htmlFor="isi">Detail Pengaduan</Label>
          <Textarea id="isi" required value={isi} onChange={(e) => setIsi(e.target.value)} rows={4} placeholder="Jelaskan kronologi, lokasi, waktu, dan pihak terkait…" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
            <Send className="size-4 mr-1" /> Kirim Pengaduan
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ─── Detail Dialog (UF-13 internal handling) ────────────────
function PengaduanDetail({ p, onClose, onRefresh }: { p: PengaduanItem; onClose: () => void; onRefresh: () => void }) {
  const [balasan, setBalasan] = useState(p.balasan || "");
  const [actionLoading, setActionLoading] = useState(false);

  async function handleAction(action: string, extra?: Record<string, unknown>) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pengaduan/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal memperbarui");
      }
      const json = await res.json();
      toast.success(`Pengaduan diperbarui: ${json.data.status}`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui");
    } finally {
      setActionLoading(false);
    }
  }

  const createdDate = formatDate(p.createdAt);

  // Timeline stages
  const isDiverifikasi = ["Diverifikasi", "Diproses", "Selesai"].includes(p.status);
  const isDiproses = ["Diproses", "Selesai"].includes(p.status);
  const isSelesai = p.status === "Selesai";
  const isDitolak = p.status === "Ditolak";

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <MessageSquareWarning className="size-5 text-primary" /> Detail Pengaduan
        </DialogTitle>
        <DialogDescription>
          Kode tracking <span className="font-mono">{p.kodeTracking}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori" value={p.kategori} />
          <Field label="Status" value={p.status} />
          <Field label="Pelapor" value={p.isAnonim ? "Anonim" : (p.namaPelapor || "-")} />
          <Field label="Tanggal" value={createdDate} />
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Subjek</div>
          <div className="text-sm font-medium">{p.subjek}</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/40 border border-border">
          <div className="text-xs text-muted-foreground mb-1">Isi Pengaduan</div>
          <div className="text-sm whitespace-pre-wrap">{p.isi}</div>
        </div>

        {p.balasan && (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-600/20">
            <div className="text-xs text-emerald-700 mb-1">Balasan Petugas</div>
            <div className="text-sm whitespace-pre-wrap">{p.balasan}</div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Timeline Penanganan</div>
          <div className="space-y-3">
            <TimelineItem icon={AlertCircle} iconColor="bg-red-500/15 text-red-600" title="Pengaduan diterima" time={createdDate} done />
            {!isDitolak && (
              <TimelineItem icon={ShieldCheck} iconColor="bg-amber-500/15 text-amber-700" title="Verifikasi admin" time={isDiverifikasi ? "Selesai" : "—"} done={isDiverifikasi} />
            )}
            {!isDitolak && (
              <TimelineItem icon={Loader2} iconColor="bg-primary/10 text-primary" title="Diproses" time={isDiproses ? "Dalam proses" : "—"} done={isDiproses} />
            )}
            {!isDitolak && (
              <TimelineItem icon={CheckCircle2} iconColor="bg-emerald-500/15 text-emerald-700" title="Penyelesaian" time={isSelesai ? (p.selesaiAt ? formatDate(p.selesaiAt) : "Selesai") : "—"} done={isSelesai} last />
            )}
            {isDitolak && (
              <TimelineItem icon={XCircle} iconColor="bg-red-500/15 text-red-600" title="Ditolak" time={createdDate} done last />
            )}
          </div>
        </div>

        {/* Internal actions */}
        <div>
          <Label className="text-xs">Tindakan Internal</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {p.status === "Baru" && (
              <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => handleAction("verifikasi")}>
                {actionLoading && <Loader2 className="size-3 mr-1 animate-spin" />}
                <ShieldCheck className="size-3 mr-1" /> Verifikasi
              </Button>
            )}
            {(p.status === "Diverifikasi" || p.status === "Diproses") && (
              <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => handleAction("proses")}>
                {actionLoading && <Loader2 className="size-3 mr-1 animate-spin" />}
                <Loader2 className="size-3 mr-1" /> Proses
              </Button>
            )}
            {p.status !== "Selesai" && p.status !== "Ditolak" && (
              <Button size="sm" variant="destructive" disabled={actionLoading} onClick={() => handleAction("tolak")}>
                {actionLoading && <Loader2 className="size-3 mr-1 animate-spin" />}
                <XCircle className="size-3 mr-1" /> Tolak
              </Button>
            )}
            {p.status !== "Selesai" && p.status !== "Ditolak" && (
              <Button size="sm" disabled={actionLoading} onClick={() => handleAction("selesai", { balasan })}>
                {actionLoading && <Loader2 className="size-3 mr-1 animate-spin" />}
                <CheckCircle2 className="size-3 mr-1" /> Selesai
              </Button>
            )}
          </div>
        </div>

        {/* Balasan input */}
        <div>
          <Label htmlFor="balasan" className="text-xs">Balasan Petugas</Label>
          <Textarea
            id="balasan"
            value={balasan}
            onChange={(e) => setBalasan(e.target.value)}
            rows={3}
            placeholder="Tulis tanggapan untuk pelapor…"
            className="mt-1"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Tutup</Button>
      </DialogFooter>
    </div>
  );
}

// ─── Field ──────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg border border-border bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

// ─── Timeline Item ──────────────────────────────────────────
function TimelineItem({
  icon: Icon,
  iconColor,
  title,
  time,
  done,
  last,
}: {
  icon: typeof AlertCircle;
  iconColor: string;
  title: string;
  time: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("size-7 rounded-full flex items-center justify-center", iconColor, !done && "opacity-40")}>
          <Icon className="size-3.5" />
        </div>
        {!last && <div className="w-px h-6 bg-border mt-1" />}
      </div>
      <div className="pb-1">
        <div className={cn("text-sm", !done && "text-muted-foreground")}>{title}</div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
    </div>
  );
}

// ─── Track Form ─────────────────────────────────────────────
function TrackForm() {
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PengaduanItem | null | undefined>(undefined);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(undefined);
    try {
      // Search all pengaduan and find by kodeTracking
      const res = await fetch("/api/pengaduan");
      if (!res.ok) throw new Error("Gagal");
      const json = await res.json();
      const found = (json.data || []).find(
        (p: PengaduanItem) => p.kodeTracking.toLowerCase() === kode.toLowerCase()
      );
      setResult(found || null);
      if (!found) toast.error("Kode tracking tidak ditemukan");
    } catch {
      toast.error("Gagal mencari pengaduan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleTrack} className="flex gap-2 max-w-md">
        <Input
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          placeholder="Contoh: SPD-2608-ABCD"
          className="font-mono"
          required
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          <Search className="size-4 mr-1" /> Lacak
        </Button>
      </form>
      {result === null && (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-sm text-red-700">
          <XCircle className="size-4 inline mr-1" />
          Kode tracking tidak ditemukan. Periksa kembali kode yang Anda masukkan.
        </div>
      )}
      {result && (
        <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-mono text-xs text-primary">{result.kodeTracking}</div>
              <div className="font-semibold mt-1">{result.subjek}</div>
            </div>
            <PengaduanStatusBadge status={result.status} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Kategori:</span> {result.kategori}</div>
            <div><span className="text-muted-foreground">Status:</span> {result.status}</div>
            <div><span className="text-muted-foreground">Tanggal:</span> {formatDate(result.createdAt)}</div>
            <div><span className="text-muted-foreground">Pelapor:</span> {result.isAnonim ? "Anonim" : (result.namaPelapor || "-")}</div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Timeline</div>
            <div className="space-y-2">
              <TimelineItem icon={AlertCircle} iconColor="bg-red-500/15 text-red-600" title="Diterima" time={formatDate(result.createdAt)} done last={result.status === "Baru"} />
              {result.status !== "Baru" && result.status !== "Ditolak" && (
                <TimelineItem icon={ShieldCheck} iconColor="bg-amber-500/15 text-amber-700" title={result.status === "Diverifikasi" ? "Diverifikasi" : "Diproses"} time={formatDate(result.updatedAt)} done last={result.status === "Diverifikasi"} />
              )}
              {result.status === "Selesai" && (
                <TimelineItem icon={CheckCircle2} iconColor="bg-emerald-500/15 text-emerald-700" title="Selesai" time={result.selesaiAt ? formatDate(result.selesaiAt) : ""} done last />
              )}
              {result.status === "Ditolak" && (
                <TimelineItem icon={XCircle} iconColor="bg-red-500/15 text-red-600" title="Ditolak" time={formatDate(result.updatedAt)} done last />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Date Helper ────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
