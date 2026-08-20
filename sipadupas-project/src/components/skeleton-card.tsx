import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  /** Show a footer bar skeleton */
  footer?: boolean
  /** Number of line skeletons (default 3) */
  lines?: 2 | 3
  className?: string
}

export function SkeletonCard({
  footer = false,
  lines = 3,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 space-y-3",
        className
      )}
    >
      {/* Header bar */}
      <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-4 w-1/3" />

      {/* Body lines */}
      <div className="space-y-2">
        <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-3 w-full" />
        {lines >= 2 && (
          <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-3 w-5/6" />
        )}
        {lines >= 3 && (
          <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-3 w-4/6" />
        )}
      </div>

      {/* Optional footer */}
      {footer && (
        <div className="flex justify-between pt-2">
          <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-3 w-1/4" />
          <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-8 w-20 rounded-md" />
        </div>
      )}
    </div>
  )
}
