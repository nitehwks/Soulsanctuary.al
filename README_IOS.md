TrustHub iOS build instructions

Overview
- This project is a React + Vite web app. We prepare an iOS app by wrapping the built web output with Capacitor.

Mobile UI Enhancements (Already Added)
- **Safe-area layout support**: App respects iOS notch, home indicator, and other safe areas via `SafeAreaLayout` component
- **Touch-friendly controls**: Min 44×44px tap targets on buttons and inputs per Apple HIG
- **Mobile viewport optimization**: Fixed viewport, no zoom, viewport-fit=cover for notch support
- **PWA manifest**: `manifest.json` for app icon and metadata
- **iOS-safe input styling**: 16px font-size to prevent auto-zoom, native appearance disabled
- **Responsive typography**: Smaller heading sizes on mobile screens
- **Momentum scrolling**: `-webkit-overflow-scrolling: touch` utility for smooth iOS scrolling

Components and utilities added:
- `SafeAreaLayout`: Wraps the entire app to apply safe-area insets
- `MobileOptimizedButton`: Touch-friendly button component with min 44×44px
- `MobileOptimizedInput`: Touch-friendly input with 16px font
- CSS utilities: `.touch-safe-tap`, `.safe-area-all`, `.ios-momentum-scroll`, `.prevent-zoom`, etc.

Prerequisites (to build an actual iOS app):
- macOS with Xcode installed (required to build and submit to App Store)
- Node.js and npm/yarn installed
- Optional: CocoaPods (for some Capacitor plugins)

Quick steps (on macOS):
1. Install project dependencies

```powershell
# from repo root
npm install
```

2. Install Capacitor CLI (if not already installed)

```powershell
npm install --save @capacitor/core
npm install --save-dev @capacitor/cli
```

3. Build the web app (produces `dist/public` because Vite root is `client`)

```powershell
npm run build:web
```

4. Initialize Capacitor and add iOS platform

```powershell
npx cap init com.insightfulai.trusthub TrustHub --web-dir=dist/public
npx cap add ios
```

(Note: `capacitor.config.json` is already added to the repo and points `webDir` to `dist/public`.)

5. Copy web assets into the native project

```powershell
npx cap copy
```

6. Open the iOS project in Xcode

```powershell
npx cap open ios
```

7. In Xcode: select a team, set signing, choose a device/simulator, then Build & Run.

Notes and limitations
- You cannot produce a signed `.ipa` for App Store distribution on Windows; macOS + Xcode is required.
- Some native plugins (camera, biometrics, push notifications) will need platform setup in Xcode and possible CocoaPods installation.
- The app now includes mobile UI refinements for better on-device experience.

Extra scripts added to `package.json`:
- `npm run mobile:prepare` — builds web assets and runs `npx cap copy`
- `npm run mobile:add:ios` — runs `npx cap add ios`
- `npm run mobile:open:ios` — runs `npx cap open ios`

Testing on iOS Simulator or Device
- **Simulator**: After opening in Xcode, select "iPhone 15" or preferred device in the toolbar, then Product → Run
- **Physical Device**: Connect device via USB, select it in Xcode, then Product → Run
- **Hot Reload**: You can run `npm run dev:client` in a separate terminal to test web UI changes before rebuilding

Using Mobile Components in Your Pages
```tsx
import { SafeAreaLayout } from '@/components/layout/SafeAreaLayout';
import { MobileOptimizedButton } from '@/components/layout/SafeAreaLayout';

export default function MyPage() {
  return (
    <SafeAreaLayout>
      <div className="flex flex-col h-full">
        {/* Your content here */}
        <MobileOptimizedButton>Tap-friendly button</MobileOptimizedButton>
      </div>
    </SafeAreaLayout>
  );
}
```

CSS Utilities for Mobile
- `.safe-area-top`, `.safe-area-bottom`, `.safe-area-left`, `.safe-area-right`, `.safe-area-all` — Apply safe-area insets
- `.touch-safe-tap` — Ensures 44×44 minimum tap target
- `.ios-momentum-scroll` — Enables smooth momentum scrolling on iOS
- `.prevent-zoom` — Disables touch-action zoom
- `.no-select-text` — Prevents text selection on long-press

Next Steps to Enhance iOS App
- Add Capacitor plugins (Camera, Geolocation, Secure Storage) for native features
- Configure app icons and splash screens in Xcode
- Set up push notifications via Apple Push Notification service (APNs)
- Test on real device and handle platform-specific edge cases
- Build and archive for TestFlight or App Store submission

Camera plugin notes
- If you add camera support, you MUST include the `NSCameraUsageDescription` key in the iOS
  `Info.plist` with a user-facing explanation, for example:

  ```xml
  <key>NSCameraUsageDescription</key>
  <string>TrustHub uses the camera to let you take photos for your conversations and coaching activities.</string>
  ```

 - After adding `@capacitor/camera` and running `npx cap sync ios`, open the Xcode project and
   confirm the Info.plist entry is present. Without this key, iOS will block camera access and
   App Store may reject the app.

Web fallback
- The `CameraExample` component included in `client/src/components/camera/CameraExample.tsx`
  will use the native Capacitor Camera on devices and fall back to a web file picker (`<input type="file">`) when run in a browser.
