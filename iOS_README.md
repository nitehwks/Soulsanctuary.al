# SoulSanctuary iOS App - Build Instructions

## Prerequisites
- Mac computer with macOS
- Xcode installed (free from Mac App Store)
- Node.js 18+ installed
- CocoaPods installed (`sudo gem install cocoapods`)
- Apple Developer Account (free for testing, $99/year for App Store)

## Quick Start

### 1. Download the Project
Download this project from Replit (click the 3-dot menu and select "Download as zip")

### 2. Install Dependencies
```bash
cd soulsanctuary
npm install
```

### 3. Install CocoaPods Dependencies
```bash
cd ios/App
pod install
cd ../..
```

### 4. Sync Web Assets
```bash
npx cap sync ios
```

### 5. Open in Xcode
```bash
npx cap open ios
```

### 6. Build and Run
1. In Xcode, select your target device (iPhone or iPad simulator)
2. Click the **Run** button (play icon)
3. Wait for the build to complete
4. The app will launch on the simulator

## Running on Physical Device

1. Connect your iPhone or iPad via USB
2. In Xcode, go to **Preferences > Accounts** and add your Apple ID
3. Select your device from the device dropdown
4. Click **Run**
5. On first run, trust the developer certificate on your device:
   - Settings > General > Device Management > [Your Apple ID] > Trust

## App Configuration

The app is configured in `capacitor.config.ts`:
- **App ID**: com.soulsanctuary.ai
- **App Name**: SoulSanctuary
- **Platforms**: iPhone and iPad (Universal)

## Updating the App

After making changes to the web code:
```bash
npm run build
npx cap sync ios
```
Then rebuild in Xcode.

## Troubleshooting

### "Pod install failed"
```bash
cd ios/App
pod repo update
pod install
```

### Signing Issues
1. Open ios/App/App.xcworkspace in Xcode
2. Select the App target
3. Go to Signing & Capabilities
4. Enable "Automatically manage signing"
5. Select your team

### Build Errors
1. Clean the build: Product > Clean Build Folder
2. Restart Xcode
3. Re-sync: `npx cap sync ios`

## App Store Submission

1. Archive: Product > Archive
2. Open Organizer: Window > Organizer
3. Click "Distribute App"
4. Follow the App Store Connect wizard

## Support

For issues with the iOS build, check:
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
