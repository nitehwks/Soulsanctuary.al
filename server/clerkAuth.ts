import type { Express, RequestHandler } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

function isDevPlaceholder(key?: string): boolean {
  return !key || key.includes("your_clerk") || key.includes("...");
}

export const DEV_AUTH_TOKEN = "dev-token";

function extractBearerToken(req: any): string | undefined {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return undefined;
}

async function getOrCreateLocalUser(clerkUserId: string) {
  let user = await storage.getUser(clerkUserId);
  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      user = await storage.upsertUser({
        id: clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImageUrl: clerkUser.imageUrl,
      });
    } catch {
      // If we can't reach Clerk, create a minimal local record so the app works.
      user = await storage.upsertUser({
        id: clerkUserId,
        email: null,
        firstName: "User",
        lastName: null,
        profileImageUrl: null,
      });
    }
  }
  return user;
}

export function setupAuth(app: Express) {
  // Clerk does not require server-side session middleware.
  // The client sends a short-lived JWT in the Authorization header.

  // Development/local bypass: native Capacitor dev builds cannot reliably share
  // cross-origin session cookies, so issue a hardcoded bearer token.
  // Enabled when Clerk keys are placeholders or when ALLOW_LOCAL_AUTH is set.
  if (isDevPlaceholder(process.env.CLERK_SECRET_KEY) || process.env.ALLOW_LOCAL_AUTH === "true") {
    app.post("/api/dev-login", async (_req, res) => {
      const devUserId = "dev-user-001";
      await storage.upsertUser({
        id: devUserId,
        email: "dev@local.test",
        firstName: "Local",
        lastName: "Dev",
        profileImageUrl: null,
      });
      res.json({ token: DEV_AUTH_TOKEN, user: await storage.getUser(devUserId) });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    // Dev/local fallback for native Capacitor builds and local testing.
    if (
      (isDevPlaceholder(process.env.CLERK_SECRET_KEY) || process.env.ALLOW_LOCAL_AUTH === "true") &&
      token === DEV_AUTH_TOKEN
    ) {
      const devUserId = "dev-user-001";
      await storage.upsertUser({
        id: devUserId,
        email: "dev@local.test",
        firstName: "Local",
        lastName: "Dev",
        profileImageUrl: null,
      });
      (req as any).userId = devUserId;
      (req as any).user = await storage.getUser(devUserId);
      return next();
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getOrCreateLocalUser(userId);
    (req as any).userId = userId;
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
