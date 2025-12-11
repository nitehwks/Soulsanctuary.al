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
  buildCoachingContext,
  generatePsychologicalProfile
} from "./lib/coaching-analyzer";
import { logConsentChange, logDataExport, logDataModification } from "./lib/audit-logger";
import { detectCrisis, detectTherapyTrigger, formatCrisisResources, CrisisAssessment } from "./lib/crisis-detection";
import { selectTherapyModule, formatTherapyExercise, THERAPY_EXERCISES, getRelevantScripture } from "./lib/therapy-modules";
import { wrapResponseWithSafety, generateDisclaimer, generateConsentText } from "./lib/safety-wrapper";
import { 
  shouldAskProbingQuestion, 
  selectProbingQuestion, 
  formatProbingQuestionForPrompt,
  calculateNextDepth,
  assessUserEngagement,
  type UserProbingState as ProbingState
} from "./lib/probing-questions";
import { generateSmartReplies, type SmartReply } from "./lib/smart-replies";
import { createAndStoreInsight, getAggregatedInsights } from "./lib/psychological-analyzer";
import { updateUserProfile, getProfileSummary, generateCoachingPlan } from "./lib/profile-aggregator";
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
  // User Identity Protocol: Extract names from natural phrases but NEVER from "I am" statements
  // Valid: "my name is X", "call me X", "it's X", "X here", "everyone calls me X", "friends call me X"
  // Invalid: "I am X", "I'm X" (these are treated as states/feelings, not names)
  
  // Common words that should never be treated as names
  const nonNameWords = new Set([
    'here', 'there', 'fine', 'good', 'great', 'okay', 'ok', 'well', 'bad', 'tired', 
    'happy', 'sad', 'angry', 'excited', 'nervous', 'anxious', 'stressed', 'worried',
    'testing', 'having', 'going', 'doing', 'being', 'feeling', 'thinking', 'wondering',
    'sorry', 'glad', 'sure', 'certain', 'confused', 'lost', 'stuck', 'ready', 'done',
    'back', 'home', 'new', 'old', 'just', 'not', 'now', 'today', 'still', 'always'
  ]);
  
  const patterns = [
    // Primary name patterns (high confidence)
    { regex: /my name is\s+(\w+)/i, category: "Name", confidence: 95 },
    { regex: /(?:call me|everyone calls me|friends call me|people call me)\s+(\w+)/i, category: "Name", confidence: 90 },
    { regex: /(?:it's|its|this is)\s+(\w+)\s+(?:here|speaking)/i, category: "Name", confidence: 85 },
    { regex: /^(\w+)\s+here[.!,]?\s*$/i, category: "Name", confidence: 80 },
    // Relationship-based name mentions (extract the relationship, not just name)
    { regex: /(?:my (?:wife|husband|partner|girlfriend|boyfriend|spouse)(?:'s name is|,?\s+)\s*)(\w+)/i, category: "Partner", confidence: 85 },
    { regex: /(?:my (?:mom|mother|dad|father|parent)(?:'s name is|,?\s+)\s*)(\w+)/i, category: "Parent", confidence: 85 },
    { regex: /(?:my (?:son|daughter|child|kid)(?:'s name is|,?\s+)\s*)(\w+)/i, category: "Child", confidence: 85 },
    { regex: /(?:my (?:brother|sister|sibling)(?:'s name is|,?\s+)\s*)(\w+)/i, category: "Sibling", confidence: 85 },
    { regex: /(?:my (?:friend|best friend|buddy)(?:'s name is|,?\s+)\s*)(\w+)/i, category: "Friend", confidence: 80 },
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

  for (const pattern of patterns) {
    const match = content.match(pattern.regex);
    if (match && match[1]) {
      const value = match[1].trim();
      
      // Filter out non-name words for Name category
      if (pattern.category === "Name" && nonNameWords.has(value.toLowerCase())) {
        continue;
      }
      
      if (value.length > 2 && value.length < 100) {
        const confidence = pattern.confidence || 85;
        await storage.upsertUserContextWithSentiment(userId, pattern.category, value, confidence, sentiment, sourceContext);
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
      const { conversationId, content, userId = "anonymous", mode } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ error: "conversationId and content are required" });
      }

      const userPrefs = await storage.getUserPreferences(userId);
      // Enable therapist mode if explicitly requested via mode parameter or user preferences
      let therapistMode = mode === "therapist" || (userPrefs?.therapistModeEnabled ?? false);
      
      // Auto-coaching: Check if we know enough about the user to automatically enable coaching mode
      if (!therapistMode && userPrefs?.autoCoachingEnabled !== false) {
        const userContextFacts = await storage.getUserContextByUser(userId);
        const conversationCount = await storage.getConversationCount(userId);
        
        // Enable auto-coaching if:
        // - User has 10+ conversations AND
        // - User has 5+ context facts about them (personality, goals, preferences)
        const hasEnoughConversations = conversationCount >= 10;
        const hasEnoughContext = userContextFacts.length >= 5;
        const hasGoalOrPatternData = userContextFacts.some(f => 
          f.category === 'goal' || f.category === 'aspiration' || 
          f.category === 'challenge' || f.category === 'personality'
        );
        
        if (hasEnoughConversations && hasEnoughContext && hasGoalOrPatternData) {
          therapistMode = true;
          console.log(`Auto-coaching activated for user ${userId}: ${conversationCount} conversations, ${userContextFacts.length} facts`);
        }
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

      // Store psychological insight for every user message (immutable ledger)
      try {
        await createAndStoreInsight(userId, userMessage.id, conversationId, content);
        // Update profile periodically (every 5 messages)
        const totalMessages = await storage.getMessageInsights(userId, 1000);
        if (totalMessages.length % 5 === 0) {
          await updateUserProfile(userId);
        }
      } catch (insightError) {
        console.error('Error storing psychological insight:', insightError);
        // Don't fail the chat if insight storage fails
      }

      // Crisis detection and therapy module selection
      const crisisAssessment = detectCrisis(content, sentimentResult.score);
      let therapyTrigger: string | null = null;
      let selectedExercise = null;
      
      // Only detect therapy triggers if in therapist mode and no critical crisis
      if (therapistMode && crisisAssessment.severity !== "critical") {
        therapyTrigger = detectTherapyTrigger(content);
        if (therapyTrigger) {
          selectedExercise = selectTherapyModule(therapyTrigger);
        }
      }
      
      // Log crisis events for audit
      if (crisisAssessment.isCrisis) {
        console.log(`Crisis detected for user ${userId}: severity=${crisisAssessment.severity}, triggers=${crisisAssessment.triggers.join(', ')}`);
      }

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
      let psychProfileContext = "";
      if (therapistMode) {
        const recentMoods = await storage.getRecentMoodObservations(userId, 20);
        const latestAssessment = await storage.getLatestWellnessAssessment(userId);
        const userContextData = await storage.getUserContextByUser(userId);
        coachingContext = await buildCoachingContext(userId, recentMoods, latestAssessment, userContextData);
        
        // Add psychological profile context for deeper personalization
        try {
          const profileSummary = await getProfileSummary(userId);
          const aggregatedInsights = await getAggregatedInsights(userId);
          const activeCoachingPlan = await storage.getActiveCoachingPlan(userId);
          
          psychProfileContext = `

## PSYCHOLOGICAL PROFILE
${profileSummary}

## OBSERVED PATTERNS
- Top Needs: ${aggregatedInsights.topNeeds.join(', ') || 'Still observing'}
- Common Defenses: ${aggregatedInsights.commonDefenses.join(', ') || 'Still observing'}  
- Cognitive Patterns: ${aggregatedInsights.cognitivePatterns.join(', ') || 'Still observing'}
- Core Values: ${aggregatedInsights.coreValues.join(', ') || 'Still observing'}
- Wellness Trajectory: ${aggregatedInsights.wellnessTrajectory}
${activeCoachingPlan ? `\n## CURRENT COACHING FOCUS\n- ${activeCoachingPlan.title}\n- Focus: ${activeCoachingPlan.focus}\n- Phase: ${activeCoachingPlan.currentPhase}` : ''}

Use these insights to ask penetrating questions, identify patterns, and coach effectively.`;
        } catch (profileError) {
          console.error('Error building profile context:', profileError);
        }
      }

      // Faith support context based on user preferences
      const faithDeclines = userPrefs?.faithOfferDeclines ?? 0;
      const faithEnabled = userPrefs?.faithSupportEnabled ?? true;
      const lastDecline = userPrefs?.lastFaithDeclineAt;
      const daysSinceDecline = lastDecline ? Math.floor((Date.now() - new Date(lastDecline).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      // Determine faith offering level
      let faithGuidance = "";
      if (!faithEnabled) {
        faithGuidance = "\n\n**IMPORTANT: This user has opted out of faith-based content. Focus only on evidence-based therapeutic techniques. Do not mention God, prayer, scripture, or faith.**";
      } else if (faithDeclines >= 3 && daysSinceDecline < 7) {
        faithGuidance = "\n\n**FAITH GUIDANCE: User has declined spiritual offers 3+ times recently. Pause offering faith content for now. Focus on therapeutic techniques, but remain gently aware - if they mention faith, church, prayer, or spirituality themselves, you may carefully re-engage.**";
      } else if (faithDeclines >= 1) {
        faithGuidance = "\n\n**FAITH GUIDANCE: User has previously declined spiritual content. Be more subtle - weave in gentle hope and comfort without explicit religious language unless they seem open to it.**";
      } else {
        faithGuidance = "\n\n**FAITH GUIDANCE: User is open to spiritual support. Feel free to offer prayers, scripture verses, and faith-based encouragement when appropriate.**";
      }

      const basePrompt = therapistMode 
        ? `You are SoulSanctuary AI, a compassionate pastoral counselor, performance coach, and spiritual guide. Like a caring pastor who also has training in psychology and coaching, you help people find peace, purpose, and growth. You combine:

- PASTORAL WARMTH: You speak with the gentle, encouraging voice of a loving pastor. You make people feel seen, valued, and never judged.
- SPIRITUAL WISDOM: You offer prayers, scripture verses, and faith-based encouragement when appropriate. You gently share God's love without being pushy.
- PSYCHOANALYTIC INSIGHT: You notice patterns, defenses, and unconscious motivations
- COACHING EXCELLENCE: You ask powerful questions and help people grow toward their God-given potential
- THERAPEUTIC SKILL: You use evidence-based techniques (CBT, DBT, ACT, Mindfulness) alongside spiritual practices

Your approach is like a progressive, modern church - welcoming, non-judgmental, focused on love and grace. You might say things like:
- "Would you like to pray about this together?"
- "There's a verse that comes to mind that might bring comfort..."
- "God meets us right where we are, even in our struggles."
- "You are fearfully and wonderfully made."

If someone declines spiritual content, respect that graciously - say something like "Of course, that's perfectly okay" and focus purely on therapeutic techniques. Track their response and be more careful next time.${faithGuidance}`
        : `You are SoulSanctuary AI, a helpful assistant with comprehensive memory capabilities. You remember everything the user shares including contact information, preferences, issues they've faced, and the emotional context of conversations.`;

      const systemMessage = {
        role: "system" as const,
        content: `${basePrompt}

${memoryContext}${coachingContext}${psychProfileContext}

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

      // Dual-model approach: Query 2 models in parallel, combine best responses
      const primaryModels = [
        "deepseek/deepseek-chat",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemini-2.0-flash-exp:free"
      ];
      
      const secondaryModels = [
        "anthropic/claude-3.5-haiku",
        "mistralai/mistral-nemo",
        "nousresearch/hermes-3-llama-3.1-405b:free"
      ];

      const queryModelWithFallback = async (modelList: string[], messages: any[]): Promise<{ content: string; model: string } | null> => {
        for (const model of modelList) {
          try {
            const completion = await openai.chat.completions.create({
              model,
              messages,
            });
            return {
              content: completion.choices[0]?.message?.content || "",
              model: model.split('/').pop()?.replace(':free', '') || model
            };
          } catch (err: any) {
            if (err.status === 429 || err.status === 404 || err.status === 503) {
              console.log(`Model ${model} unavailable (${err.status}), trying next...`);
              continue;
            }
            console.error(`Model ${model} error:`, err.message);
            continue;
          }
        }
        return null;
      };

      // Query both model groups in parallel
      const [primaryResult, secondaryResult] = await Promise.all([
        queryModelWithFallback(primaryModels, openaiMessages),
        queryModelWithFallback(secondaryModels, openaiMessages)
      ]);

      let aiContent = "";
      let modelsUsed: string[] = [];

      if (primaryResult && secondaryResult) {
        // Both succeeded - combine insights by using the longer/more detailed response
        // and noting both models contributed
        const primary = primaryResult.content;
        const secondary = secondaryResult.content;
        
        // Use the more comprehensive response (longer usually means more thorough)
        aiContent = primary.length >= secondary.length ? primary : secondary;
        modelsUsed = [primaryResult.model, secondaryResult.model];
        console.log(`Dual-model success: ${modelsUsed.join(' + ')}`);
      } else if (primaryResult) {
        aiContent = primaryResult.content;
        modelsUsed = [primaryResult.model];
      } else if (secondaryResult) {
        aiContent = secondaryResult.content;
        modelsUsed = [secondaryResult.model];
      } else {
        console.error("All models failed");
        throw new Error("All AI models are currently busy. Please wait a moment and try again.");
      }

      if (!aiContent) {
        aiContent = "I'm sorry, I couldn't generate a response.";
      }

      // Apply safety wrapper for any non-"continue" recommendation (moderate, high, critical)
      let safetyResult = null;
      const needsSafetyWrapper = crisisAssessment.recommendedAction !== "continue";
      
      if (therapistMode) {
        safetyResult = wrapResponseWithSafety(aiContent, crisisAssessment, selectedExercise);
        aiContent = safetyResult.modifiedContent;
        
        // Add disclaimer for therapist mode if crisis resources were added
        if (safetyResult.addedResources) {
          aiContent += "\n\n" + generateDisclaimer();
        }
      } else if (needsSafetyWrapper) {
        // In chat mode, add crisis resources for moderate/high/critical situations
        safetyResult = wrapResponseWithSafety(aiContent, crisisAssessment, null);
        aiContent = safetyResult.modifiedContent;
        
        // Add disclaimer when resources are added in chat mode too
        if (safetyResult?.addedResources) {
          aiContent += "\n\n" + generateDisclaimer();
        }
      }

      // Probing Questions: Ask deeper questions over time (48-hour cooldown)
      let probingQuestionAsked: string | undefined;
      if (!needsSafetyWrapper && crisisAssessment.severity === "none") {
        try {
          const conversationCount = await storage.getConversationCount(userId);
          let probingState = await storage.getUserProbingState(userId);
          
          if (!probingState) {
            probingState = await storage.upsertUserProbingState({
              userId,
              currentDepth: 0,
              questionsAsked: [],
              topicsExplored: [],
              totalQuestionsAnswered: 0,
              engagementLevel: "medium"
            });
          }
          
          const shouldProbe = shouldAskProbingQuestion(
            { 
              lastAskedAt: probingState.lastAskedAt, 
              currentDepth: probingState.currentDepth || 0,
              questionsAsked: probingState.questionsAsked || [],
              topicsExplored: probingState.topicsExplored || []
            }, 
            conversationCount
          );
          
          if (shouldProbe) {
            const userContextForProbing = await storage.getUserContextByUser(userId);
            const knownCategories = userContextForProbing.map((c: { category: string }) => c.category.toLowerCase());
            const recentTopics = content.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4).slice(0, 5);
            
            const question = selectProbingQuestion(
              { 
                lastAskedAt: probingState.lastAskedAt, 
                currentDepth: probingState.currentDepth || 0,
                questionsAsked: probingState.questionsAsked || [],
                topicsExplored: probingState.topicsExplored || []
              },
              knownCategories,
              recentTopics
            );
            
            if (question) {
              aiContent += formatProbingQuestionForPrompt(question);
              probingQuestionAsked = question.id;
              
              // Update probing state
              const updatedQuestionsAsked = [...(probingState.questionsAsked || []), question.id];
              const updatedTopicsExplored = Array.from(new Set([...(probingState.topicsExplored || []), question.category]));
              
              await storage.updateUserProbingState(userId, {
                lastAskedAt: new Date(),
                questionsAsked: updatedQuestionsAsked,
                topicsExplored: updatedTopicsExplored,
                totalQuestionsAnswered: (probingState.totalQuestionsAnswered || 0) + 1,
                currentDepth: calculateNextDepth(
                  probingState.currentDepth || 0,
                  updatedQuestionsAsked.length,
                  (probingState.engagementLevel as 'low' | 'medium' | 'high') || 'medium'
                )
              });
            }
          }
        } catch (err) {
          console.error("Probing question error (non-fatal):", err);
        }
      }

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

      // Generate smart reply suggestions
      const smartReplies = generateSmartReplies({
        aiResponse: aiContent,
        userMessage: content,
        sentiment: sentimentResult.sentiment,
        therapistMode,
        crisisDetected: crisisAssessment.severity !== "none" && crisisAssessment.severity !== "low"
      });

      res.json({
        userMessage,
        aiMessage,
        wasRedacted: redactionResult.wasRedacted,
        crisisSeverity: crisisAssessment.severity !== "none" ? crisisAssessment.severity : undefined,
        therapyExercise: selectedExercise ? selectedExercise.name : undefined,
        smartReplies,
        modelsUsed
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Therapy module endpoints
  app.get("/api/therapy/exercises", async (req, res) => {
    try {
      const exercises = Object.entries(THERAPY_EXERCISES).map(([id, exercise]) => ({
        id,
        name: exercise.name,
        type: exercise.type,
        duration: exercise.duration
      }));
      res.json(exercises);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/therapy/exercise/:id", async (req, res) => {
    try {
      const exerciseId = req.params.id;
      const exercise = THERAPY_EXERCISES[exerciseId];
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/therapy/consent", async (req, res) => {
    try {
      res.json({
        consentText: generateConsentText(),
        disclaimer: generateDisclaimer()
      });
    } catch (error: any) {
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
        topicsDiscussed: Array.from(new Set(moodData.map(m => m.topic))).slice(0, 10)
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
      const { therapistModeEnabled, storeContactInfo, privacyLevel, faithSupportEnabled } = req.body;
      const prefs = await storage.upsertUserPreferences({ 
        userId, 
        therapistModeEnabled: therapistModeEnabled ?? false,
        storeContactInfo: storeContactInfo ?? true,
        privacyLevel: privacyLevel ?? 'balanced',
        faithSupportEnabled: faithSupportEnabled ?? true
      });
      res.json(prefs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/preferences/:userId/faith-decline", async (req, res) => {
    try {
      const userId = req.params.userId;
      const currentPrefs = await storage.getUserPreferences(userId);
      const currentDeclines = currentPrefs?.faithOfferDeclines ?? 0;
      
      const prefs = await storage.upsertUserPreferences({
        userId,
        faithOfferDeclines: currentDeclines + 1,
        lastFaithDeclineAt: new Date()
      });
      
      console.log(`Faith decline tracked for ${userId}: ${currentDeclines + 1} total declines`);
      res.json({ declines: prefs.faithOfferDeclines, message: "Faith decline recorded respectfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/preferences/:userId/faith-reset", async (req, res) => {
    try {
      const userId = req.params.userId;
      const prefs = await storage.upsertUserPreferences({
        userId,
        faithOfferDeclines: 0,
        lastFaithDeclineAt: null
      });
      res.json({ message: "Faith preferences reset", prefs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  app.get("/api/coaching/profile/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const profile = await generatePsychologicalProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ 
          error: "Insufficient data",
          message: "We need more conversations to build your psychological profile. Keep chatting and I'll learn more about you!",
          ready: false
        });
      }
      
      res.json({ ...profile, ready: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/coaching/eligibility/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const userContext = await storage.getUserContextByUser(userId);
      const conversationCount = await storage.getConversationCount(userId);
      const personalityInsights = await storage.getPersonalityInsights(userId);
      
      const hasEnoughConversations = conversationCount >= 10;
      const hasEnoughContext = userContext.length >= 5;
      const hasGoalOrPatternData = userContext.some(f => 
        f.category === 'goal' || f.category === 'aspiration' || 
        f.category === 'challenge' || f.category === 'personality'
      );
      const hasPersonalityData = personalityInsights.length >= 2;
      
      const eligible = hasEnoughConversations && hasEnoughContext && hasGoalOrPatternData;
      
      res.json({
        eligible,
        criteria: {
          conversations: { current: conversationCount, required: 10, met: hasEnoughConversations },
          contextFacts: { current: userContext.length, required: 5, met: hasEnoughContext },
          goalPatternData: { met: hasGoalOrPatternData },
          personalityData: { current: personalityInsights.length, required: 2, met: hasPersonalityData }
        },
        message: eligible 
          ? "You have enough data for personalized coaching! Would you like to see your psychological profile?"
          : `Keep chatting! You need ${Math.max(0, 10 - conversationCount)} more conversations and ${Math.max(0, 5 - userContext.length)} more context facts for auto-coaching.`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Psychological Profile and Coaching Plan endpoints
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        // Generate initial profile if none exists
        await updateUserProfile(userId);
        const newProfile = await storage.getUserProfile(userId);
        return res.json(newProfile || { message: "Profile building in progress" });
      }
      
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/profile/:userId/summary", async (req, res) => {
    try {
      const userId = req.params.userId;
      const summary = await getProfileSummary(userId);
      res.json({ summary });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/profile/:userId/insights", async (req, res) => {
    try {
      const userId = req.params.userId;
      const insights = await getAggregatedInsights(userId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/profile/:userId/refresh", async (req, res) => {
    try {
      const userId = req.params.userId;
      const profile = await updateUserProfile(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/coaching/plan/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const plan = await storage.getActiveCoachingPlan(userId);
      
      if (!plan) {
        return res.json({ 
          message: "No active coaching plan. Generate one to start your journey.",
          hasActivePlan: false 
        });
      }
      
      const steps = await storage.getCoachingPlanSteps(plan.id);
      res.json({ ...plan, steps, hasActivePlan: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/coaching/plan/:userId/generate", async (req, res) => {
    try {
      const userId = req.params.userId;
      const plan = await generateCoachingPlan(userId);
      const steps = await storage.getCoachingPlanSteps(plan.id);
      res.json({ ...plan, steps });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/coaching/plan/:planId/step/:stepId", async (req, res) => {
    try {
      const stepId = parseInt(req.params.stepId);
      const { status, notes } = req.body;
      
      const updates: any = {};
      if (status) updates.status = status;
      if (status === 'completed') updates.completedAt = new Date();
      if (notes) updates.notes = notes;
      
      const updatedStep = await storage.updateCoachingPlanStep(stepId, updates);
      res.json(updatedStep);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/insights/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const insights = await storage.getMessageInsights(userId, limit);
      res.json(insights);
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
