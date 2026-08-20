"use client";

import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Lock,
  Save,
  Camera,
  Bell,
  Eye,
  Clock,
  Smartphone,
  Monitor,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionCard } from "./shared";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export function ProfilView() {
  const currentUser = useAppStore((s) => s.currentUser);

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Sync store data on first render
  if (currentUser && !initialized) {
    setNama(currentUser.nama);
    setEmail(currentUser.email);
    setInitialized(true);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profil berhasil diperbarui");
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Password berhasil diubah");
  }

  const displayName = currentUser?.nama || nama || "User";
  const displayEmail = currentUser?.email || email || "-";
  const displayRole = currentUser?.roleLabel || currentUser?.role?.replace(/_/g, " ") || "-";
  const displayNip = currentUser?.nip || "-";
  const initials = displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun, keamanan, preferensi, dan aktivitas login Anda."
        badge="Akun"
        icon={UserIcon}
      />

      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-sidebar-primary" />
        <CardContent className="p-5 sm:p-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative">
              <Avatar className="size-20 border-4 border-background">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Ganti foto">
                <Camera className="size-3.5" />
              </Button>
            </div>
            <div className="flex-1 pt-2">
              <h2 className="text-lg sm:text-xl font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20">{displayRole}</Badge>
                <Badge variant="outline" className="text-[10px]">
                  <span className="size-1.5 rounded-full bg-emerald-500 mr-1" /> Aktif
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono">NIP: {displayNip}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">Informasi Profil</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="preferences">Preferensi</TabsTrigger>
          <TabsTrigger value="sessions">Sesi Aktif</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <SectionCard title="Informasi Dasar" description="Data pribadi Anda">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-8" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="jabatan">Jabatan</Label>
                  <div className="relative mt-1.5">
                    <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="jabatan" defaultValue={displayRole} className="pl-8" disabled />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="alamat" defaultValue="Bontang Utara, Kota Bontang, Kaltim" className="pl-8" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="size-4 mr-1" /> Simpan Perubahan
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SectionCard title="Ubah Password" description="Disarankan mengganti password secara berkala">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="curpwd">Password Saat Ini</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="curpwd" type="password" required className="pl-8" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newpwd">Password Baru</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="newpwd" type="password" required className="pl-8" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Minimum 8 karakter, kombinasi huruf, angka, dan simbol.</p>
                </div>
                <div>
                  <Label htmlFor="confpwd">Konfirmasi Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="confpwd" type="password" required className="pl-8" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  <Lock className="size-4 mr-1" /> Ubah Password
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Two-Factor Authentication" description="Lapisan keamanan tambahan untuk akun Anda">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                    <Smartphone className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Autentikator App</div>
                    <div className="text-xs text-muted-foreground">Aktif · Google Authenticator</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-600/20">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">SMS OTP</div>
                    <div className="text-xs text-muted-foreground">Belum diaktifkan</div>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <SectionCard title="Preferensi Notifikasi" description="Atur saluran notifikasi yang Anda inginkan">
            <div className="space-y-3">
              {[
                { label: "Notifikasi Push (in-app)", desc: "Notifikasi real-time di aplikasi", value: true },
                { label: "Notifikasi Email", desc: "Ringkasan notifikasi harian via email", value: true },
                { label: "Notifikasi SMS", desc: "Untuk peringatan prioritas tinggi", value: false },
                { label: "Reminder Jadwal Regu", desc: "Pengingat sebelum shift dimulai", value: true },
                { label: "Update Pengaduan", desc: "Notifikasi pengaduan baru & balasan", value: true },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Bell className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{p.label}</div>
                      <div className="text-xs text-muted-foreground">{p.desc}</div>
                    </div>
                  </div>
                  <Switch defaultChecked={p.value} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Tampilan" description="Personalisasi tampilan aplikasi">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Eye className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Mode Kompak</div>
                    <div className="text-xs text-muted-foreground">Tampilan lebih padat</div>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SectionCard title="Sesi & Aktivitas Login" description="Perangkat yang sedang login ke akun Anda">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <div className="size-10 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                  <Monitor className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Chrome · Windows 11</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-600/20">Perangkat Ini</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <Clock className="size-3 inline mr-1" /> Aktif sekarang
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <div className="size-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Safari · iPhone 14</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <Clock className="size-3 inline mr-1" /> Login 2 jam lalu
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-red-600">Logout</Button>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <div className="size-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Smartphone className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Chrome · Android</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <Clock className="size-3 inline mr-1" /> Login 1 hari lalu
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-red-600">Logout</Button>
              </div>
            </div>
            <Separator className="my-4" />
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <LogOut className="size-4 mr-1" /> Logout Semua Perangkat
            </Button>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
