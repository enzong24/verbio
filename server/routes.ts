import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gradingRequestSchema, users } from "@shared/schema";
import { gradeConversation, generateBotQuestion, generateBotAnswer, validateQuestion, generateVocabulary, translateText, generateExampleResponse } from "./openai";
import { setupMatchmaking } from "./matchmaking";
import { vocabularyCache } from "./vocabularyCache";
import { db } from "./db";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { setupAuth, isAuthenticated } from "./googleAuth";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Google OAuth authentication
  await setupAuth(app);

  // Auth route - get current user (protected by isAuthenticated)
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      
      // Update user's online status and last seen
      if (user) {
        await storage.updateUserActivity(userId);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Heartbeat endpoint to keep user marked as online
  app.post('/api/user/heartbeat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (userId) {
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
  app.post('/api/user/track-medium-hard-match', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      const today = new Date().toISOString().split('T')[0];
      
      await storage.incrementDailyMediumHardCount(userId, today);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking match:", error);
      res.status(500).json({ message: "Failed to track match" });
    }
  });

  // Get practice bots by language (for bot selection in practice mode)
  app.get("/api/bots", async (req, res) => {
    try {
      const { language } = req.query;
      const { getPracticeBotsByLanguage } = await import('./botProfiles.js');
      
      if (!language || typeof language !== 'string') {
        return res.status(400).json({ message: "Language parameter is required" });
      }
      
      const bots = getPracticeBotsByLanguage(language);
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  // Get single bot by ID
  app.get("/api/bots/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { getBotById } = await import('./botProfiles.js');
      
      const bot = getBotById(id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  // Grade conversation
  app.post("/api/grade", async (req: any, res) => {
    try {
      const request = gradingRequestSchema.parse(req.body);
      
      // Check if user is premium (for detailed feedback)
      let isPremium = false;
      const userId = req.user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      if (userId) {
        const user = await storage.getUser(userId);
        isPremium = user?.isPremium === 1;
        
        // For free users, check daily premium feedback limit
        if (!isPremium) {
          const feedbackLimit = await storage.checkDailyPremiumFeedbackLimit(userId, today);
          
          // If allowed, give premium feedback and increment counter
          if (feedbackLimit.allowed) {
            isPremium = true; // Give them premium feedback
            await storage.incrementDailyPremiumFeedbackCount(userId, today);
          }
          // Otherwise isPremium stays false, they get basic feedback
        }
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
      const { topic, vocabulary, language = "Chinese", difficulty = "Medium", previousQuestions = [], isPracticeMode = false, botId } = req.body;
      
      let botPersonality: string | undefined = undefined;
      if (botId) {
        const { getBotById } = await import('./botProfiles.js');
        const bot = getBotById(botId);
        if (bot) {
          botPersonality = bot.personality;
        }
      }
      
      const question = await generateBotQuestion(topic, vocabulary, language, difficulty, previousQuestions, isPracticeMode, botPersonality);
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
      const { userQuestion, topic, vocabulary, language = "Chinese", difficulty = "Medium", isPracticeMode = false, botId } = req.body;
      
      let botPersonality: string | undefined = undefined;
      if (botId) {
        const { getBotById } = await import('./botProfiles.js');
        const bot = getBotById(botId);
        if (bot) {
          botPersonality = bot.personality;
        }
      }
      
      const answer = await generateBotAnswer(userQuestion, topic, vocabulary, language, difficulty, isPracticeMode, botPersonality);
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
      const { question, topic, vocabulary, language = "Chinese", messages = [] } = req.body;
      
      // Normalize text for comparison (remove diacritics, spaces, punctuation, convert to lowercase)
      const normalizeText = (text: string) => 
        text.normalize('NFD') // Decompose combined characters
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fff]/g, '') // Remove all non-letter/number characters
          .trim();
      
      const normalizedNewQuestion = normalizeText(question);
      
      // Check if user is repeating their own previous question
      const userQuestions = messages
        .filter((m: any) => m.sender === "user")
        .map((m: any) => m.text || "");
      
      for (const prevQuestion of userQuestions) {
        const normalizedPrevQuestion = normalizeText(prevQuestion || "");
        
        if (normalizedNewQuestion && normalizedPrevQuestion) {
          const similarity = normalizedNewQuestion === normalizedPrevQuestion ||
                           normalizedNewQuestion.includes(normalizedPrevQuestion) ||
                           normalizedPrevQuestion.includes(normalizedNewQuestion);
          
          if (similarity) {
            return res.json({
              isValid: false,
              message: "You already asked this question. Please ask something different."
            });
          }
        }
      }
      
      // Check for duplicate questions (copying opponent's question)
      const opponentMessages = messages.filter((m: any) => m.sender === "opponent");
      if (opponentMessages.length > 0) {
        const lastOpponentQuestion = opponentMessages[opponentMessages.length - 1]?.text || "";
        const normalizedOpponentQuestion = normalizeText(lastOpponentQuestion || "");
        
        // Check if questions are too similar (exact match or substring match)
        if (normalizedNewQuestion && normalizedOpponentQuestion) {
          const similarity = normalizedNewQuestion === normalizedOpponentQuestion ||
                           normalizedNewQuestion.includes(normalizedOpponentQuestion) ||
                           normalizedOpponentQuestion.includes(normalizedNewQuestion);
          
          if (similarity) {
            return res.json({
              isValid: false,
              message: "Please ask your own original question. Don't copy your opponent's question."
            });
          }
        }
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { opponent, result, eloChange, language, difficulty, scores, isForfeit, conversation, detailedFeedback, topic, isPracticeMode } = req.body;
      
      // Get current stats to check for level-up (only for competitive matches)
      let levelUpInfo = null;
      if (!isPracticeMode && eloChange !== 0) {
        const currentStats = await storage.getUserLanguageStats(userId, language);
        if (currentStats) {
          const oldElo = currentStats.elo;
          const newElo = oldElo + eloChange;
          
          // Check if user leveled up
          const { checkLevelUp, getFluencyLevel } = await import("@shared/fluencyLevels");
          const levelCheck = checkLevelUp(oldElo, newElo);
          
          if (levelCheck.leveledUp) {
            // Update highest fluency level achieved
            const newLevel = getFluencyLevel(newElo);
            await storage.updateHighestFluencyLevel(userId, language, newLevel.level);
            
            levelUpInfo = {
              leveledUp: true,
              oldLevel: levelCheck.oldLevel,
              newLevel: levelCheck.newLevel,
            };
          }
        }
      }
      
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
        isPracticeMode: isPracticeMode ? 1 : 0, // 0 = competitive, 1 = practice
        conversation: conversation || null, // Full chat log
        detailedFeedback: detailedFeedback || null, // Detailed AI feedback with corrections
        topic: topic || null, // Match topic
      });

      // Update win streak (only for competitive matches, not practice)
      if (!isPracticeMode) {
        await storage.updateWinStreak(userId, language, result === 'win', isForfeit || false);
      }

      res.json({ ...match, levelUpInfo });
    } catch (error) {
      console.error("Error saving match:", error);
      res.status(500).json({ message: "Failed to save match" });
    }
  });

  // Get user matches
  app.get("/api/user/matches", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const language = req.query.language as string | undefined;
      
      const progress = await storage.getUserSkillProgress(userId, language);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching skill progress:", error);
      res.status(500).json({ message: "Failed to fetch skill progress" });
    }
  });

  // Get study recommendations based on aggregated match feedback
  app.get("/api/user/study-recommendations", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const language = req.query.language as string | undefined;
      
      // Fetch recent matches (last 20 matches)
      const matches = await storage.getUserMatches(userId, language, 20);
      
      // Filter matches that have any feedback AND are competitive (exclude practice mode)
      const matchesWithFeedback = matches.filter(m => m.detailedFeedback && m.isPracticeMode === 0);
      
      if (matchesWithFeedback.length === 0) {
        return res.json({
          grammarIssues: [],
          vocabularyTips: [],
          generalAdvice: [],
          totalMatches: 0
        });
      }
      
      // Aggregate feedback
      const grammarPatterns = new Map<string, number>();
      const vocabularyPatterns = new Map<string, number>();
      const improvementPatterns = new Map<string, number>();
      
      matchesWithFeedback.forEach(match => {
        const feedback = match.detailedFeedback as any;
        
        // Handle new format: { messageAnalysis: [...], generalFeedback: [...] }
        if (feedback.messageAnalysis && Array.isArray(feedback.messageAnalysis)) {
          // Premium users: detailed message-by-message analysis
          feedback.messageAnalysis.forEach((analysis: any) => {
            // Aggregate grammar corrections
            if (analysis.grammarCorrections) {
              analysis.grammarCorrections.forEach((correction: any) => {
                const key = correction.explanation || correction.corrected;
                grammarPatterns.set(key, (grammarPatterns.get(key) || 0) + 1);
              });
            }
            
            // Aggregate vocabulary suggestions
            if (analysis.vocabularySuggestions) {
              analysis.vocabularySuggestions.forEach((suggestion: any) => {
                const key = `${suggestion.word} → ${suggestion.betterAlternative}: ${suggestion.reason}`;
                vocabularyPatterns.set(key, (vocabularyPatterns.get(key) || 0) + 1);
              });
            }
            
            // Aggregate improvement suggestions
            if (analysis.improvements) {
              analysis.improvements.forEach((improvement: string) => {
                improvementPatterns.set(improvement, (improvementPatterns.get(improvement) || 0) + 1);
              });
            }
          });
        }
        
        // Handle general feedback (free users)
        if (feedback.generalFeedback && Array.isArray(feedback.generalFeedback)) {
          feedback.generalFeedback.forEach((tip: string) => {
            improvementPatterns.set(tip, (improvementPatterns.get(tip) || 0) + 1);
          });
        }
        
        // Handle legacy format (old matches with array directly)
        if (Array.isArray(feedback) && !(feedback as any).messageAnalysis) {
          (feedback as any[]).forEach((analysis: any) => {
            if (analysis.grammarCorrections) {
              analysis.grammarCorrections.forEach((correction: any) => {
                const key = correction.explanation || correction.corrected;
                grammarPatterns.set(key, (grammarPatterns.get(key) || 0) + 1);
              });
            }
            if (analysis.vocabularySuggestions) {
              analysis.vocabularySuggestions.forEach((suggestion: any) => {
                const key = `${suggestion.word} → ${suggestion.betterAlternative}: ${suggestion.reason}`;
                vocabularyPatterns.set(key, (vocabularyPatterns.get(key) || 0) + 1);
              });
            }
            if (analysis.improvements) {
              analysis.improvements.forEach((improvement: string) => {
                improvementPatterns.set(improvement, (improvementPatterns.get(improvement) || 0) + 1);
              });
            }
          });
        }
      });
      
      // Sort and get top recommendations
      const topGrammar = Array.from(grammarPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue, count]) => ({ issue, count }));
      
      const topVocabulary = Array.from(vocabularyPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tip, count]) => ({ tip, count }));
      
      const topImprovements = Array.from(improvementPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([advice, count]) => ({ advice, count }));
      
      res.json({
        grammarIssues: topGrammar,
        vocabularyTips: topVocabulary,
        generalAdvice: topImprovements,
        totalMatches: matchesWithFeedback.length
      });
    } catch (error) {
      console.error("Error fetching study recommendations:", error);
      res.status(500).json({ message: "Failed to fetch study recommendations" });
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const requests = await storage.getPendingFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  // Create friend challenge (direct, no code)
  app.post("/api/friends/challenge", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { friendId, language, difficulty, topic } = req.body;
      
      if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
      }
      
      // Verify friendship
      const friends = await storage.getFriends(userId);
      const isFriend = friends.some(f => 
        (f.userId === friendId || f.friendId === friendId) && 
        f.status === "accepted"
      );
      
      if (!isFriend) {
        return res.status(403).json({ message: "You can only challenge friends" });
      }
      
      // Challenge expires in 24 hours
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const invite = await storage.createPrivateMatchInvite({
        recipientId: friendId,
        creatorId: userId,
        language: language || "Chinese",
        difficulty: difficulty || "Medium",
        topic: topic || null,
        status: "pending",
        expiresAt,
      });
      
      res.json(invite);
    } catch (error) {
      console.error("Error creating friend challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  // Get pending match challenges
  app.get("/api/friends/challenges", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const challenges = await storage.getPendingMatchChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  // Accept friend challenge
  app.post("/api/friends/challenges/:challengeId/accept", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { challengeId } = req.params;
      const challenge = await storage.getPrivateMatchInvite(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      if (challenge.recipientId !== userId) {
        return res.status(403).json({ message: "This challenge is not for you" });
      }
      
      if (challenge.status !== "pending") {
        return res.status(400).json({ message: "Challenge already responded to" });
      }
      
      // Check if expired
      if (new Date() > new Date(challenge.expiresAt)) {
        return res.status(410).json({ message: "Challenge expired" });
      }
      
      await storage.updatePrivateMatchInviteStatus(challengeId, "accepted");
      
      res.json({
        success: true,
        challenge: { ...challenge, status: "accepted" }
      });
    } catch (error) {
      console.error("Error accepting challenge:", error);
      res.status(500).json({ message: "Failed to accept challenge" });
    }
  });

  // Reject/ignore friend challenge
  app.post("/api/friends/challenges/:challengeId/reject", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { challengeId } = req.params;
      const challenge = await storage.getPrivateMatchInvite(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      if (challenge.recipientId !== userId) {
        return res.status(403).json({ message: "This challenge is not for you" });
      }
      
      await storage.updatePrivateMatchInviteStatus(challengeId, "rejected");
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting challenge:", error);
      res.status(500).json({ message: "Failed to reject challenge" });
    }
  });

  // Create private match invite (legacy code-based system)
  app.post("/api/private-match/create", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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

  // Stripe subscription endpoint (from blueprint:javascript_stripe)
  app.post('/api/create-subscription', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If user already has a subscription, return existing client secret
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent'],
        });
        const latestInvoice: any = subscription.latest_invoice;
        
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: latestInvoice?.payment_intent?.client_secret,
        });
      }

      if (!user.email) {
        return res.status(400).json({ message: 'User email required' });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        metadata: {
          userId: userId,
        },
      });

      // Create a price for the subscription
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 999, // $9.99 in cents
        recurring: {
          interval: 'month',
        },
        product_data: {
          name: 'Verbio Premium',
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe IDs
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent.client_secret,
      });
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      res.status(500).json({ message: error.message || 'Failed to create subscription' });
    }
  });

  // Admin endpoint to manually grant premium status
  // WARNING: This endpoint is for DEVELOPMENT ONLY and should be secured or removed in production
  // TODO: Add proper admin authentication before deploying to production
  app.post('/api/admin/grant-premium', async (req, res) => {
    try {
      // Basic security check - only allow in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin endpoints disabled in production' });
      }
      
      const { email, isPremium } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email required' });
      }

      const allUsers = await storage.getAllUsers();
      const user = allUsers.find(u => u.email === email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await db.update(users).set({
        isPremium: isPremium ? 1 : 0,
        updatedAt: new Date(),
      }).where(eq(users.id, user.id));

      res.json({ 
        message: `Premium status ${isPremium ? 'granted' : 'revoked'} for ${email}`,
        user: { email: user.email, isPremium: isPremium ? 1 : 0 }
      });
    } catch (error: any) {
      console.error('Admin grant premium error:', error);
      res.status(500).json({ message: error.message || 'Failed to update premium status' });
    }
  });

  // Cancel subscription endpoint
  app.post('/api/cancel-subscription', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const dbUser = await storage.getUser(userId);
      
      if (!dbUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!dbUser.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription found' });
      }

      // Cancel the subscription at period end (user keeps access until end of billing period)
      const subscription = await stripe.subscriptions.update(dbUser.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      res.json({ 
        message: 'Subscription will be cancelled at the end of the billing period',
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null
      });
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ message: error.message || 'Failed to cancel subscription' });
    }
  });

  // Premium whitelist management endpoints (admin only - development mode)
  app.post('/api/admin/whitelist/add', async (req, res) => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'This endpoint is disabled in production' });
      }
      
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email required' });
      }

      const entry = await storage.addToWhitelist(email, 'admin');
      res.json({ 
        message: `Email ${email} added to premium whitelist`,
        entry 
      });
    } catch (error: any) {
      console.error('Add to whitelist error:', error);
      res.status(500).json({ message: error.message || 'Failed to add to whitelist' });
    }
  });

  app.post('/api/admin/whitelist/remove', async (req, res) => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'This endpoint is disabled in production' });
      }
      
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email required' });
      }

      await storage.removeFromWhitelist(email);
      res.json({ 
        message: `Email ${email} removed from premium whitelist`
      });
    } catch (error: any) {
      console.error('Remove from whitelist error:', error);
      res.status(500).json({ message: error.message || 'Failed to remove from whitelist' });
    }
  });

  app.get('/api/admin/whitelist', async (req, res) => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'This endpoint is disabled in production' });
      }

      const whitelist = await storage.getAllWhitelistedEmails();
      res.json({ whitelist });
    } catch (error: any) {
      console.error('Get whitelist error:', error);
      res.status(500).json({ message: error.message || 'Failed to get whitelist' });
    }
  });

  // Stripe webhook endpoint (from blueprint:javascript_stripe)
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      // req.body is raw Buffer from express.raw() middleware in server/index.ts
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      // Handle subscription events
      if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
        const subscription = event.data.object as any;
        
        // Find user by Stripe customer ID
        const allUsers = await storage.getAllUsers();
        const user = allUsers.find(u => u.stripeCustomerId === subscription.customer);
        
        if (user) {
          // Update premium status based on subscription status
          const isPremium = subscription.status === 'active' ? 1 : 0;
          const subscriptionEndDate = subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000) 
            : null;
          
          await db.update(users).set({
            isPremium,
            subscriptionEndDate,
            updatedAt: new Date(),
          }).where(eq(users.id, user.id));
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        
        const allUsers = await storage.getAllUsers();
        const user = allUsers.find(u => u.stripeCustomerId === subscription.customer);
        
        if (user) {
          await db.update(users).set({
            isPremium: 0,
            subscriptionEndDate: null,
            updatedAt: new Date(),
          }).where(eq(users.id, user.id));
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket matchmaking
  setupMatchmaking(httpServer);

  return httpServer;
}
