/**
 * SoulSanctuary Platform Configuration
 * 
 * This file is the single source of truth for all platform configuration.
 * Update this file to change settings across the entire application.
 * Keep replit.md documentation in sync with these values.
 * 
 * Last Updated: December 24, 2025
 */

// =============================================================================
// APP IDENTITY
// =============================================================================
export const APP_CONFIG = {
  name: "SoulSanctuary",
  appId: "com.soulsanctuary.ai",
  version: "1.0.0",
  tagline: "Find Your Sanctuary Within",
  description: "A Christian AI companion that combines pastoral care with evidence-based therapy.",
} as const;

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================
export const SERVER_CONFIG = {
  port: 5000,
  host: "0.0.0.0",
  environment: process.env.NODE_ENV || "development",
} as const;

// =============================================================================
// FILE UPLOAD CONFIGURATION
// =============================================================================
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxBase64Size: 15 * 1024 * 1024, // 15MB for base64 encoded
  
  allowedMimeTypes: [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  
  allowedExtensions: [
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".pdf", ".txt", ".doc", ".docx"
  ],
  
  imageDimensions: {
    maxWidth: 4096,
    maxHeight: 4096,
  },
  
  compressionQuality: 0.8,
} as const;

// =============================================================================
// RESPONSIVE BREAKPOINTS (CSS Media Queries)
// =============================================================================
export const BREAKPOINTS = {
  mobile: { max: 480 },
  tablet: { min: 481, max: 768 },
  desktop: { min: 769 },
  largeDesktop: { min: 1024 },
  extraLarge: { min: 1280 },
} as const;

// =============================================================================
// TOUCH & ACCESSIBILITY
// =============================================================================
export const ACCESSIBILITY_CONFIG = {
  minTouchTarget: 44, // 44x44 pixels minimum
  focusRingWidth: 2,
} as const;

// =============================================================================
// DATA RETENTION POLICIES (Days)
// =============================================================================
export const RETENTION_CONFIG = {
  messages: 365,
  context: 365,
  moodData: 180,
  auditLogs: 730, // 2 years
} as const;

// =============================================================================
// PRIVACY & SECURITY
// =============================================================================
export const PRIVACY_CONFIG = {
  encryptionAlgorithm: "aes-256-gcm",
  piiPatterns: {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  },
} as const;

// =============================================================================
// AI CONFIGURATION
// =============================================================================
export const AI_CONFIG = {
  provider: "openrouter",
  defaultModel: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
  visionModel: "google/gemini-2.0-flash-001",
  maxTokens: {
    default: 1500,
    extended: 3000,
    vision: 500,
  },
  temperature: {
    chat: 0.7,
    therapist: 0.6,
  },
} as const;

// =============================================================================
// FAITH INTEGRATION
// =============================================================================
export const FAITH_CONFIG = {
  declineThreshold: 3, // Number of declines before pausing
  pauseDurationDays: 7, // Days to pause after threshold
  defaultEnabled: true,
} as const;

// =============================================================================
// CRISIS DETECTION
// =============================================================================
export const CRISIS_CONFIG = {
  severityLevels: ["none", "low", "moderate", "high", "critical"] as const,
  emergencyResources: [
    { name: "National Suicide Prevention Lifeline", phone: "988" },
    { name: "Crisis Text Line", text: "741741" },
    { name: "National Domestic Violence Hotline", phone: "1-800-799-7233" },
  ],
} as const;

// =============================================================================
// SESSION CONFIGURATION
// =============================================================================
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  checkPeriod: 2 * 60 * 1000, // 2 minutes
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function isValidFileType(mimeType: string): boolean {
  return (UPLOAD_CONFIG.allowedMimeTypes as readonly string[]).includes(mimeType);
}

export function isValidFileExtension(extension: string): boolean {
  return (UPLOAD_CONFIG.allowedExtensions as readonly string[]).includes(extension.toLowerCase());
}

export function isValidFileSize(size: number): boolean {
  return size <= UPLOAD_CONFIG.maxFileSize;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
}

export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
