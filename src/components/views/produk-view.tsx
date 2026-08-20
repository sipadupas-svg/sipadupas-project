"use client";

import {
  ShoppingBag,
  Search,
  CalendarDays,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, SectionCard } from "./shared";
import { dataProduk } from "@/lib/data";
import type { ProdukWBP } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const kategoriColor: Record<string, string> = {
  "Fashion": "bg-primary/10 text-primary border-primary/20",
  "Kerajinan Tangan": "bg-amber-500/15 text-amber-700 border-amber-600/20",
  "Pertanian": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  "Otomotif": "bg-red-500/15 text-red-600 border-red-600/20",
  "Kuliner": "bg-orange-500/15 text-orange-700 border-orange-600/20",
  "Lainnya": "bg-muted text-muted-foreground border-border",
};

const statusColor: Record<string, string> = {
  "Tersedia": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  "Pre-order": "bg-amber-500/15 text-amber-700 border-amber-600/20",
  "Habis": "bg-red-500/15 text-red-600 border-red-600/20",
};

const statusIcon: Record<string, typeof CheckCircle2> = {
  "Tersedia": CheckCircle2,
  "Pre-order": Clock,
  "Habis": XCircle,
};

export function ProdukView() {
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("all");
  const [detail, setDetail] = useState<ProdukWBP | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);

  const filtered = dataProduk.filter((p) => {
    const mq = !q || p.nama.toLowerCase().includes(q.toLowerCase()) || p.deskripsi.toLowerCase().includes(q.toLowerCase());
    const mk = kategori === "all" || p.kategori === kategori;
    return mq && mk;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produk & Karya WBP"
        description="Katalog produk hasil program pembinaan kemandirian Warga Binaan Pemasyarakatan Lapas Bontang."
        badge="Publik"
        icon={ShoppingBag}
      />

      {/* Intro card */}
      <Card className="overflow-hidden border-0 bg-sidebar text-sidebar-foreground hero-pattern">
        <div className="relative p-5 sm:p-6 flex items-center gap-4">
          <div className="size-14 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
            <GraduationCap className="size-7 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-base sm:text-lg">Dukung Kemandirian WBP</h2>
            <p className="text-sm text-sidebar-foreground/80 mt-0.5 leading-relaxed">
              Setiap pembelian produk WBP berkontribusi langsung pada program pembinaan dan kemandirian pasca bebas.
              Untuk MVP, pemesanan dilakukan via inquiry — payment gateway akan ditambahkan fase berikutnya.
            </p>
          </div>
        </div>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk…" className="pl-8" />
        </div>
        <Select value={kategori} onValueChange={setKategori}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="Fashion">Fashion</SelectItem>
            <SelectItem value="Kerajinan Tangan">Kerajinan Tangan</SelectItem>
            <SelectItem value="Pertanian">Pertanian</SelectItem>
            <SelectItem value="Otomotif">Otomotif</SelectItem>
            <SelectItem value="Kuliner">Kuliner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid produk */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const StatusIcon = statusIcon[p.ketersediaan];
          return (
            <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setDetail(p)}>
              <div className="aspect-square bg-gradient-to-br from-accent/20 via-primary/10 to-sidebar/20 flex items-center justify-center relative">
                <ShoppingBag className="size-14 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                <Badge className={cn("absolute top-2 right-2 text-[10px]", statusColor[p.ketersediaan])}>
                  <StatusIcon className="size-3 mr-1" /> {p.ketersediaan}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("text-[10px]", kategoriColor[p.kategori])}>{p.kategori}</Badge>
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">{p.nama}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{p.deskripsi}</p>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Harga</div>
                    <div className="text-sm font-semibold">{p.harga}</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Detail</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <SectionCard title="Tidak ada produk" description="Coba ubah kata kunci atau kategori">
          <p className="text-sm text-muted-foreground">Tidak ada produk yang cocok dengan filter Anda.</p>
        </SectionCard>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingBag className="size-5 text-primary" /> Detail Produk
                </DialogTitle>
                <DialogDescription>{detail.asalProgram}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="aspect-video rounded-lg bg-gradient-to-br from-accent/20 via-primary/10 to-sidebar/20 flex items-center justify-center">
                  <ShoppingBag className="size-16 text-muted-foreground/40" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn("text-[10px]", kategoriColor[detail.kategori])}>
                    <Tag className="size-3 mr-1" /> {detail.kategori}
                  </Badge>
                  <Badge className={cn("text-[10px]", statusColor[detail.ketersediaan])}>
                    {detail.ketersediaan}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{detail.nama}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{detail.deskripsi}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Harga</div>
                    <div className="text-xl font-bold">{detail.harga}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Asal Program</div>
                    <div className="text-sm font-medium">{detail.asalProgram}</div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>Tutup</Button>
                <Button onClick={() => { setOrderOpen(true); }}>
                  <ShoppingBag className="size-4 mr-1" /> Pesan Produk
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order inquiry dialog */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inquiry Pemesanan</DialogTitle>
            <DialogDescription>
              Untuk MVP, pemesanan dilakukan melalui inquiry. Tim Lapas akan menghubungi Anda untuk konfirmasi.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Inquiry terkirim!", {
                description: "Tim Lapas Bontang akan menghubungi Anda dalam 1×24 jam.",
              });
              setOrderOpen(false);
              setDetail(null);
            }}
            className="space-y-3"
          >
            <div>
              <Label htmlFor="nama">Nama Pemesan</Label>
              <Input id="nama" required placeholder="Nama lengkap" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">No. WhatsApp</Label>
                <Input id="phone" required placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <Label htmlFor="qty">Jumlah</Label>
                <Input id="qty" type="number" min="1" defaultValue="1" required />
              </div>
            </div>
            <div>
              <Label htmlFor="alamat">Alamat Pengiriman</Label>
              <Textarea id="alamat" rows={2} placeholder="Alamat lengkap pengiriman" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOrderOpen(false)}>Batal</Button>
              <Button type="submit">Kirim Inquiry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
