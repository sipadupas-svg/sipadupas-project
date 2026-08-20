"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "primary"
  onConfirm: () => void
  loading?: boolean
  /** If true, requires user to type "HAPUS" to enable confirm button */
  requireConfirmation?: boolean
}

const CONFIRM_TEXT = "HAPUS"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "primary",
  onConfirm,
  loading = false,
  requireConfirmation = false,
}: ConfirmDialogProps) {
  const [confirmationInput, setConfirmationInput] = React.useState("")

  const isDanger = variant === "danger"

  const isConfirmEnabled =
    !requireConfirmation || confirmationInput === CONFIRM_TEXT

  function handleClose() {
    setConfirmationInput("")
    onOpenChange(false)
  }

  function handleConfirm() {
    if (!isConfirmEnabled || loading) return
    onConfirm()
    setConfirmationInput("")
  }

  React.useEffect(() => {
    if (!open) {
      setConfirmationInput("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isDanger && requireConfirmation && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ketik <span className="font-bold text-destructive">HAPUS</span>{" "}
              untuk konfirmasi.
            </p>
            <Input
              placeholder={CONFIRM_TEXT}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || loading}
            className={
              isDanger
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-blue-900 text-white hover:bg-blue-900/90"
            }
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
