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
*Your SoulSanctuary AI Pastor is here to offer pastoral care, prayer, scripture, and evidence-based therapeutic support. In crisis situations, please also reach out to emergency services (911) or the Suicide & Crisis Lifeline (988).*`;
}

export function generateConsentText(): string {
  return `**Welcome to SoulSanctuary - Your AI Pastor**

I am your pastoral counselor and spiritual guide, combining the wisdom of Christian faith with proven therapeutic practices.

✅ **What I offer as your AI Pastor:**
- Pastoral care, prayer, and scripture-based encouragement
- Evidence-based therapeutic exercises (DBT, CBT, ACT, Mindfulness)
- A compassionate, non-judgmental space for confession and healing
- Spiritual exercises: Centering Prayer, Lectio Divina, Psalms of Comfort
- Tools for managing difficult emotions with faith and science
- Crisis support with compassion and professional resources

🙏 **My commitment to you:**
- I will walk alongside you on your journey toward healing
- I will lift you up and help you see your God-given worth
- I will guide you toward independence, not dependence on me
- I will respect your spiritual preferences at all times

Your conversations are encrypted and private. In crisis situations, I will always encourage you to seek additional human support.

Would you like to begin with a prayer?`;
}
