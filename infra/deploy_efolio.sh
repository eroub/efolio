#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[deploy_efolio] repo=$ROOT_DIR"

echo "[deploy_efolio] node=$(node -v) npm=$(npm -v)"

echo "[deploy_efolio] git status (pre):"
git status --porcelain || true

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[deploy_efolio] ERROR: working tree not clean. Commit/stash first." >&2
  exit 2
fi

echo "[deploy_efolio] npm ci"
npm ci

echo "[deploy_efolio] build"
npm run build

if [ ! -f "$ROOT_DIR/build/index.html" ]; then
  echo "[deploy_efolio] ERROR: build/index.html missing" >&2
  exit 3
fi

if [ ! -f "$ROOT_DIR/build/bundle.js" ]; then
  echo "[deploy_efolio] ERROR: build/bundle.js missing" >&2
  exit 3
fi

echo "[deploy_efolio] nginx serves /var/www/efolio/build directly; no restart needed."

echo "[deploy_efolio] done"