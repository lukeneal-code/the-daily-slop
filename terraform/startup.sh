#!/bin/bash
# Startup script for The Daily Slop VM
# Idempotent — safe to run on first boot and reboots

set -euo pipefail

LOG="/var/log/daily-slop-startup.log"
exec > >(tee -a "$LOG") 2>&1
echo "=== Startup script running at $(date) ==="

# -------------------------------------------------------
# 1. System packages
# -------------------------------------------------------
if ! command -v git &>/dev/null || ! command -v g++ &>/dev/null; then
  echo "Installing system packages..."
  apt-get update -y
  apt-get install -y git build-essential python3 curl
else
  echo "System packages already installed."
fi

# -------------------------------------------------------
# 2. Swap file (prevents OOM on 1GB e2-micro)
# -------------------------------------------------------
if [ ! -f /swapfile ]; then
  echo "Creating 1GB swap file..."
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
else
  if ! swapon --show | grep -q /swapfile; then
    swapon /swapfile
  fi
  echo "Swap file already exists."
fi

# -------------------------------------------------------
# 3. Node.js 20 via NodeSource
# -------------------------------------------------------
if ! command -v node &>/dev/null || ! node -v | grep -q "^v20"; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "Node.js 20 already installed: $(node -v)"
fi

# -------------------------------------------------------
# 4. Create slop system user
# -------------------------------------------------------
if ! id slop &>/dev/null; then
  echo "Creating slop user..."
  useradd --system --create-home --shell /bin/bash slop
else
  echo "User slop already exists."
fi

# -------------------------------------------------------
# 5. Clone or update the repo
# -------------------------------------------------------
APP_DIR="/opt/the-daily-slop"
REPO_URL="https://github.com/lukeneal/the-daily-slop.git"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "Updating repository..."
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
fi

chown -R slop:slop "$APP_DIR"

# -------------------------------------------------------
# 6. Write .env from Secret Manager
# -------------------------------------------------------
echo "Fetching API keys from Secret Manager..."
PROJECT_ID=$(curl -sf -H "Metadata-Flavor: Google" \
  "http://metadata.google.internal/computeMetadata/v1/instance/attributes/gcp-project-id")

ANTHROPIC_KEY=$(gcloud secrets versions access latest \
  --secret="daily-slop-anthropic-api-key" --project="$PROJECT_ID" 2>/dev/null || echo "")
OPENAI_KEY=$(gcloud secrets versions access latest \
  --secret="daily-slop-openai-api-key" --project="$PROJECT_ID" 2>/dev/null || echo "")

cat > "$APP_DIR/.env" <<ENVFILE
NODE_ENV=production
PORT=3001
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}
OPENAI_API_KEY=${OPENAI_KEY}
DATABASE_PATH=${APP_DIR}/backend/data/slop.db
ENVFILE

chmod 600 "$APP_DIR/.env"
chown slop:slop "$APP_DIR/.env"

# -------------------------------------------------------
# 7. npm install + build frontend
# -------------------------------------------------------
echo "Running npm install..."
cd "$APP_DIR"
sudo -u slop npm install

echo "Building frontend..."
sudo -u slop npm run build:frontend

# -------------------------------------------------------
# 8. Database migration
# -------------------------------------------------------
echo "Running database migration..."
mkdir -p "$APP_DIR/backend/data"
chown slop:slop "$APP_DIR/backend/data"
sudo -u slop npx tsx scripts/migrate.ts

# -------------------------------------------------------
# 9. iptables port redirect (80 → 3001)
# -------------------------------------------------------
if ! iptables -t nat -C PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3001 2>/dev/null; then
  echo "Setting up iptables redirect 80 → 3001..."
  iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3001
else
  echo "iptables redirect already configured."
fi

# Persist iptables rules across reboots
if ! command -v netfilter-persistent &>/dev/null; then
  DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
fi
netfilter-persistent save

# -------------------------------------------------------
# 10. systemd service
# -------------------------------------------------------
cat > /etc/systemd/system/daily-slop.service <<UNIT
[Unit]
Description=The Daily Slop
After=network.target

[Service]
Type=simple
User=slop
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/npx tsx backend/src/index.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/.env

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable daily-slop
systemctl restart daily-slop

echo "=== Startup script complete at $(date) ==="
