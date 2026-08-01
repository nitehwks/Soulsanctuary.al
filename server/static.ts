import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const SPA_ROUTES = [
  "/",
  "/sales",
  "/sign-in",
  "/sign-up",
  "/oauth/callback",
  "/dashboard",
  "/settings",
  "/docs",
  "/addons",
  "/groups",
  "/analytics",
  "/clinician",
  "/feature-flags",
];

function isSpaRoute(pathname: string): boolean {
  return SPA_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (req, res) => {
    const pathname = req.path || "/";
    if (isSpaRoute(pathname)) {
      res.sendFile(path.resolve(distPath, "index.html"));
    } else {
      res.status(404).end();
    }
  });
}
