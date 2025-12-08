import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, insertUserContextSchema } from "@shared/schema";
import { redactPII, analyzeSentiment, extractKeyPhrases } from "./lib/pii-redactor";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
});

function generateConversationTitle(content: string): string {
  const cleanContent = content.trim().replace(/\s+/g, ' ');
  
  if (!cleanContent || cleanContent.length === 0) {
    return "New Conversation";
  }
  
  const questionMatch = cleanContent.match(/^(what|how|why|when|where|who|can|could|would|should|is|are|do|does|will)[^.!?]*[?]/i);
  if (questionMatch) {
    let question = questionMatch[0];
    if (question.length > 40) {
      question = question.substring(0, 37) + "...";
    }
    return question;
  }
  
  const statementMatch = cleanContent.match(/^(i want|i need|i'm looking|help me|tell me|show me|explain|create|build|make|write|find|search)[^.!?]*/i);
  if (statementMatch) {
    let statement = statementMatch[0];
    if (statement.length > 40) {
      statement = statement.substring(0, 37) + "...";
    }
    return statement;
  }
  
  const firstSentence = cleanContent.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length <= 40) {
    return firstSentence;
  }
  
  if (firstSentence && firstSentence.length > 0) {
    const words = firstSentence.split(' ').slice(0, 6).join(' ');
    return words + "...";
  }
  
  return "New Conversation";
}

async function extractFactsFromMessage(content: string, userId: string, sentiment: string, extractedPII: { emails: string[], phones: string[] }) {
  const patterns = [
    { regex: /(?:i am|i'm|my name is)\s+(\w+)/i, category: "Name" },
    { regex: /(?:i work as|i'm a|my job is|i am a)\s+([^,.!?]+)/i, category: "Role" },
    { regex: /(?:i live in|i'm from|i'm in|located in)\s+([^,.!?]+)/i, category: "Location" },
    { regex: /(?:i like|i love|i enjoy|interested in)\s+([^,.!?]+)/i, category: "Interest" },
    { regex: /(?:working on|my project|building)\s+([^,.!?]+)/i, category: "Project" },
    { regex: /(?:my company|i work at|employed at)\s+([^,.!?]+)/i, category: "Company" },
    { regex: /(?:my number is|call me at|reach me at|phone is)\s*[:\s]*(.+)/i, category: "Phone" },
    { regex: /(?:my email is|email me at|reach me at|contact me at)\s*[:\s]*(.+)/i, category: "Email" },
    { regex: /(?:my address is|i live at)\s+([^,.]+)/i, category: "Address" },
    { regex: /(?:i need|i want|looking for)\s+([^,.!?]+)/i, category: "Need" },
    { regex: /(?:the problem is|my issue is|i'm having trouble with)\s+([^,.!?]+)/i, category: "Issue" },
  ];

  const sourceContext = content.substring(0, 200);

  for (const { regex, category } of patterns) {
    const match = content.match(regex);
    if (match && match[1]) {
      const value = match[1].trim();
      if (value.length > 2 && value.length < 100) {
        await storage.upsertUserContextWithSentiment(userId, category, value, 85, sentiment, sourceContext);
      }
    }
  }

  for (const email of extractedPII.emails) {
    await storage.upsertUserContextWithSentiment(userId, "Email", email, 95, sentiment, sourceContext);
  }
  
  for (const phone of extractedPII.phones) {
    await storage.upsertUserContextWithSentiment(userId, "Phone", phone, 95, sentiment, sourceContext);
  }
}

async function buildMemoryContext(userId: string, currentMessage: string, currentSentiment: string): Promise<{ memoryContext: string; hasSensitiveMemories: boolean }> {
  const userContext = await storage.getUserContextByUser(userId);
  
  const keywords = currentMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let relevantMemories: Array<{ content: string; sentiment?: string | null }> = [];
  
  if (keywords.length > 0) {
    for (const keyword of keywords.slice(0, 3)) {
      const searchResults = await storage.searchMessages(userId, keyword);
      for (const msg of searchResults.slice(0, 5)) {
        const exists = relevantMemories.some(m => m.content === msg.content);
        if (!exists) {
          relevantMemories.push({
            content: `[${msg.role}]: ${msg.content.substring(0, 200)}`,
            sentiment: msg.sentiment
          });
        }
      }
    }
  }

  let memoryContext = "";
  let hasSensitiveMemories = false;

  const sensitiveContexts = userContext.filter(ctx => 
    ctx.sentiment === 'negative' || ctx.sentiment === 'slightly_negative'
  );
  
  if (sensitiveContexts.length > 0) {
    hasSensitiveMemories = true;
  }
  
  if (userContext.length > 0) {
    memoryContext += "Known facts about this user:\n";
    for (const ctx of userContext) {
      let emotionNote = "";
      if (ctx.sentiment === 'negative' || ctx.sentiment === 'slightly_negative') {
        emotionNote = " [shared during a difficult moment]";
      }
      memoryContext += `- ${ctx.category}: ${ctx.value}${emotionNote}\n`;
    }
    memoryContext += "\n";
  }
  
  if (relevantMemories.length > 0) {
    memoryContext += "Relevant memories from past conversations:\n";
    for (const memory of relevantMemories.slice(0, 10)) {
      let emotionNote = "";
      if (memory.sentiment === 'negative' || memory.sentiment === 'slightly_negative') {
        emotionNote = " [sensitive topic]";
        hasSensitiveMemories = true;
      }
      memoryContext += `${memory.content}${emotionNote}\n`;
    }
    memoryContext += "\n";
  }
  
  return { memoryContext, hasSensitiveMemories };
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
      const sentimentResult = analyzeSentiment(content);
      const keyPhrases = extractKeyPhrases(content);
      
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: redactionResult.redactedContent,
        originalContent: redactionResult.wasRedacted ? content : null,
        wasObfuscated: redactionResult.wasRedacted,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        keyPhrases: keyPhrases,
      });

      await extractFactsFromMessage(content, userId, sentimentResult.sentiment, redactionResult.extractedPII);

      const { memoryContext, hasSensitiveMemories } = await buildMemoryContext(userId, content, sentimentResult.sentiment);

      const conversationHistory = await storage.getMessagesByConversation(conversationId);
      
      let sensitivityGuidelines = "";
      if (hasSensitiveMemories || sentimentResult.sentiment === 'negative' || sentimentResult.sentiment === 'slightly_negative') {
        sensitivityGuidelines = `
IMPORTANT: Some memories may be connected to difficult experiences. When referencing these:
- Be gentle and empathetic in your tone
- Don't bring up painful details unless relevant
- Acknowledge the user's feelings if they seem upset
- Offer support without being patronizing
- If the current mood seems negative, be extra thoughtful about what memories to reference`;
      }

      const systemMessage = {
        role: "system" as const,
        content: `You are TrustHub AI, a helpful assistant with comprehensive memory capabilities. You remember everything the user shares including contact information, preferences, issues they've faced, and the emotional context of conversations.

${memoryContext}

Guidelines:
- Reference relevant memories when appropriate, including contact details if they shared them
- Remember user preferences, past discussions, and issues they mentioned
- Be helpful, warm, and conversational
- If the user shares personal information, acknowledge it and confirm you'll remember it
- When recalling information from difficult conversations, be sensitive and supportive
- Store and recall key details like phone numbers, emails, and important facts${sensitivityGuidelines}`
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

      const conversation = await storage.getConversation(conversationId);
      if (conversation && (!conversation.title || conversation.title === "New Conversation")) {
        const title = generateConversationTitle(redactionResult.redactedContent);
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
