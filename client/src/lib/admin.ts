import { apiFetch } from "./queryClient";

/** Fetch an admin resource using the standard Clerk-authenticated transport. */
export async function adminFetch(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<Response> {
  const response = await apiFetch(path, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed (${response.status})`);
  }
  return response;
}