import { 
  type User, 
  type UpsertUser, 
  type UserLanguageStats, 
  type InsertUserLanguageStats,
  type Match,
  type InsertMatch,
  users,
  userLanguageStats,
  matches
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Storage interface for Replit Auth
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Language-specific stats
  getUserLanguageStats(userId: string, language: string): Promise<UserLanguageStats | undefined>;
  upsertUserLanguageStats(stats: InsertUserLanguageStats): Promise<UserLanguageStats>;
  getAllLanguageStats(language: string): Promise<UserLanguageStats[]>;
  
  // Match history
  createMatch(match: InsertMatch): Promise<Match>;
  getUserMatches(userId: string, language?: string, limit?: number): Promise<Match[]>;
  getUserSkillProgress(userId: string, language?: string): Promise<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private languageStats: Map<string, UserLanguageStats>; // key: `${userId}-${language}`
  private matches: Map<string, Match>;

  constructor() {
    this.users = new Map();
    this.languageStats = new Map();
    this.matches = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || "",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserLanguageStats(userId: string, language: string): Promise<UserLanguageStats | undefined> {
    return this.languageStats.get(`${userId}-${language}`);
  }

  async upsertUserLanguageStats(statsData: InsertUserLanguageStats): Promise<UserLanguageStats> {
    const key = `${statsData.userId}-${statsData.language}`;
    const existing = this.languageStats.get(key);
    const stats: UserLanguageStats = {
      id: existing?.id || crypto.randomUUID(),
      userId: statsData.userId!,
      language: statsData.language!,
      elo: statsData.elo ?? existing?.elo ?? 1000,
      wins: statsData.wins ?? existing?.wins ?? 0,
      losses: statsData.losses ?? existing?.losses ?? 0,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.languageStats.set(key, stats);
    return stats;
  }

  async getAllLanguageStats(language: string): Promise<UserLanguageStats[]> {
    return Array.from(this.languageStats.values()).filter(stats => stats.language === language);
  }

  async createMatch(matchData: InsertMatch): Promise<Match> {
    const match: Match = {
      id: crypto.randomUUID(),
      userId: matchData.userId!,
      opponent: matchData.opponent!,
      result: matchData.result!,
      eloChange: matchData.eloChange!,
      language: matchData.language!,
      difficulty: matchData.difficulty!,
      grammarScore: matchData.grammarScore!,
      fluencyScore: matchData.fluencyScore!,
      vocabularyScore: matchData.vocabularyScore!,
      naturalnessScore: matchData.naturalnessScore!,
      overallScore: matchData.overallScore!,
      createdAt: new Date(),
    };
    this.matches.set(match.id, match);
    return match;
  }

  async getUserMatches(userId: string, language?: string, limit: number = 10): Promise<Match[]> {
    const userMatches = Array.from(this.matches.values())
      .filter(match => match.userId === userId && (!language || match.language === language))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
    return userMatches;
  }

  async getUserSkillProgress(userId: string, language?: string): Promise<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }> {
    const userMatches = await this.getUserMatches(userId, language, 20);
    
    if (userMatches.length === 0) {
      return { grammar: 0, fluency: 0, vocabulary: 0, naturalness: 0 };
    }

    const totals = userMatches.reduce(
      (acc, match) => ({
        grammar: acc.grammar + match.grammarScore,
        fluency: acc.fluency + match.fluencyScore,
        vocabulary: acc.vocabulary + match.vocabularyScore,
        naturalness: acc.naturalness + match.naturalnessScore,
      }),
      { grammar: 0, fluency: 0, vocabulary: 0, naturalness: 0 }
    );

    return {
      grammar: Math.round(totals.grammar / userMatches.length),
      fluency: Math.round(totals.fluency / userMatches.length),
      vocabulary: Math.round(totals.vocabulary / userMatches.length),
      naturalness: Math.round(totals.naturalness / userMatches.length),
    };
  }
}

// Database storage implementation using Drizzle ORM
export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserLanguageStats(userId: string, language: string): Promise<UserLanguageStats | undefined> {
    const result = await db
      .select()
      .from(userLanguageStats)
      .where(and(eq(userLanguageStats.userId, userId), eq(userLanguageStats.language, language)))
      .limit(1);
    return result[0];
  }

  async upsertUserLanguageStats(statsData: InsertUserLanguageStats): Promise<UserLanguageStats> {
    // Check if stats already exist
    const existing = await this.getUserLanguageStats(statsData.userId!, statsData.language!);
    
    if (existing) {
      // Update existing stats
      const result = await db
        .update(userLanguageStats)
        .set({
          elo: statsData.elo ?? existing.elo,
          wins: statsData.wins ?? existing.wins,
          losses: statsData.losses ?? existing.losses,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userLanguageStats.userId, statsData.userId!),
          eq(userLanguageStats.language, statsData.language!)
        ))
        .returning();
      return result[0];
    } else {
      // Insert new stats
      const result = await db
        .insert(userLanguageStats)
        .values({
          userId: statsData.userId,
          language: statsData.language,
          elo: statsData.elo ?? 1000,
          wins: statsData.wins ?? 0,
          losses: statsData.losses ?? 0,
        })
        .returning();
      return result[0];
    }
  }

  async getAllLanguageStats(language: string): Promise<UserLanguageStats[]> {
    return await db
      .select()
      .from(userLanguageStats)
      .where(eq(userLanguageStats.language, language))
      .orderBy(desc(userLanguageStats.elo));
  }

  async createMatch(matchData: InsertMatch): Promise<Match> {
    const result = await db.insert(matches).values(matchData).returning();
    return result[0];
  }

  async getUserMatches(userId: string, language?: string, limit: number = 10): Promise<Match[]> {
    const conditions = language 
      ? and(eq(matches.userId, userId), eq(matches.language, language))
      : eq(matches.userId, userId);
      
    return await db
      .select()
      .from(matches)
      .where(conditions)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
  }

  async getUserSkillProgress(userId: string, language?: string): Promise<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }> {
    const userMatches = await this.getUserMatches(userId, language, 20);
    
    if (userMatches.length === 0) {
      return { grammar: 0, fluency: 0, vocabulary: 0, naturalness: 0 };
    }

    const totals = userMatches.reduce(
      (acc, match) => ({
        grammar: acc.grammar + match.grammarScore,
        fluency: acc.fluency + match.fluencyScore,
        vocabulary: acc.vocabulary + match.vocabularyScore,
        naturalness: acc.naturalness + match.naturalnessScore,
      }),
      { grammar: 0, fluency: 0, vocabulary: 0, naturalness: 0 }
    );

    return {
      grammar: Math.round(totals.grammar / userMatches.length),
      fluency: Math.round(totals.fluency / userMatches.length),
      vocabulary: Math.round(totals.vocabulary / userMatches.length),
      naturalness: Math.round(totals.naturalness / userMatches.length),
    };
  }
}

// Use database storage for persistent data
export const storage = new DbStorage();
