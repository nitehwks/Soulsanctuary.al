import { createClerkClient } from "@clerk/express";

type ClerkEnvironment = "development" | "production";

function getClerkEnvironment(): ClerkEnvironment {
  return process.env.NODE_ENV === "production"
    ? "production"
    : "development";
}

export function getClerkConfig(environment = getClerkEnvironment()) {
  const isProduction = environment === "production";
  const publishableKey = process.env[
    isProduction
      ? "EXTERNAL_CLERK_PROD_PUBLISHABLE_KEY"
      : "EXTERNAL_CLERK_DEV_PUBLISHABLE_KEY"
  ];
  const secretKey = process.env[
    isProduction
      ? "EXTERNAL_CLERK_PROD_SECRET_KEY"
      : "EXTERNAL_CLERK_DEV_SECRET_KEY"
  ];

  if (!publishableKey || !secretKey) {
    throw new Error(
      `Missing external Clerk ${environment} credentials. Configure both the publishable and secret key in Replit Secrets.`,
    );
  }

  return { publishableKey, secretKey };
}

export const appClerkClient = createClerkClient(getClerkConfig());