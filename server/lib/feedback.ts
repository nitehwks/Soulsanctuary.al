import { storage } from "../storage";
import type { Conversation } from "@shared/schema";

export interface FeedbackMeta {
  category: "feature" | "bug" | "coaching" | "general";
  rating: number | null;
  subject: string | null;
}

export function parseFeedbackMeta(originalContent: string | null): FeedbackMeta {
  if (!originalContent) {
    return { category: "general", rating: null, subject: null };
  }

  try {
    const parsed = JSON.parse(originalContent);
    return {
      category: parsed?.category ?? "general",
      rating: typeof parsed?.rating === "number" ? parsed.rating : null,
      subject: typeof parsed?.subject === "string" ? parsed.subject : null,
    };
  } catch {
    return { category: "general", rating: null, subject: null };
  }
}

// Build feedback list items from feedback-mode conversations (shared by the
// per-user endpoint and the admin all-users endpoint).
export async function buildFeedbackItems(feedbackConversations: Conversation[]) {
  const items = await Promise.all(
    feedbackConversations.map(async (conversation) => {
      const messages = await storage.getMessagesByConversation(conversation.id);
      const firstMessage = messages[0];
      if (!firstMessage) return null;

      const meta = parseFeedbackMeta(firstMessage.originalContent || null);
      return {
        id: conversation.id,
        userId: conversation.userId,
        category: meta.category,
        rating: meta.rating,
        subject: meta.subject || conversation.title || null,
        message: firstMessage.content,
        status: conversation.status || "submitted",
        createdAt: firstMessage.timestamp,
      };
    }),
  );
  return items.filter(Boolean);
}
