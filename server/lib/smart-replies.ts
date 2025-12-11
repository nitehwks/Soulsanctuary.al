/**
 * Smart Reply Generator
 * 
 * Generates contextually relevant quick-response suggestions based on:
 * - The AI's response content
 * - User's emotional state
 * - Conversation topic
 * - Whether questions were asked
 */

export interface SmartReply {
  id: string;
  text: string;
  type: 'affirmative' | 'negative' | 'question' | 'emotional' | 'action' | 'continue';
}

interface SmartReplyContext {
  aiResponse: string;
  userMessage: string;
  sentiment: string;
  therapistMode: boolean;
  crisisDetected: boolean;
}

const AFFIRMATIVE_REPLIES: SmartReply[] = [
  { id: 'yes_please', text: "Yes, please", type: 'affirmative' },
  { id: 'sounds_good', text: "Sounds good", type: 'affirmative' },
  { id: 'lets_do_it', text: "Let's do it", type: 'affirmative' },
  { id: 'that_helps', text: "That helps, thanks", type: 'affirmative' },
  { id: 'good_idea', text: "Good idea", type: 'affirmative' },
  { id: 'yes_exactly', text: "Yes, exactly", type: 'affirmative' },
];

const NEGATIVE_REPLIES: SmartReply[] = [
  { id: 'not_really', text: "Not really", type: 'negative' },
  { id: 'maybe_later', text: "Maybe later", type: 'negative' },
  { id: 'not_sure', text: "I'm not sure", type: 'negative' },
  { id: 'different', text: "Something different", type: 'negative' },
];

const QUESTION_REPLIES: SmartReply[] = [
  { id: 'tell_more', text: "Tell me more", type: 'question' },
  { id: 'how_works', text: "How does that work?", type: 'question' },
  { id: 'why_that', text: "Why is that?", type: 'question' },
  { id: 'what_next', text: "What should I do next?", type: 'question' },
  { id: 'example', text: "Can you give an example?", type: 'question' },
];

const EMOTIONAL_REPLIES: SmartReply[] = [
  { id: 'feeling_better', text: "I'm feeling a bit better", type: 'emotional' },
  { id: 'still_struggling', text: "I'm still struggling", type: 'emotional' },
  { id: 'need_moment', text: "I need a moment", type: 'emotional' },
  { id: 'thank_you', text: "Thank you for understanding", type: 'emotional' },
  { id: 'that_resonates', text: "That really resonates", type: 'emotional' },
  { id: 'feeling_heard', text: "I feel heard", type: 'emotional' },
];

const ACTION_REPLIES: SmartReply[] = [
  { id: 'try_now', text: "I'll try that now", type: 'action' },
  { id: 'start_small', text: "Let's start small", type: 'action' },
  { id: 'make_plan', text: "Help me make a plan", type: 'action' },
  { id: 'set_reminder', text: "I'll set a reminder", type: 'action' },
  { id: 'write_down', text: "I'll write that down", type: 'action' },
];

const CONTINUE_REPLIES: SmartReply[] = [
  { id: 'go_on', text: "Go on...", type: 'continue' },
  { id: 'and_then', text: "And then?", type: 'continue' },
  { id: 'continue', text: "Continue", type: 'continue' },
  { id: 'whats_more', text: "What else?", type: 'continue' },
];

const THERAPY_SPECIFIC_REPLIES: SmartReply[] = [
  { id: 'try_exercise', text: "I'll try that exercise", type: 'action' },
  { id: 'feels_hard', text: "This feels hard right now", type: 'emotional' },
  { id: 'ready_to_talk', text: "I'm ready to talk more", type: 'continue' },
  { id: 'need_break', text: "I need a short break", type: 'emotional' },
  { id: 'whats_next_step', text: "What's my next step?", type: 'question' },
];

function detectResponseType(aiResponse: string): string[] {
  const types: string[] = [];
  const lower = aiResponse.toLowerCase();
  
  if (lower.includes('?') || /would you|do you|can you|have you|are you|is there/i.test(lower)) {
    types.push('question_asked');
  }
  
  if (/let's|try|practice|exercise|step|action|plan/i.test(lower)) {
    types.push('action_suggested');
  }
  
  if (/feel|emotion|understand|hear you|sounds like|must be/i.test(lower)) {
    types.push('emotional_support');
  }
  
  if (/option|choice|either|or would you|alternatively/i.test(lower)) {
    types.push('options_given');
  }
  
  if (/breathe|ground|relax|calm|pause|moment/i.test(lower)) {
    types.push('calming');
  }
  
  if (/988|crisis|emergency|help line|support/i.test(lower)) {
    types.push('crisis_resources');
  }
  
  if (/\d\.|1\)|first|second|third|step \d/i.test(lower)) {
    types.push('list_provided');
  }
  
  return types;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateSmartReplies(context: SmartReplyContext): SmartReply[] {
  const { aiResponse, sentiment, therapistMode, crisisDetected } = context;
  const responseTypes = detectResponseType(aiResponse);
  const replies: SmartReply[] = [];
  
  if (crisisDetected) {
    replies.push(
      { id: 'im_safe', text: "I'm safe right now", type: 'affirmative' },
      { id: 'need_help', text: "I need more help", type: 'emotional' },
      { id: 'feeling_little_better', text: "Feeling a little better", type: 'emotional' }
    );
    return replies.slice(0, 3);
  }
  
  if (responseTypes.includes('question_asked')) {
    replies.push(...pickRandom(AFFIRMATIVE_REPLIES, 1));
    replies.push(...pickRandom(NEGATIVE_REPLIES, 1));
  }
  
  if (responseTypes.includes('action_suggested')) {
    replies.push(...pickRandom(ACTION_REPLIES, 1));
  }
  
  if (responseTypes.includes('emotional_support') || sentiment === 'negative' || sentiment === 'slightly_negative') {
    replies.push(...pickRandom(EMOTIONAL_REPLIES, 1));
  }
  
  if (responseTypes.includes('options_given')) {
    replies.push(...pickRandom(AFFIRMATIVE_REPLIES, 1));
  }
  
  if (responseTypes.includes('list_provided')) {
    replies.push(...pickRandom(ACTION_REPLIES, 1));
    replies.push(...pickRandom(QUESTION_REPLIES, 1));
  }
  
  if (therapistMode) {
    replies.push(...pickRandom(THERAPY_SPECIFIC_REPLIES, 1));
  }
  
  if (replies.length < 3) {
    replies.push(...pickRandom(CONTINUE_REPLIES, 1));
    replies.push(...pickRandom(QUESTION_REPLIES, 1));
  }
  
  const uniqueReplies = replies.filter((reply, index, self) => 
    index === self.findIndex(r => r.id === reply.id)
  );
  
  return uniqueReplies.slice(0, 4);
}

export function generateSmartRepliesFromAI(aiResponse: string): SmartReply[] {
  const questionMarks = (aiResponse.match(/\?/g) || []).length;
  
  if (questionMarks >= 2) {
    return [
      { id: 'first_option', text: "The first one", type: 'affirmative' },
      { id: 'second_option', text: "The second one", type: 'affirmative' },
      { id: 'both', text: "Both, actually", type: 'affirmative' },
      { id: 'neither', text: "Neither for now", type: 'negative' },
    ];
  }
  
  return generateSmartReplies({
    aiResponse,
    userMessage: '',
    sentiment: 'neutral',
    therapistMode: false,
    crisisDetected: false
  });
}
