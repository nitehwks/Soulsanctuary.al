import type { Express, RequestHandler } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { storage } from "./storage";
import {
  validateSecondFactorToken,
  TWO_FA_SESSION_HEADER,
  TWO_FA_DEVICE_HEADER,
} from "./lib/twofa";

// Paths exempt from second-factor enforcement: the 2FA endpoints themselves
// (a user mid-challenge must be able to reach them) and the admin API
// (which has its own, stronger key-based auth).
const TWO_FA_EXEMPT_PREFIXES = ["/api/2fa", "/api/admin"];

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
  void app;
  // Clerk does not require server-side session middleware.
  // The client sends a short-lived JWT in the Authorization header.
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

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

    // Second-factor enforcement: users with TOTP enabled must present a
    // valid session or trusted-device token on every authenticated request.
    if (!TWO_FA_EXEMPT_PREFIXES.some((p) => req.path.startsWith(p))) {
      const twoFactor = await storage.getTwoFactor(userId);
      if (twoFactor?.enabled) {
        const sessionToken = req.headers[TWO_FA_SESSION_HEADER];
        const deviceToken = req.headers[TWO_FA_DEVICE_HEADER];
        const sessionOk =
          typeof sessionToken === "string" &&
          sessionToken.length > 0 &&
          (await validateSecondFactorToken(userId, sessionToken));
        const deviceOk =
          !sessionOk &&
          typeof deviceToken === "string" &&
          deviceToken.length > 0 &&
          (await validateSecondFactorToken(userId, deviceToken));

        if (!sessionOk && !deviceOk) {
          return res.status(403).json({ error: "2fa_required" });
        }
      }
    }

    next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
