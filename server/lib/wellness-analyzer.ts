import { storage } from "../storage";
import type { MoodObservation, WellnessAssessment, InsertMoodObservation, InsertWellnessAssessment } from "@shared/schema";

export interface MoodAnalysis {
  topic: string;
  mood: string;
  attitude: string;
  intensity: number;
  observation: string;
}

export function analyzeMoodFromMessage(content: string, sentiment: string, sentimentScore: number): MoodAnalysis[] {
  const moods: MoodAnalysis[] = [];
  const lowerContent = content.toLowerCase();
  
  const topicPatterns: { pattern: RegExp; topic: string }[] = [
    { pattern: /\b(work|job|career|boss|colleague|office|meeting|deadline)\b/i, topic: "work" },
    { pattern: /\b(family|parent|mother|father|mom|dad|sister|brother|child|kid)\b/i, topic: "family" },
    { pattern: /\b(friend|friendship|social|lonely|alone)\b/i, topic: "relationships" },
    { pattern: /\b(health|doctor|sick|tired|exhausted|sleep|exercise|pain)\b/i, topic: "health" },
    { pattern: /\b(money|finance|debt|bills|salary|expensive|afford)\b/i, topic: "finances" },
    { pattern: /\b(stress|anxiety|anxious|worried|worry|nervous|panic)\b/i, topic: "anxiety" },
    { pattern: /\b(sad|depressed|depression|hopeless|down|cry|crying)\b/i, topic: "depression" },
    { pattern: /\b(angry|anger|frustrated|furious|mad|annoyed)\b/i, topic: "anger" },
    { pattern: /\b(happy|excited|great|wonderful|amazing|joy|love)\b/i, topic: "happiness" },
    { pattern: /\b(goal|dream|future|plan|hope|aspiration)\b/i, topic: "goals" },
    { pattern: /\b(relationship|partner|spouse|husband|wife|boyfriend|girlfriend|dating|marriage)\b/i, topic: "romantic_relationship" },
  ];
  
  const moodIndicators: { pattern: RegExp; mood: string; intensity: number }[] = [
    { pattern: /\b(extremely|very|so|really)\s+(sad|depressed|down|hopeless)\b/i, mood: "deeply_sad", intensity: 9 },
    { pattern: /\b(devastated|crushed|heartbroken)\b/i, mood: "devastated", intensity: 10 },
    { pattern: /\b(sad|down|unhappy|blue)\b/i, mood: "sad", intensity: 6 },
    { pattern: /\b(anxious|worried|nervous|stressed)\b/i, mood: "anxious", intensity: 7 },
    { pattern: /\b(panicking|panic|terrified|freaking out)\b/i, mood: "panic", intensity: 9 },
    { pattern: /\b(frustrated|annoyed|irritated)\b/i, mood: "frustrated", intensity: 6 },
    { pattern: /\b(angry|furious|enraged|livid)\b/i, mood: "angry", intensity: 8 },
    { pattern: /\b(happy|good|great|wonderful)\b/i, mood: "happy", intensity: 6 },
    { pattern: /\b(ecstatic|thrilled|overjoyed|elated)\b/i, mood: "ecstatic", intensity: 9 },
    { pattern: /\b(calm|peaceful|relaxed|content)\b/i, mood: "calm", intensity: 3 },
    { pattern: /\b(tired|exhausted|drained|burnt out|burnout)\b/i, mood: "exhausted", intensity: 7 },
    { pattern: /\b(hopeful|optimistic|looking forward)\b/i, mood: "hopeful", intensity: 4 },
    { pattern: /\b(confused|uncertain|lost|don't know)\b/i, mood: "confused", intensity: 5 },
    { pattern: /\b(overwhelmed|too much|can't handle)\b/i, mood: "overwhelmed", intensity: 8 },
  ];
  
  const attitudeIndicators: { pattern: RegExp; attitude: string }[] = [
    { pattern: /\b(hate|can't stand|despise|loathe)\b/i, attitude: "strongly_negative" },
    { pattern: /\b(don't like|dislike|annoying|bothers me)\b/i, attitude: "negative" },
    { pattern: /\b(fine|okay|whatever|meh)\b/i, attitude: "neutral" },
    { pattern: /\b(like|enjoy|appreciate)\b/i, attitude: "positive" },
    { pattern: /\b(love|adore|passionate|excited about)\b/i, attitude: "strongly_positive" },
    { pattern: /\b(scared of|afraid|fear|dread)\b/i, attitude: "fearful" },
    { pattern: /\b(hopeful|optimistic|looking forward)\b/i, attitude: "hopeful" },
    { pattern: /\b(resigned|given up|doesn't matter)\b/i, attitude: "resigned" },
  ];
  
  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(content)) {
      let detectedMood = sentiment === 'negative' ? 'distressed' : 
                         sentiment === 'positive' ? 'content' : 'neutral';
      let intensity = Math.abs(sentimentScore) || 5;
      let attitude = 'neutral';
      
      for (const { pattern: moodPattern, mood, intensity: moodIntensity } of moodIndicators) {
        if (moodPattern.test(content)) {
          detectedMood = mood;
          intensity = moodIntensity;
          break;
        }
      }
      
      for (const { pattern: attPattern, attitude: att } of attitudeIndicators) {
        if (attPattern.test(content)) {
          attitude = att;
          break;
        }
      }
      
      const observation = generateObservation(topic, detectedMood, attitude, intensity, content);
      
      moods.push({
        topic,
        mood: detectedMood,
        attitude,
        intensity,
        observation
      });
    }
  }
  
  if (moods.length === 0 && (sentiment === 'negative' || sentiment === 'positive')) {
    let detectedMood = sentiment === 'negative' ? 'distressed' : 'content';
    let intensity = 5;
    
    for (const { pattern: moodPattern, mood, intensity: moodIntensity } of moodIndicators) {
      if (moodPattern.test(content)) {
        detectedMood = mood;
        intensity = moodIntensity;
        break;
      }
    }
    
    moods.push({
      topic: 'general',
      mood: detectedMood,
      attitude: sentiment === 'negative' ? 'negative' : 'positive',
      intensity,
      observation: `User expressed ${detectedMood} feelings in conversation.`
    });
  }
  
  return moods;
}

function generateObservation(topic: string, mood: string, attitude: string, intensity: number, content: string): string {
  const intensityLabel = intensity >= 8 ? 'strongly' : intensity >= 5 ? 'moderately' : 'mildly';
  
  const observations: Record<string, string> = {
    work: `User appears ${intensityLabel} ${mood} when discussing work-related matters. Attitude toward work is ${attitude.replace('_', ' ')}.`,
    family: `User shows ${mood} feelings about family situations. Current attitude is ${attitude.replace('_', ' ')}.`,
    relationships: `User expresses ${mood} regarding social connections with ${attitude.replace('_', ' ')} attitude.`,
    health: `User mentions health concerns with ${mood} emotional tone (intensity: ${intensity}/10).`,
    finances: `Financial topics trigger ${mood} response. User seems ${attitude.replace('_', ' ')} about money matters.`,
    anxiety: `Signs of ${intensityLabel} anxiety detected. User may benefit from stress management support.`,
    depression: `User shows signs of ${mood} that may indicate low mood. Consider gentle emotional support.`,
    anger: `User expresses ${mood} feelings (intensity: ${intensity}/10). May need help processing frustration.`,
    happiness: `User shares positive ${mood} emotions about recent experiences.`,
    goals: `User discusses future plans with ${attitude.replace('_', ' ')} attitude and ${mood} emotional state.`,
    romantic_relationship: `User's romantic relationship evokes ${mood} feelings with ${attitude.replace('_', ' ')} attitude.`,
    general: `User expresses ${mood} feelings in general conversation.`
  };
  
  return observations[topic] || `User displays ${mood} mood regarding ${topic}.`;
}

export async function saveMoodObservations(
  userId: string, 
  moods: MoodAnalysis[], 
  conversationId: number
): Promise<MoodObservation[]> {
  const saved: MoodObservation[] = [];
  
  for (const mood of moods) {
    const observation: InsertMoodObservation = {
      userId,
      topic: mood.topic,
      mood: mood.mood,
      attitude: mood.attitude,
      intensity: mood.intensity,
      observation: mood.observation,
      conversationId
    };
    
    const created = await storage.createMoodObservation(observation);
    saved.push(created);
  }
  
  return saved;
}

export async function generateWellnessAssessment(userId: string): Promise<WellnessAssessment> {
  const recentMoods = await storage.getRecentMoodObservations(userId, 50);
  
  if (recentMoods.length === 0) {
    const assessment: InsertWellnessAssessment = {
      userId,
      overallMood: 'unknown',
      stressLevel: 5,
      patterns: ['Not enough data to analyze patterns yet'],
      concerns: [],
      positives: ['User is engaging with the platform'],
      advice: 'Keep sharing your thoughts - the more you share, the better I can understand and support you.'
    };
    return storage.createWellnessAssessment(assessment);
  }
  
  const moodCounts: Record<string, number> = {};
  const topicMoods: Record<string, { moods: string[], intensities: number[] }> = {};
  let totalIntensity = 0;
  let negativeMoodCount = 0;
  
  for (const obs of recentMoods) {
    moodCounts[obs.mood] = (moodCounts[obs.mood] || 0) + 1;
    
    if (!topicMoods[obs.topic]) {
      topicMoods[obs.topic] = { moods: [], intensities: [] };
    }
    topicMoods[obs.topic].moods.push(obs.mood);
    topicMoods[obs.topic].intensities.push(obs.intensity || 5);
    
    totalIntensity += obs.intensity || 5;
    
    if (['sad', 'deeply_sad', 'devastated', 'anxious', 'panic', 'angry', 'frustrated', 'overwhelmed', 'exhausted'].includes(obs.mood)) {
      negativeMoodCount++;
    }
  }
  
  const avgIntensity = Math.round(totalIntensity / recentMoods.length);
  const negativeRatio = negativeMoodCount / recentMoods.length;
  
  let overallMood = 'stable';
  if (negativeRatio > 0.7) overallMood = 'struggling';
  else if (negativeRatio > 0.4) overallMood = 'mixed';
  else if (negativeRatio < 0.2) overallMood = 'positive';
  
  const stressLevel = Math.min(10, Math.round(avgIntensity * (1 + negativeRatio)));
  
  const patterns: string[] = [];
  const concerns: string[] = [];
  const positives: string[] = [];
  
  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  if (sortedMoods.length > 0) {
    patterns.push(`Most frequent emotional state: ${sortedMoods[0][0]} (${sortedMoods[0][1]} occurrences)`);
  }
  
  for (const [topic, data] of Object.entries(topicMoods)) {
    const avgTopicIntensity = data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length;
    if (avgTopicIntensity >= 7) {
      patterns.push(`Strong emotions consistently around ${topic} discussions`);
    }
  }
  
  if (moodCounts['anxious'] > 3 || moodCounts['panic'] > 0) {
    concerns.push('Recurring anxiety patterns detected');
  }
  if (moodCounts['sad'] > 3 || moodCounts['deeply_sad'] > 1 || moodCounts['devastated'] > 0) {
    concerns.push('Signs of persistent low mood');
  }
  if (moodCounts['exhausted'] > 2) {
    concerns.push('Fatigue and burnout indicators present');
  }
  if (moodCounts['overwhelmed'] > 2) {
    concerns.push('Feeling frequently overwhelmed');
  }
  
  if (moodCounts['happy'] > 2 || moodCounts['ecstatic'] > 0) {
    positives.push('Experiencing moments of genuine happiness');
  }
  if (moodCounts['hopeful'] > 1) {
    positives.push('Maintaining hopeful outlook');
  }
  if (moodCounts['calm'] > 2) {
    positives.push('Able to find moments of calm');
  }
  if (topicMoods['goals']) {
    positives.push('Actively thinking about future goals');
  }
  
  const advice = generateTherapeuticAdvice(overallMood, concerns, patterns, stressLevel);
  
  const assessment: InsertWellnessAssessment = {
    userId,
    overallMood,
    stressLevel,
    patterns: patterns.length > 0 ? patterns : ['Building your emotional profile'],
    concerns: concerns.length > 0 ? concerns : null,
    positives: positives.length > 0 ? positives : ['Engaging in self-reflection'],
    advice
  };
  
  return storage.createWellnessAssessment(assessment);
}

function generateTherapeuticAdvice(
  overallMood: string, 
  concerns: string[], 
  patterns: string[], 
  stressLevel: number
): string {
  const adviceParts: string[] = [];
  
  if (overallMood === 'struggling') {
    adviceParts.push("I notice you've been going through a difficult time. Remember that it's okay to not be okay, and seeking support is a sign of strength.");
  } else if (overallMood === 'mixed') {
    adviceParts.push("Your emotional landscape has been varied lately. This is normal - life has its ups and downs.");
  } else if (overallMood === 'positive') {
    adviceParts.push("It's wonderful to see positive energy in your conversations. Keep nurturing what brings you joy.");
  }
  
  if (concerns.some(c => c.includes('anxiety'))) {
    adviceParts.push("For managing anxiety, consider grounding techniques like deep breathing or the 5-4-3-2-1 senses exercise.");
  }
  
  if (concerns.some(c => c.includes('low mood'))) {
    adviceParts.push("If low moods persist, small daily accomplishments and gentle physical activity can help. Remember, professional support is always an option.");
  }
  
  if (concerns.some(c => c.includes('burnout') || c.includes('exhausted'))) {
    adviceParts.push("Your energy seems depleted. Consider what boundaries you might set to protect your rest and recovery time.");
  }
  
  if (stressLevel >= 8) {
    adviceParts.push("Your stress levels appear elevated. What's one small thing you could do today just for yourself?");
  }
  
  if (adviceParts.length === 0) {
    adviceParts.push("Continue being open about your feelings. Self-awareness is the first step to emotional wellbeing.");
  }
  
  return adviceParts.join(" ");
}

export function buildTherapistContext(
  moodObservations: MoodObservation[], 
  latestAssessment: WellnessAssessment | undefined,
  includeAdvice: boolean = true
): string {
  if (moodObservations.length === 0 && !latestAssessment) {
    return "";
  }
  
  let context = "\n\n=== WELLNESS OBSERVATIONS ===\n";
  
  if (latestAssessment) {
    context += `\nCurrent overall state: ${latestAssessment.overallMood}`;
    context += `\nStress level: ${latestAssessment.stressLevel}/10`;
    
    if (latestAssessment.patterns && latestAssessment.patterns.length > 0) {
      context += `\nPatterns noticed: ${latestAssessment.patterns.join('; ')}`;
    }
    
    if (latestAssessment.concerns && latestAssessment.concerns.length > 0) {
      context += `\nAreas of concern: ${latestAssessment.concerns.join('; ')}`;
    }
    
    if (latestAssessment.positives && latestAssessment.positives.length > 0) {
      context += `\nPositive signs: ${latestAssessment.positives.join('; ')}`;
    }
  }
  
  const recentByTopic: Record<string, MoodObservation> = {};
  for (const obs of moodObservations.slice(0, 10)) {
    if (!recentByTopic[obs.topic]) {
      recentByTopic[obs.topic] = obs;
    }
  }
  
  if (Object.keys(recentByTopic).length > 0) {
    context += "\n\nRecent topic-specific observations:";
    for (const [topic, obs] of Object.entries(recentByTopic)) {
      context += `\n- ${topic}: ${obs.mood} (intensity ${obs.intensity}/10, attitude: ${obs.attitude})`;
    }
  }
  
  context += "\n\nTHERAPIST GUIDELINES (Pastoral Care Approach):";
  context += "\n- Acknowledge emotions without judgment - meet them where they are";
  context += "\n- Ask open-ended questions to understand context";
  context += "\n- Validate the user's feelings with warmth and compassion";
  context += "\n- Notice patterns and gently reflect them back";
  context += "\n- Be supportive without being prescriptive";
  context += "\n- Speak with the gentle, encouraging voice of a pastor or spiritual counselor";
  context += "\n- When appropriate, offer prayers, scripture verses, or spiritual encouragement";
  context += "\n- Don't force faith on anyone - gently offer it as one source of comfort among many";
  context += "\n- If user seems open to spiritual support, you may share relevant Bible verses";
  context += "\n- Use phrases like 'Would you like to pray about this together?' or 'There's a verse that comes to mind...'";
  context += "\n- Balance evidence-based therapy (CBT, DBT, etc.) with faith-based support";
  context += "\n- Remember: You are like a caring pastor who also knows modern therapeutic techniques";
  
  if (includeAdvice && latestAssessment?.advice) {
    context += "\n- When appropriate, offer this personalized guidance: " + latestAssessment.advice;
  } else if (!includeAdvice) {
    context += "\n- Listen and reflect without giving direct advice unless asked";
  }
  
  return context;
}
