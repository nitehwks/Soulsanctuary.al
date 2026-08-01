import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { Browser } from "@capacitor/browser";
import { Button } from "@/components/ui/button";
import { getBaseUrl } from "@/lib/deepLink";

const isCapacitorNative =
  typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.() === true;

/**
 * Native Social Sign-In
 *
 * Clerk's built-in <SignIn> social buttons cannot work in a Capacitor WebView:
 * the iOS WebView origin is capacitor://localhost and Clerk's API only accepts
 * http(s) redirect URLs ("Invalid URL scheme"), and Google blocks OAuth inside
 * embedded WebViews entirely.
 *
 * Instead, these buttons start the OAuth flow headlessly (signIn.create),
 * open the provider's authorize URL in the system browser, and let the
 * backend's /auth/callback relay bounce the result back into the app via the
 * custom URL scheme. The deep-link handler + PendingOAuthHandler complete the
 * sign-in from there.
 */
export function NativeSocialSignIn() {
  const { isLoaded, signIn } = useSignIn();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isCapacitorNative) {
    return null;
  }

  const startOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded || !signIn || pending) return;
    setPending(strategy);
    setError(null);
    try {
      await signIn.create({
        strategy,
        redirectUrl: `${getBaseUrl()}/auth/callback`,
      });
      const externalUrl = signIn.firstFactorVerification?.externalVerificationRedirectURL;
      if (!externalUrl) {
        throw new Error("Clerk did not return an external verification URL");
      }
      await Browser.open({ url: externalUrl.toString() });
    } catch (err) {
      console.error("[NativeSocialSignIn] failed to start OAuth:", err);
      setError("Couldn't start sign-in. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full"
        disabled={!isLoaded || !!pending}
        onClick={() => startOAuth("oauth_apple")}
      >
        {pending === "oauth_apple" ? "Opening Safari..." : "Continue with Apple"}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        disabled={!isLoaded || !!pending}
        onClick={() => startOAuth("oauth_google")}
      >
        {pending === "oauth_google" ? "Opening Safari..." : "Continue with Google"}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
