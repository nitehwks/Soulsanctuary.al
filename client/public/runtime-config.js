/**
 * SoulSanctuary Runtime Configuration
 *
 * This file controls which backend the native iOS/Android apps talk to.
 * Web apps use same-origin relative URLs and ignore this setting.
 *
 * To switch environments, uncomment ONE block and comment out the other,
 * then rebuild the app (npm run build && npx cap sync).
 */

// === REPLIT DEPLOYMENT (live production backend) ===
window.SOULSANCTUARY_CONFIG = {
  API_URL: "https://soulsanctuaryal--joeabbott2.replit.app",
};

// === LOCAL DEVELOPMENT (Mac / local backend, commented out) ===
// window.SOULSANCTUARY_CONFIG = {
//   API_URL: "http://localhost:5001",
// };
