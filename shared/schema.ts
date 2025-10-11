import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
