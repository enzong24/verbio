# LangDuel - Competitive Language Learning Platform

## Overview

LangDuel is an AI-powered, competitive language learning platform that gamifies language acquisition through Elo-ranked duels. Users engage in themed conversations with opponents or AI bots, receive instant AI feedback on their performance, and track their progress through a competitive ranking system. The platform transforms language learning from passive study into an engaging, measurable experience similar to competitive gaming platforms like Chess.com.

## Recent Updates (October 13, 2025)

**Latest Changes - Vocabulary Standardization & System Verification (October 13, 2025 - Session 3)**
- **Vocabulary Count Standardization**: All 21 themes updated to consistent vocabulary counts
  - Medium difficulty: exactly 5 vocabulary words per theme
  - Hard difficulty: exactly 8 vocabulary words per theme
  - Automated verification script confirms 100% compliance across all themes
- **System Verification**: Comprehensive validation of all features
  - Mobile responsiveness confirmed with breakpoints (md:, sm:, lg:) throughout DuelInterface
  - Chess.com-style Elo calculation verified with dynamic K-factors and 300+ difference rules
  - Topic selection for practice mode only - competitive matches use random topics
  - All 21 themes tested and verified for correct vocabulary counts

**Previous Changes - Mobile Responsiveness & Chess.com-style Elo (October 13, 2025 - Session 2)**
- **Mobile Responsiveness**: Fully responsive UI for all screen sizes with mobile-optimized typing interface
  - DuelInterface components scale from mobile to desktop with proper breakpoints
  - Text, buttons, and inputs resize appropriately for mobile devices
  - Sidebar hidden on mobile for better screen space utilization
- **Expanded Theme System**: Added 8 new conversation topics bringing total to 21 themes
  - New themes: Music & Arts, Hobbies & Leisure, Home & Daily Life, Transportation & Commute, Animals & Pets, Clothing & Fashion, Holidays & Celebrations, Emotions & Feelings
  - All themes support Chinese, Spanish, and Italian with full translations
- **Topic Selection for Practice Only**: Competitive matches now use random topics for fair ranking
  - Topic selection UI moved to Practice mode section only
  - Competitive "Find Match" always uses random topic to ensure fair Elo comparisons
  - Clear UI separation between competitive and practice modes
- **Chess.com-style Elo System**: Advanced Elo calculation matching professional chess platforms
  - Dynamic K-factor based on rating: 40 (<1200), 32 (1200-1800), 24 (1800-2400), 16 (2400+)
  - 300+ Elo difference rule implemented:
    - No Elo gain for winning against opponent 300+ points below
    - Still lose points (doubled penalty) for losing to opponent 300+ points below
    - Increased Elo gain (1.5x) for beating opponent 300+ points above
  - Standard Elo formula: Expected Score = 1 / (1 + 10^((opponentElo - userElo) / 400))

**Previous Changes - Difficulty & Penalty System Overhaul**
- Completely restructured difficulty levels with new absolute beginner Easy level
- Restored original timer durations: Easy=90s, Medium=60s, Hard=30s
- Variable round counts by difficulty: Easy=3 rounds, Medium=4 rounds, Hard=5 rounds
- Removed -5 point penalty for viewing definitions completely
- Vocabulary definitions now show English translations on click with no penalties
- Only skip penalty remains: -20 points per "Don't Know" button click

**Penalty System**
- 20-point penalty for clicking "Don't Know" button to skip questions
- NO penalty for viewing vocabulary definitions (removed -5 point deduction)
- Penalties automatically deducted from final score before win/loss determination
- Grading tracks only skippedQuestions count

**Difficulty Restructuring**
- New Easy difficulty: 90s timer, 3 rounds, +6 Elo reward, extremely basic vocabulary (go/eat/water) with maximum encouragement grading
- Medium difficulty (formerly Easy): 60s timer, 4 rounds, +8 Elo reward, conversational vocabulary with balanced grading
- Hard difficulty (formerly Medium): 30s timer, 5 rounds, +12 Elo reward, advanced vocabulary with strict grading
- All AI prompts updated to match new difficulty expectations and vocabulary levels

**Vocabulary Definition System**
- Clickable vocabulary badges show English definitions on click
- All 195+ vocabulary words across 13 themes include English translations
- Click badge to toggle definition visibility (no hover tooltip)
- No penalties applied for viewing definitions
- Hover and active elevate interactions on clickable vocabulary badges

**Turn-Based Q&A System**
- Structured turn-based Q&A format with variable rounds (3 for Easy, 4 for Medium, 5 for Hard)
- Bot asks the first question using vocabulary words
- User answers OR clicks "Don't Know" button to skip (-20 points)
- User then asks a question using vocabulary words
- Bot answers the user's question
- Turn phase indicators guide users through each step
- Question deduplication system ensures bot never asks the same question twice in a match

**Expanded Theme System**
- 21 comprehensive themes: Travel, Food, Business, Family, Technology, Health, Education, Entertainment, Nature, Shopping, Sports, Weather, Social, Music & Arts, Hobbies & Leisure, Home & Daily Life, Transportation & Commute, Animals & Pets, Clothing & Fashion, Holidays & Celebrations, Emotions & Feelings
- Each theme has difficulty-specific vocabulary (Easy, Medium, Hard)
- Target vocabulary counts: 3 words for Easy, 5 words for Medium, 8 words for Hard
- Full language support for Chinese (with pinyin), Spanish, and Italian
- All vocabulary includes English definitions for universal accessibility
- Topic selection available for practice mode; competitive matches use random topics

**Authentication & Guest Mode**
- Replit Auth integration for user sign-in/sign-out with Google, GitHub, X, Apple, and email/password
- Guest mode allowing users to play without signing in, persisted via localStorage
- Landing page for logged-out users with "Sign In" and "Play as Guest" options
- Auth endpoint returns `null` for unauthenticated users (no 401 blocking)
- Profile images displayed in header for authenticated users

**AI Integration & Prompts**
- OpenAI GPT-4o for all grading, questions, and answers
- Dedicated endpoints for Q&A format:
  - POST `/api/bot-question` - Generates questions using vocabulary with deduplication
  - POST `/api/bot-answer` - Generates answers to user questions
  - POST `/api/grade` - Grades performance with penalty adjustments
- Context-aware grading prompts adjust expectations based on difficulty level
- Bot questions and answers adapt to difficulty and incorporate target vocabulary

**UI & Navigation Features**
- "Don't Know" button to skip difficult questions during answer phase (-20 points)
- Accent keyboard for Spanish (á, é, í, ó, ú, ñ, ü, ¿, ¡) and Italian (à, è, é, ì, ò, ù)
- Turn phase indicators show current action (answer/ask/bot thinking)
- Initial player Elo: 1000 (changed from 1547)

**Timer System**
- Difficulty-based timer durations: Easy=90s, Medium=60s, Hard=30s
- Timer pauses during bot phases, only counts during user phases
- Single interval implementation using refs to prevent multiple timers
- Timer resets to full duration at the start of each user turn

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