"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { useAppStore, type AuthUser } from "@/lib/store";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
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
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip: nip.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login gagal");
        setLoading(false);
        return;
      }
      const authUser: AuthUser = {
        id: data.user.id,
        nama: data.user.nama,
        nip: data.user.nip,
        email: data.user.email,
        role: data.user.role,
        roleLabel: data.user.roleLabel || data.user.role,
        roleId: data.user.roleId,
        token: data.token,
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
        {/* Header with institutional branding */}
        <div className="bg-blue-900 -mx-6 -mt-6 px-6 pt-6 pb-8 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <ShieldCheck className="size-6 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-semibold">
                Masuk ke SIPADUPAS
              </DialogTitle>
              <DialogDescription className="text-blue-200 text-sm mt-0.5">
                Lapas Kelas IIA Bontang — Kementerian Hukum dan HAM RI
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
              className="border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                className="pr-10 border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
        <DialogFooter className="pt-2">
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg active:scale-[0.97] transition-all"
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
