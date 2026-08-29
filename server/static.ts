import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectRouteMeta } from "./seo";

const SPA_ROUTES = [
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
    const pathname = req.originalUrl.split("?")[0] || "/";
    if (!isSpaRoute(pathname)) {
      res.status(404).end();
      return;
    }
    const indexPath = path.resolve(distPath, "index.html");
    fs.readFile(indexPath, "utf-8", (err, html) => {
      if (err) {
        res.status(500).end();
        return;
      }
      const page = injectRouteMeta(html, pathname);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    });
  });
}
