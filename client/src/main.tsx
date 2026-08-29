import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Router as WouterRouter, useLocation } from "wouter";
import App from "./App";
import "./index.css";
import "./i18n";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Replit-managed Clerk is not configured.",
  );
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
  },
  variables: {
    colorPrimary: "hsl(270 60% 45%)",
    colorForeground: "hsl(270 25% 12%)",
    colorMutedForeground: "hsl(270 10% 42%)",
    colorDanger: "hsl(0 72% 51%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(270 15% 96%)",
    colorInputForeground: "hsl(270 25% 12%)",
    colorNeutral: "hsl(270 15% 82%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden border border-purple-200 shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-950 font-heading",
    headerSubtitle: "text-slate-600",
    socialButtonsBlockButtonText: "text-slate-900",
    formFieldLabel: "text-slate-800",
    footerActionLink: "text-purple-700 font-semibold",
    footerActionText: "text-slate-600",
    dividerText: "text-slate-500",
    identityPreviewEditButton: "text-purple-700",
    formFieldSuccessText: "text-emerald-700",
    alertText: "text-red-800",
    logoBox: "h-14",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton:
      "border-purple-200 bg-white hover:bg-purple-50",
    formButtonPrimary:
      "bg-purple-700 text-white hover:bg-purple-800 shadow-sm",
    formFieldInput:
      "border-purple-200 bg-purple-50/40 text-slate-950 focus:border-purple-500",
    footerAction: "bg-transparent",
    dividerLine: "bg-purple-200",
    alert: "border-red-200 bg-red-50",
    otpCodeFieldInput: "border-purple-200 text-slate-950",
    formFieldRow: "text-slate-900",
    main: "gap-5",
  },
};

function ClerkRoot() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue your journey",
          },
        },
        signUp: {
          start: {
            title: "Find your sanctuary",
            subtitle: "Create an account to get started",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <WouterRouter base={basePath}>
    <ClerkRoot />
  </WouterRouter>,
);
