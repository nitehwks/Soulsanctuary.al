---
name: Capacitor CLI needs Node 22
description: Capacitor 8 requires Node >= 22; workspace now runs the nodejs-22 module
---
Capacitor CLI 8 refuses to run on Node 20 ("The Capacitor CLI requires NodeJS >=22.0.0").

**Resolved (July 2026):** The workspace module was upgraded to nodejs-22 (`.replit` modules list). `npx cap sync` runs directly.

**How to apply:** If the Node module is ever downgraded below 22, either reinstall the nodejs-22+ module or use the temporary shell workaround `nix-shell -p nodejs_22 --run "npx cap sync"`.
