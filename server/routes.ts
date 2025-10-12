import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradingRequestSchema } from "@shared/schema";
import { gradeConversation, generateBotResponse } from "./openai";
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

  // Generate bot response
  app.post("/api/bot-response", async (req, res) => {
    try {
      const { conversationHistory, topic, vocabulary, language = "Chinese", difficulty = "Medium" } = req.body;
      const response = await generateBotResponse(conversationHistory, topic, vocabulary, language, difficulty);
      res.json({ response });
    } catch (error: any) {
      console.error("Bot response error:", error);
      res.status(500).json({ 
        error: "Failed to generate response",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
