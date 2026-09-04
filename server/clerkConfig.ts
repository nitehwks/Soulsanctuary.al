import { createClerkClient } from "@clerk/express";

type ClerkEnvironment = "development" | "production";

function getClerkEnvironment(): ClerkEnvironment {
  return process.env.NODE_ENV === "production"
    ? "production"
    : "development";
}

export function getClerkConfig(environment = getClerkEnvironment()) {
  const devPublishableKey =
    process.env.EXTERNAL_CLERK_DEV_PUBLISHABLE_KEY;
  const devSecretKey = process.env.EXTERNAL_CLERK_DEV_SECRET_KEY;
  const prodPublishableKey =
    process.env.EXTERNAL_CLERK_PROD_PUBLISHABLE_KEY;
  const prodSecretKey = process.env.EXTERNAL_CLERK_PROD_SECRET_KEY;
  const hasProductionKeys = Boolean(prodPublishableKey && prodSecretKey);
  const useProductionKeys =
    environment === "production" && hasProductionKeys;
  const publishableKey = useProductionKeys
    ? prodPublishableKey
    : devPublishableKey;
  const secretKey = useProductionKeys ? prodSecretKey : devSecretKey;

  if (!publishableKey || !secretKey) {
    throw new Error(
      "Missing external Clerk Development credentials. Configure both the publishable and secret key in Replit Secrets.",
    );
  }

  return { publishableKey, secretKey };
}

export const appClerkClient = createClerkClient(getClerkConfig());