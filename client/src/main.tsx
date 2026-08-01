import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import "./i18n";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const clerkSignInRedirectUrl = import.meta.env.VITE_CLERK_SIGN_IN_REDIRECT_URL as string | undefined;

if (!clerkPublishableKey || clerkPublishableKey.includes("your_clerk")) {
  console.warn(
    "[Clerk] VITE_CLERK_PUBLISHABLE_KEY is not configured. Authentication will not work until it is set in .env.local.",
  );
}

// Origins Clerk is allowed to redirect back to. Only http(s) origins belong
// here: this list also controls which redirect_url values clerk-js forwards
// to Clerk's API, and the API rejects non-http(s) schemes with
// "Invalid URL scheme". The WebView's own origin (https://localhost or
// capacitor://localhost) is same-origin and always allowed, so custom
// URL schemes (com.soulsanctuary.ai://) must NOT be listed — letting one
// through here is what broke OAuth on native.
const allowedRedirectOrigins = [
  "http://localhost",
  "https://localhost",
  "http://localhost:5001",
  "https://localhost:5001",
];

if (clerkSignInRedirectUrl) {
  try {
    const origin = new URL(clerkSignInRedirectUrl).origin;
    if (!allowedRedirectOrigins.includes(origin)) {
      allowedRedirectOrigins.push(origin);
    }
  } catch {
    // ignore invalid URL
  }
}

// Native social sign-in redirects through the backend's /auth/callback relay,
// so the backend origin must be an allowed redirect target.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  try {
    const origin = new URL(apiUrl).origin;
    if (!allowedRedirectOrigins.includes(origin)) {
      allowedRedirectOrigins.push(origin);
    }
  } catch {
    // ignore invalid URL
  }
}

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
