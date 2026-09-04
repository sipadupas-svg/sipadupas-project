"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Newspaper,
  Plus,
  CalendarDays,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  Megaphone,
  ArrowRight,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { dataPublikasi } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface BeritaItem {
  id: string;
  judul: string;
  ringkasan?: string | null;
  isi?: string | null;
  gambar?: string | null;
  kategori?: string | null;
  penulis?: string | null;
  status: string;
  publishedAt?: string | null;
  createdAt: string;
}

const KATEGORI_OPTIONS = ["Kegiatan", "Pembinaan", "Pengamanan", "Layanan", "Umum"];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function PublikasiView() {
  const currentUser = useAppStore((s) => s.currentUser);

  const [berita, setBerita] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    judul: "",
    kategori: "Kegiatan",
    ringkasan: "",
    isi: "",
    gambar: "",
    status: "Terbit",
  });

  const fetchBerita = useCallback(async () => {
    try {
      setLoading(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/publikasi", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setBerita(Array.isArray(json?.data) ? json.data : []);
    } catch {
      toast.error("Gagal memuat data berita");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBerita(); }, [fetchBerita]);

  const openDialog = useCallback(() => {
    setForm({ judul: "", kategori: "Kegiatan", ringkasan: "", isi: "", gambar: "", status: "Terbit" });
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.judul.trim()) {
      toast.error("Judul berita wajib diisi");
      return;
    }
    if (form.status === "Terbit" && !form.ringkasan.trim()) {
      toast.error("Ringkasan wajib diisi untuk berita yang diterbitkan");
      return;
    }
    try {
      setSaving(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/publikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          judul: form.judul.trim(),
          ringkasan: form.ringkasan.trim() || undefined,
          isi: form.isi.trim() || undefined,
          gambar: form.gambar.trim() || undefined,
          kategori: form.kategori,
          penulis: currentUser?.nama || "Admin",
          status: form.status,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Gagal menyimpan berita");
      toast.success(form.status === "Terbit" ? "Berita berhasil diterbitkan" : "Draft berita berhasil disimpan");
      setDialogOpen(false);
      fetchBerita();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan berita");
    } finally {
      setSaving(false);
    }
  }, [form, currentUser, fetchBerita]);

  const pengumuman = dataPublikasi.filter(p => p.jenis === "Pengumuman");
  const galeri = dataPublikasi.filter(p => p.jenis === "Galeri");
  const karya = dataPublikasi.filter(p => p.jenis === "Karya WBP");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Publikasi"
        description="Berita, pengumuman, galeri kegiatan, dan produk/karya Warga Binaan Pemasyarakatan."
        badge="Publik"
        icon={Newspaper}
        action={<Button size="sm" onClick={openDialog}><Plus className="size-4 mr-1" /> Tulis Berita</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Berita" value={berita.length} icon={Newspaper} sub="Bulan ini" accent="primary" />
        <StatCard label="Pengumuman" value={pengumuman.length} icon={Megaphone} sub="Aktif" accent="accent" />
        <StatCard label="Galeri Kegiatan" value={galeri.length} icon={ImageIcon} sub="Dokumentasi" accent="warning" />
        <StatCard label="Karya WBP" value={karya.length} icon={ShoppingBag} sub="Produk unggulan" accent="danger" />
      </div>

      <Tabs defaultValue="berita">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="berita">Berita</TabsTrigger>
          <TabsTrigger value="pengumuman">Pengumuman</TabsTrigger>
          <TabsTrigger value="galeri">Galeri</TabsTrigger>
          <TabsTrigger value="karya">Karya WBP</TabsTrigger>
        </TabsList>

        <TabsContent value="berita" className="space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Featured */}
              {berita[0] && (
                <div className="relative overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground">
                  <div className="hero-pattern absolute inset-0" />
                  <div className="relative p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-sidebar-primary text-sidebar-primary-foreground">Headline</Badge>
                      {berita[0].status === "Draft" && (
                        <Badge variant="outline" className="bg-background/60 text-foreground border-border">Draft</Badge>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{berita[0].judul}</h2>
                    <p className="mt-2 text-sidebar-foreground/80 text-sm leading-relaxed max-w-2xl line-clamp-3">{berita[0].ringkasan ?? berita[0].isi ?? ""}</p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-sidebar-foreground/70">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" /> {formatDate(berita[0].createdAt)}
                      </span>
                      {berita[0].penulis && <span>Oleh: {berita[0].penulis}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {berita.slice(1).map((b) => (
                  <div key={b.id} className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow group">
                    <div className="aspect-video bg-gradient-to-br from-primary/15 via-accent/15 to-sidebar/20 flex items-center justify-center relative">
                      <FileText className="size-10 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                      <Badge
                        variant="outline"
                        className={cn(
                          "absolute top-2 right-2 text-[10px]",
                          b.status === "Terbit"
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-600/30"
                            : "bg-amber-500/10 text-amber-700 border-amber-600/30",
                        )}
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{b.judul}</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{b.ringkasan ?? ""}</p>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="size-3" /> {formatDate(b.createdAt)}</span>
                        {b.kategori && <Badge variant="outline" className="text-[10px]">{b.kategori}</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {berita.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 h-40 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground">
                  <Newspaper className="size-8" />
                  <p className="text-xs">Belum ada berita — klik &quot;Tulis Berita&quot; untuk membuat</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="pengumuman" className="space-y-4">
          <SectionCard title="Pengumuman Resmi" description="Pemberitahuan kepada masyarakat">
            <div className="space-y-3">
              {pengumuman.map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
                  <div className="size-10 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                    <Megaphone className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight">{p.judul}</h3>
                      <Badge variant="outline" className="text-[10px] shrink-0">{p.tanggal}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.ringkas}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="galeri" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galeri.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow group">
                <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-sidebar/30 flex items-center justify-center relative">
                  <ImageIcon className="size-10 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                  <Badge className="absolute top-2 right-2 text-[10px] bg-background/90 text-foreground border-border">
                    {p.tanggal}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm leading-tight">{p.judul}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.ringkas}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="karya" className="space-y-4">
          <SectionCard
            title="Karya & Produk WBP"
            description="Hasil kemandirian WBP dari program pembinaan"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {karya.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow group">
                  <div className="aspect-square bg-gradient-to-br from-accent/20 via-primary/10 to-sidebar/20 flex items-center justify-center relative">
                    <ShoppingBag className="size-12 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                    <Badge className="absolute top-2 right-2 text-[10px] bg-background/90 text-foreground border-border">
                      Karya WBP
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-tight">{p.judul}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{p.ringkas}</p>
                    <Button size="sm" variant="link" className="px-0 mt-2 h-auto text-xs">
                      Selengkapnya <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <TulisBeritaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function PublikasiCard({ p }: { p: { id: string; judul: string; tanggal: string; ringkas: string; jenis: string } }) {
  const iconCls = {
    "Berita": "bg-primary/10 text-primary",
    "Pengumuman": "bg-amber-500/15 text-amber-700",
    "Galeri": "bg-emerald-500/15 text-emerald-700",
    "Karya WBP": "bg-accent/20 text-accent-foreground",
  }[p.jenis] || "bg-muted text-muted-foreground";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card hover:shadow-md transition-shadow group">
      <div className="aspect-video bg-gradient-to-br from-primary/15 via-accent/15 to-sidebar/20 flex items-center justify-center">
        <FileText className="size-10 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("size-6 rounded-md flex items-center justify-center", iconCls)}>
            <Newspaper className="size-3.5" />
          </div>
          <Badge variant="outline" className="text-[10px]">{p.jenis}</Badge>
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{p.judul}</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{p.ringkas}</p>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays className="size-3" /> {p.tanggal}</span>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Baca</Button>
        </div>
      </div>
    </div>
  );
}

function TulisBeritaDialog({
  open,
  onOpenChange,
  form,
  setForm,
  saving,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: { judul: string; kategori: string; ringkasan: string; isi: string; gambar: string; status: string };
  setForm: React.Dispatch<React.SetStateAction<{ judul: string; kategori: string; ringkasan: string; isi: string; gambar: string; status: string }>>;
  saving: boolean;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tulis Berita Baru</DialogTitle>
          <DialogDescription>Berita yang diterbitkan akan tampil di halaman publik SIPADUPAS.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="berita-judul">Judul Berita *</Label>
            <Input
              id="berita-judul"
              value={form.judul}
              onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
              placeholder="Contoh: Kegiatan Pembinaan Keagamaan WBP"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.kategori} onValueChange={(v) => setForm((f) => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Terbit">Terbit</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="berita-ringkasan">Ringkasan *</Label>
            <Textarea
              id="berita-ringkasan"
              value={form.ringkasan}
              onChange={(e) => setForm((f) => ({ ...f, ringkasan: e.target.value }))}
              placeholder="Ringkasan singkat berita (tampil di kartu)"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="berita-isi">Isi Berita</Label>
            <Textarea
              id="berita-isi"
              value={form.isi}
              onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
              placeholder="Tulis isi lengkap berita di sini..."
              rows={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="berita-gambar">URL Gambar (opsional)</Label>
            <Input
              id="berita-gambar"
              value={form.gambar}
              onChange={(e) => setForm((f) => ({ ...f, gambar: e.target.value }))}
              placeholder="https://contoh.com/foto.jpg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Batal</Button>
          <Button onClick={onSubmit} disabled={saving || !form.judul.trim()}>
            {saving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
            {form.status === "Terbit" ? "Terbitkan" : "Simpan Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
