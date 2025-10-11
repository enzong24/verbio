# Design Guidelines: Competitive Language Learning Platform

## Design Approach

**Selected Approach:** Reference-Based (Chess.com Inspired)

**Justification:** The user explicitly requested a chess.com aesthetic with black/white color theme. This competitive gaming platform perfectly aligns with the Elo-based language duel concept, emphasizing skill progression, real-time matches, and competitive rankings.

**Key Design Principles:**
- Professional esports aesthetic with high contrast
- Data-driven interface highlighting stats and rankings
- Clean, distraction-free match environment
- Competitive gaming UI patterns (timers, score displays, leaderboards)
- Sharp, geometric layouts with clear information hierarchy

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: `0 0% 7%` (near black, #121212)
- Background Elevated: `0 0% 11%` (cards/panels, #1C1C1C)
- Background Hover: `0 0% 15%` (interactive surfaces, #262626)
- Primary White: `0 0% 98%` (text, borders, #FAFAFA)
- Secondary Gray: `0 0% 60%` (muted text, #999999)
- Success Green: `142 76% 36%` (wins, positive feedback)
- Error Red: `0 65% 51%` (losses, errors)
- Warning Orange: `38 92% 50%` (pending actions)

**Accent Colors (Minimal Use):**
- Elo Highlight: `45 100% 51%` (gold for top rankings)
- Active State: `0 0% 25%` (button active state)

---

### B. Typography

**Font Families:**
- Primary: 'Inter', -apple-system, system-ui, sans-serif
- Monospace: 'JetBrains Mono', 'Courier New', monospace (for Elo ratings, timers)

**Type Scale:**
- Hero/Display: text-5xl to text-6xl, font-bold (match results, rankings)
- Headings: text-2xl to text-3xl, font-semibold
- Body: text-base to text-lg, font-normal
- Metadata: text-sm to text-xs, font-medium (stats, timestamps)
- Elo Ratings: text-xl, font-mono, font-bold

**Text Hierarchy:**
- Primary text: white (`text-white`)
- Secondary text: gray-400 (`text-gray-400`)
- Muted text: gray-500 (`text-gray-500`)

---

### C. Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: `p-4`, `p-6`, `p-8`
- Section spacing: `gap-8`, `gap-12`, `space-y-8`
- Page margins: `px-4 md:px-8 lg:px-16`

**Grid Structure:**
- Main Dashboard: 3-column grid (`grid-cols-1 lg:grid-cols-3`)
- Match View: 2-column split (chat | opponent info)
- Leaderboard: Single column table with fixed header
- Max container width: `max-w-7xl mx-auto`

---

### D. Component Library

**Navigation:**
- Top nav bar: Fixed, dark background, white text, minimal height (h-16)
- User avatar with Elo rating badge in top-right
- Main sections: Duel, Practice, Leaderboard, Profile
- Active state: white underline border-b-2

**Match Interface:**
- Split-screen layout: Left (user chat) | Right (opponent chat)
- Timer display: Circular progress indicator, white stroke, centered top
- Message bubbles: Dark gray bg, white text, sharp corners (rounded-sm)
- Input area: Full-width, fixed bottom, white border-t

**Cards & Panels:**
- Match card: Dark elevated bg, white border (border-white/10)
- Stat cards: Grid layout, icon + number + label
- Hover state: Subtle lift with shadow-lg, border brightness increase

**Buttons:**
- Primary: White bg, black text, rounded-md, font-semibold
- Secondary: White border, white text, transparent bg
- Danger: Red bg, white text (forfeit, leave match)
- Disabled: Gray-600 bg, gray-400 text

**Data Display:**
- Elo rating: Large monospace number with +/- indicator
- Match history: Table with alternating row colors (zebra striping)
- Progress bars: White foreground on dark gray background
- Win/Loss indicators: Green checkmark / Red X icons

**Feedback Elements:**
- Post-match overlay: Full-screen modal, dark backdrop blur
- Score breakdown: Grid of metrics with progress circles
- Corrections: Inline red highlights with white replacement text
- Achievement badges: Outlined icons with gold accent

**Real-time Elements:**
- Typing indicator: Three dots animation, white
- Connection status: Small pill badge (green dot + "Online")
- Live match count: Pulsing number badge

---

### E. Animations

**Minimal & Purposeful:**
- Match start countdown: Scale-in animation for 3-2-1
- Message send: Slight slide-up with fade-in (100ms)
- Elo change: Number counter animation (500ms)
- Timer pulse: Subtle scale when < 10 seconds remain
- NO decorative background animations or gradients

---

## Images

**Hero Section:**
- Large hero image showing two chess players in intense focus (black and white photography)
- Overlay: Dark gradient (black to transparent) for text legibility
- Placement: Full-width background, 70vh height
- Alt approach: Split-screen image collage of language learners in competitive settings

**Dashboard:**
- No images - focus on data, stats, and match cards
- User avatars: Circular, 40x40px, white border

**Practice Mode:**
- AI bot avatar: Minimalist robot icon, white on dark circle
- No background images - keep interface clean

**Leaderboard:**
- Top 3 podium illustration: Simplified geometric shapes in white
- Trophy icons for ranking tiers (SVG, white stroke)

**Match Interface:**
- No images during active duels - distraction-free environment
- Post-match: Optional celebration graphic (minimal, geometric)

---

## Key Interface Patterns

**Matchmaking Flow:**
1. Large "Find Match" button (center screen, white, prominent)
2. Searching state: Animated radar/pulse effect
3. Match found: Quick fade transition to chat interface

**Duel Screen:**
- Fixed header: Topic + vocabulary chips
- Scrollable chat area: Auto-scroll to latest message
- Fixed footer: Input field + send button + forfeit option
- Side panel: Opponent info, Elo, timer, round counter

**Results Screen:**
- Center: Winner declaration (large text)
- Grid: 4 metrics (Grammar, Fluency, Vocabulary, Naturalness)
- Elo change: Prominent display with +/- arrow
- Action buttons: Rematch, View Feedback, Return to Dashboard

**Leaderboard:**
- Sticky header with filter tabs (Global, Friends, This Week)
- Rank | Avatar | Name | Elo | Win/Loss Ratio
- Current user row: Highlighted with white border
- Infinite scroll for full rankings

This design creates a serious, competitive atmosphere that mirrors chess.com's professional gaming aesthetic while adapting it for language learning duels.