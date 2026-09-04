import type { Metadata } from "next";
import { AuthContainer } from "@/components/auth/auth-container";

export const metadata: Metadata = {
  title: "Daftar Akun — SIPADUPAS",
  description:
    "Buat akun SIPADUPAS baru. Pendaftaran memerlukan persetujuan administrator sebelum akun dapat digunakan.",
};

export default function RegisterPage() {
  return <AuthContainer initialMode="register" />;
}
