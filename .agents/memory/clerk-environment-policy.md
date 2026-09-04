---
name: Clerk environment policy
description: Credential-pair rule while the external Clerk production instance is not ready.
---

Use the external Clerk Development publishable and secret keys together for every target until a complete external Production pair is available. Never mix one environment's publishable key with the other's secret key.

**Why:** The external Production publishable key exists without its matching secret, and the Production instance cannot yet be activated under the current Clerk configuration. A complete Development pair is safer and internally consistent.

**How to apply:** Keep release/mobile production builds on the Development fallback until both Production credentials are present and the production-instance migration is ready. Treat switching environments as a coordinated client-and-server change.