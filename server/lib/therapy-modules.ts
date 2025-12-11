export interface TherapyExercise {
  name: string;
  type: "dbt" | "cbt" | "mindfulness" | "grounding" | "breathing" | "act" | "prayer";
  duration: string;
  steps: string[];
  completionPrompt: string;
}

export const THERAPY_EXERCISES: Record<string, TherapyExercise> = {
  grounding_54321: {
    name: "5-4-3-2-1 Grounding Exercise",
    type: "grounding",
    duration: "3-5 minutes",
    steps: [
      "Take a slow, deep breath. You're safe right now.",
      "**5 things you can SEE**: Look around and name 5 things you can see. It could be a lamp, a color on the wall, your hands...",
      "**4 things you can TOUCH**: Notice 4 things you can physically feel - the chair beneath you, your feet on the floor, fabric on your skin...",
      "**3 things you can HEAR**: Listen for 3 sounds - maybe traffic, a clock, your own breathing...",
      "**2 things you can SMELL**: Identify 2 scents - the air, your clothes, anything nearby...",
      "**1 thing you can TASTE**: Notice 1 taste in your mouth right now.",
      "Take another deep breath. You've anchored yourself to this present moment."
    ],
    completionPrompt: "How do you feel after completing this grounding exercise? Take your time."
  },

  dbt_tipp: {
    name: "TIPP Skills (DBT Distress Tolerance)",
    type: "dbt",
    duration: "5-10 minutes",
    steps: [
      "When emotions feel overwhelming, TIPP can help bring them down quickly:",
      "**T - Temperature**: Splash cold water on your face or hold ice cubes. Cold activates the dive reflex and calms your nervous system.",
      "**I - Intense Exercise**: Do jumping jacks, run in place, or climb stairs for 5 minutes. Physical exertion releases the emotional pressure.",
      "**P - Paced Breathing**: Breathe in for 4 counts, out for 6-8 counts. Longer exhales activate your calming system.",
      "**P - Progressive Muscle Relaxation**: Tense each muscle group for 5 seconds, then release. Start with your feet and work up to your face.",
      "Try one or more of these right now. Which one feels most accessible to you?"
    ],
    completionPrompt: "Which TIPP skill did you try? How did your body respond?"
  },

  dbt_wise_mind: {
    name: "Wise Mind Meditation (DBT)",
    type: "dbt",
    duration: "5 minutes",
    steps: [
      "Find a comfortable position and close your eyes if that feels safe.",
      "Imagine two paths: one represents your **Emotional Mind** (feelings, urges, impulses), the other represents your **Reasonable Mind** (logic, facts, analysis).",
      "Now imagine walking to where these paths meet. This intersection is your **Wise Mind** - where emotion and reason work together.",
      "In this space, you have access to your inner wisdom. Your Wise Mind knows what's true and what's best for you.",
      "Ask yourself: What does my Wise Mind say about this situation?",
      "Sit with whatever answer arises. It might be words, images, or just a feeling.",
      "When you're ready, slowly open your eyes."
    ],
    completionPrompt: "What did your Wise Mind reveal to you? There's no wrong answer."
  },

  cbt_thought_record: {
    name: "Thought Record (CBT)",
    type: "cbt",
    duration: "10 minutes",
    steps: [
      "Let's examine the thought that's troubling you:",
      "**Situation**: What happened? Where were you? Who was there?",
      "**Automatic Thought**: What thought popped into your head? (The first, unfiltered thought)",
      "**Emotion**: What emotion did you feel? Rate its intensity (0-100%)",
      "**Evidence FOR the thought**: What facts support this thought?",
      "**Evidence AGAINST the thought**: What facts contradict it? What would you tell a friend?",
      "**Balanced Thought**: Based on all evidence, what's a more balanced way to see this?",
      "**New Emotion**: How do you feel now? Re-rate the intensity."
    ],
    completionPrompt: "What balanced thought emerged from this exercise?"
  },

  cbt_cognitive_distortions: {
    name: "Identifying Cognitive Distortions (CBT)",
    type: "cbt",
    duration: "5 minutes",
    steps: [
      "Our minds sometimes play tricks on us. Let's identify which ones might be at play:",
      "**All-or-Nothing Thinking**: Seeing things in black and white - 'If I'm not perfect, I'm a failure'",
      "**Catastrophizing**: Expecting the worst - 'This will be a disaster'",
      "**Mind Reading**: Assuming you know what others think - 'They think I'm stupid'",
      "**Should Statements**: Rigid rules - 'I should always be productive'",
      "**Emotional Reasoning**: Feelings as facts - 'I feel anxious, so something bad will happen'",
      "**Personalization**: Taking undue blame - 'It's all my fault'",
      "Which of these patterns do you recognize in your current thoughts?"
    ],
    completionPrompt: "Which distortion resonated with you? Remember, noticing is the first step to changing."
  },

  box_breathing: {
    name: "Box Breathing",
    type: "breathing",
    duration: "4 minutes",
    steps: [
      "This technique is used by Navy SEALs to stay calm under pressure.",
      "Find a comfortable position. We'll breathe in a 'box' pattern:",
      "**Inhale** slowly for 4 counts... 1... 2... 3... 4...",
      "**Hold** your breath for 4 counts... 1... 2... 3... 4...",
      "**Exhale** slowly for 4 counts... 1... 2... 3... 4...",
      "**Hold** empty for 4 counts... 1... 2... 3... 4...",
      "Repeat this box pattern 4 more times.",
      "With each cycle, feel your nervous system settling."
    ],
    completionPrompt: "How does your body feel after box breathing? Notice any changes in your heart rate or tension."
  },

  mindfulness_body_scan: {
    name: "Body Scan Meditation",
    type: "mindfulness",
    duration: "10 minutes",
    steps: [
      "Lie down or sit comfortably. Close your eyes.",
      "Bring attention to your **feet**. Notice any sensations - warmth, coolness, pressure, tingling. No need to change anything.",
      "Move your attention up to your **calves and shins**. Just observe.",
      "Continue to your **thighs and hips**. Breathe into any tension you find.",
      "Notice your **belly and lower back**. Let them soften with each exhale.",
      "Feel your **chest and upper back**. Notice your heartbeat.",
      "Relax your **shoulders, arms, and hands**. Let them grow heavy.",
      "Finally, bring attention to your **neck, face, and head**. Soften your jaw, your eyes, your forehead.",
      "Take a moment to feel your body as a whole."
    ],
    completionPrompt: "What did you notice in your body? Were there areas holding tension?"
  },

  act_values_clarification: {
    name: "Values Clarification (ACT)",
    type: "act",
    duration: "10 minutes",
    steps: [
      "Values give our lives meaning and direction. Let's explore yours:",
      "Imagine you're at your 80th birthday. The people who matter most are giving speeches about you.",
      "**What do you hope they say about you as a friend?**",
      "**What do you hope they say about you as a family member?**",
      "**What do you hope they say about your work or contributions?**",
      "**What do you hope they say about how you treated yourself?**",
      "These hopes point to your core values.",
      "Now ask: Is my current behavior aligned with these values? Where are the gaps?"
    ],
    completionPrompt: "What value feels most important to you right now? How might you honor it this week?"
  },

  spiritual_centering: {
    name: "Centering Prayer / Spiritual Grounding",
    type: "prayer",
    duration: "5-10 minutes",
    steps: [
      "Find a quiet space. This is your time for connection.",
      "If it feels right, place your hand over your heart.",
      "Take three deep breaths, releasing the weight of the day.",
      "If you pray, offer your current struggle to your Higher Power. Release the need to control the outcome.",
      "If you meditate, simply rest in the awareness of something greater than yourself.",
      "Repeat a word or phrase that brings you peace: 'Let go', 'Peace', 'I am held', or whatever resonates.",
      "Sit in this stillness for a few moments. You don't need to do anything.",
      "When thoughts arise, gently return to your word or phrase.",
      "Close with gratitude for this moment of connection."
    ],
    completionPrompt: "What arose during your time of centering? Sometimes silence speaks loudest."
  }
};

export function selectTherapyModule(trigger: string, userPreferences?: string[]): TherapyExercise | null {
  const moduleMap: Record<string, string[]> = {
    grounding: ["grounding_54321"],
    dbt_distress: ["dbt_tipp", "dbt_wise_mind"],
    cbt_thoughts: ["cbt_thought_record", "cbt_cognitive_distortions"],
    mindfulness: ["mindfulness_body_scan"],
    breathing: ["box_breathing"],
    spiritual: ["spiritual_centering"],
    act: ["act_values_clarification"]
  };

  const exercises = moduleMap[trigger];
  if (!exercises || exercises.length === 0) return null;

  const exerciseKey = exercises[Math.floor(Math.random() * exercises.length)];
  return THERAPY_EXERCISES[exerciseKey] || null;
}

export function formatTherapyExercise(exercise: TherapyExercise): string {
  let message = `\n\n🧘 **${exercise.name}**\n`;
  message += `*Type: ${exercise.type.toUpperCase()} | Duration: ${exercise.duration}*\n\n`;
  
  for (let i = 0; i < exercise.steps.length; i++) {
    message += `${exercise.steps[i]}\n\n`;
  }
  
  message += `---\n*${exercise.completionPrompt}*`;
  
  return message;
}

export function getAvailableModules(): { id: string; name: string; type: string }[] {
  return Object.entries(THERAPY_EXERCISES).map(([id, exercise]) => ({
    id,
    name: exercise.name,
    type: exercise.type
  }));
}
