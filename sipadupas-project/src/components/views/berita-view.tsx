"use client";

import {
  Newspaper,
  CalendarDays,
  Clock,
  User as UserIcon,
  Search,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, SectionCard } from "./shared";
import { dataBerita } from "@/lib/data";
import { cn } from "@/lib/utils";

const kategoriColor: Record<string, string> = {
  "Kegiatan": "bg-primary/10 text-primary border-primary/20",
  "Prestasi": "bg-amber-500/15 text-amber-700 border-amber-600/20",
  "Pengumuman": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  "Sosial": "bg-accent/20 text-accent-foreground border-accent/30",
  "Lainnya": "bg-muted text-muted-foreground border-border",
};

export function BeritaView() {
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("all");

  const filtered = dataBerita.filter((b) => {
    const mq = !q || b.judul.toLowerCase().includes(q.toLowerCase()) || b.ringkas.toLowerCase().includes(q.toLowerCase());
    const mk = kategori === "all" || b.kategori === kategori;
    return mq && mk;
  });

  const headline = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Berita & Informasi"
        description="Berita resmi, kegiatan, prestasi, dan pengumuman Lapas Kelas IIA Bontang."
        badge="Publik"
        icon={Newspaper}
      />

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari berita…" className="pl-8" />
        </div>
        <Select value={kategori} onValueChange={setKategori}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="Kegiatan">Kegiatan</SelectItem>
            <SelectItem value="Prestasi">Prestasi</SelectItem>
            <SelectItem value="Pengumuman">Pengumuman</SelectItem>
            <SelectItem value="Sosial">Sosial</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Headline */}
      {headline && (
        <Card className="overflow-hidden border-0 bg-sidebar text-sidebar-foreground hero-pattern">
          <div className="grid lg:grid-cols-5">
            <div className="lg:col-span-3 p-6 sm:p-8">
              <Badge className="bg-sidebar-primary text-sidebar-primary-foreground mb-3">Headline</Badge>
              <div className="mb-2">
                <Badge className={cn("text-[10px]", kategoriColor[headline.kategori])}>{headline.kategori}</Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">{headline.judul}</h2>
              <p className="mt-2 text-sidebar-foreground/80 text-sm leading-relaxed">{headline.ringkas}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-sidebar-foreground/70 flex-wrap">
                <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {headline.tanggal}</span>
                <span className="flex items-center gap-1.5"><UserIcon className="size-3.5" /> {headline.penulis}</span>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {headline.durasiBaca}</span>
              </div>
              <Button size="sm" variant="outline" className="mt-4 bg-sidebar/40 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                Baca Selengkapnya <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
            <div className="hidden lg:flex lg:col-span-2 items-center justify-center p-8 bg-sidebar-accent/20">
              <Newspaper className="size-32 text-sidebar-foreground/30" />
            </div>
          </div>
        </Card>
      )}

      {/* Grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {filtered.length} Berita Ditemukan
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((b) => (
            <Card key={b.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-primary/15 via-accent/15 to-sidebar/20 flex items-center justify-center">
                <Newspaper className="size-12 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("text-[10px]", kategoriColor[b.kategori])}>{b.kategori}</Badge>
                  <span className="text-[11px] text-muted-foreground ml-auto">{b.durasiBaca}</span>
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{b.judul}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{b.ringkas}</p>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="size-3" /> {b.tanggal}</span>
                  <span className="flex items-center gap-1 hover:text-primary">
                    Baca <ChevronRight className="size-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <SectionCard title="Tidak ada berita" description="Coba ubah kata kunci atau kategori">
          <p className="text-sm text-muted-foreground">Tidak ada berita yang cocok dengan filter Anda.</p>
        </SectionCard>
      )}
    </div>
  );
}
