# LangDuel - Competitive Language Learning Platform

## Overview
LangDuel is an AI-powered, competitive language learning platform designed to gamify language acquisition. It enables users to engage in themed conversations with opponents or AI bots, receive instant AI feedback on their performance, and track their progress through an Elo-ranked competitive system. The platform aims to transform language learning into an engaging, measurable experience akin to competitive online gaming. Key features include real-time multiplayer duels, AI-generated vocabulary for dynamic matches, a comprehensive Elo ranking system inspired by Chess.com, and a fully responsive user interface across devices.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, using **Vite** for optimized builds. **Wouter** handles client-side routing, and **TanStack Query** manages server state. The UI leverages **shadcn/ui** (built on Radix UI) and **Tailwind CSS** for styling, adhering to a Chess.com-inspired dark theme with high contrast and monospace fonts for a competitive aesthetic. State is managed with React hooks, localStorage for guest mode persistence, and TanStack Query for server data. Key UI patterns include a real-time conversation interface, timer-based match mechanics, AI-graded scoring, leaderboards, and practice mode with topic selection.

### Backend Architecture
The backend uses **Express.js** with **Node.js** and **TypeScript** (ESM modules). It features a middleware pipeline for logging, JSON parsing, and error handling. RESTful APIs are designed for authentication, grading, and bot interactions, using JSON for requests/responses and **Zod** for schema validation. An in-memory `MemStorage` handles user management for development and guest mode, designed to be swapped with a database. **OpenAI GPT-4o** is integrated for conversation grading and bot response generation, utilizing structured prompt engineering for consistent evaluation and JSON-formatted responses. WebSocket is implemented for real-time multiplayer matchmaking with Elo-based pairing and AI bot fallback.

### System Design Choices
- **Practice vs Competitive Modes**: 
  - **Practice Mode** (via "Practice with AI Bot" button): No Elo changes, opponent Elo hidden, risk-free learning
  - **Competitive Mode** (via "Find Match" button): Full Elo changes apply (even for bot opponents), opponent Elo visible
  - The `isPracticeMode` flag distinguishes modes independent of opponent type (bot or human)
- **Real Multiplayer Matchmaking**: WebSocket-based matchmaking pairs players by Elo, language, and difficulty, with AI bot fallback.
- **AI-Generated Vocabulary**: OpenAI GPT-4o dynamically generates vocabulary based on topic and difficulty for each match, enhancing replayability.
- **Elo Ranking System**: Implements a standard Elo calculation (K-factor=32) with proper expected score formula: `1 / (1 + 10^((opponentElo - userElo)/400))`. Elo changes are calculated once in `handleResultsContinue` to prevent double updates.
- **Competitive Bot Matches**: Bot opponents from "Find Match" are treated as competitive with full Elo changes, human-like names (Emma Chen, Lucas Rodriguez), and varied stats (70-95% per category).
- **Difficulty & Penalty System**: Features Easy, Medium, and Hard difficulties with varying timers, round counts. A 20-point penalty for skipping questions is applied; viewing vocabulary definitions incurs no penalty.
- **Expanded Theme System**: Includes 21 comprehensive themes with difficulty-specific vocabulary and full language support (Chinese, Spanish, Italian). Competitive matches use random topics.
- **Turn-Based Q&A**: Structured turn-based conversation flow with bot asking first, user answering, user asking, and bot answering, with question deduplication.
- **Mobile Responsiveness**: Fully responsive UI with mobile-optimized typing interface and scrollable slide-out navigation.
- **Loading State Protection**: All action buttons implement loading states with disabled states to prevent duplicate actions (rapid clicking, simultaneous requests).
- **Elo Calculation Consistency**: Both MatchResults display and handleResultsContinue use identical Elo formula to ensure displayed changes match applied changes. handleForfeit does NOT update Elo directly; all updates happen in handleResultsContinue.
- **Forfeit Behavior**: Forfeiting a match counts as a LOSS (user scores set to 0, lower than bot's 70-95 range), applies standard Elo changes. Forfeits now appear in match history with a "Forfeit" indicator badge but still do NOT contribute to skill progress calculations (Grammar, Fluency, Vocabulary, Naturalness remain unaffected).
- **Guest Mode Restrictions**: Guest users do not see "Recent Matches" or "Skill Progress" sections (hidden via `isAuthenticated` conditionals). Guest stats are stored in localStorage while authenticated users use PostgreSQL.

## External Dependencies

### AI Services
- **OpenAI API (GPT-4o)**: Used for conversation grading (Grammar, Fluency, Vocabulary, Naturalness), contextual bot responses, and dynamic vocabulary generation.

### Database
- **Neon Postgres via `@neondatabase/serverless`**: Serverless PostgreSQL for persistent storage.
- **Drizzle ORM**: Type-safe SQL query builder for database interactions.
- **Tables**: `Sessions` (Replit Auth data), `Users` (user profiles), `UserLanguageStats` (language-specific stats), `Matches` (match history with isForfeit flag).
- **drizzle-kit**: For schema migrations.

### UI Component Libraries
- **Radix UI**: Headless components for accessibility.
- **Lucide React**: Icon library.
- **class-variance-authority & clsx**: For dynamic CSS class composition.
- **pinyin-pro**: For Chinese pinyin romanization.
- **date-fns**: Date manipulation utilities.

### Form & Validation
- **React Hook Form**: For form state management.
- **Zod**: Runtime type validation and schema definition.
- **drizzle-zod**: Database schema to Zod schema conversion.

### Authentication & Session Management
- **Replit Auth (OpenID Connect)**: OAuth provider supporting Google, GitHub, X, Apple, email/password.
- **openid-client**: OpenID Connect client library.
- **Passport.js**: Authentication middleware for Express.
- **express-session**: Session management with `connect-pg-simple` for PostgreSQL store.
- **memoizee**: Caching OIDC configuration.