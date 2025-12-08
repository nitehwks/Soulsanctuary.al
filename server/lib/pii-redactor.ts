const PII_PATTERNS = {
  email: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
};

export interface RedactionResult {
  redactedContent: string;
  wasRedacted: boolean;
  originalContent: string;
  extractedPII: ExtractedPII;
}

export interface ExtractedPII {
  emails: string[];
  phones: string[];
}

export interface RedactionOptions {
  redactEmails?: boolean;
  redactPhones?: boolean;
  redactSSN?: boolean;
  redactCreditCards?: boolean;
}

const defaultOptions: RedactionOptions = {
  redactEmails: false,
  redactPhones: false,
  redactSSN: true,
  redactCreditCards: true,
};

export function redactPII(content: string, options: RedactionOptions = defaultOptions): RedactionResult {
  let redactedContent = content;
  let wasRedacted = false;
  const extractedPII: ExtractedPII = { emails: [], phones: [] };

  const emailMatches = content.match(PII_PATTERNS.email);
  if (emailMatches) {
    extractedPII.emails = emailMatches;
  }
  
  const phoneMatches = content.match(PII_PATTERNS.phone);
  if (phoneMatches) {
    extractedPII.phones = phoneMatches;
  }

  if (options.redactEmails) {
    redactedContent = redactedContent.replace(PII_PATTERNS.email, () => {
      wasRedacted = true;
      return '[EMAIL_REDACTED]';
    });
  }

  if (options.redactPhones) {
    redactedContent = redactedContent.replace(PII_PATTERNS.phone, () => {
      wasRedacted = true;
      return '[PHONE_REDACTED]';
    });
  }

  redactedContent = redactedContent.replace(PII_PATTERNS.ssn, () => {
    wasRedacted = true;
    return '[SSN_REDACTED]';
  });

  redactedContent = redactedContent.replace(PII_PATTERNS.creditCard, () => {
    wasRedacted = true;
    return '[CARD_REDACTED]';
  });

  return {
    redactedContent,
    wasRedacted,
    originalContent: content,
    extractedPII
  };
}

export function analyzeSentiment(content: string): { sentiment: string; score: number } {
  const lowerContent = content.toLowerCase();
  
  const negativeWords = [
    'frustrated', 'angry', 'upset', 'disappointed', 'annoyed', 'hate', 'terrible',
    'awful', 'horrible', 'bad', 'worst', 'problem', 'issue', 'broken', 'failed',
    'unhappy', 'sad', 'worried', 'anxious', 'stressed', 'confused', 'lost',
    'difficult', 'hard', 'struggling', 'stuck', 'help', 'urgent', 'emergency',
    'complaint', 'refund', 'cancel', 'wrong', 'error', 'mistake', 'never'
  ];
  
  const positiveWords = [
    'happy', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'fantastic',
    'perfect', 'good', 'best', 'thanks', 'thank', 'appreciate', 'grateful',
    'excited', 'pleased', 'satisfied', 'helpful', 'awesome', 'brilliant',
    'nice', 'beautiful', 'enjoy', 'glad', 'success', 'working', 'solved'
  ];

  let negativeCount = 0;
  let positiveCount = 0;

  for (const word of negativeWords) {
    if (lowerContent.includes(word)) negativeCount++;
  }
  
  for (const word of positiveWords) {
    if (lowerContent.includes(word)) positiveCount++;
  }

  const total = negativeCount + positiveCount;
  if (total === 0) {
    return { sentiment: 'neutral', score: 50 };
  }

  const score = Math.round((positiveCount / total) * 100);
  
  if (negativeCount > positiveCount * 2) {
    return { sentiment: 'negative', score };
  } else if (positiveCount > negativeCount * 2) {
    return { sentiment: 'positive', score };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'slightly_negative', score };
  } else if (positiveCount > negativeCount) {
    return { sentiment: 'slightly_positive', score };
  }
  
  return { sentiment: 'neutral', score: 50 };
}

export function extractKeyPhrases(content: string): string[] {
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
    'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
    'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
    'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
    'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
    'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
    'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn',
    'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn'
  ]);

  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }

  const significantWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const phrases: string[] = [];
  const sentences = content.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 10 && trimmed.length < 100) {
      const hasSignificant = significantWords.some(word => 
        trimmed.toLowerCase().includes(word)
      );
      if (hasSignificant) {
        phrases.push(trimmed);
      }
    }
  }

  const combined = [...significantWords.slice(0, 5), ...phrases.slice(0, 3)];
  return Array.from(new Set(combined));
}
