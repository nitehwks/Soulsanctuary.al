/**
 * SoulSanctuary Runtime Configuration
 *
 * This file controls which backend the native iOS/Android apps talk to.
 * Web apps use same-origin relative URLs and ignore this setting.
 *
 * TO SWITCH BACKENDS: change ACTIVE_BACKEND below to one of the keys in
 * BACKENDS, then rebuild and sync the native apps:
 *
 *     npm run build && npx cap sync
 *
 * Fill in your ngrok / tailscale URLs once (they change rarely), then
 * switching platforms is a one-word edit.
 */

// === BACKEND TARGETS ===
const BACKENDS = {
  // Live production backend on Replit
  replit: "https://soulsanctuaryal--joeabbott2.replit.app",

  // ngrok tunnel to your local backend (ngrok http 5001)
  // TODO: paste your ngrok URL here, e.g. "https://abc123.ngrok-free.app"
  ngrok: "https://YOUR-TUNNEL.ngrok-free.app",

  // Tailscale serve/funnel to your local backend (tailscale serve 5001)
  // TODO: paste your tailnet URL here, e.g. "https://your-mac.your-tailnet.ts.net"
  tailscale: "https://YOUR-MACHINE.YOUR-TAILNET.ts.net",

  // Plain localhost (simulator/emulator on the same machine)
  local: "http://localhost:5001",
};

// === ACTIVE BACKEND — change this ONE value ("replit" | "ngrok" | "tailscale" | "local") ===
const ACTIVE_BACKEND = "replit";

const apiUrl = BACKENDS[ACTIVE_BACKEND];
if (!apiUrl) {
  console.warn(
    `[runtime-config] Unknown ACTIVE_BACKEND "${ACTIVE_BACKEND}", falling back to "replit". ` +
    `Valid options: ${Object.keys(BACKENDS).join(", ")}`
  );
}

window.SOULSANCTUARY_CONFIG = {
  API_URL: apiUrl || BACKENDS.replit,
  // Optional: external feedback app URL loaded in Feedback mode
  // FEEDBACK_APP_URL: "https://your-feedback-app.example.com",
};

console.info(`[runtime-config] Backend: ${ACTIVE_BACKEND} -> ${window.SOULSANCTUARY_CONFIG.API_URL}`);
