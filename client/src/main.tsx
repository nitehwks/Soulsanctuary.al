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

// Origins Clerk is allowed to redirect back to. This includes local Capacitor
// app origins and any HTTPS tunnel/production domain used for OAuth callbacks.
const allowedRedirectOrigins = [
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
  "http://localhost:5001",
  "https://localhost:5001",
  // iOS/Android custom URL scheme for Clerk native OAuth callbacks.
  // Clerk is picky about the origin format, so include several variations.
  "com.soulsanctuary.ai",
  "com.soulsanctuary.ai://",
  "com.soulsanctuary.ai://oauth",
  "com.soulsanctuary.ai://localhost",
  "com.soulsanctuary.ai://oauth/callback",
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
