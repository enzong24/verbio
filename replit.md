# Verbio - Competitive Language Learning Platform

## Overview
Verbio is an AI-powered, competitive language learning platform designed to gamify language acquisition. It enables users to participate in themed conversations with opponents or AI bots, receive immediate AI feedback, and track progress through a Fluency Score-ranked competitive system. The platform aims to transform language learning into an engaging, measurable experience reminiscent of competitive online gaming, offering real-time multiplayer duels, AI-generated vocabulary, and a comprehensive Fluency Score ranking system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
The frontend is built with React 18, TypeScript, and Vite, utilizing Wouter for routing, TanStack Query for server state, and shadcn/ui with Tailwind CSS for styling. The design features a Chess.com-inspired dark theme with high contrast and monospace fonts, emphasizing a competitive aesthetic. Key UI elements include real-time conversation interfaces, timer-based match mechanics, AI-graded scoring, leaderboards, an analytics dashboard with progress charts, and a fully responsive design optimized for mobile. Mobile UI includes compact vocabulary badges, collapsible topic headers, smaller message bubbles, and dynamic viewport handling for virtual keyboards. The match UI prioritizes immersion by minimizing distractions. A hamburger menu provides access to profile details, CEFR level explanations, and monthly leaderboards.

### Technical Implementations
The backend uses Express.js with Node.js and TypeScript, providing RESTful APIs for core functionalities. Zod is used for schema validation. OpenAI API (GPT-4o and GPT-4o-mini) is integrated for conversation grading, bot interactions, and vocabulary generation, supported by a caching system. WebSocket facilitates real-time multiplayer matchmaking with Fluency Score-based pairing and AI bot fallback. Bots adjust language complexity based on difficulty and mode, with distinct behaviors for "Practice Mode" (teaching, perfect grammar) and "Competitive Mode" (simulating learners with realistic mistakes). A bot personality system enhances conversations by providing unique backstories and personas.

**Connection & Performance Safeguards**: The system includes WebSocket connection tracking with a 500 concurrent connection limit, automatic cleanup on disconnect/error, user-friendly capacity messages, and database health monitoring with periodic stats logging (every 5 minutes).

### Feature Specifications
- **Practice vs. Competitive Modes**: Practice mode offers perfect AI bots without Fluency Score impact; Competitive mode involves Fluency Score changes, even against bots. Practice matches are excluded from competitive analytics.
- **Real Multiplayer Matchmaking**: WebSocket-based matchmaking pairs players by Fluency Score, language, and difficulty, with AI bot fallback and shared, dynamically generated vocabulary.
- **AI-Generated Vocabulary**: Dynamic vocabulary generation based on topic and difficulty, with 24-hour caching.
- **Fluency Score Ranking System**: An Elo-based system (K-factor=32) for competitive ranking.
- **Competitive Bot Matches**: Bots with varied Fluency Scores (600-1600) and target accuracy ranges (50-90%).
- **Dual Bot System**: Separate sets of 19 bots for Practice Mode (native speakers, perfect fluency) and Competitive Mode (difficulty-rated, unique personalities).
- **Difficulty & Penalty System**: Beginner, Easy, Medium, and Hard difficulties with varying timers and rounds. Consistent grading standards across all difficulties. Features include a 20-point penalty for skipping questions (clearly displayed on skip button), an exclusive Beginner mode skip feature, Practice mode hover-to-translate, and a "Need help?" feature with a 15-point penalty.
- **Quick Rematch System**: After completing a match, clicking "New Match" automatically queues a new game with the same difficulty, language, topic, and mode settings for seamless continuous play.
- **Real-Time Vocabulary Visual Feedback**: Vocabulary badges visually update when typed in the input field, providing instant feedback.
- **Expanded Theme System**: 21 themes with difficulty-specific vocabulary across multiple languages.
- **Turn-Based Q&A**: Structured conversation flow with AI-driven question validation.
- **Ultra-Detailed Premium AI Feedback System**: Premium users receive comprehensive message-by-message analysis, including grammar corrections, vocabulary suggestions, native speaker comparisons, strengths, and study recommendations.
- **Guest Mode**: Limited features for guest users, rate-limited to 5 matches per day.
- **Streaks & Multiplier System**: Tracks competitive win streaks and daily login streaks. Features a streak-based Fluency Score multiplier: +5% per 3-day login streak tier (max +20%), +10% per 2-win streak tier (max +30%), with a total cap of 1.5x. Multipliers apply only to wins, not losses, and are calculated on the backend for consistency.
- **Friend System**: Supports bidirectional friend relationships, discovery, and stat display.
- **Private Match Invites**: Authenticated users can create unique, time-limited code-based invites.
- **Premium Subscription System**: Stripe-powered subscriptions offering unlimited Medium/Hard matches, topic selection in practice mode, and detailed AI feedback for premium users. Free users receive daily limits and two free premium AI feedback matches.
- **Analytics Dashboard**: Comprehensive progress tracking featuring Fluency Score progression, skill distribution, match performance, and AI-powered "Focus Areas" with study recommendations.
- **CEFR Fluency Level System**: Users earn CEFR levels (A1-C2) based on ELO ranges, with level-up celebrations.
- **Monthly Leaderboard Seasons**: Displays current and past monthly rankings based on competitive ELO.

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o (grading), GPT-4o-mini (bot Q&A, vocabulary).

### Database
- **Neon Postgres**: Serverless PostgreSQL.
- **Drizzle ORM**: Type-safe SQL query builder.
- **drizzle-kit**: For schema migrations.

### UI Component Libraries
- **Radix UI**: Headless components.
- **Lucide React**: Icons.
- **class-variance-authority & clsx**: Dynamic CSS.
- **pinyin-pro**: Chinese pinyin.
- **date-fns**: Date manipulation.

### Form & Validation
- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation.
- **drizzle-zod**: Database schema to Zod.

### Authentication & Session Management
- **Passport.js**: Server-side authentication middleware.
- **Google OAuth 2.0**: Direct Google OAuth.
- **Username/Password Auth**: Traditional credential-based authentication with scrypt hashing.
- **PostgreSQL Sessions**: Secure session storage using `connect-pg-simple`.

### Payment Processing
- **Stripe**: Payment processing for subscriptions.
- **@stripe/stripe-js, @stripe/react-stripe-js**: Stripe SDKs.
- **Webhook Integration**: For automatic subscription status updates.