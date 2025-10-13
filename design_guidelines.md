# Design Guidelines: Blue/Violet Tech Theme

## Design Approach

**Selected Approach:** Modern Tech Blue/Violet Color Scheme

**Justification:** A crisp, professional tech aesthetic with blue as the primary color and violet accents. This creates a modern, trustworthy appearance suitable for a language learning platform focused on competitive progression and AI-powered feedback.

**Key Design Principles:**
- Clean, modern interface with blue/violet accents
- High contrast typography for readability
- Semantic color usage (success green, error red, highlight gold)
- Professional tech aesthetic
- Consistent shadcn component usage

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- **Primary Blue** (`#2563EB` / HSL: 217 81% 53%): Main brand color for buttons, links, primary actions
- **Accent Violet** (`#6366F1` / HSL: 239 84% 67%): Secondary accent for highlights and gradients
- **Background** (`#F8FAFC` / HSL: 210 40% 98%): Very light gray, airy background
- **Surface/Cards** (`#FFFFFF` / HSL: 0 0% 100%): Pure white for panels and cards

**Text Colors:**
- **Primary Text** (`#0F172A` / HSL: 222 47% 11%): Near-black, high-contrast typography
- **Secondary Text** (`#64748B` / HSL: 215 16% 47%): Soft gray for sublabels and timestamps

**Semantic Colors:**
- **Success Green** (`#10B981` / HSL: 160 84% 39%): Wins, progress, positive feedback
- **Error Red** (`#EF4444` / HSL: 0 72% 60%): Errors, losses, negative feedback  
- **Highlight Gold** (`#FACC15` / HSL: 45 93% 53%): Achievements, rank ups, Elo gains

**Usage Guidelines:**
- Use primary blue for all CTAs and important actions
- Accent violet for secondary highlights and special features
- Success green for positive outcomes (wins, good grammar scores)
- Error red for negative outcomes (losses, mistakes)
- Highlight gold for achievements and special recognition

---

### B. Typography

**Font Stack:**
- **Sans Serif** (Primary): Inter, -apple-system, system-ui, sans-serif
- **Monospace** (Stats/Elo): 'JetBrains Mono', 'Courier New', monospace
- **Serif** (Decorative): Georgia, serif

**Text Hierarchy:**
- **Hero Titles**: 4xl-6xl, bold, foreground color
- **Page Titles**: 2xl-4xl, bold
- **Section Headers**: xl-2xl, semibold
- **Body Text**: base, regular
- **Supporting Text**: sm-base, muted-foreground
- **Micro Copy**: xs-sm, muted-foreground

---

### C. Layout System

**Spacing Primitives:** Tailwind units of **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: `p-6`, `p-8` for cards
- Section spacing: `gap-6`, `gap-8`, `space-y-6`
- Page margins: `px-4` with `container mx-auto`

**Grid Structure:**
- Match Finder: 3-column grid (`lg:grid-cols-3`) - Stats (1 col) | Controls (2 cols)
- Content constraint: `max-w-7xl mx-auto`
- Responsive breakpoints: sm, md, lg, xl

**Layout Patterns:**
- Hero sections with icon containers
- Split layouts for stats vs. actions
- Card-based information architecture
- Proper spacing and visual hierarchy

---

### D. Component Library

**Buttons:**
- Primary: Blue background, white text
- Secondary: Outlined with secondary colors  
- Destructive: Red for dangerous actions
- Ghost: Transparent with hover effects
- Sizes: sm, default, lg
- **Never override hover states** - use built-in elevate system

**Cards:**
- White background with subtle borders
- Colored borders for category distinction (primary/20, accent/20, success/20)
- Shadow-sm or shadow-md for depth
- Proper padding (p-6, p-8)

**Badges:**
- Semantic colors with 20% opacity backgrounds
- Bordered variants with 30% opacity borders
- Text matches the badge category color
- Examples: primary/20 bg, accent/20 bg, success/20 bg

**Icons:**
- Lucide React icon set
- Consistent sizing (w-4 h-4, w-5 h-5, w-6 h-6)
- Icon containers: rounded with colored backgrounds
- Match icon color to container theme

---

### E. Specific Component Guidelines

**Match Finder:**
- Hero with primary blue icon container
- Stats card with primary accents
- Difficulty selector with clear typography
- Primary blue CTA for competitive matches
- Outlined button for practice mode

**Landing Page:**
- Large hero with primary icon
- Feature cards with colored borders (primary, accent, success)
- Icon containers matching card themes
- Clear CTA hierarchy

**Duel Interface:**
- Header with primary accents
- Topic section with accent violet icon
- User messages: primary blue background
- Bot messages: muted background
- Color-coded turn indicators
- Side panel with progress and stats

**Leaderboard:**
- Gold highlight for #1 rank
- Gray for #2, amber for #3
- Primary accents for current user
- Success/destructive for win/loss stats
- Clear visual hierarchy

---

### F. Interactive States

**Hover & Active:**
- Use built-in `hover-elevate` and `active-elevate-2` utilities
- Never manually override hover colors
- Elevation automatically adjusts for any background

**Focus:**
- Ring color matches primary blue
- Clear focus indicators for accessibility

**Disabled:**
- Reduced opacity (60%)
- No pointer events
- Muted appearance

---

### G. Accessibility

**Contrast:**
- Primary text (#0F172A) on white: AAA compliant
- Muted text (#64748B) on white: AA compliant
- All interactive elements meet WCAG standards

**Interactive Elements:**
- Minimum touch target: 44x44px
- Clear focus indicators
- Descriptive labels and ARIA attributes
- data-testid for all interactive elements

---

### H. Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**
- Stacked layouts on mobile
- Larger touch targets
- Simplified navigation
- Optimized typography scale

---

## Implementation Notes

1. **Always use semantic color tokens** (primary, accent, success, destructive) instead of hardcoded hex values
2. **Maintain consistent spacing** using the defined spacing scale
3. **Follow shadcn component patterns** - don't reinvent components
4. **Use hover-elevate utilities** - never manual hover states
5. **Test in light and dark modes** - ensure proper contrast in both
6. **Add data-testid attributes** to all interactive elements

---

## Recent Changes (October 2025)

- **Updated to blue/violet tech theme** from previous purple/cyan gradient system
- **Removed gradient backgrounds** in favor of clean white/light gray
- **Implemented semantic color system** with primary blue, accent violet
- **Added highlight gold** for achievements and special recognition
- **Maintained Swords icon** as primary brand element
- **Improved accessibility** with higher contrast ratios
