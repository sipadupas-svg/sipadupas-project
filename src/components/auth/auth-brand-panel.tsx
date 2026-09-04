"use client";

import { Shield, Lock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SIPADUPAS Brand Panel — the Dark Navy side of the split auth layout.
 *
 * On desktop it occupies 50% of the card width and slides left↔right
 * during Login ↔ Register transitions. On mobile it renders as a
 * compact header above the form.
 */
export function AuthBrandPanel() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden px-8 py-10 text-center">
      {/* Abstract geometric pattern (semi-transparent Gold accents) */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Radial glow accent */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-[#C9A227]/8 blur-3xl" />
        {/* Subtle grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="sipadupas-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
              opacity="0.04"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sipadupas-grid)" />
          {/* Decorative shield shapes */}
          <Shield
            className="absolute top-12 left-6 size-12 text-[#C9A227]/15"
            strokeWidth={1.5}
          />
          <Lock
            className="absolute bottom-16 right-8 size-10 text-[#C9A227]/10"
            strokeWidth={1.5}
          />
          <Building2
            className="absolute top-1/2 left-4 size-8 text-[#C9A227]/12"
            strokeWidth={1.5}
          />
        </svg>
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <img
          src="/logo.png"
          alt="Logo SIPADUPAS"
          className="mx-auto size-20 rounded-xl bg-white/10 p-2 ring-2 ring-[#C9A227]/30"
          width={80}
          height={80}
        />
      </div>

      {/* Branding text */}
      <div className="relative z-10 max-w-xs">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          SIPADUPAS
        </h1>
        <p className="mt-2 text-sm font-medium text-[#E0C15A]">
          Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan
        </p>
      </div>

      {/* Description */}
      <p className="relative z-10 max-w-xs text-sm leading-relaxed text-blue-200/80">
        Akses layanan dan informasi pemasyarakatan secara mudah, cepat, aman,
        dan terintegrasi.
      </p>
    </div>
  );
}

/** Compact version used on mobile (above or below the form) */
export function AuthBrandCompact() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-6">
      <img
        src="/logo.png"
        alt="Logo SIPADUPAS"
        className="size-14 rounded-lg bg-white/10 p-1.5 ring-1 ring-[#C9A227]/30"
        width={56}
        height={56}
      />
      <div className="text-center">
        <h1 className="text-xl font-bold text-primary">SIPADUPAS</h1>
        <p className="text-xs text-muted-foreground">
          Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan
        </p>
        <p className="mt-0.5 text-xs italic text-[#C9A227]">
          Lapas Kelas IIA Bontang
        </p>
      </div>
    </div>
  );
}
