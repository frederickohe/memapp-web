#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/memapp-web"

cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main

npm ci
npm run build

cd /var/www/memappcaddy
docker compose restart caddy

echo "memapp-web deploy complete"
