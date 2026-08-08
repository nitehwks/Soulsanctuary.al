---
name: OAuth implementation note
description: Current standard Clerk OAuth approach for this repository
---

# Standard Clerk OAuth (Aug 2026)

Current implementation intentionally avoids custom native OAuth relay/deep-link code.

Rules:
1. Use Clerk prebuilt `SignIn` and `SignUp` components for social auth.
2. Use a simple callback route (`/sso-callback` or `/oauth/callback`) that calls `clerk.handleRedirectCallback({})`.
3. Keep redirects to `"/"` after auth completion.
4. Do not hide Clerk social buttons on iOS/Android via CSS.

Reintroduce custom native OAuth bridging only if a confirmed platform limitation requires it.
