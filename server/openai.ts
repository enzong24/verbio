import OpenAI from "openai";
import type { GradingRequest, GradingResult } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gradeConversation(request: GradingRequest): Promise<GradingResult> {
  const userMessages = request.messages
    .filter(m => m.sender === "user")
    .map(m => m.text)
    .join("\n");

  const difficultyGuidelines: Record<string, string> = {
    Easy: "Grade very gently with maximum encouragement. Accept very basic grammar, beginner vocabulary, and simple attempts. Focus only on effort and communication attempts.",
    Medium: "Grade with encouragement. Accept basic grammar and simple vocabulary. Focus on communication success.",
    Hard: "Grade with balanced standards. Expect correct grammar and appropriate vocabulary for the level."
  };

  const prompt = `You are an expert ${request.language} language teacher evaluating a student's conversation performance at ${request.difficulty} difficulty level.

Topic: ${request.topic}
Target vocabulary: ${request.vocabulary.join(", ")}
Difficulty level: ${request.difficulty}

${difficultyGuidelines[request.difficulty] || difficultyGuidelines.Medium}

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
      model: "gpt-4o",
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
      max_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Calculate overall if not provided
    if (!result.overall) {
      result.overall = Math.round(
        (result.grammar + result.fluency + result.vocabulary + result.naturalness) / 4
      );
    }

    // Apply penalties
    const skipPenalty = request.skippedQuestions * 20;
    const definitionPenalty = request.viewedDefinitions * 5;
    const totalPenalty = skipPenalty + definitionPenalty;
    
    // Adjust overall score with penalties
    const adjustedOverall = Math.max(0, result.overall - totalPenalty);

    return {
      grammar: Math.max(0, Math.min(100, result.grammar || 0)),
      fluency: Math.max(0, Math.min(100, result.fluency || 0)),
      vocabulary: Math.max(0, Math.min(100, result.vocabulary || 0)),
      naturalness: Math.max(0, Math.min(100, result.naturalness || 0)),
      feedback: result.feedback || ["Great effort! Keep practicing."],
      overall: Math.max(0, Math.min(100, adjustedOverall)),
    };
  } catch (error: any) {
    console.error("Error grading conversation:", error);
    console.error("Error details:", error.message, error.response?.data);
    throw new Error("Failed to grade conversation");
  }
}

export async function generateBotQuestion(
  topic: string,
  vocabulary: string[],
  language: string = "Chinese",
  difficulty: string = "Medium",
  previousQuestions: string[] = []
): Promise<string> {
  const difficultyInstructions: Record<string, string> = {
    Easy: "Use very simple vocabulary and the most basic sentence structures possible.",
    Medium: "Use simple vocabulary and basic sentence structures.",
    Hard: "Use moderate vocabulary and natural sentence structures."
  };

  const prompt = `You are a ${language} language teacher conducting a Q&A session about ${topic}.

Difficulty level: ${difficulty}
${difficultyInstructions[difficulty] || difficultyInstructions.Medium}

Target vocabulary to incorporate: ${vocabulary.join(", ")}
${previousQuestions.length > 0 ? `\nPrevious questions asked:\n${previousQuestions.join("\n")}\n\nMake sure to ask a DIFFERENT question.` : ""}

Generate ONE question in ${language} that:
- Uses at least one vocabulary word from the list
- Is relevant to the topic "${topic}"
- Matches the ${difficulty} difficulty level
- Is clear and natural
- Encourages the learner to use vocabulary words in their answer

Respond with ONLY the question in ${language}, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ${language} language teacher at ${difficulty} level. Ask clear, engaging questions that encourage learners to practice vocabulary.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content?.trim() || "你好吗？";
  } catch (error: any) {
    console.error("Error generating bot question:", error);
    throw new Error("Failed to generate bot question");
  }
}

export async function generateBotAnswer(
  userQuestion: string,
  topic: string,
  vocabulary: string[],
  language: string = "Chinese",
  difficulty: string = "Medium"
): Promise<string> {
  const difficultyInstructions: Record<string, string> = {
    Easy: "Use very simple vocabulary and the most basic sentence structures possible.",
    Medium: "Use simple vocabulary and basic sentence structures.",
    Hard: "Use moderate vocabulary and natural sentence structures."
  };

  const prompt = `You are answering a learner's question in ${language} about ${topic}.

Difficulty level: ${difficulty}
${difficultyInstructions[difficulty] || difficultyInstructions.Medium}

Learner's question: ${userQuestion}

Target vocabulary to incorporate: ${vocabulary.join(", ")}

Answer the question in ${language} with 1-2 sentences that:
- Directly answer the learner's question
- Naturally incorporate at least one vocabulary word from the list
- Match the ${difficulty} difficulty level
- Sound natural and conversational

Respond with ONLY the answer in ${language}, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ${language} speaker at ${difficulty} level answering questions naturally and helpfully.`
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
