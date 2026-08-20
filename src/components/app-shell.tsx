"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageSquareWarning,
  Info,
  GraduationCap,
  Newspaper,
  FileBarChart,
  Settings,
  Menu,
  LogIn,
  Bell,
  ChevronRight,
  Building2,
  Image as ImageIcon,
  ShoppingBag,
  Award,
  User as UserIcon,
  ChevronDown,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewKey, RoleKey } from "@/lib/data";
import { roleList, dataNotifikasi } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import { LoginDialog } from "@/components/login-dialog";

// ─── Bottom Tab Navigation (mobile) ──────────────────────────────────
type BottomTab = { key: ViewKey | "_more"; label: string; icon: typeof ShieldCheck };
const PUBLIC_BOTTOM_TABS: BottomTab[] = [
  { key: "landing", label: "Beranda", icon: ShieldCheck },
  { key: "kunjungan", label: "Kunjungan", icon: CalendarCheck },
  { key: "barangTitipan", label: "Titip", icon: Package },
  { key: "pengaduan", label: "Aduan", icon: MessageSquareWarning },
  { key: "_more", label: "Lainnya", icon: Menu },
];
const INTERNAL_BOTTOM_TABS: BottomTab[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "kunjungan", label: "Kunjungan", icon: CalendarCheck },
  { key: "wbp", label: "WBP", icon: Users },
  { key: "laporan", label: "Laporan", icon: FileBarChart },
  { key: "_more", label: "Lainnya", icon: Menu },
];

interface NavItem {
  key: ViewKey;
  label: string;
  icon: typeof ShieldCheck;
  area: "public" | "internal" | "administration";
  desc?: string;
}

const navItems: NavItem[] = [
  // Public Portal
  { key: "landing", label: "Beranda", icon: ShieldCheck, area: "public", desc: "Halaman muka SIPADUPAS" },
  { key: "berita", label: "Berita", icon: Newspaper, area: "public", desc: "Berita & informasi publik" },
  { key: "galeri", label: "Galeri", icon: ImageIcon, area: "public", desc: "Galeri kegiatan" },
  { key: "produk", label: "Produk WBP", icon: ShoppingBag, area: "public", desc: "Karya & produk WBP" },
  { key: "tentang", label: "Tentang Lapas", icon: Building2, area: "public", desc: "Profil & visi-misi" },
  { key: "skm", label: "SKM", icon: Award, area: "public", desc: "Survei kepuasan masyarakat" },
  { key: "barangTitipan", label: "Titip Barang", icon: Package, area: "public", desc: "Titip barang untuk WBP" },
  { key: "kunjungan", label: "Kunjungan Online", icon: CalendarCheck, area: "public", desc: "Daftar kunjungan online" },
  { key: "pengaduan", label: "Pengaduan", icon: MessageSquareWarning, area: "public", desc: "Sampaikan pengaduan" },
  // Internal Portal
  { key: "dashboard", label: "Dashboard Pimpinan", icon: LayoutDashboard, area: "internal", desc: "Ringkasan operasional" },
  { key: "pengamanan", label: "Pengamanan", icon: ShieldCheck, area: "internal", desc: "Monitoring WBP & regu" },
  { key: "wbp", label: "Manajemen WBP", icon: Users, area: "internal", desc: "Data WBP & mutasi" },
  { key: "kunjungan", label: "Pelayanan Kunjungan", icon: CalendarCheck, area: "internal", desc: "Booking & check-in" },
  { key: "pengaduan", label: "Pengaduan Publik", icon: MessageSquareWarning, area: "internal", desc: "Penanganan aduan" },
  { key: "informasi", label: "Layanan Informasi", icon: Info, area: "internal", desc: "PB, CB, CMB, FAQ" },
  { key: "pembinaan", label: "Pembinaan", icon: GraduationCap, area: "internal", desc: "Program & peserta" },
  { key: "publikasi", label: "Publikasi", icon: Newspaper, area: "internal", desc: "Berita & galeri" },
  { key: "laporan", label: "Dashboard & Reporting", icon: FileBarChart, area: "internal", desc: "Statistik & SKM" },
  { key: "notifikasi", label: "Notifikasi", icon: Bell, area: "internal", desc: "Pusat notifikasi" },
  { key: "keamanan", label: "Keamanan", icon: ShieldCheck, area: "internal", desc: "Monitoring keamanan sistem" },
  { key: "profil", label: "Profil", icon: UserIcon, area: "internal", desc: "Pengaturan akun" },
  { key: "barangTitipan", label: "Barang Titipan", icon: Package, area: "internal", desc: "Kelola titipan barang WBP" },
  // Administration
  { key: "admin", label: "System Administration", icon: Settings, area: "administration", desc: "User, role, audit" },
];

// ─── WITA Clock (UTC+8) ────────────────────────────────────────────
function WITAClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function tick() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wita = new Date(utc + 8 * 3600000);
      const hh = String(wita.getHours()).padStart(2, "0");
      const mm = String(wita.getMinutes()).padStart(2, "0");
      setTime(`${hh}:${mm} WITA`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground select-none">
      <Clock className="size-3.5" strokeWidth={1.75} />
      {time}
    </span>
  );
}

// ─── Main Shell ─────────────────────────────────────────────────────
interface AppShellProps {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  children: ReactNode;
}

export function AppShell({ view, setView, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // Auth state
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  // Auto-collapse on medium screens
  const mdBreakpointRef = useRef(false);
  useEffect(() => {
    function check() {
      const w = window.innerWidth;
      const isMd = w >= 768 && w < 1024;
      if (isMd && !mdBreakpointRef.current) {
        useAppStore.getState().setSidebarCollapsed(true);
      }
      mdBreakpointRef.current = isMd;
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const userRoleKey = (currentUser?.role as RoleKey) || undefined;
  const currentRole = userRoleKey
    ? roleList.find((r) => r.key === userRoleKey)
    : roleList.find((r) => r.key === "PUBLIC_USER")!;
  const allowedModules = currentRole.modules;
  const allowedItems = navItems.filter((n) => {
    if (!allowedModules.includes(n.key)) return false;
    // Public users only see public nav items
    if (!isAuthenticated && n.area !== "public") return false;
    return true;
  });

  const isPublic = navItems.find((n) => n.key === view)?.area === "public";
  const unreadCount = dataNotifikasi.filter((n) => !n.dibaca).length;

  const initials = currentUser?.nama
    ?.split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AW";

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated && !isPublic) {
      setView("landing");
    }
  }, [isAuthenticated, view, isPublic, setView]);

  function handleNav(v: ViewKey) {
    if (!allowedModules.includes(v)) {
      setView("landing");
      setMobileOpen(false);
      return;
    }
    setView(v);
    setMobileOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  const handleLogout = useCallback(() => {
    const state = useAppStore.getState();
    if (state.currentUser?.token) {
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nip: state.currentUser.nip, token: state.currentUser.token }),
      }).catch(() => {});
    }
    logout();
  }, [logout]);

  const sidebarContent = (
    <SidebarContent
      view={view}
      onNavigate={handleNav}
      items={allowedItems}
      roleLabel={currentRole.label}
      collapsed={false}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-blue-900 text-white">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-800/50 lg:hidden"
                aria-label="Buka menu"
              >
                <Menu className="size-5" strokeWidth={1.75} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] bg-blue-900 text-white p-0 border-blue-800"
            >
              <SheetTitle className="sr-only">Menu SIPADUPAS</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          {/* Desktop sidebar toggle (only internal) */}
          {!isPublic && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-white hover:bg-blue-800/50"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Perluas sidebar" : "Perkecil sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-5" strokeWidth={1.75} />
              ) : (
                <PanelLeftClose className="size-5" strokeWidth={1.75} />
              )}
            </Button>
          )}

          {/* Brand */}
          <button
            onClick={() => handleNav("landing")}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            aria-label="Beranda SIPADUPAS"
          >
            <div className="size-8 rounded-lg bg-white/15 flex items-center justify-center">
              <ShieldCheck className="size-4.5 text-white" strokeWidth={1.75} />
            </div>
            <div className="text-left leading-tight">
              <div className="font-semibold text-sm sm:text-base tracking-wide">SIPADUPAS</div>
              <div className="text-[10px] text-blue-200/70 hidden sm:block">
                Lapas Kelas IIA Bontang
              </div>
            </div>
          </button>

          {/* Right side of header */}
          <div className="ml-auto flex items-center gap-2">
            {/* WITA Clock */}
            <WITAClock />

            {/* Notification Bell (internal only) */}
            {!isPublic && (
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-blue-800/50"
                aria-label="Notifikasi"
                onClick={() => handleNav("notifikasi")}
              >
                <Bell className="size-5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 size-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* Auth: Login button or User dropdown */}
            {isPublic ? (
              <Button
                onClick={() => setLoginOpen(true)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <LogIn className="size-4 mr-1.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Masuk Sistem</span>
                <span className="sm:hidden">Masuk</span>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 border-l border-blue-800 hover:bg-blue-800/50 rounded-r-md py-1 pr-2 transition-colors">
                    <Avatar className="size-8 border-2 border-teal-500/60">
                      <AvatarFallback className="bg-blue-800 text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-right leading-tight">
                      <div className="text-sm font-medium text-white">{currentUser?.nama || "Pengguna"}</div>
                      <Badge className="bg-teal-600 text-white text-[10px] px-1.5 py-0 h-4 mt-0.5">
                        {currentRole.label}
                      </Badge>
                    </div>
                    <ChevronDown className="size-3.5 text-blue-200/60 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{currentUser?.nama || "Pengguna"}</div>
                    <div className="text-xs text-muted-foreground font-normal">{currentUser?.email || ""}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNav("profil")}>
                    <UserIcon className="size-4 mr-2" /> Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNav("notifikasi")}>
                    <Bell className="size-4 mr-2" /> Notifikasi
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-teal-600 text-white text-[10px]">{unreadCount}</Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="size-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Desktop Sidebar (auto-hide on hover) ──────────── */}
        <aside
          className={cn(
            "hidden lg:flex shrink-0 flex-col bg-blue-900 text-white border-r border-blue-800 relative",
            "transition-[width] duration-200 ease-in-out",
            isPublic
              ? sidebarHovered ? "w-[260px]" : "w-[56px]"
              : sidebarCollapsed
                ? sidebarHovered ? "w-[260px]" : "w-[72px]"
                : "w-[260px]"
          )}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Expand indicator bar (visible when collapsed) */}
          <div className={cn(
            "absolute right-0 top-1/4 bottom-1/4 w-[3px] rounded-l-full bg-teal-400/60 transition-opacity duration-300",
            (isPublic ? sidebarHovered : !sidebarCollapsed || sidebarHovered) ? "opacity-0" : "opacity-100"
          )} />
          <div className="sticky top-14 flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto scroll-thin">
            <SidebarContent
              view={view}
              onNavigate={handleNav}
              items={allowedItems}
              roleLabel={currentRole.label}
              collapsed={isPublic ? !sidebarHovered : sidebarCollapsed && !sidebarHovered}
            />
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {!isPublic && <BreadcrumbBar view={view} onNavigate={handleNav} />}
          <div className="px-5 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 lg:pb-6">{children}</div>
        </main>
      </div>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      {/* ── Mobile Bottom Tab Navigation ────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-border/60 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 safe-bottom">
          {(isPublic ? PUBLIC_BOTTOM_TABS : INTERNAL_BOTTOM_TABS).map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === "_more") {
                    setMobileOpen(true);
                  } else {
                    handleNav(tab.key as ViewKey);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors relative",
                  active
                    ? "text-teal-600"
                    : "text-slate-400 active:text-slate-700"
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.5} />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-teal-600" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Footer (hidden on mobile, replaced by bottom nav) ── */}
      <div className="hidden lg:block">
        {isPublic ? <PublicFooter /> : <InternalFooter />}
      </div>
      {/* Minimal mobile footer */}
      <footer className="lg:hidden text-center py-3 text-[10px] text-muted-foreground/60 pb-20">
        © {new Date().getFullYear()} Lapas Kelas IIA Bontang · SIPADUPAS v1.1.0
      </footer>
    </div>
  );
}

// ─── Sidebar Content ────────────────────────────────────────────────
function SidebarContent({
  view,
  onNavigate,
  items,
  roleLabel,
  collapsed,
}: {
  view: ViewKey;
  onNavigate: (v: ViewKey) => void;
  items: NavItem[];
  roleLabel: string;
  collapsed: boolean;
}) {
  const publicItems = items.filter((i) => i.area === "public");
  const internalItems = items.filter((i) => i.area === "internal");
  const adminItems = items.filter((i) => i.area === "administration");

  // CSS classes for smooth collapse/expand of text blocks
  const hide = "opacity-0 max-h-0 overflow-hidden pointer-events-none";
  const show = "opacity-100 max-h-[300px] pointer-events-auto";
  const textBlock = cn(
    "transition-all duration-200 ease-in-out",
    collapsed ? hide : show
  );

  return (
    <nav className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className={textBlock}>
        <div className="px-4 pt-5 pb-3">
          <div className="size-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <ShieldCheck className="size-5 text-white" strokeWidth={1.75} />
          </div>
          <div className="text-sm font-semibold tracking-wide">SIPADUPAS</div>
          <div className="text-[10px] text-blue-200/70 leading-snug mt-1">
            Sistem Informasi Pengamanan & Pelayanan Terpadu
          </div>
          <div className="mt-2">
            <Badge className="bg-teal-600 text-white text-[10px]">
              Lapas Kelas IIA Bontang
            </Badge>
          </div>
          <div className="mt-1.5 text-[10px] text-blue-200/60">
            Peran: <span className="font-semibold text-white">{roleLabel}</span>
          </div>
        </div>
        <Separator className="bg-blue-800" />
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto scroll-thin px-2.5 py-3 space-y-1">
        {publicItems.length > 0 && (
          <>
            <div className={cn(
              "px-2 pt-1 pb-1 text-[10px] uppercase tracking-wider text-blue-200/50 transition-all duration-200",
              collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-5"
            )}>
              Portal Publik
            </div>
            {publicItems.map((item) => (
              <SidebarNavItem
                key={item.key}
                item={item}
                active={view === item.key}
                onClick={() => onNavigate(item.key)}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
        {internalItems.length > 0 && (
          <>
            <div className={cn(
              "px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-blue-200/50 transition-all duration-200",
              collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-5"
            )}>
              Menu Utama
            </div>
            {internalItems.map((item) => (
              <SidebarNavItem
                key={item.key}
                item={item}
                active={view === item.key}
                onClick={() => onNavigate(item.key)}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
        {adminItems.length > 0 && (
          <>
            <div className={cn(
              "px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-blue-200/50 transition-all duration-200",
              collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-5"
            )}>
              Sistem
            </div>
            {adminItems.map((item) => (
              <SidebarNavItem
                key={item.key}
                item={item}
                active={view === item.key}
                onClick={() => onNavigate(item.key)}
                collapsed={collapsed}
              />
            ))}
          </>
        )}
      </div>

      {/* Sidebar footer */}
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        collapsed ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-[100px]"
      )}>
        <Separator className="bg-blue-800" />
        <div className="p-3 text-[10px] text-blue-200/60 leading-relaxed">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistem operasional
          </div>
          v1.1.0 · Build 2026.08
        </div>
      </div>
    </nav>
  );
}

// ─── Sidebar Nav Item ──────────────────────────────────────────────
function SidebarNavItem({
  item,
  active,
  onClick,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg text-sm transition-all",
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
        active
          ? "bg-blue-800/50 text-blue-200 font-medium"
          : "text-blue-200/90 hover:bg-blue-800/50 hover:text-white"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("shrink-0 transition-all", collapsed ? "size-5" : "size-4")} strokeWidth={1.75} />
      <span className={cn(
        "flex-1 text-left leading-tight whitespace-nowrap transition-all duration-200",
        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
      )}>
        {item.label}
      </span>
      <ChevronRight className={cn(
        "size-4 opacity-60 transition-all duration-200 shrink-0",
        collapsed ? "opacity-0 w-0" : active ? "opacity-60 w-4" : "opacity-0 w-0"
      )} />
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// ─── Breadcrumb Bar ─────────────────────────────────────────────────
function BreadcrumbBar({
  view,
  onNavigate,
}: {
  view: ViewKey;
  onNavigate: (v: ViewKey) => void;
}) {
  const current = navItems.find((i) => i.key === view);
  if (!current) return null;
  const areaLabel =
    current.area === "public"
      ? "Publik"
      : current.area === "internal"
        ? "Internal"
        : "Administration";

  return (
    <div className="border-b border-border/60 bg-card/40">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-sm">
        <button
          onClick={() => onNavigate("landing")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Beranda
        </button>
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="text-muted-foreground text-xs">{areaLabel}</span>
        <ChevronRight className="size-3.5 text-muted-foreground" />
        <span className="text-foreground font-medium">{current.label}</span>
        {current.desc && (
          <span className="ml-auto hidden sm:inline text-xs text-muted-foreground">
            {current.desc}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Internal Footer (minimal) ──────────────────────────────────────
function InternalFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Lapas Kelas IIA Bontang</span>
        <span className="text-muted-foreground/60">SIPADUPAS v1.1.0</span>
      </div>
    </footer>
  );
}

// ─── Public Footer (full) ───────────────────────────────────────────
function PublicFooter() {
  return (
    <footer className="mt-auto bg-blue-900 text-blue-200">
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck className="size-4.5 text-white" strokeWidth={1.75} />
              </div>
              <span className="font-semibold text-white tracking-wide">SIPADUPAS</span>
            </div>
            <p className="text-sm text-blue-200/70 leading-relaxed">
              Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan —
              Lapas Kelas IIA Bontang, Kalimantan Timur.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm text-blue-200/70">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 shrink-0" strokeWidth={1.75} />
                Jl. Brigjen Katamso No. 1, Bontang, Kalimantan Timur 75311
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" strokeWidth={1.75} />
                (0548) 222-333
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" strokeWidth={1.75} />
                lapas.bontang@kemenkumham.go.id
              </li>
            </ul>
          </div>

          {/* Map Placeholder */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Lokasi</h4>
            <div className="rounded-lg bg-blue-800/50 border border-blue-700/50 h-32 flex items-center justify-center text-blue-200/50 text-xs">
              <div className="text-center">
                <MapPin className="size-5 mx-auto mb-1" strokeWidth={1.75} />
                Peta Lokasi
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Tautan</h4>
            <ul className="space-y-2 text-sm text-blue-200/70">
              <li>
                <button className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ExternalLink className="size-3.5" strokeWidth={1.75} />
                  Kemenkumham RI
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ExternalLink className="size-3.5" strokeWidth={1.75} />
                  Ditjen PAS
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ExternalLink className="size-3.5" strokeWidth={1.75} />
                  SAKIP Kemenkumham
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <Separator className="bg-blue-800 my-6" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-blue-200/50">
          <span>© {new Date().getFullYear()} Lapas Kelas IIA Bontang — Seluruh hak cipta dilindungi.</span>
          <span>SIPADUPAS v1.1.0 · id.go.lapasbontang.sipadupas</span>
        </div>
      </div>
    </footer>
  );
}
