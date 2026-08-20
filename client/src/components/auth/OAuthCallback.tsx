import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildAppSchemeUrl,
  getAppOrigin,
} from "@/lib/nativeAuth";

/**
 * OAuth Callback Handler
 *
 * Web flows complete here directly. Native flows are marked with `native=1`
 * (see client/src/lib/nativeAuth.ts): the Clerk sign-in state lives in the
 * app webview's storage on the app origin, so whenever this page loads
 * anywhere else (system browser, or the remote origin inside the webview),
 * we bounce to the soulsanctuary:// scheme, which reopens the app and lands
 * back on this route — on the app origin, where completion succeeds.
 */
export function OAuthCallback() {
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [returningToApp, setReturningToApp] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const isNativeFlow = params.get("native") === "1";
  const onAppOrigin = window.location.origin === getAppOrigin();

  const schemeUrl = (() => {
    const cleaned = new URLSearchParams(window.location.search);
    cleaned.delete("native");
    const search = cleaned.toString();
    return buildAppSchemeUrl("/sso-callback", search ? `?${search}` : "");
  })();

  useEffect(() => {
    // Native flow loaded outside the app origin: hand off to the app.
    if (isNativeFlow && !onAppOrigin) {
      setReturningToApp(true);
      const timer = setTimeout(() => {
        window.location.href = schemeUrl;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isNativeFlow, onAppOrigin, schemeUrl]);

  useEffect(() => {
    if (isNativeFlow && !onAppOrigin) return; // bouncing to the app instead
    if (!clerk) return;

    clerk
      .handleRedirectCallback({})
      .then(() => {
        setCompleted(true);
      })
      .catch((err) => {
        console.error("[OAuthCallback] redirect callback failed:", err);
        const detail = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message;
        setError(
          detail
            ? `We couldn't complete the sign-in: ${detail}`
            : "We couldn't complete the sign-in. Please try again.",
        );
      });
  }, [clerk, isNativeFlow, onAppOrigin]);

  useEffect(() => {
    if (!completed) return;
    if (!isLoaded || !isSignedIn) return;

    window.location.replace("/");
  }, [completed, isLoaded, isSignedIn]);

  if (returningToApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-4">
        <Smartphone className="w-10 h-10 text-primary" />
        <p className="font-medium">Returning to the app…</p>
        <p className="text-sm text-muted-foreground">
          If nothing happens, tap the button below.
        </p>
        <Button asChild>
          <a href={schemeUrl}>Open SoulSanctuary</a>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <a href="/sign-in" className="mt-4 text-primary underline">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
