import { cn } from "@/lib/utils"

type StatusColor = "green" | "red" | "amber" | "blue" | "slate"

const STATUS_MAP: Record<string, StatusColor> = {
  // Green – positive / completed
  aktif: "green",
  disetujui: "green",
  selesai: "green",
  confirmed: "green",
  hadir: "green",
  approved: "green",
  // Red – negative / rejected
  ditolak: "red",
  rejected: "red",
  "tidak hadir": "red",
  danger: "red",
  closed: "red",
  // Amber – in-progress / waiting
  menunggu: "amber",
  diproses: "amber",
  "in progress": "amber",
  pending: "amber",
  open: "amber",
  // Blue – informational
  "check-in": "blue",
  "rawat inap": "blue",
  "kerja luar": "blue",
}

const COLOR_CLASSES: Record<StatusColor, string> = {
  green:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  slate:
    "bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-400",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.trim().toLowerCase()
  const color = STATUS_MAP[normalized] ?? "slate"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        COLOR_CLASSES[color],
        className
      )}
    >
      {status}
    </span>
  )
}
