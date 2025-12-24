# SoulSanctuary - Find Your Sanctuary Within

## Overview

SoulSanctuary is a Christian faith-integrated AI companion that combines pastoral care with evidence-based therapeutic practices. Powered by multiple AI models via OpenRouter, the platform serves users by providing spiritual guidance, emotional support, and tools for personal growth. The core purpose is to uplift individuals, foster independence from struggles, and facilitate healing through a blend of faith-based principles and therapeutic techniques. While offering Christian content, the platform allows users to disable faith features for secular support.

## User Preferences

Preferred communication style: Simple, everyday language.

### User Identity Protocol
- **Name Source**: User's name comes from their Replit Auth sign-up (firstName field)
- **Owner Exception**: Joe Abbott (joe_abbott@me.com) is always addressed as "Joe"
- **All Other Users**: Use the name they provided during sign up
- **Name Change Trigger**: Only "My name is [X]" updates the name in conversation
- **"I am" Statements**: Never interpreted as name changes (e.g., "I am tired" does not change name)

## System Architecture

### UI/UX Decisions
The frontend uses **React 18** with TypeScript, **Vite** for fast development, and **Wouter** for routing. **shadcn/ui** (New York style) built on Radix UI, **Tailwind CSS v4**, and **Framer Motion** provide a modern, responsive design with dark mode support. **Recharts** is used for data visualization. Mobile-first responsive design is implemented with specific CSS breakpoints and utilities for touch targets and safe areas.

### Technical Implementations
The backend is built with **Express.js** and Node.js. It features a RESTful API for conversations, messages, and user context. Data is stored in **PostgreSQL** using **Drizzle ORM** for type-safe queries and migrations. A custom build script using **esbuild** handles server bundling. The system employs a **dual-model AI system** that queries multiple AI models via OpenRouter, selecting the best response. Crisis detection and safety protocols are integrated, along with psychological profiling capabilities.

### Feature Specifications
SoulSanctuary operates in two modes: "Chat Mode" for general companionship and "Therapist/Pastoral Care Mode" for integrated faith and therapy.
**Faith-Based Features** include prayer, scripture meditation, and a scripture library categorized by emotion. Users can disable faith content, after which the AI will pause spiritual offerings for 7 days if declined three times.
**Evidence-Based Therapy Modules** include techniques from DBT (TIPP, Wise Mind), CBT (Thought Record, Cognitive Distortions), ACT (Values Clarification), Mindfulness (Body Scan, Box Breathing), and Grounding (5-4-3-2-1).

### System Design Choices
**Data Storage:** The PostgreSQL database schema includes tables for Users, Conversations, Messages, and User Context. Messages include `wasObfuscated` and `originalContent` fields to support PII redaction.
**Privacy & Security:** Features include AES-256-GCM encryption, tamper-evident audit logging, a privacy dashboard UI, granular consent management, GDPR-compliant data export and deletion, PII redaction for sensitive information, and configurable data retention policies.
**Authentication:** A basic user authentication structure is in place, with anonymous user support as default.

## External Dependencies

- **AI Integration:** **OpenRouter API** is the primary AI service provider, utilizing the Dolphin 3 model and accessible via the OpenAI SDK.
- **Database:** **PostgreSQL** is used for data storage, with connection pooling.
- **Frontend Libraries:**
    - `react-hook-form` and `@hookform/resolvers` for form handling.
    - `zod` and `zod-validation-error` for validation.
    - `date-fns` for date utilities.
    - `nanoid` for generating unique IDs.
- **Development Tools (Replit specific):**
    - `@replit/vite-plugin-runtime-error-modal`
    - `@replit/vite-plugin-cartographer`
    - `@replit/vite-plugin-dev-banner`
    - `vite-plugin-meta-images`
- **Third-Party Services:**
    - **Google Fonts** (Inter, Space Grotesk) for typography.
    - **Stripe** (version 2.0.0) for payment processing.
- **Environment Variables Required:** `DATABASE_URL`, `AI_INTEGRATIONS_OPENROUTER_API_KEY`, `AI_INTEGRATIONS_OPENROUTER_BASE_URL`, `SESSION_SECRET`.
```