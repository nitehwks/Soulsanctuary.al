import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { buildFeedbackItems } from "./lib/feedback";
import { logAdminAction, requireAdmin } from "./lib/admin";

const feedbackStatusSchema = z.object({
  status: z.enum(["submitted", "reviewed", "resolved"]),
});

export function registerAdminRoutes(app: Express) {
  app.get("/api/admin/status", requireAdmin, (req: any, res) => {
    res.json({ userId: req.userId, role: req.user.role });
  });

  app.get("/api/admin/feedback", requireAdmin, async (_req, res) => {
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

  app.get("/api/admin/moderation", requireAdmin, async (_req, res) => {
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