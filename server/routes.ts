import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradingRequestSchema } from "@shared/schema";
import { gradeConversation, generateBotResponse } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
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
