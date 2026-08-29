---
name: Clerk profile ownership
description: Durable identity mapping rule for preserving application data across Clerk sign-ins.
---

Treat each Clerk user ID as a durable identity-provider binding namespaced by its verified token issuer. A verified Clerk email may attach a new issuer-specific subject to an existing local profile.

**Why:** Existing conversations and preferences use local profile IDs that may predate Clerk, and development and production Clerk tenants issue different subjects for the same person. Replacing local IDs would detach data; limiting a profile to one Clerk subject would duplicate it across environments.

**How to apply:** Authentication starts from the server-verified Clerk session. Resolve the issuer-and-subject binding first; only if none exists may the Clerk-verified primary email attach that issuer's subject to the matching profile. Contact email stays separate.