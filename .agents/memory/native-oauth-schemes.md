---
name: Native OAuth URL schemes
description: Custom URL scheme redirects for Clerk OAuth on iOS/Android must match native app registrations
---

# Native OAuth redirect schemes

The native (Capacitor) OAuth redirect used by Clerk is `com.soulsanctuary.ai://oauth/callback` (returned by `getNativeRedirectUrl()` in the deep-link module). The legacy scheme `soulsanctuary://auth-callback` is also still registered.

**Rule:** Any change to the native redirect URL must be mirrored in three places at once:
1. iOS `Info.plist` → `CFBundleURLSchemes`
2. Android `AndroidManifest.xml` → intent-filter `<data>` scheme/host/path
3. The deep-link callback matcher (`isOAuthCallbackUrl`) — note custom-scheme URLs parse with the first path segment as `host` (e.g. `com.soulsanctuary.ai://oauth/callback` → host `oauth`, pathname `/callback`).

**Why:** A mismatch means the OS never returns the user to the app after external-browser OAuth, or the app receives the URL but never reloads the session — this caused the Apple OAuth white-screen bug fixed in July 2026.

**How to apply:** When touching auth redirects, deep links, or Clerk config, grep for the scheme string in all three locations and keep them in lockstep.

# Repo/GitHub state note (July 2026)

Local main and GitHub origin/main have diverged historically. Three pre-existing TypeScript errors exist locally (file-upload.tsx dimensions type, server/lib/auth.ts missing ./storage import, profile-aggregator Set iteration) that GitHub fixed in a separate commit — they are unrelated to the auth merge and were intentionally left untouched.
