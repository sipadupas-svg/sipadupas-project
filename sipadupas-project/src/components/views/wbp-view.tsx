"use client";

import {
  Users, Search, Plus, FileText, Activity, ArrowRightLeft,
  Building2, Calendar, Pencil, Trash2, AlertTriangle, Check, Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// ────────── API Types ──────────
interface KamarApi {
  id: string; roomNumber: string; maxCapacity: number; currentOccupancy: number;
  _count?: { wbp: number };
}

interface BlokApi {
  id: string; blockName: string; rooms: KamarApi[];
  totalCapacity: number; totalOccupancy: number;
  _count: { rooms: number };
}

interface WBPApi {
  id: string; nomorRegister: string; nama: string; nik: string | null;
  tempatLahir: string | null; tanggalLahir: string | null;
  jenisKelamin: string; pasal: string | null; lamaHukuman: string | null;
  tanggalEksekusi: string | null; risiko: string; status: string;
  tanggalMasuk: string; catatan: string | null;
  currentRoomId: string | null;
  currentRoom: { id: string; blockName: string; roomNumber: string; maxCapacity: number; currentOccupancy: number } | null;
}

interface MutasiRecord {
  id: string; tanggal: string; wbpNama: string; wbpRegister: string;
  jenis: string; dari: string; ke: string; alasan: string;
}

// ────────── Display helpers ──────────
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateShort(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function getInitials(nama: string) {
  return nama.split(" ").map((n) => n[0]).slice(0, 2).join("");
}


// ────────── Form type ──────────
interface WBPFormData {
  nama: string; nik: string; tempatLahir: string; tanggalLahir: string;
  jenisKelamin: string; pasal: string; lamaHukuman: string;
  tanggalEksekusi: string; ttm2per3: string; currentRoomId: string;
  status: string; risiko: string; catatan: string;
}

const emptyForm: WBPFormData = {
  nama: "", nik: "", tempatLahir: "", tanggalLahir: "", jenisKelamin: "",
  pasal: "", lamaHukuman: "", tanggalEksekusi: "", ttm2per3: "",
  currentRoomId: "", status: "Aktif", risiko: "Rendah", catatan: "",
};

// ────────── Sub Components ──────────
function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Aktif: "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
    "Rawat Inap": "bg-amber-500/15 text-amber-700 border-amber-600/20",
    "Kerja Luar": "bg-primary/10 text-primary border-primary/20",
    Isolasi: "bg-red-500/15 text-red-600 border-red-600/20",
    Libas: "bg-muted text-muted-foreground border-border",
    Bebas: "bg-muted text-muted-foreground border-border",
  };
  return <Badge className={cn("text-[10px] border", cls[status] ?? "")}>{status}</Badge>;
}

function RisikoBadge({ risiko }: { risiko: string }) {
  const cls: Record<string, string> = {
    Rendah: "bg-emerald-500/15 text-emerald-700",
    Sedang: "bg-amber-500/15 text-amber-700",
    Tinggi: "bg-red-500/15 text-red-600",
  };
  return <span className={cn("text-[10px] px-1.5 py-0.5 rounded", cls[risiko])}>{risiko}</span>;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg border border-border bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={cn("h-9 text-sm", error && "border-red-500 focus-visible:ring-red-500")}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Shared WBP form for Add & Edit dialogs
function WbpForm({ form, setForm, errors, warnings, blokList, onSubmit, onCancel, submitLabel, loading }: {
  form: WBPFormData; setForm: React.Dispatch<React.SetStateAction<WBPFormData>>;
  errors: Record<string, string>; warnings: Record<string, string>;
  blokList: BlokApi[]; onSubmit: () => void; onCancel: () => void;
  submitLabel: string; loading: boolean;
}) {
  // Build flat list of all rooms grouped by block
  const allRooms = blokList.flatMap((b) => b.rooms.map((r) => ({ ...r, blockName: b.blockName })));

  return (
    <div className="space-y-6 py-2">
      {/* Identitas Diri */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="size-4" /> Identitas Diri
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput label="Nama Lengkap *" value={form.nama}
            onChange={(v) => setForm((p) => ({ ...p, nama: v }))} placeholder="Masukkan nama lengkap" error={errors.nama} />
          <FormInput label="NIK" value={form.nik}
            onChange={(v) => setForm((p) => ({ ...p, nik: v }))} placeholder="16 digit NIK" error={errors.nik} />
          <FormInput label="Tempat Lahir" value={form.tempatLahir}
            onChange={(v) => setForm((p) => ({ ...p, tempatLahir: v }))} placeholder="Kota/Kabupaten" />
          <div className="space-y-1.5">
            <Label className="text-xs">Tanggal Lahir</Label>
            <Input type="date" value={form.tanggalLahir}
              onChange={(e) => setForm((p) => ({ ...p, tanggalLahir: e.target.value }))} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Jenis Kelamin</Label>
            <Select value={form.jenisKelamin} onValueChange={(v) => setForm((p) => ({ ...p, jenisKelamin: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>
      <Separator />
      {/* Data Perkara */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="size-4" /> Data Perkara
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput label="Pasal" value={form.pasal}
            onChange={(v) => setForm((p) => ({ ...p, pasal: v }))} placeholder="Contoh: 338 KUHP" />
          <FormInput label="Lama Hukuman" value={form.lamaHukuman}
            onChange={(v) => setForm((p) => ({ ...p, lamaHukuman: v }))} placeholder="Contoh: 5 tahun" />
          <div className="space-y-1.5">
            <Label className="text-xs">Tanggal Eksekusi</Label>
            <Input type="date" value={form.tanggalEksekusi}
              onChange={(e) => setForm((p) => ({ ...p, tanggalEksekusi: e.target.value }))} className="h-9 text-sm" />
          </div>
          <FormInput label="TTM 2/3" value={form.ttm2per3}
            onChange={(v) => setForm((p) => ({ ...p, ttm2per3: v }))} placeholder="Tanggal mulai 2/3" />
        </div>
      </fieldset>
      <Separator />
      {/* Penempatan */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="size-4" /> Penempatan
        </legend>
        <div className="space-y-1.5">
          <Label className="text-xs">Blok / Kamar</Label>
          <Select value={form.currentRoomId} onValueChange={(v) => setForm((p) => ({ ...p, currentRoomId: v }))}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pilih Blok / Kamar" /></SelectTrigger>
            <SelectContent>
              {blokList.map((b) => (
                <SelectGroup key={b.id}>
                  <SelectLabel className="text-xs font-semibold text-muted-foreground">{b.blockName} ({b.totalOccupancy}/{b.totalCapacity})</SelectLabel>
                  {b.rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.roomNumber} ({r.currentOccupancy}/{r.maxCapacity})</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </fieldset>
      <Separator />
      {/* Status & Risiko */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="size-4" /> Status & Risiko
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Rawat Inap">Rawat Inap</SelectItem>
                <SelectItem value="Kerja Luar">Kerja Luar</SelectItem>
                <SelectItem value="Isolasi">Isolasi</SelectItem>
                <SelectItem value="Bebas">Bebas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Risiko</Label>
            <Select value={form.risiko} onValueChange={(v) => setForm((p) => ({ ...p, risiko: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Rendah">Rendah</SelectItem>
                <SelectItem value="Sedang">Sedang</SelectItem>
                <SelectItem value="Tinggi">Tinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>
      <Separator />
      {/* Catatan */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">Catatan</legend>
        <Textarea value={form.catatan} onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))}
          placeholder="Catatan tambahan (opsional)" rows={3} className="text-sm" />
      </fieldset>
      {Object.keys(warnings).length > 0 &&
        Object.entries(warnings).map(([key, msg]) => (
          <div key={key} className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" /><span>{msg}</span>
          </div>
        ))}
      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading && <Loader2 className="size-4 mr-1 animate-spin" />}
          <Check className="size-4 mr-1" /> {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}

// WBP Detail dialog content
function WbpDetail({ w, onEdit, onMutasi, onDelete }: {
  w: WBPApi; onEdit: () => void; onMutasi: () => void; onDelete: () => void;
}) {
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="size-5 text-primary" /> Profil WBP
        </DialogTitle>
        <DialogDescription>
          Register <span className="font-mono">{w.nomorRegister}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-3">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className={cn("text-lg font-semibold",
              w.risiko === "Tinggi" ? "bg-red-500/15 text-red-600"
                : w.risiko === "Sedang" ? "bg-amber-500/15 text-amber-700"
                  : "bg-primary/10 text-primary"
            )}>
              {getInitials(w.nama)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{w.nama}</h3>
            <div className="text-sm text-muted-foreground font-mono">{w.nomorRegister}</div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={w.status} />
              <RisikoBadge risiko={w.risiko} />
            </div>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DetailField label="Kasus" value={w.pasal ? `Pasal ${w.pasal}` : "-"} />
          <DetailField label="Sisa Pidana" value={w.lamaHukuman || "-"} />
          <DetailField label="Blok" value={w.currentRoom?.blockName ?? "-"} />
          <DetailField label="Kamar" value={w.currentRoom?.roomNumber ?? "-"} />
          <DetailField label="Tanggal Masuk" value={fmtDate(w.tanggalMasuk)} />
          <DetailField label="NIK" value={w.nik ?? "-"} />
          <DetailField label="Tempat Lahir" value={w.tempatLahir ?? "-"} />
          <DetailField label="Risiko" value={w.risiko} />
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="size-4 mr-1" /> Edit</Button>
          <Button size="sm" variant="outline" onClick={onMutasi}><ArrowRightLeft className="size-4 mr-1" /> Mutasi</Button>
          <Button size="sm" variant="outline"><FileText className="size-4 mr-1" /> Dokumen</Button>
          <Button size="sm" variant="outline"><Activity className="size-4 mr-1" /> Riwayat Aktivitas</Button>
          <Button size="sm" variant="outline"><Calendar className="size-4 mr-1" /> Jadwal Kunjungan</Button>
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-500/10" onClick={onDelete}>
            <Trash2 className="size-4 mr-1" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

// ────────── Main Component ──────────
export function WbpView() {
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [wbpList, setWbpList] = useState<WBPApi[]>([]);
  const [blokList, setBlokList] = useState<BlokApi[]>([]);
  const [mutasiHistory, setMutasiHistory] = useState<MutasiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WBPApi | null>(null);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<WBPFormData>(emptyForm);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addWarnings, setAddWarnings] = useState<Record<string, string>>({});
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<WBPFormData>(emptyForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editWarnings, setEditWarnings] = useState<Record<string, string>>({});
  const [editingWBP, setEditingWBP] = useState<WBPApi | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingWBP, setDeletingWBP] = useState<WBPApi | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Mutasi dialog
  const [mutasiOpen, setMutasiOpen] = useState(false);
  const [mutasiWBP, setMutasiWBP] = useState<WBPApi | null>(null);
  const [mutasiTargetRoomId, setMutasiTargetRoomId] = useState("");
  const [mutasiAlasan, setMutasiAlasan] = useState("");
  const [mutasiOverride, setMutasiOverride] = useState(false);
  const [mutasiOverrideReason, setMutasiOverrideReason] = useState("");
  const [mutasiErrors, setMutasiErrors] = useState<Record<string, string>>({});
  const [mutasiLoading, setMutasiLoading] = useState(false);

  // ── Data fetching ──
  const fetchWBP = useCallback(async () => {
    try {
      const res = await fetch("/api/wbp");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setWbpList(json.data ?? []);
    } catch { toast.error("Gagal memuat data WBP"); }
    finally { setLoading(false); }
  }, []);

  const fetchBlok = useCallback(async () => {
    try {
      const res = await fetch("/api/blok");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setBlokList(json.data ?? []);
    } catch { toast.error("Gagal memuat data blok"); }
  }, []);

  useEffect(() => { fetchWBP(); fetchBlok(); }, [fetchWBP, fetchBlok]);

  // ── Filtered list ──
  const filtered = wbpList.filter((w) => {
    const mq = !q || w.nama.toLowerCase().includes(q.toLowerCase()) || w.nomorRegister.toLowerCase().includes(q.toLowerCase());
    const ms = filterStatus === "all" || w.status === filterStatus;
    return mq && ms;
  });

  // ── Stats ──
  const totalKapasitas = blokList.reduce((s, b) => s + b.totalCapacity, 0);
  const totalWBP = wbpList.length;
  const risikoTinggi = wbpList.filter((w) => w.risiko === "Tinggi").length;
  const aktifBlok = wbpList.filter((w) => w.status === "Aktif").length;
  const mutasiBulanIni = mutasiHistory.length;

  // ── Mutasi helpers ──
  const allRoomsForMutasi = blokList.flatMap((b) => b.rooms.map((r) => ({ ...r, blockName: b.blockName })));
  const mutasiTargetRoom = allRoomsForMutasi.find((r) => r.id === mutasiTargetRoomId);
  const isTargetOverCapacity = mutasiTargetRoom ? mutasiTargetRoom.currentOccupancy >= mutasiTargetRoom.maxCapacity : false;

  // ── Add handlers ──
  const openAddDialog = () => {
    setAddForm(emptyForm);
    setAddErrors({});
    setAddWarnings({});
    setAddOpen(true);
  };

  const validateAddForm = () => {
    const errs: Record<string, string> = {};
    if (!addForm.nama.trim()) errs.nama = "Nama WBP wajib diisi";
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSave = async () => {
    if (!validateAddForm()) return;
    setAddLoading(true);
    try {
      const now = new Date();
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
      const prefix = `WBP-${yyyymm}-`;
      const existingNums = wbpList
        .filter((w) => w.nomorRegister.startsWith(prefix))
        .map((w) => parseInt(w.nomorRegister.slice(prefix.length), 10) || 0);
      const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
      const nomorRegister = `${prefix}${String(nextNum).padStart(3, "0")}`;

      const res = await fetch("/api/wbp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorRegister, nama: addForm.nama.trim(), nik: addForm.nik || null,
          tempatLahir: addForm.tempatLahir || null,
          tanggalLahir: addForm.tanggalLahir || null,
          jenisKelamin: addForm.jenisKelamin || "Laki-laki",
          pasal: addForm.pasal || null, lamaHukuman: addForm.lamaHukuman || null,
          tanggalEksekusi: addForm.tanggalEksekusi || null,
          risiko: addForm.risiko || "Rendah",
          currentRoomId: addForm.currentRoomId || null,
          catatan: addForm.catatan || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menambah WBP");
      }
      const json = await res.json();
      setWbpList((prev) => [json.data, ...prev]);
      setAddOpen(false);
      toast.success("WBP berhasil ditambahkan", { description: `${json.data.nama} — ${json.data.nomorRegister}` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menambah WBP");
    } finally { setAddLoading(false); }
  };

  // ── Edit handlers ──
  const openEditDialog = (w: WBPApi) => {
    setEditingWBP(w);
    setEditForm({
      nama: w.nama, nik: w.nik ?? "", tempatLahir: w.tempatLahir ?? "",
      tanggalLahir: fmtDateShort(w.tanggalLahir), jenisKelamin: w.jenisKelamin,
      pasal: w.pasal ?? "", lamaHukuman: w.lamaHukuman ?? "",
      tanggalEksekusi: fmtDateShort(w.tanggalEksekusi), ttm2per3: "",
      currentRoomId: w.currentRoomId ?? "",
      status: w.status, risiko: w.risiko, catatan: w.catatan ?? "",
    });
    setEditErrors({});
    setEditWarnings({});
    setEditOpen(true);
  };

  const validateEditForm = () => {
    const errs: Record<string, string> = {};
    if (!editForm.nama.trim()) errs.nama = "Nama WBP wajib diisi";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm() || !editingWBP) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/wbp/${editingWBP.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: editForm.nama.trim(), nik: editForm.nik || null,
          tempatLahir: editForm.tempatLahir || null,
          tanggalLahir: editForm.tanggalLahir || null,
          jenisKelamin: editForm.jenisKelamin || "Laki-laki",
          pasal: editForm.pasal || null, lamaHukuman: editForm.lamaHukuman || null,
          tanggalEksekusi: editForm.tanggalEksekusi || null,
          risiko: editForm.risiko, status: editForm.status,
          currentRoomId: editForm.currentRoomId || null,
          catatan: editForm.catatan || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memperbarui WBP");
      }
      const json = await res.json();
      setWbpList((prev) => prev.map((w) => w.id === json.data.id ? json.data : w));
      if (detail?.id === editingWBP.id) setDetail(json.data);
      setEditOpen(false);
      setEditingWBP(null);
      toast.success("Data WBP berhasil diperbarui", { description: editForm.nama.trim() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui WBP");
    } finally { setEditLoading(false); }
  };

  // ── Delete handlers ──
  const openDeleteDialog = (w: WBPApi) => { setDeletingWBP(w); setDeleteOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!deletingWBP) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/wbp/${deletingWBP.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus WBP");
      }
      setWbpList((prev) => prev.filter((w) => w.id !== deletingWBP.id));
      if (detail?.id === deletingWBP.id) setDetail(null);
      setDeleteOpen(false);
      toast.success("WBP berhasil dihapus", { description: `${deletingWBP.nama} — ${deletingWBP.nomorRegister}` });
      setDeletingWBP(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus WBP");
    } finally { setDeleteLoading(false); }
  };

  // ── Mutasi handlers ──
  const openMutasiDialog = (w: WBPApi) => {
    setMutasiWBP(w);
    setMutasiTargetRoomId("");
    setMutasiAlasan(""); setMutasiOverride(false); setMutasiOverrideReason("");
    setMutasiErrors({});
    setMutasiOpen(true);
  };

  const handleMutasiConfirm = async () => {
    const errs: Record<string, string> = {};
    if (!mutasiTargetRoomId) errs.kamar = "Pilih kamar tujuan";
    if (!mutasiAlasan.trim()) errs.alasan = "Alasan pemindahan wajib diisi";
    if (isTargetOverCapacity && !mutasiOverride) errs.kapasitas = "Kamar penuh. Centang override untuk melanjutkan.";
    if (isTargetOverCapacity && mutasiOverride && !mutasiOverrideReason.trim()) errs.overrideReason = "Alasan override wajib diisi";
    setMutasiErrors(errs);
    if (Object.keys(errs).length > 0 || !mutasiWBP) return;

    setMutasiLoading(true);
    try {
      const res = await fetch(`/api/wbp/${mutasiWBP.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRoomId: mutasiTargetRoomId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memindahkan WBP");
      }
      const json = await res.json();
      const updated = json.data;
      setWbpList((prev) => prev.map((w) => w.id === updated.id ? updated : w));
      if (detail?.id === mutasiWBP.id) setDetail(updated);

      const dari = `${mutasiWBP.currentRoom?.blockName ?? "-"} · ${mutasiWBP.currentRoom?.roomNumber ?? "-"}`;
      const ke = `${updated.currentRoom?.blockName ?? "-"} · ${updated.currentRoom?.roomNumber ?? "-"}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      setMutasiHistory((prev) => [{
        id: `MH-${Date.now()}`, tanggal: dateStr, wbpNama: mutasiWBP.nama,
        wbpRegister: mutasiWBP.nomorRegister, jenis: "Mutasi Lokal",
        dari, ke, alasan: mutasiAlasan.trim(),
      }, ...prev]);

      setMutasiOpen(false); setMutasiWBP(null);
      toast.success("Mutasi berhasil dilakukan", { description: `${mutasiWBP.nama} dipindahkan ke ${ke}` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memindahkan WBP");
    } finally { setMutasiLoading(false); }
  };

  // ── Per-Blok tab: blokList drives the grid ──

  // ── Render ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Memuat data WBP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen WBP"
        description="Data Warga Binaan Pemasyarakatan: profil, dokumen, mutasi, riwayat aktivitas, dan status tahanan."
        badge="Internal" icon={Users}
        action={<Button size="sm" onClick={openAddDialog}><Plus className="size-4 mr-1" /> Tambah WBP</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total WBP" value={totalWBP} icon={Users} sub={`Kapasitas ${totalKapasitas}`} accent="primary" />
        <StatCard label="Risiko Tinggi" value={risikoTinggi} icon={Activity} sub="Perlu pantauan" accent="danger" />
        <StatCard label="Aktif di Blok" value={aktifBlok} icon={Building2} sub="Aktif regular" accent="accent" />
        <StatCard label="Mutasi Total" value={mutasiBulanIni} icon={ArrowRightLeft} sub="Riwayat mutasi" accent="warning" />
      </div>

      <Tabs defaultValue="daftar">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="daftar">Daftar WBP</TabsTrigger>
          <TabsTrigger value="blok">Per Blok</TabsTrigger>
          <TabsTrigger value="mutasi">Mutasi</TabsTrigger>
        </TabsList>

        {/* ===== DAFTAR TAB ===== */}
        <TabsContent value="daftar" className="space-y-4">
          <SectionCard
            title="Data WBP"
            description={`${filtered.length} dari ${wbpList.length} ditampilkan`}
            action={(
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/register..." className="w-48 pl-8 h-9" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Rawat Inap">Rawat Inap</SelectItem>
                    <SelectItem value="Kerja Luar">Kerja Luar</SelectItem>
                    <SelectItem value="Isolasi">Isolasi</SelectItem>
                    <SelectItem value="Libas">Libas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          >
            <div className="overflow-hidden rounded-lg border border-border max-h-[520px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="text-xs">WBP</TableHead>
                    <TableHead className="text-xs">Kasus</TableHead>
                    <TableHead className="text-xs">Lokasi</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Risiko</TableHead>
                    <TableHead className="text-xs">Sisa Pidana</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((w) => (
                    <TableRow key={w.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setDetail(w)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className={cn("text-xs font-semibold",
                              w.risiko === "Tinggi" ? "bg-red-500/15 text-red-600"
                                : w.risiko === "Sedang" ? "bg-amber-500/15 text-amber-700"
                                  : "bg-primary/10 text-primary"
                            )}>{getInitials(w.nama)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{w.nama}</div>
                            <div className="text-xs text-muted-foreground font-mono">{w.nomorRegister}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{w.pasal ? `Pasal ${w.pasal}` : "-"}</TableCell>
                      <TableCell className="text-xs">
                        <div>{w.currentRoom?.blockName ?? "-"}</div>
                        <div className="text-muted-foreground">{w.currentRoom?.roomNumber ?? "-"}</div>
                      </TableCell>
                      <TableCell><StatusBadge status={w.status} /></TableCell>
                      <TableCell><RisikoBadge risiko={w.risiko} /></TableCell>
                      <TableCell className="text-xs">{w.lamaHukuman || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                          onClick={(e) => { e.stopPropagation(); setDetail(w); }}>Detail</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ===== PER BLOK TAB ===== */}
        <TabsContent value="blok" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blokList.map((blok) => {
              const list = wbpList.filter((w) => w.currentRoom?.blockName === blok.blockName);
              return (
                <Card key={blok.id}>
                  <div className="p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-primary" />
                        <h3 className="font-semibold text-sm">{blok.blockName}</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{list.length} WBP</Badge>
                    </div>
                  </div>
                  <div className="p-2 max-h-72 overflow-y-auto scroll-thin space-y-1">
                    {list.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">Belum ada data</div>
                    )}
                    {list.map((w) => (
                      <button key={w.id} onClick={() => setDetail(w)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted/60 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{w.nama}</div>
                            <div className="text-[11px] text-muted-foreground">{w.currentRoom?.roomNumber ?? "-"} · {w.pasal ? `Pasal ${w.pasal}` : "-"}</div>
                          </div>
                          <StatusBadge status={w.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== MUTASI TAB ===== */}
        <TabsContent value="mutasi" className="space-y-4">
          <SectionCard title="Riwayat Mutasi WBP" description="Perpindahan blok, kamar, dan status WBP">
            <div className="overflow-hidden rounded-lg border border-border max-h-[520px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs">Tanggal</TableHead>
                    <TableHead className="text-xs">WBP</TableHead>
                    <TableHead className="text-xs">Jenis</TableHead>
                    <TableHead className="text-xs">Dari</TableHead>
                    <TableHead className="text-xs">Ke</TableHead>
                    <TableHead className="text-xs">Alasan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mutasiHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada riwayat mutasi</TableCell>
                    </TableRow>
                  )}
                  {mutasiHistory.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">{m.tanggal}</TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{m.wbpNama}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{m.wbpRegister}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px] border",
                          m.jenis === "Isolasi" ? "bg-red-500/15 text-red-600 border-red-600/20"
                            : m.jenis === "Rawat Inap" ? "bg-amber-500/15 text-amber-700 border-amber-600/20"
                              : m.jenis === "Kerja Luar" ? "bg-primary/10 text-primary border-primary/20"
                                : m.jenis === "Libas" ? "bg-muted text-muted-foreground border-border"
                                  : "bg-emerald-500/15 text-emerald-700 border-emerald-600/20"
                        )}>{m.jenis}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{m.dari}</TableCell>
                      <TableCell className="text-xs">{m.ke}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.alasan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ===== DETAIL DIALOG ===== */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          {detail && <WbpDetail w={detail} onEdit={() => openEditDialog(detail)}
            onMutasi={() => openMutasiDialog(detail)} onDelete={() => openDeleteDialog(detail)} />}
        </DialogContent>
      </Dialog>

      {/* ===== ADD WBP DIALOG ===== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" /> Tambah WBP Baru
            </DialogTitle>
            <DialogDescription>Lengkapi data Warga Binaan Pemasyarakatan berikut.</DialogDescription>
          </DialogHeader>
          <WbpForm form={addForm} setForm={setAddForm} errors={addErrors} warnings={addWarnings}
            blokList={blokList} onSubmit={handleAddSave} onCancel={() => setAddOpen(false)} submitLabel="Simpan WBP" loading={addLoading} />
        </DialogContent>
      </Dialog>

      {/* ===== EDIT WBP DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scroll-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-primary" /> Edit Data WBP
            </DialogTitle>
            <DialogDescription>
              {editingWBP && <>Mengubah data <span className="font-mono font-semibold">{editingWBP.nomorRegister}</span></>}
            </DialogDescription>
          </DialogHeader>
          <WbpForm form={editForm} setForm={setEditForm} errors={editErrors} warnings={editWarnings}
            blokList={blokList} onSubmit={handleEditSave} onCancel={() => setEditOpen(false)} submitLabel="Simpan Perubahan" loading={editLoading} />
        </DialogContent>
      </Dialog>

      {/* ===== DELETE ALERT DIALOG ===== */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-red-500" /> Hapus WBP
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Apakah Anda yakin ingin menghapus data WBP berikut?</p>
                {deletingWBP && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="font-semibold">{deletingWBP.nama}</div>
                    <div className="text-sm text-muted-foreground font-mono">{deletingWBP.nomorRegister}</div>
                    <div className="text-sm text-muted-foreground mt-1">{deletingWBP.currentRoom?.blockName ?? "-"} · {deletingWBP.currentRoom?.roomNumber ?? "-"}</div>
                  </div>
                )}
                <p className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white">
              {deleteLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== MUTASI DIALOG ===== */}
      <Dialog open={mutasiOpen} onOpenChange={setMutasiOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scroll-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-primary" /> Mutasi Lokal WBP
            </DialogTitle>
            <DialogDescription>Pindahkan WBP ke blok/kamar baru.</DialogDescription>
          </DialogHeader>
          {mutasiWBP && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WBP</div>
                <div className="text-sm font-semibold">{mutasiWBP.nama}</div>
                <div className="text-xs text-muted-foreground font-mono">{mutasiWBP.nomorRegister}</div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Blok Saat Ini</div>
                    <div className="font-medium">{mutasiWBP.currentRoom?.blockName ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Kamar Saat Ini</div>
                    <div className="font-medium">{mutasiWBP.currentRoom?.roomNumber ?? "-"}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRightLeft className="size-4" /> Tujuan Pemindahan
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Tujuan Pemindahan (Blok / Kamar)</Label>
                    <Select value={mutasiTargetRoomId} onValueChange={(v) => {
                      setMutasiTargetRoomId(v);
                      if (mutasiErrors.kamar) setMutasiErrors((p) => { const n = { ...p }; delete n.kamar; return n; });
                    }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pilih Blok / Kamar" /></SelectTrigger>
                      <SelectContent>
                        {blokList.map((b) => (
                          <SelectGroup key={b.id}>
                            <SelectLabel className="text-xs font-semibold text-muted-foreground">{b.blockName} ({b.totalOccupancy}/{b.totalCapacity})</SelectLabel>
                            {b.rooms.map((r) => (
                              <SelectItem key={r.id} value={r.id}>{r.roomNumber} ({r.currentOccupancy}/{r.maxCapacity})</SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    {mutasiErrors.kamar && <p className="text-xs text-red-500">{mutasiErrors.kamar}</p>}
                </div>
                {mutasiTargetRoom && (() => {
                  const k = mutasiTargetRoom;
                  const isOver = k.currentOccupancy >= k.maxCapacity;
                  const sisa = k.maxCapacity - k.currentOccupancy;
                  return (
                    <div className={cn("flex items-center gap-3 p-3 rounded-lg border text-sm",
                      isOver ? "bg-red-500/10 border-red-500/20 text-red-700"
                        : sisa <= 1 ? "bg-amber-500/10 border-amber-500/20 text-amber-700"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                    )}>
                      {isOver ? <AlertTriangle className="size-4 shrink-0" /> : <Check className="size-4 shrink-0" />}
                      <div>
                        <span className="font-medium">
                          {isOver ? "Kamar telah melebihi kapasitas max" : sisa <= 1 ? "Kamar hampir penuh" : "Kamar tersedia"}
                        </span>
                        <span className="ml-2">— {k.currentOccupancy}/{k.maxCapacity} terisi ({sisa} sisa)</span>
                      </div>
                    </div>
                  );
                })()}
                {isTargetOverCapacity && (
                  <div className="space-y-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2">
                      <Checkbox id="mutasi-override" checked={mutasiOverride}
                        onCheckedChange={(v) => {
                          setMutasiOverride(!!v);
                          if (mutasiErrors.kapasitas) setMutasiErrors((p) => { const n = { ...p }; delete n.kapasitas; return n; });
                        }} />
                      <Label htmlFor="mutasi-override" className="text-sm font-medium cursor-pointer">Override kapasitas penuh</Label>
                    </div>
                    {mutasiOverride && (
                      <Textarea value={mutasiOverrideReason} onChange={(e) => {
                        setMutasiOverrideReason(e.target.value);
                        if (mutasiErrors.overrideReason) setMutasiErrors((p) => { const n = { ...p }; delete n.overrideReason; return n; });
                      }} placeholder="Alasan override kapasitas wajib diisi..." rows={2}
                        className={cn("text-sm", mutasiErrors.overrideReason && "border-red-500 focus-visible:ring-red-500")} />
                    )}
                    {mutasiErrors.kapasitas && <p className="text-xs text-red-500">{mutasiErrors.kapasitas}</p>}
                    {mutasiErrors.overrideReason && <p className="text-xs text-red-500">{mutasiErrors.overrideReason}</p>}
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Alasan Pemindahan *</Label>
                <Select value={mutasiAlasan} onValueChange={(v) => {
                  setMutasiAlasan(v);
                  if (mutasiErrors.alasan) setMutasiErrors((p) => { const n = { ...p }; delete n.alasan; return n; });
                }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pemisahan keamanan">Pemisahan keamanan</SelectItem>
                    <SelectItem value="Integrasi">Integrasi</SelectItem>
                    <SelectItem value="Instruksi pimpinan">Instruksi pimpinan</SelectItem>
                    <SelectItem value="Kesehatan / Rawat inap">Kesehatan / Rawat inap</SelectItem>
                    <SelectItem value="Pelanggaran tata tertib">Pelanggaran tata tertib</SelectItem>
                    <SelectItem value="Program pembinaan">Program pembinaan</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                {mutasiErrors.alasan && <p className="text-xs text-red-500">{mutasiErrors.alasan}</p>}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setMutasiOpen(false)}>Batal</Button>
            <Button onClick={handleMutasiConfirm} disabled={mutasiLoading}>
              {mutasiLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
              <ArrowRightLeft className="size-4 mr-1" /> Konfirmasi Pemindahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
