// ─── SIPADUPAS — PM2 Ecosystem Config ─────────────────────────
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup   (auto-start on boot)
//   pm2 logs sipadupas
//   pm2 monit

module.exports = {
  apps: [
    {
      name: "sipadupas",
      script: ".next/standalone/server.js",
      interpreter: "bun",
      cwd: "/home/sipadupas/app",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      // Auto-restart jika crash (max 10x dalam 10 menit)
      max_restarts: 10,
      restart_delay: 5000,
      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/sipadupas/error.log",
      out_file: "/var/log/sipadupas/out.log",
      merge_logs: true,
      // Health check via PM2 Plus (opsional)
      // max_memory_restart: "500M",
    },
  ],
};
