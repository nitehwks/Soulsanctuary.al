import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@shared/schema";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("trusthub_user_id");
    if (storedUserId) {
      fetch(`/api/users/${storedUserId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("User not found");
        })
        .then((user) => setCurrentUser(user))
        .catch(() => {
          localStorage.removeItem("trusthub_user_id");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSetUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("trusthub_user_id", user.id);
    } else {
      localStorage.removeItem("trusthub_user_id");
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
