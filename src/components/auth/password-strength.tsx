"use client";

import { cn } from "@/lib/utils";
import {
  type PasswordStrength,
  PASSWORD_STRENGTH_COLORS,
} from "@/lib/auth-schemas";
import { CheckCircle2 } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: PasswordStrength;
  label: string;
  percentage: number;
}

/**
 * Password strength meter with a colored progress bar and checklist of
 * criteria.  Shows real-time feedback as the user types the password.
 */
export function PasswordStrengthIndicator({
  password,
  strength,
  label,
  percentage,
}: PasswordStrengthIndicatorProps) {
  if (!password || password.length < 6) {
    return null;
  }

  const barColor = PASSWORD_STRENGTH_COLORS[strength] ?? "bg-slate-300";
  const criteria = [
    { met: password.length >= 6, label: "Minimal 6 karakter" },
    { met: password.length >= 8, label: "Minimal 8 karakter" },
    { met: /[A-Z]/.test(password), label: "Mengandung huruf besar" },
    { met: /[0-9]/.test(password), label: "Mengandung angka" },
    {
      met: /[^a-zA-Z0-9]/.test(password),
      label: "Mengandung simbol",
    },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength label + percentage */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium capitalize">
          Kekuatan password: <span className="text-current">{label}</span>
        </span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            barColor,
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Kekuatan password ${label}`}
        />
      </div>

      {/* Criteria checklist */}
      <div className="grid gap-1 pt-1">
        {criteria.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-1.5 text-xs"
          >
            <div
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors",
                c.met
                  ? "bg-green-100 text-green-600"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              {c.met && <CheckCircle2 className="size-3" />}
            </div>
            <span
              className={cn(
                "transition-colors",
                c.met ? "text-green-700" : "text-slate-500",
              )}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
