#!/usr/bin/env node
/**
 * Create a new admin Ed25519 keypair.
 *
 * Writes the keypair to the gitignored ".admin-key" file in the project root.
 * The mere PRESENCE of this file at build time switches the client build into
 * admin mode (admin UI compiled in, keys embedded). Delete it to go back to
 * user-mode builds.
 *
 * The private key never leaves this machine. Only the public key is sent to
 * the server (via scripts/register-admin-key.mjs) for registration in the
 * admin_keys database table.
 *
 * Usage:
 *   node scripts/create-admin-key.mjs "My iPhone"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nacl from "tweetnacl";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keyPath = path.join(root, ".admin-key");
const label = process.argv[2] || "admin";

if (fs.existsSync(keyPath)) {
  console.error(
    `Refusing to overwrite existing ${keyPath}.\n` +
      `Delete it first if you really want to rotate keys (remember to revoke the old public key in the admin dashboard).`,
  );
  process.exit(1);
}

const keyPair = nacl.sign.keyPair();
const payload = {
  label,
  publicKey: Buffer.from(keyPair.publicKey).toString("base64"),
  secretKey: Buffer.from(keyPair.secretKey).toString("base64"),
  createdAt: new Date().toISOString(),
};

fs.writeFileSync(keyPath, JSON.stringify(payload, null, 2) + "\n", { mode: 0o600 });

console.log(`Admin keypair written to ${keyPath} (label: "${label}")`);
console.log(`Public key: ${payload.publicKey}`);
console.log("");
console.log("Next steps:");
console.log("  1. Apply the schema to the database:  npm run db:push");
console.log("  2. Register the public key:           node scripts/register-admin-key.mjs");
console.log("  3. Build the admin client:            ./build-mobile.sh (with .admin-key present)");
console.log("");
console.log("Keep .admin-key secret and never commit it (it is gitignored).");
