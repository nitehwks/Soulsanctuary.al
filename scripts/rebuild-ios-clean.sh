#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/jabbott/Documents/Soulsanctuary.al"
cd "$ROOT"

echo "==> Cleaning web and iOS bundled assets"
rm -rf dist
rm -rf ios/App/App/public

echo "==> Installing deps (if needed)"
npm install

echo "==> Building web app"
npm run build

echo "==> Syncing Capacitor iOS"
npx cap sync ios

echo "==> Opening Xcode"
npx cap open ios

echo ""
echo "Done."
echo "In Xcode: Product -> Clean Build Folder, select Joe’s-iPad, then Run."
