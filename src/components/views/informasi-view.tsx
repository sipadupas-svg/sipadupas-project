"use client";

import {
  Info,
  FileText,
  Clock,
  Wallet,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, SectionCard } from "./shared";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────
interface LayananItem {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  deskripsi?: string | null;
  dasarHukum?: string | null;
  persyaratan?: string | null; // JSON or markdown
  alur?: string | null; // markdown
  estimasiWaktu?: string | null;
  faq?: string | null; // JSON array
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FAQItem {
  q: string;
  a: string;
}

const KATEGORI_TABS = [
  { key: "PB", label: "Pembebasan Bersyarat (PB)" },
  { key: "CB", label: "Cuti Bersyarat (CB)" },
  { key: "CMB", label: "Cuti Menjelang Bebas (CMB)" },
];

// ─── Main Component ─────────────────────────────────────────
export function InformasiView() {
  const [layananList, setLayananList] = useState<LayananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKategori, setActiveKategori] = useState("PB");

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const res = await fetch("/api/layanan");
        if (!res.ok) throw new Error("Gagal");
        const json = await res.json();
        setLayananList(json.data || []);
      } catch {
        toast.error("Gagal memuat data layanan");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Group by kategori
  const pbLayanan = layananList.filter((l) => l.kategori === "PB");
  const cbLayanan = layananList.filter((l) => l.kategori === "CB");
  const cmbLayanan = layananList.filter((l) => l.kategori === "CMB");
  const otherLayanan = layananList.filter((l) => !"PBCBMB".includes(l.kategori));

  // Collect all FAQs
  const allFaqs: FAQItem[] = [];
  layananList.forEach((l) => {
    if (l.faq) {
      try {
        const parsed = JSON.parse(l.faq);
        if (Array.isArray(parsed)) allFaqs.push(...parsed);
      } catch { /* ignore */ }
    }
  });

  // Current filtered list for the active category
  const filteredLayanan = layananList.filter((l) => l.kategori === activeKategori);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Informasi"
        description="Informasi lengkap layanan PB, CB, CMB, persyaratan, alur, dan FAQ untuk masyarakat."
        badge="Publik"
        icon={Info}
      />

      <Tabs defaultValue="layanan">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="layanan">Layanan PB / CB / CMB</TabsTrigger>
          <TabsTrigger value="alur">Alur Layanan</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* LAYANAN */}
        <TabsContent value="layanan" className="space-y-4">
          {/* Category filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {KATEGORI_TABS.map((tab) => {
              const count = layananList.filter((l) => l.kategori === tab.key).length;
              return (
                <Button
                  key={tab.key}
                  size="sm"
                  variant={activeKategori === tab.key ? "default" : "outline"}
                  onClick={() => setActiveKategori(tab.key)}
                >
                  {tab.label} ({count})
                </Button>
              );
            })}
            {otherLayanan.length > 0 && (
              <Button
                size="sm"
                variant={activeKategori === "Lainnya" ? "default" : "outline"}
                onClick={() => setActiveKategori("Lainnya")}
              >
                Lainnya ({otherLayanan.length})
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : filteredLayanan.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Belum ada data layanan untuk kategori {activeKategori}.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {filteredLayanan.map((l) => (
                <LayananCard key={l.id} layanan={l} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ALUR */}
        <TabsContent value="alur" className="space-y-4">
          <SectionCard
            title="Alur Layanan Pemasyarakatan"
            description="Tahapan permohonan hingga penerbitan keputusan"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { step: "01", title: "Permohonan", desc: "WBP/Keluarga mengajukan permohonan via SIPADUPAS atau Subbagian Pembinaan.", icon: FileText },
                { step: "02", title: "Verifikasi", desc: "Petugas memverifikasi dokumen & kelengkapan administrasi.", icon: ShieldCheck },
                { step: "03", title: "Risalah Tim", desc: "Tim Pemasyarakatan menyusun risalah berdasarkan kemajuan pembinaan.", icon: FileText },
                { step: "04", title: "Persetujuan", desc: "Kalapas menyetujui & menerbitkan Surat Keputusan (SK).", icon: CheckCircle2 },
                { step: "05", title: "Pelaksanaan", desc: "Pemberlakuan cuti/PB/CMB sesuai jadwal yang ditetapkan.", icon: CalendarDays },
              ].map((s) => (
                <Card key={s.step} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <s.icon className="size-4" />
                      </div>
                      <span className="text-2xl font-bold text-primary/20">{s.step}</span>
                    </div>
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SectionCard>

          {/* Show alur from DB layanan items */}
          {layananList.filter((l) => l.alur).length > 0 && (
            <SectionCard
              title="Alur Detail per Layanan"
              description="Proses lengkap dari database layanan"
            >
              <Accordion type="single" collapsible className="w-full">
                {layananList.filter((l) => l.alur).map((l) => (
                  <AccordionItem key={l.id} value={l.id}>
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Badge className="text-[10px]">{l.kategori}</Badge>
                        {l.nama}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                        {l.alur}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </SectionCard>
          )}

          <SectionCard
            title="Hal Penting yang Perlu Diketahui"
            description="Sebelum mengajukan permohonan"
          >
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Pastikan WBP telah memenuhi <strong>syarat substantif</strong> (minimal masa pidana yang dijalani).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Seluruh dokumen persyaratan harus <strong>asli atau fotokopi bermaterai</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Pengajuan dapat dilakukan <strong>online melalui SIPADUPAS</strong> atau langsung di Subbagian Pembinaan.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Seluruh layanan pemasyarakatan <strong>tidak dipungut biaya</strong>. Laporkan bila ada oknum yang meminta imbalan.</span>
              </li>
            </ul>
          </SectionCard>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          {loading ? (
            <SectionCard title="Pertanyaan yang Sering Diajukan" description="Memuat…">
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </SectionCard>
          ) : allFaqs.length > 0 ? (
            <SectionCard
              title="Pertanyaan yang Sering Diajukan"
              description="Jawaban atas pertanyaan umum masyarakat"
            >
              <Accordion type="single" collapsible className="w-full">
                {allFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      <span className="flex items-start gap-2">
                        <HelpCircle className="size-4 text-primary shrink-0 mt-0.5" />
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-6">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </SectionCard>
          ) : (
            <SectionCard
              title="Pertanyaan yang Sering Diajukan"
              description="Jawaban atas pertanyaan umum masyarakat"
            >
              <div className="text-center py-8 text-sm text-muted-foreground">
                Belum ada FAQ tersedia.
              </div>
            </SectionCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Layanan Card ───────────────────────────────────────────
function LayananCard({ layanan }: { layanan: LayananItem }) {
  const [expanded, setExpanded] = useState(false);

  // Parse persyaratan (could be JSON array or markdown)
  let persyaratanList: string[] = [];
  if (layanan.persyaratan) {
    try {
      const parsed = JSON.parse(layanan.persyaratan);
      if (Array.isArray(parsed)) {
        persyaratanList = parsed.map(String);
      }
    } catch {
      // Treat as markdown/text — split by newlines
      persyaratanList = layanan.persyaratan.split("\n").filter(Boolean);
    }
  }

  // Parse FAQ from this layanan
  let faqItems: FAQItem[] = [];
  if (layanan.faq) {
    try {
      const parsed = JSON.parse(layanan.faq);
      if (Array.isArray(parsed)) faqItems = parsed;
    } catch { /* ignore */ }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge className="text-[10px]">{layanan.kategori}</Badge>
            </div>
            <h3 className="font-semibold text-base leading-tight">{layanan.nama}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{layanan.deskripsi || "Tidak ada deskripsi."}</p>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
          <div className="flex items-start gap-2">
            <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">Estimasi</div>
              <div className="text-sm font-medium">{layanan.estimasiWaktu || "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Wallet className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-muted-foreground">Biaya</div>
              <div className="text-sm font-medium text-emerald-700">Gratis</div>
            </div>
          </div>
        </div>

        {/* Dasar Hukum */}
        {layanan.dasarHukum && (
          <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border">
            <div className="text-xs text-muted-foreground mb-1">Dasar Hukum</div>
            <div className="text-xs whitespace-pre-wrap">{layanan.dasarHukum}</div>
          </div>
        )}

        {persyaratanList.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Persyaratan Dokumen
              <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
            </button>
            {expanded && (
              <ul className="space-y-1.5">
                {persyaratanList.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Per-layanan FAQ accordion */}
        {faqItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Accordion type="single" collapsible>
              {faqItems.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-xs font-medium hover:no-underline py-2">
                    <span className="flex items-start gap-2">
                      <HelpCircle className="size-3.5 text-primary shrink-0 mt-0.5" />
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}