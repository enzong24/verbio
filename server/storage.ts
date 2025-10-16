import { 
  type User, 
  type UpsertUser, 
  type UserLanguageStats, 
  type InsertUserLanguageStats,
  type Match,
  type InsertMatch,
  type Friend,
  type InsertFriend,
  type PrivateMatchInvite,
  type InsertPrivateMatchInvite,
  type PremiumWhitelist,
  type InsertPremiumWhitelist,
  users,
  userLanguageStats,
  matches,
  friends,
  privateMatchInvites,
  premiumWhitelist
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, sql, inArray } from "drizzle-orm";

// Storage interface for Replit Auth
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserActivity(userId: string): Promise<void>;
  
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
  
  // Streaks
  updateWinStreak(userId: string, language: string, isWin: boolean, isForfeit: boolean): Promise<UserLanguageStats>;
  updateDailyLoginStreak(userId: string, language: string): Promise<UserLanguageStats>;
  
  // Friend system
  sendFriendRequest(userId: string, friendUsername: string): Promise<Friend>;
  getFriendshipById(friendshipId: string): Promise<Friend | undefined>;
  acceptFriendRequest(friendshipId: string): Promise<Friend>;
  rejectFriendRequest(friendshipId: string): Promise<void>;
  removeFriend(friendshipId: string): Promise<void>;
  getFriends(userId: string): Promise<Array<Friend & { friendUser: User; friendStats?: UserLanguageStats }>>;
  getPendingFriendRequests(userId: string): Promise<Array<Friend & { requesterUser: User }>>;
  
  // Private match invites
  createPrivateMatchInvite(invite: InsertPrivateMatchInvite): Promise<PrivateMatchInvite>;
  getPrivateMatchInvite(inviteCode: string): Promise<PrivateMatchInvite | undefined>;
  updatePrivateMatchInviteStatus(inviteCode: string, status: string): Promise<void>;
  
  // Premium features
  checkDailyMediumHardLimit(userId: string, today: string): Promise<{ allowed: boolean; remaining: number; limit: number }>;
  incrementDailyMediumHardCount(userId: string, today: string): Promise<void>;
  checkDailyPremiumFeedbackLimit(userId: string, today: string): Promise<{ allowed: boolean; remaining: number; limit: number }>;
  incrementDailyPremiumFeedbackCount(userId: string, today: string): Promise<void>;
  
  // Stripe integration (from blueprint:javascript_stripe)
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Premium whitelist management
  addToWhitelist(email: string, addedBy?: string): Promise<PremiumWhitelist>;
  removeFromWhitelist(email: string): Promise<void>;
  isEmailWhitelisted(email: string): Promise<boolean>;
  getAllWhitelistedEmails(): Promise<PremiumWhitelist[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private languageStats: Map<string, UserLanguageStats>; // key: `${userId}-${language}`
  private matches: Map<string, Match>;
  private friendships: Map<string, Friend>;
  private privateInvites: Map<string, PrivateMatchInvite>; // key: inviteCode

  constructor() {
    this.users = new Map();
    this.languageStats = new Map();
    this.matches = new Map();
    this.friendships = new Map();
    this.privateInvites = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const allUsers = Array.from(this.users.values());
    return allUsers.find(user => user.email === email);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || "",
      googleId: userData.googleId !== undefined ? userData.googleId : (existingUser?.googleId || null),
      username: userData.username !== undefined ? userData.username : (existingUser?.username || null),
      password: userData.password !== undefined ? userData.password : (existingUser?.password || null),
      email: userData.email !== undefined ? userData.email : (existingUser?.email || null),
      firstName: userData.firstName !== undefined ? userData.firstName : (existingUser?.firstName || null),
      lastName: userData.lastName !== undefined ? userData.lastName : (existingUser?.lastName || null),
      profileImageUrl: userData.profileImageUrl !== undefined ? userData.profileImageUrl : (existingUser?.profileImageUrl || null),
      isOnline: existingUser?.isOnline ?? 0,
      lastSeenAt: existingUser?.lastSeenAt || new Date(),
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
      isPremium: existingUser?.isPremium ?? 0,
      subscriptionEndDate: existingUser?.subscriptionEndDate || null,
      dailyMediumHardCount: existingUser?.dailyMediumHardCount ?? 0,
      lastMediumHardDate: existingUser?.lastMediumHardDate || null,
      dailyPremiumFeedbackCount: existingUser?.dailyPremiumFeedbackCount ?? 0,
      lastPremiumFeedbackDate: existingUser?.lastPremiumFeedbackDate || null,
      stripeCustomerId: existingUser?.stripeCustomerId || null,
      stripeSubscriptionId: existingUser?.stripeSubscriptionId || null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserActivity(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.isOnline = 1;
      user.lastSeenAt = new Date();
      this.users.set(userId, user);
    }
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
      winStreak: statsData.winStreak ?? existing?.winStreak ?? 0,
      bestWinStreak: statsData.bestWinStreak ?? existing?.bestWinStreak ?? 0,
      dailyLoginStreak: statsData.dailyLoginStreak ?? existing?.dailyLoginStreak ?? 0,
      lastLoginDate: statsData.lastLoginDate ?? existing?.lastLoginDate ?? null,
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
      isForfeit: matchData.isForfeit ?? 0,
      conversation: matchData.conversation ?? null,
      detailedFeedback: matchData.detailedFeedback ?? null,
      topic: matchData.topic ?? null,
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

  async updateWinStreak(userId: string, language: string, isWin: boolean, isForfeit: boolean): Promise<UserLanguageStats> {
    const stats = await this.getUserLanguageStats(userId, language) || await this.upsertUserLanguageStats({ userId, language });
    
    if (isForfeit) {
      // Forfeits don't affect win streaks
      return stats;
    }
    
    if (isWin) {
      const newStreak = stats.winStreak + 1;
      const newBestStreak = Math.max(newStreak, stats.bestWinStreak);
      return this.upsertUserLanguageStats({
        ...stats,
        winStreak: newStreak,
        bestWinStreak: newBestStreak,
      });
    } else {
      return this.upsertUserLanguageStats({
        ...stats,
        winStreak: 0,
      });
    }
  }

  async updateDailyLoginStreak(userId: string, language: string): Promise<UserLanguageStats> {
    const stats = await this.getUserLanguageStats(userId, language) || await this.upsertUserLanguageStats({ userId, language });
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (stats.lastLoginDate === today) {
      // Already logged in today, no update needed
      return stats;
    }
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const isConsecutive = stats.lastLoginDate === yesterday;
    
    return this.upsertUserLanguageStats({
      ...stats,
      dailyLoginStreak: isConsecutive ? stats.dailyLoginStreak + 1 : 1,
      lastLoginDate: today,
    });
  }

  async sendFriendRequest(userId: string, friendUsername: string): Promise<Friend> {
    // Find friend by username (email in guest mode)
    const friendUser = Array.from(this.users.values()).find(u => 
      u.email === friendUsername || u.firstName === friendUsername
    );
    
    if (!friendUser) {
      throw new Error("User not found");
    }
    
    if (friendUser.id === userId) {
      throw new Error("Cannot add yourself as a friend");
    }
    
    // Check if friendship already exists
    const existing = Array.from(this.friendships.values()).find(f => 
      (f.userId === userId && f.friendId === friendUser.id) ||
      (f.userId === friendUser.id && f.friendId === userId)
    );
    
    if (existing) {
      throw new Error("Friend request already exists");
    }
    
    const friendship: Friend = {
      id: crypto.randomUUID(),
      userId,
      friendId: friendUser.id,
      status: "pending",
      createdAt: new Date(),
    };
    
    this.friendships.set(friendship.id, friendship);
    return friendship;
  }

  async getFriendshipById(friendshipId: string): Promise<Friend | undefined> {
    return this.friendships.get(friendshipId);
  }

  async acceptFriendRequest(friendshipId: string): Promise<Friend> {
    const friendship = this.friendships.get(friendshipId);
    if (!friendship) {
      throw new Error("Friend request not found");
    }
    
    const updated = { ...friendship, status: "accepted" };
    this.friendships.set(friendshipId, updated);
    return updated;
  }

  async rejectFriendRequest(friendshipId: string): Promise<void> {
    this.friendships.delete(friendshipId);
  }

  async removeFriend(friendshipId: string): Promise<void> {
    this.friendships.delete(friendshipId);
  }

  async getFriends(userId: string): Promise<Array<Friend & { friendUser: User; friendStats?: UserLanguageStats }>> {
    const accepted = Array.from(this.friendships.values()).filter(f => 
      (f.userId === userId || f.friendId === userId) && f.status === "accepted"
    );
    
    return accepted.map(friendship => {
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      const friendUser = this.users.get(friendId)!;
      return {
        ...friendship,
        friendUser,
        friendStats: undefined, // In-memory storage doesn't track this
      };
    });
  }

  async getPendingFriendRequests(userId: string): Promise<Array<Friend & { requesterUser: User }>> {
    const pending = Array.from(this.friendships.values()).filter(f => 
      f.friendId === userId && f.status === "pending"
    );
    
    return pending.map(friendship => ({
      ...friendship,
      requesterUser: this.users.get(friendship.userId)!,
    }));
  }

  async createPrivateMatchInvite(inviteData: InsertPrivateMatchInvite): Promise<PrivateMatchInvite> {
    const invite: PrivateMatchInvite = {
      id: crypto.randomUUID(),
      inviteCode: inviteData.inviteCode!,
      creatorId: inviteData.creatorId!,
      language: inviteData.language!,
      difficulty: inviteData.difficulty!,
      topic: inviteData.topic || null,
      status: inviteData.status || "pending",
      expiresAt: inviteData.expiresAt!,
      createdAt: new Date(),
    };
    
    this.privateInvites.set(invite.inviteCode, invite);
    return invite;
  }

  async getPrivateMatchInvite(inviteCode: string): Promise<PrivateMatchInvite | undefined> {
    return this.privateInvites.get(inviteCode);
  }

  async updatePrivateMatchInviteStatus(inviteCode: string, status: string): Promise<void> {
    const invite = this.privateInvites.get(inviteCode);
    if (invite) {
      invite.status = status;
      this.privateInvites.set(inviteCode, invite);
    }
  }

  async checkDailyMediumHardLimit(userId: string, today: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const user = this.users.get(userId);
    const limit = 3;
    
    if (!user) {
      return { allowed: false, remaining: 0, limit };
    }
    
    // Reset count if it's a new day
    if (user.lastMediumHardDate !== today) {
      user.dailyMediumHardCount = 0;
      user.lastMediumHardDate = today;
      this.users.set(userId, user);
    }
    
    const remaining = Math.max(0, limit - user.dailyMediumHardCount);
    return {
      allowed: user.dailyMediumHardCount < limit,
      remaining,
      limit
    };
  }

  async incrementDailyMediumHardCount(userId: string, today: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      // Reset count if it's a new day
      if (user.lastMediumHardDate !== today) {
        user.dailyMediumHardCount = 0;
      }
      user.dailyMediumHardCount += 1;
      user.lastMediumHardDate = today;
      this.users.set(userId, user);
    }
  }

  async checkDailyPremiumFeedbackLimit(userId: string, today: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const user = this.users.get(userId);
    const limit = 2; // Free users get 2 premium feedback matches per day
    
    if (!user) {
      return { allowed: false, remaining: 0, limit };
    }
    
    // Premium users have unlimited
    if (user.isPremium === 1) {
      return { allowed: true, remaining: 999, limit: 999 };
    }
    
    // Reset count if it's a new day
    if (user.lastPremiumFeedbackDate !== today) {
      user.dailyPremiumFeedbackCount = 0;
      user.lastPremiumFeedbackDate = today;
      this.users.set(userId, user);
    }
    
    const remaining = Math.max(0, limit - user.dailyPremiumFeedbackCount);
    return {
      allowed: user.dailyPremiumFeedbackCount < limit,
      remaining,
      limit
    };
  }

  async incrementDailyPremiumFeedbackCount(userId: string, today: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      // Reset count if it's a new day
      if (user.lastPremiumFeedbackDate !== today) {
        user.dailyPremiumFeedbackCount = 0;
      }
      user.dailyPremiumFeedbackCount += 1;
      user.lastPremiumFeedbackDate = today;
      this.users.set(userId, user);
    }
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    user.stripeCustomerId = customerId;
    user.stripeSubscriptionId = subscriptionId;
    this.users.set(userId, user);
    return user;
  }

  // Premium whitelist methods (MemStorage - in-memory only)
  private whitelist: Map<string, PremiumWhitelist> = new Map();

  async addToWhitelist(email: string, addedBy?: string): Promise<PremiumWhitelist> {
    const entry: PremiumWhitelist = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      addedBy: addedBy || null,
      createdAt: new Date(),
    };
    this.whitelist.set(email.toLowerCase(), entry);
    return entry;
  }

  async removeFromWhitelist(email: string): Promise<void> {
    this.whitelist.delete(email.toLowerCase());
  }

  async isEmailWhitelisted(email: string): Promise<boolean> {
    return this.whitelist.has(email.toLowerCase());
  }

  async getAllWhitelistedEmails(): Promise<PremiumWhitelist[]> {
    return Array.from(this.whitelist.values());
  }
}

// Database storage implementation using Drizzle ORM
export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
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

  async updateUserActivity(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        isOnline: 1,
        lastSeenAt: new Date(),
      })
      .where(eq(users.id, userId));
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
    
    // Keep only the last 20 matches per user per language
    if (matchData.userId && matchData.language) {
      const allUserMatches = await db
        .select()
        .from(matches)
        .where(and(
          eq(matches.userId, matchData.userId),
          eq(matches.language, matchData.language)
        ))
        .orderBy(desc(matches.createdAt));
      
      // If more than 20 matches, delete the oldest ones
      if (allUserMatches.length > 20) {
        const matchesToDelete = allUserMatches.slice(20);
        const idsToDelete = matchesToDelete.map(m => m.id);
        
        await db
          .delete(matches)
          .where(inArray(matches.id, idsToDelete));
      }
    }
    
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

  async updateWinStreak(userId: string, language: string, isWin: boolean, isForfeit: boolean): Promise<UserLanguageStats> {
    const stats = await this.getUserLanguageStats(userId, language) || await this.upsertUserLanguageStats({ userId, language });
    
    if (isForfeit) {
      // Forfeits don't affect win streaks
      return stats;
    }
    
    if (isWin) {
      const newStreak = stats.winStreak + 1;
      const newBestStreak = Math.max(newStreak, stats.bestWinStreak);
      
      const result = await db
        .update(userLanguageStats)
        .set({
          winStreak: newStreak,
          bestWinStreak: newBestStreak,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userLanguageStats.userId, userId),
          eq(userLanguageStats.language, language)
        ))
        .returning();
      return result[0];
    } else {
      const result = await db
        .update(userLanguageStats)
        .set({
          winStreak: 0,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userLanguageStats.userId, userId),
          eq(userLanguageStats.language, language)
        ))
        .returning();
      return result[0];
    }
  }

  async updateDailyLoginStreak(userId: string, language: string): Promise<UserLanguageStats> {
    const stats = await this.getUserLanguageStats(userId, language) || await this.upsertUserLanguageStats({ userId, language });
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (stats.lastLoginDate === today) {
      // Already logged in today, no update needed
      return stats;
    }
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const isConsecutive = stats.lastLoginDate === yesterday;
    const newStreak = isConsecutive ? stats.dailyLoginStreak + 1 : 1;
    
    const result = await db
      .update(userLanguageStats)
      .set({
        dailyLoginStreak: newStreak,
        lastLoginDate: today,
        updatedAt: new Date(),
      })
      .where(and(
        eq(userLanguageStats.userId, userId),
        eq(userLanguageStats.language, language)
      ))
      .returning();
    return result[0];
  }

  async sendFriendRequest(userId: string, friendUsername: string): Promise<Friend> {
    // Find friend by username (email)
    const friendUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, friendUsername))
      .limit(1);
    
    if (friendUsers.length === 0) {
      throw new Error("User not found");
    }
    
    const friendUser = friendUsers[0];
    
    if (friendUser.id === userId) {
      throw new Error("Cannot add yourself as a friend");
    }
    
    // Check if friendship already exists
    const existing = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendUser.id)),
          and(eq(friends.userId, friendUser.id), eq(friends.friendId, userId))
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      throw new Error("Friend request already exists");
    }
    
    const result = await db
      .insert(friends)
      .values({
        userId,
        friendId: friendUser.id,
        status: "pending",
      })
      .returning();
    
    return result[0];
  }

  async getFriendshipById(friendshipId: string): Promise<Friend | undefined> {
    const result = await db
      .select()
      .from(friends)
      .where(eq(friends.id, friendshipId))
      .limit(1);
    return result[0];
  }

  async acceptFriendRequest(friendshipId: string): Promise<Friend> {
    const result = await db
      .update(friends)
      .set({ status: "accepted" })
      .where(eq(friends.id, friendshipId))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Friend request not found");
    }
    
    return result[0];
  }

  async rejectFriendRequest(friendshipId: string): Promise<void> {
    await db.delete(friends).where(eq(friends.id, friendshipId));
  }

  async removeFriend(friendshipId: string): Promise<void> {
    await db.delete(friends).where(eq(friends.id, friendshipId));
  }

  async getFriends(userId: string): Promise<Array<Friend & { friendUser: User; friendStats?: UserLanguageStats }>> {
    const friendships = await db
      .select()
      .from(friends)
      .where(
        and(
          or(eq(friends.userId, userId), eq(friends.friendId, userId)),
          eq(friends.status, "accepted")
        )
      );
    
    const result = [];
    for (const friendship of friendships) {
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      const friendUser = await this.getUser(friendId);
      
      if (friendUser) {
        result.push({
          ...friendship,
          friendUser,
          friendStats: undefined,
        });
      }
    }
    
    return result;
  }

  async getPendingFriendRequests(userId: string): Promise<Array<Friend & { requesterUser: User }>> {
    const requests = await db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.status, "pending")
        )
      );
    
    const result = [];
    for (const request of requests) {
      const requesterUser = await this.getUser(request.userId);
      
      if (requesterUser) {
        result.push({
          ...request,
          requesterUser,
        });
      }
    }
    
    return result;
  }

  async createPrivateMatchInvite(inviteData: InsertPrivateMatchInvite): Promise<PrivateMatchInvite> {
    const result = await db
      .insert(privateMatchInvites)
      .values(inviteData)
      .returning();
    return result[0];
  }

  async getPrivateMatchInvite(inviteCode: string): Promise<PrivateMatchInvite | undefined> {
    const result = await db
      .select()
      .from(privateMatchInvites)
      .where(eq(privateMatchInvites.inviteCode, inviteCode))
      .limit(1);
    return result[0];
  }

  async updatePrivateMatchInviteStatus(inviteCode: string, status: string): Promise<void> {
    await db
      .update(privateMatchInvites)
      .set({ status })
      .where(eq(privateMatchInvites.inviteCode, inviteCode));
  }

  async checkDailyMediumHardLimit(userId: string, today: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const user = await this.getUser(userId);
    const limit = 3;
    
    if (!user) {
      return { allowed: false, remaining: 0, limit };
    }
    
    // Reset count if it's a new day
    if (user.lastMediumHardDate !== today) {
      await db
        .update(users)
        .set({
          dailyMediumHardCount: 0,
          lastMediumHardDate: today,
        })
        .where(eq(users.id, userId));
      
      return { allowed: true, remaining: limit, limit };
    }
    
    const remaining = Math.max(0, limit - user.dailyMediumHardCount);
    return {
      allowed: user.dailyMediumHardCount < limit,
      remaining,
      limit
    };
  }

  async incrementDailyMediumHardCount(userId: string, today: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    // Reset count if it's a new day
    if (user.lastMediumHardDate !== today) {
      await db
        .update(users)
        .set({
          dailyMediumHardCount: 1,
          lastMediumHardDate: today,
        })
        .where(eq(users.id, userId));
    } else {
      await db
        .update(users)
        .set({
          dailyMediumHardCount: user.dailyMediumHardCount + 1,
        })
        .where(eq(users.id, userId));
    }
  }

  async checkDailyPremiumFeedbackLimit(userId: string, today: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const user = await this.getUser(userId);
    const limit = 2; // Free users get 2 premium feedback matches per day
    
    if (!user) {
      return { allowed: false, remaining: 0, limit };
    }
    
    // Premium users have unlimited
    if (user.isPremium === 1) {
      return { allowed: true, remaining: 999, limit: 999 };
    }
    
    // Reset count if it's a new day
    if (user.lastPremiumFeedbackDate !== today) {
      await db
        .update(users)
        .set({
          dailyPremiumFeedbackCount: 0,
          lastPremiumFeedbackDate: today,
        })
        .where(eq(users.id, userId));
      
      return { allowed: true, remaining: limit, limit };
    }
    
    const remaining = Math.max(0, limit - user.dailyPremiumFeedbackCount);
    return {
      allowed: user.dailyPremiumFeedbackCount < limit,
      remaining,
      limit
    };
  }

  async incrementDailyPremiumFeedbackCount(userId: string, today: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    // Reset count if it's a new day
    if (user.lastPremiumFeedbackDate !== today) {
      await db
        .update(users)
        .set({
          dailyPremiumFeedbackCount: 1,
          lastPremiumFeedbackDate: today,
        })
        .where(eq(users.id, userId));
    } else {
      await db
        .update(users)
        .set({
          dailyPremiumFeedbackCount: user.dailyPremiumFeedbackCount + 1,
        })
        .where(eq(users.id, userId));
    }
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const result = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${userId} not found`);
    }
    
    return result[0];
  }

  // Premium whitelist methods (DbStorage - database-backed)
  async addToWhitelist(email: string, addedBy?: string): Promise<PremiumWhitelist> {
    const result = await db
      .insert(premiumWhitelist)
      .values({
        email: email.toLowerCase(),
        addedBy: addedBy || null,
      })
      .returning();
    return result[0];
  }

  async removeFromWhitelist(email: string): Promise<void> {
    await db
      .delete(premiumWhitelist)
      .where(eq(premiumWhitelist.email, email.toLowerCase()));
  }

  async isEmailWhitelisted(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(premiumWhitelist)
      .where(eq(premiumWhitelist.email, email.toLowerCase()))
      .limit(1);
    return result.length > 0;
  }

  async getAllWhitelistedEmails(): Promise<PremiumWhitelist[]> {
    return await db.select().from(premiumWhitelist);
  }
}

// Use database storage for persistent data
export const storage = new DbStorage();
