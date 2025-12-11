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
    name: "Centering Prayer",
    type: "prayer",
    duration: "5-10 minutes",
    steps: [
      "Find a quiet space. This is your time for connection with God.",
      "If it feels right, place your hand over your heart.",
      "Take three deep breaths, releasing the weight of the day into His hands.",
      "Offer your current struggle to God. Release the need to control the outcome.",
      "*\"Cast all your anxiety on Him because He cares for you.\"* — 1 Peter 5:7",
      "Choose a sacred word that expresses your intention: 'Jesus', 'Peace', 'Abba', 'Love', or whatever draws you closer.",
      "Sit in this stillness for a few moments. Simply rest in God's presence.",
      "When thoughts arise, gently return to your sacred word.",
      "Close with gratitude: *\"Thank you, Lord, for this moment of peace.\"*"
    ],
    completionPrompt: "What arose during your time of prayer? Sometimes God speaks in the silence."
  },

  scripture_meditation: {
    name: "Scripture Meditation & Lectio Divina",
    type: "prayer",
    duration: "10-15 minutes",
    steps: [
      "Let's meditate on God's Word together. Find a comfortable, quiet position.",
      "Take a few deep breaths and invite the Holy Spirit to guide you.",
      "Here is today's verse to meditate on:",
      "*\"Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.\"* — Matthew 11:28-29",
      "**Read**: Read the passage slowly, letting each word sink in.",
      "**Reflect**: What word or phrase catches your attention? Sit with it.",
      "**Respond**: Talk to God about what this verse means for your situation right now.",
      "**Rest**: Simply be still in God's presence. Let His peace wash over you.",
      "When you're ready, thank God for speaking to you through His Word."
    ],
    completionPrompt: "What word or phrase spoke to your heart? What is God saying to you today?"
  },

  serenity_prayer: {
    name: "The Serenity Prayer Practice",
    type: "prayer",
    duration: "5 minutes",
    steps: [
      "This prayer has brought comfort to millions. Let's pray it together with intention.",
      "Close your eyes and take a deep breath.",
      "Pray slowly, pausing to reflect on each line:",
      "*\"God, grant me the serenity to accept the things I cannot change...\"*",
      "What in your life right now do you need to accept? Name it silently.",
      "*\"The courage to change the things I can...\"*",
      "What is one small step you could take today? What action is within your power?",
      "*\"And the wisdom to know the difference.\"*",
      "Ask God to show you clearly what's yours to carry and what's His.",
      "Sit quietly for a moment, releasing control to God."
    ],
    completionPrompt: "What felt most meaningful as you prayed? What do you feel led to accept or change?"
  },

  gratitude_blessing: {
    name: "Gratitude & Blessing Practice",
    type: "prayer",
    duration: "5 minutes",
    steps: [
      "*\"Give thanks in all circumstances; for this is God's will for you in Christ Jesus.\"* — 1 Thessalonians 5:18",
      "Even in difficulty, gratitude shifts our perspective toward hope.",
      "Name **3 things** you're grateful for today, no matter how small.",
      "For each one, say: *\"Thank you, Lord, for...\"*",
      "Now think of someone who has blessed your life recently.",
      "Silently pray a blessing over them: *\"Lord, bless [their name] with Your peace and love.\"*",
      "Finally, receive God's blessing for yourself:",
      "*\"The Lord bless you and keep you; the Lord make His face shine on you and be gracious to you; the Lord turn His face toward you and give you peace.\"* — Numbers 6:24-26"
    ],
    completionPrompt: "How did it feel to give thanks and bless others? What gratitude arose in your heart?"
  },

  psalm_comfort: {
    name: "Psalms of Comfort",
    type: "prayer",
    duration: "5-10 minutes",
    steps: [
      "The Psalms have been a source of comfort for God's people for thousands of years.",
      "Let these ancient words speak to your heart today:",
      "*\"The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, He leads me beside quiet waters, He refreshes my soul.\"* — Psalm 23:1-3",
      "Pause. Picture yourself in those green pastures. Feel God's peace.",
      "*\"Even though I walk through the darkest valley, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me.\"* — Psalm 23:4",
      "Whatever valley you're walking through, you are not alone. God is with you.",
      "*\"Surely Your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.\"* — Psalm 23:6",
      "Rest in the promise that His goodness follows you, even when you can't see it."
    ],
    completionPrompt: "Which verse brought you the most comfort? What did you sense God saying to you?"
  },

  faith_affirmations: {
    name: "Faith-Based Affirmations",
    type: "prayer",
    duration: "3-5 minutes",
    steps: [
      "Let's replace anxious thoughts with God's truth. Repeat each affirmation slowly:",
      "*\"I am fearfully and wonderfully made.\"* — Psalm 139:14",
      "*\"I can do all things through Christ who strengthens me.\"* — Philippians 4:13",
      "*\"God has not given me a spirit of fear, but of power, love, and a sound mind.\"* — 2 Timothy 1:7",
      "*\"I am loved with an everlasting love.\"* — Jeremiah 31:3",
      "*\"Nothing can separate me from the love of God.\"* — Romans 8:38-39",
      "*\"The Lord is my light and my salvation—whom shall I fear?\"* — Psalm 27:1",
      "Which of these truths do you most need to hear today? Say it again, letting it sink deep into your heart."
    ],
    completionPrompt: "Which truth resonated most deeply with you? How might you carry it with you today?"
  }
};

export const SCRIPTURE_VERSES = {
  anxiety: [
    { verse: "Cast all your anxiety on Him because He cares for you.", reference: "1 Peter 5:7" },
    { verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
    { verse: "When anxiety was great within me, Your consolation brought me joy.", reference: "Psalm 94:19" }
  ],
  depression: [
    { verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
    { verse: "He heals the brokenhearted and binds up their wounds.", reference: "Psalm 147:3" },
    { verse: "Weeping may stay for the night, but rejoicing comes in the morning.", reference: "Psalm 30:5" }
  ],
  fear: [
    { verse: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", reference: "2 Timothy 1:7" },
    { verse: "The Lord is my light and my salvation—whom shall I fear?", reference: "Psalm 27:1" },
    { verse: "Fear not, for I am with you; be not dismayed, for I am your God.", reference: "Isaiah 41:10" }
  ],
  strength: [
    { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
    { verse: "But those who hope in the Lord will renew their strength.", reference: "Isaiah 40:31" },
    { verse: "The Lord is my strength and my shield; my heart trusts in Him, and He helps me.", reference: "Psalm 28:7" }
  ],
  peace: [
    { verse: "Peace I leave with you; my peace I give you.", reference: "John 14:27" },
    { verse: "And the peace of God, which transcends all understanding, will guard your hearts and minds.", reference: "Philippians 4:7" },
    { verse: "You will keep in perfect peace those whose minds are steadfast, because they trust in You.", reference: "Isaiah 26:3" }
  ],
  hope: [
    { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
    { verse: "May the God of hope fill you with all joy and peace as you trust in Him.", reference: "Romans 15:13" },
    { verse: "We have this hope as an anchor for the soul, firm and secure.", reference: "Hebrews 6:19" }
  ],
  comfort: [
    { verse: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
    { verse: "Blessed are those who mourn, for they will be comforted.", reference: "Matthew 5:4" },
    { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" }
  ],
  love: [
    { verse: "I have loved you with an everlasting love; I have drawn you with unfailing kindness.", reference: "Jeremiah 31:3" },
    { verse: "Neither death nor life, neither angels nor demons, can separate us from the love of God.", reference: "Romans 8:38-39" },
    { verse: "See what great love the Father has lavished on us, that we should be called children of God!", reference: "1 John 3:1" }
  ]
};

export function getRelevantScripture(emotion: string): { verse: string; reference: string } | null {
  const category = emotion.toLowerCase();
  const verses = SCRIPTURE_VERSES[category as keyof typeof SCRIPTURE_VERSES];
  if (!verses || verses.length === 0) {
    // Default to comfort verses
    const comfortVerses = SCRIPTURE_VERSES.comfort;
    return comfortVerses[Math.floor(Math.random() * comfortVerses.length)];
  }
  return verses[Math.floor(Math.random() * verses.length)];
}

export function selectTherapyModule(trigger: string, userPreferences?: string[]): TherapyExercise | null {
  const moduleMap: Record<string, string[]> = {
    grounding: ["grounding_54321"],
    dbt_distress: ["dbt_tipp", "dbt_wise_mind"],
    cbt_thoughts: ["cbt_thought_record", "cbt_cognitive_distortions"],
    mindfulness: ["mindfulness_body_scan"],
    breathing: ["box_breathing"],
    spiritual: ["spiritual_centering", "scripture_meditation", "serenity_prayer", "gratitude_blessing", "psalm_comfort", "faith_affirmations"],
    prayer: ["spiritual_centering", "scripture_meditation", "serenity_prayer"],
    scripture: ["scripture_meditation", "psalm_comfort", "faith_affirmations"],
    comfort: ["psalm_comfort", "gratitude_blessing"],
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
