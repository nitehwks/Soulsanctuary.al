import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { Router as WouterRouter, useLocation } from "wouter";
import App from "./App";
import { NativeAppAuthProvider, WebAppAuthProvider } from "./lib/auth";
import { isCapacitorNativeApp } from "./lib/platform";
import "./index.css";
import "./i18n";

const clerkPubKey = import.meta.env.VITE_EXTERNAL_CLERK_PUBLISHABLE_KEY;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error(
    "Missing external Clerk publishable key.",
  );
}

function ClerkRoot() {
  const [, setLocation] = useLocation();
  if (isCapacitorNativeApp()) {
    return (
      <NativeAppAuthProvider publishableKey={clerkPubKey}>
        <App />
      </NativeAppAuthProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <WebAppAuthProvider>
        <App />
      </WebAppAuthProvider>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <WouterRouter base={basePath}>
    <ClerkRoot />
  </WouterRouter>,
);
