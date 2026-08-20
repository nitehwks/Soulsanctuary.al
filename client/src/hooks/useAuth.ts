import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/queryClient";
import { isNativeApp } from "@/lib/platform";

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

export function useAuth() {
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [localUserLoaded, setLocalUserLoaded] = useState(false);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();

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

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !clerkUser) {
      setLocalUser(null);
      setLocalUserLoaded(true);
      return;
    }

    let cancelled = false;
    setLocalUserLoaded(false);

    void (async () => {
      const headers: Record<string, string> = {};
      if (isNativeApp()) {
        const token = await getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl("/api/auth/user"), {
        credentials: "include",
        headers,
      });
      if (!response.ok) {
        throw new Error(`Unable to load signed-in user (${response.status})`);
      }

      const user = (await response.json()) as AuthUser;
      if (!cancelled) setLocalUser(user);
    })()
      .catch((error) => {
        console.error("[Auth] Failed to load the application user:", error);
        if (!cancelled) setLocalUser(null);
      })
      .finally(() => {
        if (!cancelled) setLocalUserLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clerkUser, getToken, isLoaded, isSignedIn]);

  const user: User | null = localUser || guestUser || null;

  const logout = async () => {
    if (guestUser) {
      localStorage.removeItem("guestMode");
      localStorage.removeItem("guestUserId");
      window.location.reload();
    } else if (isSignedIn) {
      await signOut();
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  return {
    user,
    isLoading: !isLoaded || (!!isSignedIn && !localUserLoaded),
    isAuthenticated: !!user,
    isGuest: !!guestUser,
    logout,
  };
}
