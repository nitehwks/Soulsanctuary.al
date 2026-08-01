import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { isNativeApp } from "./platform";

/**
 * Resolve an API path to a full URL.
 * - On web: keep relative paths so same-origin cookies work.
 * - In native apps: use the runtime config API_URL if available, otherwise
 *   fall back to VITE_API_URL so calls reach the remote backend.
 */
export function getApiUrl(path: string): string {
  if (!isNativeApp()) return path;

  const runtimeConfig = (typeof window !== "undefined" && (window as any).SOULSANCTUARY_CONFIG) || {};
  const baseUrl = (runtimeConfig.API_URL as string | undefined) || (import.meta.env.VITE_API_URL as string | undefined);
  if (!baseUrl) {
    // eslint-disable-next-line no-console
    console.warn("[getApiUrl] No API_URL configured for native app");
    return path;
  }

  // Avoid double slashes when joining base URL and path
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Live Clerk token getter, registered by the app once Clerk is available.
 * Clerk session JWTs expire after ~60 seconds, so every request must ask
 * Clerk for a fresh token (getToken auto-refreshes) instead of reusing a
 * token cached at sign-in time — a cached token goes stale and every API
 * call starts returning 401 shortly after login.
 */
let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: (() => Promise<string | null>) | null): void {
  clerkTokenGetter = getter;
}

async function authHeaders(): Promise<Record<string, string>> {
  if (clerkTokenGetter) {
    try {
      const token = await clerkTokenGetter();
      if (token) return { Authorization: `Bearer ${token}` };
    } catch {
      // Fall through to the stored token (local dev account).
    }
  }
  const token = localStorage.getItem("clerkSessionToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { ...(await authHeaders()), ...(init?.headers || {}) };
  return fetch(input, { ...init, headers, signal: controller.signal }).finally(
    () => clearTimeout(timeout),
  );
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetchWithTimeout(getApiUrl(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetchWithTimeout(getApiUrl(queryKey.join("/") as string), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
