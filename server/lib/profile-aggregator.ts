import { storage } from '../storage';
import { getAggregatedInsights } from './psychological-analyzer';
import type { UserProfile, InsertUserProfile, InsertCoachingPlan, Relationship, LifeEvent, EmotionalSnapshot } from '@shared/schema';

interface ProfileUpdate {
  displayName?: string;
  communicationStyle?: string;
  primaryMotivators?: string[];
  coreValues?: string[];
  attachmentStyle?: string;
  defenseMechanisms?: string[];
  coreBeliefs?: string[];
  cognitiveDistortions?: string[];
  identifiedStrengths?: string[];
  growthAreas?: string[];
  copingPatterns?: string[];
  stressTriggers?: string[];
  relationshipPatterns?: string[];
  communicationNeeds?: string[];
  lifeStage?: string;
  currentChallenges?: string[];
  supportSystems?: string[];
  totalMessagesAnalyzed?: number;
  profileConfidence?: number;
}

export async function updateUserProfile(userId: string): Promise<UserProfile> {
  const existingProfile = await storage.getUserProfile(userId);
  const aggregatedInsights = await getAggregatedInsights(userId);
  const userContext = await storage.getUserContextByUser(userId);
  const messageInsights = await storage.getMessageInsights(userId, 100);
  
  // Calculate profile updates based on aggregated data
  const updates: ProfileUpdate = {};
  
  // Extract name from context
  const nameContext = userContext.find(c => c.category === 'name');
  if (nameContext) {
    updates.displayName = nameContext.value;
  }
  
  // Determine communication style based on message patterns
  updates.communicationStyle = determineCommunicationStyle(messageInsights);
  
  // Core values from insights
  if (aggregatedInsights.coreValues.length > 0) {
    updates.coreValues = aggregatedInsights.coreValues;
  }
  
  // Extract primary motivators
  updates.primaryMotivators = extractMotivators(userContext, aggregatedInsights);
  
  // Defense mechanisms
  if (aggregatedInsights.commonDefenses.length > 0) {
    updates.defenseMechanisms = aggregatedInsights.commonDefenses;
  }
  
  // Cognitive distortions
  if (aggregatedInsights.cognitivePatterns.length > 0) {
    updates.cognitiveDistortions = aggregatedInsights.cognitivePatterns;
  }
  
  // Current challenges from concerns
  if (aggregatedInsights.recentConcerns.length > 0) {
    updates.currentChallenges = aggregatedInsights.recentConcerns;
  }
  
  // Relationship patterns
  if (aggregatedInsights.relationshipFocus.length > 0) {
    updates.relationshipPatterns = aggregatedInsights.relationshipFocus;
  }
  
  // Extract communication needs from top needs
  if (aggregatedInsights.topNeeds.length > 0) {
    updates.communicationNeeds = aggregatedInsights.topNeeds;
  }
  
  // Calculate growth areas from emotional profile and patterns
  updates.growthAreas = calculateGrowthAreas(aggregatedInsights);
  
  // Identify strengths from wellness indicators
  updates.identifiedStrengths = identifyStrengths(messageInsights, userContext);
  
  // Track message count and confidence
  updates.totalMessagesAnalyzed = messageInsights.length;
  updates.profileConfidence = calculateProfileConfidence(messageInsights.length, userContext.length);
  
  // Determine attachment style from patterns
  updates.attachmentStyle = determineAttachmentStyle(messageInsights);
  
  // Upsert the profile
  const profileData: InsertUserProfile = {
    userId,
    ...existingProfile,
    ...updates,
    lastInsightUpdate: new Date()
  };
  
  return await storage.upsertUserProfile(profileData);
}

function determineCommunicationStyle(insights: any[]): string {
  if (insights.length === 0) return 'reflective';
  
  let directCount = 0;
  let analyticalCount = 0;
  let expressiveCount = 0;
  let reflectiveCount = 0;
  
  for (const insight of insights) {
    const emotions = insight.primaryEmotion || '';
    const needs = insight.needsExpressed || [];
    const patterns = insight.cognitivePatterns || [];
    
    // Direct: Low emotion, action-oriented
    if (needs.includes('autonomy') || needs.includes('guidance')) {
      directCount++;
    }
    
    // Analytical: Intellectualization pattern
    if (patterns.includes('intellectualization')) {
      analyticalCount++;
    }
    
    // Expressive: High emotional intensity
    if ((insight.emotionalIntensity || 0) > 7) {
      expressiveCount++;
    }
    
    // Reflective: Seeks validation, processing
    if (needs.includes('validation') || needs.includes('support')) {
      reflectiveCount++;
    }
  }
  
  const max = Math.max(directCount, analyticalCount, expressiveCount, reflectiveCount);
  if (max === directCount) return 'direct';
  if (max === analyticalCount) return 'analytical';
  if (max === expressiveCount) return 'expressive';
  return 'reflective';
}

function extractMotivators(userContext: any[], insights: any): string[] {
  const motivators: string[] = [];
  
  // From goals in context
  const goalContexts = userContext.filter(c => c.category === 'goal' || c.category === 'aspiration');
  for (const ctx of goalContexts) {
    motivators.push(ctx.value);
  }
  
  // From values identified
  if (insights.coreValues.includes('family')) motivators.push('Family connection');
  if (insights.coreValues.includes('career')) motivators.push('Professional success');
  if (insights.coreValues.includes('growth')) motivators.push('Personal development');
  if (insights.coreValues.includes('health')) motivators.push('Health and wellness');
  
  return Array.from(new Set(motivators)).slice(0, 5);
}

function calculateGrowthAreas(insights: any): string[] {
  const areas: string[] = [];
  
  // From cognitive distortions
  if (insights.cognitivePatterns.includes('all_or_nothing')) {
    areas.push('Flexible thinking');
  }
  if (insights.cognitivePatterns.includes('catastrophizing')) {
    areas.push('Perspective-taking');
  }
  if (insights.cognitivePatterns.includes('should_statements')) {
    areas.push('Self-compassion');
  }
  
  // From top needs
  if (insights.topNeeds.includes('validation')) {
    areas.push('Self-validation');
  }
  if (insights.topNeeds.includes('guidance')) {
    areas.push('Decision confidence');
  }
  
  // From defense mechanisms
  if (insights.commonDefenses.includes('avoidance')) {
    areas.push('Approach behaviors');
  }
  if (insights.commonDefenses.includes('projection')) {
    areas.push('Ownership and accountability');
  }
  
  return areas.slice(0, 5);
}

function identifyStrengths(insights: any[], userContext: any[]): string[] {
  const strengths: string[] = [];
  
  // Look for positive patterns
  const positiveEmotions = insights.filter(i => 
    ['joy', 'trust', 'love', 'anticipation'].includes(i.primaryEmotion)
  );
  
  if (positiveEmotions.length > insights.length * 0.3) {
    strengths.push('Emotional positivity');
  }
  
  // Check for self-awareness indicators
  const hasIntrospection = insights.some(i => 
    (i.needsExpressed || []).includes('validation') || 
    (i.cognitivePatterns || []).includes('emotional_reasoning')
  );
  if (hasIntrospection) {
    strengths.push('Self-awareness');
  }
  
  // From context
  const skillContexts = userContext.filter(c => c.category === 'skill' || c.category === 'strength');
  for (const ctx of skillContexts) {
    strengths.push(ctx.value);
  }
  
  // Seeking help is a strength
  strengths.push('Help-seeking behavior');
  
  return Array.from(new Set(strengths)).slice(0, 5);
}

function calculateProfileConfidence(messageCount: number, contextCount: number): number {
  // Confidence grows with more data
  const messageScore = Math.min(50, messageCount * 2);
  const contextScore = Math.min(50, contextCount * 5);
  return Math.min(100, messageScore + contextScore);
}

function determineAttachmentStyle(insights: any[]): string {
  let anxiousSignals = 0;
  let avoidantSignals = 0;
  let secureSignals = 0;
  
  for (const insight of insights) {
    const needs = insight.needsExpressed || [];
    const defenses = insight.defenseMechanismsObserved || [];
    const emotions = insight.primaryEmotion || '';
    
    // Anxious attachment signals
    if (needs.includes('validation') || needs.includes('connection')) {
      anxiousSignals++;
    }
    if (emotions === 'fear' || emotions === 'sadness') {
      anxiousSignals++;
    }
    
    // Avoidant signals
    if (needs.includes('autonomy')) {
      avoidantSignals++;
    }
    if (defenses.includes('avoidance') || defenses.includes('intellectualization')) {
      avoidantSignals++;
    }
    
    // Secure signals
    if (emotions === 'trust' || emotions === 'joy') {
      secureSignals++;
    }
    if (needs.includes('support') && !needs.includes('validation')) {
      secureSignals++;
    }
  }
  
  const max = Math.max(anxiousSignals, avoidantSignals, secureSignals);
  if (max === 0) return 'developing';
  if (max === secureSignals) return 'secure';
  if (max === anxiousSignals) return 'anxious';
  if (max === avoidantSignals) return 'avoidant';
  if (anxiousSignals > 0 && avoidantSignals > 0) return 'disorganized';
  return 'developing';
}

export async function generateCoachingPlan(userId: string): Promise<any> {
  const profile = await storage.getUserProfile(userId);
  if (!profile) {
    // Create profile first
    await updateUserProfile(userId);
    return generateCoachingPlan(userId);
  }
  
  const existingPlan = await storage.getActiveCoachingPlan(userId);
  if (existingPlan) {
    return existingPlan;
  }
  
  // Generate a new coaching plan based on profile
  const planData: InsertCoachingPlan = {
    userId,
    title: generatePlanTitle(profile),
    focus: determinePrimaryFocus(profile),
    status: 'active',
    priority: 8,
    underlyingPatterns: profile.cognitiveDistortions || [],
    rootCauses: extractRootCauses(profile),
    unconsciousDrivers: profile.defenseMechanisms || [],
    shortTermGoals: generateShortTermGoals(profile),
    longTermGoals: generateLongTermGoals(profile),
    successIndicators: generateSuccessIndicators(profile),
    therapeuticApproaches: recommendTherapeuticApproaches(profile),
    recommendedExercises: recommendExercises(profile),
    weeklyActions: generateWeeklyActions(profile),
    currentPhase: 'discovery'
  };
  
  const plan = await storage.createCoachingPlan(planData);
  
  // Create initial steps
  const steps = generatePlanSteps(profile, plan.id);
  for (const step of steps) {
    await storage.createCoachingPlanStep(step);
  }
  
  return plan;
}

function generatePlanTitle(profile: UserProfile): string {
  const focus = profile.growthAreas?.[0] || 'Personal Growth';
  return `${focus} Journey`;
}

function determinePrimaryFocus(profile: UserProfile): string {
  const challenges = profile.currentChallenges || [];
  const values = profile.coreValues || [];
  
  if (challenges.some(c => c.includes('relationship') || c.includes('partner'))) {
    return 'relationships';
  }
  if (values.includes('career') || challenges.some(c => c.includes('work'))) {
    return 'career';
  }
  if (values.includes('health') || challenges.some(c => c.includes('health'))) {
    return 'wellness';
  }
  return 'personal_growth';
}

function extractRootCauses(profile: UserProfile): string[] {
  const causes: string[] = [];
  
  if (profile.attachmentStyle === 'anxious') {
    causes.push('Need for external validation');
  }
  if (profile.attachmentStyle === 'avoidant') {
    causes.push('Fear of vulnerability');
  }
  if (profile.cognitiveDistortions?.includes('should_statements')) {
    causes.push('Internalized perfectionism');
  }
  if (profile.defenseMechanisms?.includes('avoidance')) {
    causes.push('Avoidance of discomfort');
  }
  
  return causes;
}

function generateShortTermGoals(profile: UserProfile): string[] {
  const goals: string[] = [];
  
  if (profile.communicationNeeds?.includes('validation')) {
    goals.push('Practice self-validation daily');
  }
  if (profile.cognitiveDistortions?.includes('all_or_nothing')) {
    goals.push('Identify and challenge black-and-white thinking');
  }
  if (profile.defenseMechanisms?.includes('avoidance')) {
    goals.push('Face one avoided situation this week');
  }
  
  goals.push('Journal for 5 minutes daily');
  goals.push('Notice and name emotions as they arise');
  
  return goals.slice(0, 5);
}

function generateLongTermGoals(profile: UserProfile): string[] {
  const goals: string[] = [];
  
  if (profile.attachmentStyle === 'anxious') {
    goals.push('Develop secure self-worth independent of others');
  }
  if (profile.attachmentStyle === 'avoidant') {
    goals.push('Build capacity for emotional intimacy');
  }
  if (profile.growthAreas?.length) {
    goals.push(`Master ${profile.growthAreas[0]}`);
  }
  
  goals.push('Build sustainable self-care routines');
  goals.push('Develop emotional resilience');
  
  return goals.slice(0, 5);
}

function generateSuccessIndicators(profile: UserProfile): string[] {
  return [
    'Increased emotional awareness',
    'Reduced use of defense mechanisms',
    'More balanced thinking patterns',
    'Improved relationship satisfaction',
    'Greater life satisfaction'
  ];
}

function recommendTherapeuticApproaches(profile: UserProfile): string[] {
  const approaches: string[] = [];
  
  // CBT for cognitive distortions
  if (profile.cognitiveDistortions?.length) {
    approaches.push('CBT');
  }
  
  // DBT for emotional regulation
  if (profile.communicationStyle === 'expressive') {
    approaches.push('DBT');
  }
  
  // ACT for avoidance
  if (profile.defenseMechanisms?.includes('avoidance')) {
    approaches.push('ACT');
  }
  
  // Psychodynamic for attachment issues
  if (profile.attachmentStyle && profile.attachmentStyle !== 'secure') {
    approaches.push('psychodynamic');
  }
  
  // Mindfulness as a base
  approaches.push('mindfulness');
  
  return Array.from(new Set(approaches));
}

function recommendExercises(profile: UserProfile): string[] {
  const exercises: string[] = ['Daily journaling', 'Breathing exercises'];
  
  if (profile.cognitiveDistortions?.includes('catastrophizing')) {
    exercises.push('Worry time scheduling');
    exercises.push('Evidence examination');
  }
  
  if (profile.defenseMechanisms?.includes('avoidance')) {
    exercises.push('Gradual exposure practice');
  }
  
  if (profile.attachmentStyle === 'anxious') {
    exercises.push('Self-soothing techniques');
  }
  
  return exercises;
}

function generateWeeklyActions(profile: UserProfile): string[] {
  return [
    'Complete one coaching reflection',
    'Practice mindfulness for 10 minutes',
    'Identify one cognitive distortion',
    'Journal about emotions',
    'Celebrate one small win'
  ];
}

function generatePlanSteps(profile: UserProfile, planId: number): any[] {
  return [
    {
      planId,
      userId: profile.userId,
      title: 'Daily Check-in',
      description: 'Take 2 minutes to notice and name your current emotional state',
      actionType: 'habit',
      frequency: 'daily',
      status: 'pending',
      order: 1
    },
    {
      planId,
      userId: profile.userId,
      title: 'Thought Record',
      description: 'When you notice a strong emotion, write down the situation, thought, and emotion',
      actionType: 'exercise',
      frequency: 'as_needed',
      status: 'pending',
      order: 2
    },
    {
      planId,
      userId: profile.userId,
      title: 'Weekly Reflection',
      description: 'Review your week: what went well, what was challenging, what did you learn?',
      actionType: 'reflection',
      frequency: 'weekly',
      status: 'pending',
      order: 3
    }
  ];
}

export async function getProfileSummary(userId: string): Promise<string> {
  const profile = await storage.getUserProfile(userId);
  if (!profile) {
    return "I'm still getting to know you. The more we talk, the better I'll understand your patterns and can help you.";
  }
  
  const parts: string[] = [];
  
  if (profile.displayName) {
    parts.push(`I know you as ${profile.displayName}.`);
  }
  
  if (profile.communicationStyle) {
    parts.push(`Your communication style tends to be ${profile.communicationStyle}.`);
  }
  
  if (profile.coreValues?.length) {
    parts.push(`Your core values include ${profile.coreValues.slice(0, 3).join(', ')}.`);
  }
  
  if (profile.growthAreas?.length) {
    parts.push(`Areas we're working on: ${profile.growthAreas.slice(0, 2).join(', ')}.`);
  }
  
  if (profile.identifiedStrengths?.length) {
    parts.push(`Your strengths include ${profile.identifiedStrengths.slice(0, 2).join(', ')}.`);
  }
  
  if (profile.attachmentStyle && profile.attachmentStyle !== 'developing') {
    parts.push(`In relationships, you show ${profile.attachmentStyle} patterns.`);
  }
  
  if (profile.profileConfidence) {
    parts.push(`(Profile confidence: ${profile.profileConfidence}%)`);
  }
  
  return parts.join(' ') || "I'm building your profile as we continue our conversations.";
}

export interface EnhancedProfileContext {
  relationships: string;
  lifeEvents: string;
  emotionalTrends: string;
  dispositionSummary: string;
}

export async function getEnhancedProfileContext(userId: string): Promise<EnhancedProfileContext> {
  const [
    relationships,
    lifeEvents,
    emotionalSnapshots,
    psychProfile
  ] = await Promise.all([
    storage.getRelationshipsByUser(userId),
    storage.getLifeEventsByUser(userId),
    storage.getEmotionalSnapshotsByUser(userId, 30),
    storage.getPsychologicalProfile(userId)
  ]);

  const relationshipsContext = buildRelationshipsContext(relationships);
  const lifeEventsContext = buildLifeEventsContext(lifeEvents);
  const emotionalTrendsContext = buildEmotionalTrendsContext(emotionalSnapshots);
  const dispositionSummary = buildDispositionSummary(psychProfile, emotionalSnapshots);

  return {
    relationships: relationshipsContext,
    lifeEvents: lifeEventsContext,
    emotionalTrends: emotionalTrendsContext,
    dispositionSummary
  };
}

function buildRelationshipsContext(relationships: Relationship[]): string {
  if (relationships.length === 0) {
    return '';
  }

  const familyRels = relationships.filter(r => 
    ['spouse', 'partner', 'child', 'parent', 'mother', 'father', 'sibling'].includes(r.relationship)
  );
  const friendRels = relationships.filter(r => r.relationship === 'friend');
  const workRels = relationships.filter(r => 
    ['boss', 'coworker', 'colleague'].includes(r.relationship)
  );
  const otherRels = relationships.filter(r => 
    !['spouse', 'partner', 'child', 'parent', 'mother', 'father', 'sibling', 'friend', 'boss', 'coworker', 'colleague'].includes(r.relationship)
  );

  const parts: string[] = ['## IMPORTANT PEOPLE IN THEIR LIFE'];

  if (familyRels.length > 0) {
    parts.push('**Family:**');
    for (const rel of familyRels.slice(0, 10)) {
      const sentiment = rel.sentiment && rel.sentiment !== 'neutral' ? ` (${rel.sentiment} feelings)` : '';
      parts.push(`- ${rel.name} (${rel.relationship})${sentiment}`);
    }
  }

  if (friendRels.length > 0) {
    parts.push('**Friends:**');
    for (const rel of friendRels.slice(0, 5)) {
      parts.push(`- ${rel.name}`);
    }
  }

  if (workRels.length > 0) {
    parts.push('**Work:**');
    for (const rel of workRels.slice(0, 5)) {
      parts.push(`- ${rel.name} (${rel.relationship})`);
    }
  }

  if (otherRels.length > 0) {
    parts.push('**Other:**');
    for (const rel of otherRels.slice(0, 5)) {
      parts.push(`- ${rel.name} (${rel.relationship})`);
    }
  }

  parts.push('');
  parts.push('Use their names naturally in conversation. Ask about these people when relevant.');

  return parts.join('\n');
}

function buildLifeEventsContext(lifeEvents: LifeEvent[]): string {
  if (lifeEvents.length === 0) {
    return '';
  }

  const getEventDate = (e: LifeEvent): Date => {
    if (e.eventDate) return new Date(e.eventDate);
    if (e.createdAt) return new Date(e.createdAt);
    return new Date();
  };

  const recentEvents = lifeEvents
    .sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime())
    .slice(0, 10);

  const ongoingEvents = recentEvents.filter(e => e.isOngoing);
  const pastEvents = recentEvents.filter(e => !e.isOngoing);

  const parts: string[] = ['## SIGNIFICANT LIFE EVENTS'];

  if (ongoingEvents.length > 0) {
    parts.push('**Currently dealing with:**');
    for (const event of ongoingEvents) {
      const impact = event.emotionalImpact === 'negative' ? ' [difficult]' : event.emotionalImpact === 'positive' ? ' [positive]' : '';
      parts.push(`- ${formatEventType(event.eventType)}${impact}`);
    }
  }

  if (pastEvents.length > 0) {
    parts.push('**Recent life events:**');
    for (const event of pastEvents.slice(0, 5)) {
      const impact = event.emotionalImpact === 'negative' ? ' [difficult]' : event.emotionalImpact === 'positive' ? ' [positive]' : '';
      parts.push(`- ${formatEventType(event.eventType)}${impact}`);
    }
  }

  parts.push('');
  parts.push('Be sensitive to ongoing challenges. Celebrate positive milestones.');

  return parts.join('\n');
}

function formatEventType(eventType: string): string {
  const labels: Record<string, string> = {
    'marriage': 'Got married/engaged',
    'pregnancy': 'Expecting a baby',
    'new_child': 'Had a baby',
    'new_job': 'Started new job',
    'job_loss': 'Job change/loss',
    'divorce': 'Going through divorce',
    'breakup': 'Relationship ended',
    'relocation': 'Moved/relocating',
    'health_diagnosis': 'Health diagnosis',
    'health_recovery': 'In recovery',
    'loss_illness': 'Loss/illness in family',
    'graduation': 'Graduated',
    'promotion': 'Got promoted',
    'retirement': 'Retiring',
    'home_purchase': 'Bought a home',
    'financial_stress': 'Financial challenges',
    'addiction': 'Addiction recovery',
    'mental_health': 'Mental health journey'
  };
  return labels[eventType] || eventType.replace(/_/g, ' ');
}

function buildEmotionalTrendsContext(snapshots: EmotionalSnapshot[]): string {
  if (snapshots.length === 0) {
    return '';
  }

  const emotionCounts: Record<string, number> = {};
  const copingCounts: Record<string, number> = {};
  const allTriggers: string[] = [];
  let totalIntensity = 0;
  let lowEnergyCount = 0;
  let highEnergyCount = 0;

  for (const snap of snapshots) {
    emotionCounts[snap.primaryEmotion] = (emotionCounts[snap.primaryEmotion] || 0) + 1;
    if (snap.copingObserved) {
      copingCounts[snap.copingObserved] = (copingCounts[snap.copingObserved] || 0) + 1;
    }
    totalIntensity += snap.intensity || 5;
    if (snap.energyLevel === 'low') lowEnergyCount++;
    if (snap.energyLevel === 'high') highEnergyCount++;
    if (snap.triggers) {
      allTriggers.push(...snap.triggers);
    }
  }

  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([emotion]) => emotion);

  const avgIntensity = totalIntensity / snapshots.length;
  const energyTrend = lowEnergyCount > highEnergyCount ? 'low energy' : 
                      highEnergyCount > lowEnergyCount ? 'high energy' : 'balanced energy';

  const parts: string[] = ['## RECENT EMOTIONAL PATTERNS'];
  
  if (topEmotions.length > 0) {
    parts.push(`**Predominant emotions:** ${topEmotions.join(', ')}`);
  }
  
  parts.push(`**Emotional intensity:** ${avgIntensity > 7 ? 'High' : avgIntensity > 4 ? 'Moderate' : 'Low'}`);
  parts.push(`**Energy pattern:** ${energyTrend}`);

  const topCoping = Object.entries(copingCounts).sort(([, a], [, b]) => b - a)[0];
  if (topCoping) {
    const copingLabels: Record<string, string> = {
      'healthy': 'Using healthy coping (prayer, exercise, talking)',
      'avoidant': 'Tendency toward avoidance',
      'maladaptive': 'Some maladaptive coping observed',
      'support_seeking': 'Actively seeking support'
    };
    parts.push(`**Coping style:** ${copingLabels[topCoping[0]] || topCoping[0]}`);
  }

  const uniqueTriggers = [...new Set(allTriggers)].slice(0, 3);
  if (uniqueTriggers.length > 0) {
    parts.push(`**Common triggers:** ${uniqueTriggers.join('; ')}`);
  }

  return parts.join('\n');
}

function buildDispositionSummary(
  psychProfile: any | null,
  snapshots: EmotionalSnapshot[]
): string {
  const parts: string[] = [];

  if (psychProfile) {
    if (psychProfile.emotionalRegulation && psychProfile.emotionalRegulation !== 'developing') {
      parts.push(`Emotional regulation: ${psychProfile.emotionalRegulation}`);
    }
    if (psychProfile.strengthsIdentified && psychProfile.strengthsIdentified.length > 0) {
      parts.push(`Key strengths: ${psychProfile.strengthsIdentified.slice(0, 3).join(', ')}`);
    }
    if (psychProfile.growthEdges && psychProfile.growthEdges.length > 0) {
      parts.push(`Growth areas: ${psychProfile.growthEdges.slice(0, 2).join(', ')}`);
    }
    if (psychProfile.supportNeeds && psychProfile.supportNeeds.length > 0) {
      parts.push(`Support needs: ${psychProfile.supportNeeds.slice(0, 2).join(', ')}`);
    }
    if (psychProfile.resilienceFactors && psychProfile.resilienceFactors.length > 0) {
      parts.push(`Resilience: ${psychProfile.resilienceFactors.slice(0, 2).join(', ')}`);
    }
    if (psychProfile.copingMechanisms && psychProfile.copingMechanisms.length > 0) {
      parts.push(`Coping patterns: ${psychProfile.copingMechanisms.slice(0, 2).join(', ')}`);
    }
  }

  if (parts.length === 0) {
    return '';
  }

  return '## DISPOSITION ASSESSMENT\n' + parts.join('\n');
}
