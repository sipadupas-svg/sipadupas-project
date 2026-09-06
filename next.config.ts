import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" hanya untuk Docker/self-hosted (set BUILD_STANDALONE=1).
  // Jangan aktifkan saat deploy ke Vercel.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
