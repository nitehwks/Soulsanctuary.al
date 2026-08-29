import type { RequestHandler } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { storage } from "./storage";

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

async function getOrCreateLocalUser(clerkUserId: string, provider: string) {
  const bindingKey = `clerk:${clerkUserId}`;
  let user = await storage.getUserByIdentity(provider, clerkUserId);
  // Existing development data predates issuer namespacing.
  if (!user && provider !== "clerk") {
    user = await storage.getUserByIdentity("clerk", clerkUserId);
  }

  // Lazily move temporary Clerk bridge bindings to the identities table.
  // A pre-existing subject mapping always wins, so no request can reassign a
  // Clerk subject from one local profile to another.
  if (!user) {
    const legacyUser =
      (await storage.getUserByUsername(bindingKey)) ??
      (await storage.getUser(clerkUserId));
    if (legacyUser) {
      if (legacyUser.username === bindingKey) {
        await storage.upsertUser({ ...legacyUser, username: null });
      }
      user = await storage.linkUserIdentity(
        legacyUser.id,
        provider,
        clerkUserId,
      );
    }
  }

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const primaryEmail = clerkUser.primaryEmailAddress;
    const verifiedEmail =
      primaryEmail?.verification?.status === "verified"
        ? primaryEmail.emailAddress.trim().toLowerCase()
        : null;

    // Preserve existing application data when an existing user signs into the
    // new managed Clerk tenant with the same verified email address.
    if (verifiedEmail) {
      const existingUser = await storage.getUserByEmail(verifiedEmail);
      if (existingUser) {
        // A verified email selects a legacy profile only during this initial
        // migration. The persistent identity key is the Clerk subject.
        user = await storage.linkUserIdentity(
          existingUser.id,
          provider,
          clerkUserId,
        );
      }
    }
    if (!user) {
      const newUser = await storage.upsertUser({
        email: verifiedEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.imageUrl,
      });
      user = await storage.linkUserIdentity(newUser.id, provider, clerkUserId);
    }
  }
  return user;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getOrCreateLocalUser(
      clerkUserId,
      getClerkProvider(auth),
    );
    req.clerkUserId = clerkUserId;
    req.userId = user.id;
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    const clerkUserId = req.clerkUserId ?? getAuth(req).userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const metadata = clerkUser.publicMetadata as {
      role?: unknown;
      isAdmin?: unknown;
    };
    if (metadata.role !== "admin" && metadata.isAdmin !== true) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    console.error("Clerk admin authorization error:", error);
    return res.status(403).json({ message: "Forbidden" });
  }
};
