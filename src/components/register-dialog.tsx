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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormState = "form" | "success" | "error";

export function RegisterDialog({ open, onOpenChange }: RegisterDialogProps) {
  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [noHp, setNoHp] = useState("");
  const [requestedRole, setRequestedRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<FormState>("form");

  const reset = useCallback(() => {
    setNip("");
    setNama("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setJabatan("");
    setNoHp("");
    setRequestedRole("");
    setShowPassword(false);
    setError("");
    setState("form");
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset]
  );

  const handleSubmit = useCallback(async () => {
    setError("");

    if (!nip.trim() || !nama.trim() || !email.trim() || !password) {
      setError("NIP, Nama, Email, dan Password wajib diisi");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (!requestedRole) {
      setError("Pilih role yang diminta");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nip: nip.trim(),
          nama: nama.trim(),
          email: email.trim(),
          password,
          jabatan: jabatan.trim() || undefined,
          noHp: noHp.trim() || undefined,
          requestedRole,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Pendaftaran gagal");
        setLoading(false);
        return;
      }
      setState("success");
    } catch {
      setError("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  }, [nip, nama, email, password, confirmPassword, jabatan, noHp, requestedRole]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-slate-200">
        <div className="bg-[#061C2C] -mx-6 -mt-6 px-6 pt-6 pb-6 rounded-t-lg">
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
                Pendaftaran Akun Petugas
              </DialogTitle>
              <DialogDescription className="text-blue-200/80 text-sm mt-0.5">
                SIPADUPAS — Lapas Kelas IIA Bontang
              </DialogDescription>
            </div>
          </div>
        </div>

        {state === "success" ? (
          <div className="py-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-9 text-green-600" strokeWidth={1.75} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                Pendaftaran Berhasil!
              </h3>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                Akun Anda telah terdaftar dengan status{" "}
                <span className="font-semibold text-amber-600">PENDING</span>.
                Silakan tunggu persetujuan dari Administrator untuk dapat masuk ke
                sistem.
              </p>
            </div>
            <div className="bg-[#061C2C]/5 border border-[#061C2C]/15 rounded-lg p-3 text-left text-xs text-slate-700 flex gap-2">
              <Info className="size-4 text-[#061C2C] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#061C2C]">Informasi:</p>
                <p className="mt-0.5">
                  Anda akan menerima notifikasi setelah akun disetujui. Jika belum
                  menerima konfirmasi dalam 1x24 jam, hubungi administrator.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenChange(false)}
              className="w-full bg-[#061C2C] hover:bg-[#0B2A3D] text-white"
            >
              Tutup
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
                <img src="/logo.png" alt="" className="size-4 shrink-0 mt-0.5 rounded" width={16} height={16} />
                <p>
                  Akun yang didaftarkan akan berstatus{" "}
                  <span className="font-semibold">PENDING</span> hingga
                  Administrator menyetujuinya. Hanya role Petugas (Security/Coaching
                  Officer, Admin Lapas) yang dapat mendaftar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="reg-nip" className="font-medium text-slate-700">
                    NIP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-nip"
                    placeholder="Contoh: 199001012020011001"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="reg-nama" className="font-medium text-slate-700">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-nama"
                    placeholder="Nama lengkap sesuai identitas"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="reg-email" className="font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="nama@instansi.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-jabatan" className="font-medium text-slate-700">
                    Jabatan
                  </Label>
                  <Input
                    id="reg-jabatan"
                    placeholder="Jabatan (opsional)"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-nohp" className="font-medium text-slate-700">
                    No. HP
                  </Label>
                  <Input
                    id="reg-nohp"
                    placeholder="08xxx (opsional)"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="font-medium text-slate-700">
                    Role yang Diminta <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={requestedRole}
                    onValueChange={setRequestedRole}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]">
                      <SelectValue placeholder="Pilih role yang akan diminta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECURITY_OFFICER">
                        Security Officer (Petugas Pengamanan)
                      </SelectItem>
                      <SelectItem value="COACHING_OFFICER">
                        Coaching Officer (Petugas Pembinaan)
                      </SelectItem>
                      <SelectItem value="ADMIN_LAPAS">
                        Admin Lapas
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass" className="font-medium text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pr-10 h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass2" className="font-medium text-slate-700">
                    Konfirmasi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-pass2"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl border-border bg-slate-50/50 focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227]"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5 flex gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#061C2C] hover:bg-[#0B2A3D] text-white"
              >
                {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
                {loading ? "Mengirim..." : "Daftar"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
