# LangDuel - Competitive Language Learning Platform

## Overview

LangDuel is an AI-powered, competitive language learning platform that gamifies language acquisition through Elo-ranked duels. Users engage in themed conversations with opponents or AI bots, receive instant AI feedback on their performance, and track their progress through a competitive ranking system. The platform transforms language learning from passive study into an engaging, measurable experience similar to competitive gaming platforms like Chess.com.

## Recent Updates (October 12, 2025)

**Turn-Based Q&A System**
- Completely refactored conversation system to structured turn-based Q&A format
- Bot asks the first question using vocabulary words
- User answers OR clicks "Don't Know" button to skip
- User then asks a question using vocabulary words
- Bot answers the user's question
- Alternating pattern continues for 5 rounds
- Turn phase indicators guide users through each step

**Expanded Theme System**
- Added 13 comprehensive themes: Travel, Food, Business, Family, Technology, Health, Education, Entertainment, Nature, Shopping, Sports, Weather, Social
- Each theme has difficulty-specific vocabulary (Easy, Medium, Hard)
- Vocabulary counts optimized by difficulty: 3 words for Easy, 5 words for Medium, 7 words for Hard
- Full language support for Chinese (with pinyin), Spanish, and Italian
- Random theme selection for each match with appropriate vocabulary

**Authentication & Guest Mode**
- Implemented Replit Auth integration for user sign-in/sign-out with Google, GitHub, X, Apple, and email/password
- Added guest mode allowing users to play without signing in, persisted via localStorage
- Landing page for logged-out users with "Sign In" and "Play as Guest" options
- Auth endpoint returns `null` for unauthenticated users (no 401 blocking)
- Profile images displayed in header for authenticated users
- Logout button appears for authenticated users

**Difficulty Level System**
- Added difficulty selection (Easy, Medium, Hard) to match finder
- Difficulty affects vocabulary complexity, bot question/answer complexity, and grading standards
- Easy: Simple vocabulary, basic structures, encouraging grading
- Medium: Conversational flow, balanced grading expectations
- Hard: Advanced vocabulary, idioms, complex structures, strict grading
- Difficulty parameter integrated into all AI endpoints

**AI Integration & Prompts**
- Restored OpenAI GPT-4o for all grading, questions, and answers
- Created dedicated endpoints for Q&A format:
  - POST `/api/bot-question` - Generates questions using vocabulary
  - POST `/api/bot-answer` - Generates answers to user questions
- Context-aware grading prompts adjust expectations based on difficulty level
- Bot questions and answers adapt to difficulty and incorporate target vocabulary
- Maintained JSON-structured responses for reliable parsing

**UI & Navigation Changes**
- Removed practice mode from navigation (focus on competitive duels only)
- Added "Don't Know" button to skip difficult questions during answer phase
- Updated initial player Elo from 1547 to 1000
- Initial match history set to 0 wins/losses
- Turn phase indicators show current action (answer/ask/bot thinking)

**Timer System**
- Difficulty-based timer durations: Easy=90s, Medium=60s, Hard=30s
- Timer pauses during bot phases (bot-question, bot-answer) and only counts during user phases
- Single interval implementation using refs to prevent multiple timers and stale closures
- Countdown rate: exactly 1 second per real second
- Timer resets to full duration at the start of each user turn (answer/question)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Core Libraries**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management, caching, and data fetching

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Chess.com-inspired dark theme** with high-contrast black/white aesthetic and competitive gaming UI patterns
- Custom CSS variables for theming support (light/dark modes)
- Monospace fonts (JetBrains Mono) for Elo ratings and statistics to enhance the competitive gaming aesthetic

**State Management**
- Local component state using React hooks
- Server state managed through TanStack Query with configured stale times and refetch policies
- Guest mode state persisted in localStorage
- In-memory mock data for prototyping (user Elo, match history for guests)
- Authenticated user data retrieved from database via `/api/auth/user` endpoint

**Key UI Patterns**
- Real-time conversation interface with message threading
- Timer-based match mechanics with round progression
- AI-graded scoring system with detailed feedback breakdowns
- Leaderboard with ranking visualization
- Practice mode with topic selection and vocabulary preview

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js with TypeScript for type safety
- ESM module system for modern JavaScript features
- Middleware pipeline for request logging, JSON parsing, and error handling

**API Design**
- RESTful endpoints for grading and bot interactions
- GET `/api/auth/user` - Returns authenticated user or `null` for unauthenticated/guest users
- GET `/api/login` - Initiates Replit Auth OIDC login flow
- GET `/api/logout` - Logs out user and redirects to Replit end-session URL
- GET `/api/callback` - OAuth callback handler for Replit Auth
- POST `/api/grade` - Receives conversation data with difficulty level and returns AI-generated performance scores
- POST `/api/bot-response` - Generates contextual AI opponent responses based on difficulty level
- JSON request/response format with Zod schema validation

**In-Memory Data Storage**
- `MemStorage` class implementing `IStorage` interface for user management
- UUID-based user identification
- Map-based data structures for fast lookups
- Designed to be swapped with database implementation (Drizzle ORM ready)

**AI Integration Strategy**
- OpenAI GPT-4o for conversation grading and bot response generation
- Structured prompt engineering for consistent evaluation across grammar, fluency, vocabulary, and naturalness
- JSON-formatted responses for reliable parsing
- Error handling for API failures with fallback mechanisms

### External Dependencies

**AI Services**
- **OpenAI API** (GPT-4o model) - Primary AI service for conversation evaluation and bot responses
  - Grading rubric: Grammar (0-100), Fluency (0-100), Vocabulary (0-100), Naturalness (0-100)
  - Difficulty-aware grading with adjusted expectations (Easy: encouraging, Medium: balanced, Hard: strict)
  - Contextual response generation based on topic, target vocabulary, and difficulty level
  - Bot responses adapt complexity, vocabulary richness, and sentence structures to difficulty

**Database**
- **Neon Postgres** via `@neondatabase/serverless` - Serverless PostgreSQL with connection pooling
- **Drizzle ORM** - Type-safe SQL query builder with schema migrations
- **Sessions table** - Stores Replit Auth session data for authenticated users
- **Users table** - Stores user profiles (id, email, firstName, lastName, profileImageUrl, timestamps)
- Migration system configured via `drizzle-kit` with PostgreSQL dialect
- In-memory storage (`MemStorage`) used for guest mode and development; implements same `IStorage` interface as database storage

**UI Component Libraries**
- **Radix UI** - Headless, accessible component primitives (dialogs, popovers, dropdowns, etc.)
- **Lucide React** - Icon library for consistent iconography
- **class-variance-authority** & **clsx** - Dynamic className composition
- **pinyin-pro** - Chinese character to pinyin romanization for language learning support
- **date-fns** - Date formatting and manipulation utilities

**Form & Validation**
- **React Hook Form** with `@hookform/resolvers` for form state management
- **Zod** - Runtime type validation and schema definition
- **drizzle-zod** - Database schema to Zod schema conversion

**Authentication & Session Management**
- **Replit Auth (OpenID Connect)** - OAuth provider supporting Google, GitHub, X, Apple, email/password
- **openid-client** - OpenID Connect client library for Passport.js integration
- **Passport.js** - Authentication middleware for Express with OIDC strategy
- **express-session** - Session management with PostgreSQL store via `connect-pg-simple`
- **memoizee** - Caching OIDC configuration to reduce discovery calls
- Session TTL: 1 week with automatic token refresh

**Development Tools**
- **Replit-specific plugins** - Runtime error overlay, cartographer, dev banner for Replit environment
- Custom Vite logging with formatted timestamps
- Hot module replacement (HMR) for rapid development iteration