import { useEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

const PENDING_KEY = "pendingOAuthCallback";

/**
 * Pending OAuth Callback Handler
 *
 * When a native OAuth flow redirects back to the app via a custom URL scheme,
 * the deep link handler stores the full callback URL in localStorage and
 * reloads the app from `/`. This component reads that stored URL on startup,
 * sets the query params on the current page, and asks Clerk to complete the
 * sign-in. This avoids Capacitor's static-file routing problem with
 * `/oauth/callback`.
 */
export function PendingOAuthHandler() {
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const pending = localStorage.getItem(PENDING_KEY);
    console.log("[PendingOAuthHandler] pending:", pending);

    if (!pending) {
      setProcessing(false);
      return;
    }

    if (!clerk) {
      console.log("[PendingOAuthHandler] Clerk not loaded yet");
      return;
    }

    try {
      const pendingUrl = new URL(pending);
      const search = pendingUrl.search;

      if (!search.includes("__clerk_status")) {
        console.error("[PendingOAuthHandler] Missing Clerk params");
        localStorage.removeItem(PENDING_KEY);
        setError("Missing sign-in information.");
        setProcessing(false);
        return;
      }

      // Apply the callback query params to the current page without reloading,
      // so Clerk can read them via window.location.search.
      const newUrl = `${window.location.pathname}${search}${window.location.hash}`;
      window.history.replaceState(null, "", newUrl);
      console.log("[PendingOAuthHandler] replaced state with:", newUrl);

      clerk
        .handleRedirectCallback({
          redirectUrl: window.location.href,
        })
        .then(() => {
          console.log("[PendingOAuthHandler] handleRedirectCallback succeeded");
          localStorage.removeItem(PENDING_KEY);
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
        })
        .catch((err) => {
          console.error("[PendingOAuthHandler] handleRedirectCallback failed:", err);
          localStorage.removeItem(PENDING_KEY);
          setError("We couldn't complete the sign-in. Please try again.");
          setProcessing(false);
        });
    } catch (err) {
      console.error("[PendingOAuthHandler] failed to process pending callback:", err);
      localStorage.removeItem(PENDING_KEY);
      setError("Invalid sign-in information.");
      setProcessing(false);
    }
  }, [clerk]);

  if (!processing && !error) {
    return null;
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
