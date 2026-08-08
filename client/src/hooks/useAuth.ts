import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

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
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

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

  const user: User | null = authUser || guestUser || null;

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
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    isGuest: !!guestUser,
    logout,
  };
}
