# Verbio - Competitive Language Learning Platform

## Overview
Verbio is an AI-powered, competitive language learning platform that gamifies language acquisition. It allows users to engage in themed conversations with opponents or AI bots, receive instant AI feedback, and track progress via a Fluency Score-ranked competitive system. The platform aims to transform language learning into an engaging, measurable experience similar to competitive online gaming, featuring real-time multiplayer duels, AI-generated vocabulary, and a comprehensive Fluency Score ranking system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
The frontend is built with React 18, TypeScript, and Vite. It uses Wouter for routing, TanStack Query for server state, and shadcn/ui with Tailwind CSS for styling. The design adopts a Chess.com-inspired dark theme with high contrast and monospace fonts, focusing on a competitive aesthetic. Key UI patterns include real-time conversation interfaces, timer-based match mechanics, AI-graded scoring, leaderboards, analytics dashboard with progress charts, and a fully responsive design for mobile optimization. **Mobile UI optimizations**: Compact vocabulary badges (text-[10px]), collapsible topic header with toggle button to hide/show vocabulary and turn phase indicator, collapsible help area (accent keyboard + help button) with toggle button, smaller message bubbles (text-sm, reduced padding), hidden topic icon on mobile, accent keyboard hidden on mobile (desktop only), and shorter turn phase indicators to reduce clutter on small screens. **Mobile keyboard handling**: Uses dynamic viewport height (dvh) to prevent page shifting when virtual keyboard appears, viewport meta tag includes `interactive-widget=resizes-content` for proper keyboard behavior, and iOS safe area insets are properly handled.

### Technical Implementations
The backend uses Express.js with Node.js and TypeScript, featuring RESTful APIs for authentication, grading, and bot interactions. Zod is used for schema validation. An in-memory `MemStorage` handles user management for development and guest modes. OpenAI API is integrated using GPT-4o for accurate conversation grading and GPT-4o-mini for cost-efficient bot question/answer and vocabulary generation. A vocabulary caching system reduces API calls. WebSocket is implemented for real-time multiplayer matchmaking with Fluency Score-based pairing and AI bot fallback.

### Feature Specifications
- **Practice vs. Competitive Modes**: Practice mode offers perfect AI bots with no Fluency Score changes, while Competitive mode applies full Fluency Score changes even against bots.
- **Real Multiplayer Matchmaking**: WebSocket-based matchmaking pairs players by Fluency Score, language, and difficulty, with AI bot fallback. Vocabulary is generated once per match and shared.
- **AI-Generated Vocabulary**: Dynamic vocabulary generation based on topic and difficulty, with 24-hour caching.
- **Fluency Score Ranking System**: Elo-based calculation (K-factor=32) for competitive ranking.
- **Competitive Bot Matches**: Bots have varied stats and Fluency Scores (Beginner: 600-800, Easy: 800-1000, Medium: 1100-1300, Hard: 1300-1600).
- **Difficulty & Penalty System**: Beginner, Easy, Medium, and Hard difficulties with varying timers, rounds, and vocabulary words. **Grading standards are consistent across all difficulties** - a score of 70 means the same thing whether you're playing Beginner or Hard mode. A 20-point penalty for skipping questions. **Beginner difficulty skip feature**: In Beginner mode, users can skip both asking questions and answering questions with a -20 point penalty. **Practice mode hover-to-translate**: In practice mode only (all difficulties), hovering over bot messages instantly displays English translations to help learners understand the conversation. **"Need help?" feature available for all difficulties**: a button that generates AI example responses (questions or answers) to help stuck learners, with a 15-point penalty per use. Race condition protection ensures penalties apply only to the correct turn.
- **Real-Time Vocabulary Visual Feedback**: Vocabulary badges at the top are crossed out and greyed out (40% opacity) when typed in the current input. Works across all difficulties and modes (including online competitive matches). Updates instantly as user types without needing to submit. Gamifies the learning objective by providing immediate visual feedback on vocabulary usage.
- **Expanded Theme System**: 21 themes with difficulty-specific vocabulary across multiple languages.
- **Turn-Based Q&A**: Structured conversation flow with AI-driven question validation to ensure relevance and answerability.
- **Ultra-Detailed Premium AI Feedback System**: Premium users receive comprehensive message-by-message analysis with minimum 2-3 grammar corrections, 2-3 vocabulary suggestions, native speaker comparison (showing how a native would say it), 3-4 strengths, and 3-4 study recommendations per message. Token limit increased to 6000 for detailed educational explanations. Free users receive general overall feedback only.
- **Loading State Protection**: All action buttons have loading and disabled states to prevent duplicate actions.
- **Forfeit Behavior**: Forfeits result in a loss for the forfeiting player and a win for the opponent, affecting Fluency Score. Forfeits are recorded but do not impact skill progress calculations.
- **Guest Mode**: Guest users have limited features (e.g., no "Recent Matches") and are rate-limited to 5 matches per day to manage API costs.
- **Streaks**: Tracks competitive win streaks and daily login streaks, displayed in user profiles.
- **Friend System**: Supports bidirectional friend relationships, friend discovery via email, and display of friend stats (Fluency Score, wins/losses).
- **Private Match Invites**: Authenticated users can create time-limited, unique code-based invites for friends to join private matches.
- **Premium Subscription System**: Stripe-powered payment processing for premium memberships. Premium users get unlimited Medium/Hard matches, topic selection in practice mode, and detailed AI feedback. Free users limited to 3 Medium and 2 Hard matches per day. **Free users get 2 daily premium AI feedback matches** - allowing them to experience detailed feedback before upgrading. Webhook integration for automatic subscription status updates.
- **Analytics Dashboard**: Comprehensive progress tracking page accessible from hamburger menu showing: Fluency Score progression over time (line chart), skill distribution pie chart (grammar, fluency, vocabulary, naturalness), recent match performance (last 10 matches), quick stats cards (Fluency Score, win rate, win streak, daily streak), and **Focus Areas** with AI-powered study recommendations. Focus Areas analyzes the last 20 matches with detailed AI feedback to identify patterns in grammar corrections, vocabulary suggestions, and general improvements, displaying top 3 items per category with frequency counts. Uses recharts for visualizations. Guest users see a sign-in prompt instead of analytics.

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
- **Dual Authentication System**: Users can sign in using either Google OAuth or username/password.
- **Google OAuth 2.0**: Direct Google OAuth authentication using redirect-based flow via passport-google-oauth20.
- **Username/Password Auth**: Traditional credential-based authentication using passport-local with secure password hashing (scrypt).
- **Passport.js**: Server-side authentication middleware supporting both authentication strategies.
- **PostgreSQL Sessions**: Secure session storage in database using connect-pg-simple.
- **User Schema**: Supports both google_id (for OAuth) and username/password (for local auth) fields.
- **Sign-In Page**: Tabbed interface at /signin with options for both authentication methods.

### Payment Processing
- **Stripe**: Payment processing for premium subscriptions.
- **@stripe/stripe-js**: Stripe JavaScript SDK for frontend.
- **@stripe/react-stripe-js**: React components for Stripe Elements.
- **Webhook Integration**: Uses express.raw() middleware before express.json() to preserve raw body for signature verification.