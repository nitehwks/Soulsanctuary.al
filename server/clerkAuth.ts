import type { Express, RequestHandler } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { storage } from "./storage";
import {
  validateSecondFactorToken,
  TWO_FA_SESSION_HEADER,
  TWO_FA_DEVICE_HEADER,
} from "./lib/twofa";

// Paths exempt from second-factor enforcement: the 2FA endpoints themselves
// (a user mid-challenge must be able to reach them) and the admin API
// (which has its own, stronger key-based auth).
const TWO_FA_EXEMPT_PREFIXES = ["/api/auth/user", "/api/2fa", "/api/admin"];

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
  let user =
    (await storage.getUser(clerkUserId)) ??
    (await storage.getUserByUsername(bindingKey));
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
        user = await storage.upsertUser({
          id: existingUser.id,
          username: bindingKey,
          password: existingUser.password,
          name: existingUser.name,
          email: verifiedEmail,
          firstName: clerkUser.firstName ?? existingUser.firstName,
          lastName: clerkUser.lastName ?? existingUser.lastName,
          profileImageUrl:
            clerkUser.imageUrl ?? existingUser.profileImageUrl,
        });
      }
    }
    user ??= await storage.upsertUser({
      id: clerkUserId,
      username: bindingKey,
      email: verifiedEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      profileImageUrl: clerkUser.imageUrl,
    });
  }
  return user;
}

export function setupAuth(app: Express) {
  void app;
  // Clerk middleware is mounted once in server/index.ts before all routes.
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
