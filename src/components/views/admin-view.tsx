"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import {
  Settings,
  Users,
  ShieldCheck,
  ScrollText,
  Database,
  Lock,
  Plus,
  Search,
  MoreHorizontal,
  Activity,
  RotateCcw,
  Pencil,
  Trash2,
  Power,
  Download,
  Loader2,
  Save,
  X,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatCard, SectionCard } from "./shared";
import { dataPermissions as _dataPermissions, dataMasterData as _dataMasterData, dataSystemSettings as _dataSystemSettings, roleList } from "@/lib/data";
import type { RoleKey, Permission, MasterDataItem, SystemSetting } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------- API Types ----------
interface ApiUser {
  id: string;
  nip: string;
  nama: string;
  email: string;
  jabatan: string | null;
  noHp: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roleId: string;
  role: string;
  roleLabel: string;
}

interface ApiRole {
  id: string;
  name: string;
  label: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  permissions: { id: string; resource: string; action: string }[];
}

interface ApiAuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityName: string | null;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  detail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { nama: string; nip: string } | null;
}

interface ApiBackup {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

// ---------- Role label map ----------
const ROLE_LABEL_MAP: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_LAPAS: "Admin Lapas",
  SECURITY_OFFICER: "Petugas Pengamanan",
  COACHING_OFFICER: "Petugas Pembinaan",
  MANAGEMENT: "Pimpinan",
  PUBLIC_USER: "Masyarakat",
};

const ROLE_OPTIONS = ["SUPER_ADMIN", "ADMIN_LAPAS", "SECURITY_OFFICER", "COACHING_OFFICER", "MANAGEMENT"];

// ---------- Main Component ----------
export function AdminView() {
  // Users state (from API)
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [userForm, setUserForm] = useState({ nip: "", nama: "", email: "", password: "", roleId: "ADMIN_LAPAS", status: true });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: ApiUser | null }>({ open: false, user: null });
  const [userSaving, setUserSaving] = useState(false);

  // Roles state (from API)
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleDetailOpen, setRoleDetailOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);

  // Permissions state (keep from data.ts for matrix)
  const [permissions, setPermissions] = useState<Permission[]>([..._dataPermissions]);

  // Master Data state (keep from data.ts)
  const [masterData, setMasterData] = useState<MasterDataItem[]>(JSON.parse(JSON.stringify(_dataMasterData)));
  const [masterDialogOpen, setMasterDialogOpen] = useState(false);
  const [selectedMasterIdx, setSelectedMasterIdx] = useState<number | null>(null);
  const [masterItemInput, setMasterItemInput] = useState("");
  const [editingMasterItem, setEditingMasterItem] = useState<{ idx: number; val: string } | null>(null);

  // Audit state (from API)
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModuleFilter, setAuditModuleFilter] = useState("");

  // Backup state (from API)
  const [backups, setBackups] = useState<ApiBackup[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");

  // System Settings state (keep from data.ts)
  const [sysSettings, setSysSettings] = useState<SystemSetting[]>(JSON.parse(JSON.stringify(_dataSystemSettings)));

  // Hero image state
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroSaving, setHeroSaving] = useState(false);

  // Running text state
  const [rtText, setRtText] = useState("");
  const [rtActive, setRtActive] = useState(false);
  const [rtLoading, setRtLoading] = useState(true);
  const [rtSaving, setRtSaving] = useState(false);

  // ---- Fetch Users ----
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      toast.error("Gagal memuat data user");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ---- Fetch Roles ----
  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const res = await fetch("/api/admin/roles");
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) setRoles(json.data);
    } catch {
      toast.error("Gagal memuat data role");
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // ---- Fetch Audit Logs ----
  const fetchAudit = useCallback(async (page: number, moduleFilter?: string) => {
    try {
      setAuditLoading(true);
      let url = `/api/admin/audit?page=${page}&limit=20`;
      if (moduleFilter) url += `&entityName=${moduleFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) {
        setAuditLogs(json.data);
        setAuditTotal(json.pagination.total);
        setAuditTotalPages(json.pagination.totalPages);
        setAuditPage(json.pagination.page);
      }
    } catch {
      toast.error("Gagal memuat audit log");
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => { fetchAudit(1); }, [fetchAudit]);

  // ---- Fetch Backups ----
  const fetchBackups = useCallback(async () => {
    try {
      setBackupsLoading(true);
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) setBackups(json.data);
    } catch {
      toast.error("Gagal memuat data backup");
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBackups(); }, [fetchBackups]);

  // ---- Users handlers ----
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.nama.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.nip.includes(userSearch) ||
          u.id.toLowerCase().includes(userSearch.toLowerCase())
      ),
    [users, userSearch]
  );

  const openAddUser = useCallback(() => {
    setEditingUser(null);
    setUserForm({ nip: "", nama: "", email: "", password: "", roleId: "ADMIN_LAPAS", status: true });
    setUserDialogOpen(true);
  }, []);

  const openEditUser = useCallback((u: ApiUser) => {
    setEditingUser(u);
    setUserForm({ nip: u.nip, nama: u.nama, email: u.email, password: "", roleId: u.roleId, status: u.isActive });
    setUserDialogOpen(true);
  }, []);

  const saveUser = useCallback(async () => {
    if (!userForm.nama.trim() || !userForm.email.trim()) {
      toast.error("Nama dan Email wajib diisi");
      return;
    }
    try {
      setUserSaving(true);
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nip: userForm.nip,
          nama: userForm.nama,
          email: userForm.email,
          password: userForm.password || "password123",
          roleId: userForm.roleId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`User ${userForm.nama} berhasil ditambahkan`);
        setUserDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(json.message || "Gagal menambahkan user");
      }
    } catch {
      toast.error("Gagal menambahkan user");
    } finally {
      setUserSaving(false);
    }
  }, [userForm, fetchUsers]);

  const deleteUser = useCallback(() => {
    if (!deleteConfirm.user) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.user!.id));
    toast.success(`User ${deleteConfirm.user.nama} berhasil dihapus`);
    setDeleteConfirm({ open: false, user: null });
  }, [deleteConfirm.user]);

  const toggleUserStatus = useCallback((u: ApiUser) => {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: !x.isActive } : x)));
    toast.success(`Status ${u.nama} diubah menjadi ${u.isActive ? "Nonaktif" : "Aktif"}`);
  }, []);

  // ---- Roles handler ----
  const openRoleDetail = useCallback((name: string) => {
    setSelectedRoleName(name);
    setRoleDetailOpen(true);
  }, []);

  const selectedRoleData = useMemo(
    () => (selectedRoleName ? roles.find((r) => r.name === selectedRoleName) : null),
    [roles, selectedRoleName]
  );

  const selectedRolePerms = useMemo(
    () => (selectedRoleName ? permissions.filter((p) => p.roles.includes(selectedRoleName as RoleKey)) : []),
    [permissions, selectedRoleName]
  );

  // ---- Permissions toggle handler ----
  const togglePermRole = useCallback((permId: string, roleKey: RoleKey) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id !== permId) return p;
        const has = p.roles.includes(roleKey);
        return { ...p, roles: has ? p.roles.filter((r) => r !== roleKey) : [...p.roles, roleKey] };
      })
    );
  }, []);

  // ---- Master Data handlers ----
  const openMasterDialog = useCallback((idx: number) => {
    setSelectedMasterIdx(idx);
    setMasterItemInput("");
    setEditingMasterItem(null);
    setMasterDialogOpen(true);
  }, []);

  const addMasterItem = useCallback(() => {
    if (!masterItemInput.trim() || selectedMasterIdx === null) return;
    setMasterData((prev) =>
      prev.map((m, i) =>
        i === selectedMasterIdx
          ? { ...m, items: [...m.items, masterItemInput.trim()], jumlah: m.items.length + 1 }
          : m
      )
    );
    setMasterItemInput("");
    toast.success("Item berhasil ditambahkan");
  }, [masterItemInput, selectedMasterIdx]);

  const deleteMasterItem = useCallback((itemIdx: number) => {
    if (selectedMasterIdx === null) return;
    setMasterData((prev) =>
      prev.map((m, i) =>
        i === selectedMasterIdx
          ? { ...m, items: m.items.filter((_, j) => j !== itemIdx), jumlah: m.items.length - 1 }
          : m
      )
    );
    toast.success("Item berhasil dihapus");
  }, [selectedMasterIdx]);

  const startEditMasterItem = useCallback((itemIdx: number, val: string) => {
    setEditingMasterItem({ idx: itemIdx, val });
  }, []);

  const saveEditMasterItem = useCallback(() => {
    if (!editingMasterItem || selectedMasterIdx === null) return;
    setMasterData((prev) =>
      prev.map((m, i) =>
        i === selectedMasterIdx
          ? { ...m, items: m.items.map((item, j) => (j === editingMasterItem.idx ? editingMasterItem.val : item)) }
          : m
      )
    );
    setEditingMasterItem(null);
    toast.success("Item berhasil diperbarui");
  }, [editingMasterItem, selectedMasterIdx]);

  // ---- Audit handlers ----
  const filteredAudit = useMemo(
    () =>
      auditLogs.filter(
        (a) =>
          !auditSearch ||
          (a.user?.nama || "").toLowerCase().includes(auditSearch.toLowerCase()) ||
          a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
          (a.entityName || "").toLowerCase().includes(auditSearch.toLowerCase())
      ),
    [auditLogs, auditSearch]
  );

  const exportAuditCSV = useCallback(() => {
    const headers = ["Waktu", "User", "Aksi", "Entitas", "Entity ID", "IP", "User Agent", "Detail"];
    const rows = filteredAudit.map((a) => [
      a.createdAt,
      a.user?.nama || "-",
      a.action,
      a.entityName ?? "",
      a.entityId ?? "",
      a.ipAddress ?? "",
      a.userAgent ?? "",
      a.detail ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log berhasil diekspor");
  }, [filteredAudit]);

  // ---- Backup handlers ----
  const handleBackup = useCallback(async () => {
    try {
      setBackupLoading(true);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Backup berhasil dibuat");
        fetchBackups();
      } else {
        toast.error(json.message || "Gagal membuat backup");
      }
    } catch {
      toast.error("Gagal membuat backup");
    } finally {
      setBackupLoading(false);
    }
  }, [fetchBackups]);

  const handleRestore = useCallback(() => {
    if (restoreConfirmText !== "RESTORE-CONFIRM") {
      toast.error("Ketik RESTORE-CONFIRM untuk melanjutkan");
      return;
    }
    setRestoreDialog(false);
    setRestoreConfirmText("");
    toast.success("Proses restore dimulai. Data akan dikembalikan.");
  }, [restoreConfirmText]);

  // ---- System Settings handlers ----
  const updateSetting = useCallback((catIdx: number, itemIdx: number, value: string) => {
    setSysSettings((prev) =>
      prev.map((cat, ci) =>
        ci === catIdx
          ? { ...cat, items: cat.items.map((item, ii) => (ii === itemIdx ? { ...item, value } : item)) }
          : cat
      )
    );
  }, []);

  const saveSystemSettings = useCallback(() => {
    toast.success("Pengaturan sistem berhasil disimpan");
  }, []);

  // ---- Hero image handlers ----
  const fetchHero = useCallback(async () => {
    try {
      setHeroLoading(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/admin/hero", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) setHeroImage(json.data?.heroImage ?? null);
    } catch {
      toast.error("Gagal memuat foto hero");
    } finally {
      setHeroLoading(false);
    }
  }, []);

  useEffect(() => { fetchHero(); }, [fetchHero]);

  const handleHeroFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG/JPG/WebP)");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setHeroImage(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => toast.error("Gagal membaca file");
    reader.readAsDataURL(file);
  }, []);

  const saveHero = useCallback(async () => {
    if (!heroImage) {
      toast.error("Pilih foto terlebih dahulu");
      return;
    }
    try {
      setHeroSaving(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gambar: heroImage }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Gagal menyimpan foto hero");
      toast.success("Foto hero berhasil disimpan dan langsung tampil di halaman publik");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan foto hero");
    } finally {
      setHeroSaving(false);
    }
  }, [heroImage]);

  // ---- Running text handlers ----
  const fetchRunningText = useCallback(async () => {
    try {
      setRtLoading(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/admin/running-text", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) {
        setRtText(json.data?.teks ?? "");
        setRtActive(Boolean(json.data?.aktif));
      }
    } catch {
      toast.error("Gagal memuat pengaturan running text");
    } finally {
      setRtLoading(false);
    }
  }, []);

  useEffect(() => { fetchRunningText(); }, [fetchRunningText]);

  const saveRunningText = useCallback(async () => {
    if (rtActive && !rtText.trim()) {
      toast.error("Teks tidak boleh kosong jika running text diaktifkan");
      return;
    }
    try {
      setRtSaving(true);
      const token = useAppStore.getState().currentUser?.token;
      const res = await fetch("/api/admin/running-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teks: rtText.trim(), aktif: rtActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Gagal menyimpan running text");
      toast.success("Running text berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan running text");
    } finally {
      setRtSaving(false);
    }
  }, [rtText, rtActive]);

  const currentMasterItems = selectedMasterIdx !== null ? masterData[selectedMasterIdx] : null;

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + " " +
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration"
        description="Manajemen user, role, permission, audit log, backup, dan system settings SIPADUPAS."
        badge="Admin"
        icon={Settings}
        action={<Button size="sm" onClick={openAddUser}><Plus className="size-4 mr-1" /> Tambah User</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total User" value={users.length} icon={Users} sub={`${users.filter(u => u.isActive).length} aktif`} accent="primary" />
        <StatCard label="Role & Permission" value={roles.length || roleList.length} icon={ShieldCheck} sub="Peran terdaftar" accent="accent" />
        <StatCard label="Audit Log" value={auditTotal} icon={ScrollText} sub="Aktivitas tercatat" accent="warning" />
        <StatCard label="Backup" value={backups.length} icon={Database} sub="Tersimpan" accent="primary" />
      </div>

      <Tabs defaultValue="user">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="user">Users</TabsTrigger>
          <TabsTrigger value="role">Roles</TabsTrigger>
          <TabsTrigger value="permission">Permissions</TabsTrigger>
          <TabsTrigger value="master-data">Master Data</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        {/* ========== USERS TAB ========== */}
        <TabsContent value="user" className="space-y-4">
          <SectionCard
            title="Daftar Pengguna Sistem"
            description={`${users.length} user terdaftar`}
            action={
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Cari user…"
                  className="w-48 pl-8 h-9"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            }
          >
            {usersLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border max-h-[480px] overflow-y-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                    <TableRow>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">NIP</TableHead>
                      <TableHead className="text-xs">Peran</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Terakhir Login</TableHead>
                      <TableHead className="text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                          Tidak ada user yang ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {u.nama.split(" ").map(n => n[0]).slice(0, 2).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{u.nama}</div>
                              <div className="text-xs text-muted-foreground">ID: {u.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{u.nip}</TableCell>
                        <TableCell><RoleBadge label={u.roleLabel || u.role} /></TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px]",
                            u.isActive ? "bg-emerald-500/15 text-emerald-700 border-emerald-600/20" : "bg-muted text-muted-foreground"
                          )}>
                            {u.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Belum pernah"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditUser(u)}>
                                <Pencil className="size-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleUserStatus(u)}>
                                <Power className="size-4 mr-2" /> {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteConfirm({ open: true, user: u })}>
                                <Trash2 className="size-4 mr-2" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ========== ROLES TAB ========== */}
        <TabsContent value="role" className="space-y-4">
          <SectionCard
            title="Role Management"
            description={`${roles.length} role sistem dengan permission mapping`}
          >
            {rolesLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openRoleDetail(r.name)}
                    className="p-5 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow text-left w-full cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {r.name === "SUPER_ADMIN" ? <ShieldCheck className="size-5" /> :
                         r.name === "ADMIN_LAPAS" ? <Settings className="size-5" /> :
                         r.name === "SECURITY_OFFICER" ? <Lock className="size-5" /> :
                         r.name === "COACHING_OFFICER" ? <Activity className="size-5" /> :
                         r.name === "MANAGEMENT" ? <Users className="size-5" /> :
                         <Users className="size-5" />}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">{r.name}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm">{r.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{r.description || ""}</p>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">User</span>
                      <span className="font-medium">{r.userCount} user</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Permissions</span>
                      <span className="font-medium">{r.permissions.length} akses</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ========== PERMISSIONS TAB ========== */}
        <TabsContent value="permission" className="space-y-4">
          <SectionCard
            title="Permission Management"
            description="Matriks resource × action × role"
          >
            <div className="overflow-hidden rounded-lg border border-border max-h-[520px] overflow-y-auto scroll-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="text-xs">Resource</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Deskripsi</TableHead>
                    {roleList.filter((r) => r.key !== "PUBLIC_USER").map((r) => (
                      <TableHead key={r.key} className="text-xs text-center min-w-[100px]">
                        <span className="text-[10px] font-mono">{r.key.replace(/_/g, " ")}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell className="text-xs font-mono font-medium">{p.resource}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">{p.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.description}</TableCell>
                      {roleList.filter((r) => r.key !== "PUBLIC_USER").map((r) => (
                        <TableCell key={r.key} className="text-center">
                          <Switch
                            checked={p.roles.includes(r.key)}
                            onCheckedChange={() => togglePermRole(p.id, r.key)}
                            className="mx-auto"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ========== MASTER DATA TAB ========== */}
        <TabsContent value="master-data" className="space-y-4">
          <SectionCard
            title="Master Data"
            description="Kategori data master yang digunakan sistem"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterData.map((m, idx) => (
                <div key={m.kategori} className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Database className="size-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">{m.items.length} item</Badge>
                  </div>
                  <h3 className="font-semibold text-sm">{m.kategori}</h3>
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {m.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-primary/40" /> {item}
                      </div>
                    ))}
                    {m.items.length > 4 && (
                      <div className="text-[11px] text-muted-foreground italic mt-1">
                        + {m.items.length - 4} lainnya
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="w-full mt-3 h-7 text-xs" onClick={() => openMasterDialog(idx)}>Kelola</Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* ========== AUDIT LOG TAB ========== */}
        <TabsContent value="audit" className="space-y-4">
          <SectionCard
            title="Audit Log"
            description="Catatan aktivitas seluruh user dalam sistem (append-only)"
            action={
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari audit log…"
                    className="w-48 pl-8 h-9"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={exportAuditCSV}>
                  <Download className="size-4 mr-1" /> Export Log
                </Button>
              </div>
            }
          >
            {auditLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border max-h-[520px] overflow-y-auto scroll-thin">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/60 backdrop-blur z-10">
                      <TableRow>
                        <TableHead className="text-xs">Waktu</TableHead>
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Aksi</TableHead>
                        <TableHead className="text-xs">Entitas</TableHead>
                        <TableHead className="text-xs">IP / UA</TableHead>
                        <TableHead className="text-xs">Perubahan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAudit.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                            Tidak ada audit log yang ditemukan
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredAudit.map((a) => (
                        <TableRow key={a.id} className="hover:bg-muted/40">
                          <TableCell className="text-xs whitespace-nowrap font-mono">{formatDate(a.createdAt)}</TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium">{a.user?.nama || "-"}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{a.user?.nip || ""}</div>
                          </TableCell>
                          <TableCell className="text-xs">{a.action}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{a.entityName || "-"}</Badge>
                            {a.entityId && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{a.entityId.slice(0, 12)}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-mono text-muted-foreground">{a.ipAddress || "-"}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[160px]">{a.userAgent || "-"}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {a.detail ? (
                              <div className="max-w-[200px] truncate text-muted-foreground">{a.detail}</div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {auditTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Halaman {auditPage} dari {auditTotalPages} ({auditTotal} log)</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-8" disabled={auditPage <= 1} onClick={() => fetchAudit(auditPage - 1)}>
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8" disabled={auditPage >= auditTotalPages} onClick={() => fetchAudit(auditPage + 1)}>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>
        </TabsContent>

        {/* ========== BACKUP TAB ========== */}
        <TabsContent value="backup" className="space-y-4">
          <SectionCard
            title="Backup & Restore"
            description="Riwayat backup data sistem"
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setRestoreDialog(true); setRestoreConfirmText(""); }}>
                  <RotateCcw className="size-4 mr-1" /> Restore
                </Button>
                <Button size="sm" onClick={handleBackup} disabled={backupLoading}>
                  {backupLoading ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Database className="size-4 mr-1" />}
                  {backupLoading ? "Mem-backup…" : "Backup Sekarang"}
                </Button>
              </div>
            }
          >
            {backupsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border max-h-[400px] overflow-y-auto scroll-thin">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">File</TableHead>
                      <TableHead className="text-xs">Ukuran</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((b) => (
                      <TableRow key={b.id} className="hover:bg-muted/40">
                        <TableCell className="text-xs whitespace-nowrap font-mono">{formatDate(b.createdAt)}</TableCell>
                        <TableCell className="text-xs font-mono max-w-[200px] truncate">{b.fileName}</TableCell>
                        <TableCell className="text-xs">{formatFileSize(b.fileSize)}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px]",
                            b.status === "SUCCESS" && "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
                            b.status === "FAILED" && "bg-red-500/15 text-red-600 border-red-600/20",
                          )}>
                            {b.status === "SUCCESS" ? "Sukses" : b.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-600/20 text-xs text-amber-800">
              <Lock className="size-4 inline mr-1" />
              <strong>Catatan:</strong> Restore data memerlukan permission <code className="font-mono bg-muted px-1 py-0.5 rounded">backup.restore</code> yang hanya dimiliki oleh <strong>SUPER_ADMIN</strong>.
            </div>
          </SectionCard>
        </TabsContent>

        {/* ========== SYSTEM SETTINGS TAB ========== */}
        <TabsContent value="system" className="space-y-4">
          <SectionCard title="Foto Hero Website" description="Foto utama yang tampil di hero section halaman publik">
            {heroLoading ? (
              <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : heroImage ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <img src={heroImage} alt="Foto hero saat ini" className="h-44 w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground">
                <ImagePlus className="size-8" />
                <p className="text-xs">Belum ada foto hero</p>
              </div>
            )}
            <input
              ref={heroFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                handleHeroFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => heroFileRef.current?.click()}>
                <ImagePlus className="size-4 mr-1.5" /> Pilih Foto
              </Button>
              <Button size="sm" onClick={saveHero} disabled={heroSaving || !heroImage}>
                {heroSaving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Simpan Foto Hero
              </Button>
              <span className="text-[11px] text-muted-foreground">PNG/JPG/WebP · maksimal 3MB · disarankan landscape 16:9</span>
            </div>
          </SectionCard>

          <SectionCard title="Running Text Beranda" description="Teks berjalan (marquee) di halaman publik SIPADUPAS">
            {rtLoading ? (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="running-text-active" className="text-sm font-medium cursor-pointer">
                    Aktifkan Running Text
                  </Label>
                  <Switch id="running-text-active" checked={rtActive} onCheckedChange={setRtActive} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="running-text-input" className="text-xs text-muted-foreground">Isi Teks (maks. 300 karakter)</Label>
                  <Input
                    id="running-text-input"
                    value={rtText}
                    onChange={(e) => setRtText(e.target.value.slice(0, 300))}
                    placeholder="Contoh: Selamat datang di portal resmi Lapas Kelas IIA Bontang"
                    disabled={!rtActive}
                    maxLength={300}
                  />
                  <p className="text-[11px] text-muted-foreground">{rtText.length}/300 karakter</p>
                </div>
                {rtActive && rtText.trim() && (
                  <div className="overflow-hidden rounded-lg border border-[#C9A227]/30 bg-[#C9A227]/10 py-2">
                    <p className="whitespace-nowrap text-sm font-medium text-[#061C2C]">📢 {rtText}</p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={saveRunningText} disabled={rtSaving || rtLoading}>
                {rtSaving ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Save className="size-4 mr-1.5" />}
                Simpan Running Text
              </Button>
              <span className="text-[11px] text-muted-foreground">Tampil sebagai bar berjalan di atas hero beranda publik</span>
            </div>
          </SectionCard>

          <div className="grid lg:grid-cols-2 gap-4">
            {sysSettings.map((cat, catIdx) => (
              <SectionCard key={cat.kategori} title={cat.kategori} description="Konfigurasi sistem">
                <div className="space-y-3">
                  {cat.items.map((s, itemIdx) => (
                    <div key={s.key} className="flex items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0">
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={s.key} className="text-sm font-medium cursor-pointer">{s.label}</Label>
                        <div className="text-[11px] text-muted-foreground font-mono">{s.key}</div>
                      </div>
                      {s.type === "toggle" ? (
                        <Switch
                          checked={s.value === "true"}
                          onCheckedChange={(checked) => updateSetting(catIdx, itemIdx, String(checked))}
                          id={s.key}
                        />
                      ) : (
                        <Input
                          value={s.value}
                          onChange={(e) => updateSetting(catIdx, itemIdx, e.target.value)}
                          id={s.key}
                          className="w-44 h-8 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={saveSystemSettings}>
              <Save className="size-4 mr-2" /> Simpan Pengaturan
            </Button>
          </div>
          <SectionCard title="Informasi Sistem" description="Detail aplikasi SIPADUPAS">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="Nama Aplikasi" value="SIPADUPAS" />
              <InfoRow label="Slug" value="sipadupas" />
              <InfoRow label="Package Identifier" value="id.go.lapasbontang.sipadupas" mono />
              <InfoRow label="Instansi" value="Lapas Kelas IIA Bontang" />
              <InfoRow label="Versi" value="1.1.0" />
              <InfoRow label="Build" value="2026.08.18" />
              <InfoRow label="Framework" value="Next.js 16 · PWA" />
              <InfoRow label="Uptime" value="99.97%" />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ========== DIALOGS ========== */}

      {/* Add/Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Tambah User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Ubah data pengguna sistem." : "Tambahkan pengguna baru ke sistem SIPADUPAS."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-nip">NIP</Label>
              <Input
                id="user-nip"
                placeholder="Masukkan NIP"
                value={userForm.nip}
                onChange={(e) => setUserForm((f) => ({ ...f, nip: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-nama">Nama</Label>
              <Input
                id="user-nama"
                placeholder="Nama lengkap"
                value={userForm.nama}
                onChange={(e) => setUserForm((f) => ({ ...f, nama: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="email@lapasbontang.go.id"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-pass">Password</Label>
              <Input
                id="user-pass"
                type="password"
                placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Password"}
                value={userForm.password}
                onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select value={userForm.roleId} onValueChange={(v) => setUserForm((f) => ({ ...f, roleId: v }))}>
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABEL_MAP[r] || r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label htmlFor="user-status">Status Aktif</Label>
              <Switch
                id="user-status"
                checked={userForm.status}
                onCheckedChange={(checked) => setUserForm((f) => ({ ...f, status: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Batal</Button>
            <Button onClick={saveUser} disabled={userSaving}>{userSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}{editingUser ? "Simpan Perubahan" : "Tambah User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm((p) => ({ ...p, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{deleteConfirm.user?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ open: false, user: null })}>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={deleteUser}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Detail Dialog */}
      <Dialog open={roleDetailOpen} onOpenChange={setRoleDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRoleData?.label ?? "Role Detail"}
            </DialogTitle>
            <DialogDescription>
              {selectedRoleData?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-semibold mb-2">Permissions ({selectedRoleData?.permissions.length ?? 0})</h4>
              <div className="max-h-64 overflow-y-auto scroll-thin space-y-1">
                {(!selectedRoleData?.permissions || selectedRoleData.permissions.length === 0) && (
                  <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada permission khusus</p>
                )}
                {selectedRoleData?.permissions.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-md border border-border/60 bg-muted/30">
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{p.resource}.{p.action}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Master Data Management Dialog */}
      <Dialog open={masterDialogOpen} onOpenChange={setMasterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola {currentMasterItems?.kategori ?? "Master Data"}</DialogTitle>
            <DialogDescription>
              Tambah, edit, atau hapus item dalam kategori ini.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nama item baru…"
                value={masterItemInput}
                onChange={(e) => setMasterItemInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addMasterItem(); }}
                className="flex-1 h-9"
              />
              <Button size="sm" onClick={addMasterItem} disabled={!masterItemInput.trim()}>
                <Plus className="size-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="max-h-72 overflow-y-auto scroll-thin rounded-lg border border-border">
              {currentMasterItems?.items.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">Belum ada item</div>
              )}
              {currentMasterItems?.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  {editingMasterItem?.idx === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingMasterItem.val}
                        onChange={(e) => setEditingMasterItem((p) => p ? { ...p, val: e.target.value } : null)}
                        className="h-8 text-xs flex-1"
                        onKeyDown={(e) => { if (e.key === "Enter") saveEditMasterItem(); if (e.key === "Escape") setEditingMasterItem(null); }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEditMasterItem}>
                        <Check className="size-3.5 text-emerald-600" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingMasterItem(null)}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm">{item}</span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditMasterItem(idx, item)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => deleteMasterItem(idx)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMasterDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialog} onOpenChange={setRestoreDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="size-5 text-amber-600" /> Restore Data
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan mengembalikan seluruh data sistem ke titik backup terpilih.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-600/20 text-sm text-amber-800">
              <strong>Peringatan:</strong> Restore data bersifat permanen dan tidak dapat dibatalkan.
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-confirm">
                Ketik <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">RESTORE-CONFIRM</code> untuk melanjutkan
              </Label>
              <Input
                id="restore-confirm"
                placeholder="RESTORE-CONFIRM"
                value={restoreConfirmText}
                onChange={(e) => setRestoreConfirmText(e.target.value)}
                className={cn(
                  restoreConfirmText && restoreConfirmText !== "RESTORE-CONFIRM" && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRestoreDialog(false); setRestoreConfirmText(""); }}>Batal</Button>
            <Button
              variant="destructive"
              onClick={handleRestore}
              disabled={restoreConfirmText !== "RESTORE-CONFIRM"}
            >
              Restore Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Helper Components ----------
function RoleBadge({ label }: { label: string }) {
  const cls: Record<string, string> = {
    "Super Admin": "bg-primary/10 text-primary border-primary/20",
    "Admin Lapas": "bg-accent/20 text-accent-foreground border-accent/30",
    "Petugas Pengamanan": "bg-amber-500/15 text-amber-700 border-amber-600/20",
    "Petugas Pembinaan": "bg-emerald-500/15 text-emerald-700 border-emerald-600/20",
    "Pimpinan": "bg-primary/10 text-primary border-primary/20",
    "Masyarakat": "bg-muted text-muted-foreground border-border",
  };
   return <Badge className={`text-[10px] ${cls[label] ?? ""}`}>{label}</Badge>;
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}