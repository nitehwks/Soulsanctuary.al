#!/bin/bash
set -e

# Install any new/changed dependencies (no-op if lockfile unchanged)
npm install --no-audit --no-fund

# Sync the database schema with the Drizzle definitions
npm run db:push -- --force
