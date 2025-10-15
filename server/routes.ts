import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradingRequestSchema } from "@shared/schema";
import { gradeConversation, generateBotQuestion, generateBotAnswer, validateQuestion, generateVocabulary, translateText, generateExampleResponse } from "./openai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupMatchmaking } from "./matchmaking";
import { vocabularyCache } from "./vocabularyCache";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth route - get current user (returns null if not authenticated)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Update user's online status and last seen
      await storage.updateUserActivity(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Heartbeat endpoint to keep user marked as online
  app.post('/api/user/heartbeat', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user.claims.sub;
      await storage.updateUserActivity(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user activity:", error);
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  // Check if user can play medium/hard mode
  app.post('/api/user/check-difficulty-access', async (req: any, res) => {
    try {
      const { difficulty } = req.body;
      
      // Beginner and Easy are always allowed
      if (difficulty === 'Beginner' || difficulty === 'Easy') {
        return res.json({ allowed: true, isPremium: false });
      }
      
      // Check if user is authenticated and premium
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        // Premium users have unlimited access
        if (user?.isPremium === 1) {
          return res.json({ allowed: true, isPremium: true });
        }
        
        // Free users: check daily limit (3 matches for Medium/Hard)
        const today = new Date().toISOString().split('T')[0];
        const canPlay = await storage.checkDailyMediumHardLimit(userId, today);
        
        return res.json({ 
          allowed: canPlay.allowed, 
          isPremium: false,
          remaining: canPlay.remaining,
          limit: canPlay.limit
        });
      }
      
      // Guest users cannot play Medium/Hard
      return res.json({ allowed: false, isPremium: false, message: "Sign in required for Medium/Hard modes" });
    } catch (error) {
      console.error("Error checking difficulty access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  // Track medium/hard match start
  app.post('/api/user/track-medium-hard-match', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      
      await storage.incrementDailyMediumHardCount(userId, today);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking match:", error);
      res.status(500).json({ message: "Failed to track match" });
    }
  });

  // Grade conversation
  app.post("/api/grade", async (req: any, res) => {
    try {
      const request = gradingRequestSchema.parse(req.body);
      
      // Check if user is premium (for detailed feedback)
      let isPremium = false;
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const user = await storage.getUser(req.user.claims.sub);
        isPremium = user?.isPremium === 1;
      }
      
      const result = await gradeConversation(request, isPremium);
      res.json(result);
    } catch (error: any) {
      console.error("Grading error:", error);
      res.status(500).json({ 
        error: "Failed to grade conversation",
        message: error.message 
      });
    }
  });

  // Generate bot question
  app.post("/api/bot-question", async (req, res) => {
    try {
      const { topic, vocabulary, language = "Chinese", difficulty = "Medium", previousQuestions = [], isPracticeMode = false } = req.body;
      const question = await generateBotQuestion(topic, vocabulary, language, difficulty, previousQuestions, isPracticeMode);
      res.json({ question });
    } catch (error: any) {
      console.error("Bot question error:", error);
      res.status(500).json({ 
        error: "Failed to generate question",
        message: error.message 
      });
    }
  });

  // Generate bot answer
  app.post("/api/bot-answer", async (req, res) => {
    try {
      const { userQuestion, topic, vocabulary, language = "Chinese", difficulty = "Medium", isPracticeMode = false } = req.body;
      const answer = await generateBotAnswer(userQuestion, topic, vocabulary, language, difficulty, isPracticeMode);
      res.json({ answer });
    } catch (error: any) {
      console.error("Bot answer error:", error);
      res.status(500).json({ 
        error: "Failed to generate answer",
        message: error.message 
      });
    }
  });

  // Validate user question with AI
  app.post("/api/validate-question", async (req, res) => {
    try {
      const { question, topic, vocabulary, language = "Chinese" } = req.body;
      const result = await validateQuestion(question, topic, vocabulary, language);
      res.json(result);
    } catch (error: any) {
      console.error("Question validation error:", error);
      res.status(500).json({ 
        error: "Failed to validate question",
        message: error.message 
      });
    }
  });

  // Translate text to English (for beginner mode hover translation)
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, fromLanguage } = req.body;
      const translation = await translateText(text, fromLanguage);
      res.json({ translation });
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        error: "Failed to translate text",
        message: error.message 
      });
    }
  });

  // Generate example response for beginner mode help
  app.post("/api/generate-example", async (req, res) => {
    try {
      const { language, difficulty, topic, vocabulary, phase, context } = req.body;
      const example = await generateExampleResponse({
        language,
        difficulty,
        topic,
        vocabulary,
        phase,
        context
      });
      res.json({ example });
    } catch (error: any) {
      console.error("Example generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate example",
        message: error.message 
      });
    }
  });

  // Generate vocabulary words with AI (with caching)
  app.post("/api/generate-vocabulary", async (req, res) => {
    try {
      const { topic, language, difficulty = "Medium" } = req.body;
      
      // Check cache first
      const cachedVocabulary = vocabularyCache.get({ topic, language, difficulty });
      
      if (cachedVocabulary) {
        console.log(`Cache hit for ${topic}/${language}/${difficulty}`);
        return res.json({ vocabulary: cachedVocabulary, cached: true });
      }
      
      // Generate new vocabulary if not in cache
      console.log(`Cache miss for ${topic}/${language}/${difficulty} - generating new vocabulary`);
      const vocabulary = await generateVocabulary(topic, language, difficulty);
      
      // Store in cache for future use
      vocabularyCache.set({ topic, language, difficulty }, vocabulary);
      
      res.json({ vocabulary, cached: false });
    } catch (error: any) {
      console.error("Vocabulary generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate vocabulary",
        message: error.message 
      });
    }
  });

  // Get user stats for a language
  app.get("/api/user/stats/:language", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const language = req.params.language;
      
      // Update daily login streak
      const stats = await storage.updateDailyLoginStreak(userId, language);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Update user stats for a language
  app.post("/api/user/stats", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { language, elo, wins, losses } = req.body;
      
      if (!language) {
        return res.status(400).json({ message: "Language is required" });
      }

      const updatedStats = await storage.upsertUserLanguageStats({
        userId,
        language,
        elo,
        wins,
        losses,
      });

      res.json(updatedStats);
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });

  // Save match result
  app.post("/api/match/save", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { opponent, result, eloChange, language, difficulty, scores, isForfeit, conversation, detailedFeedback, topic } = req.body;
      
      const match = await storage.createMatch({
        userId,
        opponent,
        result,
        eloChange,
        language,
        difficulty,
        grammarScore: scores.grammar,
        fluencyScore: scores.fluency,
        vocabularyScore: scores.vocabulary,
        naturalnessScore: scores.naturalness,
        overallScore: scores.overall,
        isForfeit: isForfeit ? 1 : 0, // Convert boolean to integer for SQLite-style storage
        conversation: conversation || null, // Full chat log
        detailedFeedback: detailedFeedback || null, // Detailed AI feedback with corrections
        topic: topic || null, // Match topic
      });

      // Update win streak
      await storage.updateWinStreak(userId, language, result === 'win', isForfeit || false);

      res.json(match);
    } catch (error) {
      console.error("Error saving match:", error);
      res.status(500).json({ message: "Failed to save match" });
    }
  });

  // Get user matches
  app.get("/api/user/matches", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const language = req.query.language as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const matches = await storage.getUserMatches(userId, language, limit);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Get user skill progress
  app.get("/api/user/skill-progress", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const language = req.query.language as string | undefined;
      
      const progress = await storage.getUserSkillProgress(userId, language);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching skill progress:", error);
      res.status(500).json({ message: "Failed to fetch skill progress" });
    }
  });

  // Get leaderboard for a specific language
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const language = (req.query.language as string) || "Chinese";
      const allStats = await storage.getAllLanguageStats(language);
      const allUsers = await storage.getAllUsers();
      
      // Create a map of userId to user for quick lookup
      const userMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Sort by Elo (descending) and map to leaderboard format
      const leaderboard = allStats
        .filter(stats => stats.wins + stats.losses > 0) // Only show users with at least 1 match
        .sort((a, b) => b.elo - a.elo)
        .map(stats => {
          const user = userMap.get(stats.userId);
          return {
            username: user?.firstName || user?.email?.split('@')[0] || "Unknown",
            elo: stats.elo,
            wins: stats.wins,
            losses: stats.losses,
          };
        });
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Send friend request
  app.post("/api/friends/request", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { friendUsername } = req.body;
      
      if (!friendUsername) {
        return res.status(400).json({ message: "Friend username is required" });
      }
      
      const friendship = await storage.sendFriendRequest(userId, friendUsername);
      res.json(friendship);
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      res.status(400).json({ message: error.message || "Failed to send friend request" });
    }
  });

  // Accept friend request
  app.post("/api/friends/accept/:friendshipId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { friendshipId } = req.params;
      
      // Verify user is the recipient of this friend request
      const existingFriendship = await storage.getFriendshipById(friendshipId);
      if (!existingFriendship) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      if (existingFriendship.friendId !== userId) {
        return res.status(403).json({ message: "Unauthorized to accept this request" });
      }
      
      const friendship = await storage.acceptFriendRequest(friendshipId);
      res.json(friendship);
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
      res.status(400).json({ message: error.message || "Failed to accept friend request" });
    }
  });

  // Reject friend request
  app.post("/api/friends/reject/:friendshipId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { friendshipId } = req.params;
      
      // Verify user is the recipient of this friend request
      const existingFriendship = await storage.getFriendshipById(friendshipId);
      if (!existingFriendship) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      if (existingFriendship.friendId !== userId) {
        return res.status(403).json({ message: "Unauthorized to reject this request" });
      }
      
      await storage.rejectFriendRequest(friendshipId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error rejecting friend request:", error);
      res.status(400).json({ message: error.message || "Failed to reject friend request" });
    }
  });

  // Remove friend
  app.delete("/api/friends/:friendshipId", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { friendshipId } = req.params;
      
      // Verify user is a participant in this friendship
      const existingFriendship = await storage.getFriendshipById(friendshipId);
      if (!existingFriendship) {
        return res.status(404).json({ message: "Friendship not found" });
      }
      
      if (existingFriendship.userId !== userId && existingFriendship.friendId !== userId) {
        return res.status(403).json({ message: "Unauthorized to remove this friendship" });
      }
      
      await storage.removeFriend(friendshipId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing friend:", error);
      res.status(400).json({ message: error.message || "Failed to remove friend" });
    }
  });

  // Get friends list
  app.get("/api/friends", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  // Get pending friend requests
  app.get("/api/friends/requests", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const requests = await storage.getPendingFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  // Create private match invite
  app.post("/api/private-match/create", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { language, difficulty, topic } = req.body;
      
      // Generate a random 6-digit number invite code
      const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Invite expires in 24 hours
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const invite = await storage.createPrivateMatchInvite({
        inviteCode,
        creatorId: userId,
        language,
        difficulty,
        topic: topic || null,
        status: "pending",
        expiresAt,
      });
      
      res.json(invite);
    } catch (error) {
      console.error("Error creating private match invite:", error);
      res.status(500).json({ message: "Failed to create invite" });
    }
  });

  // Get private match invite by code
  app.get("/api/private-match/:inviteCode", async (req, res) => {
    try {
      const { inviteCode } = req.params;
      const invite = await storage.getPrivateMatchInvite(inviteCode);
      
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }
      
      // Check if expired
      if (new Date() > new Date(invite.expiresAt)) {
        return res.status(410).json({ message: "Invite expired" });
      }
      
      if (invite.status !== "pending") {
        return res.status(400).json({ message: "Invite already used" });
      }
      
      res.json(invite);
    } catch (error) {
      console.error("Error fetching invite:", error);
      res.status(500).json({ message: "Failed to fetch invite" });
    }
  });

  // Join private match by invite code
  app.post("/api/private-match/join", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { inviteCode } = req.body;
      
      if (!inviteCode) {
        return res.status(400).json({ message: "Invite code is required" });
      }
      
      const invite = await storage.getPrivateMatchInvite(inviteCode);
      
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }
      
      // Check if user is trying to join their own invite
      if (invite.creatorId === userId) {
        return res.status(400).json({ message: "Cannot join your own invite" });
      }
      
      // Verify that joiner is friends with creator
      const friends = await storage.getFriends(userId);
      const isFriend = friends.some(f => 
        (f.userId === invite.creatorId || f.friendId === invite.creatorId) && 
        f.status === "accepted"
      );
      
      if (!isFriend) {
        return res.status(403).json({ message: "You must be friends with the creator to join this match" });
      }
      
      // Check if expired
      if (new Date() > new Date(invite.expiresAt)) {
        return res.status(410).json({ message: "Invite expired" });
      }
      
      if (invite.status !== "pending") {
        return res.status(400).json({ message: "Invite already used" });
      }
      
      // Mark invite as used
      await storage.updatePrivateMatchInviteStatus(inviteCode, "used");
      
      // Return match setup data
      res.json({
        success: true,
        matchData: {
          opponentId: invite.creatorId,
          language: invite.language,
          difficulty: invite.difficulty,
          topic: invite.topic,
          isPracticeMode: false, // Private matches are always competitive
        }
      });
    } catch (error) {
      console.error("Error joining private match:", error);
      res.status(500).json({ message: "Failed to join private match" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket matchmaking
  setupMatchmaking(httpServer);

  return httpServer;
}
