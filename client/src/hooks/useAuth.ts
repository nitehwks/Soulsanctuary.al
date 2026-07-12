import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/queryClient";

interface GuestUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profileImageUrl: string | null;
  isGuest: true;
}

interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  isGuest?: false;
}

type User = AuthUser | GuestUser;

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkConfigured = !!clerkKey && !clerkKey.includes("your_clerk") && !clerkKey.includes("...");

export const DEV_AUTH_TOKEN = "dev-token";

const DEV_USER: AuthUser = {
  id: "dev-user-001",
  firstName: "Local",
  lastName: "Dev",
  email: "dev@local.test",
  profileImageUrl: null,
};

export function useAuth() {
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [localAuth, setLocalAuth] = useState(false);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();

  // If Clerk isn't signed in but we have a local dev token, treat that as authenticated.
  useEffect(() => {
    const token = localStorage.getItem("clerkSessionToken");
    setLocalAuth(token === DEV_AUTH_TOKEN);
  }, []);

  // Dev fallback: when Clerk keys are not configured AND no Clerk user is
  // signed in, automatically obtain a dev token so API calls work without a
  // real auth provider. We wait until Clerk has finished loading so we don't
  // race against a real Apple/Google sign-in that's still initialising.
  useEffect(() => {
    if (isClerkConfigured) return;
    if (!isLoaded) return;
    if (isSignedIn) return;

    let cancelled = false;
    fetch(getApiUrl("/api/dev-login"), { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.token) {
          localStorage.setItem("clerkSessionToken", data.token);
          setLocalAuth(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const guestMode = localStorage.getItem("guestMode");
    const guestUserId = localStorage.getItem("guestUserId");

    if (guestMode === "true" && guestUserId) {
      setGuestUser({
        id: guestUserId,
        firstName: "Guest",
        lastName: "User",
        email: null,
        profileImageUrl: null,
        isGuest: true,
      });
    }
  }, []);

  let authUser: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        profileImageUrl: clerkUser.imageUrl,
      }
    : null;

  // When Clerk is not configured (or local auth is active), fall back to the dev user.
  if (!authUser && (localAuth || (!isClerkConfigured && !guestUser))) {
    authUser = DEV_USER;
  }

  const user: User | null = authUser || guestUser || null;

  const logout = async () => {
    if (guestUser) {
      localStorage.removeItem("guestMode");
      localStorage.removeItem("guestUserId");
      window.location.reload();
    } else if (isSignedIn) {
      await signOut();
      localStorage.removeItem("clerkSessionToken");
      window.location.href = "/";
    } else {
      localStorage.removeItem("clerkSessionToken");
      window.location.reload();
    }
  };

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    isGuest: !!guestUser,
    logout,
  };
}

/**
 * Sign in with the local dev account. This bypasses Clerk and is useful for
 * local/mobile testing when HTTPS/OAuth isn't set up yet.
 */
export async function signInWithLocalAccount(): Promise<void> {
  try {
    const res = await fetch(getApiUrl("/api/dev-login"), { method: "POST", credentials: "include" });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("clerkSessionToken", data.token);
      localStorage.removeItem("guestMode");
      localStorage.removeItem("guestUserId");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Local sign-in failed:", error);
  }
}
