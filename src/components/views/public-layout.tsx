"use client";

import { useState, useCallback, type CSSProperties, type ReactNode } from "react";
import type { ViewKey } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { Footer } from "./public-homepage";
import { Header } from "@/components/ui/header-3";
import { LoginDialog } from "@/components/login-dialog";
import { RegisterDialog } from "@/components/register-dialog";

/* Public skin — Dark Navy #061C2C + Gold #C9A227 + White + Light Gray
   Menerapkan ulang token CSS global dengan mengganti custom properties
   yang diwarisi oleh seluruh elemen di bawah wrapper ini. Tidak
   memengaruhi halaman internal (tanpa kelas .public-skin). */
const PUBLIC_SKIN = {
  "--primary": "#061C2C",
  "--primary-foreground": "#FFFFFF",
  "--accent": "#C9A227",
  "--accent-foreground": "#061C2C",
  "--sidebar": "#061C2C",
  "--sidebar-foreground": "#F1F5F9",
  "--sidebar-primary": "#C9A227",
  "--sidebar-primary-foreground": "#061C2C",
  "--sidebar-accent": "#0B2A3D",
  "--sidebar-accent-foreground": "#E0C15A",
  "--sidebar-border": "#0B2A3D",
  "--sidebar-ring": "#C9A227",
  "--background": "#F7F8FA",
  "--foreground": "#17212B",
  "--muted": "#F1F5F9",
  "--muted-foreground": "#667085",
  "--card": "#FFFFFF",
  "--card-foreground": "#17212B",
  "--border": "#E2E8F0",
  "--input": "#E2E8F0",
  "--ring": "#C9A227",
} as CSSProperties;

export function PublicLayout({
  children,
}: {
  view?: ViewKey;
  children: ReactNode;
}) {
  const setView = useAppStore((s) => s.setView);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleSwitchToRegister = useCallback(() => {
    setLoginOpen(false);
    setRegisterOpen(true);
  }, []);

  const go = (v: ViewKey) => setView(v);
  const goAnchor = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="public-skin flex min-h-screen flex-col bg-white text-[#17212B]" style={PUBLIC_SKIN}>
      <style>{`
        .public-skin .hero-pattern {
          background-image:
            radial-gradient(circle at 20% 20%, rgba(201,162,39,0.16) 0, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(11,42,61,0.55) 0, transparent 50%);
        }
      `}</style>

      <Header
        onNav={go}
        onAnchor={goAnchor}
        onLogin={() => setLoginOpen(true)}
        authenticated={isAuthenticated}
        userLabel={currentUser?.nama}
        onDashboard={() => go("dashboard")}
      />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onRegisterClick={handleSwitchToRegister}
      />

      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-16 pt-10 sm:px-6 lg:px-8">
        {children}
      </main>

      <Footer go={go} goAnchor={goAnchor} />
    </div>
  );
}