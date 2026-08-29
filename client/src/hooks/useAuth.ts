import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/queryClient";
import { isNativeApp } from "@/lib/platform";

interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

export function useAuth() {
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [localUserLoaded, setLocalUserLoaded] = useState(false);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut, getToken } = useClerkAuth();

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
      const response = await apiFetch("/api/auth/user", {
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

  const logout = async () => {
    if (isSignedIn) await signOut({ redirectUrl: "/" });
  };

  return {
    user: localUser,
    isLoading: !isLoaded || (!!isSignedIn && !localUserLoaded),
    isAuthenticated: Boolean(isSignedIn && localUser),
    logout,
  };
}
