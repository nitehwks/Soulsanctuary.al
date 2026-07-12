#!/bin/bash
set -e

npm install

if npm run --silent 2>/dev/null | grep -q "db:push"; then
  npm run db:push -- --force 2>/dev/null || true
fi
