import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// Admin build toggle: admin mode requires BOTH the ".admin-key" file in the
// project root AND the explicit ADMIN_BUILD=1 environment opt-in. File
// presence alone is not enough: plain `npm run build` (web/deploy builds)
// always compiles user mode, even on the machine that holds the key, so the
// admin bundle can never be published to the web by accident. Only
// build-mobile.sh sets ADMIN_BUILD=1, and it does so for the local iOS build
// only. In admin mode the admin-only UI (dashboard, challenge-response
// login) is compiled into the bundle and the admin Ed25519 keypair is
// embedded via defines. Without admin mode, admin code and key material are
// stripped entirely. The key file is gitignored and never leaves this machine.
const adminKeyPath = path.resolve(import.meta.dirname, ".admin-key");
const isAdminBuild =
  process.env.ADMIN_BUILD === "1" && fs.existsSync(adminKeyPath);

let adminPublicKey = "";
let adminSecretKey = "";
if (isAdminBuild) {
  try {
    const parsed = JSON.parse(fs.readFileSync(adminKeyPath, "utf8"));
    adminPublicKey = parsed.publicKey || "";
    adminSecretKey = parsed.secretKey || "";
    if (!adminPublicKey || !adminSecretKey) {
      throw new Error("missing publicKey/secretKey");
    }
  } catch (error: any) {
    throw new Error(
      `.admin-key exists but could not be read (${error?.message}). ` +
        `Recreate it with: node scripts/create-admin-key.mjs`,
    );
  }
}

export default defineConfig({
  define: {
    __ADMIN_BUILD__: JSON.stringify(isAdminBuild),
    __ADMIN_PUBLIC_KEY__: JSON.stringify(adminPublicKey),
    __ADMIN_SECRET_KEY__: JSON.stringify(adminSecretKey),
  },
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
