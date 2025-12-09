# Insightful AI - Privacy-First AI Companion

## Overview

Insightful AI is a privacy-focused AI companion powered by multiple AI models via OpenRouter. The platform emphasizes secure, intelligent conversations with built-in PII (Personally Identifiable Information) redaction, contextual learning, evidence-based therapeutic tools (DBT, CBT, Mindfulness, etc.), and goal-oriented coaching. It features a modern React frontend with shadcn/ui components and an Express backend with PostgreSQL database for persistent storage.

## User Preferences

Preferred communication style: Simple, everyday language.

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