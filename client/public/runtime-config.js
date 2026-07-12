/**
 * SoulSanctuary Runtime Configuration
 *
 * This file controls which backend the native iOS/Android apps talk to.
 * Web apps use same-origin relative URLs and ignore this setting.
 *
 * To switch environments, uncomment ONE block and comment out the other,
 * then rebuild the app.
 */

// === LOCAL DEVELOPMENT (Mac / local backend) ===
window.SOULSANCTUARY_CONFIG = {
  API_URL: "http://localhost:5001",
};

// === REPLIT DEPLOYMENT (commented out) ===
// Replace the URL below with your actual Replit deployment URL.
// window.SOULSANCTUARY_CONFIG = {
//   API_URL: "https://your-repl.janeway.replit.dev",
// };
