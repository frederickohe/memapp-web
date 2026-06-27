#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/var/www/memapp-web"
DIST_DIR="$REPO_DIR/dist"

require_node_20() {
  local major minor
  major="$(node -p "process.versions.node.split('.')[0]")"
  minor="$(node -p "process.versions.node.split('.')[1]")"
  if (( major < 20 || (major == 20 && minor < 19) )); then
    echo "Node.js 20.19+ is required (current: $(node -v))." >&2
    echo "Upgrade with:" >&2
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -" >&2
    echo "  apt install -y nodejs" >&2
    exit 1
  fi
}

cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main

require_node_20
npm ci
npm run build

if ! compgen -G "$DIST_DIR/assets/"*.js > /dev/null; then
  echo "Build failed: dist/assets/*.js missing." >&2
  exit 1
fi

cd /var/www/memappcaddy
docker compose restart caddy

echo "memapp-web deploy complete"
