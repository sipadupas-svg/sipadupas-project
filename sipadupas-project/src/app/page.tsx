"use client";

import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/views/dashboard-view";
import { PengamananView } from "@/components/views/pengamanan-view";
import { KunjunganView } from "@/components/views/kunjungan-view";
import { PengaduanView } from "@/components/views/pengaduan-view";
import { InformasiView } from "@/components/views/informasi-view";
import { WbpView } from "@/components/views/wbp-view";
import { PembinaanView } from "@/components/views/pembinaan-view";
import { PublikasiView } from "@/components/views/publikasi-view";
import { LaporanView } from "@/components/views/laporan-view";
import { AdminView } from "@/components/views/admin-view";
import { LandingView } from "@/components/views/landing-view";
import { BeritaView } from "@/components/views/berita-view";
import { GaleriView } from "@/components/views/galeri-view";
import { ProdukView } from "@/components/views/produk-view";
import { TentangView } from "@/components/views/tentang-view";
import { SkmView } from "@/components/views/skm-view";
import { NotifikasiView } from "@/components/views/notifikasi-view";
import { KeamananView } from "@/components/views/keamanan-view";
import { ProfilView } from "@/components/views/profil-view";
import { BarangTitipanView } from "@/components/views/barang-titipan-view";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  function renderView() {
    switch (view) {
      // Public Portal
      case "landing":
        return <LandingView onNavigate={setView} />;
      case "berita":
        return <BeritaView />;
      case "galeri":
        return <GaleriView />;
      case "produk":
        return <ProdukView />;
      case "tentang":
        return <TentangView />;
      case "skm":
        return <SkmView />;
      // Internal Portal
      case "dashboard":
        return <DashboardView />;
      case "pengamanan":
        return <PengamananView />;
      case "wbp":
        return <WbpView />;
      case "kunjungan":
        return <KunjunganView />;
      case "pengaduan":
        return <PengaduanView />;
      case "informasi":
        return <InformasiView />;
      case "pembinaan":
        return <PembinaanView />;
      case "publikasi":
        return <PublikasiView />;
      case "laporan":
        return <LaporanView />;
      case "notifikasi":
        return <NotifikasiView />;
      case "keamanan":
        return <KeamananView />;
      case "profil":
        return <ProfilView />;
      case "barangTitipan":
        return <BarangTitipanView />;
      // Administration
      case "admin":
        return <AdminView />;
      default:
        return <LandingView onNavigate={setView} />;
    }
  }

  return (
    <AppShell view={view} setView={setView}>
      {renderView()}
    </AppShell>
  );
}
