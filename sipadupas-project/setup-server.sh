#!/usr/bin/env bash
# ─── SIPADUPAS — Server Setup Script (Ubuntu/Debian) ─────────────
# Usage: sudo bash setup-server.sh
#
# Script ini menginstall semua dependency di server FRESH.
# Jalankan sekali saja saat pertama kali setup server.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }

# ── Update System ──────────────────────────────────────────
log_info "Update system packages..."
apt update -y && apt upgrade -y
log_ok "System updated"

# ── Install Basics ─────────────────────────────────────────
log_info "Install curl, git, nginx, certbot..."
apt install -y \
  curl \
  git \
  nginx \
  certbot \
  python3-certbot-nginx \
  ufw \
  logrotate
log_ok "Basics installed"

# ── Install Bun ─────────────────────────────────────────────
if ! command -v bun &> /dev/null; then
  log_info "Install Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  log_ok "Bun installed: $(bun --version)"
else
  log_ok "Bun already installed: $(bun --version)"
fi

# ── Install PM2 ─────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  log_info "Install PM2..."
  bun x pm2 install -g
  pm2 install pm2-logrotate
  log_ok "PM2 installed"
else
  log_ok "PM2 already installed"
fi

# ── Install Docker (opsional) ───────────────────────────────
if command -v docker &> /dev/null; then
  log_ok "Docker already installed"
else
  read -p "Install Docker? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Install Docker..."
    curl -fsSL https://get.docker.com | bash
    usermod -aG docker $SUDO_USER
    log_ok "Docker installed (logout & login untuk apply group)"
  fi
fi

# ── Firewall (UFW) ─────────────────────────────────────────
log_info "Configure UFW..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
log_ok "UFW configured (SSH + HTTP/HTTPS open)"

# ── Create App User ─────────────────────────────────────────
if id sipadupas &>/dev/null; then
  log_ok "User 'sipadupas' sudah ada"
else
  log_info "Create user sipadupas..."
  adduser --disabled-password --gecos "SIPADUPAS App" sipadupas
  log_ok "User created"
fi

# ── Create Directories ──────────────────────────────────────
mkdir -p /home/sipadupas/app
mkdir -p /home/sipadupas/backups
mkdir -p /var/log/sipadupas
chown -R sipadupas:sipadupas /home/sipadupas
chown -R sipadupas:sipadupas /var/log/sipadupas
log_ok "Directories created"

# ── Summary ─────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
log_ok "Server setup selesai!"
echo ""
echo "Langkah selanjutnya:"
echo "  1. Copy project ke /home/sipadupas/app"
echo "  2. cp .env.example .env && nano .env"
echo "  3. chmod +x deploy.sh && ./deploy.sh"
echo "  4. Untuk Docker: docker compose up -d --build"
echo "  5. Untuk HTTPS: certbot --nginx -d domain.go.id"
echo "═══════════════════════════════════════════════"