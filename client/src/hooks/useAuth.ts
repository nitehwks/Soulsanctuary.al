import { useQuery } from "@tanstack/react-query";
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
  
  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode');
    const guestUserId = localStorage.getItem('guestUserId');
    
    if (guestMode === 'true' && guestUserId) {
      setGuestUser({
        id: guestUserId,
        firstName: 'Guest',
        lastName: 'User',
        email: null,
        profileImageUrl: null,
        isGuest: true
      });
    }
  }, []);

  const { data: authUser, isLoading: isAuthLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !guestUser,
  });

  const user: User | null = authUser || guestUser || null;
  const isLoading = !guestUser && isAuthLoading;

  const logout = async () => {
    if (guestUser) {
      localStorage.removeItem('guestMode');
      localStorage.removeItem('guestUserId');
      window.location.reload();
    } else {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      } catch (error) {
        console.error("Logout error:", error);
        window.location.href = "/";
      }
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGuest: !!guestUser,
    logout,
  };
}
