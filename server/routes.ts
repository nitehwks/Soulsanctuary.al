import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, insertUserContextSchema } from "@shared/schema";
import { redactPII } from "./lib/pii-redactor";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
});

async function extractFactsFromMessage(content: string, userId: string) {
  const patterns = [
    { regex: /(?:i am|i'm|my name is)\s+(\w+)/i, category: "Name" },
    { regex: /(?:i work as|i'm a|my job is|i am a)\s+([^,.!?]+)/i, category: "Role" },
    { regex: /(?:i live in|i'm from|i'm in|located in)\s+([^,.!?]+)/i, category: "Location" },
    { regex: /(?:i like|i love|i enjoy|interested in)\s+([^,.!?]+)/i, category: "Interest" },
    { regex: /(?:working on|my project|building)\s+([^,.!?]+)/i, category: "Project" },
    { regex: /(?:my company|i work at|employed at)\s+([^,.!?]+)/i, category: "Company" },
  ];

  for (const { regex, category } of patterns) {
    const match = content.match(regex);
    if (match && match[1]) {
      const value = match[1].trim();
      if (value.length > 2 && value.length < 100) {
        await storage.upsertUserContext(userId, category, value, 85);
      }
    }
  }
}

async function buildMemoryContext(userId: string, currentMessage: string): Promise<string> {
  const userContext = await storage.getUserContextByUser(userId);
  
  const keywords = currentMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let relevantMemories: string[] = [];
  
  if (keywords.length > 0) {
    for (const keyword of keywords.slice(0, 3)) {
      const searchResults = await storage.searchMessages(userId, keyword);
      for (const msg of searchResults.slice(0, 5)) {
        if (!relevantMemories.includes(msg.content)) {
          relevantMemories.push(`[${msg.role}]: ${msg.content.substring(0, 200)}`);
        }
      }
    }
  }

  let memoryContext = "";
  
  if (userContext.length > 0) {
    memoryContext += "Known facts about this user:\n";
    for (const ctx of userContext) {
      memoryContext += `- ${ctx.category}: ${ctx.value}\n`;
    }
    memoryContext += "\n";
  }
  
  if (relevantMemories.length > 0) {
    memoryContext += "Relevant memories from past conversations:\n";
    for (const memory of relevantMemories.slice(0, 10)) {
      memoryContext += `${memory}\n`;
    }
    memoryContext += "\n";
  }
  
  return memoryContext;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const conversations = await storage.getConversationsByUser(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/messages/search/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const query = req.query.q as string || "";
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const messages = await storage.searchMessages(userId, query);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { conversationId, content, userId = "anonymous" } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ error: "conversationId and content are required" });
      }

      const redactionResult = redactPII(content);
      
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: redactionResult.redactedContent,
        originalContent: redactionResult.wasRedacted ? redactionResult.originalContent : null,
        wasObfuscated: redactionResult.wasRedacted,
      });

      await extractFactsFromMessage(redactionResult.redactedContent, userId);

      const memoryContext = await buildMemoryContext(userId, redactionResult.redactedContent);

      const conversationHistory = await storage.getMessagesByConversation(conversationId);
      
      const systemMessage = {
        role: "system" as const,
        content: `You are TrustHub AI, a helpful assistant with memory capabilities. You remember information about users across conversations and use this context to provide personalized responses.

${memoryContext}

Guidelines:
- Reference relevant memories when appropriate
- Remember user preferences and past discussions
- Be helpful and conversational
- If the user shares personal information, acknowledge it naturally`
      };

      const openaiMessages = [
        systemMessage,
        ...conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ];

      const completion = await openai.chat.completions.create({
        model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        messages: openaiMessages,
      });

      const aiContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

      const aiMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: aiContent,
        wasObfuscated: false,
      });

      if (conversationHistory.length <= 2) {
        const title = content.substring(0, 50) + (content.length > 50 ? "..." : "");
        await storage.updateConversationTitle(conversationId, title);
      }

      res.json({
        userMessage,
        aiMessage,
        wasRedacted: redactionResult.wasRedacted
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/context/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const context = await storage.getUserContextByUser(userId);
      res.json(context);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/context", async (req, res) => {
    try {
      const data = insertUserContextSchema.parse(req.body);
      const context = await storage.createUserContext(data);
      res.json(context);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
