import { storage } from '../storage';
import type { 
  InsertRelationship, 
  InsertLifeEvent, 
  InsertEmotionalSnapshot,
  InsertGoalProgress,
  InsertLearningQueueItem,
  InsertPsychologicalProfile
} from '@shared/schema';

interface RelationshipExtraction {
  name: string;
  relationship: string;
  sentiment?: string;
  context?: string;
}

interface LifeEventExtraction {
  eventType: string;
  description: string;
  emotionalImpact: string;
  isOngoing: boolean;
  relatedPeople?: string[];
}

interface EmotionalState {
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number;
  energyLevel: string;
  triggers: string[];
  copingObserved?: string;
}

const RELATIONSHIP_PATTERNS = [
  { regex: /my (?:wife|husband|spouse)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'spouse' },
  { regex: /my (?:girlfriend|boyfriend|partner|fianc[ée]+)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'partner' },
  { regex: /my (?:mom|mother|mama)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'mother' },
  { regex: /my (?:dad|father|papa)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'father' },
  { regex: /my (?:son|daughter|child|kid)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'child' },
  { regex: /my (?:brother|sister|sibling)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'sibling' },
  { regex: /my (?:friend|best friend|buddy|pal)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'friend' },
  { regex: /my (?:boss|manager|supervisor)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'boss' },
  { regex: /my (?:coworker|colleague|teammate)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'coworker' },
  { regex: /my (?:therapist|counselor|doctor|psychiatrist)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'healthcare_provider' },
  { regex: /my (?:pastor|priest|minister|rabbi)(?:'s name is|,?\s+|\s+)(\w+)/i, type: 'spiritual_leader' },
  { regex: /(\w+),?\s+(?:is\s+)?my (?:wife|husband|spouse)/i, type: 'spouse', nameFirst: true },
  { regex: /(\w+),?\s+(?:is\s+)?my (?:girlfriend|boyfriend|partner)/i, type: 'partner', nameFirst: true },
  { regex: /(\w+),?\s+(?:is\s+)?my (?:mom|mother|dad|father)/i, type: 'parent', nameFirst: true },
  { regex: /(\w+),?\s+(?:is\s+)?my (?:son|daughter|child)/i, type: 'child', nameFirst: true },
  { regex: /(\w+),?\s+(?:is\s+)?my (?:brother|sister)/i, type: 'sibling', nameFirst: true },
  { regex: /(\w+),?\s+(?:is\s+)?my (?:friend|best friend)/i, type: 'friend', nameFirst: true },
];

const LIFE_EVENT_PATTERNS = [
  { regex: /(?:just )?got (?:married|engaged)/i, type: 'marriage', impact: 'positive' },
  { regex: /(?:we're|i'm) (?:expecting|pregnant|having a baby)/i, type: 'pregnancy', impact: 'mixed' },
  { regex: /(?:just )?had a baby|(?:gave birth|became a (?:mom|dad|parent))/i, type: 'new_child', impact: 'positive' },
  { regex: /(?:got|started) a new job|(?:starting|joined|working at) (?:a new|my new)/i, type: 'new_job', impact: 'mixed' },
  { regex: /(?:lost|quit|left|was fired from|laid off from) (?:my )?job/i, type: 'job_loss', impact: 'negative' },
  { regex: /(?:going through|getting) (?:a )?divorce/i, type: 'divorce', impact: 'negative' },
  { regex: /(?:broke up|breaking up|ended (?:my|our) relationship)/i, type: 'breakup', impact: 'negative' },
  { regex: /(?:moved|moving) to (?:a )?(?:new|different)/i, type: 'relocation', impact: 'mixed' },
  { regex: /(?:diagnosed with|have been told i have|found out i have)/i, type: 'health_diagnosis', impact: 'negative' },
  { regex: /(?:in recovery|recovering from|getting treatment for)/i, type: 'health_recovery', impact: 'mixed' },
  { regex: /(?:my|our) (?:\w+) (?:passed away|died|is dying|has cancer|is very sick)/i, type: 'loss_illness', impact: 'negative' },
  { regex: /(?:graduated|finishing|completed) (?:from )?(?:school|college|university|my degree)/i, type: 'graduation', impact: 'positive' },
  { regex: /(?:got promoted|received a promotion|moving up at work)/i, type: 'promotion', impact: 'positive' },
  { regex: /(?:retiring|about to retire|just retired)/i, type: 'retirement', impact: 'mixed' },
  { regex: /(?:buying|bought|just purchased) (?:a )?(?:house|home|property)/i, type: 'home_purchase', impact: 'positive' },
  { regex: /(?:having|dealing with|going through) (?:financial|money) (?:problems|issues|difficulties)/i, type: 'financial_stress', impact: 'negative' },
  { regex: /(?:struggling with|dealing with|fighting) (?:addiction|alcoholism|substance)/i, type: 'addiction', impact: 'negative', ongoing: true },
  { regex: /(?:been feeling|struggling with|diagnosed with) (?:depression|anxiety|bipolar)/i, type: 'mental_health', impact: 'negative', ongoing: true },
];

const EMOTION_KEYWORDS: Record<string, string[]> = {
  joy: ['happy', 'excited', 'thrilled', 'delighted', 'grateful', 'blessed', 'wonderful', 'amazing', 'great', 'fantastic'],
  sadness: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'heartbroken', 'grieving', 'mourning', 'devastated'],
  anger: ['angry', 'furious', 'frustrated', 'annoyed', 'irritated', 'mad', 'upset', 'resentful', 'outraged'],
  fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'terrified', 'panicked', 'frightened', 'fearful'],
  disgust: ['disgusted', 'repulsed', 'sick', 'appalled', 'revolted'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected'],
  trust: ['trust', 'believe', 'faith', 'confident', 'secure', 'safe', 'reliable'],
  anticipation: ['excited', 'hopeful', 'looking forward', 'expecting', 'eager', 'waiting', 'anticipating'],
  love: ['love', 'adore', 'cherish', 'care deeply', 'affection', 'devoted'],
  guilt: ['guilty', 'ashamed', 'regret', 'sorry', 'blame myself', 'my fault'],
  shame: ['embarrassed', 'humiliated', 'mortified', 'ashamed'],
  loneliness: ['lonely', 'alone', 'isolated', 'abandoned', 'disconnected', 'no one understands'],
  overwhelm: ['overwhelmed', 'too much', 'can\'t handle', 'drowning', 'exhausted', 'burned out', 'stressed'],
  hopelessness: ['hopeless', 'pointless', 'no point', 'give up', 'what\'s the point', 'nothing matters'],
  peace: ['peaceful', 'calm', 'serene', 'content', 'at peace', 'tranquil', 'relaxed'],
};

const ENERGY_INDICATORS = {
  high: ['energetic', 'motivated', 'driven', 'pumped', 'excited', 'restless', 'can\'t sit still', 'racing thoughts'],
  low: ['tired', 'exhausted', 'drained', 'no energy', 'lethargic', 'fatigued', 'can barely', 'hard to get up'],
  balanced: ['steady', 'okay', 'fine', 'normal', 'regular', 'usual'],
};

const COPING_PATTERNS = {
  healthy: ['praying', 'exercise', 'meditation', 'journaling', 'talking to', 'therapy', 'breathing', 'taking a walk'],
  avoidant: ['avoiding', 'staying away', 'can\'t face', 'hiding', 'ignoring', 'pushing down', 'pretending'],
  maladaptive: ['drinking', 'smoking', 'overeating', 'not eating', 'not sleeping', 'isolating', 'lashing out'],
  support_seeking: ['reached out', 'talked to', 'asked for help', 'went to', 'called', 'messaged'],
};

const NON_NAME_WORDS = new Set([
  'here', 'there', 'fine', 'good', 'great', 'okay', 'ok', 'well', 'bad', 'tired',
  'happy', 'sad', 'angry', 'excited', 'nervous', 'anxious', 'stressed', 'worried',
  'testing', 'having', 'going', 'doing', 'being', 'feeling', 'thinking', 'wondering',
  'sorry', 'glad', 'sure', 'certain', 'confused', 'lost', 'stuck', 'ready', 'done',
  'back', 'home', 'new', 'old', 'just', 'not', 'now', 'today', 'still', 'always',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to'
]);

export async function extractRelationships(
  message: string,
  userId: string,
  sentiment?: string
): Promise<RelationshipExtraction[]> {
  const extractions: RelationshipExtraction[] = [];
  const lowerMessage = message.toLowerCase();

  for (const pattern of RELATIONSHIP_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match && match[1]) {
      const name = match[1].trim();
      
      if (NON_NAME_WORDS.has(name.toLowerCase()) || name.length < 2) {
        continue;
      }

      const extraction: RelationshipExtraction = {
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        relationship: pattern.type,
        sentiment: sentiment || 'neutral',
        context: message.substring(0, 200)
      };

      extractions.push(extraction);

      try {
        await storage.upsertRelationship(
          userId,
          extraction.name,
          extraction.relationship,
          {
            sentiment: extraction.sentiment,
            notes: extraction.context,
            lastMentioned: new Date()
          }
        );
      } catch (error) {
        console.error('Error storing relationship:', error);
      }
    }
  }

  return extractions;
}

export async function captureEmotionalState(
  message: string,
  conversationId: number,
  userId: string,
  sentimentScore?: number
): Promise<EmotionalState | null> {
  const lowerMessage = message.toLowerCase();
  const detectedEmotions: { emotion: string; count: number }[] = [];

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    let count = 0;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        count++;
      }
    }
    if (count > 0) {
      detectedEmotions.push({ emotion, count });
    }
  }

  if (detectedEmotions.length === 0) {
    return null;
  }

  detectedEmotions.sort((a, b) => b.count - a.count);
  const primaryEmotion = detectedEmotions[0].emotion;
  const secondaryEmotions = detectedEmotions.slice(1, 4).map(e => e.emotion);

  let intensity = 5;
  if (sentimentScore !== undefined) {
    intensity = Math.round(Math.abs(sentimentScore) / 10);
    intensity = Math.max(1, Math.min(10, intensity));
  }
  
  const intensifiers = ['very', 'really', 'so', 'extremely', 'incredibly', 'deeply'];
  for (const intensifier of intensifiers) {
    if (lowerMessage.includes(intensifier)) {
      intensity = Math.min(10, intensity + 2);
      break;
    }
  }

  let energyLevel = 'balanced';
  for (const [level, indicators] of Object.entries(ENERGY_INDICATORS)) {
    for (const indicator of indicators) {
      if (lowerMessage.includes(indicator)) {
        energyLevel = level;
        break;
      }
    }
  }

  const triggers: string[] = [];
  const triggerPatterns = [
    { regex: /because of (.{5,50})/i, extract: 1 },
    { regex: /due to (.{5,50})/i, extract: 1 },
    { regex: /after (.{5,50})/i, extract: 1 },
    { regex: /when (.{5,50})/i, extract: 1 },
    { regex: /since (.{5,50})/i, extract: 1 },
  ];

  for (const pattern of triggerPatterns) {
    const match = message.match(pattern.regex);
    if (match && match[pattern.extract]) {
      const trigger = match[pattern.extract].trim();
      if (trigger.length > 5 && trigger.length < 100) {
        triggers.push(trigger);
      }
    }
  }

  let copingObserved: string | undefined;
  for (const [copingType, patterns] of Object.entries(COPING_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerMessage.includes(pattern)) {
        copingObserved = copingType;
        break;
      }
    }
    if (copingObserved) break;
  }

  const emotionalState: EmotionalState = {
    primaryEmotion,
    secondaryEmotions,
    intensity,
    energyLevel,
    triggers,
    copingObserved
  };

  try {
    const snapshot: InsertEmotionalSnapshot = {
      userId,
      conversationId,
      primaryEmotion,
      secondaryEmotions,
      intensity,
      energyLevel,
      triggers,
      copingObserved
    };
    await storage.createEmotionalSnapshot(snapshot);
  } catch (error) {
    console.error('Error storing emotional snapshot:', error);
  }

  return emotionalState;
}

export async function detectLifeEvents(
  message: string,
  userId: string
): Promise<LifeEventExtraction[]> {
  const events: LifeEventExtraction[] = [];

  for (const pattern of LIFE_EVENT_PATTERNS) {
    if (pattern.regex.test(message)) {
      const event: LifeEventExtraction = {
        eventType: pattern.type,
        description: message.substring(0, 500),
        emotionalImpact: pattern.impact,
        isOngoing: (pattern as any).ongoing || false,
        relatedPeople: []
      };

      const nameMatches = message.match(/\b[A-Z][a-z]+\b/g);
      if (nameMatches) {
        event.relatedPeople = nameMatches.filter(n => 
          !NON_NAME_WORDS.has(n.toLowerCase()) && n.length > 2
        ).slice(0, 5);
      }

      events.push(event);

      try {
        const lifeEvent: InsertLifeEvent = {
          userId,
          eventType: event.eventType,
          description: event.description,
          emotionalImpact: event.emotionalImpact,
          impactScore: event.emotionalImpact === 'positive' ? 7 : event.emotionalImpact === 'negative' ? 3 : 5,
          isOngoing: event.isOngoing,
          relatedPeople: event.relatedPeople,
          confidence: 70
        };
        await storage.createLifeEvent(lifeEvent);
      } catch (error) {
        console.error('Error storing life event:', error);
      }
    }
  }

  return events;
}

export async function trackGoalProgress(
  message: string,
  userId: string
): Promise<void> {
  const lowerMessage = message.toLowerCase();
  
  const progressIndicators = [
    { regex: /i (?:finally|just) (?:did|finished|completed|accomplished) (.{5,100})/i, progress: 100 },
    { regex: /making progress on (.{5,100})/i, progress: 50 },
    { regex: /started (?:working on|with) (.{5,100})/i, progress: 10 },
    { regex: /halfway (?:through|done with) (.{5,100})/i, progress: 50 },
    { regex: /almost (?:done|finished|there) with (.{5,100})/i, progress: 80 },
    { regex: /struggling with (.{5,100})/i, progress: -10 },
    { regex: /gave up on (.{5,100})/i, progress: 0 },
    { regex: /(?:achieved|reached|hit) my goal/i, progress: 100 },
  ];

  const userGoals = await storage.getUserGoals(userId);
  if (userGoals.length === 0) return;

  for (const indicator of progressIndicators) {
    const match = message.match(indicator.regex);
    if (match) {
      const mentionedGoal = match[1]?.toLowerCase() || '';
      
      for (const goal of userGoals) {
        const goalTitle = goal.title.toLowerCase();
        const goalDesc = goal.description?.toLowerCase() || '';
        
        if (mentionedGoal.includes(goalTitle) || 
            goalTitle.includes(mentionedGoal) ||
            mentionedGoal.includes(goalDesc)) {
          
          try {
            const progressUpdate: InsertGoalProgress = {
              goalId: goal.id,
              userId,
              progressPercent: indicator.progress,
              update: message.substring(0, 500),
              moodDuringUpdate: 'noted'
            };
            await storage.createGoalProgress(progressUpdate);
          } catch (error) {
            console.error('Error tracking goal progress:', error);
          }
        }
      }
    }
  }
}

export async function updatePsychologicalProfile(userId: string): Promise<void> {
  try {
    const [
      relationships,
      lifeEvents,
      emotionalSnapshots,
      existingProfile
    ] = await Promise.all([
      storage.getRelationshipsByUser(userId),
      storage.getLifeEventsByUser(userId),
      storage.getEmotionalSnapshotsByUser(userId, 50),
      storage.getPsychologicalProfile(userId)
    ]);

    const emotionCounts: Record<string, number> = {};
    const copingCounts: Record<string, number> = {};
    let totalIntensity = 0;
    let energySum = 0;
    const allTriggers: string[] = [];

    for (const snapshot of emotionalSnapshots) {
      emotionCounts[snapshot.primaryEmotion] = (emotionCounts[snapshot.primaryEmotion] || 0) + 1;
      if (snapshot.copingObserved) {
        copingCounts[snapshot.copingObserved] = (copingCounts[snapshot.copingObserved] || 0) + 1;
      }
      totalIntensity += snapshot.intensity || 5;
      if (snapshot.energyLevel === 'high') energySum += 8;
      else if (snapshot.energyLevel === 'low') energySum += 2;
      else energySum += 5;
      
      if (snapshot.triggers) {
        allTriggers.push(...snapshot.triggers);
      }
    }

    const avgIntensity = emotionalSnapshots.length > 0 ? totalIntensity / emotionalSnapshots.length : 5;
    const avgEnergy = emotionalSnapshots.length > 0 ? energySum / emotionalSnapshots.length : 5;

    let emotionalRegulation = 'developing';
    if (avgIntensity < 4) emotionalRegulation = 'regulated';
    else if (avgIntensity > 7) emotionalRegulation = 'volatile';
    else emotionalRegulation = 'moderate';

    const copingMechanisms = Object.entries(copingCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([coping]) => coping);

    const triggerPatterns = Array.from(new Set(allTriggers)).slice(0, 10);

    const positiveEvents = lifeEvents.filter(e => e.emotionalImpact === 'positive').length;
    const negativeEvents = lifeEvents.filter(e => e.emotionalImpact === 'negative').length;
    
    const resilienceFactors: string[] = [];
    if (positiveEvents > negativeEvents) resilienceFactors.push('More positive than negative life events');
    if (copingMechanisms.includes('healthy')) resilienceFactors.push('Uses healthy coping strategies');
    if (copingMechanisms.includes('support_seeking')) resilienceFactors.push('Seeks support when needed');
    if (relationships.length > 3) resilienceFactors.push('Strong support network');

    const strengthsIdentified: string[] = [];
    if (relationships.length > 0) strengthsIdentified.push('Maintains relationships');
    if (emotionCounts['joy'] > emotionCounts['sadness']) strengthsIdentified.push('Positive emotional baseline');
    if (copingMechanisms.includes('healthy')) strengthsIdentified.push('Healthy coping skills');

    const growthEdges: string[] = [];
    if (avgIntensity > 6) growthEdges.push('Emotional intensity management');
    if (copingMechanisms.includes('avoidant')) growthEdges.push('Reducing avoidance patterns');
    if (copingMechanisms.includes('maladaptive')) growthEdges.push('Replacing maladaptive coping');
    if (emotionCounts['hopelessness']) growthEdges.push('Building hope and meaning');

    const valuesPriorities: string[] = [];
    const familyRelationships = relationships.filter(r => 
      ['spouse', 'partner', 'child', 'parent', 'mother', 'father', 'sibling'].includes(r.relationship)
    );
    if (familyRelationships.length > 0) valuesPriorities.push('family');
    if (relationships.some(r => r.relationship === 'friend')) valuesPriorities.push('friendship');
    if (relationships.some(r => r.relationship === 'spiritual_leader')) valuesPriorities.push('faith');

    let spiritualOrientation = existingProfile?.spiritualOrientation || 'unknown';
    if (relationships.some(r => r.relationship === 'spiritual_leader')) {
      spiritualOrientation = 'active_faith';
    }

    const supportNeeds: string[] = [];
    if (emotionCounts['loneliness']) supportNeeds.push('Connection and community');
    if (emotionCounts['overwhelm']) supportNeeds.push('Stress management support');
    if (emotionCounts['guilt'] || emotionCounts['shame']) supportNeeds.push('Self-compassion work');
    if (avgEnergy < 4) supportNeeds.push('Energy and motivation support');

    const profileUpdate: InsertPsychologicalProfile = {
      userId,
      communicationStyle: existingProfile?.communicationStyle || 'developing',
      attachmentStyle: existingProfile?.attachmentStyle || 'developing',
      cognitivePatterns: existingProfile?.cognitivePatterns || [],
      emotionalRegulation,
      copingMechanisms,
      strengthsIdentified,
      growthEdges,
      valuesPriorities,
      spiritualOrientation,
      supportNeeds,
      triggerPatterns,
      resilienceFactors,
      lastUpdated: new Date()
    };

    await storage.upsertPsychologicalProfile(profileUpdate);
  } catch (error) {
    console.error('Error updating psychological profile:', error);
  }
}

export async function processMessageForLearning(
  message: string,
  conversationId: number,
  userId: string,
  sentiment: string,
  sentimentScore?: number
): Promise<{
  relationships: RelationshipExtraction[];
  emotionalState: EmotionalState | null;
  lifeEvents: LifeEventExtraction[];
}> {
  const [relationships, emotionalState, lifeEvents] = await Promise.all([
    extractRelationships(message, userId, sentiment),
    captureEmotionalState(message, conversationId, userId, sentimentScore),
    detectLifeEvents(message, userId)
  ]);

  await trackGoalProgress(message, userId);

  const snapshots = await storage.getEmotionalSnapshotsByUser(userId, 10);
  if (snapshots.length % 10 === 0 && snapshots.length > 0) {
    await updatePsychologicalProfile(userId);
  }

  return {
    relationships,
    emotionalState,
    lifeEvents
  };
}
