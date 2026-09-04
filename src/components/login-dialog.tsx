"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { useAppStore, type AuthUser } from "@/lib/store";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick?: () => void;
}

export function LoginDialog({ open, onOpenChange, onRegisterClick }: LoginDialogProps) {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useAppStore((s) => s.login);
  const setView = useAppStore((s) => s.setView);

  const handleLogin = useCallback(async () => {
    setError("");
    if (!nip.trim() || !password.trim()) {
      setError("NIP dan Password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      // Endpoint login terpadu (signed token + lockout + rate limit)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip: nip.trim(), password }),
      });
      const response = await res.json();
      if (!response.success) {
        // Dukung format error standar {error:{message}} & legacy {message}
        setError(response.error?.message || response.message || "Login gagal");
        setLoading(false);
        return;
      }
      const d = response.data;
      const authUser: AuthUser = {
        id: d.user.id,
        nama: d.user.nama ?? d.user.name,
        nip: d.user.nip,
        email: d.user.email ?? "",
        role: d.user.role,
        roleLabel: d.user.roleLabel ?? d.user.role,
        roleId: d.user.roleId ?? "",
        token: d.access_token,
      };
      login(authUser);
      setView("dashboard");
      setNip("");
      setPassword("");
      setShowPassword(false);
      setError("");
      onOpenChange(false);
    } catch {
      setError("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  }, [nip, password, login, setView, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-slate-200">
        {/* Header with institutional branding — Navy + Gold */}
        <div className="bg-[#061C2C] -mx-6 -mt-6 px-6 pt-6 pb-8 rounded-t-lg">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo SIPADUPAS"
              className="size-12 rounded-xl border border-[#C9A227]/40"
              width={48}
              height={48}
            />
            <div>
              <DialogTitle className="text-white text-lg font-semibold">
                Masuk ke SIPADUPAS
              </DialogTitle>
              <DialogDescription className="text-blue-200/80 text-sm mt-0.5">
                Lapas Kelas IIA Bontang — Kementerian Imigrasi dan Pemasyarakatan RI
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="login-nip" className="font-medium text-slate-700">
              NIP / Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="login-nip"
              placeholder="Masukkan NIP atau username"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              autoFocus
              disabled={loading}
              className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-pass" className="font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="login-pass"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                className="h-12 rounded-xl pr-10 border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}
        </div>
        <DialogFooter className="pt-2 flex-col items-center gap-2">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="size-12 rounded-full bg-[#061C2C] hover:bg-[#0B2A3D] text-white shadow-md active:scale-[0.97] transition-all ring-2 ring-[#C9A227]/30"
            size="icon"
            title="Masuk"
            aria-label="Masuk ke SIPADUPAS"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
          </Button>

          {onRegisterClick && (
            <div className="w-full pt-2 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500 mb-2">
                Belum punya akun petugas?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onRegisterClick}
                disabled={loading}
                className="w-full border-[#061C2C] text-[#061C2C] hover:bg-[#061C2C]/5 hover:text-[#0B2A3D] font-medium rounded-xl active:scale-[0.97] transition-all"
              >
                <UserPlus className="size-4 mr-2" />
                Daftar Akun Baru
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
