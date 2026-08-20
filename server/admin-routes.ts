/**
 * Admin API routes.
 *
 * These endpoints are safe to deploy publicly: the database is the root of
 * trust. A session token is only issued for a valid Ed25519 signature over a
 * single-use challenge, verifiable against a public key already registered in
 * the admin_keys table. No registered key -> no token -> 404 on everything.
 *
 * All routes return 404 (not 401/403) on auth failure so the admin surface is
 * indistinguishable from nonexistent routes.
 */

import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { buildFeedbackItems } from "./lib/feedback";
import {
  createChallenge,
  verifyChallenge,
  requireAdmin,
  logAdminAction,
  cleanupAdminState,
  ADMIN_TOKEN_HEADER,
} from "./lib/admin";

const challengeSchema = z.object({
  publicKey: z.string().min(16).max(128),
});

const verifySchema = z.object({
  publicKey: z.string().min(16).max(128),
  nonce: z.string().min(16).max(128),
  signature: z.string().min(16).max(256),
});

const adminKeyCreateSchema = z.object({
  publicKey: z.string().min(16).max(128),
  label: z.string().max(120).optional(),
  contactEmail: z.string().email().max(320).nullable().optional(),
  contactPhone: z.string().max(30).nullable().optional(),
});

const feedbackStatusSchema = z.object({
  status: z.enum(["submitted", "reviewed", "resolved"]),
});

export function registerAdminRoutes(app: Express) {
  // Periodically purge expired challenges and sessions
  setInterval(() => {
    cleanupAdminState().catch(() => {});
  }, 10 * 60 * 1000).unref();

  // --- Authentication (challenge-response, no shared secret on the wire) ---

  app.post("/api/admin/challenge", async (req, res) => {
    try {
      const parsed = challengeSchema.safeParse(req.body ?? {});
      if (!parsed.success) return res.status(404).json({ error: "Not found" });

      const challenge = await createChallenge(parsed.data.publicKey);
      if (!challenge) return res.status(404).json({ error: "Not found" });

      res.json(challenge);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/verify", async (req, res) => {
    try {
      const parsed = verifySchema.safeParse(req.body ?? {});
      if (!parsed.success) return res.status(404).json({ error: "Not found" });

      const session = await verifyChallenge(
        parsed.data.publicKey,
        parsed.data.nonce,
        parsed.data.signature,
      );
      if (!session) return res.status(404).json({ error: "Not found" });

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/logout", requireAdmin, async (req, res) => {
    try {
      const token = req.headers[ADMIN_TOKEN_HEADER] as string;
      await storage.deleteAdminSession(token);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Identity check for the client gate
  app.get("/api/admin/status", requireAdmin, async (req: any, res) => {
    const key = req.adminKey;
    res.json({ label: key.label, keyId: key.id });
  });

  // --- Feedback (all users) + triage ---

  app.get("/api/admin/feedback", requireAdmin, async (req, res) => {
    try {
      const feedbackConversations = await storage.getConversationsByMode("feedback");
      res.json(await buildFeedbackItems(feedbackConversations));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/feedback/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = feedbackStatusSchema.safeParse(req.body ?? {});
      if (isNaN(id) || !parsed.success) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const updated = await storage.updateConversationStatus(id, parsed.data.status);
      if (!updated) return res.status(404).json({ error: "Not found" });

      await logAdminAction(req, "feedback_triage", { conversationId: id, status: parsed.data.status });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Audit log viewer ---

  app.get("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const offset = parseInt(req.query.offset as string) || 0;
      const action = (req.query.action as string) || undefined;
      res.json(await storage.listAuditLogs(limit, offset, action));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin key management (keys are identity; email/phone are contact metadata) ---

  app.get("/api/admin/keys", requireAdmin, async (req, res) => {
    try {
      res.json(await storage.listAdminKeys());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/keys", requireAdmin, async (req, res) => {
    try {
      const parsed = adminKeyCreateSchema.safeParse(req.body ?? {});
      if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

      const existing = await storage.getAdminKeyByPublicKey(parsed.data.publicKey);
      if (existing) return res.status(409).json({ error: "Key already registered" });

      const created = await storage.insertAdminKey(parsed.data);
      await logAdminAction(req, "admin_key_added", { newKeyId: created.id, label: created.label });
      res.json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/keys/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid request" });

      // Guard: refuse to revoke the last active admin key
      const keys = await storage.listAdminKeys();
      const active = keys.filter((k) => !k.revokedAt);
      const target = keys.find((k) => k.id === id);
      if (!target) return res.status(404).json({ error: "Not found" });
      if (!target.revokedAt && active.length <= 1) {
        return res.status(400).json({ error: "Cannot revoke the last active admin key" });
      }

      const revoked = await storage.revokeAdminKey(id);
      await logAdminAction(req, "admin_key_revoked", { revokedKeyId: id });
      res.json(revoked);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Group moderation review queue ---

  app.get("/api/admin/moderation", requireAdmin, async (req, res) => {
    try {
      res.json(await storage.getModeratedGroupMessages());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/moderation/:id/restore", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid request" });

      const restored = await storage.unmoderateGroupMessage(id);
      if (!restored) return res.status(404).json({ error: "Not found" });

      await logAdminAction(req, "group_message_restored", { messageId: id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/moderation/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid request" });

      const deleted = await storage.deleteGroupMessage(id);
      if (!deleted) return res.status(404).json({ error: "Not found" });

      await logAdminAction(req, "group_message_deleted", { messageId: id });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
