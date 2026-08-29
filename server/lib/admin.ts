import type { RequestHandler } from "express";
import { logSecurityEvent } from "./audit-logger";

/** Requires a Clerk-authenticated local application user with the admin role. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  if ((req as any).user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

/** Record an admin action against the server-derived local application user. */
export async function logAdminAction(
  req: any,
  eventType: string,
  details: Record<string, unknown> = {},
): Promise<void> {
  await logSecurityEvent(req.userId, eventType, {
    ip: req.ip,
    ...details,
  });
}