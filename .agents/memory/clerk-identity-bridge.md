---
name: Clerk identity bridge
description: Identity precedence when managed and standard Clerk sessions share local application data.
---

Use a verified managed local-user claim as the primary application-data key, and bind that key to the authenticated Clerk issuer and subject. When the claim is absent, resolve the subject through the durable identity binding; verified email is allowed only for the initial legacy link.

**Why:** Replit-managed Clerk preserves migrated local IDs in session claims, while standard Clerk sessions may expose only the provider subject. Treating the provider subject directly as a local ID can orphan existing data, but rejecting it can lock out valid users.

**How to apply:** Clerk API calls use the authenticated provider subject. Local data uses the claimed local ID when present, otherwise the persisted issuer-and-subject mapping. Never trust a client-submitted user ID as the bridge.