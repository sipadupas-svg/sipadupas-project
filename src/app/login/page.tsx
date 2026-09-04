import type { Metadata } from "next";
import { AuthContainer } from "@/components/auth/auth-container";

export const metadata: Metadata = {
  title: "Masuk — SIPADUPAS",
  description:
    "Masuk ke SIPADUPAS — Sistem Informasi Pengamanan dan Pelayanan Terpadu Pemasyarakatan, Lapas Kelas IIA Bontang.",
};

export default function LoginPage() {
  return <AuthContainer initialMode="login" />;
}
