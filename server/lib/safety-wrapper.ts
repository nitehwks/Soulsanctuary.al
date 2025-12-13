import { CrisisAssessment, formatCrisisResources, PastoralGuidance } from './crisis-detection';
import { TherapyExercise, formatTherapyExercise } from './therapy-modules';

export interface SafetyWrapperResult {
  modifiedContent: string;
  wasModified: boolean;
  addedResources: boolean;
  addedTherapy: boolean;
  addedScripture: boolean;
  safetyNote?: string;
  pastoralGuidance?: PastoralGuidance;
}

const COMPASSIONATE_PREFIXES: Record<string, string[]> = {
  critical: [
    "I hear how much pain you're in right now, and I want you to know that you matter.",
    "What you're feeling is real and valid. You've reached out, and that takes courage.",
    "I'm concerned about you, and I want to make sure you have support."
  ],
  high: [
    "I can sense you're going through something really difficult right now.",
    "Thank you for sharing this with me. What you're experiencing sounds incredibly hard.",
    "I hear the pain in your words, and I want you to know you're not alone."
  ],
  moderate: [
    "It sounds like you're carrying a lot right now.",
    "What you're describing sounds really challenging.",
    "I want to acknowledge how difficult this must be for you."
  ],
  low: [
    "I'm here with you.",
    "Thank you for sharing how you're feeling.",
    "It's okay to feel this way."
  ]
};

const GENTLE_REDIRECTS: string[] = [
  "While I'm here to support you, I also want to make sure you have access to people who specialize in crisis support.",
  "You deserve real-time support from someone trained specifically for moments like this.",
  "I care about your wellbeing, and I want to share some resources that might help."
];

export function wrapResponseWithSafety(
  aiResponse: string,
  crisisAssessment: CrisisAssessment,
  therapyExercise?: TherapyExercise | null,
  includeFaith: boolean = true
): SafetyWrapperResult {
  let modifiedContent = aiResponse;
  let wasModified = false;
  let addedResources = false;
  let addedTherapy = false;
  let addedScripture = false;
  let safetyNote: string | undefined;

  // Use pastoral guidance if available
  const guidance = crisisAssessment.pastoralGuidance;

  if (crisisAssessment.severity !== "none" && crisisAssessment.severity !== "low") {
    const prefixes = COMPASSIONATE_PREFIXES[crisisAssessment.severity] || COMPASSIONATE_PREFIXES.low;
    const selectedPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    if (!aiResponse.toLowerCase().includes("crisis") && 
        !aiResponse.toLowerCase().includes("support") &&
        !aiResponse.toLowerCase().includes("988")) {
      modifiedContent = selectedPrefix + "\n\n" + modifiedContent;
      wasModified = true;
    }
  }

  // Add scripture comfort for faith-enabled users in crisis situations
  if (includeFaith && guidance && guidance.scriptures && guidance.scriptures.length > 0 && 
      crisisAssessment.severity !== "none") {
    const scripture = guidance.scriptures[Math.floor(Math.random() * guidance.scriptures.length)];
    if (scripture && !modifiedContent.toLowerCase().includes(scripture.reference.toLowerCase())) {
      modifiedContent += `\n\n*"${scripture.verse}"* — ${scripture.reference}`;
      addedScripture = true;
      wasModified = true;
    }
  }

  if (crisisAssessment.recommendedAction === "immediate_resources" ||
      crisisAssessment.recommendedAction === "gentle_redirect") {
    const redirect = GENTLE_REDIRECTS[Math.floor(Math.random() * GENTLE_REDIRECTS.length)];
    
    if (crisisAssessment.crisisResources && crisisAssessment.crisisResources.length > 0) {
      modifiedContent += "\n\n" + redirect;
      modifiedContent += formatCrisisResources(crisisAssessment.crisisResources);
      addedResources = true;
      wasModified = true;
    }
    
    safetyNote = crisisAssessment.severity === "critical" 
      ? "Please consider reaching out to one of these resources. They're available 24/7 and want to help."
      : "These resources are here if you need them. There's no pressure, but they're just a call or text away.";
  }

  if (crisisAssessment.recommendedAction === "offer_resources" && 
      crisisAssessment.crisisResources && 
      crisisAssessment.crisisResources.length > 0) {
    modifiedContent += "\n\n*If you ever need immediate support, these resources are available 24/7:*";
    modifiedContent += formatCrisisResources(crisisAssessment.crisisResources);
    addedResources = true;
    wasModified = true;
  }

  if (therapyExercise) {
    modifiedContent += formatTherapyExercise(therapyExercise);
    addedTherapy = true;
    wasModified = true;
  }

  return {
    modifiedContent,
    wasModified,
    addedResources,
    addedTherapy,
    addedScripture,
    safetyNote,
    pastoralGuidance: guidance
  };
}

export function formatPastoralGuidanceContext(guidance: PastoralGuidance): string {
  let context = `\n\n## PASTORAL GUIDANCE FOR THIS SITUATION\n`;
  context += `**Root Issue to Address:** ${guidance.rootIssue}\n`;
  context += `**Recommended Therapeutic Approach:** ${guidance.therapeuticApproach}\n`;
  context += `**Gentle Redirect:** ${guidance.gentleRedirect}\n`;
  if (guidance.scriptures && guidance.scriptures.length > 0) {
    context += `**Relevant Scriptures:**\n`;
    guidance.scriptures.forEach(s => {
      context += `- "${s.verse}" — ${s.reference}\n`;
    });
  }
  return context;
}

export function generateDisclaimer(): string {
  return `---
*SoulSanctuary AI is designed to provide emotional support and evidence-based therapeutic exercises. It is not a substitute for professional mental health care or emergency services. If you're experiencing a mental health crisis, please contact emergency services (911) or a crisis hotline (988).*`;
}

export function generateConsentText(): string {
  return `**Welcome to SoulSanctuary AI Therapy Mode**

Before we begin, I want to be clear about what I can and cannot do:

✅ **What I can offer:**
- Evidence-based therapeutic exercises (DBT, CBT, ACT, Mindfulness)
- A compassionate, non-judgmental space to express yourself
- Grounding techniques for anxiety and panic
- Tools for managing difficult emotions
- Connections to crisis resources when needed

❌ **What I cannot do:**
- Provide medical or psychiatric diagnosis
- Replace professional therapy or medication
- Respond in real-time emergencies
- Access emergency services for you

By continuing, you acknowledge that:
1. This is not a substitute for professional care
2. In crisis situations, you will seek human support
3. Your conversations may be stored (encrypted) to improve the experience

Do you consent to continue with these understandings?`;
}
