"use client";

import {
  ShieldCheck, Stethoscope, Wrench, Users, Building2, Clock, AlertTriangle,
  Search, Plus, ArrowRightLeft, CalendarDays, ChevronDown, ChevronUp, Eye,
  Check, Send, UserCheck, ArrowUpRight, Shield, BedDouble, Briefcase,
  Save, AlertOctagon, Loader2, Upload,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── API Response Types ─── */

interface WBPItem {
  id: string; nama: string; nomorRegister: string;
  currentRoom: { id: string; blockName: string; roomNumber: string; maxCapacity: number; currentOccupancy: number } | null;
  status: string; risiko: string; pasal?: string; lamaHukuman?: string;
}

interface BlokItem {
  id: string; blockName: string; rooms: {
    id: string; roomNumber: string; maxCapacity: number; currentOccupancy: number;
    _count?: { wbp: number };
  }[];
  totalCapacity: number; totalOccupancy: number;
  _count: { rooms: number };
}

interface ReguItem { id: string; nama: string; anggota: string | null; status: string }

interface JadwalItem {
  id: string; reguId: string; tanggal: string; shift: string; pos: string | null;
  regu: { id: string; nama: string };
}

interface GangguanItem {
  id: string; nomorInsiden: string | null; tanggal: string;
  blok: string | null; kamar: string | null; jenis: string; tingkat: string;
  kronologi: string | null; tindakanAwal: string | null; wbpTerlibat: string | null;
  status: string; tindakLanjut: string | null; rekomendasi: string | null;
  reporter: { id: string; nama: string; nip: string } | null;
  assignedTo: { id: string; nama: string; nip: string } | null;
}

interface STItem {
  id: string; tanggal: string; reguId: string; reguDariId: string; reguKeId: string;
  totalWBP: number; wbpRawatInap: number; wbpKerjaLuar: number;
  catatanKeamanan: string | null; catatanInventaris: string | null; catatanKejadian: string | null;
  status: string; confirmedAt: string | null;
  regu: ReguItem; reguDari: { id: string; nama: string; nip: string };
  reguKe: { id: string; nama: string; nip: string };
}

interface RIItem {
  id: string; wbpId: string; rumahSakit: string;
  tanggalKeluar: string; tanggalKembali: string | null;
  petugasPendamping: string | null; kondisiKembali: string | null;
  status: string;
  wbp: { id: string; nama: string; nomorRegister: string; currentRoom: { id: string; blockName: string; roomNumber: string } | null };
}

interface KLItem {
  id: string; wbpId: string; kegiatan: string; lokasi: string | null;
  jamKeluar: string; estimasiKembali: string | null; jamKembali: string | null;
  petugasPengawal: string | null; keterlambatan: boolean; status: string;
  wbp: { id: string; nama: string; nomorRegister: string; currentRoom: { id: string; blockName: string; roomNumber: string } | null };
}

interface DashData {
  totalWBP: number; diDalam: number; rawatInap: number; kerjaLuar: number;
  isolasi: number; activeGangguan: number;
  blokDistribution: { blokId: string; nama: string; count: number }[];
}

/* ─── Constants ─── */

const POS_OPTIONS = ["Pos Utama", "Pos Atas", "Blok A", "Blok B", "Blok C", "Blok D", "Pos Pintu"];
const SHIFT_OPTIONS = ["Pagi", "Siang", "Malam"];
const JENIS_GANGGUAN = ["Perkelahian", "Percobaan Pelarian", "Narkoba", "Pengrusakan", "Pencurian", "Tawuran", "Lainnya"];
const TINGKAT_KERAWANAN = [
  { value: "Rendah", color: "bg-emerald-500", label: "Rendah" },
  { value: "Sedang", color: "bg-amber-500", label: "Sedang" },
  { value: "Tinggi", color: "bg-orange-500", label: "Tinggi" },
  { value: "Kritis", color: "bg-red-500", label: "Kritis" },
];
const WORKFLOW_STEPS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const WORKFLOW_COLORS: Record<string, string> = {
  OPEN: "bg-red-500/15 text-red-600 border-red-600/20",
  IN_PROGRESS: "bg-amber-500/15 text-amber-700 border-amber-600/20",
  RESOLVED: "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  CLOSED: "bg-muted text-muted-foreground",
};

/* ─── Helpers ─── */

function fmtDate(d: string) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
}
function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const cur = new Date(start), endD = new Date(end);
  while (cur <= endD) { days.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate() + 1); }
  return days;
}
async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  const json = await res.json();
  return json.data;
}

/* ─── Jadwal Entry (for create dialog) ─── */
interface JadwalEntry { tanggal: string; shift: string; pos: string }

/* ═══════════════════════════════════════════════════════════════════ */

export function PengamananView() {
  // ─── Data States ───
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashData | null>(null);
  const [wbpList, setWbpList] = useState<WBPItem[]>([]);
  const [blokList, setBlokList] = useState<BlokItem[]>([]);
  const [reguList, setReguList] = useState<ReguItem[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);
  const [serahTerimaList, setSerahTerimaList] = useState<STItem[]>([]);
  const [gangguanList, setGangguanList] = useState<GangguanItem[]>([]);
  const [rawatInapList, setRawatInapList] = useState<RIItem[]>([]);
  const [kerjaLuarList, setKerjaLuarList] = useState<KLItem[]>([]);

  // ─── Filter States ───
  const [q, setQ] = useState("");
  const [filterBlok, setFilterBlok] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // ─── Jadwal Dialog ───
  const [jadwalDialogOpen, setJadwalDialogOpen] = useState(false);
  const [jadwalReguId, setJadwalReguId] = useState("");
  const [jadwalStart, setJadwalStart] = useState("");
  const [jadwalEnd, setJadwalEnd] = useState("");
  const [jadwalEntries, setJadwalEntries] = useState<JadwalEntry[]>([]);
  const [jadwalSubmitting, setJadwalSubmitting] = useState(false);

  // ─── Serah Terima Dialog ───
  const [stDialogOpen, setStDialogOpen] = useState(false);
  const [stForm, setStForm] = useState({ reguId: "", reguDariId: "", reguKeId: "", catatanInventaris: "", catatanKeamanan: "", catatanKejadian: "" });
  const [stConfirmOpen, setStConfirmOpen] = useState(false);
  const [stConfirmId, setStConfirmId] = useState("");
  const [stSubmitting, setStSubmitting] = useState(false);

  // ─── Blok Expand ───
  const [expandedBlok, setExpandedBlok] = useState<string | null>(null);
  const [wbpKamarDialogOpen, setWbpKamarDialogOpen] = useState(false);
  const [wbpKamarBlok, setWbpKamarBlok] = useState("");
  const [wbpKamarNama, setWbpKamarNama] = useState("");

  // ─── Gangguan Dialog ───
  const [gangguanDialogOpen, setGangguanDialogOpen] = useState(false);
  const [gangguanForm, setGangguanForm] = useState({ tanggal: "", blok: "", kamar: "", jenis: "", tingkat: "", wbpTerlibat: "", kronologi: "", tindakanAwal: "" });
  const [gangguanSubmitting, setGangguanSubmitting] = useState(false);

  // ─── Gangguan Detail ───
  const [gangguanDetailOpen, setGangguanDetailOpen] = useState(false);
  const [selectedGangguan, setSelectedGangguan] = useState<GangguanItem | null>(null);
  const [tindakLanjutText, setTindakLanjutText] = useState("");
  const [rekomendasiText, setRekomendasiText] = useState("");
  const [workflowSubmitting, setWorkflowSubmitting] = useState(false);

  // ─── Rawat Inap ───
  const [riDialogOpen, setRiDialogOpen] = useState(false);
  const [riForm, setRiForm] = useState({ wbpId: "", rumahSakit: "", tanggalKeluar: "", petugasPendamping: "" });
  const [riKembaliOpen, setRiKembaliOpen] = useState(false);
  const [riKembaliId, setRiKembaliId] = useState("");
  const [riKembaliForm, setRiKembaliForm] = useState({ tanggalKembali: "", kondisiKesehatan: "" });
  const [riSubmitting, setRiSubmitting] = useState(false);

  // ─── Kerja Luar ───
  const [klDialogOpen, setKlDialogOpen] = useState(false);
  const [klForm, setKlForm] = useState({ wbpId: "", kegiatan: "", lokasi: "", jamKeluar: "", estimasiKembali: "", petugasPengawal: "" });
  const [klKembaliOpen, setKlKembaliOpen] = useState(false);
  const [klKembaliId, setKlKembaliId] = useState("");
  const [klKembaliForm, setKlKembaliForm] = useState({ jamKembali: "", catatan: "" });
  const [klSubmitting, setKlSubmitting] = useState(false);

  // ─── Fetch All Data ───
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, wbp, blok, regu, jadwal, st, g, ri, kl] = await Promise.all([
        api<DashData>("/api/pengamanan"),
        api<WBPItem[]>("/api/wbp"),
        api<BlokItem[]>("/api/blok"),
        api<ReguItem[]>("/api/regu"),
        api<JadwalItem[]>("/api/pengamanan/jadwal-regu"),
        api<STItem[]>("/api/pengamanan/serah-terima"),
        api<GangguanItem[]>("/api/pengamanan/gangguan"),
        api<RIItem[]>("/api/pengamanan/rawat-inap"),
        api<KLItem[]>("/api/pengamanan/kerja-luar"),
      ]);
      setDashboard(dash); setWbpList(wbp); setBlokList(blok); setReguList(regu);
      setJadwalList(jadwal); setSerahTerimaList(st); setGangguanList(g);
      setRawatInapList(ri); setKerjaLuarList(kl);
    } catch (e) {
      toast.error("Gagal memuat data pengamanan");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Computed ───
  const filtered = wbpList.filter((w) => {
    const mq = !q || w.nama.toLowerCase().includes(q.toLowerCase()) || w.nomorRegister.toLowerCase().includes(q.toLowerCase());
    const mb = filterBlok === "all" || w.currentRoom?.id === filterBlok;
    const ms = filterStatus === "all" || w.status === filterStatus;
    return mq && mb && ms;
  });

  const wbpInKamar = useMemo(() =>
    wbpList.filter((w) => w.currentRoom?.roomNumber === wbpKamarNama && w.currentRoom?.id === wbpKamarBlok),
    [wbpList, wbpKamarBlok, wbpKamarNama]
  );

  const wbpBebas = useMemo(() => wbpList.filter((w) => w.status === "Bebas"), [wbpList]);

  const jadwalGrouped = useMemo(() => {
    const map = new Map<string, JadwalItem[]>();
    jadwalList.forEach((j) => { const arr = map.get(j.regu.nama) || []; arr.push(j); map.set(j.regu.nama, arr); });
    return Array.from(map.entries());
  }, [jadwalList]);

  // ─── Handlers ───

  // Jadwal Regu
  const openJadwalDialog = useCallback(() => {
    setJadwalReguId(""); setJadwalStart(""); setJadwalEnd(""); setJadwalEntries([]);
    setJadwalDialogOpen(true);
  }, []);

  const handleJadwalDateChange = useCallback((start: string, end: string) => {
    setJadwalStart(start); setJadwalEnd(end);
    if (start && end) {
      setJadwalEntries(getDaysBetween(start, end).map((d) => ({ tanggal: d, shift: "Pagi", pos: POS_OPTIONS[0] })));
    } else { setJadwalEntries([]); }
  }, []);

  const submitJadwal = useCallback(async () => {
    if (!jadwalReguId || !jadwalStart || !jadwalEnd || jadwalEntries.length === 0) { toast.error("Lengkapi semua data jadwal"); return; }
    setJadwalSubmitting(true);
    try {
      await Promise.all(jadwalEntries.map((e) =>
        api<JadwalItem>("/api/pengamanan/jadwal-regu", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reguId: jadwalReguId, tanggal: e.tanggal, shift: e.shift, pos: e.pos }),
        })
      ));
      setJadwalDialogOpen(false);
      toast.success("Jadwal regu berhasil disimpan & dipublikasikan");
      fetchAll();
    } catch (e) { toast.error("Gagal menyimpan jadwal"); } finally { setJadwalSubmitting(false); }
  }, [jadwalReguId, jadwalStart, jadwalEnd, jadwalEntries, fetchAll]);

  // Serah Terima
  const openStDialog = useCallback(() => {
    setStForm({ reguId: "", reguDariId: "", reguKeId: "", catatanInventaris: "", catatanKeamanan: "", catatanKejadian: "" });
    setStDialogOpen(true);
  }, []);

  const submitSerahTerima = useCallback(async () => {
    if (!stForm.reguId || !stForm.reguDariId || !stForm.reguKeId) { toast.error("Regu wajib diisi"); return; }
    setStSubmitting(true);
    try {
      await api<STItem>("/api/pengamanan/serah-terima", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reguId: stForm.reguId, reguDariId: stForm.reguDariId, reguKeId: stForm.reguKeId,
          totalWBP: dashboard?.diDalam || 0, wbpRawatInap: dashboard?.rawatInap || 0,
          wbpKerjaLuar: dashboard?.kerjaLuar || 0,
          catatanKeamanan: stForm.catatanKeamanan, catatanInventaris: stForm.catatanInventaris,
          catatanKejadian: stForm.catatanKejadian,
        }),
      });
      setStDialogOpen(false);
      toast.success("Serah terima berhasil dibuat");
      fetchAll();
    } catch (e) { toast.error("Gagal membuat serah terima"); } finally { setStSubmitting(false); }
  }, [stForm, dashboard, fetchAll]);

  const submitSerahTerimaConfirm = useCallback(async () => {
    setStSubmitting(true);
    try {
      await api<STItem>(`/api/pengamanan/serah-terima/${stConfirmId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      setStConfirmOpen(false);
      toast.success("Serah terima berhasil dikonfirmasi");
      fetchAll();
    } catch (e) { toast.error("Gagal mengkonfirmasi"); } finally { setStSubmitting(false); }
  }, [stConfirmId, fetchAll]);

  // Gangguan
  const openGangguanDialog = useCallback(() => {
    setGangguanForm({ tanggal: "", blok: "", kamar: "", jenis: "", tingkat: "", wbpTerlibat: "", kronologi: "", tindakanAwal: "" });
    setGangguanDialogOpen(true);
  }, []);

  const submitGangguan = useCallback(async () => {
    if (!gangguanForm.jenis || !gangguanForm.kronologi) { toast.error("Jenis gangguan dan kronologi wajib diisi"); return; }
    setGangguanSubmitting(true);
    try {
      const g = await api<GangguanItem>("/api/pengamanan/gangguan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: gangguanForm.tanggal || new Date().toISOString(), jenis: gangguanForm.jenis,
          tingkat: gangguanForm.tingkat || "Sedang", blok: gangguanForm.blok || null,
          kamar: gangguanForm.kamar || null, kronologi: gangguanForm.kronologi,
          tindakanAwal: gangguanForm.tindakanAwal || null, wbpTerlibat: gangguanForm.wbpTerlibat || null,
        }),
      });
      setGangguanDialogOpen(false);
      toast.success(`Laporan gangguan terkirim - ${g.nomorInsiden || g.id}`);
      fetchAll();
    } catch (e) { toast.error("Gagal mengirim laporan gangguan"); } finally { setGangguanSubmitting(false); }
  }, [gangguanForm, fetchAll]);

  const openGangguanDetail = useCallback((g: GangguanItem) => {
    setSelectedGangguan(g);
    setTindakLanjutText(g.tindakLanjut || "");
    setRekomendasiText(g.rekomendasi || "");
    setGangguanDetailOpen(true);
  }, []);

  const advanceWorkflow = useCallback(async (action: string) => {
    if (!selectedGangguan) return;
    setWorkflowSubmitting(true);
    try {
      const body: Record<string, unknown> = { action };
      if (action === "resolve") body.tindakLanjut = tindakLanjutText;
      if (action === "resolve" && rekomendasiText) body.rekomendasi = rekomendasiText;
      const updated = await api<GangguanItem>(`/api/pengamanan/gangguan/${selectedGangguan.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      setSelectedGangguan(updated);
      toast.success(`Status diubah ke ${updated.status}`);
      fetchAll();
    } catch (e) { toast.error("Gagal mengubah status"); } finally { setWorkflowSubmitting(false); }
  }, [selectedGangguan, tindakLanjutText, rekomendasiText, fetchAll]);

  // Rawat Inap
  const openRiDialog = useCallback(() => {
    setRiForm({ wbpId: "", rumahSakit: "", tanggalKeluar: "", petugasPendamping: "" });
    setRiDialogOpen(true);
  }, []);

  const submitRawatInap = useCallback(async () => {
    if (!riForm.wbpId || !riForm.rumahSakit) { toast.error("WBP dan rumah sakit wajib diisi"); return; }
    setRiSubmitting(true);
    try {
      await api<RIItem>("/api/pengamanan/rawat-inap", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wbpId: riForm.wbpId, rumahSakit: riForm.rumahSakit, tanggalKeluar: riForm.tanggalKeluar || new Date().toISOString(), petugasPendamping: riForm.petugasPendamping }),
      });
      setRiDialogOpen(false);
      toast.success("Data rawat inap berhasil disimpan");
      fetchAll();
    } catch (e) { toast.error("Gagal menyimpan data rawat inap"); } finally { setRiSubmitting(false); }
  }, [riForm, fetchAll]);

  const submitRiKembali = useCallback(async () => {
    if (!riKembaliForm.tanggalKembali) { toast.error("Tanggal kembali wajib diisi"); return; }
    setRiSubmitting(true);
    try {
      await api<RIItem>(`/api/pengamanan/rawat-inap/${riKembaliId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "kembali", tanggalKembali: riKembaliForm.tanggalKembali, kondisiKembali: riKembaliForm.kondisiKesehatan }),
      });
      setRiKembaliOpen(false);
      toast.success("WBP telah kembali dari rawat inap");
      fetchAll();
    } catch (e) { toast.error("Gagal memproses kembali"); } finally { setRiSubmitting(false); }
  }, [riKembaliId, riKembaliForm, fetchAll]);

  // Kerja Luar
  const openKlDialog = useCallback(() => {
    setKlForm({ wbpId: "", kegiatan: "", lokasi: "", jamKeluar: "", estimasiKembali: "", petugasPengawal: "" });
    setKlDialogOpen(true);
  }, []);

  const submitKerjaLuar = useCallback(async () => {
    if (!klForm.wbpId || !klForm.kegiatan) { toast.error("WBP dan jenis kegiatan wajib diisi"); return; }
    setKlSubmitting(true);
    try {
      await api<KLItem>("/api/pengamanan/kerja-luar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wbpId: klForm.wbpId, kegiatan: klForm.kegiatan, lokasi: klForm.lokasi, petugasPengawal: klForm.petugasPengawal, estimasiKembali: klForm.estimasiKembali ? new Date().toISOString().replace(/T.*$/, "T" + klForm.estimasiKembali + ":00") : null }),
      });
      setKlDialogOpen(false);
      toast.success("WBP telah dikeluarkan untuk kerja luar");
      fetchAll();
    } catch (e) { toast.error("Gagal mengeluarkan WBP"); } finally { setKlSubmitting(false); }
  }, [klForm, fetchAll]);

  const submitKlKembali = useCallback(async () => {
    if (!klKembaliForm.jamKembali) { toast.error("Jam kembali wajib diisi"); return; }
    setKlSubmitting(true);
    try {
      const result = await api<KLItem>(`/api/pengamanan/kerja-luar/${klKembaliId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "kembali", jamKembali: new Date().toISOString().replace(/T.*$/, "T" + klKembaliForm.jamKembali + ":00") }),
      });
      setKlKembaliOpen(false);
      if (result.keterlambatan) {
        toast.warning("Keterlambatan Kembali", { description: `${result.wbp.nama} kembali melebihi estimasi` });
      } else {
        toast.success(`${result.wbp.nama} telah kembali dari kerja luar`);
      }
      fetchAll();
    } catch (e) { toast.error("Gagal memproses kembali"); } finally { setKlSubmitting(false); }
  }, [klKembaliId, klKembaliForm, fetchAll]);

  // ─── Render ───
  if (loading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Modul Pengamanan" description="Monitoring WBP, blok/kamar, jadwal regu, gangguan keamanan, dan serah terima petugas." badge="Real-time" icon={ShieldCheck}
        action={<Button size="sm" onClick={openGangguanDialog}><AlertTriangle className="size-4 mr-1" /> Catat Gangguan</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="WBP Aktif" value={dashboard?.diDalam ?? 0} icon={Users} sub={`dari ${dashboard?.totalWBP ?? 0} total`} accent="primary" />
        <StatCard label="Rawat Inap" value={dashboard?.rawatInap ?? 0} icon={Stethoscope} sub="Dirawat di klinik" accent="warning" />
        <StatCard label="Kerja Luar" value={dashboard?.kerjaLuar ?? 0} icon={Wrench} sub="WBP di luar Lapas" accent="accent" />
        <StatCard label="Gangguan Aktif" value={dashboard?.activeGangguan ?? 0} icon={AlertTriangle} sub={`${gangguanList.filter(g => g.status === "CLOSED" || g.status === "RESOLVED").length} selesai`} accent="danger" />
      </div>

      <Tabs defaultValue="monitoring">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="monitoring">Monitoring WBP</TabsTrigger>
          <TabsTrigger value="blok">Blok & Kamar</TabsTrigger>
          <TabsTrigger value="regu">Jadwal Regu</TabsTrigger>
          <TabsTrigger value="serah-terima">Serah Terima</TabsTrigger>
          <TabsTrigger value="rawat-inap">Rawat Inap</TabsTrigger>
          <TabsTrigger value="kerja-luar">Kerja Luar</TabsTrigger>
          <TabsTrigger value="wbp-bebas">WBP Bebas</TabsTrigger>
          <TabsTrigger value="gangguan">Gangguan</TabsTrigger>
        </TabsList>

        {/* ── MONITORING WBP TAB ── */}
        <TabsContent value="monitoring" className="space-y-4">
          <SectionCard title="Daftar WBP" description={`${filtered.length} dari ${wbpList.length} ditampilkan`} action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Cari nama/register..." value={q} onChange={(e) => setQ(e.target.value)} className="w-48 pl-8 h-9" />
              </div>
              <Select value={filterBlok} onValueChange={setFilterBlok}>
                <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Blok" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Blok</SelectItem>
                  {blokList.map((b) => (<SelectItem key={b.id} value={b.id}>{b.blockName}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Rawat Inap">Rawat Inap</SelectItem>
                  <SelectItem value="Kerja Luar">Kerja Luar</SelectItem>
                  <SelectItem value="Isolasi">Isolasi</SelectItem>
                  <SelectItem value="Bebas">Bebas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }>
            <div className="overflow-hidden rounded-lg border border-border max-h-[480px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="text-xs">WBP</TableHead>
                    <TableHead className="text-xs">Blok/Kamar</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Risiko</TableHead>
                    <TableHead className="text-xs">Pasal</TableHead>
                    <TableHead className="text-xs text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((w) => (<WbpRow key={w.id} w={w} />))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">Tidak ada WBP yang cocok dengan filter.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── BLOK & KAMAR TAB (UF-06) ── */}
        <TabsContent value="blok" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blokList.map((b) => {
              const pct = b.totalCapacity > 0 ? Math.round((b.totalOccupancy / b.totalCapacity) * 100) : 0;
              const tone = pct >= 95 ? "danger" : pct >= 80 ? "warning" : "primary";
              const barCls = { primary: "bg-primary", warning: "bg-amber-500", danger: "bg-red-500" }[tone];
              const isExpanded = expandedBlok === b.id;
              return (
                <Card key={b.id} className={cn("overflow-hidden transition-all", isExpanded && "sm:col-span-2 lg:col-span-3")}>
                  <div className="p-5 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedBlok((p) => p === b.id ? null : b.id)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Building2 className="size-4" /></div>
                        <div>
                          <h3 className="font-semibold text-sm">{b.blockName}</h3>
                          <p className="text-xs text-muted-foreground">{b.totalOccupancy} / {b.totalCapacity} WBP</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[10px]", tone === "danger" && "bg-red-500/15 text-red-600 border-red-600/20", tone === "warning" && "bg-amber-500/15 text-amber-700 border-amber-600/20", tone === "primary" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20")}>{pct}%</Badge>
                        {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full transition-all", barCls)} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sisa kapasitas: {b.totalCapacity - b.totalOccupancy} slot</span>
                      <span className="flex items-center gap-1">{isExpanded ? "Tutup" : "Detail"} <ChevronDown className={cn("size-3 transition-transform", isExpanded && "rotate-180")} /></span>
                    </div>
                  </div>
                  {isExpanded && b.rooms.length > 0 && (
                    <div className="px-5 pb-5 border-t border-border/60">
                      <div className="pt-3 space-y-2 max-h-64 overflow-y-auto scroll-thin">
                        {b.rooms.map((k) => {
                          const kPct = k.maxCapacity > 0 ? Math.round((k.currentOccupancy / k.maxCapacity) * 100) : 0;
                          return (
                            <div key={k.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium">{k.roomNumber}</span>
                                  <span className="text-[11px] text-muted-foreground">{k.currentOccupancy}/{k.maxCapacity}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full", kPct >= 100 ? "bg-red-500" : kPct >= 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(kPct, 100)}%` }} /></div>
                              </div>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] shrink-0" onClick={(e) => { e.stopPropagation(); setWbpKamarBlok(k.id); setWbpKamarNama(k.roomNumber); setWbpKamarDialogOpen(true); }}><Eye className="size-3 mr-1" /> Lihat WBP</Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ── JADWAL REGU TAB (UF-04) ── */}
        <TabsContent value="regu" className="space-y-4">
          <SectionCard title="Jadwal Regu Pengamanan" description="Shift & serah terima petugas" action={
            <Button size="sm" onClick={openJadwalDialog}><Plus className="size-4 mr-1" /> Buat Jadwal</Button>
          }>
            <div className="grid sm:grid-cols-2 gap-3">
              {reguList.map((r) => (
                <div key={r.id} className={cn("p-4 rounded-lg border", r.status === "Aktif" ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm">{r.nama}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Status: {r.status}</div>
                    </div>
                    <Badge className={cn("text-[10px]", r.status === "Aktif" ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20" : "bg-muted text-muted-foreground")}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
            {jadwalGrouped.length > 0 && (
              <div className="mt-6">
                <Separator className="mb-4" />
                <h4 className="text-sm font-semibold mb-3">Jadwal Dipublikasikan ({jadwalList.length} entry)</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto scroll-thin">
                  {jadwalGrouped.map(([reguNama, entries]) => (
                    <div key={reguNama} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div><div className="font-semibold text-sm">{reguNama}</div><div className="text-xs text-muted-foreground mt-0.5">{entries.length} jadwal</div></div>
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-600/20 text-[10px]">Dipublikasikan</Badge>
                      </div>
                      <div className="mt-2 max-h-40 overflow-y-auto scroll-thin">
                        <Table><TableHeader><TableRow><TableHead className="text-[11px]">Tanggal</TableHead><TableHead className="text-[11px]">Shift</TableHead><TableHead className="text-[11px]">Pos</TableHead></TableRow></TableHeader>
                        <TableBody>{entries.map((e) => (<TableRow key={e.id}><TableCell className="text-xs">{fmtDate(e.tanggal)}</TableCell><TableCell className="text-xs">{e.shift}</TableCell><TableCell className="text-xs">{e.pos || "-"}</TableCell></TableRow>))}</TableBody></Table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ── GANGGUAN TAB (UF-07 + UF-08) ── */}
        <TabsContent value="gangguan" className="space-y-4">
          <SectionCard title="Gangguan Keamanan" description="Catatan insiden dan tindak lanjut" action={
            <Button size="sm" onClick={openGangguanDialog}><Plus className="size-4 mr-1" /> Catat Gangguan</Button>
          }>
            <div className="overflow-hidden rounded-lg border border-border max-h-[480px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Tanggal</TableHead>
                    <TableHead className="text-xs">Jenis</TableHead>
                    <TableHead className="text-xs">Lokasi</TableHead>
                    <TableHead className="text-xs">Pelapor</TableHead>
                    <TableHead className="text-xs">Kerawanan</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gangguanList.map((g) => (
                    <TableRow key={g.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => openGangguanDetail(g)}>
                      <TableCell className="text-xs font-mono">{g.nomorInsiden || g.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs font-medium whitespace-nowrap"><div className="flex items-center gap-1.5"><CalendarDays className="size-3 text-muted-foreground" />{fmtDate(g.tanggal)}</div></TableCell>
                      <TableCell className="text-xs"><div className="font-medium">{g.jenis}</div><div className="text-[11px] text-muted-foreground mt-0.5 max-w-xs truncate">{g.kronologi}</div></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{g.blok ? `Blok ${g.blok}${g.kamar ? ` - ${g.kamar}` : ""}` : "-"}</TableCell>
                      <TableCell className="text-xs">{g.reporter?.nama || "-"}</TableCell>
                      <TableCell>{g.tingkat && <Badge className={cn("text-[10px]", g.tingkat === "Kritis" && "bg-red-500/15 text-red-600 border-red-600/20", g.tingkat === "Tinggi" && "bg-orange-500/15 text-orange-700 border-orange-600/20", g.tingkat === "Sedang" && "bg-amber-500/15 text-amber-700 border-amber-600/20", g.tingkat === "Rendah" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20")}>{g.tingkat}</Badge>}</TableCell>
                      <TableCell><Badge className={cn("text-[10px]", WORKFLOW_COLORS[g.status] || WORKFLOW_COLORS.OPEN)}>{g.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {gangguanList.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-8">Belum ada catatan gangguan keamanan.</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── SERAH TERIMA TAB (UF-05) ── */}
        <TabsContent value="serah-terima" className="space-y-4">
          <SectionCard title="Serah Terima Regu" description="Daftar serah terima antar shift" action={
            <Button size="sm" onClick={openStDialog}><Plus className="size-4 mr-1" /> Buat Serah Terima</Button>
          }>
            <div className="space-y-3">
              {serahTerimaList.map((st) => (<SerahTerimaCard key={st.id} st={st} onConfirm={() => { setStConfirmId(st.id); setStConfirmOpen(true); }} />))}
              {serahTerimaList.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Belum ada data serah terima.</div>}
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── RAWAT INAP TAB (UF-09) ── */}
        <TabsContent value="rawat-inap" className="space-y-4">
          <SectionCard title="WBP Rawat Inap" description="WBP yang sedang dirawat di klinik Lapas atau RSUD" action={
            <Button size="sm" onClick={openRiDialog}><Plus className="size-4 mr-1" /> Tambah Data Rawat Inap</Button>
          }>
            <div className="overflow-hidden rounded-lg border border-border max-h-[480px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow><TableHead className="text-xs">WBP</TableHead><TableHead className="text-xs">Lokasi</TableHead><TableHead className="text-xs">RS/Unit</TableHead><TableHead className="text-xs">Tgl Mulai</TableHead><TableHead className="text-xs">Pendamping</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {rawatInapList.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/40">
                      <TableCell><div className="text-sm font-medium">{r.wbp.nama}</div><div className="text-xs text-muted-foreground font-mono">{r.wbp.nomorRegister}</div></TableCell>
                      <TableCell className="text-xs">{r.wbp.currentRoom?.blockName || "-"} → {r.rumahSakit}</TableCell>
                      <TableCell className="text-xs">{r.rumahSakit}</TableCell>
                      <TableCell className="text-xs">{fmtDate(r.tanggalKeluar)}</TableCell>
                      <TableCell className="text-xs">{r.petugasPendamping || "-"}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px]", r.status === "AKTIF" && "bg-red-500/15 text-red-600 border-red-600/20", r.status === "KEMBALI" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20")}>{r.status === "AKTIF" ? "Dirawat" : "Selesai"}</Badge>
                        {r.tanggalKembali && <div className="text-[10px] text-muted-foreground mt-0.5">Kembali: {fmtDate(r.tanggalKembali)}</div>}
                      </TableCell>
                      <TableCell className="text-right">{r.status === "AKTIF" && <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => { setRiKembaliId(r.id); setRiKembaliForm({ tanggalKembali: "", kondisiKesehatan: "" }); setRiKembaliOpen(true); }}><UserCheck className="size-3 mr-1" /> Proses Kembali</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── KERJA LUAR TAB (UF-10) ── */}
        <TabsContent value="kerja-luar" className="space-y-4">
          <SectionCard title="WBP Kerja Luar" description="WBP yang sedang berada di luar Lapas untuk kegiatan pembinaan" action={
            <Button size="sm" onClick={openKlDialog}><Plus className="size-4 mr-1" /> Izin Kerja Luar Baru</Button>
          }>
            <div className="overflow-hidden rounded-lg border border-border max-h-[480px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow><TableHead className="text-xs">WBP</TableHead><TableHead className="text-xs">Kegiatan</TableHead><TableHead className="text-xs">Lokasi</TableHead><TableHead className="text-xs">PJ</TableHead><TableHead className="text-xs">Keluar</TableHead><TableHead className="text-xs">Est. Kembali</TableHead><TableHead className="text-xs">Status</TableHead><TableHead className="text-xs text-right">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {kerjaLuarList.map((k) => (
                    <TableRow key={k.id} className="hover:bg-muted/40">
                      <TableCell><div className="text-sm font-medium">{k.wbp.nama}</div><div className="text-xs text-muted-foreground font-mono">{k.wbp.nomorRegister}</div></TableCell>
                      <TableCell className="text-xs">{k.kegiatan}</TableCell>
                      <TableCell className="text-xs">{k.lokasi || "-"}</TableCell>
                      <TableCell className="text-xs">{k.petugasPengawal || "-"}</TableCell>
                      <TableCell className="text-xs">{fmtTime(k.jamKeluar)}</TableCell>
                      <TableCell className="text-xs">{k.estimasiKembali ? fmtTime(k.estimasiKembali) : "-"}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px]", k.status === "AKTIF" && "bg-primary/10 text-primary border-primary/20", k.status === "KEMBALI" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20", k.status === "TERLAMBAT" && "bg-red-500/15 text-red-600 border-red-600/20")}>{k.status === "AKTIF" ? "Keluar" : k.status === "TERLAMBAT" ? "Terlambat" : "Kembali"}</Badge>
                        {k.jamKembali && <div className="text-[10px] text-muted-foreground mt-0.5">Tiba: {fmtTime(k.jamKembali)}</div>}
                      </TableCell>
                      <TableCell className="text-right">{k.status === "AKTIF" && <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => { setKlKembaliId(k.id); setKlKembaliForm({ jamKembali: "", catatan: "" }); setKlKembaliOpen(true); }}><UserCheck className="size-3 mr-1" /> Konfirmasi Kembali</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── WBP BEBAS TAB ── */}
        <TabsContent value="wbp-bebas" className="space-y-4">
          <SectionCard title="WBP Bebas" description="WBP yang telah/sedang dalam proses pembebasan">
            <div className="grid sm:grid-cols-2 gap-3">
              {wbpBebas.map((w) => (
                <div key={w.id} className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div><div className="font-medium text-sm">{w.nama}</div><div className="text-xs text-muted-foreground font-mono">{w.nomorRegister}</div></div>
                    <Badge className="text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-600/20">Bebas</Badge>
                  </div>
                  <div className="text-xs space-y-1 mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between"><span className="text-muted-foreground">Blok:</span><span className="font-medium">{w.currentRoom?.blockName || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pasal:</span><span className="font-medium">{w.pasal || "-"}</span></div>
                  </div>
                </div>
              ))}
              {wbpBebas.length === 0 && <div className="text-sm text-muted-foreground text-center py-8 col-span-2">Tidak ada WBP dengan status Bebas.</div>}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ═══ DIALOGS ═══ */}

      {/* Jadwal Regu Dialog */}
      <Dialog open={jadwalDialogOpen} onOpenChange={setJadwalDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Buat Jadwal Regu</DialogTitle><DialogDescription>Atur jadwal pengamanan untuk periode tertentu</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Regu</Label><Select value={jadwalReguId} onValueChange={setJadwalReguId}><SelectTrigger><SelectValue placeholder="Pilih regu" /></SelectTrigger><SelectContent>{reguList.map((r) => (<SelectItem key={r.id} value={r.id}>{r.nama}</SelectItem>))}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tanggal Mulai</Label><Input type="date" value={jadwalStart} onChange={(e) => handleJadwalDateChange(e.target.value, jadwalEnd)} /></div>
              <div className="space-y-2"><Label>Tanggal Selesai</Label><Input type="date" value={jadwalEnd} onChange={(e) => handleJadwalDateChange(jadwalStart, e.target.value)} /></div>
            </div>
            {jadwalEntries.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Detail Jadwal Per Hari ({jadwalEntries.length} hari)</Label>
                <div className="max-h-64 overflow-y-auto scroll-thin rounded-lg border border-border">
                  <Table><TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10"><TableRow><TableHead className="text-xs">Tanggal</TableHead><TableHead className="text-xs">Shift</TableHead><TableHead className="text-xs">Pos</TableHead></TableRow></TableHeader>
                  <TableBody>{jadwalEntries.map((e, idx) => (<TableRow key={idx}><TableCell className="text-xs font-medium">{fmtDate(e.tanggal)}</TableCell><TableCell><Select value={e.shift} onValueChange={(v) => setJadwalEntries((p) => p.map((ent, i) => i === idx ? { ...ent, shift: v } : ent))}><SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>{SHIFT_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></TableCell><TableCell><Select value={e.pos} onValueChange={(v) => setJadwalEntries((p) => p.map((ent, i) => i === idx ? { ...ent, pos: v } : ent))}><SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>{POS_OPTIONS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></TableCell></TableRow>))}</TableBody></Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setJadwalDialogOpen(false)}>Batal</Button><Button onClick={submitJadwal} disabled={jadwalSubmitting}>{jadwalSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<Save className="size-4 mr-1" /> Simpan & Publikasikan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Serah Terima Create Dialog */}
      <Dialog open={stDialogOpen} onOpenChange={setStDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Buat Serah Terima</DialogTitle><DialogDescription>Isi form serah terima antar regu pengamanan</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
              <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Ringkasan Otomatis</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><div className="text-lg font-bold text-primary">{dashboard?.diDalam ?? 0}</div><div className="text-[11px] text-muted-foreground">WBP di Dalam</div></div>
                <div><div className="text-lg font-bold text-amber-600">{dashboard?.rawatInap ?? 0}</div><div className="text-[11px] text-muted-foreground">Rawat Inap</div></div>
                <div><div className="text-lg font-bold text-blue-600">{dashboard?.kerjaLuar ?? 0}</div><div className="text-[11px] text-muted-foreground">Kerja Luar</div></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Regu</Label><Select value={stForm.reguId} onValueChange={(v) => setStForm((f) => ({ ...f, reguId: v }))}><SelectTrigger><SelectValue placeholder="Pilih regu" /></SelectTrigger><SelectContent>{reguList.map((r) => (<SelectItem key={r.id} value={r.id}>{r.nama}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Regu Sebelum</Label><Select value={stForm.reguDariId} onValueChange={(v) => setStForm((f) => ({ ...f, reguDariId: v }))}><SelectTrigger><SelectValue placeholder="Pilih regu" /></SelectTrigger><SelectContent>{reguList.map((r) => (<SelectItem key={r.id} value={r.id}>{r.nama}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Regu Sesudah</Label><Select value={stForm.reguKeId} onValueChange={(v) => setStForm((f) => ({ ...f, reguKeId: v }))}><SelectTrigger><SelectValue placeholder="Pilih regu" /></SelectTrigger><SelectContent>{reguList.map((r) => (<SelectItem key={r.id} value={r.id}>{r.nama}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Catatan Keamanan</Label><Textarea placeholder="Kondisi WBP saat serah terima..." value={stForm.catatanKeamanan} onChange={(e) => setStForm((f) => ({ ...f, catatanKeamanan: e.target.value }))} rows={2} /></div>
            <div className="space-y-2"><Label>Catatan Inventaris</Label><Textarea placeholder="Kondisi Senjata, Amunisi, Kunci, HT..." value={stForm.catatanInventaris} onChange={(e) => setStForm((f) => ({ ...f, catatanInventaris: e.target.value }))} rows={2} /></div>
            <div className="space-y-2"><Label>Catatan Kejadian Khusus</Label><Textarea placeholder="Kejadian khusus selama shift..." value={stForm.catatanKejadian} onChange={(e) => setStForm((f) => ({ ...f, catatanKejadian: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setStDialogOpen(false)}>Batal</Button><Button onClick={submitSerahTerima} disabled={stSubmitting}>{stSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<Send className="size-4 mr-1" /> Buat Serah Terima</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Serah Terima Confirm AlertDialog */}
      <AlertDialog open={stConfirmOpen} onOpenChange={setStConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Konfirmasi Terima Serah Terima</AlertDialogTitle><AlertDialogDescription>Anda yakin ingin mengkonfirmasi serah terima ini? Aksi ini tidak dapat dibatalkan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={submitSerahTerimaConfirm} disabled={stSubmitting}>{stSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}Konfirmasi</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* WBP di Kamar Dialog */}
      <Dialog open={wbpKamarDialogOpen} onOpenChange={setWbpKamarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>WBP di {wbpKamarNama}</DialogTitle><DialogDescription>Blok {blokList.find(b => b.rooms.some(r => r.id === wbpKamarBlok))?.blockName || wbpKamarBlok}</DialogDescription></DialogHeader>
          <div className="max-h-64 overflow-y-auto scroll-thin space-y-2">
            {wbpInKamar.length === 0 ? <div className="text-sm text-muted-foreground text-center py-4">Tidak ada WBP di kamar ini.</div> : wbpInKamar.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/40">
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">{w.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
                <div className="min-w-0"><div className="text-sm font-medium truncate">{w.nama}</div><div className="text-[11px] text-muted-foreground font-mono">{w.nomorRegister}</div></div>
                <Badge className={cn("text-[10px] ml-auto shrink-0", w.risiko === "Tinggi" && "bg-red-500/15 text-red-600", w.risiko === "Sedang" && "bg-amber-500/15 text-amber-700", w.risiko === "Rendah" && "bg-emerald-500/15 text-emerald-700")}>{w.risiko}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setWbpKamarDialogOpen(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gangguan Create Dialog */}
      <Dialog open={gangguanDialogOpen} onOpenChange={setGangguanDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertOctagon className="size-5 text-red-500" />Catat Gangguan Keamanan</DialogTitle><DialogDescription>Laporan insiden keamanan di dalam Lapas</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Waktu Insiden <span className="text-red-500">*</span></Label><Input type="datetime-local" value={gangguanForm.tanggal} onChange={(e) => setGangguanForm((f) => ({ ...f, tanggal: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Tingkat Kerawanan</Label><div className="flex items-center gap-3"><Select value={gangguanForm.tingkat} onValueChange={(v) => setGangguanForm((f) => ({ ...f, tingkat: v }))}><SelectTrigger className="flex-1"><SelectValue placeholder="Pilih tingkat" /></SelectTrigger><SelectContent>{TINGKAT_KERAWANAN.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent></Select>{gangguanForm.tingkat && <div className={cn("size-4 rounded-full shrink-0", TINGKAT_KERAWANAN.find((t) => t.value === gangguanForm.tingkat)?.color)} />}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Lokasi - Blok</Label><Select value={gangguanForm.blok} onValueChange={(v) => setGangguanForm((f) => ({ ...f, blok: v }))}><SelectTrigger><SelectValue placeholder="Pilih blok" /></SelectTrigger><SelectContent>{blokList.map((b) => (<SelectItem key={b.id} value={b.blockName.replace("Blok ", "")}>{b.blockName}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Kamar</Label><Input placeholder="Contoh: A-04" value={gangguanForm.kamar} onChange={(e) => setGangguanForm((f) => ({ ...f, kamar: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Jenis Gangguan <span className="text-red-500">*</span></Label><Select value={gangguanForm.jenis} onValueChange={(v) => setGangguanForm((f) => ({ ...f, jenis: v }))}><SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger><SelectContent>{JENIS_GANGGUAN.map((j) => (<SelectItem key={j} value={j}>{j}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>WBP Terlibat</Label><Input placeholder="Nama WBP, pisahkan dengan koma..." value={gangguanForm.wbpTerlibat} onChange={(e) => setGangguanForm((f) => ({ ...f, wbpTerlibat: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Kronologi Singkat <span className="text-red-500">*</span></Label><Textarea placeholder="Jelaskan kronologi kejadian..." value={gangguanForm.kronologi} onChange={(e) => setGangguanForm((f) => ({ ...f, kronologi: e.target.value }))} rows={4} /></div>
            <div className="space-y-2"><Label>Tindakan Awal yang Telah Diambil</Label><Textarea placeholder="Langkah-langkah yang sudah dilakukan..." value={gangguanForm.tindakanAwal} onChange={(e) => setGangguanForm((f) => ({ ...f, tindakanAwal: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setGangguanDialogOpen(false)}>Batal</Button><Button className="bg-red-600 hover:bg-red-700" onClick={submitGangguan} disabled={gangguanSubmitting}>{gangguanSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<Send className="size-4 mr-1" /> Kirim Laporan Gangguan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gangguan Detail / Workflow Dialog */}
      <Dialog open={gangguanDetailOpen} onOpenChange={setGangguanDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertOctagon className="size-5 text-red-500" />Detail Gangguan - {selectedGangguan?.nomorInsiden || selectedGangguan?.id?.slice(0, 8)}</DialogTitle><DialogDescription>Detail insiden dan tindak lanjut</DialogDescription></DialogHeader>
          {selectedGangguan && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Status Workflow</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {WORKFLOW_STEPS.map((step, idx) => {
                    const curIdx = WORKFLOW_STEPS.indexOf(selectedGangguan.status as (typeof WORKFLOW_STEPS)[number]);
                    const isActive = step === (selectedGangguan.status || "OPEN");
                    const isPast = idx < curIdx;
                    const canAdvance = idx === curIdx + 1;
                    const actionMap: Record<number, string> = { 1: "assign", 2: "resolve", 3: "close" };
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <Button size="sm" variant={isActive ? "default" : "outline"} className={cn("text-xs h-8 px-3", isActive && WORKFLOW_COLORS[step].replace("/15", "/30"), isPast && "opacity-60")} disabled={!canAdvance || workflowSubmitting} onClick={() => advanceWorkflow(actionMap[idx] || "")}>{step}</Button>
                        {idx < WORKFLOW_STEPS.length - 1 && <ArrowUpRight className={cn("size-3 text-muted-foreground", isPast && "text-emerald-500")} />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground text-xs">Tanggal</span><div className="font-medium">{fmtDate(selectedGangguan.tanggal)}</div></div>
                <div><span className="text-muted-foreground text-xs">Jenis</span><div className="font-medium">{selectedGangguan.jenis}</div></div>
                <div><span className="text-muted-foreground text-xs">Lokasi</span><div className="font-medium">{selectedGangguan.blok ? `Blok ${selectedGangguan.blok}${selectedGangguan.kamar ? ` - ${selectedGangguan.kamar}` : ""}` : "-"}</div></div>
                <div><span className="text-muted-foreground text-xs">Pelapor</span><div className="font-medium">{selectedGangguan.reporter?.nama || "-"}</div></div>
                {selectedGangguan.tingkat && <div><span className="text-muted-foreground text-xs">Tingkat Kerawanan</span><div className="flex items-center gap-2"><div className={cn("size-3 rounded-full", TINGKAT_KERAWANAN.find((t) => t.value === selectedGangguan.tingkat)?.color)} /><span className="font-medium">{selectedGangguan.tingkat}</span></div></div>}
                {selectedGangguan.wbpTerlibat && <div className="col-span-2"><span className="text-muted-foreground text-xs">WBP Terlibat</span><div className="font-medium">{selectedGangguan.wbpTerlibat}</div></div>}
              </div>
              <div><span className="text-muted-foreground text-xs">Kronologi</span><div className="text-sm mt-1 leading-relaxed bg-muted/50 p-3 rounded-md">{selectedGangguan.kronologi}</div></div>
              {selectedGangguan.tindakanAwal && <div><span className="text-muted-foreground text-xs">Tindakan Awal</span><div className="text-sm mt-1 leading-relaxed bg-muted/50 p-3 rounded-md">{selectedGangguan.tindakanAwal}</div></div>}
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2"><ArrowRightLeft className="size-4" /> Tindak Lanjut</Label>
                <Textarea placeholder="Detail tindak lanjut yang diambil..." value={tindakLanjutText} onChange={(e) => setTindakLanjutText(e.target.value)} rows={4} />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2"><Shield className="size-4" /> Rekomendasi Akhir <Badge className="text-[10px] bg-muted text-muted-foreground">MANAGEMENT</Badge></Label>
                <Textarea placeholder="Rekomendasi akhir untuk kasus ini..." value={rekomendasiText} onChange={(e) => setRekomendasiText(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setGangguanDetailOpen(false)}>Tutup</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rawat Inap Create Dialog */}
      <Dialog open={riDialogOpen} onOpenChange={setRiDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BedDouble className="size-5 text-amber-600" />Tambah Data Rawat Inap</DialogTitle><DialogDescription>Catat WBP yang akan dirawat inap</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>WBP <span className="text-red-500">*</span></Label><Select value={riForm.wbpId} onValueChange={(v) => setRiForm((f) => ({ ...f, wbpId: v }))}><SelectTrigger><SelectValue placeholder="Pilih WBP (Aktif)" /></SelectTrigger><SelectContent>{wbpList.filter((w) => w.status === "Aktif").map((w) => (<SelectItem key={w.id} value={w.id}>{w.nama} ({w.nomorRegister})</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Rumah Sakit Tujuan <span className="text-red-500">*</span></Label><Input placeholder="Contoh: RSUD Bontang Lestari" value={riForm.rumahSakit} onChange={(e) => setRiForm((f) => ({ ...f, rumahSakit: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Tanggal Keluar <span className="text-red-500">*</span></Label><Input type="date" value={riForm.tanggalKeluar} onChange={(e) => setRiForm((f) => ({ ...f, tanggalKeluar: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Petugas Pendamping</Label><Input placeholder="Nama petugas pendamping..." value={riForm.petugasPendamping} onChange={(e) => setRiForm((f) => ({ ...f, petugasPendamping: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Surat Rujukan</Label><Button variant="outline" size="sm" className="w-full" type="button" disabled><Upload className="size-4 mr-2" />Upload</Button></div>
              <div className="space-y-2"><Label>Surat Perintah</Label><Button variant="outline" size="sm" className="w-full" type="button" disabled><Upload className="size-4 mr-2" />Upload</Button></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRiDialogOpen(false)}>Batal</Button><Button onClick={submitRawatInap} disabled={riSubmitting}>{riSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<Save className="size-4 mr-1" /> Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rawat Inap Kembali Dialog */}
      <Dialog open={riKembaliOpen} onOpenChange={setRiKembaliOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Proses Kembali</DialogTitle><DialogDescription>Catat WBP yang kembali dari rawat inap</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Tanggal Kembali <span className="text-red-500">*</span></Label><Input type="date" value={riKembaliForm.tanggalKembali} onChange={(e) => setRiKembaliForm((f) => ({ ...f, tanggalKembali: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Kondisi Kesehatan</Label><Textarea placeholder="Deskripsi kondisi kesehatan WBP..." value={riKembaliForm.kondisiKesehatan} onChange={(e) => setRiKembaliForm((f) => ({ ...f, kondisiKesehatan: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRiKembaliOpen(false)}>Batal</Button><Button onClick={submitRiKembali} disabled={riSubmitting}>{riSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<UserCheck className="size-4 mr-1" /> Proses Kembali</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kerja Luar Create Dialog */}
      <Dialog open={klDialogOpen} onOpenChange={setKlDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Briefcase className="size-5 text-primary" />Izin Kerja Luar Baru</DialogTitle><DialogDescription>Keluarkan WBP untuk kegiatan kerja luar</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>WBP <span className="text-red-500">*</span></Label><Select value={klForm.wbpId} onValueChange={(v) => setKlForm((f) => ({ ...f, wbpId: v }))}><SelectTrigger><SelectValue placeholder="Pilih WBP (Aktif)" /></SelectTrigger><SelectContent>{wbpList.filter((w) => w.status === "Aktif").map((w) => (<SelectItem key={w.id} value={w.id}>{w.nama} ({w.nomorRegister})</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Jenis Kegiatan <span className="text-red-500">*</span></Label><Input placeholder="Contoh: Proyek Pertanian Urban" value={klForm.kegiatan} onChange={(e) => setKlForm((f) => ({ ...f, kegiatan: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Lokasi Kerja</Label><Input placeholder="Contoh: Lahan pertanian kelompok" value={klForm.lokasi} onChange={(e) => setKlForm((f) => ({ ...f, lokasi: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Jam Keberangkatan <span className="text-red-500">*</span></Label><Input type="time" value={klForm.jamKeluar} onChange={(e) => setKlForm((f) => ({ ...f, jamKeluar: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Estimasi Jam Kembali</Label><Input type="time" value={klForm.estimasiKembali} onChange={(e) => setKlForm((f) => ({ ...f, estimasiKembali: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Petugas Pengawal</Label><Input placeholder="Nama petugas pengawal..." value={klForm.petugasPengawal} onChange={(e) => setKlForm((f) => ({ ...f, petugasPengawal: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setKlDialogOpen(false)}>Batal</Button><Button onClick={submitKerjaLuar} disabled={klSubmitting}>{klSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<ArrowUpRight className="size-4 mr-1" /> Keluarkan WBP</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kerja Luar Kembali Dialog */}
      <Dialog open={klKembaliOpen} onOpenChange={setKlKembaliOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Konfirmasi Kembali</DialogTitle><DialogDescription>Catat WBP yang kembali dari kerja luar</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Jam Kembali <span className="text-red-500">*</span></Label><Input type="time" value={klKembaliForm.jamKembali} onChange={(e) => setKlKembaliForm((f) => ({ ...f, jamKembali: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Catatan</Label><Textarea placeholder="Catatan tambahan..." value={klKembaliForm.catatan} onChange={(e) => setKlKembaliForm((f) => ({ ...f, catatan: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setKlKembaliOpen(false)}>Batal</Button><Button onClick={submitKlKembali} disabled={klSubmitting}>{klSubmitting && <Loader2 className="size-4 mr-1 animate-spin" />}<UserCheck className="size-4 mr-1" /> Konfirmasi Kembali</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Sub-Components ─── */

const ST_STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  SUBMITTED: "bg-amber-500/15 text-amber-700 border-amber-600/20",
  DRAFT: "bg-muted text-muted-foreground",
};

function SerahTerimaCard({ st, onConfirm }: { st: STItem; onConfirm: () => void }) {
  return (
    <div className={cn("p-4 rounded-lg border bg-card", st.status === "CONFIRMED" ? "border-emerald-500/30" : st.status === "SUBMITTED" ? "border-amber-500/30" : "border-border")}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-mono">{st.id.slice(0, 10)}</Badge>
            <Badge className={cn("text-[10px]", ST_STATUS_COLORS[st.status] || "")}>{st.status}</Badge>
          </div>
          <h3 className="text-sm font-semibold">{st.reguDari.nama} → {st.reguKe.nama}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(st.tanggal)}</p>
        </div>
        {st.status === "SUBMITTED" && <Button size="sm" className="h-7 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-700" onClick={onConfirm}><UserCheck className="size-3 mr-1" /> Konfirmasi Terima</Button>}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-border">
        <div><div className="text-muted-foreground mb-0.5">Kondisi WBP ({st.totalWBP})</div><div className="font-medium">{st.catatanKeamanan || "-"}</div></div>
        <div><div className="text-muted-foreground mb-0.5">Inventaris</div><div className="font-medium">{st.catatanInventaris || "-"}</div></div>
        <div><div className="text-muted-foreground mb-0.5">Kejadian</div><div className="font-medium">{st.catatanKejadian || "Tidak ada"}</div></div>
        <div><div className="text-muted-foreground mb-0.5">Regu</div><div className="font-medium">{st.regu.nama}</div></div>
      </div>
    </div>
  );
}

const WBP_STATUS_CLASS: Record<string, string> = {
  Aktif: "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  "Rawat Inap": "bg-amber-500/15 text-amber-700 border-amber-600/20",
  "Kerja Luar": "bg-primary/10 text-primary border-primary/20",
  Isolasi: "bg-red-500/15 text-red-600 border-red-600/20",
  Bebas: "bg-muted text-muted-foreground border-border",
};
const RISIKO_CLASS: Record<string, string> = { Rendah: "bg-emerald-500/15 text-emerald-700", Sedang: "bg-amber-500/15 text-amber-700", Tinggi: "bg-red-500/15 text-red-600" };

function WbpRow({ w }: { w: WBPItem }) {
  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">{w.nama.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
          <div className="min-w-0"><div className="text-sm font-medium truncate">{w.nama}</div><div className="text-xs text-muted-foreground font-mono">{w.nomorRegister}</div></div>
        </div>
      </TableCell>
      <TableCell className="text-xs"><span className="font-medium">{w.currentRoom?.blockName || "-"}</span>{w.currentRoom ? ` - ${w.currentRoom.roomNumber}` : ""}</TableCell>
      <TableCell><Badge className={`text-[10px] ${WBP_STATUS_CLASS[w.status] ?? ""}`}>{w.status}</Badge></TableCell>
      <TableCell><span className={`text-[10px] px-1.5 py-0.5 rounded ${RISIKO_CLASS[w.risiko] ?? ""}`}>{w.risiko}</span></TableCell>
      <TableCell className="text-xs text-muted-foreground">{w.pasal || "-"}</TableCell>
      <TableCell className="text-right"><Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Detail</Button></TableCell>
    </TableRow>
  );
}
