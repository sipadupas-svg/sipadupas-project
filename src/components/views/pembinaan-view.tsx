"use client";

import {
  GraduationCap,
  Users,
  CheckCircle2,
  Activity,
  Plus,
  CalendarDays,
  Award,
  TrendingUp,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PageHeader, StatCard, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────
interface ProgramItem {
  id: string;
  nama: string;
  kategori: string;
  periode?: string | null;
  pembina?: string | null;
  jadwal?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { peserta: number };
}

interface ProgramDetail extends ProgramItem {
  peserta: PesertaItem[];
  kehadiran: KehadiranItem[];
}

interface PesertaItem {
  id: string;
  programId: string;
  wbpId: string;
  createdAt: string;
  wbp: { id: string; nama: string; nomorRegister: string };
}

interface KehadiranItem {
  id: string;
  programId: string;
  wbpId: string;
  tanggal: string;
  status: string;
  catatan?: string | null;
  createdAt: string;
  wbp: { id: string; nama: string; nomorRegister: string };
  program?: { id: string; nama: string } | null;
}

interface WBPItem {
  id: string;
  nama: string;
  nomorRegister: string;
}

const KATEGORI_OPTIONS = ["Pendidikan", "Keagamaan", "Pelatihan Kerja", "Keterampilan", "Olahraga", "Sosial"];
const STATUS_OPTIONS = ["Rencana", "Berjalan", "Selesai"];
const KEHADIRAN_STATUS = ["Hadir", "Tidak Hadir", "Izin", "Sakit"];

const KATEGORI_ICON_CLASS: Record<string, string> = {
  Kemandirian: "bg-primary/10 text-primary",
  "Pelatihan Kerja": "bg-primary/10 text-primary",
  Keagamaan: "bg-accent/20 text-accent-foreground",
  Pendidikan: "bg-emerald-500/15 text-emerald-700",
  Kesehatan: "bg-amber-500/15 text-amber-700",
  Sosial: "bg-red-500/15 text-red-600",
  Keterampilan: "bg-primary/10 text-primary",
  Olahraga: "bg-emerald-500/15 text-emerald-700",
};

// ─── Main Component ─────────────────────────────────────────
export function PembinaanView() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProgram, setOpenProgram] = useState(false);
  const [openPeserta, setOpenPeserta] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pembinaan");
      if (!res.ok) throw new Error("Gagal");
      const json = await res.json();
      setPrograms(json.data || []);
    } catch {
      toast.error("Gagal memuat data program pembinaan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Stats
  const aktifPrograms = programs.filter((p) => p.status === "Berjalan");
  const totalPeserta = programs.reduce((a, b) => a + b._count.peserta, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pembinaan WBP"
        description="Program pembinaan kemandirian, keagamaan, pendidikan, kesehatan, dan sosial untuk Warga Binaan Pemasyarakatan."
        badge="Internal"
        icon={GraduationCap}
        action={
          <>
            <Dialog open={openPeserta} onOpenChange={setOpenPeserta}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={!selectedProgramId}>
                  <UserPlus className="size-4 mr-1" /> Tambah Peserta
                </Button>
              </DialogTrigger>
              {selectedProgramId && (
                <PesertaDialog
                  programId={selectedProgramId}
                  onClose={() => setOpenPeserta(false)}
                  onRefresh={fetchPrograms}
                />
              )}
            </Dialog>
            <Dialog open={openProgram} onOpenChange={setOpenProgram}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-1" /> Program Baru
                </Button>
              </DialogTrigger>
              <ProgramFormDialog
                onClose={() => setOpenProgram(false)}
                onRefresh={fetchPrograms}
              />
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Program Aktif" value={aktifPrograms.length} icon={GraduationCap} sub={`${programs.length} total program`} accent="primary" />
        <StatCard label="Total Peserta" value={totalPeserta} icon={Users} sub="WBP terdaftar" accent="accent" />
        <StatCard label="Kategori" value={new Set(programs.map((p) => p.kategori)).size} icon={Activity} sub="Jenis program" accent="primary" />
        <StatCard label="Prestasi Bulan Ini" value={3} icon={Award} sub="Lulusan & penghargaan" accent="warning" />
      </div>

      <Tabs defaultValue="program">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="program">Daftar Program</TabsTrigger>
          <TabsTrigger value="kehadiran">Kehadiran</TabsTrigger>
          <TabsTrigger value="prestasi">Prestasi</TabsTrigger>
        </TabsList>

        <TabsContent value="program" className="space-y-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Belum ada program pembinaan.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  onSelect={() => setSelectedProgramId(p.id)}
                  selected={selectedProgramId === p.id}
                  onRefresh={fetchPrograms}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kehadiran" className="space-y-4">
          <KehadiranTab />
        </TabsContent>

        <TabsContent value="prestasi" className="space-y-4">
          <SectionCard
            title="Prestasi & Kelulusan WBP"
            description="Pencapaian WBP dalam program pembinaan"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PrestasiCard title="Pelatihan Menjahit — Angkatan 5" date="12 Agu 2026" desc="18 WBP dinyatakan lulus dan siap mandiri pasca bebas." count={18} badge="Lulus" />
              <PrestasiCard title="Juara 2 Lomba Tahsin Tingkat Kemenkumham Kaltim" date="28 Jul 2026" desc="Tim WBP Lapas Bontang meraih juara 2 tingkat regional." count={4} badge="Juara" />
              <PrestasiCard title="Kejar Paket B — Angkatan 12" date="15 Jul 2026" desc="12 WBP menyelesaikan pendidikan kejar paket B." count={12} badge="Lulus" />
              <PrestasiCard title="Pameran Karya WBP" date="10 Jul 2026" desc="Produk tas, dompet, dan kerajinan dari program kemandirian dipamerkan." count={35} badge="Karya" />
              <PrestasiCard title="Sertifikat Kompetensi Bengkel Motor" date="30 Jun 2026" desc="15 WBP memperoleh sertifikat kompetensi service sepeda motor." count={15} badge="Sertifikasi" />
              <PrestasiCard title="Donor Darah WBP & Petugas" date="05 Agu 2026" desc="Kegiatan sosial bekerja sama dengan PMI Bontang." count={42} badge="Sosial" />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Program Card ───────────────────────────────────────────
function ProgramCard({
  program,
  onSelect,
  selected,
  onRefresh,
}: {
  program: ProgramItem;
  onSelect: () => void;
  selected: boolean;
  onRefresh: () => void;
}) {
  const [detail, setDetail] = useState<ProgramDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showPeserta, setShowPeserta] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  async function loadDetail() {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/pembinaan/${program.id}`);
      if (res.ok) {
        const json = await res.json();
        setDetail(json.data);
      }
    } catch { /* ignore */ }
    setDetailLoading(false);
  }

  function handleTogglePeserta() {
    if (!showPeserta && !detail) loadDetail();
    setShowPeserta(!showPeserta);
  }

  async function handleDelete() {
    if (!confirm(`Hapus program "${program.nama}"? Semua data peserta dan kehadiran juga akan dihapus.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pembinaan/${program.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal");
      }
      toast.success("Program berhasil dihapus");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  }

  const iconClass = KATEGORI_ICON_CLASS[program.kategori] || "bg-primary/10 text-primary";

  return (
    <div
      className={cn(
        "p-5 rounded-lg border bg-card hover:shadow-md transition-shadow",
        selected ? "border-primary/60 ring-1 ring-primary/20" : "border-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={onSelect}>
          <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", iconClass)}>
            <GraduationCap className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight">{program.nama}</h3>
            <div className="text-xs text-muted-foreground mt-0.5">{program.kategori}</div>
          </div>
        </div>
        <Badge className={cn(
          "text-[10px]",
          program.status === "Berjalan" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
          program.status === "Rencana" && "bg-amber-500/15 text-amber-700 border-amber-600/20",
          program.status === "Selesai" && "bg-muted text-muted-foreground",
        )}>
          {program.status}
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        {program.jadwal && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-3.5" /> {program.jadwal}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5" /> {program._count.peserta} peserta
        </div>
        {program.pembina && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GraduationCap className="size-3.5" /> Pembina: {program.pembina}
          </div>
        )}
      </div>

      {program.periode && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-muted-foreground">Periode</span>
            <span className="font-medium">{program.periode}</span>
          </div>
        </div>
      )}

      {/* Peserta list */}
      <div className="mt-3 pt-3 border-t border-border">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs w-full" onClick={handleTogglePeserta}>
          {showPeserta ? <X className="size-3.5 mr-1" /> : <Users className="size-3.5 mr-1" />}
          {showPeserta ? "Tutup Daftar Peserta" : "Lihat Peserta"}
        </Button>
        {showPeserta && (
          <div className="mt-2 max-h-40 overflow-y-auto scroll-thin">
            {detailLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : detail && detail.peserta.length > 0 ? (
              <div className="space-y-1">
                {detail.peserta.map((ps) => (
                  <PesertaRow key={ps.id} peserta={ps} onRefresh={() => { loadDetail(); onRefresh(); }} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-2">Belum ada peserta.</div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-border flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setEditing(true)}>
          <Pencil className="size-3 mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-md">
          <ProgramFormDialog editData={program} onClose={() => setEditing(false)} onRefresh={onRefresh} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Peserta Row ────────────────────────────────────────────
function PesertaRow({ peserta, onRefresh }: { peserta: PesertaItem; onRefresh: () => void }) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch(`/api/pembinaan/peserta?programId=${peserta.programId}&wbpId=${peserta.wbpId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal");
      }
      toast.success("Peserta dihapus");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus peserta");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50 text-xs">
      <div>
        <span className="font-medium">{peserta.wbp.nama}</span>
        <span className="text-muted-foreground ml-2">({peserta.wbp.nomorRegister})</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        disabled={removing}
        onClick={handleRemove}
      >
        {removing ? <Loader2 className="size-3 animate-spin" /> : <UserMinus className="size-3" />}
      </Button>
    </div>
  );
}

// ─── Program Form Dialog (Create / Edit) ────────────────────
function ProgramFormDialog({
  editData,
  onClose,
  onRefresh,
}: {
  editData?: ProgramItem;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [nama, setNama] = useState(editData?.nama || "");
  const [kategori, setKategori] = useState(editData?.kategori || "");
  const [periode, setPeriode] = useState(editData?.periode || "");
  const [pembina, setPembina] = useState(editData?.pembina || "");
  const [jadwal, setJadwal] = useState(editData?.jadwal || "");
  const [status, setStatus] = useState(editData?.status || "Berjalan");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { nama, kategori, periode, pembina, jadwal, status };
      const url = editData ? `/api/pembinaan/${editData.id}` : "/api/pembinaan";
      const method = editData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal");
      }
      toast.success(editData ? "Program diperbarui" : "Program berhasil dibuat");
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editData ? "Edit Program" : "Program Pembinaan Baru"}</DialogTitle>
        <DialogDescription>
          {editData ? "Perbarui data program pembinaan." : "Isi data program pembinaan baru."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="p-nama">Nama Program</Label>
          <Input id="p-nama" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Pelatihan Menjahit" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="p-kategori">Kategori</Label>
            <Select value={kategori} onValueChange={setKategori} required>
              <SelectTrigger id="p-kategori"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>
                {KATEGORI_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="p-status">Status</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger id="p-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="p-pembina">Pembina</Label>
          <Input id="p-pembina" value={pembina} onChange={(e) => setPembina(e.target.value)} placeholder="Nama pembina" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="p-periode">Periode</Label>
            <Input id="p-periode" value={periode} onChange={(e) => setPeriode(e.target.value)} placeholder="Januari – Juni 2026" />
          </div>
          <div>
            <Label htmlFor="p-jadwal">Jadwal</Label>
            <Input id="p-jadwal" value={jadwal} onChange={(e) => setJadwal(e.target.value)} placeholder="Setiap Selasa, 09:00" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
            {editData ? "Simpan" : "Buat Program"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

// ─── Peserta Dialog ─────────────────────────────────────────
function PesertaDialog({
  programId,
  onClose,
  onRefresh,
}: {
  programId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [wbpSearch, setWbpSearch] = useState("");
  const [wbpResults, setWbpResults] = useState<WBPItem[]>([]);
  const [selectedWbp, setSelectedWbp] = useState<WBPItem | null>(null);

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
    if (!selectedWbp) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pembinaan/peserta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, wbpId: selectedWbp.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal");
      }
      toast.success(`${selectedWbp.nama} ditambahkan sebagai peserta`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan peserta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tambah Peserta</DialogTitle>
        <DialogDescription>Cari dan pilih WBP untuk ditambahkan ke program.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="wbp-search">Cari WBP</Label>
          {selectedWbp ? (
            <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/40 bg-primary/5">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <span className="text-sm font-medium flex-1">{selectedWbp.nama} ({selectedWbp.nomorRegister})</span>
              <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setSelectedWbp(null); setWbpSearch(""); }}>Ganti</Button>
            </div>
          ) : (
            <>
              <Input
                id="wbp-search"
                value={wbpSearch}
                onChange={(e) => setWbpSearch(e.target.value)}
                placeholder="Ketik nama atau nomor register…"
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
            <UserPlus className="size-4 mr-1" /> Tambah
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

// ─── Kehadiran Tab ──────────────────────────────────────────
function KehadiranTab() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [kehadiranList, setKehadiranList] = useState<KehadiranItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openKehadiranForm, setOpenKehadiranForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load programs for dropdown
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pembinaan");
        if (res.ok) {
          const json = await res.json();
          const list: ProgramItem[] = json.data || [];
          setPrograms(list);
          if (list.length > 0 && !selectedProgram) setSelectedProgram(list[0].id);
        }
      } catch { /* ignore */ }
    }
    load();
  }, []);

  // Load kehadiran when program/tanggal/refreshKey changes
  const doFetch = useCallback(async () => {
    if (!selectedProgram || !tanggal) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ programId: selectedProgram, tanggal });
      const res = await fetch(`/api/pembinaan/kehadiran?${params}`);
      if (res.ok) {
        const json = await res.json();
        setKehadiranList(json.data || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedProgram, tanggal, refreshKey]);

  useEffect(() => {
     
    doFetch();
  }, [doFetch]);

  // Stats
  const hadirCount = kehadiranList.filter((k) => k.status === "Hadir").length;
  const totalCount = kehadiranList.length;
  const pct = totalCount > 0 ? Math.round((hadirCount / totalCount) * 100) : 0;

  return (
    <>
      <SectionCard
        title="Rekap Kehadiran Pembinaan"
        description="Kehadiran WBP pada setiap program pembinaan"
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="w-56">
            <Label className="text-xs">Program</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger><SelectValue placeholder="Pilih program" /></SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Label className="text-xs">Tanggal</Label>
            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button size="sm" variant="outline" onClick={() => setOpenKehadiranForm(true)}>
              <Plus className="size-4 mr-1" /> Catat Kehadiran
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
          <div className="text-sm"><span className="text-muted-foreground">Total:</span> <strong>{totalCount}</strong></div>
          <div className="text-sm"><span className="text-muted-foreground">Hadir:</span> <strong className="text-emerald-700">{hadirCount}</strong></div>
          <div className="text-sm"><span className="text-muted-foreground">Persentase:</span> <strong>{pct}%</strong></div>
          <div className="flex-1">
            <Progress value={pct} className="h-2" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : kehadiranList.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Belum ada data kehadiran untuk tanggal dan program ini.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border max-h-96 overflow-y-auto scroll-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                <TableRow>
                  <TableHead className="text-xs">WBP</TableHead>
                  <TableHead className="text-xs">Register</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kehadiranList.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="text-sm font-medium">{k.wbp.nama}</TableCell>
                    <TableCell className="text-xs font-mono">{k.wbp.nomorRegister}</TableCell>
                    <TableCell className="text-xs">{k.tanggal}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[10px]",
                        k.status === "Hadir" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
                        k.status === "Tidak Hadir" && "bg-red-500/15 text-red-600 border-red-600/20",
                        (k.status === "Izin" || k.status === "Sakit") && "bg-amber-500/15 text-amber-700 border-amber-600/20",
                      )}>
                        {k.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{k.catatan || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Kehadiran Form Dialog */}
      <Dialog open={openKehadiranForm} onOpenChange={setOpenKehadiranForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Kehadiran</DialogTitle>
            <DialogDescription>Rekam kehadiran WBP untuk program dan tanggal tertentu.</DialogDescription>
          </DialogHeader>
          <KehadiranForm
            programId={selectedProgram}
            tanggal={tanggal}
            onClose={() => setOpenKehadiranForm(false)}
            onRefresh={() => setRefreshKey((k) => k + 1)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Kehadiran Form ─────────────────────────────────────────
function KehadiranForm({
  programId,
  tanggal,
  onClose,
  onRefresh,
}: {
  programId: string;
  tanggal: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [wbpSearch, setWbpSearch] = useState("");
  const [wbpResults, setWbpResults] = useState<WBPItem[]>([]);
  const [selectedWbp, setSelectedWbp] = useState<WBPItem | null>(null);
  const [status, setStatus] = useState("Hadir");
  const [catatan, setCatatan] = useState("");

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
    if (!selectedWbp) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/pembinaan/kehadiran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, wbpId: selectedWbp.id, tanggal, status, catatan: catatan || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal");
      }
      toast.success(`Kehadiran ${selectedWbp.nama} tercatat: ${status}`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mencatat kehadiran");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label>Pilih WBP</Label>
        {selectedWbp ? (
          <div className="flex items-center gap-2 p-2 mt-1 rounded-lg border border-primary/40 bg-primary/5">
            <CheckCircle2 className="size-4 text-primary shrink-0" />
            <span className="text-sm font-medium flex-1">{selectedWbp.nama} ({selectedWbp.nomorRegister})</span>
            <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setSelectedWbp(null); setWbpSearch(""); }}>Ganti</Button>
          </div>
        ) : (
          <>
            <Input
              value={wbpSearch}
              onChange={(e) => setWbpSearch(e.target.value)}
              placeholder="Ketik nama atau nomor register…"
              autoComplete="off"
              className="mt-1"
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
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KEHADIRAN_STATUS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tanggal</Label>
          <Input type="date" value={tanggal} className="mt-1" disabled />
        </div>
      </div>
      <div>
        <Label>Catatan</Label>
        <Input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Opsional" className="mt-1" />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        <Button type="submit" disabled={submitting || !selectedWbp}>
          {submitting && <Loader2 className="size-4 mr-1 animate-spin" />}
          <CheckCircle2 className="size-4 mr-1" /> Simpan
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Prestasi Card ──────────────────────────────────────────
function PrestasiCard({ title, date, desc, count, badge }: { title: string; date: string; desc: string; count: number; badge: string }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="size-9 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
          <Award className="size-4" />
        </div>
        <Badge className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-600/20">{badge}</Badge>
      </div>
      <h3 className="font-semibold text-sm leading-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{date}</span>
        <span className="font-medium">{count} WBP</span>
      </div>
    </div>
  );
}
