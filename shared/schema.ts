import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

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

export const gradingResultSchema = z.object({
  grammar: z.number().min(0).max(100),
  fluency: z.number().min(0).max(100),
  vocabulary: z.number().min(0).max(100),
  naturalness: z.number().min(0).max(100),
  feedback: z.array(z.string()),
  overall: z.number().min(0).max(100),
});

export type Message = z.infer<typeof messageSchema>;
export type GradingRequest = z.infer<typeof gradingRequestSchema>;
export type GradingResult = z.infer<typeof gradingResultSchema>;
