import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/react";
import { App as CapacitorApp } from "@capacitor/app";
import { registerPlugin } from "@capacitor/core";

export interface AppUser {
  id: string;
  externalId?: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  primaryEmailAddress: { emailAddress: string } | null;
}

type NativeAuthState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AppUser | null;
};

interface ClerkNativePlugin {
  configure(options: { publishableKey: string }): Promise<NativeAuthState>;
  getState(): Promise<NativeAuthState>;
  startHostedAuth(options: { mode: "signIn" | "signUp" }): Promise<NativeAuthState>;
  getToken(): Promise<{ token: string | null }>;
  signOut(): Promise<NativeAuthState>;
}

const ClerkNative = registerPlugin<ClerkNativePlugin>("ClerkNative");

type AppAuthValue = NativeAuthState & {
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  startHostedAuth: (mode: "signIn" | "signUp") => Promise<void>;
  error: string | null;
};

const AppAuthContext = createContext<AppAuthValue | null>(null);

export function useAppAuth(): AppAuthValue {
  const value = useContext(AppAuthContext);
  if (!value) throw new Error("useAppAuth must be used within an AppAuthProvider.");
  return value;
}

export function useAppUser(): Pick<AppAuthValue, "user" | "isLoaded" | "isSignedIn"> {
  const { user, isLoaded, isSignedIn } = useAppAuth();
  return { user, isLoaded, isSignedIn };
}

export function WebAppAuthProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const value = useMemo<AppAuthValue>(
    () => ({
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      user: user
        ? {
            id: user.id,
            externalId: user.externalId,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            primaryEmailAddress: user.primaryEmailAddress
              ? { emailAddress: user.primaryEmailAddress.emailAddress }
              : null,
          }
        : null,
      getToken: () => getToken(),
      signOut: () => signOut({ redirectUrl: "/" }),
      // This provider is only mounted on web, where Clerk's standard UI owns auth.
      startHostedAuth: async () => {},
      error: null,
    }),
    [getToken, isLoaded, isSignedIn, signOut, user],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function NativeAppAuthProvider({
  publishableKey,
  children,
}: {
  publishableKey: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<NativeAuthState>({
    isLoaded: false,
    isSignedIn: false,
    user: null,
  });
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const nextState = await ClerkNative.getState();
    setState(nextState);
    setError(null);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const nextState = await ClerkNative.configure({ publishableKey });
        if (active) {
          setState(nextState);
          setError(null);
        }
      } catch (cause) {
        if (active) {
          setState((current) => ({ ...current, isLoaded: true }));
          setError(cause instanceof Error ? cause.message : "Unable to initialize authentication.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [publishableKey]);

  useEffect(() => {
    let listenerRemoved = false;
    let listener: Awaited<ReturnType<typeof CapacitorApp.addListener>> | undefined;
    void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void refresh();
    }).then((handle) => {
      if (listenerRemoved) {
        void handle.remove();
      } else {
        listener = handle;
      }
    });

    return () => {
      listenerRemoved = true;
      if (listener) void listener.remove();
    };
  }, [refresh]);

  const startHostedAuth = useCallback(
    async (mode: "signIn" | "signUp") => {
      try {
        setError(null);
        const nextState = await ClerkNative.startHostedAuth({ mode });
        setState(nextState);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to start authentication.");
      }
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    try {
      const nextState = await ClerkNative.signOut();
      setState(nextState);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign out.");
    }
  }, [refresh]);

  const getToken = useCallback(async () => {
    const result = await ClerkNative.getToken();
    return result.token;
  }, []);

  const value = useMemo<AppAuthValue>(
    () => ({ ...state, getToken, signOut, startHostedAuth, error }),
    [error, getToken, signOut, startHostedAuth, state],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}