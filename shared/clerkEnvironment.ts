export type ClerkEnvironment = "development" | "production";

export function getClerkEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): ClerkEnvironment {
  return env.CLERK_TARGET === "production" ||
    env.REPLIT_DEPLOYMENT === "1" ||
    env.NODE_ENV === "production"
    ? "production"
    : "development";
}