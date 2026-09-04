"use client";

import {
  Package,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Truck,
  Ban,
  Loader2,
  User,
  MapPin,
  Copy,
  ChevronRight,
  CircleDot,
  PackageCheck,
  PackageX,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Inbox,
  QrCode,
  Camera,
  Keyboard,
  Download,
  Printer,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatCard, SectionCard, KameraScan } from "./shared";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

// ─── Types ─────────────────────────────────────────
interface WBPSearchItem {
  id: string;
  nomorRegister: string;
  nama: string;
  status: string;
  currentRoom?: { blockName: string; roomNumber: string } | null;
}

interface TitipanListItem {
  id: string;
  kode_titipan: string;
  nama_pengirim: string;
  no_hp?: string | null;
  hubungan: string;
  nama_wbp?: string | null;
  nomor_register_wbp?: string | null;
  kategori: string;
  tanggal_penitipan: string;
  status: string;
  wbp?: {
    id: string;
    nomor_register: string;
    nama: string;
    status: string;
    blok: string | null;
    kamar: string | null;
  } | null;
  verified_by: { id: string; nama: string; nip: string } | null;
  jumlah_item: number;
  verified_at?: string | null;
  delivered_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
}

interface TitipanDetailItem {
  id: string;
  kode_titipan: string;
  nama_pengirim: string;
  nik_pengirim?: string | null;
  no_hp?: string | null;
  hubungan: string;
  nama_wbp?: string | null;
  nomor_register_wbp?: string | null;
  kategori: string;
  tanggal_penitipan: string;
  jam_penitipan?: string | null;
  catatan_pengirim?: string | null;
  status: string;
  catatan_petugas?: string | null;
  alasan_penolakan?: string | null;
  verified_at?: string | null;
  delivered_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
  wbp?: {
    id: string;
    nomor_register: string;
    nama: string;
    status: string;
    blok: string | null;
    kamar: string | null;
  } | null;
  verified_by: { id: string; nama: string; nip: string } | null;
  items: TitipanItemDetail[];
}

interface TitipanItemDetail {
  id: string;
  nama_barang: string;
  jumlah: number;
  satuan: string;
  keterangan?: string | null;
  status: string;
  alasan_penolakan?: string | null;
  created_at: string;
}

interface TrackData {
  kode_titipan: string;
  nama_pengirim: string;
  hubungan: string;
  nama_wbp: string;
  nomor_register_wbp: string;
  kategori: string;
  tanggal_penitipan: string;
  status: string;
  items: TrackItem[];
  catatan_petugas?: string | null;
  alasan_penolakan?: string | null;
  verified_at?: string | null;
  delivered_at?: string | null;
}

interface TrackItem {
  id: string;
  nama_barang: string;
  jumlah: number;
  satuan: string;
  keterangan?: string | null;
  status: string;
  alasan_penolakan?: string | null;
}

interface FormItem {
  nama_barang: string;
  jumlah: number;
  satuan: string;
  keterangan: string;
}

// ─── Constants ─────────────────────────────────────────
const HUBUNGAN_OPTIONS = [
  "Istri",
  "Suami",
  "Anak",
  "Orang Tua",
  "Saudara",
  "Kerabat",
  "Lainnya",
];

const SATUAN_OPTIONS = ["pcs", "kg", "liter", "bungkus", "kotak", "pack"];

const KATEGORI_OPTIONS = [
  "Pakaian",
  "Makanan",
  "Obat-obatan",
  "Uang",
  "Surat/Dokumen",
  "Kebutuhan Sehari-hari",
  "Lainnya",
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  Menunggu: { label: "Menunggu", color: "text-amber-700", bg: "bg-amber-500/15 border-amber-600/20" },
  Diverifikasi: { label: "Diverifikasi", color: "text-blue-700", bg: "bg-blue-500/15 border-blue-600/20" },
  Diterima: { label: "Diterima", color: "text-emerald-700", bg: "bg-emerald-500/15 border-emerald-600/20" },
  Ditolak: { label: "Ditolak", color: "text-red-700", bg: "bg-red-500/15 border-red-600/20" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Menunggu;
  return (
    <Badge className={cn("text-[10px] font-medium border", cfg.bg, cfg.color)}>
      {cfg.label}
    </Badge>
  );
}

function formatDate(d: string) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function formatDateTime(d: string) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

const emptyFormItem = (): FormItem => ({
  nama_barang: "",
  jumlah: 1,
  satuan: "pcs",
  keterangan: "",
});

// ─── Custom Scrollbar CSS ─────────────────────────────────────────
const scrollbarCSS = `
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
`;

// ─── Main Component ─────────────────────────────────────────
export function BarangTitipanView() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const token = useAppStore((s) => s.currentUser)?.token;

  const [activeTab, setActiveTab] = useState(isAuthenticated ? "daftar" : "form");

  // ─── Daftar Titipan State ─────────────────────────────────────────
  const [list, setList] = useState<TitipanListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const limit = 10;

  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<TitipanDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Verify dialog
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyData, setVerifyData] = useState<TitipanDetailItem | null>(null);
  const [verifyItems, setVerifyItems] = useState<
    { item_id: string; status: string; alasan_penolakan: string }[]
  >([]);
  const [verifyCatatan, setVerifyCatatan] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Deliver dialog
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverId, setDeliverId] = useState("");
  const [deliverKode, setDeliverKode] = useState("");
  const [deliverCatatan, setDeliverCatatan] = useState("");
  const [deliverLoading, setDeliverLoading] = useState(false);

  // Reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [rejectKode, setRejectKode] = useState("");
  const [rejectAlasan, setRejectAlasan] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // ─── Form Titip Barang State ─────────────────────────────────────────
  const [formNama, setFormNama] = useState("");
  const [formNik, setFormNik] = useState("");
  const [formNoHp, setFormNoHp] = useState("");
  const [formHubungan, setFormHubungan] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  // Sama seperti kunjungan online: tidak perlu memilih WBP dari daftar
  const [formNamaWbp, setFormNamaWbp] = useState("");
  const [formNomorRegisterWbp, setFormNomorRegisterWbp] = useState("");
  const [formTanggal, setFormTanggal] = useState(getTodayStr());
  const [formJam, setFormJam] = useState(getNowTimeStr());
  const [formKategori, setFormKategori] = useState("");
  const [formItems, setFormItems] = useState<FormItem[]>([emptyFormItem()]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccessOpen, setFormSuccessOpen] = useState(false);
  const [formSuccessKode, setFormSuccessKode] = useState("");
  const [formSuccessData, setFormSuccessData] = useState<{
    namaPengirim: string;
    hubungan: string;
    namaWbp: string;
    nomorRegisterWbp: string;
    kategori: string;
    tanggalPenitipan: string;
    jumlahItem: number;
  } | null>(null);

  // ─── Scan Kode Titipan State (petugas) ──────────────────────────────
  const [scanOpen, setScanOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanCameraMode, setScanCameraMode] = useState(false);

  // ─── Lacak Titipan State ─────────────────────────────────────────
  const [trackKode, setTrackKode] = useState("");
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackSearched, setTrackSearched] = useState(false);

  // ─── Stats from list ─────────────────────────────────────────
  const [stats, setStats] = useState({ menunggu: 0, diverifikasi: 0, diterima: 0, ditolak: 0 });

  // ─── Fetch List ─────────────────────────────────────────
  const fetchList = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      setListLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (filterSearch) params.set("search", filterSearch);
      if (filterStatus) params.set("status", filterStatus);
      if (filterKategori) params.set("kategori", filterKategori);
      if (filterDateFrom) params.set("date_from", filterDateFrom);
      if (filterDateTo) params.set("date_to", filterDateTo);

      const res = await fetch(`/api/barang-titipan?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setList(json.data || []);
      if (json.meta) {
        setTotalPages(json.meta.total_pages || 1);
        setTotalData(json.meta.total_data || 0);
      }

      // Also fetch all statuses for stats (page=1, limit=9999)
      const statsRes = await fetch(`/api/barang-titipan?page=1&limit=9999`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        const all = statsJson.data || [];
        setStats({
          menunggu: all.filter((r: TitipanListItem) => r.status === "Menunggu").length,
          diverifikasi: all.filter((r: TitipanListItem) => r.status === "Diverifikasi").length,
          diterima: all.filter((r: TitipanListItem) => r.status === "Diterima").length,
          ditolak: all.filter((r: TitipanListItem) => r.status === "Ditolak").length,
        });
      }
    } catch {
      toast.error("Gagal memuat data barang titipan");
    } finally {
      setListLoading(false);
    }
  }, [isAuthenticated, token, page, filterSearch, filterStatus, filterKategori, filterDateFrom, filterDateTo]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "daftar") {
      fetchList();
    }
  }, [fetchList, isAuthenticated, activeTab]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [filterSearch, filterStatus, filterKategori, filterDateFrom, filterDateTo]);

  // ─── Fetch Detail ─────────────────────────────────────────
  const fetchDetail = async (id: string) => {
    if (!token) return;
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const res = await fetch(`/api/barang-titipan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDetailData(json.data);
    } catch {
      toast.error("Gagal memuat detail barang titipan");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Verify Action ─────────────────────────────────────────
  // Muat detail secara langsung lalu buka dialog verifikasi (tanpa efek berantai)
  const openVerify = async (item: TitipanListItem) => {
    if (!token) return;
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/barang-titipan/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: TitipanDetailItem = json.data;
      if (data.status !== "Menunggu") {
        toast.error(`Titipan dengan status "${data.status}" tidak dapat diverifikasi`);
        return;
      }
      setVerifyData(data);
      setVerifyItems(
        data.items.map((i) => ({
          item_id: i.id,
          status: "Diterima",
          alasan_penolakan: "",
        }))
      );
      setVerifyCatatan("");
      setVerifyOpen(true);
    } catch {
      toast.error("Gagal memuat detail barang titipan");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || !verifyData) return;
    try {
      setVerifyLoading(true);
      const itemsPayload = verifyItems.map((vi) => {
        const payload: { item_id: string; status: string; alasan_penolakan?: string } = {
          item_id: vi.item_id,
          status: vi.status,
        };
        if (vi.status === "Ditolak") {
          payload.alasan_penolakan = vi.alasan_penolakan;
        }
        return payload;
      });

      const res = await fetch(`/api/barang-titipan/${verifyData.id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ catatan_petugas: verifyCatatan, items: itemsPayload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Gagal memverifikasi");
      }
      toast.success("Barang titipan berhasil diverifikasi");
      setVerifyOpen(false);
      setVerifyData(null);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memverifikasi barang titipan");
    } finally {
      setVerifyLoading(false);
    }
  };

  // ─── Deliver Action ─────────────────────────────────────────
  const openDeliver = (item: TitipanListItem) => {
    setDeliverId(item.id);
    setDeliverKode(item.kode_titipan);
    setDeliverCatatan("");
    setDeliverOpen(true);
  };

  const handleDeliver = async () => {
    if (!token) return;
    try {
      setDeliverLoading(true);
      const res = await fetch(`/api/barang-titipan/${deliverId}/deliver`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ catatan_petugas: deliverCatatan }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Gagal mengonfirmasi penyerahan");
      }
      toast.success("Barang berhasil diserahkan ke WBP");
      setDeliverOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengonfirmasi penyerahan");
    } finally {
      setDeliverLoading(false);
    }
  };

  // ─── Reject Action ─────────────────────────────────────────
  const openReject = (item: TitipanListItem) => {
    setRejectId(item.id);
    setRejectKode(item.kode_titipan);
    setRejectAlasan("");
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!token || !rejectAlasan.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    try {
      setRejectLoading(true);
      const res = await fetch(`/api/barang-titipan/${rejectId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alasan_penolakan: rejectAlasan }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Gagal menolak");
      }
      toast.success("Barang titipan ditolak");
      setRejectOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak barang titipan");
    } finally {
      setRejectLoading(false);
    }
  };

  // ─── Cetak Lembar Data Barang & Biodata Pemilik (setelah verifikasi) ─────
  const cetakDataBarang = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/barang-titipan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: TitipanDetailItem = json.data;
      printHtmlDocument(buildTitipanPrintHtml(data, buildTitipanPrintParts(data)));
    } catch {
      toast.error("Gagal memuat data untuk dicetak");
    }
  };

  // ─── Scan Kode Titipan (petugas) ─────────────────────────────────────
  const handleScanLookup = useCallback(async (kode: string) => {
    const value = kode.trim();
    if (!value) return;
    setScanLoading(true);
    try {
      const res = await fetch(`/api/barang-titipan/scan?kode=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || "Kode titipan tidak ditemukan");
      }
      const json = await res.json();
      toast.success(`Titipan ${json.data.kode_titipan} ditemukan — verifikasi data sebelum menerima barang.`);
      setScanOpen(false);
      setScanCameraMode(false);
      setScanCode("");
      setDetailData(json.data);
      setDetailOpen(true);
      if (isAuthenticated) fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memindai kode titipan");
    } finally {
      setScanLoading(false);
    }
  }, [token, isAuthenticated, fetchList]);

  async function handleScanSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    await handleScanLookup(scanCode);
  }

  // ─── Form Items Management ─────────────────────────────────────────
  const addFormItem = () => setFormItems([...formItems, emptyFormItem()]);
  const removeFormItem = (idx: number) =>
    setFormItems(formItems.filter((_, i) => i !== idx));
  const updateFormItem = (idx: number, field: keyof FormItem, value: string | number) => {
    const next = [...formItems];
    (next[idx] as unknown as Record<string, string | number>)[field] = value;
    setFormItems(next);
  };

  // ─── Form Submit ─────────────────────────────────────────
  const handleFormSubmit = async () => {
    if (!formNama.trim() || !formHubungan || !formNamaWbp.trim() || !formTanggal || !formKategori) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }
    const validItems = formItems.filter((i) => i.nama_barang.trim());
    if (validItems.length === 0) {
      toast.error("Minimal 1 item barang harus diisi");
      return;
    }
    try {
      setFormSubmitting(true);
      const res = await fetch("/api/barang-titipan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_pengirim: formNama.trim(),
          nik_pengirim: formNik.trim() || null,
          no_hp: formNoHp.trim() || null,
          hubungan: formHubungan,
          nama_wbp: formNamaWbp.trim(),
          nomor_register_wbp: formNomorRegisterWbp.trim() || null,
          kategori: formKategori,
          tanggal_penitipan: formTanggal,
          jam_penitipan: formJam || null,
          catatan_pengirim: formCatatan.trim() || null,
          items: validItems.map((i) => ({
            nama_barang: i.nama_barang.trim(),
            jumlah: i.jumlah || 1,
            satuan: i.satuan,
            keterangan: i.keterangan.trim() || null,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Gagal mendaftarkan");
      }
      const json = await res.json();
      setFormSuccessKode(json.data?.kode_titipan || "");
      setFormSuccessData({
        namaPengirim: formNama.trim(),
        hubungan: formHubungan,
        namaWbp: formNamaWbp.trim(),
        nomorRegisterWbp: formNomorRegisterWbp.trim(),
        kategori: formKategori,
        tanggalPenitipan: formTanggal,
        jumlahItem: validItems.length,
      });
      setFormSuccessOpen(true);
      toast.success("Penitipan barang berhasil didaftarkan");
      // Reset form
      setFormNama("");
      setFormNik("");
      setFormNoHp("");
      setFormHubungan("");
      setFormCatatan("");
      setFormNamaWbp("");
      setFormNomorRegisterWbp("");
      setFormTanggal(getTodayStr());
      setFormJam(getNowTimeStr());
      setFormKategori("");
      setFormItems([emptyFormItem()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mendaftarkan penitipan barang");
    } finally {
      setFormSubmitting(false);
    }
  };

  // ─── Track Search ─────────────────────────────────────────
  const handleTrack = async () => {
    if (!trackKode.trim()) {
      toast.error("Masukkan kode titipan");
      return;
    }
    try {
      setTrackLoading(true);
      setTrackSearched(true);
      const res = await fetch(`/api/public/barang-titipan/track/${encodeURIComponent(trackKode.trim())}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Tidak ditemukan");
      }
      const json = await res.json();
      setTrackData(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal melacak titipan");
      setTrackData(null);
    } finally {
      setTrackLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      <style>{scrollbarCSS}</style>
      <PageHeader
        title="Barang Titipan"
        description="Layanan penitipan barang untuk WBP tanpa perlu berkunjung langsung."
        badge="Layanan Publik"
        icon={Package}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {isAuthenticated && (
            <TabsTrigger value="daftar">Daftar Titipan</TabsTrigger>
          )}
          <TabsTrigger value="form">Form Titip Barang</TabsTrigger>
          <TabsTrigger value="lacak">Lacak Titipan</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Daftar Titipan (Auth Only) ────────────────────────────────────── */}
        {isAuthenticated && (
          <TabsContent value="daftar" className="space-y-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Menunggu"
                value={stats.menunggu}
                icon={Clock}
                sub="Perlu verifikasi"
                accent="warning"
              />
              <StatCard
                label="Diverifikasi"
                value={stats.diverifikasi}
                icon={ShieldCheck}
                sub="Siap diserahkan"
                accent="primary"
              />
              <StatCard
                label="Diterima"
                value={stats.diterima}
                icon={PackageCheck}
                sub="Diserahkan ke WBP"
                accent="accent"
              />
              <StatCard
                label="Ditolak"
                value={stats.ditolak}
                icon={PackageX}
                sub="Ditolak petugas"
                accent="danger"
              />
            </div>

            {/* Filter Bar */}
            <SectionCard
              title="Filter"
              className=""
              action={
                <Dialog open={scanOpen} onOpenChange={(v) => { setScanOpen(v); if (!v) setScanCameraMode(false); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <QrCode className="size-3.5 mr-1" />
                      Scan Kode Titipan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-sm">
                        <QrCode className="size-5 text-primary" /> Scan / Verifikasi Titipan
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Pindai barcode pengunjung dengan kamera, atau ketik Kode Titipan. Verifikasi item wajib dilakukan sebelum barang diterima.
                      </DialogDescription>
                    </DialogHeader>
                    {scanCameraMode ? (
                      <KameraScan onDetected={handleScanLookup} />
                    ) : (
                      <form onSubmit={handleScanSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="bt-scan-kode" className="text-xs">Kode Titipan</Label>
                          <Input
                            id="bt-scan-kode"
                            autoFocus
                            value={scanCode}
                            onChange={(e) => setScanCode(e.target.value)}
                            placeholder="Contoh: TRP-2608-001"
                            autoComplete="off"
                            className="text-xs"
                          />
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setScanOpen(false)}>Batal</Button>
                          <Button type="submit" size="sm" className="text-xs" disabled={scanLoading || !scanCode.trim()}>
                            {scanLoading && <Loader2 className="size-3.5 mr-1 animate-spin" />}
                            Cari Titipan
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                    <div className="flex justify-center border-t pt-3">
                      {scanCameraMode ? (
                        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setScanCameraMode(false)}>
                          <Keyboard className="size-3.5 mr-1" /> Ketik Manual
                        </Button>
                      ) : (
                        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setScanCameraMode(true)} disabled={scanLoading}>
                          <Camera className="size-3.5 mr-1" /> Scan via Kamera
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.75} />
                  <Input
                    placeholder="Nama / Kode titipan"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="pl-8 text-xs"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Menunggu">Menunggu</SelectItem>
                    <SelectItem value="Diverifikasi">Diverifikasi</SelectItem>
                    <SelectItem value="Diterima">Diterima</SelectItem>
                    <SelectItem value="Ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterKategori} onValueChange={(v) => setFilterKategori(v === "all" ? "" : v)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {KATEGORI_OPTIONS.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="text-xs"
                  placeholder="Dari tanggal"
                />
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="text-xs"
                  placeholder="Sampai tanggal"
                />
              </div>
            </SectionCard>

            {/* Table */}
            <SectionCard
              title="Daftar Barang Titipan"
              description={`${totalData} data total`}
            >
              {listLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  <Inbox className="size-10 mx-auto mb-3 opacity-40" strokeWidth={1.75} />
                  <p>Belum ada data barang titipan</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar rounded-lg border">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="text-xs font-medium">Kode</TableHead>
                          <TableHead className="text-xs font-medium">Tanggal</TableHead>
                          <TableHead className="text-xs font-medium">Pengirim</TableHead>
                          <TableHead className="text-xs font-medium">WBP</TableHead>
                          <TableHead className="text-xs font-medium">Kategori</TableHead>
                          <TableHead className="text-xs font-medium text-center">Item</TableHead>
                          <TableHead className="text-xs font-medium">Status</TableHead>
                          <TableHead className="text-xs font-medium text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {list.map((item) => (
                          <TableRow key={item.id} className="group">
                            <TableCell className="text-xs font-mono font-medium">
                              {item.kode_titipan}
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatDate(item.tanggal_penitipan)}
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="font-medium">{item.nama_pengirim}</div>
                              <div className="text-muted-foreground">{item.hubungan}</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="font-medium">{item.nama_wbp || item.wbp?.nama || "-"}</div>
                              <div className="text-muted-foreground">
                                {item.nomor_register_wbp || item.wbp?.nomor_register
                                  ? `Reg: ${item.nomor_register_wbp || item.wbp?.nomor_register}`
                                  : item.wbp?.blok && item.wbp?.kamar
                                    ? `${item.wbp.blok} / ${item.wbp.kamar}`
                                    : "-"}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{item.kategori}</TableCell>
                            <TableCell className="text-xs text-center">{item.jumlah_item}</TableCell>
                            <TableCell className="text-xs">
                              <StatusBadge status={item.status} />
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => fetchDetail(item.id)}
                                >
                                  <Eye className="size-3.5 mr-1" strokeWidth={1.75} />
                                  Detail
                                </Button>
                                {item.status === "Menunggu" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs text-blue-700 border-blue-600/30 hover:bg-blue-500/10"
                                      onClick={() => openVerify(item)}
                                    >
                                      <ShieldCheck className="size-3.5 mr-1" strokeWidth={1.75} />
                                      Verifikasi
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs text-red-600 border-red-600/30 hover:bg-red-500/10"
                                      onClick={() => openReject(item)}
                                    >
                                      <Ban className="size-3.5 mr-1" strokeWidth={1.75} />
                                      Tolak
                                    </Button>
                                  </>
                                )}
                                {item.status === "Diverifikasi" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs text-emerald-700 border-emerald-600/30 hover:bg-emerald-500/10"
                                      onClick={() => openDeliver(item)}
                                    >
                                      <Truck className="size-3.5 mr-1" strokeWidth={1.75} />
                                      Serahkan
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs text-red-600 border-red-600/30 hover:bg-red-500/10"
                                      onClick={() => openReject(item)}
                                    >
                                      <Ban className="size-3.5 mr-1" strokeWidth={1.75} />
                                      Tolak
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs"
                                      title="Cetak lembar data barang & biodata pengirim"
                                      onClick={() => cetakDataBarang(item.id)}
                                    >
                                      <Printer className="size-3.5 mr-1" strokeWidth={1.75} />
                                      Cetak
                                    </Button>
                                  </>
                                )}
                                {item.status === "Diterima" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    title="Cetak lembar data barang & biodata pengirim"
                                    onClick={() => cetakDataBarang(item.id)}
                                  >
                                    <Printer className="size-3.5 mr-1" strokeWidth={1.75} />
                                    Cetak
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">
                      Halaman {page} dari {totalPages} ({totalData} data)
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </SectionCard>
          </TabsContent>
        )}

        {/* ─── Tab 2: Form Titip Barang ────────────────────────────────────── */}
        <TabsContent value="form" className="space-y-4">
          <SectionCard title="Formulir Penitipan Barang" description="Isi data pengirim, pilih WBP, dan daftarkan item barang.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Pengirim */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Data Pengirim</h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Masukkan nama lengkap pengirim"
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">NIK</Label>
                      <Input
                        placeholder="16 digit NIK"
                        value={formNik}
                        onChange={(e) => setFormNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        className="text-xs"
                        maxLength={16}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">No. HP</Label>
                      <Input
                        placeholder="08xxxxxxxxxx"
                        value={formNoHp}
                        onChange={(e) => setFormNoHp(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Hubungan dengan WBP <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formHubungan} onValueChange={setFormHubungan}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Pilih hubungan" />
                      </SelectTrigger>
                      <SelectContent>
                        {HUBUNGAN_OPTIONS.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Catatan</Label>
                    <Textarea
                      placeholder="Catatan tambahan (opsional)"
                      value={formCatatan}
                      onChange={(e) => setFormCatatan(e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              {/* Data WBP + Pengiriman */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Data WBP</h4>
                <div className="space-y-3">
                  <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs text-muted-foreground">
                      Anda <span className="font-medium text-foreground">tidak perlu memilih nama WBP dari daftar</span>. Cukup tuliskan nama WBP tujuan — data akan diverifikasi oleh petugas saat barang diantar.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Nama WBP Tujuan <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="Contoh: Ahmad Suryadi"
                          value={formNamaWbp}
                          onChange={(e) => setFormNamaWbp(e.target.value)}
                          className="text-xs"
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          Nomor Register WBP <span className="text-muted-foreground">(jika tahu)</span>
                        </Label>
                        <Input
                          placeholder="Contoh: WBP-2024-001"
                          value={formNomorRegisterWbp}
                          onChange={(e) => setFormNomorRegisterWbp(e.target.value)}
                          className="text-xs"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-sm font-semibold text-foreground">Pengiriman</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Tanggal <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formTanggal}
                        onChange={(e) => setFormTanggal(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Jam</Label>
                      <Input
                        type="time"
                        value={formJam}
                        onChange={(e) => setFormJam(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Kategori <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formKategori} onValueChange={setFormKategori}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Pilih kategori barang" />
                      </SelectTrigger>
                      <SelectContent>
                        {KATEGORI_OPTIONS.map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Barang */}
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Daftar Barang</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={addFormItem}
                >
                  <Plus className="size-3.5 mr-1" strokeWidth={1.75} />
                  Tambah Item
                </Button>
              </div>
              <div className="space-y-2">
                {formItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-card"
                  >
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        Nama Barang <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Nama barang"
                        value={item.nama_barang}
                        onChange={(e) => updateFormItem(idx, "nama_barang", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Jumlah</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.jumlah}
                        onChange={(e) => updateFormItem(idx, "jumlah", parseInt(e.target.value) || 1)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Satuan</Label>
                      <Select
                        value={item.satuan}
                        onValueChange={(v) => updateFormItem(idx, "satuan", v)}
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SATUAN_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-8 sm:col-span-3 space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Keterangan</Label>
                      <Input
                        placeholder="Opsional"
                        value={item.keterangan}
                        onChange={(e) => updateFormItem(idx, "keterangan", e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-1 flex items-end justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                        onClick={() => removeFormItem(idx)}
                        disabled={formItems.length <= 1}
                      >
                        <Trash2 className="size-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                className="text-xs"
                disabled={formSubmitting}
                onClick={handleFormSubmit}
              >
                {formSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                <Package className="size-4 mr-2" strokeWidth={1.75} />
                Daftarkan Titipan
              </Button>
            </div>
          </SectionCard>

          {/* Success Dialog */}
          <Dialog open={formSuccessOpen} onOpenChange={setFormSuccessOpen}>
            <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <div className="mx-auto size-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="size-7" strokeWidth={1.75} />
                </div>
                <DialogTitle className="text-center">Titipan Berhasil Didaftarkan</DialogTitle>
                <DialogDescription className="text-center">
                  Barang titipan Anda telah berhasil didaftarkan. Simpan kode berikut untuk melacak status titipan.
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-4">
                <div className="text-xs text-muted-foreground mb-1">Kode Titipan</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-wide text-primary">
                    {formSuccessKode}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(formSuccessKode);
                      toast.success("Kode berhasil disalin");
                    }}
                  >
                    <Copy className="size-4" strokeWidth={1.75} />
                  </Button>
                </div>
              </div>
              {formSuccessData && (
                <TandaTerimaUnduhCard
                  kodeTitipan={formSuccessKode}
                  namaPengirim={formSuccessData.namaPengirim}
                  hubungan={formSuccessData.hubungan}
                  namaWbp={formSuccessData.namaWbp}
                  nomorRegisterWbp={formSuccessData.nomorRegisterWbp}
                  kategori={formSuccessData.kategori}
                  tanggalPenitipan={formSuccessData.tanggalPenitipan}
                  jumlahItem={formSuccessData.jumlahItem}
                  status="Menunggu"
                />
              )}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>
                  Simpan kode <strong>{formSuccessKode}</strong> dengan baik. Anda dapat melacak status titipan melalui tab <strong>&quot;Lacak Titipan&quot;</strong>.
                </span>
              </div>
              <DialogFooter className="sm:justify-center gap-2">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setFormSuccessOpen(false);
                    setActiveTab("lacak");
                    setTrackKode(formSuccessKode);
                  }}
                >
                  Lacak Titipan
                  <ArrowRight className="size-3.5 ml-1" strokeWidth={1.75} />
                </Button>
                <Button className="text-xs" onClick={() => setFormSuccessOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── Tab 3: Lacak Titipan ────────────────────────────────────── */}
        <TabsContent value="lacak" className="space-y-4">
          <SectionCard title="Lacak Status Titipan" description="Masukkan kode titipan untuk melacak status pengiriman barang Anda.">
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.75} />
                <Input
                  placeholder="Contoh: TRP-2606-001"
                  value={trackKode}
                  onChange={(e) => setTrackKode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="pl-8 text-xs"
                />
              </div>
              <Button
                className="text-xs"
                onClick={handleTrack}
                disabled={trackLoading}
              >
                {trackLoading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Search className="size-4 mr-2" strokeWidth={1.75} />
                )}
                Lacak
              </Button>
            </div>
          </SectionCard>

          {/* Track Result */}
          {trackLoading && (
            <div className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          )}

          {!trackLoading && trackSearched && !trackData && (
            <Card className="border-red-500/30">
              <CardContent className="p-6 text-center">
                <PackageX className="size-12 mx-auto text-red-400 mb-3" strokeWidth={1.75} />
                <h3 className="font-semibold text-sm">Titipan Tidak Ditemukan</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Periksa kembali kode titipan yang Anda masukkan.
                </p>
              </CardContent>
            </Card>
          )}

          {!trackLoading && trackData && (
            <div className="space-y-4">
              {/* Status Header Card */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Kode Titipan</div>
                      <div className="text-lg font-mono font-bold">{trackData.kode_titipan}</div>
                    </div>
                    <StatusBadge status={trackData.status} />
                  </div>

                  {/* Progress Steps */}
                  <TrackProgressSteps status={trackData.status} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pengirim Info */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Informasi Pengirim
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                        <span className="font-medium">{trackData.nama_pengirim}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="size-3" strokeWidth={1.75} />
                        <span>{trackData.hubungan}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* WBP Info */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Informasi WBP
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                        <span className="font-medium">{trackData.nama_wbp}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="size-3" strokeWidth={1.75} />
                        <span>Reg: {trackData.nomor_register_wbp}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="size-3" strokeWidth={1.75} />
                        <span>{trackData.kategori} · {formatDate(trackData.tanggal_penitipan)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Items Table */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Daftar Barang
                  </h4>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium">Nama Barang</TableHead>
                          <TableHead className="text-xs font-medium text-center">Jumlah</TableHead>
                          <TableHead className="text-xs font-medium">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trackData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">
                              <div className="font-medium">{item.nama_barang}</div>
                              {item.keterangan && (
                                <div className="text-muted-foreground text-[10px]">{item.keterangan}</div>
                              )}
                              {item.status === "Ditolak" && item.alasan_penolakan && (
                                <div className="text-red-600 text-[10px] mt-0.5">
                                  Alasan: {item.alasan_penolakan}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-center">
                              {item.jumlah} {item.satuan}
                            </TableCell>
                            <TableCell className="text-xs">
                              <StatusBadge status={item.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Catatan Petugas */}
              {trackData.catatan_petugas && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Catatan Petugas
                    </h4>
                    <p className="text-xs">{trackData.catatan_petugas}</p>
                  </CardContent>
                </Card>
              )}

              {/* Alasan Penolakan */}
              {trackData.alasan_penolakan && (
                <Card className="border-red-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                      Alasan Penolakan
                    </h4>
                    <p className="text-xs text-red-700">{trackData.alasan_penolakan}</p>
                  </CardContent>
                </Card>
              )}

              {/* Unduh Tanda Terima */}
              <div>
                <p className="text-xs font-semibold text-center mb-2 text-muted-foreground">Unduh Tanda Terima (ber-barcode)</p>
                <TandaTerimaUnduhCard
                  kodeTitipan={trackData.kode_titipan}
                  namaPengirim={trackData.nama_pengirim}
                  hubungan={trackData.hubungan}
                  namaWbp={trackData.nama_wbp || "-"}
                  nomorRegisterWbp={trackData.nomor_register_wbp || ""}
                  kategori={trackData.kategori}
                  tanggalPenitipan={trackData.tanggal_penitipan}
                  jumlahItem={trackData.items.length}
                  status={trackData.status}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Detail Dialog ────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={(v) => { setDetailOpen(v); if (!v) setDetailData(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-sm">Detail Barang Titipan</DialogTitle>
            <DialogDescription className="text-xs">
              {detailData ? detailData.kode_titipan : ""}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : detailData ? (
            <ScrollArea className="max-h-[60vh] pr-3">
              <div className="space-y-4">
                {/* Status + Kode */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-mono font-bold">{detailData.kode_titipan}</div>
                  <StatusBadge status={detailData.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pengirim */}
                  <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pengirim</div>
                    <div className="text-xs font-medium">{detailData.nama_pengirim}</div>
                    {detailData.nik_pengirim && (
                      <div className="text-xs text-muted-foreground">NIK: {detailData.nik_pengirim}</div>
                    )}
                    {detailData.no_hp && (
                      <div className="text-xs text-muted-foreground">HP: {detailData.no_hp}</div>
                    )}
                    <div className="text-xs text-muted-foreground">Hubungan: {detailData.hubungan}</div>
                  </div>

                  {/* WBP */}
                  <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">WBP</div>
                    <div className="text-xs font-medium">{detailData.nama_wbp || detailData.wbp?.nama || "-"}</div>
                    {(detailData.nomor_register_wbp || detailData.wbp?.nomor_register) && (
                      <div className="text-xs text-muted-foreground">Reg: {detailData.nomor_register_wbp || detailData.wbp?.nomor_register}</div>
                    )}
                    {detailData.wbp?.blok && (
                      <div className="text-xs text-muted-foreground">
                        Blok: {detailData.wbp.blok} / {detailData.wbp.kamar}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Pengiriman */}
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Info Pengiriman</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">Kategori: </span>
                      <span className="font-medium">{detailData.kategori}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tanggal: </span>
                      <span className="font-medium">{formatDate(detailData.tanggal_penitipan)}</span>
                    </div>
                    {detailData.jam_penitipan && (
                      <div>
                        <span className="text-muted-foreground">Jam: </span>
                        <span className="font-medium">{detailData.jam_penitipan}</span>
                      </div>
                    )}
                  </div>
                  {detailData.catatan_pengirim && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Catatan Pengirim: </span>{detailData.catatan_pengirim}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Daftar Barang ({detailData.items.length} item)</div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs font-medium">Barang</TableHead>
                          <TableHead className="text-xs font-medium text-center">Jumlah</TableHead>
                          <TableHead className="text-xs font-medium">Status</TableHead>
                          <TableHead className="text-xs font-medium">Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs font-medium">{item.nama_barang}</TableCell>
                            <TableCell className="text-xs text-center">{item.jumlah} {item.satuan}</TableCell>
                            <TableCell className="text-xs">
                              <StatusBadge status={item.status} />
                              {item.status === "Ditolak" && item.alasan_penolakan && (
                                <div className="text-[10px] text-red-600 mt-0.5">{item.alasan_penolakan}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {item.keterangan || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Catatan Petugas */}
                {detailData.catatan_petugas && (
                  <div className="p-3 rounded-lg border bg-blue-500/5">
                    <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-1">Catatan Petugas</div>
                    <p className="text-xs text-blue-800">{detailData.catatan_petugas}</p>
                  </div>
                )}

                {/* Alasan Penolakan */}
                {detailData.alasan_penolakan && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                    <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1">Alasan Penolakan</div>
                    <p className="text-xs text-red-700">{detailData.alasan_penolakan}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                  <div>Dibuat: {formatDateTime(detailData.created_at)}</div>
                  {detailData.verified_at && <div>Diverifikasi: {formatDateTime(detailData.verified_at)}</div>}
                  {detailData.delivered_at && <div>Diterima: {formatDateTime(detailData.delivered_at)}</div>}
                  {detailData.rejected_at && <div>Ditolak: {formatDateTime(detailData.rejected_at)}</div>}
                </div>

                {detailData.verified_by && (
                  <div className="text-[10px] text-muted-foreground">
                    Diverifikasi oleh: <span className="font-medium">{detailData.verified_by.nama}</span> ({detailData.verified_by.nip})
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : null}
          {detailData && ["Diverifikasi", "Diterima"].includes(detailData.status) && (
            <div className="flex justify-end border-t pt-3">
              <Button size="sm" className="text-xs" onClick={() => cetakDataBarang(detailData.id)}>
                <Printer className="size-3.5 mr-1" strokeWidth={1.75} />
                Cetak Data Barang
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Verify Dialog ────────────────────────────────────── */}
      <Dialog open={verifyOpen} onOpenChange={(v) => { setVerifyOpen(v); if (!v) setVerifyData(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-sm">Verifikasi Barang Titipan</DialogTitle>
            <DialogDescription className="text-xs">
              Tentukan status setiap item barang. Item ditolak wajib diisi alasan.
            </DialogDescription>
          </DialogHeader>
          {verifyData && (
            <ScrollArea className="max-h-[60vh] pr-3">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold">{verifyData.kode_titipan}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{verifyData.nama_pengirim}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{verifyData.nama_wbp || verifyData.wbp?.nama || "-"}</span>
                </div>

                {/* Items with toggles */}
                <div className="space-y-2">
                  {verifyData.items.map((item, idx) => {
                    const vi = verifyItems[idx];
                    return (
                      <div key={item.id} className="p-3 rounded-lg border space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-medium">{item.nama_barang}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {item.jumlah} {item.satuan}
                              {item.keterangan ? ` · ${item.keterangan}` : ""}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={vi?.status === "Diterima" ? "default" : "outline"}
                              className={cn(
                                "h-7 text-[10px] px-2",
                                vi?.status === "Diterima"
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => {
                                const next = [...verifyItems];
                                next[idx] = { ...next[idx], status: "Diterima" };
                                setVerifyItems(next);
                              }}
                            >
                              <CheckCircle2 className="size-3 mr-1" strokeWidth={1.75} />
                              Diterima
                            </Button>
                            <Button
                              size="sm"
                              variant={vi?.status === "Ditolak" ? "default" : "outline"}
                              className={cn(
                                "h-7 text-[10px] px-2",
                                vi?.status === "Ditolak"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => {
                                const next = [...verifyItems];
                                next[idx] = { ...next[idx], status: "Ditolak", alasan_penolakan: next[idx]?.alasan_penolakan || "" };
                                setVerifyItems(next);
                              }}
                            >
                              <XCircle className="size-3 mr-1" strokeWidth={1.75} />
                              Ditolak
                            </Button>
                          </div>
                        </div>
                        {vi?.status === "Ditolak" && (
                          <Textarea
                            placeholder="Alasan penolakan (wajib diisi)"
                            value={vi.alasan_penolakan}
                            onChange={(e) => {
                              const next = [...verifyItems];
                              next[idx] = { ...next[idx], alasan_penolakan: e.target.value };
                              setVerifyItems(next);
                            }}
                            className="text-xs min-h-[50px]"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Catatan Petugas */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Catatan Petugas</Label>
                  <Textarea
                    placeholder="Catatan tambahan (opsional)"
                    value={verifyCatatan}
                    onChange={(e) => setVerifyCatatan(e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="text-xs" onClick={() => setVerifyOpen(false)}>
              Batal
            </Button>
            <Button
              className="text-xs"
              onClick={handleVerify}
              disabled={verifyLoading || verifyItems.some((vi) => vi.status === "Ditolak" && !vi.alasan_penolakan.trim())}
            >
              {verifyLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              <ShieldCheck className="size-4 mr-1" strokeWidth={1.75} />
              Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Deliver Dialog ────────────────────────────────────── */}
      <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Konfirmasi Penyerahan</DialogTitle>
            <DialogDescription className="text-xs">
              Konfirmasi bahwa barang telah diserahkan ke WBP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Kode Titipan: </span>
              <span className="font-mono font-bold">{deliverKode}</span>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Catatan Petugas</Label>
              <Textarea
                placeholder="Catatan penyerahan (opsional)"
                value={deliverCatatan}
                onChange={(e) => setDeliverCatatan(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="text-xs" onClick={() => setDeliverOpen(false)}>
              Batal
            </Button>
            <Button
              className="text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={handleDeliver}
              disabled={deliverLoading}
            >
              {deliverLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              <Truck className="size-4 mr-1" strokeWidth={1.75} />
              Konfirmasi Penyerahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Reject Dialog ────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Tolak Barang Titipan</DialogTitle>
            <DialogDescription className="text-xs">
              Penolakan ini akan menolak seluruh titipan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Kode Titipan: </span>
              <span className="font-mono font-bold">{rejectKode}</span>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Alasan Penolakan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Tuliskan alasan penolakan"
                value={rejectAlasan}
                onChange={(e) => setRejectAlasan(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="text-xs" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button
              className="text-xs bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={rejectLoading || !rejectAlasan.trim()}
            >
              {rejectLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              <Ban className="size-4 mr-1" strokeWidth={1.75} />
              Tolak Titipan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Track Progress Steps ─────────────────────────────────────────
function TrackProgressSteps({ status }: { status: string }) {
  const steps = [
    { key: "Diajukan", label: "Diajukan" },
    { key: "Menunggu", label: "Menunggu Verifikasi" },
    { key: "Diverifikasi", label: "Diverifikasi" },
    { key: "Diterima", label: "Diterima WBP" },
  ];

  const statusOrder = ["Menunggu", "Diverifikasi", "Diterima", "Ditolak"];
  const currentIdx = statusOrder.indexOf(status);
  const isRejected = status === "Ditolak";

  // Map each step to active/completed/rejected
  const getStepState = (stepKey: string) => {
    if (isRejected) {
      if (stepKey === "Diajukan") return "completed";
      if (stepKey === "Menunggu" && currentIdx === 3) return "completed";
      return "rejected";
    }
    // Normal flow
    const stepToStatus: Record<string, number> = {
      Diajukan: -1,
      Menunggu: 0,
      Diverifikasi: 1,
      Diterima: 2,
    };
    const stepVal = stepToStatus[stepKey] ?? -1;
    if (stepVal < currentIdx) return "completed";
    if (stepVal === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="flex items-center gap-0 mt-2 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const state = getStepState(step.key);
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center min-w-[70px]">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  state === "completed" && "bg-emerald-500 border-emerald-500 text-white",
                  state === "active" && "bg-primary border-primary text-white",
                  state === "rejected" && "bg-red-500 border-red-500 text-white",
                  state === "pending" && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {state === "completed" ? (
                  <CheckCircle2 className="size-4" strokeWidth={1.75} />
                ) : state === "rejected" ? (
                  <XCircle className="size-4" strokeWidth={1.75} />
                ) : (
                  <CircleDot className="size-4" strokeWidth={1.75} />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 text-center font-medium",
                  state === "pending" && "text-muted-foreground",
                  state === "active" && "text-primary",
                  state === "completed" && "text-emerald-600",
                  state === "rejected" && "text-red-600"
                )}
              >
                {isRejected && step.key === "Diterima" ? "Ditolak" : step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-12 mb-4 transition-colors",
                  state === "completed" ? "bg-emerald-500" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tanda Terima Unduhan (barcode + data titipan dalam satu form gambar) ───
interface TandaTerimaUnduhProps {
  kodeTitipan: string;
  namaPengirim: string;
  hubungan: string;
  namaWbp: string;
  nomorRegisterWbp?: string;
  kategori: string;
  tanggalPenitipan: string;
  jumlahItem: number;
  status?: string;
}

function TandaTerimaUnduhCard({ kodeTitipan, namaPengirim, hubungan, namaWbp, nomorRegisterWbp, kategori, tanggalPenitipan, jumlahItem, status }: TandaTerimaUnduhProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrFailed, setQrFailed] = useState(false);

  const W = 860;
  const H = 1160;

  function drawReceipt(ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement | null) {
    // Latar putih (wajib untuk ekspor JPG yang tidak mendukung transparansi)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "left";

    // Kop / label instansi
    ctx.fillStyle = "#0F3D66";
    ctx.fillRect(0, 0, W, 150);
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(W, 150);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px Arial, Helvetica, sans-serif";
    ctx.fillText("LAPAS KELAS IIA BONTANG", W / 2, 66);
    ctx.font = "600 21px Arial, Helvetica, sans-serif";
    ctx.fillText("TANDA TERIMA BARANG TITIPAN", W / 2, 106);
    if (status) {
      ctx.font = "italic 17px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "#BFDBFE";
      ctx.fillText(`Status: ${status}`, W / 2, 134);
    }
    ctx.textAlign = "left";

    // Data titipan
    const rows: Array<[string, string]> = [
      ["KODE TITIPAN", kodeTitipan],
      ["NAMA PENGIRIM", namaPengirim],
      ["HUBUNGAN DENGAN WBP", hubungan],
      ["WBP TUJUAN", namaWbp],
      ["NOMOR REGISTER WBP", nomorRegisterWbp && nomorRegisterWbp.trim() ? nomorRegisterWbp : "-"],
      ["KATEGORI BARANG", kategori],
      ["TANGGAL PENITIPAN", `${tanggalPenitipan} · ${jumlahItem} item barang`],
    ];

    let y = 208;
    rows.forEach(([label, value], idx) => {
      ctx.fillStyle = "#64748B";
      ctx.font = "15px Arial, Helvetica, sans-serif";
      ctx.fillText(label, 70, y);
      if (idx === 0) {
        ctx.fillStyle = "#0F3D66";
        ctx.font = "bold 36px 'Courier New', monospace";
      } else {
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 24px Arial, Helvetica, sans-serif";
      }
      ctx.fillText(String(value || "-").slice(0, 42), 70, y + 36);
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(70, y + 52);
      ctx.lineTo(W - 70, y + 52);
      ctx.stroke();
      y += idx === 0 ? 82 : 66;
    });


    // Barcode QR
    const qrSize = 330;
    const qrX = (W - qrSize) / 2;
    const qrY = y + 18;
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28);
    if (qrImg) {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } else {
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = "#64748B";
      ctx.textAlign = "center";
      ctx.font = "bold 22px Arial, Helvetica, sans-serif";
      ctx.fillText("KODE TIDAK TERSEDIA", qrX + qrSize / 2, qrY + qrSize / 2 - 12);
      ctx.font = "bold 26px 'Courier New', monospace";
      ctx.fillText(kodeTitipan, qrX + qrSize / 2, qrY + qrSize / 2 + 24);
      ctx.textAlign = "left";
    }

    // Catatan kaki
    ctx.textAlign = "center";
    ctx.fillStyle = "#334155";
    ctx.font = "17px Arial, Helvetica, sans-serif";
    ctx.fillText("* Barcode ini dipindai petugas untuk verifikasi barang titipan", W / 2, qrY + qrSize + 52);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "14px Arial, Helvetica, sans-serif";
    ctx.fillText(
      `Dicetak: ${new Date().toLocaleString("id-ID")} · Sistem Barang Titipan Lapas Kelas IIA Bontang`,
      W / 2,
      qrY + qrSize + 82,
    );
    ctx.textAlign = "left";
  }


  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawReceipt(ctx, null);

    // Muat QR via proxy same-origin agar canvas bisa diekspor (tidak tainted CORS)
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      drawReceipt(ctx, img);
    };
    img.onerror = () => {
      if (cancelled) return;
      setQrFailed(true);
      drawReceipt(ctx, null);
    };
    img.src = `/api/public/qr/${encodeURIComponent(kodeTitipan)}`;

    return () => {
      cancelled = true;
    };
  }, [kodeTitipan]);

  function download(mime: "image/png" | "image/jpeg") {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ext = mime === "image/jpeg" ? "jpg" : "png";
    const dataUrl = mime === "image/jpeg" ? canvas.toDataURL("image/jpeg", 0.95) : canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `tanda-terima-titipan-${kodeTitipan}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success(`Tanda terima berhasil diunduh sebagai ${ext.toUpperCase()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div className="rounded-xl border bg-white p-2 shadow-sm">
          <canvas ref={canvasRef} className="max-h-[430px] w-auto max-w-full rounded-lg" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => download("image/png")}>
          <Download className="size-4 mr-2" />Unduh PNG
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => download("image/jpeg")}>
          <Download className="size-4 mr-2" />Unduh JPG
        </Button>
      </div>
      {qrFailed && (
        <p className="text-xs text-muted-foreground text-center">
          Barcode QR gagal dimuat — Kode Titipan tetap tercantum pada tanda terima dan dapat diverifikasi manual oleh petugas.
        </p>
      )}
    </div>
  );
}

// ─── Helper cetak Lembar Data Barang Titipan & Biodata Pemilik ──────────────
// Tersedia bagi petugas setelah memverifikasi titipan (status Diverifikasi / Diterima).
interface TitipanPrintParts {
  itemRows: string;
  wbpNama: string;
  wbpReg: string;
  blokRow: string;
  catatanBlock: string;
  ttdVerified: string;
}

function escHtml(v?: string | null): string {
  return String(v ?? "-").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildTitipanPrintParts(data: TitipanDetailItem): TitipanPrintParts {
  const itemRows = data.items
    .map(
      (it, i) => `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${escHtml(it.nama_barang)}</td>
          <td style="text-align:center">${it.jumlah} ${escHtml(it.satuan)}</td>
          <td>${escHtml(it.keterangan)}</td>
          <td style="text-align:center">${escHtml(it.status)}${
            it.status === "Ditolak" && it.alasan_penolakan ? `<br/><small>${escHtml(it.alasan_penolakan)}</small>` : ""
          }</td>
        </tr>`
    )
    .join("");
  return {
    itemRows,
    wbpNama: escHtml(data.nama_wbp || data.wbp?.nama),
    wbpReg: escHtml(data.nomor_register_wbp || data.wbp?.nomor_register),
    blokRow: data.wbp?.blok
      ? `<tr><td class="lbl">Lokasi Blok / Kamar</td><td>: ${escHtml(data.wbp.blok)} / ${escHtml(data.wbp.kamar)}</td></tr>`
      : "",
    catatanBlock: data.catatan_petugas
      ? `<div class="catatan"><b>Catatan Petugas:</b> ${escHtml(data.catatan_petugas)}</div>`
      : "",
    ttdVerified: data.verified_by
      ? `${escHtml(data.verified_by.nama)}<br/><span style="font-size:10px">NIP. ${escHtml(data.verified_by.nip)}</span>`
      : "____________________",
  };
}


function buildTitipanPrintHtml(data: TitipanDetailItem, parts: TitipanPrintParts): string {
  return `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8" />
<title>Lembar Data Barang Titipan ${escHtml(data.kode_titipan)}</title><style>
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 32px; font-size: 12px; }
.kop { border-bottom: 4px solid #0F3D66; padding-bottom: 10px; text-align: center; margin-bottom: 6px; }
.kop h1 { margin: 0; font-size: 20px; letter-spacing: 1px; color: #0F3D66; }
.kop p { margin: 4px 0 0; font-size: 11px; color: #444; }
.judul { text-align: center; font-weight: bold; font-size: 14px; margin: 14px 0 2px; text-transform: uppercase; }
.subjudul { text-align: center; font-size: 11px; color: #555; margin-bottom: 16px; }
table.data { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
table.data td { padding: 4px 6px; vertical-align: top; }
table.data td.lbl { width: 175px; color: #555; }
h2 { font-size: 12px; background: #E8EEF5; padding: 5px 8px; margin: 12px 0 6px; color: #0F3D66; text-transform: uppercase; letter-spacing: .5px; }
table.barang { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
table.barang th, table.barang td { border: 1px solid #999; padding: 5px 7px; font-size: 11.5px; }
table.barang th { background: #F1F5F9; }
.catatan { border: 1px solid #ccc; padding: 7px 9px; font-size: 11.5px; background: #FAFAFA; margin-bottom: 10px; }
.ttd { display: flex; justify-content: space-between; margin-top: 38px; page-break-inside: avoid; }
.ttd div { width: 45%; text-align: center; font-size: 11.5px; }
.ttd .space { height: 58px; }
footer { margin-top: 20px; font-size: 10px; color: #888; text-align: center; }
@media print { body { margin: 12mm; } }
</style></head><body>
<div class="kop"><h1>LAPAS KELAS IIA BONTANG</h1>
<p>Jl. Gajah Mada, Bontang, Kalimantan Timur &middot; Sistem Informasi Barang Titipan</p></div>
<div class="judul">Lembar Data Barang Titipan</div>
<div class="subjudul">Kode: ${escHtml(data.kode_titipan)} &middot; Status: ${escHtml(data.status)}</div>
<h2>A. Biodata Pemilik / Pengirim Barang</h2>
<table class="data">
<tr><td class="lbl">Nama Lengkap</td><td>: <b>${escHtml(data.nama_pengirim)}</b></td></tr>
<tr><td class="lbl">NIK</td><td>: ${escHtml(data.nik_pengirim)}</td></tr>
<tr><td class="lbl">No. HP</td><td>: ${escHtml(data.no_hp)}</td></tr>
<tr><td class="lbl">Hubungan dengan WBP</td><td>: ${escHtml(data.hubungan)}</td></tr>
</table>
<h2>B. Data WBP Tujuan</h2>
<table class="data">
<tr><td class="lbl">Nama WBP</td><td>: <b>${parts.wbpNama}</b></td></tr>
<tr><td class="lbl">Nomor Register</td><td>: ${parts.wbpReg}</td></tr>
${parts.blokRow}
<tr><td class="lbl">Kategori Barang</td><td>: ${escHtml(data.kategori)}</td></tr>
<tr><td class="lbl">Tanggal Penitipan</td><td>: ${escHtml(data.tanggal_penitipan)}${data.jam_penitipan ? ` pukul ${escHtml(data.jam_penitipan)}` : ""}</td></tr>
</table>
<h2>C. Daftar Barang</h2>
<table class="barang"><thead>
<tr><th style="width:34px">No</th><th>Nama Barang</th><th style="width:90px">Jumlah</th><th>Keterangan</th><th style="width:110px">Status Verifikasi</th></tr>
</thead><tbody>${parts.itemRows}</tbody></table>
${parts.catatanBlock}
<div class="ttd">
<div>Pengirim,<div class="space"></div>${escHtml(data.nama_pengirim)}</div>
<div>Petugas Pelayanan,<div class="space"></div>${parts.ttdVerified}</div>
</div>
<footer>Dicetak: ${new Date().toLocaleString("id-ID")} &middot; Diverifikasi: ${
    data.verified_at ? new Date(data.verified_at).toLocaleString("id-ID") : "-"
  } &middot; Dokumen dicetak otomatis oleh sistem</footer>
</body></html>`;
}


function printHtmlDocument(html: string) {
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    toast.error("Gagal menyiapkan dokumen cetak");
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const win = iframe.contentWindow;
  setTimeout(() => {
    win?.focus();
    win?.print();
    setTimeout(() => iframe.remove(), 1500);
  }, 300);
}

