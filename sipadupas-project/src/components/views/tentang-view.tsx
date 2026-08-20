"use client";

import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Target,
  History,
  Users,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader, SectionCard } from "./shared";
import { tentangLapas, dashboardStats } from "@/lib/data";

export function TentangView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tentang Lapas"
        description="Profil, sejarah, visi-misi, struktur organisasi, dan informasi kontak Lapas Kelas IIA Bontang."
        badge="Publik"
        icon={Building2}
      />

      {/* Hero */}
      <Card className="overflow-hidden border-0 bg-sidebar text-sidebar-foreground hero-pattern">
        <div className="relative p-6 sm:p-8">
          <Badge className="bg-sidebar-primary text-sidebar-primary-foreground mb-3">Profil Instansi</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Lapas Kelas IIA Bontang</h2>
          <p className="mt-2 text-sidebar-foreground/80 text-sm sm:text-base leading-relaxed max-w-3xl">
            {tentangLapas.profil}
          </p>
        </div>
      </Card>

      {/* Statistik singkat */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatMini label="Kapasitas" value={tentangLapas.statistik.kapasitas} icon={Building2} />
        <StatMini label="WBP Saat Ini" value={tentangLapas.statistik.wbp} icon={Users} />
        <StatMini label="Petugas" value={tentangLapas.statistik.petugas} icon={ShieldCheck} />
        <StatMini label="Program Aktif" value={tentangLapas.statistik.programAktif} icon={GraduationCap} />
        <StatMini label="Lulusan" value={tentangLapas.statistik.lulusanPembinaan} icon={Award} />
      </div>

      {/* Visi & Misi */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title="Visi" description="Arah strategis lembaga">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Target className="size-6 text-primary mb-2" />
            <p className="text-sm leading-relaxed font-medium">{tentangLapas.visi}</p>
          </div>
        </SectionCard>
        <SectionCard title="Misi" description="Komitmen pelaksanaan">
          <ul className="space-y-2">
            {tentangLapas.misi.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{m}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Sejarah */}
      <SectionCard title="Sejarah Singkat" description="Perjalanan lembaga dari waktu ke waktu">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <History className="size-5" />
          </div>
          <p className="text-sm leading-relaxed">{tentangLapas.sejarah}</p>
        </div>
      </SectionCard>

      {/* Struktur Organisasi */}
      <SectionCard title="Struktur Organisasi" description="Pejabat utama Lapas Kelas IIA Bontang">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tentangLapas.struktur.map((s, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {s.nama.split(" ").slice(0, 2).map(n => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{s.jabatan}</div>
                  <div className="text-sm font-medium leading-tight mt-0.5">{s.nama}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Kontak */}
      <SectionCard title="Informasi Kontak" description="Hubungi kami melalui kanal resmi">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ContactInfo icon={MapPin} title="Alamat" lines={[tentangLapas.kontak.alamat]} />
          <ContactInfo icon={Phone} title="Telepon" lines={[tentangLapas.kontak.telepon]} />
          <ContactInfo icon={Mail} title="Email" lines={[tentangLapas.kontak.email]} />
          <ContactInfo icon={Clock} title="Jam Layanan" lines={[tentangLapas.kontak.jamLayanan, tentangLapas.kontak.jamKunjungan]} />
        </div>
      </SectionCard>
    </div>
  );
}

function StatMini({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold tabular-nums mt-0.5">{value}</div>
          </div>
          <Icon className="size-5 text-muted-foreground/60" />
        </div>
      </CardContent>
    </Card>
  );
}

function ContactInfo({ icon: Icon, title, lines }: { icon: typeof Phone; title: string; lines: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="size-4" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
