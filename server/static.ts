import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Serve the SPA shell for known client-side routes; return 404 for unknown paths
  const clientRoutes = new Set([
    "/",
    "/sales",
    "/sign-in",
    "/sign-up",
    "/dashboard",
    "/settings",
    "/docs",
    "/addons",
    "/groups",
    "/analytics",
    "/clinician",
    "/feature-flags",
  ]);
  app.use("*", (req, res) => {
    const pathname = req.path;
    const isSpaRoute =
      clientRoutes.has(pathname) ||
      pathname.startsWith("/sign-in/") ||
      pathname.startsWith("/sign-up/");
    const status = isSpaRoute ? 200 : 404;
    res.status(status).sendFile(path.resolve(distPath, "index.html"));
  });
}
