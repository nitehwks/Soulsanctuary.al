#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/jabbott/Documents/Soulsanctuary.al"
PODFILE="$ROOT/ios/App/Podfile"

cd "$ROOT"

echo "==> 1) Fix Podfile duplicate post_install hook (remove SS injected block)"
cp "$PODFILE" "$PODFILE.bak.$(date +%s)"

python3 - <<'PY'
from pathlib import Path
import re, sys

p = Path("/Users/jabbott/Documents/Soulsanctuary.al/ios/App/Podfile")
s = p.read_text()

# Remove previously injected block from old script
s2 = re.sub(
    r'\n# SS_WARNING_SUPPRESS_HOOK\npost_install do \|installer\|.*?\nend\n',
    '\n',
    s,
    flags=re.S
)

# Safety check: CocoaPods supports one post_install
count = len(re.findall(r'^\s*post_install\s+do\s+\|installer\|', s2, flags=re.M))
if count > 1:
    print(f"ERROR: Podfile still has {count} post_install hooks. Resolve manually.")
    sys.exit(1)

p.write_text(s2)
print("Podfile repaired.")
PY

echo "==> 2) Ensure no remote server URL is injected"
unset CAP_SERVER_URL || true

echo "==> 3) Clean web + iOS bundled assets"
rm -rf dist
rm -rf ios/App/App/public
rm -rf ios/App/Pods ios/App/Podfile.lock

echo "==> 4) Build web"
npm run build

echo "==> 5) Sync Capacitor iOS"
npx cap sync ios

echo "==> 6) Install Pods"
cd ios/App
pod repo update
pod install

echo "==> 7) Bump iOS build number"
if xcrun agvtool what-version -terse1 >/dev/null 2>&1; then
  xcrun agvtool next-version -all
else
  echo "agvtool not configured; skipping auto bump."
fi

cd "$ROOT"

echo "==> 8) Verify no server block in generated Capacitor config"
if grep -q '"server"' ios/App/App/capacitor.config.json; then
  echo "ERROR: server block still present in ios/App/App/capacitor.config.json"
  cat ios/App/App/capacitor.config.json
  exit 1
fi

echo "==> 9) Open Xcode"
npx cap open ios

echo ""
echo "Done."
echo "In Xcode: Product -> Clean Build Folder, delete app from iPad, then Run."
