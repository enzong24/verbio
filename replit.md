# LangDuel - Competitive Language Learning Platform

## Overview

LangDuel is an AI-powered, competitive language learning platform that gamifies language acquisition through Elo-ranked duels. Users engage in themed conversations with opponents or AI bots, receive instant AI feedback on their performance, and track their progress through a competitive ranking system. The platform transforms language learning from passive study into an engaging, measurable experience similar to competitive gaming platforms like Chess.com.

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
- In-memory mock data for prototyping (user Elo, match history)

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
- POST `/api/grade` - Receives conversation data and returns AI-generated performance scores
- POST `/api/bot-response` - Generates contextual AI opponent responses
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
  - Contextual response generation based on topic and target vocabulary

**Database (Configured but Optional)**
- **Neon Postgres** via `@neondatabase/serverless` - Serverless PostgreSQL with connection pooling
- **Drizzle ORM** - Type-safe SQL query builder with schema migrations
- Schema defines users table with username/password authentication
- Migration system configured via `drizzle-kit` with PostgreSQL dialect
- Note: Currently using in-memory storage; database integration is prepared but not active

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

**Development Tools**
- **Replit-specific plugins** - Runtime error overlay, cartographer, dev banner for Replit environment
- Custom Vite logging with formatted timestamps
- Hot module replacement (HMR) for rapid development iteration