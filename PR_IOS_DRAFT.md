Title: iOS: Add Capacitor wrapper, mobile UI optimizations, and build scripts

Summary

This PR prepares the application for iOS by adding a Capacitor wrapper and multiple mobile-focused improvements. It preserves the web app functionality while making the UI safe-area aware, touch-friendly, and PWA-ready for native packaging.

What changed

- Added `capacitor.config.json` and Capacitor dependencies (`@capacitor/core`, `@capacitor/cli`) and npm scripts for mobile workflows.
- Added `client/public/manifest.json` (PWA manifest) and `apple-touch-icon` meta support.
- Created `SafeAreaLayout` component and mobile-optimized UI helpers in `client/src/components/layout/SafeAreaLayout.tsx`.
- Updated `client/index.html` with mobile viewport meta tags and app-capable flags.
- Enhanced `client/src/index.css` with safe-area utilities, touch-friendly sizes, and input tweaks to prevent iOS auto-zoom.
- Wrapped the app with `SafeAreaLayout` in `client/src/App.tsx`.
- Added `README_IOS.md` with macOS/Xcode build instructions and mobile notes.
- Added `BUILD_TEST_RESULTS.md` summarizing Windows build and Capacitor verification.

Testing performed

- `npm install` completed successfully on Windows (Node v24.11.1, npm v11.6.2).
- `npm run build:web` produced `dist/public` with mobile meta tags and assets.
- `npx cap copy` completed successfully locally, confirming Capacitor can sync web assets.
- Verified `capacitor.config.json` and `manifest.json` presence in build output.

Notes and migration

- Capacitor config `webDir` points to `dist/public` — ensure CI builds web assets before running `npx cap copy` on macOS.
- Some native plugins (Camera, Push, Secure Storage) require additional platform configuration in Xcode and possibly CocoaPods.
- The JS bundle is large (~1MB); consider code-splitting for performance.

Next steps

- On macOS: run `npx cap add ios` then `npx cap open ios` and set signing in Xcode to run on simulators/devices.
- Optionally add Capacitor plugins and example wiring (I can prepare those changes).
- Optional: set up CI to build web assets and run `npx cap copy` on macOS runner for automated iOS builds.

Checklist

- [x] Add Capacitor config and scripts
- [x] Make app safe-area aware
- [x] Add PWA manifest and icons
- [x] Ensure build completes on Windows
- [ ] Test on macOS Xcode simulator/device
- [ ] Add native plugin examples (Camera, Secure Storage)

Files of interest

- `capacitor.config.json`
- `package.json` (scripts: `mobile:prepare`, `mobile:add:ios`, `mobile:open:ios`)
- `client/index.html`
- `client/public/manifest.json`
- `client/src/components/layout/SafeAreaLayout.tsx`
- `client/src/index.css`
- `client/src/App.tsx`
- `README_IOS.md`
- `BUILD_TEST_RESULTS.md`

---

Paste this into the GitHub PR title and description and submit. If you'd like, I can open the PR page (already opened) and fill the title/body automatically if you give permission to use the GitHub API or install `gh` and authenticate.