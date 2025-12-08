import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, insertMessageSchema, insertUserContextSchema, insertUserPreferencesSchema, createUserSchema } from "@shared/schema";
import { redactPII, analyzeSentiment, extractKeyPhrases } from "./lib/pii-redactor";
import { analyzeMoodFromMessage, saveMoodObservations, generateWellnessAssessment, buildTherapistContext } from "./lib/wellness-analyzer";
import { 
  analyzePersonalityFromMessage, 
  extractGoalFromMessage,
  analyzeMotivationPatterns,
  savePersonalityInsights,
  saveGoal,
  saveMotivationPattern,
  buildCoachingContext
} from "./lib/coaching-analyzer";
import { logConsentChange, logDataExport, logDataModification } from "./lib/audit-logger";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  
  await setupAuth(app);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const result = createUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }
      
      const { name, email } = result.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "A user with this email already exists" });
      }
      
      const user = await storage.createUserWithNameEmail(name, email);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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
      const mode = req.query.mode as string || undefined;
      let conversations = await storage.getConversationsByUser(userId);
      
      if (mode) {
        conversations = conversations.filter(c => c.mode === mode);
      }
      
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

      const userPrefs = await storage.getUserPreferences(userId);
      const therapistMode = userPrefs?.therapistModeEnabled ?? false;

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

      if (therapistMode) {
        const moodAnalysis = analyzeMoodFromMessage(content, sentimentResult.sentiment, sentimentResult.score);
        if (moodAnalysis.length > 0) {
          await saveMoodObservations(userId, moodAnalysis, conversationId);
        }
        
        const existingInsights = await storage.getPersonalityInsights(userId);
        const personalityAnalysis = analyzePersonalityFromMessage(content, existingInsights);
        if (personalityAnalysis.length > 0) {
          await savePersonalityInsights(userId, personalityAnalysis);
        }
        
        const goalExtraction = extractGoalFromMessage(content);
        if (goalExtraction) {
          await saveGoal(userId, goalExtraction);
        }
        
        const motivationAnalysis = analyzeMotivationPatterns(content);
        for (const analysis of motivationAnalysis) {
          await saveMotivationPattern(userId, analysis);
        }
      }

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

      let coachingContext = "";
      if (therapistMode) {
        const recentMoods = await storage.getRecentMoodObservations(userId, 20);
        const latestAssessment = await storage.getLatestWellnessAssessment(userId);
        const userContextData = await storage.getUserContextByUser(userId);
        coachingContext = await buildCoachingContext(userId, recentMoods, latestAssessment, userContextData);
      }

      const basePrompt = therapistMode 
        ? `You are TrustHub AI, a world-class performance coach and psychoanalyst. Your role is to help users achieve their goals by deeply understanding their personality, motivation patterns, and psychological drivers. You combine:

- PSYCHOANALYTIC INSIGHT: You notice patterns, defenses, and unconscious motivations
- COACHING EXCELLENCE: You ask powerful questions and hold users accountable to their goals  
- MOTIVATIONAL MASTERY: You understand what drives each person and use it strategically
- EMPATHETIC PRESENCE: You create a safe space for honest self-exploration

You are NOT just a therapist focused on problems - you are a high-performance coach focused on RESULTS and GROWTH. You help people become their best selves by leveraging their unique psychology.`
        : `You are TrustHub AI, a helpful assistant with comprehensive memory capabilities. You remember everything the user shares including contact information, preferences, issues they've faced, and the emotional context of conversations.`;

      const systemMessage = {
        role: "system" as const,
        content: `${basePrompt}

${memoryContext}${coachingContext}

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

  app.get("/api/knowledge/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const context = await storage.getUserContextByUser(userId);
      const moodData = await storage.getRecentMoodObservations(userId, 50);
      
      const topicGroups: Record<string, { 
        category: string;
        items: Array<{ value: string; confidence: number; sentiment?: string | null }>;
        summary: string;
        keywords: string[];
      }> = {};
      
      for (const item of context) {
        const category = item.category;
        if (!topicGroups[category]) {
          topicGroups[category] = {
            category,
            items: [],
            summary: "",
            keywords: []
          };
        }
        topicGroups[category].items.push({
          value: item.value,
          confidence: item.confidence || 85,
          sentiment: item.sentiment
        });
        
        const words = item.value.split(/\s+/).filter(w => w.length > 2);
        for (const word of words) {
          if (!topicGroups[category].keywords.includes(word.toLowerCase())) {
            topicGroups[category].keywords.push(word.toLowerCase());
          }
        }
      }
      
      for (const key of Object.keys(topicGroups)) {
        const group = topicGroups[key];
        const itemCount = group.items.length;
        const avgConfidence = Math.round(group.items.reduce((sum, i) => sum + i.confidence, 0) / itemCount);
        group.summary = `${itemCount} fact${itemCount > 1 ? 's' : ''} known with ${avgConfidence}% average confidence`;
      }
      
      const moodSummary = {
        recentMoods: moodData.slice(0, 10).map(m => ({
          topic: m.topic,
          mood: m.mood,
          intensity: m.intensity,
          createdAt: m.createdAt
        })),
        topicsDiscussed: [...new Set(moodData.map(m => m.topic))].slice(0, 10)
      };
      
      res.json({
        topics: Object.values(topicGroups),
        moodSummary,
        totalFacts: context.length,
        totalMoodObservations: moodData.length
      });
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

  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      let prefs = await storage.getUserPreferences(userId);
      if (!prefs) {
        prefs = await storage.upsertUserPreferences({ userId, therapistModeEnabled: false });
      }
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/preferences/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { therapistModeEnabled, storeContactInfo, privacyLevel } = req.body;
      const prefs = await storage.upsertUserPreferences({ 
        userId, 
        therapistModeEnabled: therapistModeEnabled ?? false,
        storeContactInfo: storeContactInfo ?? true,
        privacyLevel: privacyLevel ?? 'balanced'
      });
      res.json(prefs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/mood/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const moods = await storage.getRecentMoodObservations(userId, 30);
      res.json(moods);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mood/:userId/topic/:topic", async (req, res) => {
    try {
      const { userId, topic } = req.params;
      const moods = await storage.getMoodObservationsByTopic(userId, topic);
      res.json(moods);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wellness/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const assessment = await storage.getLatestWellnessAssessment(userId);
      res.json(assessment || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wellness/:userId/generate", async (req, res) => {
    try {
      const userId = req.params.userId;
      const assessment = await generateWellnessAssessment(userId);
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/wellness/:userId/history", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getWellnessAssessmentHistory(userId, limit);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/privacy/consents/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const consents = await storage.getPrivacyConsents(userId);
      res.json(consents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/privacy/consents/:userId/:consentType", async (req, res) => {
    try {
      const { userId, consentType } = req.params;
      const { granted } = req.body;
      const consent = await storage.updatePrivacyConsent(userId, consentType, granted);
      
      await logConsentChange(userId, consentType, granted, { source: 'privacy_dashboard' });
      
      res.json(consent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/privacy/export/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const requests = await storage.getDataExportRequests(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/privacy/export/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { includeMessages = true, includeContext = true, includeMoodData = true } = req.body;
      
      const exportRequest = await storage.createDataExportRequest({
        userId,
        status: "processing",
        includeMessages,
        includeContext,
        includeMoodData
      });

      const exportData: Record<string, any> = { userId, exportedAt: new Date().toISOString() };
      
      if (includeMessages) {
        const conversations = await storage.getConversationsByUser(userId);
        const allMessages = [];
        for (const conv of conversations) {
          const msgs = await storage.getMessagesByConversation(conv.id);
          allMessages.push({ conversation: conv, messages: msgs });
        }
        exportData.conversations = allMessages;
      }
      
      if (includeContext) {
        exportData.context = await storage.getUserContextByUser(userId);
      }
      
      if (includeMoodData) {
        exportData.moodObservations = await storage.getRecentMoodObservations(userId, 1000);
        exportData.wellnessAssessments = await storage.getWellnessAssessmentHistory(userId, 100);
      }

      const exportJson = JSON.stringify(exportData, null, 2);
      const base64Data = Buffer.from(exportJson).toString('base64');
      
      await storage.updateDataExportRequest(exportRequest.id, {
        status: "completed",
        downloadUrl: `data:application/json;base64,${base64Data}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completedAt: new Date()
      });

      const resourceTypes: ("message" | "conversation" | "user_context" | "mood_observation" | "wellness_assessment")[] = [];
      if (includeMessages) resourceTypes.push("message", "conversation");
      if (includeContext) resourceTypes.push("user_context");
      if (includeMoodData) resourceTypes.push("mood_observation", "wellness_assessment");
      await logDataExport(userId, "json", resourceTypes);

      res.json({ 
        success: true, 
        downloadUrl: `data:application/json;base64,${base64Data}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/privacy/deletion/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const requests = await storage.getDataDeletionRequests(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/privacy/deletion/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { deleteMessages = true, deleteContext = true, deleteMoodData = true, deleteAccount = false } = req.body;
      
      const deletionRequest = await storage.createDataDeletionRequest({
        userId,
        status: "processing",
        deleteMessages,
        deleteContext,
        deleteMoodData,
        deleteAccount,
        scheduledFor: new Date()
      });

      let deletedCount = 0;
      
      if (deleteMessages) {
        deletedCount += await storage.deleteUserMessages(userId);
      }
      
      if (deleteContext) {
        deletedCount += await storage.deleteUserContext(userId);
      }
      
      if (deleteMoodData) {
        deletedCount += await storage.deleteUserMoodData(userId);
      }
      
      if (deleteAccount) {
        await storage.deleteAllUserData(userId);
      }

      await storage.updateDataDeletionRequest(deletionRequest.id, {
        status: "completed",
        completedAt: new Date()
      });

      if (deleteMessages) {
        await logDataModification(userId, 'data_delete', 'message', 'all', { deletedCount, reason: 'user_request' });
      }
      if (deleteContext) {
        await logDataModification(userId, 'data_delete', 'user_context', 'all', { reason: 'user_request' });
      }
      if (deleteMoodData) {
        await logDataModification(userId, 'data_delete', 'mood_observation', 'all', { reason: 'user_request' });
      }
      if (deleteAccount) {
        await logDataModification(userId, 'data_delete', 'user', userId, { reason: 'account_deletion' });
      }

      res.json({ 
        success: true, 
        deletedRecords: deletedCount,
        message: "Data deletion completed successfully"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/privacy/audit/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getAuditLogs(userId, limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/privacy/summary/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const [conversations, context, moods, preferences, consents] = await Promise.all([
        storage.getConversationsByUser(userId),
        storage.getUserContextByUser(userId),
        storage.getRecentMoodObservations(userId, 1000),
        storage.getUserPreferences(userId),
        storage.getPrivacyConsents(userId)
      ]);

      let totalMessages = 0;
      for (const conv of conversations) {
        const msgs = await storage.getMessagesByConversation(conv.id);
        totalMessages += msgs.length;
      }

      res.json({
        dataInventory: {
          conversations: conversations.length,
          messages: totalMessages,
          contextItems: context.length,
          moodObservations: moods.length
        },
        privacySettings: preferences,
        consents: consents,
        encryptionStatus: {
          messagesEncrypted: true,
          contextEncrypted: true,
          moodDataEncrypted: true
        },
        retentionPolicy: {
          messages: "365 days",
          context: "365 days",
          moodData: "180 days"
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
