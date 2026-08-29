#!/bin/bash
set -e

# Install any new/changed dependencies (no-op if lockfile unchanged)
npm install --no-audit --no-fund

# Sync the database schema with the Drizzle definitions
if [ -f .env.local ]; then
  yes '' | node --env-file=.env.local node_modules/drizzle-kit/bin.cjs push --force
else
  yes '' | node_modules/.bin/drizzle-kit push --force
fi
