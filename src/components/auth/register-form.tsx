"use client";

import { useState, useCallback } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

import {
  registerFormSchema,
  type RegisterFormValues,
  REGISTER_ROLE_OPTIONS,
  evaluatePasswordStrength,
  type PasswordStrength,
} from "@/lib/auth-schemas";
import { getErrorMessage, type ApiResponse } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

type FormState = "form" | "success";

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [uiState, setUiState] = useState<FormState>("form");

  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema) as unknown as Resolver<RegisterFormValues>,
    defaultValues: {
      nip: "",
      nama: "",
      email: "",
      noHp: "",
      jabatan: "",
      password: "",
      confirmPassword: "",
      requestedRole: undefined,
    },
  });

  const { control, handleSubmit, formState } = form;
  const passwordValue = useWatch({ control, name: "password" });
  const strengthResult = evaluatePasswordStrength(passwordValue || "");

  const onSubmit = useCallback(
    async (values: RegisterFormValues) => {
      setServerError("");
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nip: values.nip.trim(),
            nama: values.nama.trim(),
            email: values.email.trim(),
            password: values.password,
            jabatan: values.jabatan?.trim() || undefined,
            noHp: values.noHp?.trim() || undefined,
            requestedRole: values.requestedRole,
          }),
        });

        const response: ApiResponse = await res.json();
        if (!response.success) {
          const msg = getErrorMessage(response);
          setServerError(msg);
          toast({ title: "Pendaftaran Gagal", description: msg, variant: "destructive" });
          return;
        }
        setUiState("success");
      } catch {
        setServerError("Tidak dapat terhubung ke server. Coba kembali nanti.");
      }
    },
    [toast],
  );

  if (uiState === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#C9A227]/10 blur-xl" />
          <div className="size-16 rounded-full bg-white text-[#061C2C] flex items-center justify-center ring-4 ring-[#C9A227]/20">
            <CheckCircle2 className="size-9 animate-check-bounce text-[#C9A227]" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#061C2C]">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-[#667085] leading-relaxed">
          Akun Anda telah terdaftar. Akun akan diaktifkan setelah disetujui oleh administrator.
        </p>
        <Button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full h-12 rounded-xl bg-[#061C2C] text-white font-semibold text-sm hover:bg-[#0B2A3D] auth-btn-active transition-all"
        >
          Kembali ke Login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form id="sipadupas-register-form" onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4" noValidate autoComplete="off">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
            <div className="flex gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          </div>
        )}
        <FormField
          control={control}
          name="nip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">NIP <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="Masukkan NIP" className={cn("h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus", !!formState.errors.nip && "border-red-500 focus:ring-red-500/30")} />
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">Nama Lengkap <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder="Masukkan nama lengkap" className={cn("h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus")} />
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="nama@contoh.com" className={cn("h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus")} />
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="noHp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">No HP</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Masukkan nomor HP" className={cn("h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus")} />
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="jabatan"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">Jabatan</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Masukkan jabatan" className={cn("h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus")} />
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showPassword ? "text" : "password"} placeholder="Masukkan password" className={cn("h-12 rounded-xl border-border bg-slate-50/50 pr-12 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus", !!formState.errors.password && "border-red-500 focus:ring-red-500/30")} />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-[#17212B] hover:bg-slate-100 transition-colors" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword}>
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage id="password-error" className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">Konfirmasi Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Ulangi password" className={cn("h-12 rounded-xl border-border bg-slate-50/50 pr-12 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus", !!formState.errors.confirmPassword && "border-red-500 focus:ring-red-500/30")} />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-[#17212B] hover:bg-slate-100 transition-colors" aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showConfirm}>
                    {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        {passwordValue && (
          <PasswordStrengthIndicator password={passwordValue} strength={strengthResult.strength} label={strengthResult.label} percentage={strengthResult.percentage} />
        )}
        <FormField
          control={control}
          name="requestedRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">Peran <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-label="Pilih peran" className={cn("h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400", "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus")} />
                  <SelectContent>
                    {REGISTER_ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={formState.isSubmitting} className={cn("w-full h-12 rounded-xl bg-[#061C2C] text-white font-semibold text-sm", "hover:bg-[#0B2A3D] hover:shadow-[0_0_0_3px_rgba(201,162,39,0.3)]", "focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2", "auth-btn-active transition-all duration-200", formState.isSubmitting && "opacity-85")}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Mendaftar...
            </>
          ) : (
            <>
              <UserPlus className="size-4 mr-2" />
              Buat Akun
            </>
          )}
        </Button>
        <div className="text-center pt-2">
          <p className="text-sm text-[#667085]">
            Sudah memiliki akun?{" "}
            <button type="button" onClick={onSwitchToLogin} className="font-medium text-[#061C2C] hover:text-[#0B2A3D] underline underline-offset-2 transition-colors">
              Masuk ke SIPADUPAS
            </button>
          </p>
        </div>
      </form>
    </Form>
  );
}