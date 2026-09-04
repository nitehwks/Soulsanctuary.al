import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { getClerkEnvironment } from "./shared/clerkEnvironment";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

const useProductionClerk = getClerkEnvironment() === "production";
const prodPublishableKey =
  process.env.EXTERNAL_CLERK_PROD_PUBLISHABLE_KEY;
const hasProductionKeys = Boolean(
  prodPublishableKey && process.env.EXTERNAL_CLERK_PROD_SECRET_KEY,
);
const clerkPublishableKey =
  useProductionClerk && hasProductionKeys
    ? prodPublishableKey
    : process.env.EXTERNAL_CLERK_DEV_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing external Clerk Development publishable key.");
}

export default defineConfig({
  define: {
    "import.meta.env.VITE_EXTERNAL_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      clerkPublishableKey,
    ),
  },
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
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
