import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
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
      appearance={{
        theme: shadcn,
        variables: {
          colorPrimary: "#7c3aed",
          borderRadius: "0.75rem",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        elements: {
          socialButtonsBlockButton: {
            backgroundColor: "#ffffff",
            borderColor: "#d4d4d8",
            color: "#18181b",
          },
          socialButtonsBlockButtonText: {
            color: "#18181b",
            fontWeight: "600",
            opacity: "1",
          },
          socialButtonsProviderIcon: {
            color: "#18181b",
            display: "block",
            flexShrink: "0",
            height: "1.25rem",
            opacity: "1",
            width: "1.25rem",
          },
        },
      }}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue to SoulSanctuary",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Begin your SoulSanctuary journey",
          },
        },
      }}
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
