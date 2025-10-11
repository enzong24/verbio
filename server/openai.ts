import OpenAI from "openai";
import type { GradingRequest, GradingResult } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gradeConversation(request: GradingRequest): Promise<GradingResult> {
  const userMessages = request.messages
    .filter(m => m.sender === "user")
    .map(m => m.text)
    .join("\n");

  const prompt = `You are an expert ${request.language} language teacher evaluating a student's conversation performance.

Topic: ${request.topic}
Target vocabulary: ${request.vocabulary.join(", ")}

Student's messages:
${userMessages}

Evaluate the student's ${request.language} language usage and provide:
1. Grammar score (0-100): Accuracy of grammar, verb conjugations, sentence structure
2. Fluency score (0-100): Natural flow, coherence, and ease of expression
3. Vocabulary score (0-100): Appropriate use of vocabulary, especially target words
4. Naturalness score (0-100): How natural and native-like the language sounds
5. Feedback: 3-5 specific points about what they did well or could improve

Respond with JSON in this exact format:
{
  "grammar": number,
  "fluency": number,
  "vocabulary": number,
  "naturalness": number,
  "feedback": ["point 1", "point 2", "point 3"],
  "overall": number
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert language teacher providing detailed, constructive feedback. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Calculate overall if not provided
    if (!result.overall) {
      result.overall = Math.round(
        (result.grammar + result.fluency + result.vocabulary + result.naturalness) / 4
      );
    }

    return {
      grammar: Math.max(0, Math.min(100, result.grammar || 0)),
      fluency: Math.max(0, Math.min(100, result.fluency || 0)),
      vocabulary: Math.max(0, Math.min(100, result.vocabulary || 0)),
      naturalness: Math.max(0, Math.min(100, result.naturalness || 0)),
      feedback: result.feedback || ["Great effort! Keep practicing."],
      overall: Math.max(0, Math.min(100, result.overall || 0)),
    };
  } catch (error) {
    console.error("Error grading conversation:", error);
    throw new Error("Failed to grade conversation");
  }
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
      model: "gpt-5",
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
      max_completion_tokens: 150,
    });

    return response.choices[0].message.content || "有意思！";
  } catch (error) {
    console.error("Error generating bot response:", error);
    return "有意思！请继续说。";
  }
}
