"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Loader2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, badge, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/10">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full ring-1 ring-primary/15">
                <Sparkles className="size-2.5" />
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  sub?: string;
  trend?: { value: number; positive?: boolean };
  accent?: "primary" | "accent" | "warning" | "danger";
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, sub, trend, accent = "primary", loading }: StatCardProps) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    warning: "bg-amber-500/15 text-amber-700",
    danger: "bg-red-500/15 text-red-600",
  }[accent];

  const accentBar = {
    primary: "from-primary/60",
    accent: "from-accent/60",
    warning: "from-amber-500/60",
    danger: "from-red-500/60",
  }[accent];

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="skeleton-pulse h-3 w-24 mb-3" />
          <div className="skeleton-pulse h-8 w-16 mb-2" />
          <div className="skeleton-pulse h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative animate-scale-in">
      {/* Accent gradient bar on top */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent", accentBar)} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 tabular-nums">
              {value}
            </div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
            {trend && (
              <div className={cn("text-xs mt-2 flex items-center gap-1 font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
                {trend.positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {trend.value}% dari kemarin
              </div>
            )}
          </div>
          <div className={cn("size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300", accentClass)}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <Card className={cn("animate-fade-in-up hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Kamera Scanner (pindai barcode/QR langsung dari kamera) ────────────────
// Dipakai bersama oleh menu Kunjungan Online & Barang Titipan.
export interface KameraScanProps {
  onDetected: (kode: string) => void;
}

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]> };

export function KameraScan({ onDetected }: KameraScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Mengaktifkan kamera…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function start() {
      // 1) Buka kamera belakang (fallback ke kamera manapun yang tersedia)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch {
        setFailed(true);
        setMessage("Tidak dapat mengakses kamera. Izinkan akses kamera di browser, atau ketik kode secara manual.");
        return;
      }

      const video = videoRef.current;
      if (!video || stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      try { await video.play(); } catch { /* autoplay guard */ }

      // 2) Pilih decoder: native BarcodeDetector bila ada, selain itu jsQR (murni JS)
      let detector: BarcodeDetectorLike | null = null;
      const NativeDetector = (window as unknown as {
        BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
      }).BarcodeDetector;

      if (NativeDetector) {
        try {
          detector = new NativeDetector({ formats: ["qr_code", "code_128", "code_39", "ean_13", "codabar"] });
        } catch { detector = null; }
      }

      if (!detector) {
        try {
          const mod = await import("jsqr");
          const jsqr = mod.default;
          detector = {
            detect: (source) => {
              const el = source as HTMLVideoElement;
              const w = el.videoWidth || 640;
              const h = el.videoHeight || 480;
              if (!w || !h) return Promise.resolve([]);
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d", { willReadFrequently: true });
              if (!ctx) return Promise.resolve([]);
              ctx.drawImage(el, 0, 0, w, h);
              const image = ctx.getImageData(0, 0, w, h);
              const found = jsqr(image.data, w, h);
              return Promise.resolve(found && found.data ? [{ rawValue: found.data }] : []);
            },
          };
        } catch {
          setFailed(true);
          setMessage("Pemindai tidak didukung browser ini. Silakan ketik kode secara manual.");
          return;
        }
      }

      setMessage("Kamera aktif — arahkan barcode/QR ke dalam kotak");

      // 3) Loop pemindaian (throttle ~130ms agar hemat CPU)
      async function tick() {
        if (stopped || !detector) return;
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
          try {
            const codes = await detector.detect(v);
            const value = codes.find((c) => c.rawValue && c.rawValue.trim())?.rawValue;
            if (value && !stopped) {
              onDetected(value.trim());
              return; // kode terbaca — hentikan loop
            }
          } catch { /* frame gagal dibaca — lanjut memindai */ }
        }
        timer = setTimeout(tick, 130);
      }
      tick();
    }

    start();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="space-y-2">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        {!failed && (
          <>
            <div className="absolute inset-x-10 inset-y-8 rounded-lg border-2 border-primary/80 pointer-events-none shadow-[0_0_0_9999px_rgba(15,23,42,0.25)]" />
            <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 text-white/70 animate-spin pointer-events-none" />
          </>
        )}
      </div>
      <p className={cn("text-xs text-center", failed ? "text-red-600" : "text-muted-foreground")}>{message}</p>
    </div>
  );
}
