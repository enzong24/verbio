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

  // Update user stats
  app.post("/api/user/stats", async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const { elo, wins, losses } = req.body;
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...existingUser,
        elo: elo ?? existingUser.elo,
        wins: wins ?? existingUser.wins,
        losses: losses ?? existingUser.losses,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Sort by Elo (descending) and map to leaderboard format
      const leaderboard = allUsers
        .filter(user => user.wins + user.losses > 0) // Only show users with at least 1 match
        .sort((a, b) => b.elo - a.elo)
        .map(user => ({
          username: user.firstName || user.email?.split('@')[0] || "Unknown",
          elo: user.elo,
          wins: user.wins,
          losses: user.losses,
        }));
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
