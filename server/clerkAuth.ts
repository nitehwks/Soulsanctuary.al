import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { storage } from "./storage";
import { appClerkClient } from "./clerkConfig";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      clerkUserId?: string;
      user?: any;
    }
  }
}

function getClerkProvider(auth: ReturnType<typeof getAuth>): string {
  const issuer = (auth.sessionClaims as { iss?: unknown } | undefined)?.iss;
  return typeof issuer === "string" && issuer.length > 0
    ? `clerk:${issuer}`
    : "clerk";
}

async function getOrCreateIdentityMappedUser(
  clerkUserId: string,
  provider: string,
) {
  const existingUser = await storage.getOrPromoteUserIdentity(
    provider,
    clerkUserId,
  );
  if (existingUser) return existingUser;

  const clerkUser = await appClerkClient.users.getUser(clerkUserId);
  const primaryEmail = clerkUser.primaryEmailAddress;
  const verifiedEmail =
    primaryEmail?.verification?.status === "verified"
      ? primaryEmail.emailAddress.trim().toLowerCase()
      : null;

  return storage.resolveOrCreateUserIdentity(provider, clerkUserId, {
    email: verifiedEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.imageUrl,
  });
}

async function getOrCreateLocalUser(auth: ReturnType<typeof getAuth>) {
  const clerkUserId = auth.userId;
  if (!clerkUserId) return undefined;

  const provider = getClerkProvider(auth);
  return getOrCreateIdentityMappedUser(clerkUserId, provider);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getOrCreateLocalUser(auth);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.clerkUserId = clerkUserId;
    req.userId = user.id;
    req.user = user;

    next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!req.userId || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Existing administrators are authorized by trusted Clerk public metadata;
  // this preserves the pre-migration admin contract without adding a required
  // local database column.
  try {
    const clerkUserId = req.clerkUserId ?? getAuth(req).userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkUser = await appClerkClient.users.getUser(clerkUserId);
    const metadata = clerkUser.publicMetadata as {
      role?: unknown;
      isAdmin?: unknown;
    };
    if (metadata.role === "admin" || metadata.isAdmin === true) {
      return next();
    }
  } catch (error) {
    console.error("Clerk admin authorization error:", error);
  }

  return res.status(403).json({ message: "Forbidden" });
};
