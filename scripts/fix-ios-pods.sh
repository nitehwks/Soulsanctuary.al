#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/jabbott/Documents/Soulsanctuary.al"
cd "$ROOT"

echo "==> 1) Align Capacitor packages"
npm i -E @capacitor/cli@latest @capacitor/core@latest @capacitor/ios@latest @capacitor/app@latest @capacitor/keyboard@latest

PODFILE="$ROOT/ios/App/Podfile"

echo "==> 2) Patch Podfile (idempotent)"
cp "$PODFILE" "${PODFILE}.bak.$(date +%s)"

# Add inhibit_all_warnings! once
if ! grep -q "inhibit_all_warnings!" "$PODFILE"; then
  python3 - <<'PY'
from pathlib import Path
p = Path("/Users/jabbott/Documents/Soulsanctuary.al/ios/App/Podfile")
s = p.read_text()
if "inhibit_all_warnings!" not in s:
    if "platform :ios" in s:
        s = s.replace("platform :ios, '14.0'", "platform :ios, '14.0'\ninhibit_all_warnings!")
    else:
        s = "platform :ios, '14.0'\ninhibit_all_warnings!\n" + s
p.write_text(s)
PY
fi

# Add one warning-suppression post_install hook once
if ! grep -q "SS_WARNING_SUPPRESS_HOOK" "$PODFILE"; then
  cat >> "$PODFILE" <<'RUBY'

# SS_WARNING_SUPPRESS_HOOK
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_SUPPRESS_WARNINGS'] = 'YES'
      config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
    end
  end
end
RUBY
fi

echo "==> 3) Clean Pods + lockfile"
rm -rf ios/App/Pods ios/App/Podfile.lock

echo "==> 4) Sync Capacitor iOS"
npx cap sync ios

echo "==> 5) Reinstall Pods"
cd ios/App
pod repo update
pod install
cd "$ROOT"

echo "==> 6) Optional: set [CP] scripts to run every build (if xcodeproj gem exists)"
if /usr/bin/ruby -e "begin; require 'xcodeproj'; puts 'ok'; rescue LoadError; exit 1; end" >/dev/null 2>&1; then
  /usr/bin/ruby <<'RUBY'
require 'xcodeproj'
proj_path = '/Users/jabbott/Documents/Soulsanctuary.al/ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(proj_path)
project.targets.each do |t|
  t.shell_script_build_phases.each do |p|
    name = p.display_name.to_s
    if name.include?('[CP] Embed Pods Frameworks') || name.include?('[CP] Copy Pods Resources')
      p.always_out_of_date = '1'
    end
  end
end
project.save
puts "Patched [CP] script phases."
RUBY
else
  echo "xcodeproj gem not installed; skip auto-patch."
  echo "Manual fallback in Xcode: Build Phases -> [CP] Embed Pods Frameworks -> uncheck 'Based on dependency analysis'."
fi

echo "==> 7) Open Xcode"
npx cap open ios

echo ""
echo "Done."
echo "Next in Xcode: Product -> Clean Build Folder, then build to Joe’s-iPad."
