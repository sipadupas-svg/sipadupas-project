import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIPADUPAS — Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan",
  description:
    "SIPADUPAS — Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan. Lapas Kelas IIA Bontang. Pengamanan terintegrasi, pelayanan lebih pasti.",
  keywords: [
    "SIPADUPAS",
    "Lapas Bontang",
    "Pemasyarakatan",
    "Pengamanan",
    "Pelayanan Kunjungan",
    "WBP",
    "Kemenimipas",
  ],
  authors: [{ name: "Lapas Kelas IIA Bontang" }],
  applicationName: "SIPADUPAS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIPADUPAS",
  },
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "SIPADUPAS — Lapas Kelas IIA Bontang",
    description:
      "Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan. Lapas Kelas IIA Bontang.",
    siteName: "SIPADUPAS",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: "#061C2C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
