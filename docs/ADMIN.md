# Admin System

SoulSanctuary has a deliberately hard-to-abuse admin system. This document
describes the architecture, the threat model, and how to build and operate
the admin client.

## Design goals

- **No self-serve admin.** A user who downloads and compiles the public repo
  can never make themselves admin. There is no env var, config flag, email
  list, or "first user" rule that grants admin.
- **The database is the only root of trust.** A request is admin only when it
  proves possession of a private key whose public key is registered (and not
  revoked) in the `admin_keys` table.
- **The private key never leaves the owner's machine.** It lives only in the
  gitignored `.admin-key` file and inside the locally-compiled iOS admin
  bundle. It is never transmitted; it only signs server-issued challenges.
- **Admin code never ships.** Android builds and any published build are
  compiled in user mode: all admin UI, the admin client library, and the key
  material are excluded from the bundle at build time.
- **Two-factor access.** Opening the admin dashboard requires both the device
  holding the private key *and* a biometric (Face ID / Touch ID) or device
  passcode unlock.

## How it works

### Identity: Ed25519 keypair

Admin identity is an Ed25519 keypair generated locally by
`scripts/create-admin-key.mjs`. Only the public key is registered on the
server (in `admin_keys`). Emails/phone numbers stored on a key row are
contact metadata only — they play no role in authentication.

### Login: challenge-response

1. The client asks the server for a challenge (`POST /api/admin/challenge`)
   for its public key. Unknown or revoked keys get a 404 — the same response
   as a nonexistent route.
2. The server stores a single-use nonce (`admin_challenges`, 2-minute TTL).
3. The user unlocks the device with biometrics/passcode, then the client
   signs the nonce locally with the embedded private key.
4. The client exchanges the signature (`POST /api/admin/verify`) for a
   session token (`admin_sessions`, 15-minute TTL).
5. All admin API calls carry the token in the `x-admin-token` header.

Every admin endpoint returns **404** (not 401/403) on any auth failure, so
the admin surface is indistinguishable from missing routes. The admin API
code is safe to deploy publicly — without a registered key it can issue no
tokens. All admin actions are written to the hash-chained `audit_logs` table.

### Build-time toggle

Admin mode requires **two** conditions in `vite.config.ts`:

1. the `.admin-key` file present in the project root, and
2. the explicit `ADMIN_BUILD=1` environment opt-in.

- **Both present** → admin build: `__ADMIN_BUILD__` is true, the keypair is
  embedded via `__ADMIN_PUBLIC_KEY__` / `__ADMIN_SECRET_KEY__` defines, and
  `App.tsx` lazily loads `pages/AdminDashboard.tsx` at `/admin`.
- **Either missing** → user build: the flag is `false`, the keys are empty
  strings, and Rollup drops the dynamic import entirely — no admin code in
  the bundle.

The env opt-in exists so that a plain `npm run build` on the machine that
holds `.admin-key` can never produce a publishable admin bundle: web and
deploy builds are always user mode. Only `build-mobile.sh` sets
`ADMIN_BUILD=1`, and only for the local iOS build. The iOS app points at the
deployed backend via `VITE_API_URL` in `.env.local`.

`build-mobile.sh` in admin mode:

1. builds the web bundle with `ADMIN_BUILD=1`,
2. syncs/builds **iOS only** (Android is skipped entirely, so admin code can
   never reach the Android app), then
3. rebuilds `dist/` in user mode, so the on-disk web output left behind
   never contains admin code or key material. The admin bundle exists only
   inside the locally-compiled iOS app.

## Operating the admin system

### First-time setup

```bash
# 1. Apply the schema (creates admin_keys, admin_challenges, admin_sessions,
#    and adds conversations.status for feedback triage)
npm run db:push

# 2. Generate your keypair (writes gitignored .admin-key, mode 0600)
node scripts/create-admin-key.mjs "Jordan's iPhone"

# 3. Register the public key in the database
node scripts/register-admin-key.mjs you@example.com +15551234567

# 4. Build the admin client (iOS only)
./build-mobile.sh
```

Install the iOS build on your device, sign in as your normal user, and
navigate to `/admin`. Unlock with Face ID / Touch ID / passcode.

### Returning to user-mode builds

Web builds are always user mode unless `ADMIN_BUILD=1` is set explicitly —
nothing to do. Native builds: delete (or rename) `.admin-key` and rebuild.
User builds contain no admin code. **Always build user mode unless an admin
build is explicitly needed.**

### Adding another admin device

1. On the new device/machine: `node scripts/create-admin-key.mjs "label"`
2. In the existing admin dashboard → Keys tab, paste the new PUBLIC key.
   (Or run `register-admin-key.mjs` on that machine.)
3. Build the admin client on that machine.

### Revoking a key

Admin dashboard → Keys tab → Revoke. Immediate effect. The last active key
cannot be revoked (lockout guard); if your only key is lost, remove the row
from `admin_keys` directly in the database.

### Rotating your own key

Create the new keypair, register the new public key (dashboard or script),
verify the new key works, then revoke the old key and delete the old
`.admin-key` file.

## Dashboard functions

- **Feedback** — every user's feedback submissions with triage
  (submitted / reviewed / resolved).
- **Logs** — the hash-chained audit log, filterable by action.
- **Keys** — list/register/revoke admin keys and their contact metadata.
- **Moderation** — review queue for auto-moderated group messages; restore
  or permanently delete.

## Threat model notes

- Stealing the repo gives nothing: no admin code paths grant privilege, and
  no keys are present.
- Stealing the server env gives nothing: no admin secret exists in env.
- Forging a token requires an Ed25519 signature over a fresh single-use
  nonce — infeasible without the private key.
- Stealing the `.admin-key` file alone is not enough to be *unnoticed*:
  every login and action is audit-logged with the key label, and the key can
  be revoked from the dashboard.
- The residual risks are physical: an attacker with the unlocked device
  within a 15-minute session window, or with both the `.admin-key` file and
  a registered public key. Mitigate by revoking promptly.
