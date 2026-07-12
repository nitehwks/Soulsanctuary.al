import { useEffect, useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

/**
 * OAuth Callback Handler
 *
 * Native OAuth flows (Sign in with Apple, Google, etc.) redirect back to the
 * app via a custom URL scheme. The deep link handler forwards those parameters
 * to this route so Clerk can complete the sign-in and exchange the OAuth code.
 */
export function OAuthCallback() {
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[OAuthCallback] mounted. location:", window.location.href);
    if (!clerk) {
      console.warn("[OAuthCallback] Clerk instance not available yet");
      return;
    }

    if (!window.location.search.includes("__clerk_status")) {
      console.error("[OAuthCallback] Missing Clerk callback params");
      setError("Missing sign-in information. Please try again.");
      return;
    }

    // Clerk will read __clerk_status and other params from the current URL.
    clerk
      .handleRedirectCallback({
        redirectUrl: window.location.href,
      })
      .then(() => {
        console.log("[OAuthCallback] handleRedirectCallback succeeded");
        // Give Clerk a moment to update auth state, then send the user home.
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      })
      .catch((err) => {
        console.error("[OAuthCallback] handleRedirectCallback failed:", err);
        setError("We couldn't complete the sign-in. Please try again.");
      });
  }, [clerk]);

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
