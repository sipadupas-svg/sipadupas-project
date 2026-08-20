"use client";

import {
  ImageIcon,
  CalendarDays,
  Camera,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, SectionCard } from "./shared";
import { dataGaleri } from "@/lib/data";
import { cn } from "@/lib/utils";

const kategoriColor: Record<string, string> = {
  "Pembinaan": "bg-primary/10 text-primary border-primary/20",
  "Kegiatan": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
  "Pengamanan": "bg-red-500/15 text-red-600 border-red-600/20",
  "Pelayanan": "bg-accent/20 text-accent-foreground border-accent/30",
  "Prestasi": "bg-amber-500/15 text-amber-700 border-amber-600/20",
  "Sosial": "bg-purple-500/15 text-purple-700 border-purple-600/20",
  "Lainnya": "bg-muted text-muted-foreground border-border",
};

const kategoriList = ["Semua", "Pembinaan", "Kegiatan", "Pengamanan", "Pelayanan", "Prestasi", "Sosial"];

export function GaleriView() {
  const [kategori, setKategori] = useState("Semua");

  const filtered = kategori === "Semua" ? dataGaleri : dataGaleri.filter((g) => g.kategori === kategori);
  const totalFoto = dataGaleri.reduce((a, b) => a + b.jumlahFoto, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galeri Kegiatan"
        description="Dokumentasi visual kegiatan, pembinaan, dan prestasi Lapas Kelas IIA Bontang."
        badge="Publik"
        icon={ImageIcon}
      />

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Album</div>
            <div className="text-2xl font-bold mt-1">{dataGaleri.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Foto</div>
            <div className="text-2xl font-bold mt-1">{totalFoto}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Kategori</div>
            <div className="text-2xl font-bold mt-1">{kategoriList.length - 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter kategori */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        {kategoriList.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={kategori === k ? "default" : "outline"}
            onClick={() => setKategori(k)}
            className="h-8"
          >
            {k}
          </Button>
        ))}
      </div>

      {/* Grid galeri */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((g) => (
          <Card key={g.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
            <div className="aspect-video bg-gradient-to-br from-primary/15 via-accent/15 to-sidebar/20 flex items-center justify-center relative">
              <Camera className="size-12 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
              <Badge className="absolute top-2 right-2 text-[10px] bg-background/90 text-foreground border-border">
                <ImageIcon className="size-3 mr-1" />{g.jumlahFoto} foto
              </Badge>
              <Badge className={cn("absolute top-2 left-2 text-[10px]", kategoriColor[g.kategori])}>
                {g.kategori}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm leading-tight">{g.judul}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{g.ringkas}</p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="size-3" /> {g.tanggal}</span>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Lihat Foto <ChevronRight className="size-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <SectionCard title="Tidak ada foto" description="Coba kategori lain">
          <p className="text-sm text-muted-foreground">Belum ada dokumentasi pada kategori ini.</p>
        </SectionCard>
      )}
    </div>
  );
}
