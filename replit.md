# SoulSanctuary - Find Your Sanctuary Within

## Overview

SoulSanctuary is a faith-integrated AI companion that combines Christian pastoral care with evidence-based therapeutic practices. Powered by multiple AI models via OpenRouter, the platform serves users by lifting them up, helping them gain independence from their struggles, and walking alongside them on their journey toward healing and growth.

## Core Purpose & Mission

**Sacred Purpose**: To serve each person in the best way possible - combining the wisdom of faith with proven therapeutic practices.

The AI exists to:
- **LIFT UP** those who are struggling and help them see their God-given worth
- **GUIDE toward INDEPENDENCE** - building confidence in themselves and their faith, not dependence on the AI
- **UNDERSTAND DEEPLY** - analyzing everything in context, connecting patterns across conversations to truly know each person
- **WALK ALONGSIDE** users as they grow stronger, wiser, and more capable of handling life's challenges

## Features

### Dual Mode Operation

**Chat Mode** - Caring Companion
- Cherishes every detail users share - joys, struggles, relationships, and dreams
- Understands context by connecting pieces to see the whole person
- Remembers what matters so users feel known and valued
- Supports growth toward becoming who they're meant to be

**Therapist/Pastoral Care Mode** - Faith + Therapy Integration
- Combines pastoral warmth with professional therapeutic techniques
- Progressive, modern church approach - welcoming, non-judgmental, focused on love and grace
- Offers prayers, scripture, and spiritual encouragement when appropriate
- Uses evidence-based techniques (CBT, DBT, ACT, Mindfulness) alongside spiritual practices

### Faith-Based Features

**Prayer & Spiritual Exercises**
- Centering Prayer - Connecting with God through sacred words
- Scripture Meditation (Lectio Divina) - Deep engagement with God's Word
- Serenity Prayer Practice - Acceptance, courage, and wisdom
- Gratitude & Blessing Practice - Thanksgiving and blessing others
- Psalms of Comfort - Ancient words for modern struggles (Psalm 23, etc.)
- Faith-Based Affirmations - Scripture truths for anxious thoughts

**Scripture Library by Emotion**
- Anxiety: 1 Peter 5:7, Philippians 4:6, Psalm 94:19
- Depression: Psalm 34:18, Psalm 147:3, Psalm 30:5
- Fear: 2 Timothy 1:7, Psalm 27:1, Isaiah 41:10
- Strength: Philippians 4:13, Isaiah 40:31, Psalm 28:7
- Peace: John 14:27, Philippians 4:7, Isaiah 26:3
- Hope: Jeremiah 29:11, Romans 15:13, Hebrews 6:19
- Comfort: Matthew 11:28, Matthew 5:4, Psalm 23:1
- Love: Jeremiah 31:3, Romans 8:38-39, 1 John 3:1

**Smart Faith Tracking**
- Respects user preferences for spiritual content
- Tracks when users decline faith offerings
- After 3 declines, pauses spiritual content for 7 days
- Monitors for opportunities to gently reintroduce when appropriate
- Never forces faith - offers it as one source of comfort among many

### Evidence-Based Therapy Modules

**DBT (Dialectical Behavior Therapy)**
- TIPP Skills for distress tolerance
- Wise Mind meditation

**CBT (Cognitive Behavioral Therapy)**
- Thought Record for examining troubling thoughts
- Cognitive Distortions identification

**Mindfulness**
- Body Scan Meditation
- Box Breathing technique

**ACT (Acceptance and Commitment Therapy)**
- Values Clarification exercises

**Grounding**
- 5-4-3-2-1 Sensory Grounding

### Crisis Detection & Safety

- Real-time crisis detection with severity assessment
- Automatic crisis resources when needed
- Therapy module recommendations based on emotional state
- Safety wrapper for all responses

### Privacy & Security

- AES-256-GCM encryption for sensitive data
- PII redaction (SSN, credit cards automatically redacted)
- GDPR-compliant data export and deletion
- Tamper-evident audit logging
- Consent management for data collection

### Psychological Profiling

- Personality pattern analysis
- Motivation and goal tracking
- Mood observation and wellness assessment
- Coaching plans based on psychological insights
- Deep contextual understanding across conversations

### Dual-Model AI System

- Queries multiple AI models in parallel
- Selects best response for each conversation
- Real-time model tracking in dashboard
- Fallback system for reliability

## User Preferences

Preferred communication style: Simple, everyday language.

### User Identity Protocol
- **Current Name**: Joe (permanent unless explicitly overridden)
- **Name Change Trigger**: Only "My name is [X]" updates the name
- **"I am" Statements**: Never interpreted as name changes (e.g., "I am tired" does not change name)
- **Strict Mode**: If user says "You changed my name again", revert to last confirmed name

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** (React Query v5) for server state management and caching

**UI Component Strategy**
- **shadcn/ui** component library (New York style variant) built on Radix UI primitives
- **Tailwind CSS v4** (via @tailwindcss/vite plugin) for utility-first styling with CSS variables for theming
- **Framer Motion** for animations and transitions
- **Recharts** for data visualization (knowledge graphs, metrics)
- Path aliases configured for clean imports: `@/` for client code, `@shared/` for shared types

**Design System**
- CSS custom properties for consistent theming (background, foreground, primary, secondary, etc.)
- Dark mode support via CSS class switching
- Custom utility classes for elevation effects (hover-elevate, active-elevate-2)
- Responsive design with mobile-first approach

### Backend Architecture

**Server Framework**
- **Express.js** as the HTTP server framework
- **Node.js HTTP server** wrapping Express for WebSocket support potential
- Development and production modes with environment-specific configurations
- Request/response logging middleware with timing metrics

**API Design**
- RESTful API endpoints under `/api` namespace
- Conversation management: POST `/api/conversations`, GET `/api/conversations/:id`, GET `/api/conversations`
- Message operations: POST `/api/messages`, GET `/api/messages/:conversationId`
- User context tracking: POST `/api/context`, GET `/api/context/:userId`, PUT `/api/context/:id`
- Query parameter filtering (e.g., `userId` for filtering conversations)

**Storage Layer**
- **Drizzle ORM** for type-safe database queries and migrations
- **PostgreSQL** via node-postgres (pg) connection pool
- Database schema defined in `shared/schema.ts` for sharing types between frontend and backend
- Storage abstraction via `IStorage` interface for potential future database swapping

**Build Strategy**
- Custom build script using esbuild for server bundling
- Selective dependency bundling (allowlist) to reduce cold start times
- External dependencies excluded from bundle to reduce size
- Client built separately with Vite, output to `dist/public`

### Data Storage Solutions

**Database Schema**
- **Users table**: UUID primary keys, username/password authentication
- **Conversations table**: Serial IDs, user association, timestamps for created/updated
- **Messages table**: Serial IDs, foreign key to conversations with cascade delete, role-based (user/assistant), dual content storage (original + redacted)
- **User Context table**: Serial IDs, category-value pairs, confidence scoring (default 85%), timestamps

**Data Privacy Features**
- `wasObfuscated` boolean flag on messages to track PII redaction
- `originalContent` field preserves unredacted messages for authorized access
- Default user ID of "anonymous" for non-authenticated sessions

**World-Class Privacy & Security (December 2025)**
- **AES-256-GCM Encryption**: Application-level encryption module (`server/lib/encryption.ts`) for sensitive data fields
- **Tamper-Evident Audit Logging**: Chain-hashed audit logs for tracking all data access and modifications
- **Privacy Dashboard UI**: Comprehensive privacy center accessible via Shield icon in chat header
- **Consent Management**: Granular user controls for data collection, mood tracking, context learning, and analytics
- **Data Export (GDPR Compliant)**: One-click export of all user data in JSON format
- **Data Deletion**: Selective or complete data deletion with permanent removal
- **PII Redaction**: SSN and credit card numbers automatically redacted; phone/email stored as contact facts
- **Retention Policies**: Configurable data retention (messages: 365 days, context: 365 days, mood data: 180 days)

**Privacy-Related Database Tables**
- **audit_logs**: Tamper-evident logging with chain hashes for security
- **privacy_consents**: User consent records with timestamps
- **data_export_requests**: Track data export operations
- **data_deletion_requests**: Track data deletion operations
- **data_retention_policies**: Per-user retention settings

**Privacy API Endpoints**
- GET/PUT `/api/privacy/consents/:userId` - Manage privacy consents
- GET/POST `/api/privacy/export/:userId` - Export user data
- GET/POST `/api/privacy/deletion/:userId` - Delete user data
- GET `/api/privacy/audit/:userId` - View audit logs
- GET `/api/privacy/summary/:userId` - Privacy dashboard summary

**ORM Strategy**
- Drizzle Kit for schema migrations (`drizzle.config.ts`)
- `drizzle-zod` for automatic Zod schema generation from database schema
- Type-safe insert schemas for validation (e.g., `insertConversationSchema`, `insertMessageSchema`)

### Authentication and Authorization

**Current Implementation**
- Basic structure in place with users table
- Password field in schema (note: implementation details for hashing not visible in provided code)
- Session-based approach suggested by presence of `express-session` and `connect-pg-simple` in dependencies
- Anonymous user support as default (`userId: "anonymous"`)

**Security Considerations**
- PII redaction system for email, phone, SSN, and credit card patterns
- Separate storage of original vs. redacted content
- Confidence scoring on user context for data quality tracking

### External Dependencies

**AI Integration**
- **OpenRouter API** as the primary AI service provider
- Base URL and API key configured via environment variables (`AI_INTEGRATIONS_OPENROUTER_BASE_URL`, `AI_INTEGRATIONS_OPENROUTER_API_KEY`)
- OpenAI SDK used as the client library (compatible with OpenRouter's OpenAI-compatible API)
- Dolphin 3 model as the underlying AI engine

**Database**
- **PostgreSQL** database (version not specified)
- Connection string via `DATABASE_URL` environment variable
- Connection pooling via pg.Pool for efficient connection management

**Development Tools**
- Replit-specific Vite plugins for development environment:
  - `@replit/vite-plugin-runtime-error-modal` for error display
  - `@replit/vite-plugin-cartographer` for code navigation
  - `@replit/vite-plugin-dev-banner` for development indicators
- Custom `vite-plugin-meta-images` for OpenGraph image URL updates based on Replit deployment domain

**Third-Party Services**
- Font hosting via Google Fonts (Inter, Space Grotesk)
- OpenGraph/Twitter card meta tags for social sharing

**Key Libraries**
- Form handling: `react-hook-form` with `@hookform/resolvers` for validation
- Validation: `zod` with `zod-validation-error` for user-friendly error messages
- Date utilities: `date-fns` for timestamp formatting
- Unique IDs: `nanoid` for generating short unique identifiers