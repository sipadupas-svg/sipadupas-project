"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, badge, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
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
}

export function StatCard({ label, value, icon: Icon, sub, trend, accent = "primary" }: StatCardProps) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    warning: "bg-amber-500/15 text-amber-700",
    danger: "bg-red-500/15 text-red-600",
  }[accent];

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
            {trend && (
              <div className={cn("text-xs mt-2 flex items-center gap-1 font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
                {trend.positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {trend.value}% dari kemarin
              </div>
            )}
          </div>
          <div className={cn("size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0", accentClass)}>
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
    <Card className={className}>
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
