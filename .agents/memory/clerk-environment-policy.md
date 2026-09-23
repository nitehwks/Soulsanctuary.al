---
name: Clerk environment policy
description: Credential-pair rule while the external Clerk production instance is not ready.
---

Use the external Clerk Development publishable and secret keys together for every target until a complete external Production pair is available. Never mix one environment's publishable key with the other's secret key.

**Why:** The external Production pair was previously incomplete. Both credentials are now present, but credential presence alone does not confirm native registration, provider configuration, or production-instance readiness.

**How to apply:** Keep release/mobile production builds on the Development fallback until both Production credentials are present and the production-instance migration is ready. Treat switching environments as a coordinated client-and-server change.

Do not pair a Development mobile bundle with a Production backend. Confirm instance readiness before the coordinated switch; adding the second Production credential makes the current release selector choose Production.

External Clerk must explicitly disable inherited managed proxy defaults.

**Why:** Published requests redirected to the removed managed handshake route even though workspace environment inspection did not show a proxy variable. SDK environment defaults can differ in publishing.

**How to apply:** Keep an explicit empty proxy setting on external Clerk middleware; verify browser document redirects, not only plain HTTP status checks.