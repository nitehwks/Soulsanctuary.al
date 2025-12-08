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
}

export function redactPII(content: string): RedactionResult {
  let redactedContent = content;
  let wasRedacted = false;

  redactedContent = redactedContent.replace(PII_PATTERNS.email, () => {
    wasRedacted = true;
    return '[EMAIL_REDACTED]';
  });

  redactedContent = redactedContent.replace(PII_PATTERNS.phone, () => {
    wasRedacted = true;
    return '[PHONE_REDACTED]';
  });

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
    originalContent: content
  };
}
