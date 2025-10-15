# Verbio - Competitive Language Learning Platform

## Overview
Verbio is an AI-powered, competitive language learning platform that gamifies language acquisition. It allows users to engage in themed conversations with opponents or AI bots, receive instant AI feedback, and track progress via a Fluency Score-ranked competitive system. The platform aims to transform language learning into an engaging, measurable experience similar to competitive online gaming, featuring real-time multiplayer duels, AI-generated vocabulary, and a comprehensive Fluency Score ranking system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
The frontend is built with React 18, TypeScript, and Vite. It uses Wouter for routing, TanStack Query for server state, and shadcn/ui with Tailwind CSS for styling. The design adopts a Chess.com-inspired dark theme with high contrast and monospace fonts, focusing on a competitive aesthetic. Key UI patterns include real-time conversation interfaces, timer-based match mechanics, AI-graded scoring, leaderboards, and a fully responsive design for mobile optimization.

### Technical Implementations
The backend uses Express.js with Node.js and TypeScript, featuring RESTful APIs for authentication, grading, and bot interactions. Zod is used for schema validation. An in-memory `MemStorage` handles user management for development and guest modes. OpenAI API is integrated using GPT-4o for accurate conversation grading and GPT-4o-mini for cost-efficient bot question/answer and vocabulary generation. A vocabulary caching system reduces API calls. WebSocket is implemented for real-time multiplayer matchmaking with Fluency Score-based pairing and AI bot fallback.

### Feature Specifications
- **Practice vs. Competitive Modes**: Practice mode offers perfect AI bots with no Fluency Score changes, while Competitive mode applies full Fluency Score changes even against bots.
- **Real Multiplayer Matchmaking**: WebSocket-based matchmaking pairs players by Fluency Score, language, and difficulty, with AI bot fallback. Vocabulary is generated once per match and shared.
- **AI-Generated Vocabulary**: Dynamic vocabulary generation based on topic and difficulty, with 24-hour caching.
- **Fluency Score Ranking System**: Elo-based calculation (K-factor=32) for competitive ranking.
- **Competitive Bot Matches**: Bots have varied stats and Fluency Scores (Beginner: 600-800, Easy: 800-1000, Medium: 1100-1300, Hard: 1300-1600).
- **Difficulty & Penalty System**: Beginner, Easy, Medium, and Hard difficulties with varying timers, rounds, vocabulary words, and lenient to strict grading. A 20-point penalty for skipping questions. **Beginner mode includes hover-to-translate**: hovering over bot messages instantly displays English translations to help absolute beginners understand the conversation. **Beginner mode also includes "Need help?" feature**: a button that generates AI example responses (questions or answers) to help stuck learners, with a 15-point penalty per use. Race condition protection ensures penalties apply only to the correct turn.
- **Real-Time Vocabulary Checklist**: Visual indicator showing which vocabulary words have been typed in the current input, with checkmarks and strikethrough for used words. Works across all difficulties and modes (including online competitive matches). Updates instantly as user types without needing to submit. Gamifies the learning objective by encouraging use of all vocabulary words.
- **Expanded Theme System**: 21 themes with difficulty-specific vocabulary across multiple languages.
- **Turn-Based Q&A**: Structured conversation flow with AI-driven question validation to ensure relevance and answerability.
- **Detailed AI Feedback System**: GPT-4o provides per-message feedback including grammar corrections, vocabulary suggestions, and improvement areas. Feedback is integrated into match history and accessible via UI components.
- **Loading State Protection**: All action buttons have loading and disabled states to prevent duplicate actions.
- **Forfeit Behavior**: Forfeits result in a loss for the forfeiting player and a win for the opponent, affecting Fluency Score. Forfeits are recorded but do not impact skill progress calculations.
- **Guest Mode**: Guest users have limited features (e.g., no "Recent Matches") and are rate-limited to 5 matches per day to manage API costs.
- **Streaks**: Tracks competitive win streaks and daily login streaks, displayed in user profiles.
- **Friend System**: Supports bidirectional friend relationships, friend discovery via email, and display of friend stats (Fluency Score, wins/losses).
- **Private Match Invites**: Authenticated users can create time-limited, unique code-based invites for friends to join private matches.

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o for conversation grading, GPT-4o-mini for bot Q&A and vocabulary generation.

### Database
- **Neon Postgres**: Serverless PostgreSQL for persistent storage.
- **Drizzle ORM**: Type-safe SQL query builder.
- **Tables**: `Sessions`, `Users`, `UserLanguageStats`, `Matches`, `Friends`, `PrivateMatchInvites`.
- **drizzle-kit**: For schema migrations.

### UI Component Libraries
- **Radix UI**: Headless components.
- **Lucide React**: Icon library.
- **class-variance-authority & clsx**: For dynamic CSS.
- **pinyin-pro**: For Chinese pinyin.
- **date-fns**: Date manipulation.

### Form & Validation
- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation.
- **drizzle-zod**: Database schema to Zod.

### Authentication & Session Management
- **Replit Auth (OpenID Connect)**: OAuth provider.
- **openid-client**: OpenID Connect client library.
- **Passport.js**: Authentication middleware.
- **express-session**: Session management with `connect-pg-simple`.