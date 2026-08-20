"use client";

import {
  Newspaper,
  Plus,
  CalendarDays,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { dataPublikasi } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PublikasiView() {
  const berita = dataPublikasi.filter(p => p.jenis === "Berita");
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
        action={<Button size="sm"><Plus className="size-4 mr-1" /> Tulis Berita</Button>}
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
          {/* Featured */}
          {berita[0] && (
            <div className="relative overflow-hidden rounded-xl border border-border bg-sidebar text-sidebar-foreground">
              <div className="hero-pattern absolute inset-0" />
              <div className="relative p-6 sm:p-8">
                <Badge className="bg-sidebar-primary text-sidebar-primary-foreground mb-3">Headline</Badge>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{berita[0].judul}</h2>
                <p className="mt-2 text-sidebar-foreground/80 text-sm leading-relaxed max-w-2xl">{berita[0].ringkas}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-sidebar-foreground/70">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" /> {berita[0].tanggal}
                  </span>
                  <Button size="sm" variant="outline" className="bg-sidebar/40 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    Baca Selengkapnya <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {berita.slice(1).map((p) => (
              <PublikasiCard key={p.id} p={p} />
            ))}
          </div>
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
