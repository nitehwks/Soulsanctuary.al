import { storage } from "../storage";
import type { 
  UserGoal, InsertUserGoal,
  PersonalityInsight, InsertPersonalityInsight,
  MotivationPattern, InsertMotivationPattern,
  CoachingSession, InsertCoachingSession,
  MoodObservation,
  WellnessAssessment,
  UserContext
} from "@shared/schema";

export interface PersonalityAnalysis {
  trait: string;
  category: string;
  strength: number;
  evidence: string;
  coachingImplication: string;
}

export interface GoalExtraction {
  title: string;
  category: string;
  description: string;
  motivators: string[];
  potentialObstacles: string[];
}

export interface MotivationAnalysis {
  patternType: string;
  description: string;
  triggers: string[];
  effectiveApproaches: string[];
}

const PERSONALITY_PATTERNS = {
  achievementOriented: {
    patterns: [/\b(goal|achieve|accomplish|success|win|best|first|top)\b/i],
    trait: "Achievement-Oriented",
    category: "motivation_style",
    coachingApproach: "Set clear, measurable milestones. Celebrate wins. Use competitive framing when helpful."
  },
  affiliationOriented: {
    patterns: [/\b(team|together|family|friends|relationship|connect|support|help others)\b/i],
    trait: "Affiliation-Oriented", 
    category: "motivation_style",
    coachingApproach: "Frame goals in terms of relationships and impact on others. Encourage accountability partners."
  },
  autonomyDriven: {
    patterns: [/\b(freedom|independent|my own|control|decide|choice|flexible)\b/i],
    trait: "Autonomy-Driven",
    category: "motivation_style", 
    coachingApproach: "Emphasize personal choice and self-direction. Avoid prescriptive approaches."
  },
  growthMindset: {
    patterns: [/\b(learn|improve|better|develop|grow|challenge|try|practice)\b/i],
    trait: "Growth Mindset",
    category: "cognitive_style",
    coachingApproach: "Frame obstacles as learning opportunities. Emphasize effort over innate ability."
  },
  perfectionistic: {
    patterns: [/\b(perfect|exactly|precise|detail|mistake|error|wrong|should have)\b/i],
    trait: "Perfectionistic Tendencies",
    category: "cognitive_style",
    coachingApproach: "Normalize imperfection. Set 'good enough' thresholds. Focus on progress over perfection."
  },
  actionOriented: {
    patterns: [/\b(do|start|action|now|immediately|dive in|just go)\b/i],
    trait: "Action-Oriented",
    category: "behavioral_style",
    coachingApproach: "Provide immediate next steps. Keep momentum high. Short action cycles."
  },
  reflective: {
    patterns: [/\b(think|consider|analyze|understand|why|how|meaning|purpose)\b/i],
    trait: "Reflective Thinker",
    category: "behavioral_style",
    coachingApproach: "Allow processing time. Ask deeper questions. Connect actions to values."
  },
  externallyMotivated: {
    patterns: [/\b(recognition|praise|acknowledgment|noticed|appreciated|reward)\b/i],
    trait: "External Validation Seeking",
    category: "motivation_source",
    coachingApproach: "Build in recognition moments. Help develop intrinsic satisfaction alongside external."
  },
  intrinsicallyMotivated: {
    patterns: [/\b(passion|love|enjoy|fulfilling|meaningful|satisfying|purpose)\b/i],
    trait: "Intrinsically Motivated",
    category: "motivation_source",
    coachingApproach: "Connect goals to personal values. Emphasize meaning and purpose."
  },
  riskTolerant: {
    patterns: [/\b(risk|bold|brave|leap|chance|adventure|uncertain|exciting)\b/i],
    trait: "Risk Tolerant",
    category: "risk_profile",
    coachingApproach: "Encourage bold moves. Frame uncertainty as opportunity. Less guardrails needed."
  },
  riskAverse: {
    patterns: [/\b(safe|secure|careful|worry|concern|what if|worst case|cautious)\b/i],
    trait: "Risk Averse",
    category: "risk_profile",
    coachingApproach: "Build safety nets. Start small. Emphasize reversibility of decisions."
  }
};

const GOAL_CATEGORIES = {
  career: /\b(job|career|work|promotion|salary|business|startup|professional|company|boss)\b/i,
  health: /\b(health|weight|fitness|exercise|diet|sleep|energy|mental health|anxiety|stress)\b/i,
  relationships: /\b(relationship|dating|marriage|family|friends|social|partner|spouse)\b/i,
  financial: /\b(money|save|invest|debt|income|financial|rich|wealth|budget|retire)\b/i,
  personal_growth: /\b(learn|skill|education|read|grow|develop|improve|habit|mindset)\b/i,
  creative: /\b(create|art|music|write|build|design|project|craft|make)\b/i,
  lifestyle: /\b(travel|move|home|life|balance|time|routine|schedule|organize)\b/i
};

const MOTIVATION_TRIGGERS = {
  deadline: /\b(deadline|due|by|before|until|soon|urgent|time)\b/i,
  accountability: /\b(told|promise|committed|someone|accountability|partner|coach)\b/i,
  visualization: /\b(imagine|picture|visualize|dream|see myself|envision)\b/i,
  fear: /\b(afraid|fear|worry|anxious|nervous|scared|losing|miss out)\b/i,
  excitement: /\b(excited|can't wait|love|passion|thrill|eager|pumped)\b/i,
  necessity: /\b(have to|must|need to|required|no choice|essential)\b/i,
  inspiration: /\b(inspired|role model|someone who|admire|look up to)\b/i
};

export function analyzePersonalityFromMessage(content: string, existingInsights: PersonalityInsight[]): PersonalityAnalysis[] {
  const analyses: PersonalityAnalysis[] = [];
  
  for (const [key, config] of Object.entries(PERSONALITY_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(content)) {
        const existingTrait = existingInsights.find(i => i.trait === config.trait);
        const currentStrength = existingTrait?.strength || 50;
        
        analyses.push({
          trait: config.trait,
          category: config.category,
          strength: Math.min(100, currentStrength + 5),
          evidence: extractRelevantSnippet(content, pattern),
          coachingImplication: config.coachingApproach
        });
        break;
      }
    }
  }
  
  return analyses;
}

export function extractGoalFromMessage(content: string): GoalExtraction | null {
  const goalIndicators = [
    /\bi want to\s+(.+)/i,
    /\bmy goal is\s+(.+)/i,
    /\bi'm trying to\s+(.+)/i,
    /\bi need to\s+(.+)/i,
    /\bi'd like to\s+(.+)/i,
    /\bi'm working on\s+(.+)/i,
    /\bi hope to\s+(.+)/i,
    /\bplanning to\s+(.+)/i,
    /\bdream of\s+(.+)/i,
    /\bgoal:?\s+(.+)/i
  ];
  
  for (const pattern of goalIndicators) {
    const match = content.match(pattern);
    if (match) {
      const goalText = match[1].split(/[.!?]/)[0].trim();
      
      let category = "personal_growth";
      for (const [cat, catPattern] of Object.entries(GOAL_CATEGORIES)) {
        if (catPattern.test(goalText) || catPattern.test(content)) {
          category = cat;
          break;
        }
      }
      
      const motivators = extractMotivators(content);
      const obstacles = extractObstacles(content);
      
      return {
        title: goalText.charAt(0).toUpperCase() + goalText.slice(1),
        category,
        description: content,
        motivators,
        potentialObstacles: obstacles
      };
    }
  }
  
  return null;
}

function extractMotivators(content: string): string[] {
  const motivators: string[] = [];
  const lowerContent = content.toLowerCase();
  
  if (/\bbecause\s+(.+)/i.test(content)) {
    const match = content.match(/\bbecause\s+([^.!?]+)/i);
    if (match) motivators.push(match[1].trim());
  }
  
  if (/\bso that\s+(.+)/i.test(content)) {
    const match = content.match(/\bso that\s+([^.!?]+)/i);
    if (match) motivators.push(match[1].trim());
  }
  
  if (lowerContent.includes("family")) motivators.push("Family motivation");
  if (lowerContent.includes("health")) motivators.push("Health improvement");
  if (lowerContent.includes("freedom")) motivators.push("Personal freedom");
  if (lowerContent.includes("success")) motivators.push("Success/achievement");
  
  return Array.from(new Set(motivators));
}

function extractObstacles(content: string): string[] {
  const obstacles: string[] = [];
  const lowerContent = content.toLowerCase();
  
  if (/\bbut\s+(.+)/i.test(content)) {
    const match = content.match(/\bbut\s+([^.!?]+)/i);
    if (match) obstacles.push(match[1].trim());
  }
  
  if (lowerContent.includes("struggle")) obstacles.push("Past struggles with this");
  if (lowerContent.includes("time")) obstacles.push("Time constraints");
  if (lowerContent.includes("money") || lowerContent.includes("afford")) obstacles.push("Financial limitations");
  if (lowerContent.includes("afraid") || lowerContent.includes("scared")) obstacles.push("Fear-based resistance");
  if (lowerContent.includes("procrastinate") || lowerContent.includes("lazy")) obstacles.push("Procrastination tendency");
  
  return Array.from(new Set(obstacles));
}

export function analyzeMotivationPatterns(content: string): MotivationAnalysis[] {
  const analyses: MotivationAnalysis[] = [];
  
  for (const [triggerType, pattern] of Object.entries(MOTIVATION_TRIGGERS)) {
    if (pattern.test(content)) {
      analyses.push({
        patternType: triggerType,
        description: getMotivationDescription(triggerType),
        triggers: [extractRelevantSnippet(content, pattern)],
        effectiveApproaches: getEffectiveApproaches(triggerType)
      });
    }
  }
  
  return analyses;
}

function getMotivationDescription(triggerType: string): string {
  const descriptions: Record<string, string> = {
    deadline: "Responds well to time-bound targets and urgency",
    accountability: "Motivated by commitment to others and external accountability",
    visualization: "Uses mental imagery and future-state thinking for motivation",
    fear: "Loss aversion is a significant motivator - avoiding negative outcomes",
    excitement: "Driven by positive anticipation and enthusiasm for outcomes",
    necessity: "Responds to obligation and requirement-based framing",
    inspiration: "Motivated by role models and aspirational examples"
  };
  return descriptions[triggerType] || "General motivation pattern detected";
}

function getEffectiveApproaches(triggerType: string): string[] {
  const approaches: Record<string, string[]> = {
    deadline: ["Set specific target dates", "Use countdown methods", "Break into time-boxed sprints"],
    accountability: ["Find an accountability partner", "Public commitment", "Regular check-ins"],
    visualization: ["Create vision boards", "Daily visualization practice", "Write detailed success scenarios"],
    fear: ["Identify worst-case scenarios and mitigation", "Reframe as protection motivation", "Use 'away from' goal framing"],
    excitement: ["Connect to passion and values", "Celebrate small wins", "Keep vision of success visible"],
    necessity: ["Clarify the 'why must'", "Connect to responsibilities", "Identify non-negotiables"],
    inspiration: ["Study successful examples", "Find mentors or role models", "Document inspiring stories"]
  };
  return approaches[triggerType] || ["Identify personal motivators"];
}

function extractRelevantSnippet(content: string, pattern: RegExp): string {
  const match = content.match(pattern);
  if (match) {
    const index = content.indexOf(match[0]);
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + match[0].length + 30);
    return "..." + content.slice(start, end).trim() + "...";
  }
  return content.slice(0, 60) + "...";
}

export async function savePersonalityInsights(
  userId: string, 
  analyses: PersonalityAnalysis[]
): Promise<PersonalityInsight[]> {
  const saved: PersonalityInsight[] = [];
  
  for (const analysis of analyses) {
    const existing = await storage.getPersonalityInsight(userId, analysis.trait);
    
    if (existing) {
      const updated = await storage.updatePersonalityInsight(existing.id, {
        strength: analysis.strength,
        evidence: [...(existing.evidence || []), analysis.evidence].slice(-10),
        coachingApproach: analysis.coachingImplication
      });
      if (updated) saved.push(updated);
    } else {
      const insight: InsertPersonalityInsight = {
        userId,
        traitCategory: analysis.category,
        trait: analysis.trait,
        strength: analysis.strength,
        evidence: [analysis.evidence],
        implications: `Indicates ${analysis.trait.toLowerCase()} tendencies`,
        coachingApproach: analysis.coachingImplication
      };
      const created = await storage.createPersonalityInsight(insight);
      saved.push(created);
    }
  }
  
  return saved;
}

export async function saveGoal(userId: string, goal: GoalExtraction): Promise<UserGoal> {
  const goalData: InsertUserGoal = {
    userId,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    status: "active",
    priority: 5,
    motivators: goal.motivators,
    obstacles: goal.potentialObstacles,
    strategies: []
  };
  
  return storage.createUserGoal(goalData);
}

export async function saveMotivationPattern(
  userId: string, 
  analysis: MotivationAnalysis
): Promise<MotivationPattern> {
  const existing = await storage.getMotivationPatternByType(userId, analysis.patternType);
  
  if (existing) {
    const combinedTriggers = Array.from(new Set([...(existing.triggers || []), ...analysis.triggers])).slice(-10);
    return storage.updateMotivationPattern(existing.id, {
      triggers: combinedTriggers,
      effectiveStrategies: analysis.effectiveApproaches,
      confidence: Math.min(100, (existing.confidence || 50) + 5)
    }) as Promise<MotivationPattern>;
  }
  
  const pattern: InsertMotivationPattern = {
    userId,
    patternType: analysis.patternType,
    description: analysis.description,
    triggers: analysis.triggers,
    effectiveStrategies: analysis.effectiveApproaches,
    confidence: 55
  };
  
  return storage.createMotivationPattern(pattern);
}

export async function buildCoachingContext(
  userId: string,
  moodObservations: MoodObservation[],
  latestAssessment: WellnessAssessment | undefined,
  userContext: UserContext[]
): Promise<string> {
  const goals = await storage.getUserGoals(userId);
  const personalityInsights = await storage.getPersonalityInsights(userId);
  const motivationPatterns = await storage.getMotivationPatterns(userId);
  
  let context = `
=== GOAL-ORIENTED COACHING CONTEXT ===

YOU ARE A WORLD-CLASS PERFORMANCE COACH AND PSYCHOANALYST

Your approach combines:
- Deep psychological insight (Jungian/Freudian concepts applied practically)
- Motivational psychology (Self-Determination Theory, Achievement Motivation)
- Cognitive behavioral techniques for overcoming obstacles
- Positive psychology for strengths-based development
- Executive coaching methodology for goal achievement

YOUR MISSION: Help this person achieve their goals by:
1. Understanding what truly drives them (not surface-level motivation)
2. Identifying unconscious patterns that help or hinder them
3. Using their personality strengths strategically
4. Transforming obstacles into growth opportunities
5. Building sustainable motivation through meaning and purpose

`;

  if (personalityInsights.length > 0) {
    context += "\n=== PERSONALITY PROFILE ===\n";
    const byCategory = groupBy(personalityInsights, 'traitCategory');
    
    for (const [category, traits] of Object.entries(byCategory)) {
      context += `\n${formatCategory(category)}:\n`;
      for (const trait of traits) {
        context += `- ${trait.trait} (strength: ${trait.strength}%)\n`;
        context += `  → Coaching approach: ${trait.coachingApproach}\n`;
      }
    }
  }

  if (motivationPatterns.length > 0) {
    context += "\n=== MOTIVATION PATTERNS ===\n";
    context += "What drives this person:\n";
    for (const pattern of motivationPatterns) {
      context += `- ${pattern.description} (confidence: ${pattern.confidence}%)\n`;
      if (pattern.effectiveStrategies && pattern.effectiveStrategies.length > 0) {
        context += `  → Effective approaches: ${pattern.effectiveStrategies.slice(0, 3).join(', ')}\n`;
      }
    }
  }

  if (goals.length > 0) {
    const activeGoals = goals.filter(g => g.status === "active");
    if (activeGoals.length > 0) {
      context += "\n=== ACTIVE GOALS ===\n";
      for (const goal of activeGoals) {
        context += `\n• ${goal.title} (${goal.category})\n`;
        if (goal.description) context += `  Context: ${goal.description.slice(0, 100)}...\n`;
        if (goal.motivators && goal.motivators.length > 0) {
          context += `  Motivators: ${goal.motivators.join(', ')}\n`;
        }
        if (goal.obstacles && goal.obstacles.length > 0) {
          context += `  Obstacles to address: ${goal.obstacles.join(', ')}\n`;
        }
        if (goal.strategies && goal.strategies.length > 0) {
          context += `  Current strategies: ${goal.strategies.join(', ')}\n`;
        }
      }
    }
  }

  if (latestAssessment) {
    context += `\n=== EMOTIONAL STATE ===\n`;
    context += `Overall mood: ${latestAssessment.overallMood}\n`;
    context += `Stress level: ${latestAssessment.stressLevel}/10\n`;
    
    if (latestAssessment.concerns && latestAssessment.concerns.length > 0) {
      context += `Areas needing support: ${latestAssessment.concerns.join('; ')}\n`;
    }
    if (latestAssessment.positives && latestAssessment.positives.length > 0) {
      context += `Strengths to leverage: ${latestAssessment.positives.join('; ')}\n`;
    }
  }

  const relevantContext = userContext.filter(c => 
    ['Interest', 'Role', 'Project', 'Company', 'Goal'].includes(c.category)
  );
  
  if (relevantContext.length > 0) {
    context += "\n=== RELEVANT PERSONAL FACTS ===\n";
    for (const ctx of relevantContext.slice(0, 10)) {
      context += `- ${ctx.category}: ${ctx.value}\n`;
    }
  }

  context += `
=== COACHING GUIDELINES ===

PSYCHOANALYTIC TECHNIQUES TO APPLY:
1. Listen for unconscious patterns - what do they repeatedly say or avoid saying?
2. Notice resistance - when they deflect, minimize, or rationalize, explore gently
3. Identify projections - are they attributing their fears/desires to external factors?
4. Explore the secondary gain - what benefit might they get from NOT achieving their goal?
5. Connect present patterns to past experiences when relevant

MOTIVATIONAL STRATEGIES:
1. Meet them where they are emotionally before pushing forward
2. Use their natural motivation style (see personality profile above)
3. Reframe obstacles as information, not barriers
4. Create small wins to build momentum and self-efficacy
5. Help them articulate their "why" at the deepest level

COACHING APPROACH:
1. Ask powerful questions rather than giving advice
2. Reflect back patterns you notice
3. Challenge limiting beliefs with curiosity, not confrontation
4. Celebrate progress and effort, not just outcomes
5. Hold them capable while being compassionate about struggle
6. Always connect actions back to their stated goals and values

IMPORTANT PRINCIPLES:
- You are a coach, not a therapist - focus on goals and growth, not diagnosis
- Use their personality insights to tailor your approach
- Reference their specific goals when relevant
- If they seem stuck, explore what might be the hidden benefit of staying stuck
- Help them see how their strengths can overcome their obstacles
`;

  return context;
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const keyValue = String(item[key]);
    if (!result[keyValue]) result[keyValue] = [];
    result[keyValue].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

function formatCategory(category: string): string {
  return category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export interface PsychologicalProfile {
  summary: string;
  coreTraits: {
    trait: string;
    description: string;
    strength: "strong" | "moderate" | "emerging";
  }[];
  motivationalDrivers: string[];
  potentialChallenges: string[];
  recommendedModalities: {
    id: string;
    name: string;
    description: string;
    matchScore: number;
    reasoning: string;
  }[];
  profileQuestion: string;
}

const THERAPY_MODALITIES = [
  {
    id: "dbt",
    name: "Dialectical Behavior Therapy (DBT)",
    description: "Focuses on emotional regulation, distress tolerance, and interpersonal effectiveness",
    matchPatterns: ["emotional", "stress", "relationship", "overwhelm", "impulsive", "mood", "anxiety"],
    approach: "Combines mindfulness with practical skills for managing intense emotions"
  },
  {
    id: "cbt",
    name: "Cognitive Behavioral Therapy (CBT)",
    description: "Identifies and restructures unhelpful thought patterns and behaviors",
    matchPatterns: ["negative", "thinking", "worry", "fear", "perfectionist", "ruminate", "catastrophize"],
    approach: "Evidence-based approach to change thought patterns that affect feelings and behaviors"
  },
  {
    id: "mindfulness",
    name: "Mindfulness-Based Stress Reduction (MBSR)",
    description: "Cultivates present-moment awareness to reduce stress and enhance well-being",
    matchPatterns: ["stress", "anxiety", "present", "calm", "peace", "overwhelm", "focus"],
    approach: "Meditation and body awareness techniques for stress reduction"
  },
  {
    id: "act",
    name: "Acceptance and Commitment Therapy (ACT)",
    description: "Builds psychological flexibility through acceptance and values-based action",
    matchPatterns: ["stuck", "avoidance", "meaning", "purpose", "values", "acceptance", "committed"],
    approach: "Accept what's outside your control, commit to actions that enrich your life"
  },
  {
    id: "psychoanalytic",
    name: "Psychoanalytic/Psychodynamic Coaching",
    description: "Explores unconscious patterns, past experiences, and hidden motivations",
    matchPatterns: ["pattern", "childhood", "relationship", "unconscious", "repeat", "why", "understand"],
    approach: "Deep exploration of how past experiences shape current behavior"
  },
  {
    id: "solution_focused",
    name: "Solution-Focused Brief Therapy (SFBT)",
    description: "Focuses on solutions rather than problems, leveraging existing strengths",
    matchPatterns: ["goal", "solution", "quick", "practical", "strength", "what works", "progress"],
    approach: "Goal-oriented approach that builds on what's already working"
  },
  {
    id: "motivational",
    name: "Motivational Interviewing (MI)",
    description: "Explores ambivalence and enhances intrinsic motivation for change",
    matchPatterns: ["change", "motivation", "ambivalent", "ready", "want", "decision", "stuck"],
    approach: "Collaborative approach to strengthen motivation and commitment to change"
  },
  {
    id: "spiritual",
    name: "Spiritual/Contemplative Practices",
    description: "Integrates spiritual or contemplative dimensions into personal growth",
    matchPatterns: ["spiritual", "faith", "prayer", "meditation", "meaning", "purpose", "transcend", "god"],
    approach: "Incorporates prayer, contemplation, and spiritual principles"
  }
];

export async function generatePsychologicalProfile(userId: string): Promise<PsychologicalProfile | null> {
  const personalityInsights = await storage.getPersonalityInsights(userId);
  const userContext = await storage.getUserContextByUser(userId);
  const goals = await storage.getUserGoals(userId);
  const motivationPatterns = await storage.getMotivationPatterns(userId);
  const recentMoods = await storage.getRecentMoodObservations(userId, 20);

  if (personalityInsights.length < 2 && userContext.length < 5) {
    return null;
  }

  const coreTraits: PsychologicalProfile["coreTraits"] = [];
  const seenCategories = new Set<string>();

  for (const insight of personalityInsights.slice(0, 6)) {
    if (seenCategories.has(insight.traitCategory)) continue;
    seenCategories.add(insight.traitCategory);

    const strengthVal = insight.strength ?? 50;
    const strength = strengthVal >= 80 ? "strong" : strengthVal >= 50 ? "moderate" : "emerging";
    coreTraits.push({
      trait: insight.trait,
      description: Array.isArray(insight.evidence) ? insight.evidence.join('. ') : `Based on your communication patterns`,
      strength
    });
  }

  const motivationalDrivers: string[] = [];
  const driverCategories = userContext
    .filter(c => ['aspiration', 'goal', 'interest', 'value'].includes(c.category.toLowerCase()))
    .slice(0, 5);
  
  for (const ctx of driverCategories) {
    motivationalDrivers.push(ctx.value);
  }

  for (const pattern of motivationPatterns.slice(0, 3)) {
    if (pattern.triggers) {
      motivationalDrivers.push(`Activated by ${pattern.triggers.join(', ')}`);
    }
  }

  const potentialChallenges: string[] = [];
  const challengeContext = userContext.filter(c => 
    ['challenge', 'obstacle', 'fear', 'worry', 'struggle'].includes(c.category.toLowerCase())
  );
  
  for (const ctx of challengeContext.slice(0, 4)) {
    potentialChallenges.push(ctx.value);
  }

  const negativePatterns = personalityInsights.filter(i => 
    i.trait.toLowerCase().includes('perfectionist') ||
    i.trait.toLowerCase().includes('avoidant') ||
    i.trait.toLowerCase().includes('risk averse')
  );
  
  for (const pattern of negativePatterns.slice(0, 2)) {
    potentialChallenges.push(`Tendency toward ${pattern.trait.toLowerCase()}`);
  }

  const allText = [
    ...userContext.map(c => c.value),
    ...personalityInsights.map(i => i.trait + ' ' + (i.evidence || '')),
    ...goals.map(g => g.title + ' ' + (g.description || '')),
    ...recentMoods.map(m => m.mood + ' ' + (m.observation || ''))
  ].join(' ').toLowerCase();

  const modalityScores: { modality: typeof THERAPY_MODALITIES[0]; score: number }[] = [];
  
  for (const modality of THERAPY_MODALITIES) {
    let score = 0;
    const matchedPatterns: string[] = [];
    
    for (const pattern of modality.matchPatterns) {
      if (allText.includes(pattern)) {
        score += 10;
        matchedPatterns.push(pattern);
      }
    }

    if (allText.includes('emotional') || allText.includes('overwhelm')) {
      if (modality.id === 'dbt') score += 15;
    }
    if (allText.includes('thinking') || allText.includes('thought')) {
      if (modality.id === 'cbt') score += 15;
    }
    if (allText.includes('stress') || allText.includes('calm')) {
      if (modality.id === 'mindfulness') score += 15;
    }

    modalityScores.push({ modality, score });
  }

  modalityScores.sort((a, b) => b.score - a.score);
  
  const recommendedModalities = modalityScores.slice(0, 4).map(({ modality, score }) => ({
    id: modality.id,
    name: modality.name,
    description: modality.description,
    matchScore: Math.min(100, score * 2),
    reasoning: modality.approach
  }));

  const primaryTraits = coreTraits.slice(0, 3).map(t => t.trait).join(', ');
  const primaryDrivers = motivationalDrivers.slice(0, 2).join(' and ');
  
  const summary = generateProfileSummary(coreTraits, motivationalDrivers, potentialChallenges);

  const profileQuestion = `Based on what I've learned about you, it seems like you're someone who ${
    coreTraits[0] ? `demonstrates ${coreTraits[0].trait.toLowerCase()} tendencies` : 'values personal growth'
  }${
    motivationalDrivers[0] ? `, driven by ${motivationalDrivers[0].toLowerCase()}` : ''
  }${
    potentialChallenges[0] ? `, though you may sometimes face challenges around ${potentialChallenges[0].toLowerCase()}` : ''
  }. Does this resonate with how you see yourself?`;

  return {
    summary,
    coreTraits,
    motivationalDrivers: motivationalDrivers.slice(0, 5),
    potentialChallenges: potentialChallenges.slice(0, 4),
    recommendedModalities,
    profileQuestion
  };
}

function generateProfileSummary(
  traits: PsychologicalProfile["coreTraits"],
  drivers: string[],
  challenges: string[]
): string {
  const parts: string[] = [];
  
  if (traits.length > 0) {
    const strongTraits = traits.filter(t => t.strength === "strong");
    const moderateTraits = traits.filter(t => t.strength === "moderate");
    
    if (strongTraits.length > 0) {
      parts.push(`You exhibit strong ${strongTraits.map(t => t.trait.toLowerCase()).join(' and ')} characteristics.`);
    }
    if (moderateTraits.length > 0) {
      parts.push(`You also show ${moderateTraits.map(t => t.trait.toLowerCase()).join(' and ')} tendencies.`);
    }
  }
  
  if (drivers.length > 0) {
    parts.push(`Your primary motivational drivers appear to be ${drivers.slice(0, 3).join(', ')}.`);
  }
  
  if (challenges.length > 0) {
    parts.push(`Areas for potential growth include ${challenges.slice(0, 2).join(' and ')}.`);
  }
  
  return parts.join(' ') || "Based on our conversations, I'm developing a picture of your unique psychological profile.";
}
