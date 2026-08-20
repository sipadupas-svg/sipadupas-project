"use client";

import {
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  Meh,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHeader, SectionCard, StatCard } from "./shared";
import { dataSKMSurvey, dataSKMPertanyaan, dashboardStats } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const radarAspek = [
  { aspek: "Pelayanan", nilai: 88 },
  { aspek: "Pengamanan", nilai: 92 },
  { aspek: "Pembinaan", nilai: 85 },
  { aspek: "Kunjungan", nilai: 89 },
  { aspek: "Fasilitas", nilai: 82 },
  { aspek: "Kecepatan", nilai: 86 },
];

export function SkmView() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const answered = Object.keys(answers).length;
    if (answered < dataSKMPertanyaan.length) {
      toast.error(`Masih ada ${dataSKMPertanyaan.length - answered} pertanyaan belum dijawab`);
      return;
    }
    setSubmitted(true);
    toast.success("Survei SKM terkirim!", {
      description: "Terima kasih atas penilaian Anda. SKM bulan ini: 88.4/100",
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survei Kepuasan Masyarakat (SKM)"
        description="Sampaikan penilaian Anda atas layanan Lapas Kelas IIA Bontang. Suara Anda membantu kami meningkatkan kualitas pelayanan."
        badge="Publik"
        icon={Award}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide opacity-80">SKM Bulan Ini</span>
              <Award className="size-5 opacity-80" />
            </div>
            <div className="text-4xl font-bold">{dashboardStats.skm}</div>
            <div className="text-xs opacity-80 mt-1">dari 100 · Predikat A</div>
          </CardContent>
        </Card>
        <StatCard label="Responden" value={412} icon={Users} sub="Bulan Agustus" accent="accent" />
        <StatCard label="Tren SKM" value="+4.2" icon={TrendingUp} sub="6 bulan terakhir" accent="primary" />
        <StatCard label="Predikat" value="A" icon={Star} sub="Sangat Baik" accent="warning" />
      </div>

      {/* Tren SKM */}
      <SectionCard title="Tren SKM 5 Bulan Terakhir" description="Perkembangan kepuasan masyarakat">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataSKMSurvey.filter(s => s.status !== "Draft")} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="periode" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[80, 90]} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="nilai" name="Nilai SKM" fill="var(--chart-1)" radius={[4, 4, 0, 0]}>
                {dataSKMSurvey.filter(s => s.status !== "Draft").map((_, i) => (
                  <Cell key={i} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Indeks per aspek */}
      <SectionCard title="Indeks Kinerja per Aspek" description="6 dimensi penilaian pelayanan">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {radarAspek.map((a) => (
            <div key={a.aspek} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{a.aspek}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-semibold",
                  a.nilai >= 90 ? "bg-emerald-500/15 text-emerald-700" :
                  a.nilai >= 85 ? "bg-primary/10 text-primary" :
                  "bg-amber-500/15 text-amber-700"
                )}>
                  {a.nilai}
                </span>
              </div>
              <Progress value={a.nilai} className="h-1.5" />
              <div className="text-[11px] text-muted-foreground mt-1.5">
                {a.nilai >= 90 ? "Sangat Baik" : a.nilai >= 85 ? "Baik" : "Cukup"}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Form SKM */}
      <SectionCard
        title="Isi Survei SKM"
        description="9 pertanyaan, estimasi 3 menit"
        action={submitted ? <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-600/20"><CheckCircle2 className="size-3 mr-1" /> Sudah Diisi</Badge> : undefined}
      >
        {submitted ? (
          <div className="text-center py-8">
            <div className="size-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg">Terima Kasih!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Penilaian Anda telah tercatat dan akan membantu kami meningkatkan kualitas pelayanan Lapas Bontang.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSubmitted(false); setAnswers({}); }}>
              Isi Ulang Survei
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {dataSKMPertanyaan.map((q) => (
              <div key={q.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">Q{q.no}</span>
                    <p className="text-sm font-medium leading-snug">{q.pertanyaan}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{q.kategori}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 1, label: "Sangat Tidak Puas", icon: ThumbsDown, color: "text-red-600 border-red-600/30" },
                    { val: 2, label: "Tidak Puas", icon: Meh, color: "text-amber-600 border-amber-600/30" },
                    { val: 3, label: "Puas", icon: ThumbsUp, color: "text-emerald-600 border-emerald-600/30" },
                    { val: 4, label: "Sangat Puas", icon: Star, color: "text-primary border-primary/30" },
                  ].map((opt) => {
                    const selected = answers[q.id] === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: opt.val })}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-all",
                          selected
                            ? cn(opt.color, "bg-muted/40 font-semibold")
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <opt.icon className="size-4" />
                        <span className="text-center leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-muted-foreground">
                {Object.keys(answers).length} dari {dataSKMPertanyaan.length} terjawab
              </span>
              <Button type="submit">
                <Send className="size-4 mr-1" /> Kirim Survei
              </Button>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}

// Local imports
import { Cell } from "recharts";
