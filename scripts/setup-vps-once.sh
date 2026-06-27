#!/usr/bin/env bash
# One-time fix when ymemberapp.com shows unstyled/basic HTML:
# the React JS/CSS bundle is missing from dist/assets.
#
# Run on the VPS as root:
#   bash /var/www/memapp-web/scripts/setup-vps-once.sh

set -euo pipefail

require_node_20() {
  local major minor
  major="$(node -p "process.versions.node.split('.')[0]")"
  minor="$(node -p "process.versions.node.split('.')[1]")"
  if (( major < 20 || (major == 20 && minor < 19) )); then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
  fi
  echo "Node $(node -v)"
}

REPO_DIR="/var/www/memapp-web"
CADDY_DIR="/var/www/memappcaddy"

require_node_20

cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main
npm ci
npm run build

if ! compgen -G "$REPO_DIR/dist/assets/"*.js > /dev/null; then
  echo "Build failed: dist/assets/*.js missing." >&2
  exit 1
fi

cd "$CADDY_DIR"
docker compose up -d
docker compose restart caddy

echo "Done. Verify:"
echo "  curl -sI https://ymemberapp.com/assets/$(basename "$REPO_DIR"/dist/assets/*.js | head -1) | grep -i content-type"
echo "  (should be application/javascript, not text/html)"
