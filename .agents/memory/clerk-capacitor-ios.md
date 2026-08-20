---
name: Clerk in Capacitor iOS
description: Native authentication constraint for Clerk social sign-in inside the bundled Capacitor iOS webview.
---

Do not assume Clerk's React web sign-in component can provide Google or Apple OAuth unchanged inside a bundled Capacitor iOS webview. The bundled app has a non-HTTP local origin, and Clerk rejects that origin as an OAuth `redirect_url`.

**Why:** The standard web migration rendered correctly, but social authentication returned Clerk's `invalid_url_scheme` response because the iOS webview still used a Capacitor origin. Setting Capacitor's iOS scheme to `https` does not turn bundled WKWebView content into a normal hosted HTTPS application.

**How to apply:** Keep the canonical Clerk web flow for browsers. For iOS social login, use Clerk's supported native-application configuration and native/hosted-auth flow. Do not revive ad hoc callback bridges as a substitute. If native support cannot be enabled, offer reliable email authentication rather than a social button that cannot complete.