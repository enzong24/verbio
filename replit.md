# Verbio - Competitive Language Learning Platform

## Overview
Verbio is an AI-powered, competitive language learning platform designed to gamify language acquisition. It enables users to engage in themed conversations with opponents or AI bots, receive instant AI feedback on their performance, and track their progress through a Fluency Score-ranked competitive system. The platform aims to transform language learning into an engaging, measurable experience akin to competitive online gaming. Key features include real-time multiplayer duels, AI-generated vocabulary for dynamic matches, a comprehensive Fluency Score ranking system inspired by Chess.com, and a fully responsive user interface across devices.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, using **Vite** for optimized builds. **Wouter** handles client-side routing, and **TanStack Query** manages server state. The UI leverages **shadcn/ui** (built on Radix UI) and **Tailwind CSS** for styling, adhering to a Chess.com-inspired dark theme with high contrast and monospace fonts for a competitive aesthetic. State is managed with React hooks, localStorage for guest mode persistence, and TanStack Query for server data. Key UI patterns include a real-time conversation interface, timer-based match mechanics, AI-graded scoring, leaderboards, and practice mode with topic selection.

### Backend Architecture
The backend uses **Express.js** with **Node.js** and **TypeScript** (ESM modules). It features a middleware pipeline for logging, JSON parsing, and error handling. RESTful APIs are designed for authentication, grading, and bot interactions, using JSON for requests/responses and **Zod** for schema validation. An in-memory `MemStorage` handles user management for development and guest mode, designed to be swapped with a database. 

**OpenAI API Integration** (cost-optimized):
- **GPT-4o** for conversation grading (accuracy-critical evaluation)
- **GPT-4o-mini** for bot question/answer generation (cost-efficient, ~80% cheaper)
- **Vocabulary Caching System**: In-memory cache stores up to 5 different vocabulary sets per topic/language/difficulty combination. Cache entries last 24 hours and are randomly selected to provide variety while reducing API calls. When a vocabulary set is requested, the system first checks cache and only generates new vocabulary on cache miss.

WebSocket is implemented for real-time multiplayer matchmaking with Fluency Score-based pairing and AI bot fallback.

### System Design Choices
- **Practice vs Competitive Modes**: 
  - **Practice Mode** (via "Practice with AI Bot" button): Perfect native-level AI bot speaks with 0 mistakes, no Fluency Score changes, no win/loss display, shows only player performance and feedback
  - **Competitive Mode** (via "Find Match" button): Full Fluency Score changes apply (even for bot opponents), opponent Fluency Score visible, win/loss comparison shown
  - The `isPracticeMode` flag distinguishes modes independent of opponent type (bot or human)
  - Practice mode bots are generated with isPracticeMode=true flag, resulting in perfect grammar, vocabulary, and native-level responses for optimal learning
- **Real Multiplayer Matchmaking**: WebSocket-based matchmaking pairs players by Fluency Score, language, and difficulty, with AI bot fallback after 10-second timeout. Random turn order determines who starts first when two players match. Both players play with the same language, difficulty, topic, and vocabulary (vocabulary is generated once for player1's settings and shared with both players). Players communicate in real-time via WebSocket message relay.
  - **WebSocket Lifecycle Management**: App.tsx owns and manages the multiplayer WebSocket connection, persisting it across DuelInterface mounts/unmounts with a 30-second timeout to wait for opponent grading results. DuelInterface uses `multiplayerWsRef` for ALL multiplayer operations (player_message, player_turn_complete, player_forfeit, player_grading_result) to avoid staleness issues.
  - **Vocabulary Sharing in Multiplayer**: Server generates vocabulary once in matchmaking.ts and sends it in the WebSocket match_found message. Frontend receives vocabulary from useMatchmaking.ts, which is passed through MatchFinder to App.handleMatchFound. When vocabularyFromServer is provided, the frontend skips the /api/generate-vocabulary API call entirely, eliminating duplicate generation for human vs human matches.
- **AI-Generated Vocabulary**: OpenAI GPT-4o-mini dynamically generates vocabulary based on topic and difficulty, with results cached for 24 hours to reduce costs and improve performance.
- **Fluency Score Ranking System**: Implements a standard Elo calculation (K-factor=32) with proper expected score formula: `1 / (1 + 10^((opponentElo - userElo)/400))`. Fluency Score changes are calculated once in `handleResultsContinue` to prevent double updates.
- **Competitive Bot Matches**: Bot opponents from "Find Match" are treated as competitive with full Fluency Score changes, human-like names (Emma Chen, Lucas Rodriguez), and varied stats (70-95% per category). Bot Fluency Scores reflect difficulty level:
  - Beginner bots: 600-800 Elo
  - Easy bots: 800-1000 Elo
  - Medium bots: 1100-1300 Elo
  - Hard bots: 1300-1600 Elo
- **Difficulty & Penalty System**: Features Beginner, Easy, Medium, and Hard difficulties with varying timers, round counts, vocabulary words. A 20-point penalty for skipping questions is applied; viewing vocabulary definitions incurs no penalty.
  - **Beginner**: 2 rounds, 120s per turn, 2 vocab words, bot Elo 600-800, bot accuracy 40-55% (many mistakes, English mixing), extremely lenient grading (80-95+ for any attempt)
  - **Easy**: 3 rounds, 90s per turn, 3 vocab words, bot Elo 800-1000, bot accuracy 60-70% (basic mistakes), very forgiving grading (70-90+ for genuine attempts)
  - **Medium**: 4 rounds, 60s per turn, 5 vocab words, bot Elo 1100-1300, bot accuracy 65-75% (moderate mistakes), balanced grading
  - **Hard**: 5 rounds, 30s per turn, 8 vocab words, bot Elo 1300-1600, bot accuracy 70-80% (subtle mistakes), strict grading standards
- **Expanded Theme System**: Includes 21 comprehensive themes with difficulty-specific vocabulary and full language support (Chinese, Spanish, Italian). Competitive matches use random topics.
- **Turn-Based Q&A**: Structured turn-based conversation flow with bot asking first, user answering, user asking, and bot answering, with question deduplication. Question validation ensures questions are answerable and topic-related while being supportive of language learners - rejects off-topic, nonsensical, or unanswerable questions (uses gpt-4o-mini for cost optimization).
- **Mobile Responsiveness**: Fully responsive UI with mobile-optimized typing interface and scrollable slide-out navigation.
- **Loading State Protection**: All action buttons implement loading states with disabled states to prevent duplicate actions (rapid clicking, simultaneous requests).
- **Fluency Score Calculation Consistency**: Both MatchResults display and handleResultsContinue use identical Fluency Score formula to ensure displayed changes match applied changes. handleForfeit does NOT update Fluency Score directly; all updates happen in handleResultsContinue.
- **Forfeit Behavior**: 
  - When YOU forfeit: You lose (user scores set to 0), standard Fluency Score loss applies
  - When OPPONENT forfeits: You win (user scores set to 90, opponent scores to 0), you gain Fluency Score
  - Forfeits appear in match history with "Forfeit" indicator badge but do NOT contribute to skill progress calculations (Grammar, Fluency, Vocabulary, Naturalness remain unaffected)
  - **Forfeit UI Display**: Both winner and loser see a simple "Match ended by forfeit" message (no score comparison or performance breakdown) when any player forfeits. MatchResults checks `isForfeit` flag which is set to true for both players when match ends by forfeit
- **Human vs Human Match Results**: For human matches, both players' scores are exchanged via WebSocket and displayed in a comparison table. MatchResults shows side-by-side score comparison for both human and bot matches. Win/loss is determined by score comparison - whoever has the higher overall score wins.
- **Guest Mode Restrictions**: Guest users do not see "Recent Matches" or "Skill Progress" sections (hidden via `isAuthenticated` conditionals). Guest stats are stored in localStorage while authenticated users use PostgreSQL.
- **Guest Rate Limiting**: Guest accounts are limited to 5 matches per day (resets at midnight) to prevent API cost abuse. The limit is tracked in localStorage via `guestRateLimit.ts` utility. When limit is reached, guests see a prominent alert prompting them to sign in for unlimited access. Both competitive and practice matches count toward the limit.
- **Win Streaks & Daily Login Streaks**: 
  - **Win Streak**: Tracks consecutive competitive wins (resets on loss), updates on match completion. Both current and best (lifetime high) win streaks are stored per language. Forfeits do not affect streak calculations.
  - **Daily Login Streak**: Increments on first stats fetch each day (consecutive calendar days), resets if a day is missed. Tracks current and best streaks.
  - Both displayed in ProfileStats with Flame (win streak) and Calendar (daily login) icons.
- **Friend System**: 
  - **Bidirectional Relationships**: Friend requests create pending relationships, acceptance makes them bidirectional (both users see each other as friends).
  - **Authorization**: Accept/reject operations verify the authenticated user is the request recipient. Remove operation allows either friendship participant to end the relationship.
  - **Friend Discovery**: Users send requests by email address, view pending requests, and see friend lists with Fluency Score stats.
  - **Friend Stats Viewing**: Friends page displays each friend's Fluency Score, wins, and losses for their primary language.
- **Private Match Invites**: 
  - **Invite Creation**: Authenticated users create invites with language/difficulty/topic settings, generating unique 6-character codes valid for 24 hours.
  - **Friend-Only Access**: Join endpoint verifies an active friendship exists between invite creator and joiner before allowing match access.
  - **Authorization Checks**: Prevents self-joins, validates invite expiry and status (pending/used), marks invites as used upon successful join.
  - **UI Integration**: Friends page includes invite creation with code display/copy functionality and join-by-code input. Frontend mutation handles validation errors (invalid code, expired, not friends, already used).
  - **Future Enhancement**: Returned matchData (opponentId, language, difficulty, topic) ready for WebSocket/DuelInterface integration to enable true friend-vs-friend matches.

## External Dependencies

### AI Services
- **OpenAI API**: Uses a cost-optimized dual-model approach:
  - **GPT-4o**: Conversation grading (Grammar, Fluency, Vocabulary, Naturalness) for accuracy-critical evaluation
  - **GPT-4o-mini**: Bot question/answer generation and vocabulary generation (80% cheaper while maintaining quality)

### Database
- **Neon Postgres via `@neondatabase/serverless`**: Serverless PostgreSQL for persistent storage.
- **Drizzle ORM**: Type-safe SQL query builder for database interactions.
- **Tables**: 
  - `Sessions`: Replit Auth session data
  - `Users`: User profiles with authentication info
  - `UserLanguageStats`: Language-specific stats including Fluency Score, wins/losses, skill progress, and streaks (currentWinStreak, bestWinStreak, currentDailyLoginStreak, bestDailyLoginStreak, lastLoginDate)
  - `Matches`: Match history with scores, isForfeit flag, and match metadata
  - `Friends`: Friendship relationships with status (pending/accepted), supporting bidirectional friend connections
  - `PrivateMatchInvites`: Private match invites with unique codes, creator, settings, expiry, and status tracking
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