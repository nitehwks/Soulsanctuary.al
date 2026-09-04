---
name: Clerk identity bridge
description: Stable local ownership when external Clerk subjects replace legacy application identities.
---

Resolve authenticated users through a durable Clerk issuer-and-subject mapping. A verified email match is allowed only to create the initial migration link to an existing local user.

**Why:** External Clerk subjects are not application user IDs. Trusting a session claim or client-submitted ID as a local owner can misbind data, while using the provider subject directly can orphan legacy records.

**How to apply:** Authenticate with Clerk, look up the persisted issuer/subject binding, and use the bound local ID for application data. Permit verified-email matching only during first-time migration. Never use client input or arbitrary session claims as the bridge.

The two production legacy users without email addresses are test/anonymous accounts. Their records do not need to be migrated and should not block the external Clerk rollout.