import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Passport.js authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with Google OAuth and username/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  googleId: varchar("google_id").unique(), // Google OAuth user ID
  username: varchar("username").unique(), // For username/password auth
  password: varchar("password"), // Hashed password
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isOnline: integer("is_online").notNull().default(0), // 0 = offline, 1 = online
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Premium subscription fields
  isPremium: integer("is_premium").notNull().default(0), // 0 = free, 1 = premium
  subscriptionEndDate: timestamp("subscription_end_date"), // When premium expires
  // Daily match tracking for free users (Medium/Hard limit)
  dailyMediumHardCount: integer("daily_medium_hard_count").notNull().default(0),
  lastMediumHardDate: varchar("last_medium_hard_date"), // Store as YYYY-MM-DD
  // Daily premium feedback tracking for free users (2 per day limit)
  dailyPremiumFeedbackCount: integer("daily_premium_feedback_count").notNull().default(0),
  lastPremiumFeedbackDate: varchar("last_premium_feedback_date"), // Store as YYYY-MM-DD
  // Stripe integration fields (from blueprint:javascript_stripe)
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id")
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Language-specific stats for each user
export const userLanguageStats = pgTable(
  "user_language_stats",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    language: varchar("language").notNull(), // 'Chinese', 'Spanish', 'Italian'
    elo: integer("elo").notNull().default(1000),
    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),
    winStreak: integer("win_streak").notNull().default(0),
    bestWinStreak: integer("best_win_streak").notNull().default(0),
    dailyLoginStreak: integer("daily_login_streak").notNull().default(0),
    lastLoginDate: varchar("last_login_date"), // Store as YYYY-MM-DD for easy comparison
    highestFluencyLevel: varchar("highest_fluency_level").default("A1"), // A1, A2, B1, B2, C1, C2
    initialLevelSelected: integer("initial_level_selected").notNull().default(0), // 0 = not selected, 1 = selected
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique("unique_user_language").on(table.userId, table.language)],
);

export type UserLanguageStats = typeof userLanguageStats.$inferSelect;
export type InsertUserLanguageStats = typeof userLanguageStats.$inferInsert;

// Match history for tracking individual matches
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  opponent: varchar("opponent").notNull(),
  result: varchar("result").notNull(), // 'win' or 'loss'
  eloChange: integer("elo_change").notNull(),
  language: varchar("language").notNull(),
  difficulty: varchar("difficulty").notNull(),
  grammarScore: integer("grammar_score").notNull(),
  fluencyScore: integer("fluency_score").notNull(),
  vocabularyScore: integer("vocabulary_score").notNull(),
  naturalnessScore: integer("naturalness_score").notNull(),
  overallScore: integer("overall_score").notNull(),
  isForfeit: integer("is_forfeit").notNull().default(0), // 0 = false, 1 = true (SQLite boolean)
  isPracticeMode: integer("is_practice_mode").notNull().default(0), // 0 = competitive, 1 = practice
  conversation: jsonb("conversation"), // Full chat log as array of Message objects
  detailedFeedback: jsonb("detailed_feedback"), // Detailed AI feedback with corrections and suggestions
  topic: varchar("topic"), // Match topic for context
  createdAt: timestamp("created_at").defaultNow(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// Friends table for managing friend relationships
export const friends = pgTable(
  "friends",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    friendId: varchar("friend_id").notNull().references(() => users.id),
    status: varchar("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected'
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique("unique_friendship").on(table.userId, table.friendId)],
);

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = typeof friends.$inferInsert;

// Private match invites for friend challenges
export const privateMatchInvites = pgTable("private_match_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviteCode: varchar("invite_code").unique(), // Optional for code-based invites
  recipientId: varchar("recipient_id").references(() => users.id), // Direct friend challenges
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  language: varchar("language").notNull(),
  difficulty: varchar("difficulty").notNull(),
  topic: varchar("topic"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'expired'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PrivateMatchInvite = typeof privateMatchInvites.$inferSelect;
export type InsertPrivateMatchInvite = typeof privateMatchInvites.$inferInsert;

// Premium whitelist for automatic premium access without payment
export const premiumWhitelist = pgTable("premium_whitelist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  addedBy: varchar("added_by"), // Admin user who added this email
  createdAt: timestamp("created_at").defaultNow(),
});

export type PremiumWhitelist = typeof premiumWhitelist.$inferSelect;
export type InsertPremiumWhitelist = typeof premiumWhitelist.$inferInsert;

// Match/Duel schemas
export const messageSchema = z.object({
  sender: z.enum(["user", "opponent"]),
  text: z.string(),
  timestamp: z.number(),
});

export const gradingRequestSchema = z.object({
  messages: z.array(messageSchema),
  topic: z.string(),
  vocabulary: z.array(z.string()),
  language: z.string().default("Chinese"),
  difficulty: z.string().default("Medium"),
  skippedQuestions: z.number().default(0),
});

// Detailed feedback for individual messages
export const messageAnalysisSchema = z.object({
  messageIndex: z.number(),
  sender: z.enum(["user", "opponent"]),
  originalText: z.string(),
  grammarCorrections: z.array(z.object({
    original: z.string(),
    corrected: z.string(),
    explanation: z.string(),
  })).optional(),
  vocabularySuggestions: z.array(z.object({
    word: z.string(),
    betterAlternative: z.string(),
    reason: z.string(),
  })).optional(),
  sentenceImprovement: z.object({
    original: z.string(),
    improved: z.string(),
    explanation: z.string(),
  }),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
});

export const gradingResultSchema = z.object({
  grammar: z.number().min(0).max(100),
  fluency: z.number().min(0).max(100),
  vocabulary: z.number().min(0).max(100),
  naturalness: z.number().min(0).max(100),
  feedback: z.array(z.string()),
  overall: z.number().min(0).max(100),
  // Bot scores
  botGrammar: z.number().min(0).max(100).optional(),
  botFluency: z.number().min(0).max(100).optional(),
  botVocabulary: z.number().min(0).max(100).optional(),
  botNaturalness: z.number().min(0).max(100).optional(),
  botOverall: z.number().min(0).max(100).optional(),
  botElo: z.number().optional(),
  isForfeit: z.boolean().optional(), // Track if match was forfeited
  // Detailed per-message analysis
  messageAnalysis: z.array(messageAnalysisSchema).optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type GradingRequest = z.infer<typeof gradingRequestSchema>;
export type GradingResult = z.infer<typeof gradingResultSchema>;
export type MessageAnalysis = z.infer<typeof messageAnalysisSchema>;
