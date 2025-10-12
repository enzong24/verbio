import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradingRequestSchema } from "@shared/schema";
import { gradeConversation, generateBotQuestion, generateBotAnswer } from "./openai";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Grade conversation
  app.post("/api/grade", async (req, res) => {
    try {
      const request = gradingRequestSchema.parse(req.body);
      const result = await gradeConversation(request);
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
      const { topic, vocabulary, language = "Chinese", difficulty = "Medium", previousQuestions = [] } = req.body;
      const question = await generateBotQuestion(topic, vocabulary, language, difficulty, previousQuestions);
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
      const { userQuestion, topic, vocabulary, language = "Chinese", difficulty = "Medium" } = req.body;
      const answer = await generateBotAnswer(userQuestion, topic, vocabulary, language, difficulty);
      res.json({ answer });
    } catch (error: any) {
      console.error("Bot answer error:", error);
      res.status(500).json({ 
        error: "Failed to generate answer",
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
      
      const stats = await storage.getUserLanguageStats(userId, language);
      res.json(stats || { elo: 1000, wins: 0, losses: 0 });
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
      const { opponent, result, eloChange, language, difficulty, scores } = req.body;
      
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
      });

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

  const httpServer = createServer(app);

  return httpServer;
}
