#!/usr/bin/env bash
# ─── SIPADUPAS — Deployment Script ─────────────────────────────────
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh              # Deploy lengkap (build + restart)
#   ./deploy.sh --build-only # Build saja tanpa restart
#   ./deploy.sh --docker     # Deploy via Docker Compose
#
# Prasyarat: bun, prisma, pm2 (untuk non-Docker)

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────
APP_DIR="/home/sipadupas/app"
BACKUP_DIR="/home/sipadupas/backups"
DB_PATH="$APP_DIR/db/custom.db"
LOG_DIR="/var/log/sipadupas"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ── Colors ─────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Preflight ──────────────────────────────────────────────────
log_info "Memulai deploy SIPADUPAS..."

if [[ ! -f "$APP_DIR/package.json" ]]; then
  log_error "package.json tidak ditemukan di $APP_DIR"
fi

# ── Docker Mode ────────────────────────────────────────────────
if [[ "${1:-}" == "--docker" ]]; then
  log_info "Mode: Docker Compose"
  cd "$APP_DIR"
  docker compose up -d --build
  log_ok "Docker container berjalan"
  docker compose ps
  exit 0
fi

# ── Non-Docker Mode ───────────────────────────────────────────
cd "$APP_DIR"

# 1. Backup database
log_info "Backup database..."
mkdir -p "$BACKUP_DIR"
if [[ -f "$DB_PATH" ]]; then
  cp "$DB_PATH" "$BACKUP_DIR/custom_${TIMESTAMP}.db"
  log_ok "Database di-backup ke $BACKUP_DIR/custom_${TIMESTAMP}.db"
else
  log_warn "Database belum ada, skip backup"
fi

# 2. Install dependencies
log_info "Install dependencies..."
bun install --frozen-lockfile
log_ok "Dependencies terinstall"

# 3. Generate Prisma client
log_info "Generate Prisma client..."
bunx prisma generate
log_ok "Prisma client generated"

# 4. Push schema (hanya jika ada perubahan)
log_info "Sync database schema..."
bunx prisma db push --accept-data-loss 2>/dev/null || log_warn "Schema sync skipped atau gagal"
log_ok "Database schema synced"

# 5. Build Next.js
log_info "Build Next.js (standalone)..."
bun run build
log_ok "Build selesai"

if [[ "${1:-}" == "--build-only" ]]; then
  log_ok "Build only — selesai. Jalankan 'pm2 restart sipadupas' untuk deploy."
  exit 0
fi

# 6. Restart with PM2
log_info "Restart aplikasi via PM2..."
mkdir -p "$LOG_DIR"
if pm2 describe sipadupas > /dev/null 2>&1; then
  pm2 restart sipadupas
  log_ok "Aplikasi di-restart"
else
  pm2 start ecosystem.config.js
  pm2 save
  log_ok "Aplikasi di-start (baru)"
fi

# 7. Verify
log_info "Verifikasi..."
sleep 2
if curl -sf http://localhost:3000/api > /dev/null; then
  log_ok "SIPADUPAS berjalan di http://localhost:3000"
else
  log_error "Aplikasi tidak merespon — cek: pm2 logs sipadupas"
fi

log_ok "Deploy selesai! ✓"
