---
name: Capacitor CLI needs Node 22
description: How to run npx cap sync in this workspace, which runs Node 20 while Capacitor 8 requires Node >= 22
---
Capacitor CLI 8 refuses to run on the workspace's Node 20 ("The Capacitor CLI requires NodeJS >=22.0.0").

**Why:** The project runtime is pinned to Node 20; upgrading the whole module just for cap sync is risky.

**How to apply:** Run native syncs via a temporary shell: `nix-shell -p nodejs_22 --run "npx cap sync"`. Works without changing the project runtime; first invocation may be slow while nix fetches.
