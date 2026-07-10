import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : false,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export const DEV_AUTH_TOKEN = "dev-token";

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Development-only bearer token auth for native apps. Session cookies are
  // unreliable across Capacitor WebView origins in local HTTP dev, so native
  // builds store this token and send it as an Authorization header.
  if (process.env.NODE_ENV === "development") {
    app.use((req, _res, next) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : "";
      if (token === DEV_AUTH_TOKEN) {
        req.user = {
          claims: { sub: "dev-user-001" },
          access_token: DEV_AUTH_TOKEN,
          expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        } as any;
      }
      next();
    });
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string, protocol: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `${protocol}://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  const hostWithPort = (req: any) => req.headers.host || req.hostname;

  // Development-only auth bypass: Replit OIDC does not allow Tailscale IPs as
  // redirect URIs, so in local dev we log in a test user automatically.
  if (process.env.NODE_ENV === "development") {
    const upsertDevUser = async () => {
      const devUserId = "dev-user-001";
      await storage.upsertUser({
        id: devUserId,
        email: "dev@local.test",
        firstName: "Local",
        lastName: "Dev",
        profileImageUrl: null,
      });
      return devUserId;
    };

    // Native dev builds get a bearer token instead of relying on cross-origin
    // session cookies, which are unreliable in local HTTP Capacitor apps.
    app.post("/api/dev-login", async (_req, res) => {
      const devUserId = await upsertDevUser();
      const user = await storage.getUser(devUserId);
      res.json({ token: DEV_AUTH_TOKEN, user });
    });

    app.get("/api/login", async (req, res, next) => {
      const isMobileRequest = !!req.query.mobile;
      const devUserId = await upsertDevUser();

      const user = {
        claims: { sub: devUserId },
        access_token: DEV_AUTH_TOKEN,
        expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      req.logIn(user, (loginErr: any) => {
        if (loginErr) {
          return next(loginErr);
        }

        if (isMobileRequest) {
          return res.redirect("soulsanctuary://auth-callback");
        }
        res.redirect("/");
      });
    });
  } else {
    app.get("/api/login", (req, res, next) => {
    // Mark mobile requests so the callback can redirect back into the native app
    if (req.query.mobile === "true") {
      (req.session as any).mobileAuth = true;
    }

    const host = hostWithPort(req);
    ensureStrategy(host, req.protocol);
    passport.authenticate(`replitauth:${host}`, {
      prompt: "login",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });
  }

  app.get("/api/callback", (req, res, next) => {
    const host = hostWithPort(req);
    ensureStrategy(host, req.protocol);
    passport.authenticate(
      `replitauth:${host}`,
      {
        failureRedirect: "/api/login",
      },
      (err: any, user: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.redirect("/api/login");
        }

        req.logIn(user, (loginErr: any) => {
          if (loginErr) {
            return next(loginErr);
          }

          const isMobile = (req.session as any)?.mobileAuth === true;
          if (isMobile) {
            (req.session as any).mobileAuth = false;
            // Redirect back into the native app. The deep-link handler will
            // reload the web app and the session cookie will be picked up by
            // /api/auth/user.
            return res.redirect("soulsanctuary://auth-callback");
          }

          res.redirect("/");
        });
      },
    )(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Development-only bearer token auth bypass.
  if (process.env.NODE_ENV === "development" && user?.access_token === DEV_AUTH_TOKEN) {
    return next();
  }

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
