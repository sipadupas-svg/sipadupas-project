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
  Upload,
  Download,
  MessageCircle,
  FileCheck2,
  Camera,
  Keyboard,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { PageHeader, StatCard, SectionCard, KameraScan } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";

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
  wbpId?: string | null;
  namaWbp?: string | null;
  nomorRegisterWbp?: string | null;
  tanggal: string;
  sesi: string;
  status: string;
  checkedInAt?: string | null;
  selesaiAt?: string | null;
  catatanPetugas?: string | null;
  keperluan?: string | null;
  jenisIdentitas?: string | null;
  qrCodeUrl?: string;
  berkas?: { id: string; jenis: string; namaFile: string; mimeType: string; ukuran: number; data?: string }[];
  createdAt: string;
  updatedAt: string;
  wbp?: WBPItem | null;
}

type BookingFile = { jenis: "IDENTITAS" | "SELFIE"; namaFile: string; mimeType: string; ukuran: number; data: string };

async function readBookingFile(file: File, jenis: BookingFile["jenis"]): Promise<BookingFile> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Berkas ${jenis.toLowerCase()} gagal dibaca`));
    reader.readAsDataURL(file);
  });
  return { jenis, namaFile: file.name, mimeType: file.type, ukuran: file.size, data };
}

const SESI_LIST = [
  { sesi: "Sesi Pagi", jam: "09:00 – 12:00", kuota: 20 },
  { sesi: "Sesi Siang", jam: "13:00 – 15:00", kuota: 20 },
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
  const [bookingResult, setBookingResult] = useState<{
    kodeBooking: string;
    namaPemohon: string;
    hubungan: string;
    namaWbp: string;
    nomorRegisterWbp: string;
    tanggal: string;
    sesi: string;
  } | null>(null);
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [hubungan, setHubungan] = useState("");
  const [sesi, setSesi] = useState("");
  const [namaWbp, setNamaWbp] = useState("");
  const [nomorRegisterWbp, setNomorRegisterWbp] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [keperluan, setKeperluan] = useState("");
  const [jenisIdentitas, setJenisIdentitas] = useState("KTP");
  const [identitas, setIdentitas] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [setujuPersyaratan, setSetujuPersyaratan] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) { toast.error("Nama pemohon wajib diisi"); return; }
    if (!/^\d{16}$/.test(nik.trim())) { toast.error("NIK harus terdiri dari 16 digit"); return; }
    if (!/^(\+62|62|08)\d{8,13}$/.test(noHp.trim())) { toast.error("Nomor WhatsApp tidak valid"); return; }
    if (!alamat.trim()) { toast.error("Alamat wajib diisi"); return; }
    if (!hubungan) { toast.error("Pilih hubungan dengan WBP terlebih dahulu"); return; }
    if (!tanggal || !sesi) { toast.error("Tanggal dan sesi kunjungan wajib dipilih"); return; }
    if (!keperluan.trim()) { toast.error("Keperluan kunjungan wajib diisi"); return; }
    if (!namaWbp.trim()) { toast.error("Nama WBP yang dikunjungi wajib diisi"); return; }
    if (!identitas || !selfie) { toast.error("Unggah berkas identitas dan foto selfie terlebih dahulu"); return; }
    if (!setujuPersyaratan) { toast.error("Centang persetujuan persyaratan kunjungan"); return; }
    if (identitas.size > 3 * 1024 * 1024 || selfie.size > 3 * 1024 * 1024) { toast.error("Ukuran setiap berkas maksimum 3 MB"); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(identitas.type)) { toast.error("Identitas harus JPG, PNG, WEBP, atau PDF"); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selfie.type)) { toast.error("Selfie harus JPG, PNG, atau WEBP"); return; }
    setSubmitting(true);
    try {
      const berkas = await Promise.all([readBookingFile(identitas, "IDENTITAS"), readBookingFile(selfie, "SELFIE")]);
      const res = await fetch("/api/kunjungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaPemohon: nama, nikPemohon: nik, noHp, alamat, hubungan, namaWbp: namaWbp.trim(), nomorRegisterWbp: nomorRegisterWbp.trim() || undefined, tanggal, sesi, keperluan, jenisIdentitas, setujuPersyaratan, berkas }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || err?.message || "Gagal membuat booking"); }
      const json = await res.json();
      setBookingResult({
        kodeBooking: json.data.kodeBooking,
        namaPemohon: nama.trim(),
        hubungan,
        namaWbp: namaWbp.trim(),
        nomorRegisterWbp: nomorRegisterWbp.trim(),
        tanggal,
        sesi,
      });
      toast.success(`Booking berhasil! Tiket: ${json.data.kodeBooking}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (bookingResult) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Booking Berhasil Dikirim!</h3>
          <p className="text-sm text-muted-foreground mt-1">Unduh e-tiket di bawah ini dan tunjukkan kepada petugas pendaftaran saat datang untuk diverifikasi.</p>
        </div>
        <TiketUnduhCard
          kodeBooking={bookingResult.kodeBooking}
          namaPemohon={bookingResult.namaPemohon}
          hubungan={bookingResult.hubungan}
          namaWbp={bookingResult.namaWbp}
          nomorRegisterWbp={bookingResult.nomorRegisterWbp}
          tanggal={bookingResult.tanggal}
          sesi={bookingResult.sesi}
          status="Menunggu"
        />
        <p className="text-xs text-muted-foreground">Status awal: <span className="font-medium text-amber-600">Menunggu</span> — verifikasi dilakukan oleh <span className="font-medium">petugas pelayanan</span> saat Anda datang.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => { setBookingResult(null); setNama(""); setNik(""); setNoHp(""); setAlamat(""); setHubungan(""); setSesi(""); setKeperluan(""); setIdentitas(null); setSelfie(null); setSetujuPersyaratan(false); setNamaWbp(""); setNomorRegisterWbp(""); }}>Daftar Lagi</Button>
          <Button size="sm" onClick={() => useAppStore.getState().setView("kunjungan")}>← Kembali</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="pub-nama">Nama Pemohon <span className="text-red-500">*</span></Label>
          <Input id="pub-nama" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap sesuai KTP" />
        </div>
        <div>
          <Label htmlFor="pub-nik">NIK</Label>
          <Input id="pub-nik" inputMode="numeric" maxLength={16} value={nik} onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))} placeholder="16 digit NIK" />
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
          <Input id="pub-tgl" type="date" required min={new Date().toISOString().slice(0, 10)} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pub-sesi">Sesi Kunjungan <span className="text-red-500">*</span></Label>
          <Select value={sesi} onValueChange={setSesi} required>
            <SelectTrigger id="pub-sesi"><SelectValue placeholder="Pilih sesi" /></SelectTrigger>
            <SelectContent>{SESI_LIST.map((s) => (<SelectItem key={s.sesi} value={s.sesi}>{s.sesi} · {s.jam} WITA</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
          <p className="text-xs text-muted-foreground">
            Anda <span className="font-medium text-foreground">tidak perlu memilih nama WBP dari daftar</span>. Cukup tuliskan nama WBP yang akan dikunjungi — data akan diverifikasi oleh petugas pelayanan saat Anda datang.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pub-wbp-nama">Nama WBP yang Dikunjungi <span className="text-red-500">*</span></Label>
              <Input id="pub-wbp-nama" required value={namaWbp} onChange={(e) => setNamaWbp(e.target.value)} placeholder="Contoh: Ahmad Suryadi" autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="pub-wbp-reg">Nomor Register WBP <span className="text-xs text-muted-foreground">(jika tahu)</span></Label>
              <Input id="pub-wbp-reg" value={nomorRegisterWbp} onChange={(e) => setNomorRegisterWbp(e.target.value)} placeholder="Contoh: WBP-2024-001" autoComplete="off" />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="pub-identitas-jenis">Jenis Tanda Pengenal <span className="text-red-500">*</span></Label>
          <Select value={jenisIdentitas} onValueChange={setJenisIdentitas}>
            <SelectTrigger id="pub-identitas-jenis"><SelectValue /></SelectTrigger>
            <SelectContent>{["KTP", "SIM", "Paspor"].map((jenis) => <SelectItem key={jenis} value={jenis}>{jenis}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pub-keperluan">Keperluan <span className="text-red-500">*</span></Label>
          <Input id="pub-keperluan" required value={keperluan} onChange={(e) => setKeperluan(e.target.value)} placeholder="Contoh: kunjungan keluarga" />
        </div>
        <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-dashed p-3 space-y-2">
            <Label htmlFor="pub-identitas" className="flex items-center gap-2"><Upload className="size-4" />Upload {jenisIdentitas}</Label>
            <Input id="pub-identitas" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required onChange={(e) => setIdentitas(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">JPG/PNG/WEBP/PDF, maksimum 3 MB{identitas ? ` · ${identitas.name}` : ""}</p>
          </div>
          <div className="rounded-lg border border-dashed p-3 space-y-2">
            <Label htmlFor="pub-selfie" className="flex items-center gap-2"><Upload className="size-4" />Foto Selfie</Label>
            <Input id="pub-selfie" type="file" accept="image/jpeg,image/png,image/webp" capture="user" required onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
            <p className="text-xs text-muted-foreground">JPG/PNG/WEBP, maksimum 3 MB{selfie ? ` · ${selfie.name}` : ""}</p>
          </div>
        </div>
        <label className="sm:col-span-2 flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-sm cursor-pointer">
          <Checkbox checked={setujuPersyaratan} onCheckedChange={(checked) => setSetujuPersyaratan(checked === true)} />
          <span>Saya menyetujui persyaratan kunjungan, bersedia mengikuti tata tertib Lapas, dan menyatakan data/berkas yang dikirim benar.</span>
        </label>
      </div>
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
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
      const res = await fetch(`/api/public/visit-bookings/track?kode=${encodeURIComponent(kode.trim())}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setResult(json.data as KunjunganItem);
    } catch {
      setNotFound(true);
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
              <div className="font-medium">{result.namaWbp || result.wbp?.nama || "-"}</div>
              <div className="text-xs text-muted-foreground">{result.nomorRegisterWbp || result.wbp?.nomorRegister || "-"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="size-3.5" />
            <span>Sesi: {result.sesi}</span>
            {result.catatanPetugas && <span>· Catatan: {result.catatanPetugas}</span>}
          </div>
          {result.qrCodeUrl && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-center mb-2 text-muted-foreground">Unduh E-Tiket Kunjungan</p>
              <TiketUnduhCard
                kodeBooking={result.kodeBooking}
                namaPemohon={result.namaPemohon}
                hubungan={result.hubungan}
                namaWbp={result.namaWbp || result.wbp?.nama || "-"}
                nomorRegisterWbp={result.nomorRegisterWbp || result.wbp?.nomorRegister || ""}
                tanggal={result.tanggal}
                sesi={result.sesi}
                status={result.status}
              />
            </div>
          )}
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
  // ── Scan Tiket (verifikasi petugas pendaftaran) ──
  const [scanOpen, setScanOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);

  const fetchKunjungan = useCallback(async () => {
    try {
      setLoading(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/kunjungan", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // Cari tiket berdasarkan kode booking — dipakai form manual & hasil scan kamera
  const handleLookup = useCallback(async (kode: string) => {
    const value = kode.trim();
    if (!value) return;
    setScanLoading(true);
    try {
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch(`/api/kunjungan/scan?kode=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || "Tiket tidak ditemukan");
      }
      const json = await res.json();
      toast.success(`Tiket ${json.data.kodeBooking} ditemukan — verifikasi data sebelum check-in.`);
      setScanOpen(false);
      setCameraMode(false);
      setScanCode("");
      fetchKunjungan();
      setTiketDetail(json.data as KunjunganItem);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memindai tiket");
    } finally {
      setScanLoading(false);
    }
  }, [fetchKunjungan]);

  async function handleScanTiket(e?: React.FormEvent) {
    e?.preventDefault();
    await handleLookup(scanCode);
  }

  // Stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayKunjungan = kunjunganList.filter((k) => k.tanggal === todayStr);
  // Tab aktif: tiket hari ini + mendatang (agar booking untuk tanggal depan tetap terlihat)
  const activeKunjungan = kunjunganList
    .filter((k) => k.tanggal >= todayStr && !["Selesai", "Ditolak"].includes(k.status))
    .sort((a, b) => (a.tanggal === b.tanggal ? a.sesi.localeCompare(b.sesi) : a.tanggal.localeCompare(b.tanggal)));
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
          <div className="flex items-center gap-2">
            <Dialog open={scanOpen} onOpenChange={(v) => { setScanOpen(v); if (!v) setCameraMode(false); }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <QrCode className="size-4 mr-1" /> Scan Tiket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="size-5 text-primary" /> Scan / Verifikasi Tiket
                  </DialogTitle>
                  <DialogDescription>
                    Pindai barcode pengunjung dengan kamera, atau ketik Nomor Booking. Verifikasi data wajib dilakukan sebelum check-in.
                  </DialogDescription>
                </DialogHeader>
                {cameraMode ? (
                  <KameraScan onDetected={handleLookup} />
                ) : (
                  <form onSubmit={handleScanTiket} className="space-y-3">
                    <div>
                      <Label htmlFor="scan-kode">Nomor Booking</Label>
                      <Input
                        id="scan-kode"
                        autoFocus
                        value={scanCode}
                        onChange={(e) => setScanCode(e.target.value)}
                        placeholder="Contoh: SJY-260819-001"
                        autoComplete="off"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setScanOpen(false)}>Batal</Button>
                      <Button type="submit" disabled={scanLoading || !scanCode.trim()}>
                        {scanLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
                        Cari Tiket
                      </Button>
                    </DialogFooter>
                  </form>
                )}
                <div className="flex justify-center border-t pt-3">
                  {cameraMode ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCameraMode(false)}>
                      <Keyboard className="size-4 mr-1" /> Ketik Manual
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCameraMode(true)} disabled={scanLoading}>
                      <Camera className="size-4 mr-1" /> Scan via Kamera
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-1" /> Booking Baru
                </Button>
              </DialogTrigger>
              <BookingDialog onClose={() => { setOpen(false); fetchKunjungan(); }} />
            </Dialog>
          </div>
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
            title="Tiket Kunjungan Aktif"
            description={`${activeKunjungan.length} tiket hari ini & mendatang`}
          >
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-lg" />
                ))}
              </div>
            ) : activeKunjungan.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Belum ada tiket aktif.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {activeKunjungan.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setTiketDetail(k)}
                    className="text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:shadow-sm transition-all bg-card group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-semibold text-sm">{k.namaPemohon}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {k.hubungan} dari {k.namaWbp || k.wbp?.nama || "-"}
                        </div>
                      </div>
                      <KunjunganStatusBadge status={k.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
                      <Ticket className="size-3.5 text-primary" />
                      <span className="font-mono">{k.kodeBooking}</span>
                      <span>·</span>
                      <CalendarDays className="size-3.5" />
                      <span>{k.tanggal}</span>
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
            description={`${SESI_LIST.length} sesi per hari · maksimum 20 pengunjung per sesi`}
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
                        <TableCell className="text-xs">{k.namaWbp || k.wbp?.nama || "-"}</TableCell>
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
        <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
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
  const [namaWbp, setNamaWbp] = useState("");
  const [nomorRegisterWbp, setNomorRegisterWbp] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) {
      toast.error("Nama pemohon wajib diisi");
      return;
    }
    if (!hubungan || !tanggal || !sesi) {
      toast.error("Hubungan, tanggal, dan sesi wajib diisi");
      return;
    }
    if (!namaWbp.trim()) {
      toast.error("Nama WBP yang dikunjungi wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/kunjungan/internal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPemohon: nama,
          nikPemohon: nik || undefined,
          noHp: noHp || undefined,
          alamat: alamat || undefined,
          hubungan,
          namaWbp: namaWbp.trim(),
          nomorRegisterWbp: nomorRegisterWbp.trim() || undefined,
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
    <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Booking Kunjungan Online</DialogTitle>
        <DialogDescription>
          Lengkapi data pemohon — tidak perlu memilih nama WBP dari daftar. Tiket ber-Nomor Booking & barcode langsung terbit untuk diverifikasi petugas saat kunjungan.
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
            <Input id="nik" inputMode="numeric" maxLength={16} value={nik} onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))} placeholder="16 digit NIK" />
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
            <Input id="tanggal" type="date" required min={new Date().toISOString().slice(0, 10)} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="wbp">Nama WBP yang Dikunjungi</Label>
            <Input id="wbp" required value={namaWbp} onChange={(e) => setNamaWbp(e.target.value)} placeholder="Contoh: Ahmad Suryadi" autoComplete="off" />
          </div>
          <div>
            <Label htmlFor="wbp-reg">Nomor Register (opsional)</Label>
            <Input id="wbp-reg" value={nomorRegisterWbp} onChange={(e) => setNomorRegisterWbp(e.target.value)} placeholder="Contoh: WBP-2024-001" autoComplete="off" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={submitting}>
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
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch(`/api/kunjungan/${tiket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  function whatsappLink() {
    const phone = (tiket.noHp || "").replace(/\D/g, "").replace(/^0/, "62");
    if (!phone) return "";
    const statusText = tiket.status === "Ditolak" ? "ditolak" : tiket.status === "Disetujui" ? "disetujui" : "diperbarui";
    const reason = tiket.catatanPetugas ? `\nCatatan petugas: ${tiket.catatanPetugas}` : "";
    const wbpNama = tiket.namaWbp || tiket.wbp?.nama || "-";
    const message = `Halo ${tiket.namaPemohon}, pendaftaran kunjungan ${tiket.kodeBooking} ke WBP ${wbpNama} telah ${statusText}. Tanggal: ${tiket.tanggal}, sesi: ${tiket.sesi}.${reason}\n\nSalam, Petugas Lapas Kelas IIA Bontang.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
          <img
            src={tiket.qrCodeUrl || `/api/public/qr/${encodeURIComponent(tiket.kodeBooking)}`}
            alt={`Barcode ${tiket.kodeBooking}`}
            className="size-32 rounded-lg bg-white object-contain p-1 mb-3 shadow-sm"
          />
          <div className="text-xs text-muted-foreground">Tiket</div>
          <div className="font-mono font-semibold text-sm">{tiket.kodeBooking}</div>
        </div>
        <div className="space-y-2 text-sm">
          <DetailRow label="Pemohon" value={tiket.namaPemohon} icon={Users} />
          <DetailRow label="Hubungan" value={tiket.hubungan} icon={Users} />
          <DetailRow label="WBP" value={`${tiket.namaWbp || tiket.wbp?.nama || "-"}${tiket.nomorRegisterWbp || tiket.wbp?.nomorRegister ? ` (${tiket.nomorRegisterWbp || tiket.wbp?.nomorRegister})` : ""}`} icon={Users} />
          <DetailRow label="Tanggal" value={tiket.tanggal} icon={CalendarDays} />
          <DetailRow label="Sesi" value={tiket.sesi} icon={Clock} />
          {tiket.keperluan && <DetailRow label="Keperluan" value={tiket.keperluan} icon={FileCheck2} />}
          {tiket.jenisIdentitas && <DetailRow label="Identitas" value={tiket.jenisIdentitas} icon={FileCheck2} />}
          {tiket.catatanPetugas && <DetailRow label="Catatan" value={tiket.catatanPetugas} icon={Ticket} />}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs"><CheckCircle2 className="size-3.5" /> Status</span>
            <KunjunganStatusBadge status={tiket.status} />
          </div>
        </div>

        {tiket.berkas && tiket.berkas.length > 0 && (
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-xs font-semibold flex items-center gap-2"><FileCheck2 className="size-4 text-primary" /> Berkas pendaftaran</div>
            <div className="grid grid-cols-2 gap-2">
              {tiket.berkas.map((file) => (
                <a key={file.id} href={file.data} target="_blank" rel="noreferrer" className="rounded border p-2 text-xs hover:bg-muted/40">
                  <div className="font-medium">{file.jenis === "SELFIE" ? "Foto Selfie" : `Tanda Pengenal (${tiket.jenisIdentitas || "dokumen"})`}</div>
                  <div className="text-muted-foreground truncate">{file.namaFile}</div>
                </a>
              ))}
            </div>
          </div>
        )}

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
        {whatsappLink() && (tiket.status === "Ditolak" || tiket.status === "Disetujui") && (
          <Button variant="outline" asChild>
            <a href={whatsappLink()} target="_blank" rel="noreferrer"><MessageCircle className="size-4 mr-1 text-emerald-600" /> Konfirmasi WA</a>
          </Button>
        )}
        {tiket.status === "Menunggu" && (
          <Button disabled={actionLoading} onClick={() => handleAction("setujui", { catatanPetugas: catatan || undefined })}>
            {actionLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
            <CheckCircle2 className="size-4 mr-1" /> Setujui
          </Button>
        )}
        {tiket.status === "Menunggu" && (
          <Button variant="destructive" disabled={actionLoading} onClick={() => handleAction("tolak", { catatanPetugas: catatan || undefined })}>
            {actionLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
            <XCircle className="size-4 mr-1" /> Tolak
          </Button>
        )}
        {tiket.status === "Disetujui" && (
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

// ─── E-Tiket Unduhan (barcode + data kunjungan dalam satu form gambar) ──────
interface TiketUnduhProps {
  kodeBooking: string;
  namaPemohon: string;
  hubungan: string;
  namaWbp: string;
  nomorRegisterWbp?: string;
  tanggal: string;
  sesi: string;
  status?: string;
}

function TiketUnduhCard({ kodeBooking, namaPemohon, hubungan, namaWbp, nomorRegisterWbp, tanggal, sesi, status }: TiketUnduhProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrFailed, setQrFailed] = useState(false);

  const W = 860;
  const H = 1160;

  function drawTicket(ctx: CanvasRenderingContext2D, qrImg: HTMLImageElement | null) {
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
    ctx.fillText("E-TIKET KUNJUNGAN ONLINE", W / 2, 106);
    if (status) {
      ctx.font = "italic 17px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "#BFDBFE";
      ctx.fillText(`Status: ${status}`, W / 2, 134);
    }
    ctx.textAlign = "left";


    // Data kunjungan
    const rows: Array<[string, string]> = [
      ["NOMOR BOOKING", kodeBooking],
      ["NAMA PENGUNJUNG", namaPemohon],
      ["HUBUNGAN DENGAN WBP", hubungan],
      ["WBP YANG DIKUNJUNGI", namaWbp],
      ["NOMOR REGISTER WBP", nomorRegisterWbp && nomorRegisterWbp.trim() ? nomorRegisterWbp : "-"],
      ["TANGGAL KUNJUNGAN", tanggal],
      ["SESI KUNJUNGAN", sesi],
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
      ctx.fillText(kodeBooking, qrX + qrSize / 2, qrY + qrSize / 2 + 24);
      ctx.textAlign = "left";
    }

    // Catatan kaki
    ctx.textAlign = "center";
    ctx.fillStyle = "#334155";
    ctx.font = "17px Arial, Helvetica, sans-serif";
    ctx.fillText("* Barcode ini dipindai petugas pendaftaran untuk verifikasi kedatangan", W / 2, qrY + qrSize + 52);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "14px Arial, Helvetica, sans-serif";
    ctx.fillText(
      `Dicetak: ${new Date().toLocaleString("id-ID")} · Sistem Kunjungan Online Lapas Kelas IIA Bontang`,
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

    drawTicket(ctx, null);

    // Muat QR via proxy same-origin agar canvas bisa diekspor (tidak tainted CORS)
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      drawTicket(ctx, img);
    };
    img.onerror = () => {
      if (cancelled) return;
      setQrFailed(true);
      drawTicket(ctx, null);
    };
    img.src = `/api/public/qr/${encodeURIComponent(kodeBooking)}`;

    return () => {
      cancelled = true;
    };
  }, [kodeBooking]);

  function download(mime: "image/png" | "image/jpeg") {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ext = mime === "image/jpeg" ? "jpg" : "png";
    const dataUrl = mime === "image/jpeg" ? canvas.toDataURL("image/jpeg", 0.95) : canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `tiket-kunjungan-${kodeBooking}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success(`E-tiket berhasil diunduh sebagai ${ext.toUpperCase()}`);
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
          Barcode QR gagal dimuat — Nomor Booking tetap tercantum pada tiket dan dapat diverifikasi manual oleh petugas.
        </p>
      )}
    </div>
  );
}

