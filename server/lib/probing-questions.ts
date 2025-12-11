/**
 * Progressive Probing Question System
 * 
 * Asks deeper questions as trust builds over time.
 * Frequency: Once every 48 hours (2 days) to avoid being intrusive.
 * Depth levels: surface → personal → deep → reflective
 */

export interface ProbingQuestion {
  id: string;
  text: string;
  depth: 'surface' | 'personal' | 'deep' | 'reflective';
  category: string;
  followUpTo?: string[];
}

export interface UserProbingState {
  lastAskedAt: Date | null;
  currentDepth: number;
  questionsAsked: string[];
  topicsExplored: string[];
}

const PROBING_COOLDOWN_HOURS = 48;

const PROBING_QUESTIONS: ProbingQuestion[] = [
  // SURFACE LEVEL (Depth 0) - Safe, easy questions
  { id: 'surface_day', text: "How has your day been so far?", depth: 'surface', category: 'daily' },
  { id: 'surface_week', text: "What's been on your mind this week?", depth: 'surface', category: 'weekly' },
  { id: 'surface_hobby', text: "What do you like to do when you have free time?", depth: 'surface', category: 'interests' },
  { id: 'surface_work', text: "What kind of work keeps you busy these days?", depth: 'surface', category: 'work' },
  { id: 'surface_goal', text: "Is there anything you're looking forward to?", depth: 'surface', category: 'goals' },
  
  // PERSONAL LEVEL (Depth 1) - Getting to know them better
  { id: 'personal_stress', text: "What usually helps you unwind when things get stressful?", depth: 'personal', category: 'coping' },
  { id: 'personal_energy', text: "What gives you energy and makes you feel alive?", depth: 'personal', category: 'motivation' },
  { id: 'personal_people', text: "Who are the important people in your life right now?", depth: 'personal', category: 'relationships' },
  { id: 'personal_challenge', text: "What's something you've been working through lately?", depth: 'personal', category: 'challenges' },
  { id: 'personal_strength', text: "What would you say is one of your greatest strengths?", depth: 'personal', category: 'self-awareness' },
  { id: 'personal_proud', text: "What's something you're proud of, even if it's small?", depth: 'personal', category: 'achievements' },
  
  // DEEP LEVEL (Depth 2) - Meaningful exploration
  { id: 'deep_values', text: "What matters most to you in life?", depth: 'deep', category: 'values' },
  { id: 'deep_change', text: "If you could change one thing about your life right now, what would it be?", depth: 'deep', category: 'aspirations' },
  { id: 'deep_fear', text: "What's something that's been worrying you that you haven't talked about much?",  depth: 'deep', category: 'fears' },
  { id: 'deep_past', text: "Is there something from your past that still affects how you feel today?", depth: 'deep', category: 'history' },
  { id: 'deep_relationship', text: "How would you describe your relationship with yourself?", depth: 'deep', category: 'self-relationship' },
  { id: 'deep_support', text: "When you're going through a hard time, who do you turn to?", depth: 'deep', category: 'support-system' },
  
  // REFLECTIVE LEVEL (Depth 3) - Deep introspection
  { id: 'reflect_meaning', text: "What gives your life meaning or purpose?", depth: 'reflective', category: 'purpose' },
  { id: 'reflect_pattern', text: "Do you notice any patterns in your thoughts or behaviors that you'd like to understand better?", depth: 'reflective', category: 'patterns' },
  { id: 'reflect_younger', text: "What would you tell your younger self if you could?", depth: 'reflective', category: 'wisdom' },
  { id: 'reflect_healing', text: "Is there something you feel you need to heal from?", depth: 'reflective', category: 'healing' },
  { id: 'reflect_future', text: "Where do you see yourself in a few years, and how do you feel about that?", depth: 'reflective', category: 'future' },
  { id: 'reflect_authentic', text: "When do you feel most like yourself?", depth: 'reflective', category: 'authenticity' },
];

const DEPTH_LEVELS = ['surface', 'personal', 'deep', 'reflective'] as const;

export function getDepthLevel(depth: string): number {
  return DEPTH_LEVELS.indexOf(depth as any);
}

export function shouldAskProbingQuestion(state: UserProbingState, conversationCount: number): boolean {
  if (conversationCount < 3) {
    return false;
  }
  
  if (!state.lastAskedAt) {
    return true;
  }
  
  const hoursSinceLastQuestion = (Date.now() - new Date(state.lastAskedAt).getTime()) / (1000 * 60 * 60);
  return hoursSinceLastQuestion >= PROBING_COOLDOWN_HOURS;
}

export function selectProbingQuestion(
  state: UserProbingState,
  knownCategories: string[],
  recentTopics: string[]
): ProbingQuestion | null {
  const targetDepth = Math.min(state.currentDepth, 3);
  const depthName = DEPTH_LEVELS[targetDepth];
  
  const candidateQuestions = PROBING_QUESTIONS.filter(q => {
    if (state.questionsAsked.includes(q.id)) {
      return false;
    }
    
    const questionDepth = getDepthLevel(q.depth);
    if (questionDepth > targetDepth) {
      return false;
    }
    
    if (questionDepth < targetDepth - 1) {
      return false;
    }
    
    return true;
  });
  
  if (candidateQuestions.length === 0) {
    const resetQuestions = PROBING_QUESTIONS.filter(q => 
      getDepthLevel(q.depth) <= targetDepth
    );
    if (resetQuestions.length > 0) {
      return resetQuestions[Math.floor(Math.random() * resetQuestions.length)];
    }
    return null;
  }
  
  const prioritized = candidateQuestions.sort((a, b) => {
    const aRelevant = recentTopics.some(t => a.category.includes(t) || a.text.toLowerCase().includes(t));
    const bRelevant = recentTopics.some(t => b.category.includes(t) || b.text.toLowerCase().includes(t));
    
    if (aRelevant && !bRelevant) return -1;
    if (bRelevant && !aRelevant) return 1;
    
    const aKnown = knownCategories.includes(a.category);
    const bKnown = knownCategories.includes(b.category);
    
    if (!aKnown && bKnown) return -1;
    if (aKnown && !bKnown) return 1;
    
    return Math.random() - 0.5;
  });
  
  return prioritized[0];
}

export function formatProbingQuestionForPrompt(question: ProbingQuestion): string {
  const intros = [
    "I'm curious - ",
    "I'd love to know - ",
    "If you're open to sharing - ",
    "Something I've been wondering - ",
    "When you have a moment to reflect - ",
  ];
  
  const intro = intros[Math.floor(Math.random() * intros.length)];
  return `\n\n${intro}${question.text}`;
}

export function calculateNextDepth(
  currentDepth: number,
  questionsAnswered: number,
  userEngagement: 'low' | 'medium' | 'high'
): number {
  const thresholds = {
    low: 5,
    medium: 3,
    high: 2
  };
  
  const threshold = thresholds[userEngagement];
  
  if (questionsAnswered >= threshold && currentDepth < 3) {
    return currentDepth + 1;
  }
  
  return currentDepth;
}

export function assessUserEngagement(
  avgResponseLength: number,
  emotionalSharing: boolean,
  questionsAskedByUser: number
): 'low' | 'medium' | 'high' {
  let score = 0;
  
  if (avgResponseLength > 100) score += 2;
  else if (avgResponseLength > 50) score += 1;
  
  if (emotionalSharing) score += 2;
  
  if (questionsAskedByUser > 3) score += 2;
  else if (questionsAskedByUser > 0) score += 1;
  
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}
