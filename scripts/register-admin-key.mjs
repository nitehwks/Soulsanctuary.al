#!/usr/bin/env node
/**
 * Register the local .admin-key public key in the admin_keys database table.
 *
 * The database is the root of trust for admin access: a request is only admin
 * when it proves possession of a private key whose public key is registered
 * (and not revoked) in admin_keys. This script performs that registration for
 * the keypair created by scripts/create-admin-key.mjs.
 *
 * Usage:
 *   node scripts/register-admin-key.mjs [email] [phone]
 *
 * DATABASE_URL is read from the environment, falling back to .env.local / .env
 * in the project root.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keyPath = path.join(root, ".admin-key");

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const name of [".env.local", ".env"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/);
      if (match) return match[1].replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

if (!fs.existsSync(keyPath)) {
  console.error("No .admin-key file found. Run scripts/create-admin-key.mjs first.");
  process.exit(1);
}

const keyPayload = JSON.parse(fs.readFileSync(keyPath, "utf8"));
if (!keyPayload.publicKey) {
  console.error(".admin-key is missing publicKey. Recreate it with scripts/create-admin-key.mjs.");
  process.exit(1);
}

const databaseUrl = loadDatabaseUrl();
if (!databaseUrl) {
  console.error("DATABASE_URL not found in environment, .env.local, or .env.");
  process.exit(1);
}

const contactEmail = process.argv[2] || null;
const contactPhone = process.argv[3] || null;

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();

  const existing = await client.query(
    "SELECT id, revoked_at FROM admin_keys WHERE public_key = $1",
    [keyPayload.publicKey],
  );

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (row.revoked_at) {
      console.error(`This public key is already registered (id ${row.id}) but REVOKED. Create a new keypair instead.`);
      process.exit(1);
    }
    console.log(`Public key already registered as admin key id ${row.id}. Nothing to do.`);
    process.exit(0);
  }

  const result = await client.query(
    `INSERT INTO admin_keys (public_key, label, contact_email, contact_phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [keyPayload.publicKey, keyPayload.label || "admin", contactEmail, contactPhone],
  );

  console.log(`Registered admin key id ${result.rows[0].id} (label: "${keyPayload.label || "admin"}")`);
  console.log("Admin access is now live for the locally-built admin client.");
} finally {
  await client.end().catch(() => {});
}
