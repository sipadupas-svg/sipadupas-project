"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/views/shared";
import { cn } from "@/lib/utils";

interface PendingUser {
  id: string;
  nip: string;
  nama: string;
  email: string;
  jabatan: string | null;
  noHp: string | null;
  requestedRole: string | null;
  accountStatus: string | null;
  statusReason: string | null;
  createdAt: string;
  approvedAt: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  SECURITY_OFFICER: "Security Officer",
  COACHING_OFFICER: "Coaching Officer",
  ADMIN_LAPAS: "Admin Lapas",
};

const ROLE_COLOR: Record<string, string> = {
  SECURITY_OFFICER: "bg-blue-100 text-blue-700",
  COACHING_OFFICER: "bg-emerald-100 text-emerald-700",
  ADMIN_LAPAS: "bg-violet-100 text-violet-700",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function timeAgo(value?: string | null) {
  if (!value) return "-";
  const now = Date.now();
  const ts = new Date(value).getTime();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 60) return `${diff} dtk lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

interface PendingApprovalPanelProps {
  /** Refresh trigger (increment to refetch) */
  refreshKey?: number;
  /** Notify parent when count changes (for badges) */
  onCountChange?: (count: number) => void;
}

export function PendingApprovalPanel({
  refreshKey = 0,
  onCountChange,
}: PendingApprovalPanelProps) {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<PendingUser | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/pending", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Gagal memuat data pending");
      } else {
        setPending(data.data || []);
        onCountChange?.(data.data?.length || 0);
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending, refreshKey]);

  const openAction = (user: PendingUser, type: "approve" | "reject") => {
    setActionTarget(user);
    setActionType(type);
    setReason("");
  };

  const closeAction = () => {
    setActionTarget(null);
    setActionType(null);
    setReason("");
  };

  const handleSubmit = async () => {
    if (!actionTarget || !actionType) return;
    if (actionType === "reject" && reason.trim().length < 5) {
      setError("Alasan penolakan minimal 5 karakter");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: actionTarget.id,
          action: actionType,
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Gagal memproses permintaan");
      } else {
        closeAction();
        await fetchPending();
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard
      title="Persetujuan Akun Petugas"
      description="Daftar petugas yang mendaftar dan menunggu persetujuan Administrator."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPending}
          disabled={loading}
        >
          <RefreshCw className={cn("size-4 mr-1.5", loading && "animate-spin")} />
          Refresh
        </Button>
      }
    >
      {/* Header bar with total */}
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <UserPlus className="size-4" />
          Total pendaftar menunggu:{" "}
          <span className="font-semibold text-amber-700">{pending.length}</span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5 flex gap-2 mb-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && pending.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin mr-2" />
          Memuat data...
        </div>
      ) : pending.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <CheckCircle2 className="size-12 mx-auto text-emerald-500/40 mb-2" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Tidak ada pendaftaran yang menunggu persetujuan.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border max-h-[600px] overflow-y-auto scroll-thin">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
              <TableRow>
                <TableHead className="text-xs">Petugas</TableHead>
                <TableHead className="text-xs">Kontak</TableHead>
                <TableHead className="text-xs">Role Diminta</TableHead>
                <TableHead className="text-xs">Mendaftar</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Clock className="size-4 text-amber-700" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.nama}</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                          NIP: {u.nip}
                        </div>
                        {u.jabatan && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Briefcase className="size-3" />
                            {u.jabatan}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="size-3" />
                        <span className="truncate max-w-[180px]">{u.email}</span>
                      </div>
                      {u.noHp && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="size-3" />
                          {u.noHp}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-[10px] font-medium",
                        ROLE_COLOR[u.requestedRole || ""] ||
                          "bg-slate-100 text-slate-700"
                      )}
                    >
                      {ROLE_LABEL[u.requestedRole || ""] || u.requestedRole || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div className="font-medium">{timeAgo(u.createdAt)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAction(u, "reject")}
                        disabled={submitting}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="size-3.5 mr-1" />
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openAction(u, "approve")}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="size-3.5 mr-1" />
                        Setujui
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-2">
        <ShieldCheck className="size-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          Pendaftaran yang <span className="font-medium text-blue-900">disetujui</span> akan otomatis diberikan akses masuk sesuai role yang diminta.
          Pendaftaran yang <span className="font-medium text-red-700">ditolak</span> tidak akan dapat masuk, namun data tetap tersimpan untuk audit.
        </p>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionTarget && !!actionType} onOpenChange={(o) => !o && closeAction()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  Setujui Pendaftaran
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-red-600" />
                  Tolak Pendaftaran
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionTarget && (
                <>
                  <span className="font-medium text-foreground">{actionTarget.nama}</span>{" "}
                  (NIP: {actionTarget.nip}) —{" "}
                  {ROLE_LABEL[actionTarget.requestedRole || ""] ||
                    actionTarget.requestedRole}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2 py-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Alasan Penolakan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: NIP tidak ditemukan di database kepegawaian / Data tidak valid"
                rows={3}
                disabled={submitting}
              />
              <p className="text-[10px] text-muted-foreground">
                Alasan akan ditampilkan ke pendaftar dan tersimpan di audit log.
              </p>
            </div>
          )}

          {actionType === "approve" && (
            <div className="text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-2">
              <CalendarClock className="size-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-emerald-900">
                Setelah disetujui, petugas dapat langsung masuk ke sistem menggunakan NIP dan password yang telah didaftarkan.
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5 flex gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeAction} disabled={submitting}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className={
                actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              {actionType === "approve" ? "Setujui" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}