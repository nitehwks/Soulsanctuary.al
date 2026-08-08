import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import "./i18n";

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
