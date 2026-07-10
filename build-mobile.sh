#!/usr/bin/env bash
#
# SoulSanctuary Comprehensive Mobile Build Script
# =================================================
# Builds the web app, server, iOS app, and Android app.
# Automatically installs missing dependencies where possible.
#
# Usage:
#   chmod +x build-mobile.sh
#   ./build-mobile.sh
#
# Requirements that cannot be auto-installed:
#   - macOS (iOS builds require Xcode)
#   - Xcode (install from Mac App Store; iOS simulator runtime via Xcode Settings)
#   - Internet connection for downloads
#
# The script uses Node 20 LTS, OpenJDK 17, CocoaPods, and the Android SDK.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
NODE_VERSION="22.16.0"          # Node 22 LTS - required by Capacitor CLI 8.4
# Capacitor packages are pinned to exact versions in package.json for reliability.
# Core/CLI/platform packages are kept at the latest stable 8.x; plugins are kept at
# their latest compatible 8.x release. Do not change these without updating package.json.
JDK_VERSION="21"                # Required by Capacitor 8.4 Android library (sourceCompatibility VERSION_21)
ANDROID_COMPILE_SDK="35"
ANDROID_TARGET_SDK="35"
ANDROID_BUILD_TOOLS="35.0.0"
ANDROID_MIN_SDK="23"

REQUIRED_ANDROID_PACKAGES=(
  "platform-tools"
  "platforms;android-${ANDROID_COMPILE_SDK}"
  "build-tools;${ANDROID_BUILD_TOOLS}"
)

# ---------------------------------------------------------------------------
# Terminal colors
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log()   { echo -e "${BLUE}[BUILD]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
info()  { echo -e "${CYAN}[INFO]${NC} $*"; }

# ---------------------------------------------------------------------------
# Retry helper for network-dependent commands
# ---------------------------------------------------------------------------
run_with_retry() {
  local max_attempts=3
  local attempt=1
  local delay=5
  while true; do
    if "$@"; then
      return 0
    fi
    if [[ $attempt -ge $max_attempts ]]; then
      error "Command failed after $max_attempts attempts: $*"
      return 1
    fi
    warn "Attempt $attempt failed. Retrying in ${delay}s..."
    sleep "$delay"
    attempt=$((attempt + 1))
    delay=$((delay * 2))
  done
}

# ---------------------------------------------------------------------------
# General helpers
# ---------------------------------------------------------------------------
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

is_mac() {
  [[ "$(uname -s)" == "Darwin" ]]
}

ensure_project_root() {
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cd "$script_dir"
  if [[ ! -f "package.json" ]] || [[ ! -f "capacitor.config.ts" ]]; then
    error "Please run this script from the SoulSanctuary project root."
    exit 1
  fi
  log "Working in project root: $(pwd)"
}

# ---------------------------------------------------------------------------
# Homebrew
# ---------------------------------------------------------------------------
install_homebrew() {
  if command_exists brew; then
    ok "Homebrew already installed: $(brew --version | head -1)"
    return 0
  fi
  log "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Source Homebrew into the current shell session
  if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
  ok "Homebrew installed"
}

# ---------------------------------------------------------------------------
# Node.js via nvm
# ---------------------------------------------------------------------------
load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  fi
}

install_node() {
  load_nvm

  if ! command_exists nvm; then
    log "nvm not found. Installing..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    load_nvm
  fi

  if ! command_exists nvm; then
    error "nvm installation failed. Please install Node ${NODE_VERSION} manually."
    exit 1
  fi

  if nvm list | grep -q "v${NODE_VERSION}"; then
    ok "Node ${NODE_VERSION} already installed"
  else
    log "Installing Node ${NODE_VERSION} LTS..."
    run_with_retry nvm install "$NODE_VERSION"
  fi

  nvm use "$NODE_VERSION"
  ok "Using Node $(node --version) and npm $(npm --version)"
}

# ---------------------------------------------------------------------------
# CocoaPods
# ---------------------------------------------------------------------------
install_cocoapods() {
  if command_exists pod; then
    ok "CocoaPods already installed: $(pod --version)"
    return 0
  fi
  log "CocoaPods not found. Installing..."
  run_with_retry brew install cocoapods
  ok "CocoaPods installed: $(pod --version)"
}

# ---------------------------------------------------------------------------
# OpenJDK for Android
# ---------------------------------------------------------------------------
find_openjdk_home() {
  # Only accept the configured JDK version to avoid mismatches between the
  # compiler and the Android library's sourceCompatibility target.
  local candidates=(
    "/opt/homebrew/opt/openjdk@${JDK_VERSION}/libexec/openjdk.jdk/Contents/Home"
    "/usr/local/opt/openjdk@${JDK_VERSION}/libexec/openjdk.jdk/Contents/Home"
    "/Library/Java/JavaVirtualMachines/openjdk-${JDK_VERSION}.jdk/Contents/Home"
  )
  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate/bin/java" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

install_openjdk() {
  local jdk_home
  jdk_home=$(find_openjdk_home || true)

  if [[ -z "$jdk_home" ]]; then
    log "OpenJDK ${JDK_VERSION} not found. Installing..."
    run_with_retry brew install "openjdk@${JDK_VERSION}"
    jdk_home=$(find_openjdk_home)
  fi

  if [[ -z "$jdk_home" ]]; then
    error "Could not locate OpenJDK ${JDK_VERSION} after installation."
    exit 1
  fi

  export JAVA_HOME="$jdk_home"
  export PATH="$JAVA_HOME/bin:$PATH"
  ok "JAVA_HOME=${JAVA_HOME}"
  info "java: $(java -version 2>&1 | head -1)"
}

# ---------------------------------------------------------------------------
# Android SDK
# ---------------------------------------------------------------------------
find_android_cmdline_tools() {
  local candidates=(
    "$HOME/Library/Android/sdk/cmdline-tools/latest"
    "/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest"
    "/usr/local/share/android-commandlinetools/cmdline-tools/latest"
  )
  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate/bin/sdkmanager" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

install_android_sdk() {
  # Honor existing ANDROID_HOME if valid
  if [[ -n "${ANDROID_HOME:-}" ]] && [[ -d "$ANDROID_HOME" ]] && [[ -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]]; then
    ok "ANDROID_HOME already set and valid: $ANDROID_HOME"
  else
    log "ANDROID_HOME not set or invalid. Setting up Android SDK..."
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    mkdir -p "$ANDROID_HOME"

    local cmdline_tools
    cmdline_tools=$(find_android_cmdline_tools || true)
    if [[ -z "$cmdline_tools" ]]; then
      log "Installing Android command line tools..."
      run_with_retry brew install android-commandlinetools
      cmdline_tools=$(find_android_cmdline_tools)
    fi

    if [[ -z "$cmdline_tools" ]]; then
      error "Could not locate sdkmanager after installing command line tools."
      exit 1
    fi

    # Ensure the standard "latest" layout exists
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    if [[ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]]; then
      ln -sfn "$cmdline_tools" "$ANDROID_HOME/cmdline-tools/latest"
    fi
  fi

  export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

  if ! command_exists sdkmanager; then
    error "sdkmanager is not on PATH after SDK setup."
    exit 1
  fi

  log "Accepting Android SDK licenses..."
  yes | sdkmanager --sdk_root="$ANDROID_HOME" --licenses >/dev/null 2>&1 || true

  log "Installing required Android SDK packages..."
  run_with_retry sdkmanager --sdk_root="$ANDROID_HOME" "${REQUIRED_ANDROID_PACKAGES[@]}"

  # Write local.properties so Android Studio and Gradle find the SDK
  printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties
  ok "Android SDK ready at $ANDROID_HOME"
}

# ---------------------------------------------------------------------------
# Xcode / iOS
# ---------------------------------------------------------------------------
find_xcode_developer_dir() {
  # Prefer explicit Xcode.app if present; otherwise trust xcode-select
  if [[ -d "/Applications/Xcode.app/Contents/Developer" ]]; then
    echo "/Applications/Xcode.app/Contents/Developer"
  elif xcode-select -p >/dev/null 2>&1; then
    xcode-select -p
  else
    return 1
  fi
}

setup_xcode() {
  if ! is_mac; then
    warn "Not macOS; iOS build will be skipped."
    return 1
  fi

  local dev_dir
  dev_dir=$(find_xcode_developer_dir || true)
  if [[ -z "$dev_dir" ]]; then
    error "Xcode is not installed. Please install it from the Mac App Store."
    return 1
  fi

  export DEVELOPER_DIR="$dev_dir"
  if ! command_exists xcodebuild; then
    error "DEVELOPER_DIR set to $DEVELOPER_DIR but xcodebuild is not available."
    return 1
  fi

  ok "Xcode found: $(xcodebuild -version 2>&1 | head -1)"
}


check_env_file() {
  if [[ -f ".env.local" ]]; then
    ok ".env.local found"
    if grep -q "VITE_API_URL=.*https\?://" .env.local; then
      ok "VITE_API_URL appears configured"
    else
      warn "VITE_API_URL is missing or invalid in .env.local. Mobile API calls will fail."
    fi
  else
    warn ".env.local not found. Copying from .env.example..."
    cp .env.example .env.local
    warn "Please edit .env.local and set VITE_API_URL to your deployed backend URL before building for production."
  fi
}

# ---------------------------------------------------------------------------
# Build steps
# ---------------------------------------------------------------------------
build_web() {
  log "Installing npm dependencies (this may take a few minutes)..."
  if [[ -f "package-lock.json" ]] && npm ci --silent --dry-run >/dev/null 2>&1; then
    log "package-lock.json is in sync; using npm ci for reproducible install..."
    run_with_retry npm ci
  else
    log "package-lock.json missing or out of sync; using npm install..."
    run_with_retry npm install
  fi

  log "Building web client and server..."
  npm run build
  ok "Web + server build complete"
}

sync_capacitor() {
  log "Syncing Capacitor plugins and web assets to native projects..."
  if [[ -n "${DEVELOPER_DIR:-}" ]]; then
    DEVELOPER_DIR="$DEVELOPER_DIR" npx cap sync
  else
    npx cap sync
  fi
  ok "Capacitor sync complete"
}

build_ios() {
  if ! setup_xcode; then
    warn "iOS build skipped: Xcode not available."
    return 1
  fi

  log "Building iOS project..."

  # Pick the newest available iOS simulator runtime (e.g., 18.4, 18.6).
  local latest_runtime
  latest_runtime=$(DEVELOPER_DIR="$DEVELOPER_DIR" xcrun simctl list runtimes 2>/dev/null \
    | grep -oE 'iOS [0-9]+\.[0-9]+' \
    | awk '{print $2}' \
    | sort -t. -k1,1n -k2,2n \
    | tail -1)

  if [[ -z "$latest_runtime" ]]; then
    error "No iOS simulator runtime found. Install one via Xcode → Settings → Components."
    return 1
  fi
  info "Latest available iOS simulator runtime: $latest_runtime"

  # Xcode 16+ enables user script sandboxing by default, which breaks the
  # CocoaPods '[CP] Embed Pods Frameworks' build phase. Disable it for CLI builds.
  local xcode_status=0
  DEVELOPER_DIR="$DEVELOPER_DIR" xcodebuild \
    -workspace ios/App/App.xcworkspace \
    -scheme App \
    -sdk iphonesimulator \
    -destination "platform=iOS Simulator,name=iPhone 16,OS=${latest_runtime}" \
    build \
    CODE_SIGNING_ALLOWED=NO \
    ENABLE_USER_SCRIPT_SANDBOXING=NO || xcode_status=$?

  if [[ $xcode_status -ne 0 ]]; then
    error "iOS xcodebuild failed with exit code $xcode_status."
    error "If the error mentions a missing iOS simulator runtime, install it via Xcode → Settings → Components."
    return 1
  fi

  ok "iOS build complete"
}

build_android() {
  log "Building Android project..."
  (
    cd android
    ./gradlew assembleDebug --no-daemon
  )
  local apk_path="android/app/build/outputs/apk/debug/app-debug.apk"
  if [[ -f "$apk_path" ]]; then
    ok "Android debug APK built: $apk_path"
  else
    warn "Android build finished but APK not found at expected path: $apk_path"
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  echo -e "${BOLD}"
  echo "========================================="
  echo "  SoulSanctuary Mobile Build Script"
  echo "========================================="
  echo -e "${NC}"

  if ! is_mac; then
    warn "This script is designed for macOS. Android-only mode will be used."
  fi

  ensure_project_root

  # Dependency installation
  install_homebrew
  install_node
  install_cocoapods
  install_openjdk
  install_android_sdk
  setup_xcode || true

  # Environment
  check_env_file

  # Build
  build_web
  sync_capacitor

  # Native builds (best-effort; don't let one failure stop the other)
  build_ios || warn "iOS build did not complete."
  build_android || error "Android build failed."

  echo
  echo -e "${GREEN}${BOLD}Build process finished.${NC}"
  echo "Review the output above for any skipped steps or warnings."
}

main "$@"
