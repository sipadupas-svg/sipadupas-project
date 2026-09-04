"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";

import { useAppStore, type AuthUser } from "@/lib/store";
import { loginFormSchema, type LoginFormValues } from "@/lib/auth-schemas";
import {
  saveAuthToStorage,
  clearAuthFromStorage,
  getDefaultViewForRole,
  getRoleLabel,
  getErrorMessage,
  type ApiResponse,
} from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

type FormState = "form" | "verifying";

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const setView = useAppStore((s) => s.setView);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [uiState, setUiState] = useState<FormState>("form");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const form = useForm<LoginFormValues>({
    // The schema applies `.default(false)` to `remember`, so zod's input type
    // (`remember?`) diverges from its output type. No transforms exist, so it
    // is safe to assert the resolver against the output type.
    resolver: zodResolver(loginFormSchema) as unknown as Resolver<LoginFormValues>,
    defaultValues: { nip: "", password: "", remember: false },
  });

  const { control, handleSubmit, clearErrors, formState } = form;

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
                  setServerError("");
      clearErrors();
      setUiState("form");

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nip: values.nip.trim(),
            password: values.password,
          }),
        });

        const response: ApiResponse = await res.json();

        if (!response.success) {
          const msg = getErrorMessage(response);
          setServerError(msg);
          const formEl = document.getElementById("sipadupas-login-form");
          formEl?.classList.add("animate-auth-shake");
          setTimeout(() => formEl?.classList.remove("animate-auth-shake"), 500);
          return;
        }

        const data = (response as Extract<ApiResponse, { success: true }>)
          .data as {
          access_token: string;
          refresh_token: string;
          user: {
            id: string;
            nip: string;
            name: string;
            email?: string;
            role: string;
            roleLabel?: string;
            roleId?: string | null;
          };
        };

        const authUser: AuthUser = {
          id: data.user.id,
          nama: data.user.name,
          nip: data.user.nip,
          email: data.user.email ?? "",
          role: data.user.role,
          roleLabel: data.user.roleLabel ?? getRoleLabel(data.user.role),
          roleId: data.user.roleId ?? "",
          token: data.access_token,
        };

        login(authUser);
        if (values.remember) {
          saveAuthToStorage(authUser);
        } else {
          clearAuthFromStorage();
        }

      setUiState("verifying");
      } catch {
        setServerError("Tidak dapat terhubung ke server. Coba kembali nanti.");
      }
    },
    [login, clearErrors],
  );

  // After verifying, set role-based view and redirect
  useEffect(() => {
    if (uiState === "verifying") {
      const timer = setTimeout(() => {
        const authUser = useAppStore.getState().currentUser;
        if (authUser) {
          setView(getDefaultViewForRole(authUser.role));
        }
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [uiState, router, setView]);

  // ── Verifying sub-state ──
  if (uiState === "verifying") {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#C9A227]/20 blur-xl" />
          <div className="size-16 rounded-full bg-[#061C2C] text-white flex items-center justify-center ring-4 ring-[#C9A227]/20">
            <Lock className="size-8 text-[#C9A227]" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#17212B]">
            Memverifikasi akun…
          </h3>
          <p className="mt-1 text-sm text-[#667085]">
            Anda akan dialihkan ke dashboard dalam sejenak.
          </p>
        </div>
        <Loader2 className="size-5 animate-spin text-[#061C2C]" />
      </div>
    );
  }

  // ── Form JSX return ──
  return (
    <Form {...form}>
      <form
        id="sipadupas-login-form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-5"
        noValidate
        autoComplete="off"
      >
        {/* Server error (with shake) */}
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 animate-auth-shake">
            <div className="flex gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* NIP / Email field */}
        <FormField
          control={control}
          name="nip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">
                NIP / Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoFocus
                  placeholder="Masukkan NIP atau email Anda"
                  className={cn(
                    "h-12 rounded-xl border-border bg-slate-50/50 placeholder:text-slate-400",
                    "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus",
                    !!formState.errors.nip &&
                      "border-red-500 focus:ring-red-500/30",
                  )}
                  aria-invalid={!!formState.errors.nip}
                  aria-describedby="nip-error"
                />
              </FormControl>
              <FormMessage id="nip-error" className="text-xs text-red-600" />
                        </FormItem>
          )}
        />

        {/* Password field with show/hide toggle */}
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-[#17212B]">
                Password <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    className={cn(
                      "h-12 rounded-xl border-border bg-slate-50/50 pr-12 placeholder:text-slate-400",
                      "focus:border-[#C9A227] focus:ring-[#C9A227]/30 auth-input-focus",
                      !!formState.errors.password &&
                        "border-red-500 focus:ring-red-500/30",
                    )}
                    aria-invalid={!!formState.errors.password}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-[#17212B] hover:bg-slate-100 transition-colors"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage
                id="password-error"
                className="text-xs text-red-600"
              />
            </FormItem>
          )}
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <FormField
            control={control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="remember"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={cn(
                      "border-border",
                      field.value &&
                        "border-[#061C2C] bg-[#061C2C] text-white",
                    )}
                    aria-label="Ingat saya"
                  />
                </FormControl>
                <Label
                  htmlFor="remember"
                  className="text-sm text-[#667085] cursor-pointer"
                >
                  Ingat saya
                </Label>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="link"
            className="text-sm font-medium text-[#061C2C] hover:text-[#C9A227] p-0 h-auto"
            onClick={() => router.push("/forgot-password")}
          >
            Lupa Password?
          </Button>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className={cn(
            "w-full h-12 rounded-xl bg-[#061C2C] text-white font-semibold text-sm",
            "hover:bg-[#0B2A3D] hover:shadow-[0_0_0_3px_rgba(201,162,39,0.3)]",
            "focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2",
            "auth-btn-active transition-all duration-200",
            formState.isSubmitting && "opacity-85",
          )}
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Masuk...
            </>
          ) : (
            <>
              <LogIn className="size-4 mr-2" />
              Masuk ke SIPADUPAS
            </>
          )}
        </Button>

        {/* Switch to register */}
        <div className="text-center pt-2">
          <p className="text-sm text-[#667085]">
            Belum memiliki akun?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-[#061C2C] hover:text-[#0B2A3D] underline underline-offset-2 transition-colors"
            >
              Daftar sekarang
            </button>
          </p>
        </div>
      </form>
    </Form>
  );
}

