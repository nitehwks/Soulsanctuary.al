import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { useLocation } from "wouter";
import App from "./App";
import "./index.css";
import "./i18n";

const clerkPublishableKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPublishableKey || clerkPublishableKey.includes("your_clerk")) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Replit-managed Clerk is not configured.",
  );
}

function ClerkRoot() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      proxyUrl={clerkProxyUrl}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      routerPush={(to) => setLocation(to)}
      routerReplace={(to) => setLocation(to, { replace: true })}
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <ClerkRoot />,
);
