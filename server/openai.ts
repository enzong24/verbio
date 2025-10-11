import OpenAI from "openai";
import type { GradingRequest, GradingResult } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gradeConversation(request: GradingRequest): Promise<GradingResult> {
  // Basic prototype grading system (no OpenAI)
  const userMessages = request.messages
    .filter(m => m.sender === "user")
    .map(m => m.text);

  const allUserText = userMessages.join(" ").toLowerCase();
  const isChinese = request.language === "Chinese";
  
  // Vocabulary score: Check how many target words were used
  let vocabularyUsed = 0;
  request.vocabulary.forEach(word => {
    if (allUserText.includes(word.toLowerCase())) {
      vocabularyUsed++;
    }
  });
  const vocabularyScore = Math.min(100, Math.round((vocabularyUsed / Math.max(1, request.vocabulary.length)) * 100));

  // Fluency score: Based on message count and average length
  const avgMessageLength = userMessages.reduce((sum, msg) => sum + msg.length, 0) / Math.max(1, userMessages.length);
  const fluencyScore = Math.min(100, Math.round((avgMessageLength / (isChinese ? 10 : 20)) * 100));

  // Grammar score: Simple heuristic based on message structure
  let grammarScore = 70; // Base score
  if (userMessages.some(msg => msg.length > (isChinese ? 15 : 30))) grammarScore += 10; // Bonus for longer sentences
  if (userMessages.some(msg => /[.!?。！？]$/.test(msg))) grammarScore += 10; // Bonus for punctuation (including Chinese)
  if (!isChinese && userMessages.some(msg => /[A-Z]/.test(msg[0]))) grammarScore += 10; // Capitalization bonus (non-Chinese only)
  if (isChinese) grammarScore += 10; // Compensate for Chinese not having capitalization
  grammarScore = Math.min(100, grammarScore);

  // Naturalness score: Language-aware variety check
  let naturalness: number;
  if (isChinese) {
    // For Chinese: count unique characters
    const uniqueChars = new Set(allUserText.split("")).size;
    naturalness = Math.min(100, Math.round((uniqueChars / 10) * 100));
  } else {
    // For Latin-based languages: count unique words
    const uniqueWords = new Set(allUserText.split(/\s+/)).size;
    naturalness = Math.min(100, Math.round((uniqueWords / 5) * 100));
  }

  // Overall score
  const overall = Math.round((vocabularyScore + fluencyScore + grammarScore + naturalness) / 4);

  // Generate feedback
  const feedback: string[] = [];
  
  if (vocabularyScore >= 80) {
    feedback.push(`Excellent use of target vocabulary! You used ${vocabularyUsed} out of ${request.vocabulary.length} words.`);
  } else if (vocabularyScore >= 50) {
    feedback.push(`Good effort with vocabulary. Try to incorporate more target words in your responses.`);
  } else {
    feedback.push(`Focus on using the target vocabulary words more frequently.`);
  }

  if (fluencyScore >= 70) {
    feedback.push("Your messages show good length and detail. Keep it up!");
  } else {
    feedback.push("Try to write more detailed responses to improve fluency.");
  }

  if (grammarScore >= 80) {
    feedback.push("Great sentence structure and punctuation!");
  } else {
    feedback.push("Remember to use proper punctuation and capitalization.");
  }

  if (naturalness >= 70) {
    feedback.push("Your language use is varied and natural.");
  } else {
    feedback.push("Try to vary your vocabulary more for more natural conversation.");
  }

  if (overall >= 80) {
    feedback.push("Outstanding performance overall! 🌟");
  } else if (overall >= 60) {
    feedback.push("Good work! Keep practicing to improve further.");
  } else {
    feedback.push("Keep practicing! Focus on using more vocabulary and writing longer responses.");
  }

  return {
    grammar: grammarScore,
    fluency: fluencyScore,
    vocabulary: vocabularyScore,
    naturalness,
    feedback: feedback.slice(0, 5),
    overall,
  };
}

export async function generateBotResponse(
  conversationHistory: Array<{ sender: string; text: string }>,
  topic: string,
  vocabulary: string[],
  language: string = "Chinese"
): Promise<string> {
  // Build conversation context
  const conversationContext = conversationHistory
    .map(msg => `${msg.sender === "user" ? "Learner" : "You"}: ${msg.text}`)
    .join("\n");

  const prompt = `You are having a natural conversation in ${language} about ${topic}. 

Previous conversation:
${conversationContext}

Continue the conversation naturally in ${language}. Respond with 1-2 sentences that:
- Directly relate to what the learner just said
- Ask follow-up questions or share relevant thoughts
- Naturally incorporate vocabulary words when appropriate: ${vocabulary.join(", ")}
- Sound like a real person having a genuine conversation

Keep your response engaging and conversational.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a native ${language} speaker having a natural, flowing conversation. Be engaging, ask questions, share thoughts, and respond authentically to what the learner says. Avoid repetitive patterns.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || getFallbackResponse(language);
  } catch (error: any) {
    console.error("Error generating bot response:", error);
    console.error("Error details:", error.message, error.response?.data);
    return getFallbackResponse(language);
  }
}

function getFallbackResponse(language: string): string {
  const fallbacks: Record<string, string> = {
    Chinese: "有意思！请继续说。",
    Spanish: "¡Interesante! Por favor continúa.",
    Italian: "Interessante! Per favore continua.",
  };
  return fallbacks[language] || "Please continue.";
}
