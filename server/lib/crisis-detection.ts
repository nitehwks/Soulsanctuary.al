export interface CrisisAssessment {
  isCrisis: boolean;
  severity: "none" | "low" | "moderate" | "high" | "critical";
  triggers: string[];
  recommendedAction: "continue" | "offer_resources" | "gentle_redirect" | "immediate_resources";
  crisisResources?: CrisisResource[];
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

const CRITICAL_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "don't want to live", "better off dead", "no reason to live",
  "end it all", "can't go on", "goodbye forever"
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
  
  for (const keyword of CRITICAL_KEYWORDS) {
    if (matchesWithWordBoundary(lowerContent, keyword)) {
      triggers.push(keyword);
      severity = "critical";
    }
  }
  
  if (severity !== "critical") {
    for (const keyword of HIGH_SEVERITY_KEYWORDS) {
      if (matchesWithWordBoundary(lowerContent, keyword)) {
        triggers.push(keyword);
        if (severity !== "high") severity = "high";
      }
    }
  }
  
  if (severity === "none") {
    for (const keyword of MODERATE_KEYWORDS) {
      if (matchesWithWordBoundary(lowerContent, keyword)) {
        triggers.push(keyword);
        if (severity !== "moderate") severity = "moderate";
      }
    }
  }
  
  if (severity === "none") {
    for (const keyword of LOW_KEYWORDS) {
      if (matchesWithWordBoundary(lowerContent, keyword)) {
        triggers.push(keyword);
        if (severity !== "low") severity = "low";
      }
    }
  }
  
  if (sentimentScore !== undefined && sentimentScore < 20 && severity === "none") {
    severity = "low";
    triggers.push("very negative sentiment detected");
  }
  
  let recommendedAction: CrisisAssessment["recommendedAction"] = "continue";
  let crisisResources: CrisisResource[] | undefined;
  
  switch (severity) {
    case "critical":
      recommendedAction = "immediate_resources";
      crisisResources = CRISIS_HOTLINES;
      break;
    case "high":
      recommendedAction = "gentle_redirect";
      crisisResources = CRISIS_HOTLINES;
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
    crisisResources
  };
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
