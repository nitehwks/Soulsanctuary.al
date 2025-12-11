import { storage } from '../storage';
import type { InsertMessageInsight, UserProfile, MessageInsight } from '@shared/schema';

interface PsychologicalSignals {
  primaryEmotion: string | null;
  secondaryEmotions: string[];
  emotionalIntensity: number;
  needsExpressed: string[];
  defenseMechanismsObserved: string[];
  cognitivePatterns: string[];
  attachmentSignals: string[];
  topicsDiscussed: string[];
  valuesRevealed: string[];
  goalsImplied: string[];
  concernsRaised: string[];
  riskFlags: string[];
  wellnessIndicators: string[];
  relationshipsMentioned: { name: string; relation: string; sentiment: string }[];
}

const EMOTION_KEYWORDS: Record<string, string[]> = {
  joy: ['happy', 'excited', 'grateful', 'thrilled', 'delighted', 'pleased', 'joyful', 'amazing', 'wonderful'],
  sadness: ['sad', 'depressed', 'down', 'hopeless', 'empty', 'lonely', 'grief', 'loss', 'miss', 'heartbroken'],
  anger: ['angry', 'frustrated', 'annoyed', 'furious', 'irritated', 'mad', 'pissed', 'hate', 'resent'],
  fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous', 'terrified', 'panic', 'dread', 'fearful'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'stunned'],
  disgust: ['disgusted', 'repulsed', 'sick', 'revolted', 'gross'],
  anticipation: ['excited', 'looking forward', 'can\'t wait', 'eager', 'hopeful'],
  trust: ['trust', 'believe', 'faith', 'confident', 'secure', 'safe'],
  shame: ['ashamed', 'embarrassed', 'humiliated', 'guilty', 'regret'],
  love: ['love', 'care', 'adore', 'cherish', 'devoted', 'affection']
};

const NEED_PATTERNS: Record<string, RegExp[]> = {
  validation: [
    /am i (wrong|right|crazy|overreacting)/i,
    /do you think (i should|i\'m)/i,
    /is (it|this) (normal|okay|ok)/i,
    /need to (know|hear|feel)/i
  ],
  guidance: [
    /what should i do/i,
    /how (do|can|should) i/i,
    /need (help|advice|guidance)/i,
    /don\'t know (what|how|where)/i,
    /confused about/i
  ],
  support: [
    /need (support|someone|to talk)/i,
    /feel (alone|lonely|isolated)/i,
    /nobody (understands|cares|listens)/i,
    /struggling with/i
  ],
  autonomy: [
    /want to (do it myself|figure it out|handle this)/i,
    /my (choice|decision|life)/i,
    /don\'t (tell me|want advice)/i
  ],
  connection: [
    /want to (connect|share|open up)/i,
    /feel (close|connected|understood)/i,
    /miss (having|being|feeling)/i
  ]
};

const DEFENSE_MECHANISMS: Record<string, RegExp[]> = {
  denial: [
    /it\'s (not|fine|okay|no big deal)/i,
    /doesn\'t (bother|affect) me/i,
    /i don\'t (care|mind)/i
  ],
  rationalization: [
    /because (they|it|he|she) (made|forced|had)/i,
    /it makes sense (because|that)/i,
    /the reason (is|was)/i
  ],
  projection: [
    /they (always|never|are the one)/i,
    /it\'s (their|his|her) (fault|problem)/i,
    /everyone (else|is)/i
  ],
  displacement: [
    /take it out on/i,
    /can\'t help but/i,
    /end up (yelling|snapping|being mean)/i
  ],
  avoidance: [
    /don\'t want to (talk|think|deal)/i,
    /avoid(ing)? (it|them|this)/i,
    /change the subject/i
  ],
  intellectualization: [
    /logically|theoretically|objectively/i,
    /if you think about it/i,
    /from a (logical|rational) perspective/i
  ]
};

const COGNITIVE_DISTORTIONS: Record<string, RegExp[]> = {
  all_or_nothing: [
    /always|never|everyone|no one|everything|nothing/i,
    /completely|totally|absolutely/i
  ],
  catastrophizing: [
    /worst (thing|case|possible)/i,
    /disaster|catastrophe|end of the world/i,
    /going to (ruin|destroy|fail)/i
  ],
  mind_reading: [
    /they (think|believe|feel) (i|that)/i,
    /knows? (i\'m|what|that)/i,
    /can tell (they|he|she)/i
  ],
  fortune_telling: [
    /will (never|always|definitely)/i,
    /going to (happen|fail|work)/i,
    /know (it will|what will)/i
  ],
  should_statements: [
    /should (have|be|do)/i,
    /must (be|do|have)/i,
    /have to (be|do)/i,
    /supposed to/i
  ],
  personalization: [
    /my fault|because of me/i,
    /if only i (had|didn\'t)/i,
    /blame myself/i
  ],
  emotional_reasoning: [
    /feel (like|that) (it|i|they)/i,
    /feels true/i,
    /because i feel/i
  ]
};

const VALUE_KEYWORDS: Record<string, string[]> = {
  family: ['family', 'kids', 'children', 'parents', 'spouse', 'partner', 'wife', 'husband', 'home'],
  career: ['work', 'job', 'career', 'profession', 'success', 'achievement', 'promotion', 'business'],
  health: ['health', 'fitness', 'wellness', 'exercise', 'diet', 'weight', 'energy', 'sleep'],
  relationships: ['friends', 'friendship', 'love', 'dating', 'relationship', 'marriage', 'connection'],
  spirituality: ['god', 'faith', 'spiritual', 'prayer', 'church', 'meditation', 'soul', 'purpose'],
  creativity: ['art', 'music', 'creative', 'writing', 'design', 'create', 'express', 'artistic'],
  freedom: ['freedom', 'independence', 'autonomy', 'choice', 'control', 'free'],
  security: ['security', 'stability', 'safety', 'savings', 'secure', 'stable'],
  growth: ['grow', 'learn', 'improve', 'develop', 'better', 'change', 'transform'],
  contribution: ['help', 'give', 'contribute', 'volunteer', 'impact', 'difference', 'serve']
};

const RELATIONSHIP_PATTERNS: RegExp[] = [
  /my (wife|husband|partner|spouse|girlfriend|boyfriend|fiance|fiancee)/i,
  /my (mom|mother|dad|father|parent|parents)/i,
  /my (son|daughter|child|children|kids|kid)/i,
  /my (brother|sister|sibling)/i,
  /my (friend|best friend|boss|coworker|colleague)/i,
  /my (therapist|doctor|coach)/i
];

export function analyzeMessage(content: string): PsychologicalSignals {
  const lowercaseContent = content.toLowerCase();
  const signals: PsychologicalSignals = {
    primaryEmotion: null,
    secondaryEmotions: [],
    emotionalIntensity: 5,
    needsExpressed: [],
    defenseMechanismsObserved: [],
    cognitivePatterns: [],
    attachmentSignals: [],
    topicsDiscussed: [],
    valuesRevealed: [],
    goalsImplied: [],
    concernsRaised: [],
    riskFlags: [],
    wellnessIndicators: [],
    relationshipsMentioned: []
  };

  // Detect emotions
  const emotionScores: Record<string, number> = {};
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const matches = keywords.filter(kw => lowercaseContent.includes(kw));
    if (matches.length > 0) {
      emotionScores[emotion] = matches.length;
    }
  }
  
  const sortedEmotions = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion]) => emotion);
  
  if (sortedEmotions.length > 0) {
    signals.primaryEmotion = sortedEmotions[0];
    signals.secondaryEmotions = sortedEmotions.slice(1, 3);
  }

  // Calculate emotional intensity based on language intensity markers
  const intensityMarkers = ['very', 'extremely', 'so', 'really', 'incredibly', 'absolutely', 'completely', '!'];
  const intensityCount = intensityMarkers.filter(m => lowercaseContent.includes(m)).length;
  signals.emotionalIntensity = Math.min(10, 5 + intensityCount);

  // Detect needs
  for (const [need, patterns] of Object.entries(NEED_PATTERNS)) {
    if (patterns.some(p => p.test(content))) {
      signals.needsExpressed.push(need);
    }
  }

  // Detect defense mechanisms
  for (const [mechanism, patterns] of Object.entries(DEFENSE_MECHANISMS)) {
    if (patterns.some(p => p.test(content))) {
      signals.defenseMechanismsObserved.push(mechanism);
    }
  }

  // Detect cognitive distortions
  for (const [distortion, patterns] of Object.entries(COGNITIVE_DISTORTIONS)) {
    if (patterns.some(p => p.test(content))) {
      signals.cognitivePatterns.push(distortion);
    }
  }

  // Detect values
  for (const [value, keywords] of Object.entries(VALUE_KEYWORDS)) {
    if (keywords.some(kw => lowercaseContent.includes(kw))) {
      signals.valuesRevealed.push(value);
    }
  }

  // Extract relationship mentions
  for (const pattern of RELATIONSHIP_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      const relation = match[1].toLowerCase();
      signals.relationshipsMentioned.push({
        name: relation,
        relation: categorizeRelation(relation),
        sentiment: determineSentiment(content, match[0])
      });
    }
  }

  // Detect goals from future-oriented language
  const goalPatterns = [
    /want to (\w+)/gi,
    /need to (\w+)/gi,
    /trying to (\w+)/gi,
    /hope to (\w+)/gi,
    /plan to (\w+)/gi,
    /goal is to (\w+)/gi
  ];
  
  for (const pattern of goalPatterns) {
    const matches = Array.from(content.matchAll(pattern));
    for (const match of matches) {
      signals.goalsImplied.push(match[0]);
    }
  }

  // Detect concerns
  const concernPatterns = [
    /worried about (\w+)/gi,
    /concerned about (\w+)/gi,
    /afraid of (\w+)/gi,
    /struggling with (\w+)/gi,
    /having trouble with (\w+)/gi
  ];
  
  for (const pattern of concernPatterns) {
    const matches = Array.from(content.matchAll(pattern));
    for (const match of matches) {
      signals.concernsRaised.push(match[0]);
    }
  }

  // Risk assessment
  const riskKeywords = ['suicide', 'kill myself', 'end it', 'give up', 'no point', 'harm', 'hurt myself', 'want to die'];
  for (const kw of riskKeywords) {
    if (lowercaseContent.includes(kw)) {
      signals.riskFlags.push('crisis_language_detected');
      break;
    }
  }

  // Wellness indicators (positive signals)
  const wellnessKeywords = ['feeling better', 'making progress', 'proud of', 'grateful', 'hopeful', 'optimistic', 'accomplished'];
  for (const kw of wellnessKeywords) {
    if (lowercaseContent.includes(kw)) {
      signals.wellnessIndicators.push(kw);
    }
  }

  return signals;
}

function categorizeRelation(relation: string): string {
  const familyRelations = ['wife', 'husband', 'partner', 'spouse', 'mom', 'mother', 'dad', 'father', 'parent', 'son', 'daughter', 'child', 'brother', 'sister', 'sibling'];
  const professionalRelations = ['boss', 'coworker', 'colleague', 'therapist', 'doctor', 'coach'];
  
  if (familyRelations.includes(relation)) return 'family';
  if (professionalRelations.includes(relation)) return 'professional';
  return 'social';
}

function determineSentiment(content: string, mentionContext: string): string {
  const positiveWords = ['love', 'support', 'help', 'amazing', 'great', 'wonderful', 'appreciate'];
  const negativeWords = ['problem', 'issue', 'conflict', 'fight', 'argue', 'difficult', 'frustrat'];
  
  const context = content.toLowerCase();
  const hasPositive = positiveWords.some(w => context.includes(w));
  const hasNegative = negativeWords.some(w => context.includes(w));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  if (hasPositive && hasNegative) return 'mixed';
  return 'neutral';
}

export async function createAndStoreInsight(
  userId: string,
  messageId: number,
  conversationId: number,
  content: string
): Promise<MessageInsight> {
  const signals = analyzeMessage(content);
  
  const insight: InsertMessageInsight = {
    userId,
    messageId,
    conversationId,
    primaryEmotion: signals.primaryEmotion,
    secondaryEmotions: signals.secondaryEmotions,
    emotionalIntensity: signals.emotionalIntensity,
    needsExpressed: signals.needsExpressed,
    defenseMechanismsObserved: signals.defenseMechanismsObserved,
    cognitivePatterns: signals.cognitivePatterns,
    attachmentSignals: signals.attachmentSignals,
    topicsDiscussed: signals.topicsDiscussed,
    valuesRevealed: signals.valuesRevealed,
    goalsImplied: signals.goalsImplied,
    concernsRaised: signals.concernsRaised,
    riskFlags: signals.riskFlags,
    wellnessIndicators: signals.wellnessIndicators,
    relationshipsMentioned: signals.relationshipsMentioned
  };
  
  return await storage.createMessageInsight(insight);
}

export async function getAggregatedInsights(userId: string): Promise<{
  emotionProfile: Record<string, number>;
  topNeeds: string[];
  commonDefenses: string[];
  cognitivePatterns: string[];
  coreValues: string[];
  relationshipFocus: string[];
  recentConcerns: string[];
  wellnessTrajectory: string;
}> {
  const insights = await storage.getMessageInsights(userId, 50);
  
  const emotionCounts: Record<string, number> = {};
  const needCounts: Record<string, number> = {};
  const defenseCounts: Record<string, number> = {};
  const cognitiveCounts: Record<string, number> = {};
  const valueCounts: Record<string, number> = {};
  const relationCounts: Record<string, number> = {};
  const allConcerns: string[] = [];
  let wellnessScore = 0;
  
  for (const insight of insights) {
    if (insight.primaryEmotion) {
      emotionCounts[insight.primaryEmotion] = (emotionCounts[insight.primaryEmotion] || 0) + 1;
    }
    
    for (const need of insight.needsExpressed || []) {
      needCounts[need] = (needCounts[need] || 0) + 1;
    }
    
    for (const defense of insight.defenseMechanismsObserved || []) {
      defenseCounts[defense] = (defenseCounts[defense] || 0) + 1;
    }
    
    for (const pattern of insight.cognitivePatterns || []) {
      cognitiveCounts[pattern] = (cognitiveCounts[pattern] || 0) + 1;
    }
    
    for (const value of insight.valuesRevealed || []) {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    }
    
    const relationships = insight.relationshipsMentioned as { relation: string }[] || [];
    for (const rel of relationships) {
      if (rel.relation) {
        relationCounts[rel.relation] = (relationCounts[rel.relation] || 0) + 1;
      }
    }
    
    allConcerns.push(...(insight.concernsRaised || []));
    
    wellnessScore += (insight.wellnessIndicators?.length || 0) - (insight.riskFlags?.length || 0) * 2;
  }
  
  const sortByCount = (counts: Record<string, number>) => 
    Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  
  return {
    emotionProfile: emotionCounts,
    topNeeds: sortByCount(needCounts).slice(0, 5),
    commonDefenses: sortByCount(defenseCounts).slice(0, 3),
    cognitivePatterns: sortByCount(cognitiveCounts).slice(0, 5),
    coreValues: sortByCount(valueCounts).slice(0, 5),
    relationshipFocus: sortByCount(relationCounts).slice(0, 3),
    recentConcerns: Array.from(new Set(allConcerns.slice(-10))),
    wellnessTrajectory: wellnessScore > 5 ? 'improving' : wellnessScore < -5 ? 'declining' : 'stable'
  };
}
