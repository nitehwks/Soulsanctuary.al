export interface CrisisAssessment {
  isCrisis: boolean;
  severity: "none" | "low" | "moderate" | "high" | "critical";
  triggers: string[];
  recommendedAction: "continue" | "offer_resources" | "gentle_redirect" | "immediate_resources";
  crisisResources?: CrisisResource[];
  crisisType?: CrisisType;
  pastoralGuidance?: PastoralGuidance;
}

export type CrisisType = 
  | "suicidal_ideation" 
  | "self_harm" 
  | "abuse_victim" 
  | "abuse_perpetrator"
  | "domestic_violence" 
  | "neglect"
  | "homicidal_ideation"
  | "harm_to_others"
  | "general_distress"
  | "spiritual_crisis"
  | "harmful_thinking";

export interface PastoralGuidance {
  rootIssue: string;
  scriptures: { verse: string; reference: string }[];
  therapeuticApproach: string;
  gentleRedirect: string;
}

export interface CrisisResource {
  name: string;
  phone?: string;
  text?: string;
  website?: string;
  description: string;
}

const CRISIS_HOTLINES: CrisisResource[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    text: "988",
    website: "https://988lifeline.org",
    description: "Free, confidential support 24/7 for anyone in distress"
  },
  {
    name: "Crisis Text Line",
    text: "HOME to 741741",
    website: "https://www.crisistextline.org",
    description: "Text-based crisis support available 24/7"
  },
  {
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    website: "https://www.samhsa.gov/find-help/national-helpline",
    description: "Treatment referral and information service (free, confidential, 24/7)"
  },
  {
    name: "International Association for Suicide Prevention",
    website: "https://www.iasp.info/resources/Crisis_Centres/",
    description: "Find crisis centers worldwide"
  }
];

const DOMESTIC_VIOLENCE_RESOURCES: CrisisResource[] = [
  {
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    text: "START to 88788",
    website: "https://www.thehotline.org",
    description: "24/7 support for domestic violence survivors"
  },
  {
    name: "National Child Abuse Hotline",
    phone: "1-800-422-4453",
    website: "https://www.childhelp.org",
    description: "Help for children and families affected by abuse"
  }
];

const ABUSE_RESOURCES: CrisisResource[] = [
  {
    name: "RAINN (Sexual Assault Hotline)",
    phone: "1-800-656-4673",
    website: "https://www.rainn.org",
    description: "Support for survivors of sexual violence"
  },
  {
    name: "National Child Abuse Hotline",
    phone: "1-800-422-4453",
    website: "https://www.childhelp.org",
    description: "Help for children and families affected by abuse"
  },
  {
    name: "Elder Abuse Hotline",
    phone: "1-800-677-1116",
    website: "https://eldercare.acl.gov",
    description: "Resources for elder abuse reporting and support"
  }
];

const CRISIS_SCRIPTURES: Record<string, { verse: string; reference: string }[]> = {
  suicidal: [
    { verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
    { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
    { verse: "He heals the brokenhearted and binds up their wounds.", reference: "Psalm 147:3" }
  ],
  selfHarm: [
    { verse: "Do you not know that your bodies are temples of the Holy Spirit, who is in you?", reference: "1 Corinthians 6:19" },
    { verse: "For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made.", reference: "Psalm 139:13-14" },
    { verse: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" }
  ],
  abuse: [
    { verse: "The Lord is a refuge for the oppressed, a stronghold in times of trouble.", reference: "Psalm 9:9" },
    { verse: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.", reference: "Revelation 21:4" },
    { verse: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?", reference: "Psalm 27:1" }
  ],
  worthlessness: [
    { verse: "See what great love the Father has lavished on us, that we should be called children of God!", reference: "1 John 3:1" },
    { verse: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession.", reference: "1 Peter 2:9" },
    { verse: "I have loved you with an everlasting love; I have drawn you with unfailing kindness.", reference: "Jeremiah 31:3" }
  ],
  anger: [
    { verse: "In your anger do not sin. Do not let the sun go down while you are still angry.", reference: "Ephesians 4:26" },
    { verse: "A gentle answer turns away wrath, but a harsh word stirs up anger.", reference: "Proverbs 15:1" },
    { verse: "Get rid of all bitterness, rage and anger... Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", reference: "Ephesians 4:31-32" }
  ],
  hatred: [
    { verse: "But I tell you, love your enemies and pray for those who persecute you.", reference: "Matthew 5:44" },
    { verse: "Anyone who claims to be in the light but hates a brother or sister is still in the darkness.", reference: "1 John 2:9" },
    { verse: "Do not be overcome by evil, but overcome evil with good.", reference: "Romans 12:21" }
  ],
  redemption: [
    { verse: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", reference: "2 Corinthians 5:17" },
    { verse: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.", reference: "1 John 1:9" },
    { verse: "As far as the east is from the west, so far has he removed our transgressions from us.", reference: "Psalm 103:12" }
  ]
};

const CRITICAL_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "don't want to live", "better off dead", "no reason to live",
  "end it all", "can't go on", "goodbye forever"
];

const HOMICIDAL_KEYWORDS = [
  "kill someone", "kill them", "kill him", "kill her", "murder",
  "hurt them badly", "make them pay", "want them dead",
  "shoot them", "stab them", "they deserve to die"
];

const ABUSE_VICTIM_KEYWORDS = [
  "being abused", "he hits me", "she hits me", "they hit me",
  "molested", "raped", "sexually assaulted", "touched me",
  "forced me", "won't let me leave", "controls everything",
  "afraid of him", "afraid of her", "threatens to kill",
  "chokes me", "strangled", "locked me", "starving me"
];

const DOMESTIC_VIOLENCE_KEYWORDS = [
  "domestic violence", "abusive relationship", "partner hits",
  "spouse hits", "husband hits", "wife hits", "boyfriend hits",
  "girlfriend hits", "abusive partner", "violent partner",
  "afraid to go home", "walking on eggshells", "bruises from"
];

const NEGLECT_KEYWORDS = [
  "no one feeds me", "parents don't care", "left alone",
  "child neglect", "elder neglect", "no food", "no medicine",
  "abandoned", "forgotten", "no one checks on me"
];

const ABUSE_PERPETRATOR_KEYWORDS = [
  "i hit my", "i hurt my", "i punish my", "beat my",
  "i can't stop hitting", "i lose control and", "i scare my",
  "i threaten my", "after i hit"
];

const HIGH_SEVERITY_KEYWORDS = [
  "self-harm", "cutting", "hurt myself", "harm myself",
  "overdose", "pills", "bridge", "gun", "rope",
  "plan to die", "method", "note", "goodbye"
];

const MODERATE_KEYWORDS = [
  "hopeless", "worthless", "burden", "nobody cares",
  "can't take it", "giving up", "trapped", "no way out",
  "exhausted", "done trying", "nothing matters"
];

const LOW_KEYWORDS = [
  "depressed", "anxious", "panic", "scared", "lonely",
  "sad", "crying", "overwhelmed", "stressed", "angry",
  "frustrated", "hurt", "pain", "suffering"
];

const HARMFUL_THINKING_PATTERNS: Record<string, string[]> = {
  racism: [
    "those people", "all of them are", "they're all the same",
    "their kind", "they're ruining", "go back to",
    "shouldn't be allowed", "inferior race", "superior race"
  ],
  bigotry: [
    "hate all", "disgusting people", "shouldn't exist",
    "all sinners deserve", "god hates", "burn in hell",
    "abomination", "they're evil"
  ],
  misogyny: [
    "all women are", "women shouldn't", "women can't",
    "females are", "she deserved it", "asking for it",
    "women belong in", "typical woman"
  ],
  ageism: [
    "old people should", "boomers are all", "young people are all",
    "too old to", "kids these days", "millennials are"
  ],
  generalizedHatred: [
    "i hate everyone", "humanity deserves", "people are worthless",
    "everyone is against me", "no one can be trusted"
  ]
};

const THERAPY_TRIGGERS: Record<string, string[]> = {
  grounding: ["panic attack", "panicking", "can't breathe", "hyperventilating", "dissociating", "flashback", "triggered"],
  dbt_distress: ["overwhelming", "can't cope", "intense emotions", "out of control", "going to explode"],
  cbt_thoughts: ["negative thoughts", "can't stop thinking", "worst case", "catastrophizing", "ruminating"],
  mindfulness: ["racing thoughts", "can't relax", "tense", "wound up", "need to calm down"],
  breathing: ["short of breath", "heart racing", "sweating", "shaking", "trembling"]
};

function matchesWithWordBoundary(content: string, keyword: string): boolean {
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
  return regex.test(content);
}

export function detectCrisis(content: string, sentimentScore?: number): CrisisAssessment {
  const lowerContent = content.toLowerCase();
  const triggers: string[] = [];
  let severity: CrisisAssessment["severity"] = "none";
  let crisisType: CrisisType | undefined;
  let pastoralGuidance: PastoralGuidance | undefined;
  
  // Check for suicidal ideation (critical)
  for (const keyword of CRITICAL_KEYWORDS) {
    if (matchesWithWordBoundary(lowerContent, keyword)) {
      triggers.push(keyword);
      severity = "critical";
      crisisType = "suicidal_ideation";
    }
  }
  
  // Check for homicidal ideation (critical)
  if (severity !== "critical") {
    for (const keyword of HOMICIDAL_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        triggers.push(keyword);
        severity = "critical";
        crisisType = "homicidal_ideation";
      }
    }
  }
  
  // Check for abuse victim (high)
  if (severity !== "critical") {
    for (const keyword of ABUSE_VICTIM_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        triggers.push(keyword);
        severity = "high";
        crisisType = "abuse_victim";
      }
    }
  }
  
  // Check for domestic violence (high)
  if (severity !== "critical" && severity !== "high") {
    for (const keyword of DOMESTIC_VIOLENCE_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        triggers.push(keyword);
        severity = "high";
        crisisType = "domestic_violence";
      }
    }
  }
  
  // Check for abuse perpetrator patterns (high - needs intervention)
  if (severity !== "critical" && severity !== "high") {
    for (const keyword of ABUSE_PERPETRATOR_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        triggers.push(keyword);
        severity = "high";
        crisisType = "abuse_perpetrator";
      }
    }
  }
  
  // Check for neglect (high)
  if (severity !== "critical" && severity !== "high") {
    for (const keyword of NEGLECT_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        triggers.push(keyword);
        severity = "high";
        crisisType = "neglect";
      }
    }
  }
  
  // Check for self-harm (high)
  if (severity !== "critical" && severity !== "high") {
    for (const keyword of HIGH_SEVERITY_KEYWORDS) {
      if (matchesWithWordBoundary(lowerContent, keyword)) {
        triggers.push(keyword);
        severity = "high";
        crisisType = "self_harm";
      }
    }
  }
  
  // Check for harmful thinking patterns (moderate - needs pastoral guidance)
  if (severity === "none") {
    for (const [pattern, keywords] of Object.entries(HARMFUL_THINKING_PATTERNS)) {
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword)) {
          triggers.push(`${pattern}: ${keyword}`);
          severity = "moderate";
          crisisType = "harmful_thinking";
          pastoralGuidance = getPastoralGuidanceForHarmfulThinking(pattern, keyword);
          break;
        }
      }
      if (crisisType === "harmful_thinking") break;
    }
  }
  
  // Check for moderate distress
  if (severity === "none") {
    for (const keyword of MODERATE_KEYWORDS) {
      if (matchesWithWordBoundary(lowerContent, keyword)) {
        triggers.push(keyword);
        severity = "moderate";
        crisisType = "general_distress";
      }
    }
  }
  
  // Check for low-level distress
  if (severity === "none") {
    for (const keyword of LOW_KEYWORDS) {
      if (matchesWithWordBoundary(lowerContent, keyword)) {
        triggers.push(keyword);
        severity = "low";
        crisisType = "general_distress";
      }
    }
  }
  
  if (sentimentScore !== undefined && sentimentScore < 20 && severity === "none") {
    severity = "low";
    triggers.push("very negative sentiment detected");
    crisisType = "general_distress";
  }
  
  // Generate pastoral guidance based on crisis type
  if (crisisType && !pastoralGuidance) {
    pastoralGuidance = generatePastoralGuidance(crisisType);
  }
  
  let recommendedAction: CrisisAssessment["recommendedAction"] = "continue";
  let crisisResources: CrisisResource[] | undefined;
  
  switch (severity) {
    case "critical":
      recommendedAction = "immediate_resources";
      crisisResources = crisisType === "homicidal_ideation" 
        ? CRISIS_HOTLINES 
        : CRISIS_HOTLINES;
      break;
    case "high":
      recommendedAction = "gentle_redirect";
      if (crisisType === "abuse_victim" || crisisType === "domestic_violence") {
        crisisResources = [...DOMESTIC_VIOLENCE_RESOURCES, ...ABUSE_RESOURCES];
      } else if (crisisType === "neglect") {
        crisisResources = ABUSE_RESOURCES;
      } else if (crisisType === "abuse_perpetrator") {
        crisisResources = CRISIS_HOTLINES;
      } else {
        crisisResources = CRISIS_HOTLINES;
      }
      break;
    case "moderate":
      recommendedAction = "offer_resources";
      crisisResources = CRISIS_HOTLINES.slice(0, 2);
      break;
    case "low":
      recommendedAction = "continue";
      break;
    default:
      recommendedAction = "continue";
  }
  
  return {
    isCrisis: severity === "critical" || severity === "high",
    severity,
    triggers,
    recommendedAction,
    crisisResources,
    crisisType,
    pastoralGuidance
  };
}

function getPastoralGuidanceForHarmfulThinking(pattern: string, trigger: string): PastoralGuidance {
  const guidanceMap: Record<string, PastoralGuidance> = {
    racism: {
      rootIssue: "Fear, pain, or a need for belonging may be driving these thoughts. The real question isn't about 'them' - it's about what's hurting in you.",
      scriptures: CRISIS_SCRIPTURES.hatred,
      therapeuticApproach: "CBT cognitive restructuring - examining generalizations. ACT values clarification - who do you want to be?",
      gentleRedirect: "I hear frustration in your words, but let me ask you something deeper: What's really troubling you right now? Sometimes when we're hurting, it's easier to point outward than to look inward."
    },
    bigotry: {
      rootIssue: "Anger or fear often hides behind judgment. Jesus said to love even those we disagree with. What's the wound beneath this anger?",
      scriptures: CRISIS_SCRIPTURES.hatred,
      therapeuticApproach: "DBT radical acceptance combined with CBT examining black-and-white thinking patterns.",
      gentleRedirect: "I sense a lot of strong feeling here. Before we go further, can I ask - what happened to you that's feeding this? Hurt people hurt people, and I wonder what your heart is carrying."
    },
    misogyny: {
      rootIssue: "Often rooted in past hurt, rejection, or learned patterns. The question isn't about women - it's about your pain.",
      scriptures: [
        { verse: "So God created mankind in His own image, in the image of God He created them; male and female He created them.", reference: "Genesis 1:27" },
        { verse: "There is neither Jew nor Gentile, neither slave nor free, nor is there male and female, for you are all one in Christ Jesus.", reference: "Galatians 3:28" }
      ],
      therapeuticApproach: "Schema therapy - examining early experiences. CBT - challenging cognitive distortions about an entire group.",
      gentleRedirect: "I hear anger, but I wonder if it's really about something that happened to you. Who hurt you? What experience is shaping how you see half the world?"
    },
    ageism: {
      rootIssue: "Generational frustration often masks fear - fear of irrelevance, fear of being misunderstood, fear of change.",
      scriptures: [
        { verse: "Gray hair is a crown of splendor; it is attained in the way of righteousness.", reference: "Proverbs 16:31" },
        { verse: "Don't let anyone look down on you because you are young, but set an example for the believers.", reference: "1 Timothy 4:12" }
      ],
      therapeuticApproach: "CBT perspective-taking exercises. Mindfulness around generalization patterns.",
      gentleRedirect: "I notice you're painting with a broad brush. Tell me more about what's really bothering you - is it a specific situation or person that's frustrating you?"
    },
    generalizedHatred: {
      rootIssue: "Deep hurt often leads to building walls. When we've been wounded badly, it feels safer to trust no one. But isolation isn't protection - it's a prison.",
      scriptures: CRISIS_SCRIPTURES.worthlessness,
      therapeuticApproach: "DBT interpersonal effectiveness. ACT defusion from thoughts. Trauma-informed approach.",
      gentleRedirect: "When you say you hate everyone, I hear profound pain. You've been hurt - maybe betrayed. Who wounded you so deeply that you've decided the whole world isn't safe?"
    }
  };
  
  return guidanceMap[pattern] || {
    rootIssue: "Strong emotions often point to deeper needs. Let's explore what's really going on.",
    scriptures: CRISIS_SCRIPTURES.redemption,
    therapeuticApproach: "CBT thought examination, DBT emotion regulation",
    gentleRedirect: "I hear something strong in your words. Can we pause and explore what's really driving these feelings?"
  };
}

function generatePastoralGuidance(crisisType: CrisisType): PastoralGuidance {
  const guidanceMap: Record<CrisisType, PastoralGuidance> = {
    suicidal_ideation: {
      rootIssue: "The pain you're feeling is real, but it's lying to you about your worth and your future. You matter more than you know.",
      scriptures: CRISIS_SCRIPTURES.suicidal,
      therapeuticApproach: "DBT distress tolerance (TIPP), safety planning, grounding techniques.",
      gentleRedirect: "I'm so glad you reached out. What you're feeling right now won't last forever, even though it feels unbearable. You are precious to God and to me. Can we talk about what's brought you to this place?"
    },
    self_harm: {
      rootIssue: "Self-harm is often a way to cope with overwhelming emotions or to feel something when you're numb. There are other ways to find relief.",
      scriptures: CRISIS_SCRIPTURES.selfHarm,
      therapeuticApproach: "DBT distress tolerance alternatives (ice cube, red marker, intense exercise), urge surfing.",
      gentleRedirect: "Your body is a temple, and you deserve gentleness - especially from yourself. What emotion is so overwhelming that you feel you need to hurt yourself to manage it?"
    },
    abuse_victim: {
      rootIssue: "What's happening to you is not okay, and it's not your fault. God sees your suffering and wants you safe.",
      scriptures: CRISIS_SCRIPTURES.abuse,
      therapeuticApproach: "Trauma-informed care, safety planning, EMDR preparation, grounding for flashbacks.",
      gentleRedirect: "I'm so sorry this is happening to you. You deserve safety and dignity. Your wellbeing matters. Are you safe right now? Can we talk about how to get you help?"
    },
    abuse_perpetrator: {
      rootIssue: "Recognizing you have a problem is the first step toward change. You can break this cycle, but you need help to do it.",
      scriptures: CRISIS_SCRIPTURES.redemption,
      therapeuticApproach: "Anger management, impulse control training, trauma processing for intergenerational patterns.",
      gentleRedirect: "It takes courage to admit this. The fact that you're talking about it means part of you wants to change. You're not defined by your worst moments - but you do need professional help to stop the cycle. Are you willing to take that step?"
    },
    domestic_violence: {
      rootIssue: "You deserve a relationship built on love and respect, not fear. This is not how God designed love to be.",
      scriptures: CRISIS_SCRIPTURES.abuse,
      therapeuticApproach: "Safety planning, trauma-informed care, rebuilding self-worth.",
      gentleRedirect: "No one deserves to live in fear. Love is patient, love is kind - it does not dishonor, it does not harm. Are you safe right now? Let's talk about getting you support."
    },
    neglect: {
      rootIssue: "You deserve to be cared for. Being forgotten or abandoned is deeply painful, but you are not invisible to God.",
      scriptures: CRISIS_SCRIPTURES.worthlessness,
      therapeuticApproach: "Attachment-focused therapy, meeting basic needs, building support network.",
      gentleRedirect: "I'm sorry you've been left to handle this alone. You matter, and there are people who can help. Can we explore what support you need right now?"
    },
    homicidal_ideation: {
      rootIssue: "These intense feelings are a sign of deep pain and anger. But acting on them would destroy your life and theirs. There's another way.",
      scriptures: CRISIS_SCRIPTURES.anger,
      therapeuticApproach: "DBT distress tolerance, anger management, TIPP skills for immediate de-escalation.",
      gentleRedirect: "I can hear how angry you are, and that anger is real. But I need you to know: acting on these thoughts would be irreversible. Whatever was done to you, you can find justice and healing without destroying yourself. What happened that brought you here?"
    },
    harm_to_others: {
      rootIssue: "Thoughts of hurting others often come from feeling deeply wronged. The desire for justice is understandable, but vengeance will only deepen your pain.",
      scriptures: CRISIS_SCRIPTURES.anger,
      therapeuticApproach: "Anger management, DBT interpersonal effectiveness, addressing underlying trauma.",
      gentleRedirect: "Vengeance feels like it would bring relief, but it won't. Tell me what happened - who hurt you so badly that you're carrying this?"
    },
    general_distress: {
      rootIssue: "Life can feel overwhelming. God walks with you through the valleys, not just the mountaintops.",
      scriptures: CRISIS_SCRIPTURES.worthlessness,
      therapeuticApproach: "Grounding, mindfulness, CBT thought examination, building coping toolkit.",
      gentleRedirect: "I hear that you're struggling. Tell me more about what's weighing on you. Sometimes just putting words to it helps."
    },
    spiritual_crisis: {
      rootIssue: "Doubt and questioning are part of the faith journey. Even Jesus cried 'Why have you forsaken me?' on the cross.",
      scriptures: CRISIS_SCRIPTURES.hope,
      therapeuticApproach: "Meaning-making, ACT values exploration, spiritual direction approaches.",
      gentleRedirect: "Questions and doubts don't make you a bad believer - they make you honest. What's troubling your spirit right now?"
    },
    harmful_thinking: {
      rootIssue: "Our thoughts reveal our wounds. Let's look beneath the surface together.",
      scriptures: CRISIS_SCRIPTURES.redemption,
      therapeuticApproach: "CBT cognitive restructuring, ACT values clarification, perspective-taking.",
      gentleRedirect: "I notice strong feelings here. Can we pause and explore what's really driving this?"
    }
  };
  
  return guidanceMap[crisisType] || {
    rootIssue: "Something is weighing on you. Let's explore it together.",
    scriptures: CRISIS_SCRIPTURES.comfort,
    therapeuticApproach: "Active listening, empathic reflection, gentle exploration.",
    gentleRedirect: "Tell me more about what's on your heart."
  };
}

export function getCrisisScripture(category: string): { verse: string; reference: string } {
  const scriptures = CRISIS_SCRIPTURES[category as keyof typeof CRISIS_SCRIPTURES];
  if (scriptures && scriptures.length > 0) {
    return scriptures[Math.floor(Math.random() * scriptures.length)];
  }
  const defaultScriptures = CRISIS_SCRIPTURES.comfort || CRISIS_SCRIPTURES.worthlessness;
  return defaultScriptures[Math.floor(Math.random() * defaultScriptures.length)];
}

export function detectTherapyTrigger(content: string): string | null {
  const lowerContent = content.toLowerCase();
  
  for (const [module, keywords] of Object.entries(THERAPY_TRIGGERS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        return module;
      }
    }
  }
  
  return null;
}

export function formatCrisisResources(resources: CrisisResource[]): string {
  let message = "\n\n---\n**Support Resources:**\n";
  
  for (const resource of resources) {
    message += `\n**${resource.name}**\n`;
    if (resource.phone) message += `📞 Call: ${resource.phone}\n`;
    if (resource.text) message += `💬 Text: ${resource.text}\n`;
    if (resource.website) message += `🌐 ${resource.website}\n`;
    message += `*${resource.description}*\n`;
  }
  
  return message;
}
