"use client";

import {
  CalendarCheck,
  QrCode,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  CalendarDays,
  Users,
  Ticket,
  XCircle,
  LogIn,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

// ─── Types from API ─────────────────────────────────────────
interface WBPItem {
  id: string;
  nama: string;
  nomorRegister: string;
  currentRoom?: { blockName: string; roomNumber: string } | null;
}

interface KunjunganItem {
  id: string;
  kodeBooking: string;
  namaPemohon: string;
  nikPemohon?: string | null;
  noHp?: string | null;
  alamat?: string | null;
  hubungan: string;
  wbpId: string;
  tanggal: string;
  sesi: string;
  status: string;
  checkedInAt?: string | null;
  selesaiAt?: string | null;
  catatanPetugas?: string | null;
  createdAt: string;
  updatedAt: string;
  wbp: WBPItem;
}

const SESI_LIST = [
  { sesi: "Sesi 1 Pagi", jam: "08:00 – 09:30", kuota: 20 },
  { sesi: "Sesi 2 Pagi", jam: "10:00 – 11:30", kuota: 20 },
  { sesi: "Sesi 1 Siang", jam: "13:00 – 14:30", kuota: 20 },
  { sesi: "Sesi 2 Siang", jam: "15:00 – 16:30", kuota: 20 },
  { sesi: "Sesi 3 Sore", jam: "16:30 – 17:30", kuota: 20 },
  { sesi: "Sesi 4 Sore", jam: "17:30 – 18:30", kuota: 20 },
];

const HUBUNGAN_OPTIONS = ["Istri", "Suami", "Anak", "Orang Tua", "Saudara", "Kerabat", "Lainnya"];

const KUOTA_SESI = 20;

// ─── Main Component ─────────────────────────────────────────
export function KunjunganView() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <PublicKunjunganView />;
  }

  return <InternalKunjunganView />;
}

// ─── Public View (no auth) ──────────────────────────────────
function PublicKunjunganView() {
  const [activeTab, setActiveTab] = useState<"form" | "lacak">("form");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kunjungan Online"
        description="Daftar kunjungan secara online, pilih sesi, dan dapatkan tiket digital ber-QR Code."
        icon={CalendarCheck}
      />
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "form" | "lacak")}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="form">Daftar Kunjungan</TabsTrigger>
          <TabsTrigger value="lacak">Lacak Tiket</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="space-y-4">
          <SectionCard title="Formulir Booking Kunjungan" description="Lengkapi data pemohon. Tiket digital akan diterbitkan setelah disetujui petugas.">
            <PublicBookingForm />
          </SectionCard>
        </TabsContent>
        <TabsContent value="lacak" className="space-y-4">
          <SectionCard title="Lacak Status Tiket" description="Masukkan kode booking untuk melihat status kunjungan Anda.">
            <TrackTiket />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Public Booking Form (inline, not dialog) ───────────────
function PublicBookingForm() {
  const [submitting, setSubmitting] = useState(false);
  const [successKode, setSuccessKode] = useState("");
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [hubungan, setHubungan] = useState("");
  const [sesi, setSesi] = useState("");
  const [wbpSearch, setWbpSearch] = useState("");
  const [wbpResults, setWbpResults] = useState<WBPItem[]>([]);
  const [selectedWbp, setSelectedWbp] = useState<WBPItem | null>(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!wbpSearch || wbpSearch.length < 2) {
      setWbpResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/wbp?search=${encodeURIComponent(wbpSearch)}`);
        if (res.ok) {
          const json = await res.json();
          setWbpResults(json.data || []);
        }
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [wbpSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWbp) { toast.error("Pilih WBP terlebih dahulu"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/kunjungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPemohon: nama, nikPemohon: nik || undefined, noHp: noHp || undefined, alamat: alamat || undefined, hubungan, wbpId: selectedWbp.id, tanggal, sesi }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Gagal membuat booking"); }
      const json = await res.json();
      setSuccessKode(json.data.kodeBooking);
      toast.success(`Booking berhasil! Tiket: ${json.data.kodeBooking}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (successKode) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Booking Berhasil Dikirim!</h3>
          <p className="text-sm text-muted-foreground mt-1">Simpan kode tiket Anda untuk melacak status kunjungan.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-mono font-semibold text-lg">
          <Ticket className="size-5" strokeWidth={1.75} />
          {successKode}
        </div>
        <p className="text-xs text-muted-foreground">Status awal: <span className="font-medium text-amber-600">Menunggu</span> — menunggu approval petugas</p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => { setSuccessKode(""); setNama(""); setNik(""); setNoHp(""); setAlamat(""); setHubungan(""); setSesi(""); setSelectedWbp(null); setWbpSearch(""); }}>Daftar Lagi</Button>
          <Button size="sm" onClick={() => useAppStore.getState().setView("kunjungan")}>← Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="pub-nama">Nama Pemohon <span className="text-red-500">*</span></Label>
          <Input id="pub-nama" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap sesuai KTP" />
        </div>
        <div>
          <Label htmlFor="pub-nik">NIK</Label>
          <Input id="pub-nik" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="16 digit NIK" />
        </div>
        <div>
          <Label htmlFor="pub-hp">No. HP</Label>
          <Input id="pub-hp" value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="08xxxxxxxxxx" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pub-alamat">Alamat</Label>
          <Input id="pub-alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat lengkap" />
        </div>
        <div>
          <Label htmlFor="pub-hub">Hubungan dengan WBP <span className="text-red-500">*</span></Label>
          <Select value={hubungan} onValueChange={setHubungan} required>
            <SelectTrigger id="pub-hub"><SelectValue placeholder="Pilih hubungan" /></SelectTrigger>
            <SelectContent>{HUBUNGAN_OPTIONS.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pub-tgl">Tanggal Kunjungan <span className="text-red-500">*</span></Label>
          <Input id="pub-tgl" type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pub-sesi">Sesi Kunjungan <span className="text-red-500">*</span></Label>
          <Select value={sesi} onValueChange={setSesi} required>
            <SelectTrigger id="pub-sesi"><SelectValue placeholder="Pilih sesi" /></SelectTrigger>
            <SelectContent>{SESI_LIST.map((s) => (<SelectItem key={s.sesi} value={s.sesi}>{s.sesi} · {s.jam} WITA</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pub-wbp">Nama WBP / Nomor Register <span className="text-red-500">*</span></Label>
          {selectedWbp ? (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/40 bg-primary/5">
              <CheckCircle2 className="size-4 text-primary shrink-0" strokeWidth={1.75} />
              <span className="text-sm font-medium flex-1 truncate">{selectedWbp.nama} ({selectedWbp.nomorRegister})</span>
              {selectedWbp.currentRoom && <span className="text-xs text-muted-foreground">· {selectedWbp.currentRoom.blockName}/{selectedWbp.currentRoom.roomNumber}</span>}
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setSelectedWbp(null); setWbpSearch(""); }}>Ganti</Button>
            </div>
          ) : (
            <>
              <Input id="pub-wbp" value={wbpSearch} onChange={(e) => setWbpSearch(e.target.value)} placeholder="Ketik nama atau nomor register WBP…" autoComplete="off" />
              {wbpResults.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-popover scroll-thin">
                  {wbpResults.map((w) => (
                    <button key={w.id} type="button" className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors border-b border-border/60 last:border-0" onClick={() => { setSelectedWbp(w); setWbpResults([]); setWbpSearch(""); }}>
                      <span className="font-medium">{w.nama}</span>
                      <span className="text-xs text-muted-foreground ml-2">({w.nomorRegister})</span>
                      {w.currentRoom && <span className="text-xs text-muted-foreground ml-1">· {w.currentRoom.blockName}/{w.currentRoom.roomNumber}</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Button type="submit" disabled={submitting || !selectedWbp || !hubungan || !sesi} className="w-full sm:w-auto">
        {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
        Kirim Booking
      </Button>
    </form>
  );
}

// ─── Track Tiket (public) ───────────────────────────────────
function TrackTiket() {
  const [kode, setKode] = useState("");
  const [result, setResult] = useState<KunjunganItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault();
    if (!kode.trim()) return;
    setLoading(true);
    setSearched(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await fetch("/api/kunjungan");
      if (!res.ok) throw new Error();
      const json = await res.json();
      const all: KunjunganItem[] = json.data || [];
      const found = all.find((k) => k.kodeBooking.toLowerCase() === kode.trim().toLowerCase());
      if (found) {
        setResult(found);
      } else {
        setNotFound(true);
      }
    } catch {
      toast.error("Gagal mencari tiket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <form onSubmit={handleTrack} className="flex gap-2">
        <Input value={kode} onChange={(e) => setKode(e.target.value)} placeholder="Contoh: SJY-260819-001" className="flex-1" />
        <Button type="submit" disabled={loading || !kode.trim()}>{loading && <Loader2 className="size-4 mr-1 animate-spin" />}Lacak</Button>
      </form>
      {loading && <div className="text-center py-6"><Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" /></div>}
      {notFound && !loading && (
        <div className="text-center py-6 border rounded-lg border-dashed">
          <XCircle className="size-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.75} />
          <p className="text-sm text-muted-foreground">Tiket dengan kode <span className="font-mono font-medium">{kode}</span> tidak ditemukan.</p>
        </div>
      )}
      {result && !loading && (
        <div className="border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono font-semibold text-sm">{result.kodeBooking}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Tanggal: {result.tanggal}</div>
            </div>
            <KunjunganStatusBadge status={result.status} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Pemohon</div>
              <div className="font-medium">{result.namaPemohon}</div>
              <div className="text-xs text-muted-foreground">{result.hubungan} · {result.noHp || "-"}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">WBP</div>
              <div className="font-medium">{result.wbp.nama}</div>
              <div className="text-xs text-muted-foreground">{result.wbp.nomorRegister}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="size-3.5" />
            <span>Sesi: {result.sesi}</span>
            {result.catatanPetugas && <span>· Catatan: {result.catatanPetugas}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Internal View (auth required) ──────────────────────────
function InternalKunjunganView() {
  const [open, setOpen] = useState(false);
  const [tiketDetail, setTiketDetail] = useState<KunjunganItem | null>(null);
  const [kunjunganList, setKunjunganList] = useState<KunjunganItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  const fetchKunjungan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/kunjungan");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      setKunjunganList(json.data || []);
    } catch {
      toast.error("Gagal memuat data kunjungan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKunjungan();
  }, [fetchKunjungan]);

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayKunjungan = kunjunganList.filter((k) => k.tanggal === todayStr);
  const checkinCount = todayKunjungan.filter((k) => k.status === "Check-in" || k.status === "Selesai").length;
  const menungguCount = todayKunjungan.filter((k) => k.status === "Menunggu").length;
  const ditolakCount = todayKunjungan.filter((k) => k.status === "Ditolak").length;

  // Sesi kuota calculation
  const sesiUsed: Record<string, number> = {};
  todayKunjungan.forEach((k) => {
    sesiUsed[k.sesi] = (sesiUsed[k.sesi] || 0) + 1;
  });

  // Search filter for riwayat
  const filteredRiwayat = kunjunganList.filter((k) =>
    !searchQ ||
    k.kodeBooking.toLowerCase().includes(searchQ.toLowerCase()) ||
    k.namaPemohon.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelayanan Kunjungan"
        description="Booking online, kuota sesi, tiket digital ber-QR Code, check-in, dan riwayat kunjungan."
        badge="Hari Ini"
        icon={CalendarCheck}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1" /> Booking Baru
              </Button>
            </DialogTrigger>
            <BookingDialog onClose={() => { setOpen(false); fetchKunjungan(); }} />
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Kunjungan Hari Ini" value={todayKunjungan.length} icon={CalendarCheck} sub={`/ ${KUOTA_SESI * SESI_LIST.length} kuota`} accent="primary" />
        <StatCard label="Sudah Check-in" value={checkinCount} icon={LogIn} sub="Tiket terpakai" accent="accent" />
        <StatCard label="Menunggu Approval" value={menungguCount} icon={Clock} sub="Perlu verifikasi" accent="warning" />
        <StatCard label="Ditolak" value={ditolakCount} icon={XCircle} sub="Hari ini" accent="danger" />
      </div>

      <Tabs defaultValue="aktif">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="aktif">Kunjungan Aktif</TabsTrigger>
          <TabsTrigger value="sesi">Kuota Sesi</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="aktif" className="space-y-4">
          <SectionCard
            title="Tiket Kunjungan Hari Ini"
            description={`${todayKunjungan.length} tiket terbit`}
          >
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            ) : todayKunjungan.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Belum ada kunjungan hari ini.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {todayKunjungan.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setTiketDetail(k)}
                    className="text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:shadow-sm transition-all bg-card group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-semibold text-sm">{k.namaPemohon}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {k.hubungan} dari {k.wbp.nama}
                        </div>
                      </div>
                      <KunjunganStatusBadge status={k.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
                      <Ticket className="size-3.5 text-primary" />
                      <span className="font-mono">{k.kodeBooking}</span>
                      <span>·</span>
                      <Clock className="size-3.5" />
                      <span>{k.sesi}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="sesi" className="space-y-4">
          <SectionCard
            title="Kuota Sesi Kunjungan"
            description="6 sesi per hari · maksimum 20 pengunjung per sesi"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SESI_LIST.map((s) => {
                const terpakai = sesiUsed[s.sesi] || 0;
                const pct = Math.round((terpakai / s.kuota) * 100);
                const full = terpakai >= s.kuota;
                return (
                  <div
                    key={s.sesi}
                    className={cn(
                      "p-4 rounded-lg border",
                      full ? "border-red-500/30 bg-red-500/5" : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-sm">{s.sesi}</div>
                        <div className="text-xs text-muted-foreground">{s.jam} WITA</div>
                      </div>
                      <Badge className={cn(
                        "text-[10px]",
                        full ? "bg-red-500/15 text-red-600 border-red-600/20" : "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
                      )}>
                        {full ? "Penuh" : "Tersedia"}
                      </Badge>
                    </div>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-2xl font-bold tabular-nums">{terpakai}</span>
                      <span className="text-sm text-muted-foreground mb-1">/ {s.kuota}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
                      <div
                        className={cn("h-full rounded-full", full ? "bg-red-500" : "bg-primary")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="riwayat" className="space-y-4">
          <SectionCard
            title="Riwayat Kunjungan"
            description="Data kunjungan tercatat dalam sistem"
            action={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Cari nama/tiket…" className="w-48 pl-8 h-9" />
              </div>
            }
          >
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
                      <TableHead className="text-xs">Tiket</TableHead>
                      <TableHead className="text-xs">Pemohon</TableHead>
                      <TableHead className="text-xs">WBP</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">Sesi</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRiwayat.map((k) => (
                      <TableRow key={k.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setTiketDetail(k)}>
                        <TableCell className="text-xs font-mono">{k.kodeBooking}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{k.namaPemohon}</div>
                          <div className="text-xs text-muted-foreground">{k.hubungan}</div>
                        </TableCell>
                        <TableCell className="text-xs">{k.wbp.nama}</TableCell>
                        <TableCell className="text-xs">{k.tanggal}</TableCell>
                        <TableCell className="text-xs">{k.sesi}</TableCell>
                        <TableCell><KunjunganStatusBadge status={k.status} /></TableCell>
                      </TableRow>
                    ))}
                    {filteredRiwayat.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Tidak ada data kunjungan.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!tiketDetail} onOpenChange={(v) => !v && setTiketDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {tiketDetail && (
            <TiketDetail
              tiket={tiketDetail}
              onClose={() => setTiketDetail(null)}
              onRefresh={() => fetchKunjungan()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────
function KunjunganStatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Menunggu: "bg-amber-500/15 text-amber-700 border-amber-600/20",
    Disetujui: "bg-primary/10 text-primary border-primary/20",
    "Check-in": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
    Selesai: "bg-muted text-muted-foreground border-border",
    Ditolak: "bg-red-500/15 text-red-600 border-red-600/20",
  };
  return <Badge className={`text-[10px] ${cls[status] ?? ""}`}>{status}</Badge>;
}

// ─── Booking Dialog (UF-11) ──────────────────────────────────
function BookingDialog({ onClose }: { onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [hubungan, setHubungan] = useState("");
  const [sesi, setSesi] = useState("");
  const [wbpSearch, setWbpSearch] = useState("");
  const [wbpResults, setWbpResults] = useState<WBPItem[]>([]);
  const [selectedWbp, setSelectedWbp] = useState<WBPItem | null>(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  // Search WBP with debounce
  useEffect(() => {
    if (!wbpSearch || wbpSearch.length < 2) {
      setWbpResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/wbp?search=${encodeURIComponent(wbpSearch)}`);
        if (res.ok) {
          const json = await res.json();
          setWbpResults(json.data || []);
        }
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [wbpSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWbp) {
      toast.error("Pilih WBP terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/kunjungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPemohon: nama,
          nikPemohon: nik || undefined,
          noHp: noHp || undefined,
          alamat: alamat || undefined,
          hubungan,
          wbpId: selectedWbp.id,
          tanggal,
          sesi,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal membuat booking");
      }
      const json = await res.json();
      toast.success(`Booking berhasil! Tiket: ${json.data.kodeBooking}`, {
        description: "Status awal: Menunggu approval petugas.",
      });
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat booking");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Booking Kunjungan Online</DialogTitle>
        <DialogDescription>
          Lengkapi data pemohon. Tiket digital & QR Code akan diterbitkan setelah disetujui petugas.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="nama">Nama Pemohon</Label>
          <Input id="nama" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap sesuai KTP" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="nik">NIK</Label>
            <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="16 digit NIK" />
          </div>
          <div>
            <Label htmlFor="noHp">No. HP</Label>
            <Input id="noHp" value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="08xx" />
          </div>
        </div>
        <div>
          <Label htmlFor="alamat">Alamat</Label>
          <Input id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat lengkap" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="hubungan">Hubungan</Label>
            <Select value={hubungan} onValueChange={setHubungan} required>
              <SelectTrigger id="hubungan"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>
                {HUBUNGAN_OPTIONS.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tanggal">Tanggal Kunjungan</Label>
            <Input id="tanggal" type="date" required value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="sesi">Sesi Kunjungan</Label>
          <Select value={sesi} onValueChange={setSesi} required>
            <SelectTrigger id="sesi"><SelectValue placeholder="Pilih sesi" /></SelectTrigger>
            <SelectContent>
              {SESI_LIST.map((s) => (
                <SelectItem key={s.sesi} value={s.sesi}>
                  {s.sesi} · {s.jam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="wbp">Nama WBP / Register</Label>
          {selectedWbp ? (
            <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/40 bg-primary/5">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">{selectedWbp.nama} ({selectedWbp.nomorRegister})</span>
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setSelectedWbp(null); setWbpSearch(""); }}>Ganti</Button>
            </div>
          ) : (
            <>
              <Input
                id="wbp"
                value={wbpSearch}
                onChange={(e) => setWbpSearch(e.target.value)}
                placeholder="Cari nama atau nomor register WBP…"
                autoComplete="off"
              />
              {wbpResults.length > 0 && (
                <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-border bg-popover scroll-thin">
                  {wbpResults.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors border-b border-border/60 last:border-0"
                      onClick={() => { setSelectedWbp(w); setWbpResults([]); setWbpSearch(""); }}
                    >
                      <span className="font-medium">{w.nama}</span>
                      <span className="text-xs text-muted-foreground ml-2">({w.nomorRegister})</span>
                      {w.currentRoom && <span className="text-xs text-muted-foreground ml-1">· {w.currentRoom.blockName}</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={submitting || !selectedWbp}>
            {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
            Kirim Booking
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// ─── Tiket Detail (UF-12) ────────────────────────────────────
function TiketDetail({ tiket, onClose, onRefresh }: { tiket: KunjunganItem; onClose: () => void; onRefresh: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [catatan, setCatatan] = useState("");

  async function handleAction(action: string, extra?: Record<string, unknown>) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/kunjungan/${tiket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal memperbarui kunjungan");
      }
      const json = await res.json();
      toast.success(`Kunjungan berhasil diperbarui: ${json.data.status}`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui kunjungan");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Ticket className="size-5 text-primary" />
          Tiket Kunjungan
        </DialogTitle>
        <DialogDescription>
          Tiket digital untuk check-in di gerbang Lapas.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3">
        <div className="flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5">
          <div className="size-32 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm">
            <QrCode className="size-24 text-foreground" />
          </div>
          <div className="text-xs text-muted-foreground">Tiket</div>
          <div className="font-mono font-semibold text-sm">{tiket.kodeBooking}</div>
        </div>
        <div className="space-y-2 text-sm">
          <DetailRow label="Pemohon" value={tiket.namaPemohon} icon={Users} />
          <DetailRow label="Hubungan" value={tiket.hubungan} icon={Users} />
          <DetailRow label="WBP" value={`${tiket.wbp.nama} (${tiket.wbp.nomorRegister})`} icon={Users} />
          <DetailRow label="Tanggal" value={tiket.tanggal} icon={CalendarDays} />
          <DetailRow label="Sesi" value={tiket.sesi} icon={Clock} />
          {tiket.catatanPetugas && <DetailRow label="Catatan" value={tiket.catatanPetugas} icon={Ticket} />}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs"><CheckCircle2 className="size-3.5" /> Status</span>
            <KunjunganStatusBadge status={tiket.status} />
          </div>
        </div>

        {/* Tolak section */}
        {tiket.status === "Menunggu" && (
          <div className="space-y-2">
            <Label htmlFor="catatan" className="text-xs">Catatan Penolakan (opsional)</Label>
            <TextareaUI id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} placeholder="Alasan penolakan…" />
          </div>
        )}
      </div>
      <DialogFooter className="flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onClose}>Tutup</Button>
        {tiket.status === "Menunggu" && (
          <Button variant="destructive" disabled={actionLoading} onClick={() => handleAction("tolak", { catatanPetugas: catatan || undefined })}>
            {actionLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
            <XCircle className="size-4 mr-1" /> Tolak
          </Button>
        )}
        {(tiket.status === "Menunggu" || tiket.status === "Disetujui") && (
          <Button disabled={actionLoading} onClick={() => handleAction("checkin")}>
            {actionLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
            <LogIn className="size-4 mr-1" /> Proses Check-in
          </Button>
        )}
        {tiket.status === "Check-in" && (
          <Button disabled={actionLoading} onClick={() => handleAction("selesai")}>
            {actionLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
            <CheckCircle2 className="size-4 mr-1" /> Selesai
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}

// ─── Textarea shorthand ──────────────────────────────────────
function TextareaUI(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  // Inline textarea to avoid import complexity
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...rest}
    />
  );
}

// ─── Detail Row ──────────────────────────────────────────────
function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className="size-3.5" /> {label}
      </span>
      <span className="font-medium text-right text-sm max-w-[200px] truncate">{value}</span>
    </div>
  );
}
