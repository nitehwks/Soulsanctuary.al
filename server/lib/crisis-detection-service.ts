// Faith Companion — Crisis Detection & Safety Wrapper Service
// Based on the crisis detection spec: scan user messages for self-harm / crisis
// indicators and, when required, bypass the AI and return a safety wrapper.

export type CrisisLevel = 0 | 1 | 2 | 3;

export interface CrisisScanResult {
  level: CrisisLevel;
  triggeredBy: string[];
  requiresSafetyWrapper: boolean;
}

// Level 2 — High Risk / Safety wrapper triggers
const LEVEL_2_KEYWORDS: RegExp[] = [
  // Direct self-harm intent
  /kill(?:ing|ed)?\s+myself/i,
  /end\s+my\s+life/i,
  /suicide/i,
  /suicidal/i,
  /take\s+my\s+own\s+life/i,
  /end\s+it\s+all/i,
  /don't\s+want\s+to\s+be\s+here/i,
  /better\s+off\s+dead/i,
  /want\s+to\s+die/i,
  /wants\s+to\s+die/i,
  /thinking\s+about\s+dying/i,
  /plan\s+to\s+end/i,
  /overdose/i,
  /hang\s+myself/i,
  /jump\s+off/i,
  /slit\s+my\s+wrist/i,
  /no\s+reason\s+to\s+live/i,

  // Hopelessness / worthlessness
  /i'?m\s+a\s+burden/i,
  /everyone\s+would\s+be\s+better\s+off/i,
  /nothing\s+will\s+ever\s+change/i,
  /no\s+point\s+in\s+trying/i,
  /completely\s+hopeless/i,
  /beyond\s+help/i,
  /nothing\s+matters/i,
  /nothing\s+matters\s+anymore/i,
  /given\s+up/i,
  /can't\s+go\s+on/i,
  /done\s+fighting/i,

  // Goodbye / finality
  /saying\s+goodbye/i,
  /won't\s+be\s+around/i,
  /this\s+is\s+my\s+last/i,
  /just\s+wanted\s+to\s+say\s+goodbye/i,
  /make\s+sure\s+you\s+know\s+i\s+love\s+you/i,
  /time\s+for\s+me\s+to\s+go/i,
  /won't\s+have\s+to\s+worry\s+about\s+me/i,

  // Means / method mentions
  /i\s+have\s+pills/i,
  /i\s+have\s+(?:a|the)\s+gun/i,
  /bought\s+a\s+gun/i,
  /the\s+gun\s+is\s+loaded/i,
  /(?:^|\s)rope(?:\s|$|\.)/i,
  /(?:^|\s)bridge(?:\s|$|\.)/i,
  /tall\s+building/i,
  /sharp\s+object/i,
  /(?:^|\s)knife(?:\s|$|\.)/i,
  /poison/i,
  /carbon\s+monoxide/i,

  // Plan + timeline combinations
  /tonight.*(?:die|end|kill)/i,
  /tomorrow.*(?:die|end|kill)/i,
  /this\s+weekend.*(?:die|end|kill)/i,
  /tried\s+last\s+week/i,
];

// Level 1 — Elevated Distress (empathy + soft offer)
const LEVEL_1_KEYWORDS: RegExp[] = [
  /can't\s+take\s+it/i,
  /so\s+overwhelmed/i,
  /breaking\s+down/i,
  /falling\s+apart/i,
  /not\s+coping/i,
  /barely\s+holding\s+on/i,
  /exhausted/i,
  /numb/i,
  /depressed/i,
  /panic\s+attack/i,
  /can't\s+breathe/i,
  /spiraling/i,
  /dark\s+thoughts/i,
  /lonely/i,
  /isolated/i,
  /rejected/i,
  /abandoned/i,
  /grieving/i,
  /trauma/i,
  /flashbacks/i,
  /anxious/i,
];

export function scanForCrisis(message: string): CrisisScanResult {
  if (!message || typeof message !== "string") {
    return { level: 0, triggeredBy: [], requiresSafetyWrapper: false };
  }

  const lowerMsg = message.toLowerCase();
  const triggeredBy: string[] = [];

  // Check Level 2 (high risk) first
  for (const pattern of LEVEL_2_KEYWORDS) {
    if (pattern.test(message)) {
      triggeredBy.push(pattern.source);
    }
  }

  if (triggeredBy.length > 0) {
    // Check for imminent danger (Level 3)
    const hasPlan = /\b(?:tonight|tomorrow|this\s+weekend|plan|going\s+to)\b/i.test(lowerMsg);
    const hasMeans = /\b(?:pills|gun|rope|bridge|knife|overdose)\b/i.test(lowerMsg);
    const hasGoodbye = /\b(?:goodbye|last\s+message|won't\s+be\s+around)\b/i.test(lowerMsg);

    if ((hasPlan && hasMeans) || hasGoodbye) {
      return { level: 3, triggeredBy, requiresSafetyWrapper: true };
    }
    return { level: 2, triggeredBy, requiresSafetyWrapper: true };
  }

  // Check Level 1 (elevated distress)
  for (const pattern of LEVEL_1_KEYWORDS) {
    if (pattern.test(message)) {
      triggeredBy.push(pattern.source);
    }
  }
  if (triggeredBy.length > 0) {
    return { level: 1, triggeredBy, requiresSafetyWrapper: false };
  }

  return { level: 0, triggeredBy: [], requiresSafetyWrapper: false };
}

export function generateSafetyWrapper(level: 2 | 3): string {
  const lines: string[] = [];

  lines.push(
    "I'm really sorry you're feeling this way. What you're going through matters, and you don't have to carry it alone."
  );
  lines.push("");

  if (level === 3) {
    lines.push(
      "**If you're in immediate danger, please call emergency services (911 in the US) right now.**"
    );
    lines.push("");
  }

  lines.push("**988 Suicide & Crisis Lifeline**");
  lines.push("Call or text: 988");
  lines.push("https://988lifeline.org");
  lines.push("Free, confidential, 24/7");
  lines.push("");

  lines.push("**Crisis Text Line**");
  lines.push("Text HOME to 741741");
  lines.push("https://www.crisistextline.org");
  lines.push("");

  lines.push("**International Association for Suicide Prevention**");
  lines.push("https://www.iasp.info/resources/Crisis_Centres/");
  lines.push("");

  lines.push(
    "These trained counselors are ready to listen right now. They can help you through this moment. You matter more than you know."
  );
  lines.push("");

  lines.push(
    "I'm SoulSanctuary AI — an AI companion, not a licensed therapist. I'm not equipped to help with crisis situations, but real people are standing by who are. Please reach out to them now."
  );

  return lines.join("\n");
}

export function generateElevatedDistressResponse(): string {
  return "That sounds really heavy, and I want you to know I'm here with you. Would it help to talk through what's going on?";
}

export function isHighRiskOrImminent(result: CrisisScanResult): boolean {
  return result.level === 2 || result.level === 3;
}
