"use client";

import { useCallback, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import {
  AuthBrandPanel,
  AuthBrandCompact,
} from "@/components/auth/auth-brand-panel";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "register";

interface AuthContainerProps {
  /** Which form to show first. */
  initialMode?: AuthMode;
}

/**
 * SIPADUPAS Auth Container — premium split-panel layout.
 *
 * Desktop (lg+): dark navy brand panel on the left (50%), white form card on
 * the right, with a slide transition when switching Login ↔ Register.
 * Mobile: compact brand header above the form inside a single card.
 */
export function AuthContainer({ initialMode = "login" }: AuthContainerProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [transitionKey, setTransitionKey] = useState(0);

  const switchToRegister = useCallback(() => {
    setMode("register");
    setTransitionKey((k) => k + 1);
  }, []);

  const switchToLogin = useCallback(() => {
    setMode("login");
    setTransitionKey((k) => k + 1);
  }, []);

  return (
    <div className="auth-page-wrapper relative flex min-h-screen items-center justify-center bg-[#EEF2F7] px-4 py-8 sm:px-6 sm:py-10 lg:p-10">
      {/* ── Ambient background accents ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#061C2C]/5 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-80 rounded-full bg-[#C9A227]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-[#061C2C]/5 blur-3xl" />
      </div>

      {/* ── Split card ── */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_64px_-12px_rgba(6,28,44,0.18),0_4px_16px_rgba(6,28,44,0.08)]">
        <div className="lg:grid lg:grid-cols-[1fr_1.05fr]">
          {/* Brand panel — desktop only */}
          <aside className="relative hidden overflow-hidden bg-[#061C2C] lg:block">
            <AuthBrandPanel />

            {/* Bottom tagline strip */}
            <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm">
              <p className="text-center text-xs font-medium tracking-wide text-blue-200/70">
                Lapas Kelas IIA Bontang — Pengamanan terintegrasi, pelayanan
                lebih pasti.
              </p>
            </div>
          </aside>

          {/* Form side */}
          <main className="flex flex-col justify-center bg-white px-6 py-8 sm:px-10 sm:py-10 auth-form-scroll">
            {/* Compact brand header — mobile only */}
            <div className="lg:hidden">
              <AuthBrandCompact />
            </div>

            {/* Form with slide transition between modes */}
            <div
              key={transitionKey}
              className={cn(
                "animate-slide-in-left",
                mode === "login" ? "max-w-md" : "max-w-md",
              )}
            >
              {mode === "login" ? (
                <LoginForm onSwitchToRegister={switchToRegister} />
              ) : (
                <RegisterForm onSwitchToLogin={switchToLogin} />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── Footer note ── */}
      <p className="absolute inset-x-0 bottom-4 z-10 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} SIPADUPAS — Lapas Kelas IIA Bontang
      </p>
    </div>
  );
}
