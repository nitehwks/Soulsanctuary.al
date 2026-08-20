import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import "./i18n";
import { isNativeApp } from "./lib/platform";
import { appSchemeUrlToPath } from "./lib/nativeAuth";

// Native deep-link entry: soulsanctuary://some/path?query routes the webview
// to /some/path?query. This is how an OAuth flow that escaped to the system
// browser gets pulled back into the app (see client/src/lib/nativeAuth.ts).
if (isNativeApp()) {
  import("@capacitor/app").then(({ App: CapacitorApp }) => {
    CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      const path = appSchemeUrlToPath(url);
      if (path) {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });
  });
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!clerkPublishableKey || clerkPublishableKey.includes("your_clerk")) {
  console.warn(
    "[Clerk] VITE_CLERK_PUBLISHABLE_KEY is not configured. Authentication will not work until it is set in .env.local.",
  );
}

function getAllowedRedirectOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost",
    "https://localhost",
    "http://localhost:5001",
    "https://localhost:5001",
  ]);

  const runtimeConfig =
    (typeof window !== "undefined" && (window as any).SOULSANCTUARY_CONFIG) || {};
  const runtimeApiUrl = runtimeConfig.API_URL as string | undefined;
  const envApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const candidates = [runtimeApiUrl, envApiUrl];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        origins.add(url.origin);
      }
    } catch {
      // Ignore malformed URLs
    }
  }

  return Array.from(origins);
}

const allowedRedirectOrigins = getAllowedRedirectOrigins();

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={clerkPublishableKey || ""}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    allowedRedirectOrigins={allowedRedirectOrigins}
  >
    <App />
  </ClerkProvider>,
);
