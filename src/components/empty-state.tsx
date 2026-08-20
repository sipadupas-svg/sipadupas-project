import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 bg-blue-900 text-white hover:bg-blue-900/90"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
