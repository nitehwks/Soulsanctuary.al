# SoulSanctuary - Multi-Platform Build Guide

## Overview

SoulSanctuary can be built and deployed to multiple platforms:

| Platform | Technology | Build Requirement |
|----------|-----------|-------------------|
| Web | Vite + React | Any computer |
| iOS | Capacitor | Mac with Xcode |
| Android | Capacitor | Any computer with Android Studio |
| Windows | Electron | Any computer |
| Mac | Electron | Mac (for signing) |
| Linux | Electron | Any computer |

---

## Prerequisites

### For All Builds
- Node.js 20+
- npm

### For iOS Builds
- Mac computer
- Xcode (from App Store)
- Apple Developer account (for distribution)

### For Android Builds
- Android Studio
- Android SDK (API 24+)
- JDK (installed with Android Studio)

### For Desktop Builds
- No special requirements for development
- Mac needed for signed Mac builds

---

## Build Commands

### Step 1: Build Web Assets
```bash
npm run build
```

### Step 2: Sync to All Platforms
```bash
npx cap sync
```

This copies the built web assets to:
- `ios/App/App/public/`
- `android/app/src/main/assets/public/`
- `electron/app/`

---

## iOS Build (iPhone/iPad)

### Open in Xcode
```bash
npx cap open ios
```

### Build & Run
1. In Xcode, select a simulator or connected device
2. Click the Play button (or Cmd+R)

### Create Release Build
1. Product > Archive
2. Distribute App > App Store Connect (or Ad Hoc)

### App Store Submission
1. Create app in App Store Connect
2. Upload via Xcode Organizer
3. Submit for review

---

## Android Build

### Open in Android Studio
```bash
npx cap open android
```

### Build & Run
1. Select emulator or connected device
2. Click Run (green play button)

### Create Release APK
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/`

### Create Release AAB (for Play Store)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/`

### App Signing
Edit `android/app/build.gradle` to add signing config:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/keystore.jks")
            storePassword "password"
            keyAlias "alias"
            keyPassword "password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## Desktop Build (Windows/Mac/Linux)

### Development Mode
```bash
npx cap open @capacitor-community/electron
```

### Sync Web Changes
```bash
npm run build
npx cap sync @capacitor-community/electron
```

### Build Windows Installer (.exe)
```bash
cd electron
npm run build
npm run electron:build -- --win
```
Output: `electron/dist/`

### Build Mac App (.dmg)
```bash
cd electron
npm run build
npm run electron:build -- --mac
```
Output: `electron/dist/`

### Build Linux App (.AppImage)
```bash
cd electron
npm run build
npm run electron:build -- --linux
```
Output: `electron/dist/`

### Build All Platforms
```bash
cd electron
npm run build
npm run electron:build -- --win --mac --linux
```

---

## Platform-Specific Notes

### iOS
- Requires CocoaPods: `sudo gem install cocoapods`
- Run `cd ios/App && pod install` if plugins don't work
- Minimum iOS version: 13.0

### Android
- Minimum SDK: API 24 (Android 7.0)
- Target SDK: API 34 (Android 14)
- WebView: Chrome 60+ required

### Electron (Desktop)
- Uses Chromium-based WebView
- Full keyboard/mouse support
- Window size: 1200x800 default
- Menu bar included

---

## Environment Variables

All platforms use the same backend API. Set these in your deployment:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AI_INTEGRATIONS_OPENROUTER_API_KEY` | OpenRouter API key |
| `SESSION_SECRET` | Session encryption key |

---

## Testing on Each Platform

### Web
- Visit your Replit URL or localhost:5001

### iOS Simulator
```bash
npx cap run ios
```

### Android Emulator
```bash
npx cap run android
```

### Desktop
```bash
npx cap open @capacitor-community/electron
```

---

## Updating After Code Changes

```bash
# 1. Build web assets
npm run build

# 2. Sync to all platforms
npx cap sync

# 3. Open/run the platform you want to test
npx cap open ios        # or android or @capacitor-community/electron
```

---

## Project Structure

```
soulsanctuary/
├── client/             # React web app source
├── server/             # Express backend
├── shared/             # Shared types and config
├── dist/               # Built web assets
├── ios/                # iOS native project
│   └── App/
├── android/            # Android native project
│   └── app/
├── electron/           # Electron desktop project
│   ├── src/           # Electron main process
│   ├── app/           # Web assets (copied)
│   └── dist/          # Built installers
└── capacitor.config.ts # Capacitor configuration
```

---

## Troubleshooting

### "Plugin not found" errors
```bash
npx cap sync
```

### iOS: "Pod install failed"
```bash
cd ios/App
pod install --repo-update
```

### Android: Build fails
- Update Android Studio
- Sync Gradle files
- Invalidate caches: File > Invalidate Caches

### Electron: Window doesn't open
- Check `electron/src/index.ts` for errors
- Run in terminal to see console output

---

*SoulSanctuary - Find Your Sanctuary Within*
