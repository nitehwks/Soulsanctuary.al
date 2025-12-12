# SoulSanctuary.ai - AI Chat Platform with Goal-Oriented Coaching

## Complete Prompt for GitHub Copilot

Use this prompt to recreate the TrustHub application:

---

### Project Overview

Build "SoulSanctuary.ai" - a privacy-first AI chat application with two modes:

1. **Chat Mode**: General AI assistant with memory capabilities
2. **Therapist/Coach Mode**: World-class psychoanalysis-powered goal coaching system

The app should feature:
- Secure authentication (OAuth with Google, GitHub, Apple, X, or email)
- AES-256-GCM encryption for sensitive data
- PII protection (redact SSN/credit cards, store phone/email as contact facts)
- Persistent memory across conversations
- Personality analysis and motivation pattern detection
- Goal tracking and achievement coaching
- Mood/wellness tracking
- GDPR-compliant privacy controls

---

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS v4 for styling
- shadcn/ui component library (New York style)
- Wouter for routing
- TanStack Query (React Query v5) for server state
- Framer Motion for animations

**Backend:**
- Express.js with TypeScript
- Node.js HTTP server
- Drizzle ORM for database operations
- PostgreSQL database

**AI:**
- OpenRouter API (or OpenAI-compatible API)
- Model: cognitivecomputations/dolphin-mistral-24b-venice-edition (or similar)

---

### Database Schema

```typescript
// PostgreSQL with Drizzle ORM

// Sessions (for OAuth)
sessions: {
  sid: varchar (primary key)
  sess: jsonb
  expire: timestamp
}

// Users
users: {
  id: varchar (UUID, primary key)
  username: text
  password: text (optional for OAuth)
  name: text
  email: text (unique)
  firstName: text
  lastName: text
  profileImageUrl: text
  createdAt: timestamp
  updatedAt: timestamp
}

// Conversations
conversations: {
  id: serial (primary key)
  userId: text
  title: text
  mode: text ("chat" | "therapist")
  createdAt: timestamp
  updatedAt: timestamp
}

// Messages
messages: {
  id: serial (primary key)
  conversationId: integer (FK to conversations)
  role: text ("user" | "assistant")
  content: text
  originalContent: text (unredacted version)
  wasObfuscated: boolean
  sentiment: text
  sentimentScore: integer
  keyPhrases: text[]
  timestamp: timestamp
}

// User Context (learned facts)
userContext: {
  id: serial (primary key)
  userId: text
  category: text (Name, Email, Phone, Role, Interest, etc.)
  value: text
  confidence: integer (0-100)
  sentiment: text
  sourceContext: text
  createdAt: timestamp
  updatedAt: timestamp
}

// User Preferences
userPreferences: {
  id: serial (primary key)
  userId: text (unique)
  storeContactInfo: boolean
  privacyLevel: text
  therapistModeEnabled: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

// Mood Observations
moodObservations: {
  id: serial (primary key)
  userId: text
  topic: text
  mood: text
  attitude: text
  intensity: integer (1-10)
  observation: text
  conversationId: integer (FK)
  createdAt: timestamp
}

// Wellness Assessments
wellnessAssessments: {
  id: serial (primary key)
  userId: text
  overallMood: text
  stressLevel: integer
  patterns: text[]
  concerns: text[]
  positives: text[]
  advice: text
  createdAt: timestamp
}

// User Goals
userGoals: {
  id: serial (primary key)
  userId: text
  title: text
  description: text
  category: text (career, health, relationships, financial, personal_growth, creative, lifestyle)
  status: text (active, completed, cancelled)
  priority: integer
  targetDate: timestamp
  progressNotes: text[]
  motivators: text[]
  obstacles: text[]
  strategies: text[]
  milestones: jsonb
  completedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}

// Personality Insights
personalityInsights: {
  id: serial (primary key)
  userId: text
  traitCategory: text (motivation_style, cognitive_style, behavioral_style, etc.)
  trait: text
  strength: integer (0-100)
  evidence: text[]
  implications: text
  coachingApproach: text
  createdAt: timestamp
  updatedAt: timestamp
}

// Motivation Patterns
motivationPatterns: {
  id: serial (primary key)
  userId: text
  patternType: text (deadline, accountability, visualization, fear, excitement, etc.)
  description: text
  triggers: text[]
  responses: text[]
  effectiveStrategies: text[]
  ineffectiveStrategies: text[]
  confidence: integer
  createdAt: timestamp
  updatedAt: timestamp
}

// Coaching Sessions
coachingSessions: {
  id: serial (primary key)
  userId: text
  conversationId: integer (FK)
  focus: text
  insights: text[]
  actionItems: text[]
  breakthroughs: text[]
  resistanceNoted: text
  nextSteps: text
  createdAt: timestamp
}

// Privacy tables: auditLogs, privacyConsents, dataExportRequests, dataDeletionRequests, dataRetentionPolicies
```

---

### Key API Endpoints

```
POST /api/chat - Send message and get AI response
GET /api/conversations?userId={id}&mode={mode} - Get user's conversations
POST /api/conversations - Create new conversation
GET /api/messages/{conversationId} - Get messages for conversation
GET /api/context/{userId} - Get learned facts about user
GET /api/knowledge/{userId} - Get grouped knowledge with summaries
GET /api/preferences/{userId} - Get user preferences
PUT /api/preferences/{userId} - Update preferences (toggle therapist mode)
GET /api/mood/{userId} - Get mood observations
GET /api/wellness/{userId} - Get wellness assessments
GET /api/privacy/summary/{userId} - Privacy dashboard data
POST /api/privacy/export/{userId} - Export user data (GDPR)
POST /api/privacy/deletion/{userId} - Delete user data
```

---

### Core Features Implementation

#### 1. PII Redaction System

```typescript
// Redact SSN and credit cards, but extract phone/email as facts
function redactPII(content: string) {
  // SSN patterns: XXX-XX-XXXX
  // Credit card: 16 digits
  // Phone: Extract and store as contact
  // Email: Extract and store as contact
}
```

#### 2. Sentiment Analysis

```typescript
// Analyze message sentiment
function analyzeSentiment(content: string) {
  // Returns: positive, slightly_positive, neutral, slightly_negative, negative
  // With score from -10 to 10
}
```

#### 3. Personality Analysis (Therapist Mode)

Detect personality traits from messages:
- Achievement-Oriented vs Affiliation-Oriented
- Autonomy-Driven
- Growth Mindset vs Fixed Mindset
- Perfectionistic tendencies
- Action-Oriented vs Reflective
- External vs Internal motivation
- Risk tolerance

#### 4. Goal Extraction

Detect goals from phrases like:
- "I want to..."
- "My goal is..."
- "I'm trying to..."
- "I hope to..."

#### 5. Motivation Pattern Detection

Identify what motivates the user:
- Deadlines and urgency
- Accountability to others
- Visualization of success
- Fear of loss/failure
- Excitement and anticipation
- Necessity and obligation
- Inspiration from role models

---

### Therapist Mode System Prompt

```
You are SoulSanctuary.ai AI, a world-class performance coach and psychoanalyst. Your role is to help users achieve their goals by deeply understanding their personality, motivation patterns, and psychological drivers. You combine:

- PSYCHOANALYTIC INSIGHT: You notice patterns, defenses, and unconscious motivations
- COACHING EXCELLENCE: You ask powerful questions and hold users accountable to their goals
- MOTIVATIONAL MASTERY: You understand what drives each person and use it strategically
- EMPATHETIC PRESENCE: You create a safe space for honest self-exploration

PSYCHOANALYTIC TECHNIQUES:
1. Listen for unconscious patterns - what do they repeatedly say or avoid saying?
2. Notice resistance - when they deflect, minimize, or rationalize, explore gently
3. Identify projections - are they attributing their fears/desires to external factors?
4. Explore the secondary gain - what benefit might they get from NOT achieving their goal?
5. Connect present patterns to past experiences when relevant

MOTIVATIONAL STRATEGIES:
1. Meet them where they are emotionally before pushing forward
2. Use their natural motivation style (based on personality profile)
3. Reframe obstacles as information, not barriers
4. Create small wins to build momentum and self-efficacy
5. Help them articulate their "why" at the deepest level

COACHING APPROACH:
1. Ask powerful questions rather than giving advice
2. Reflect back patterns you notice
3. Challenge limiting beliefs with curiosity, not confrontation
4. Celebrate progress and effort, not just outcomes
5. Hold them capable while being compassionate about struggle
6. Always connect actions back to their stated goals and values
```

---

### Frontend Components

1. **Landing Page** - For logged-out users with sign-in options
2. **Home Page** - Main chat interface with:
   - Chat/Therapist mode toggle tabs
   - Message input with voice support
   - Conversation sidebar
   - "What do you know about me?" button
3. **Knowledge Panel** - Slide-out panel showing:
   - Grouped facts by category
   - Summaries and keywords
   - Click to expand details
4. **Privacy Dashboard** - Accessible via Shield icon:
   - Consent management
   - Data export
   - Data deletion
   - Audit logs
5. **System Status Sidebar** - Shows:
   - Database connection status
   - AI status
   - Privacy protocols active

---

### Environment Variables

```
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret-key
AI_INTEGRATIONS_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_INTEGRATIONS_OPENROUTER_API_KEY=your-api-key
```

---

### File Structure

```
/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── ConversationList.tsx
│   │   │   │   ├── KnowledgePanel.tsx
│   │   │   │   ├── MemoryPanel.tsx
│   │   │   │   ├── WellnessPanel.tsx
│   │   │   │   └── PrivacyDashboard.tsx
│   │   │   ├── layout/
│   │   │   └── ui/ (shadcn components)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── use-toast.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Settings.tsx
│   │   ├── lib/
│   │   │   └── queryClient.ts
│   │   └── App.tsx
│   └── index.html
├── server/
│   ├── lib/
│   │   ├── pii-redactor.ts
│   │   ├── wellness-analyzer.ts
│   │   ├── coaching-analyzer.ts
│   │   ├── encryption.ts
│   │   └── audit-logger.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── replitAuth.ts (or your auth solution)
│   └── index.ts
├── shared/
│   └── schema.ts (Drizzle schema)
├── db/
│   └── index.ts (database connection)
└── package.json
```

---

### Authentication Notes

For authentication, you can use:
1. **Replit Auth** - If deploying on Replit (uses OpenID Connect)
2. **Passport.js** - With strategies for Google, GitHub, Apple, etc.
3. **NextAuth.js** - If using Next.js
4. **Clerk or Auth0** - Third-party auth services

The current implementation uses Replit Auth which requires:
- Session middleware with PostgreSQL session store
- OpenID Connect client configuration
- Callback handling at `/api/callback`

If you see "Invalid authentication request" error, ensure:
1. OAuth provider is properly configured
2. Callback URLs match your domain
3. Session secret is set
4. Database tables for sessions exist

---

### Running the App

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will run on port 5000 by default.

---

### Key Design Decisions

1. **Privacy First**: All sensitive data encrypted, PII redacted, audit trails maintained
2. **Dual Mode**: Chat mode for general assistance, Therapist mode for goal coaching
3. **Shared Context**: Both modes access the same learned facts and user context
4. **Psychoanalytic Approach**: Therapist mode uses psychological insights to understand motivation
5. **Goal-Oriented**: Focus on helping users achieve their goals, not just emotional support
6. **Memory Persistence**: AI remembers everything across sessions
7. **Personality Profiling**: System learns user's personality traits over time
8. **Motivation Mapping**: Identifies what drives each user and uses it strategically

---

This document provides everything needed to recreate SoulSanctuary.ai in GitHub Copilot or any other AI coding assistant.
