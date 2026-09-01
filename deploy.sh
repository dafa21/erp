#!/bin/bash

# Hentikan script jika ada error
set -e

# Port Target
TARGET_PORT=30004
DOMAIN="sim.nurhealthconnection.com"

echo "🚀 Memulai Deployment ke Port $TARGET_PORT..."

# 1. Pastikan Node.js path terdeteksi
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
elif [ -s "/usr/local/bin/node" ]; then
    export PATH="/usr/local/bin:$PATH"
fi

# 2. Pastikan PM2 terinstall
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 tidak ditemukan, menginstall secara global..."
    npm install -g pm2
fi

# 3. Install production dependencies saja (karena build sudah dilakukan di GitHub Actions)
echo "📦 Menginstall dependencies (Production)..."
npm install --production

# 4. Konfigurasi file .env
if [ ! -f .env ]; then
  echo "📝 Membuat file .env default..."
  cat <<EOT > .env
PORT=$TARGET_PORT
NODE_ENV=production
DATABASE_FILE=database.sqlite
EOT
fi

# 5. Restart server menggunakan PM2
echo "🔄 Me-restart PM2..."

# Pastikan file database bisa ditulisi, termasuk file -wal dan -shm
if [ -f database.sqlite ]; then
  chmod 666 database.sqlite || true
fi
if [ -f database.sqlite-wal ]; then
  chmod 666 database.sqlite-wal || true
fi
if [ -f database.sqlite-shm ]; then
  chmod 666 database.sqlite-shm || true
fi

# Pastikan direktori dist/ ada dari hasil SCP
if [ ! -f dist/server.cjs ]; then
  echo "❌ Error: dist/server.cjs tidak ditemukan. Transfer dari GitHub Action gagal?"
  exit 1
fi

APP_DIR=$(pwd)

# Reset PM2 processes (hapus sim-nurhealth lama untuk restart)
pm2 delete sim-nurhealth 2>/dev/null || true

# Bebaskan port target jika masih ada proses zombie yang menggunakannya
echo "🔍 Mengosongkan port $TARGET_PORT dari sisa proses sebelumnya..."
if command -v fuser &> /dev/null; then
  fuser -k ${TARGET_PORT}/tcp || true
elif command -v lsof &> /dev/null; then
  lsof -t -i:${TARGET_PORT} | xargs kill -9 || true
else
  # Cara manual jika lsof/fuser tidak ada: mencari pid menggunakan ss/netstat
  ss -ltnp 2>/dev/null | grep ":$TARGET_PORT " | awk '{print $NF}' | cut -d, -f2 | cut -d= -f2 | xargs kill -9 2>/dev/null || true
fi

# Start application menggunakan konfigurasi ecosystem
echo "🚀 Memulai aplikasi via PM2 ecosystem.config.cjs..."
pm2 start "$APP_DIR/ecosystem.config.cjs"

# Simpan konfigurasi PM2 agar auto-start saat reboot
pm2 save

echo "--------------------------------------------------------"
echo "✅ DEPLOYMENT BERHASIL!"
echo "🔗 Domain: https://$DOMAIN"
echo "--------------------------------------------------------"
echo "💡 UNTUK INSTALL SSL (HTTPS):"
echo "Jika belum ada SSL, jalankan (SEBAGAI ROOT):"
echo "1. sudo apt update"
echo "2. sudo apt install certbot python3-certbot-nginx -y"
echo "3. sudo certbot --nginx -d $DOMAIN"
echo "--------------------------------------------------------"
echo "💡 CEK STATUS:"
echo "pm2 list"
echo "pm2 logs sim-nurhealth"
echo "--------------------------------------------------------"
