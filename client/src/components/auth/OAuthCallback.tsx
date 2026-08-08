import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

/**
 * OAuth Callback Handler
 * Standard Clerk OAuth callback route for social sign-in and sign-up.
 */
export function OAuthCallback() {
  const clerk = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!clerk) {
      return;
    }

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
  }, [clerk]);

  useEffect(() => {
    if (!completed) return;
    if (!isLoaded || !isSignedIn) return;

    window.location.replace("/");
  }, [completed, isLoaded, isSignedIn]);

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
