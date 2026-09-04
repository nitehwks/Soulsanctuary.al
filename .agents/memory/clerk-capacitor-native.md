---
name: Clerk in Capacitor native apps
description: Supported Clerk authentication path for social sign-in in bundled iOS and Android apps.
---

Keep Clerk React's standard web flow for browsers. Bundled Capacitor apps must use Clerk's official native SDKs and hosted authentication, with session tokens retrieved fresh from native storage for API requests.

**Why:** Google and other OAuth providers do not reliably support embedded WebView authentication, and a bundled Capacitor origin is not a normal hosted HTTPS callback. Ad hoc redirect relays or JavaScript token persistence weaken reliability and security.

**How to apply:** Use ClerkKit hosted auth on iOS and Clerk Android hosted auth on Android. Let each SDK own its callback and secure session persistence. Do not revive WebView OAuth callbacks, custom OAuth relays, or JavaScript token storage.