---
name: Clerk identity mapping
description: Why Clerk subjects must map many-to-one to stable application users.
---

Keep application data owned by a stable local user ID, with Clerk subjects stored in a separate identity mapping that permits multiple subjects per local user.

**Why:** Clerk Development and Production are separate tenants and issue different subject IDs. If both environments use the same application database, one Clerk ID column can flap or disconnect one environment from existing data.

**How to apply:** Resolve the authenticated Clerk subject through the mapping first. Use a verified email only as a one-time legacy migration bridge, then persist the subject mapping and never use email as the ongoing identity key.