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

uid="$(id -u)"
gid="$(id -g)"
if [[ -d "$DIST_DIR" ]] && ! touch "$DIST_DIR/.write-test" 2>/dev/null; then
  echo "Resetting ownership of $DIST_DIR to ${uid}:${gid}"
  cmd="mkdir -p /web/dist && chown -R ${uid}:${gid} /web/dist"
  if docker info >/dev/null 2>&1; then
    docker run --rm -v "$REPO_DIR":/web alpine sh -c "$cmd"
  elif command -v sudo >/dev/null && sudo -n docker info >/dev/null 2>&1; then
    sudo docker run --rm -v "$REPO_DIR":/web alpine sh -c "$cmd"
  elif command -v sudo >/dev/null && sudo -n true >/dev/null 2>&1; then
    sudo chown -R "${uid}:${gid}" "$DIST_DIR"
  else
    echo "Cannot write $DIST_DIR. Add this user to the docker group or allow passwordless sudo." >&2
    exit 1
  fi
else
  rm -f "$DIST_DIR/.write-test"
fi

require_node_20
npm ci
npm run build

if ! compgen -G "$DIST_DIR/assets/"*.js > /dev/null; then
  echo "Build failed: dist/assets/*.js missing." >&2
  exit 1
fi

if [[ -f "$REPO_DIR/runtime-config.json" ]]; then
  cp "$REPO_DIR/runtime-config.json" "$DIST_DIR/config.json"
fi

cd /var/www/memappcaddy
if docker info >/dev/null 2>&1; then
  docker compose restart caddy
elif command -v sudo >/dev/null && sudo -n docker info >/dev/null 2>&1; then
  sudo docker compose restart caddy
else
  echo "Could not restart Caddy (no docker access)."
fi

echo "memapp-web deploy complete"
