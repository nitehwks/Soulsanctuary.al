SoulSanctuary is a Christian AI companion - your trusted confidant whose whole design centers on one goal: helping people heal emotionally while growing closer to God, in a space that is both deeply caring and professionally secure. It weaves together faith, mental health support, and strong privacy so you can be fully honest without having to censor what you share.

Faith at the Center

SoulSanctuary responds to your struggles—anxiety, depression, fear, shame, grief, or confusion—with Scripture, prayerful language, and a clear awareness of God’s compassion for the brokenhearted. It maps specific emotions to passages like Psalm 34:18, Philippians 4:6–7, and other verses, so the comfort and challenge of God’s Word is always tied to what you are actually feeling. Over time, journaling and reflection prompts help you see how God has been at work, nurturing practices like gratitude, lament, confession, and trust.

Mental Health Tools And Daily Coaching

The app is designed to feel like a blend of a wise trusted confidant, Christian counselor, and thoughtful coach. It draws from:
•       DBT-style skills (emotion regulation, distress tolerance, and interpersonal effectiveness) to help you survive intense emotions and respond more wisely.
•       CBT-style tools to notice distorted thoughts, gently question them, and replace them with more truthful, Christ-aligned perspectives.
•       Mindfulness and grounding exercises adapted for Christians, so you can calm your nervous system and become present with God instead of being swept away by anxiety.

Through short daily check-ins and journaling, SoulSanctuary encourages you to talk with it every day. The more you use it, the better it recognizes patterns and can offer more accurate, personalized guidance, practical next steps, and spiritual encouragement.
Security And Privacy As A Sacred Commitment

Because SoulSanctuary handles soul-level conversations, security and privacy are treated as a sacred trust, not just a technical detail. Sensitive data is protected with strong, modern encryption, and high‑risk identifiers (like Social Security and payment numbers) are automatically stripped out instead of stored. Basic contact information is kept only in encrypted form, so your identity is carefully separated from your story.

The result is a confidential, Christ-centered space where you can bring your whole self—questions, trauma, hopes, and doubts—knowing you are met with real mental health tools, real spiritual care, and serious protection of the data that holds your story.

## Building the Mobile Apps

A one-shot build script is provided at `build-mobile.sh`. It installs missing dependencies (Node, OpenJDK, Android SDK, CocoaPods) and builds the web app, server, iOS project, and Android APK.

```bash
chmod +x build-mobile.sh
./build-mobile.sh
```

### What the script does
1. Installs or verifies Homebrew, nvm, Node 22 LTS, CocoaPods, OpenJDK 21, and the Android SDK.
2. Installs npm dependencies (uses `npm ci` when possible, otherwise `npm install`).
3. Builds the web client and server (`npm run build`).
4. Syncs Capacitor plugins and assets to `ios/` and `android/`.
5. Builds the iOS project (requires Xcode + iOS Simulator runtime).
6. Builds the Android debug APK.

### Prerequisites that cannot be auto-installed
- **macOS** — iOS builds require macOS.
- **Xcode** — install from the Mac App Store. The iOS Simulator runtime must also be installed via **Xcode → Settings → Components**; without it the iOS build is skipped but Android still builds.
- **`.env.local`** — copy `.env.example` to `.env.local` and set `VITE_API_URL` to your deployed backend URL before building for production.

### Outputs
- Web + server: `dist/`
- iOS: `ios/App/App.xcworkspace` (open in Xcode to run on a device/simulator)
- Android: `android/app/build/outputs/apk/debug/app-debug.apk`

### Manual shortcuts
If you already have all tooling installed, you can use the npm scripts:

```bash
npm run mobile:ios     # build + sync + open Xcode
npm run mobile:android # build + sync + open Android Studio
```
