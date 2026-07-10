import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import fs from "fs";
import path from "path";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Allow Capacitor app origins, local web clients, and Replit deployments.
const allowedOrigins = new Set([
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
  `http://localhost:${process.env.PORT || 5001}`,
  `https://localhost:${process.env.PORT || 5001}`,
]);

// Optional exact frontend URL (e.g. your Replit deployment URL).
if (process.env.FRONTEND_URL) {
  try {
    allowedOrigins.add(new URL(process.env.FRONTEND_URL).origin);
  } catch {
    // ignore invalid FRONTEND_URL
  }
}

const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.replit\.dev$/i,
  /^https:\/\/[a-z0-9-]+\.replit\.app$/i,
];

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.has(origin)) return true;
  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowAnyOrigin = process.env.NODE_ENV !== "production";
  const originAllowed =
    allowAnyOrigin || !origin || isAllowedOrigin(origin);

  if (origin && originAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }
  if (req.method === "OPTIONS") {
    if (origin && !isAllowedOrigin) {
      res.sendStatus(403);
      return;
    }
    res.sendStatus(204);
    return;
  }
  next();
});

// Now apply JSON middleware for all other routes
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const distPath = path.resolve(__dirname, "public");
  if (process.env.NODE_ENV === "production" && fs.existsSync(distPath)) {
    serveStatic(app);
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[server] Production mode requested but build directory ${distPath} not found; falling back to Vite dev server.`,
      );
    }
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5001", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
