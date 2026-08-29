import type { RequestHandler } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

async function getOrCreateLocalUser(clerkUserId: string) {
  const bindingKey = `clerk:${clerkUserId}`;
  let user = await storage.getUserByIdentity("clerk", clerkUserId);

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
        "clerk",
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
          "clerk",
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
      user = await storage.linkUserIdentity(newUser.id, "clerk", clerkUserId);
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

    const user = await getOrCreateLocalUser(clerkUserId);
    const userId = user.id;
    (req as any).userId = userId;
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
