import OpenAI from "openai";
import type { GradingRequest, GradingResult } from "@shared/schema";
import { getBotElo, getBotTargetAccuracy } from "./botConfig";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gradeConversation(request: GradingRequest): Promise<GradingResult> {
  const userMessages = request.messages
    .filter(m => m.sender === "user")
    .map(m => m.text)
    .join("\n");
  
  const botMessages = request.messages
    .filter(m => m.sender === "opponent")
    .map(m => m.text)
    .join("\n");

  const difficultyGuidelines: Record<string, string> = {
    Easy: "Grade with MAXIMUM encouragement and patience. This is absolute beginner level - accept ANY attempt at communication, even single words or very broken sentences. Focus ONLY on effort and attempting to communicate. Give high scores (70-90+) for any genuine attempt.",
    Medium: "Grade with encouragement. Accept basic grammar and simple vocabulary. Focus on communication success. Expect simple but complete sentences.",
    Hard: "Grade with balanced standards. Expect correct grammar, appropriate vocabulary, and natural language flow for intermediate level."
  };
  
  const prompt = `You are an expert ${request.language} language teacher evaluating a conversation between a student and another language learner (bot) at ${request.difficulty} difficulty level.

Topic: ${request.topic}
Target vocabulary: ${request.vocabulary.join(", ")}
Difficulty level: ${request.difficulty}

${difficultyGuidelines[request.difficulty] || difficultyGuidelines.Medium}

Student's messages:
${userMessages}

Bot's messages (another learner):
${botMessages}

Evaluate both participants honestly based on their actual performance:

1. STUDENT scores:
- Grammar score (0-100): Accuracy of grammar, verb conjugations, sentence structure
- Fluency score (0-100): Natural flow, coherence, and ease of expression
- Vocabulary score (0-100): Appropriate use of vocabulary, especially target words
- Naturalness score (0-100): How natural and native-like the language sounds
- Feedback: 3-5 specific points about what they did well or could improve

2. BOT scores (evaluate the actual quality, not an imagined target):
- Grammar score (0-100): Evaluate the actual grammar quality you see
- Fluency score (0-100): Evaluate the actual fluency you observe
- Vocabulary score (0-100): Evaluate the actual vocabulary usage
- Naturalness score (0-100): Evaluate how natural it actually sounds

IMPORTANT: Grade the bot based on what you actually see in their messages. If they make mistakes, reflect that in lower scores. If they speak well, reflect that in higher scores. Be honest and accurate.

Respond with JSON in this exact format:
{
  "grammar": number,
  "fluency": number,
  "vocabulary": number,
  "naturalness": number,
  "feedback": ["point 1", "point 2", "point 3"],
  "overall": number,
  "botGrammar": number,
  "botFluency": number,
  "botVocabulary": number,
  "botNaturalness": number,
  "botOverall": number
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
    
    // Calculate overall scores if not provided
    if (!result.overall) {
      result.overall = Math.round(
        (result.grammar + result.fluency + result.vocabulary + result.naturalness) / 4
      );
    }
    
    if (!result.botOverall) {
      result.botOverall = Math.round(
        (result.botGrammar + result.botFluency + result.botVocabulary + result.botNaturalness) / 4
      );
    }

    // Apply penalties to user score
    const skipPenalty = request.skippedQuestions * 20;
    const adjustedOverall = Math.max(0, result.overall - skipPenalty);
    
    // Get bot Elo for this difficulty
    const botElo = getBotElo(request.difficulty);

    return {
      grammar: Math.max(0, Math.min(100, result.grammar || 0)),
      fluency: Math.max(0, Math.min(100, result.fluency || 0)),
      vocabulary: Math.max(0, Math.min(100, result.vocabulary || 0)),
      naturalness: Math.max(0, Math.min(100, result.naturalness || 0)),
      feedback: result.feedback || ["Great effort! Keep practicing."],
      overall: Math.max(0, Math.min(100, adjustedOverall)),
      botGrammar: Math.max(0, Math.min(100, result.botGrammar || 0)),
      botFluency: Math.max(0, Math.min(100, result.botFluency || 0)),
      botVocabulary: Math.max(0, Math.min(100, result.botVocabulary || 0)),
      botNaturalness: Math.max(0, Math.min(100, result.botNaturalness || 0)),
      botOverall: Math.max(0, Math.min(100, result.botOverall || 0)),
      botElo,
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
  const targetAccuracy = getBotTargetAccuracy(difficulty);
  
  const mistakeGuidelines: Record<string, string> = {
    Chinese: `Common learner mistakes for Chinese:
- Tone errors (using wrong tones on characters)
- Incorrect word order (especially with time/place expressions)
- Missing or wrong measure words (个, 只, 本, etc.)
- Particle errors (especially 了, 过, 着)
- Mixing up similar-sounding words
- Forgetting aspect markers`,
    Spanish: `Common learner mistakes for Spanish:
- Gender agreement errors (el/la, -o/-a endings)
- Verb conjugation mistakes (especially irregular verbs)
- Wrong preposition usage (a, de, en, por, para)
- Mixing up ser/estar
- Incorrect subjunctive mood usage
- Article errors (forgetting or misusing el/la/los/las)`,
    Italian: `Common learner mistakes for Italian:
- Gender agreement errors (il/la, -o/-a endings)
- Verb conjugation mistakes (especially irregular verbs)
- Preposition errors (a, di, da, in, con, su)
- Article mistakes (il/lo/la/i/gli/le confusion)
- Double consonant pronunciation affecting spelling
- Reflexive verb errors`
  };

  const difficultyInstructions: Record<string, string> = {
    Easy: `You are a BEGINNER learner (${targetAccuracy}% proficiency). Make 2-3 noticeable mistakes that beginners make:
- Use extremely simple vocabulary but make basic grammar errors
- Include hesitations or awkward phrasing
- Make fundamental mistakes like wrong particles, basic word order, or article/gender errors
- Keep questions short and simple despite the errors`,
    Medium: `You are an INTERMEDIATE learner (${targetAccuracy}% proficiency). Make 1-2 moderate mistakes:
- Use conversational vocabulary but include occasional grammar slips
- Make mistakes like wrong verb conjugations, preposition errors, or measure word mistakes
- Sound mostly natural but with noticeable learner imperfections
- Questions are understandable but not perfect`,
    Hard: `You are an ADVANCED learner (${targetAccuracy}% proficiency). Make 1 subtle mistake:
- Use sophisticated vocabulary with minor errors
- Include subtle issues like tone mistakes in Chinese, subjunctive errors in Spanish/Italian
- Make mistakes that advanced learners commonly make
- Questions are mostly fluent with only small imperfections`
  };

  const mistakeTypes = mistakeGuidelines[language] || mistakeGuidelines.Chinese;

  const prompt = `You are roleplaying as a human ${language} language LEARNER (not a teacher) asking a question during a Q&A session about ${topic}.

Your proficiency level: ${difficulty} (approximately ${targetAccuracy}% accuracy)
${difficultyInstructions[difficulty] || difficultyInstructions.Medium}

${mistakeTypes}

Target vocabulary to incorporate: ${vocabulary.join(", ")}
${previousQuestions.length > 0 ? `\nPrevious questions you asked:\n${previousQuestions.join("\n")}\n\nMake sure to ask a DIFFERENT question.` : ""}

Generate ONE question in ${language} that:
- Uses at least one vocabulary word from the list
- Is relevant to the topic "${topic}"
- Contains realistic learner mistakes appropriate for ${difficulty} level
- Sounds like a believable human learner would speak
- Still communicates the intended meaning despite mistakes

IMPORTANT: You MUST include realistic mistakes. Do NOT generate perfect ${language}. Make it sound like a real learner at ${targetAccuracy}% proficiency.

Respond with ONLY the question in ${language}, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are roleplaying as a ${language} language learner at ${difficulty} level with ${targetAccuracy}% proficiency. You make realistic, believable mistakes that real learners make. You are NOT a teacher - you are a student with imperfect language skills.`
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
  const targetAccuracy = getBotTargetAccuracy(difficulty);
  
  const mistakeGuidelines: Record<string, string> = {
    Chinese: `Common learner mistakes for Chinese:
- Tone errors (using wrong tones on characters)
- Incorrect word order (especially with time/place expressions)
- Missing or wrong measure words (个, 只, 本, etc.)
- Particle errors (especially 了, 过, 着)
- Mixing up similar-sounding words
- Forgetting aspect markers`,
    Spanish: `Common learner mistakes for Spanish:
- Gender agreement errors (el/la, -o/-a endings)
- Verb conjugation mistakes (especially irregular verbs)
- Wrong preposition usage (a, de, en, por, para)
- Mixing up ser/estar
- Incorrect subjunctive mood usage
- Article errors (forgetting or misusing el/la/los/las)`,
    Italian: `Common learner mistakes for Italian:
- Gender agreement errors (il/la, -o/-a endings)
- Verb conjugation mistakes (especially irregular verbs)
- Preposition errors (a, di, da, in, con, su)
- Article mistakes (il/lo/la/i/gli/le confusion)
- Double consonant pronunciation affecting spelling
- Reflexive verb errors`
  };

  const difficultyInstructions: Record<string, string> = {
    Easy: `You are a BEGINNER learner (${targetAccuracy}% proficiency). Make 2-3 noticeable mistakes that beginners make:
- Use extremely simple vocabulary but make basic grammar errors
- Include awkward phrasing or unnatural expressions
- Make fundamental mistakes like wrong particles, basic word order, or article/gender errors
- Keep answers very short (1-2 simple sentences) despite the errors`,
    Medium: `You are an INTERMEDIATE learner (${targetAccuracy}% proficiency). Make 1-2 moderate mistakes:
- Use conversational vocabulary but include occasional grammar slips
- Make mistakes like wrong verb conjugations, preposition errors, or measure word mistakes
- Sound mostly natural but with noticeable learner imperfections
- Answers are understandable but not perfect`,
    Hard: `You are an ADVANCED learner (${targetAccuracy}% proficiency). Make 1 subtle mistake:
- Use sophisticated vocabulary with minor errors
- Include subtle issues like tone mistakes in Chinese, subjunctive errors in Spanish/Italian
- Make mistakes that advanced learners commonly make
- Answers are mostly fluent with only small imperfections`
  };

  const mistakeTypes = mistakeGuidelines[language] || mistakeGuidelines.Chinese;

  const prompt = `You are roleplaying as a human ${language} language LEARNER (not a native speaker) answering a question during a Q&A session about ${topic}.

Your proficiency level: ${difficulty} (approximately ${targetAccuracy}% accuracy)
${difficultyInstructions[difficulty] || difficultyInstructions.Medium}

${mistakeTypes}

Question you're answering: ${userQuestion}

Target vocabulary to incorporate: ${vocabulary.join(", ")}

Answer the question in ${language} with 1-2 sentences that:
- Directly answer the question
- Naturally incorporate at least one vocabulary word from the list
- Contains realistic learner mistakes appropriate for ${difficulty} level
- Sounds like a believable human learner would speak
- Still communicates the intended meaning despite mistakes

IMPORTANT: You MUST include realistic mistakes. Do NOT generate perfect ${language}. Make it sound like a real learner at ${targetAccuracy}% proficiency.

Respond with ONLY the answer in ${language}, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are roleplaying as a ${language} language learner at ${difficulty} level with ${targetAccuracy}% proficiency. You make realistic, believable mistakes that real learners make. You are NOT a native speaker - you are a student with imperfect language skills.`
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

export async function validateQuestion(
  question: string,
  topic: string,
  vocabulary: string[],
  language: string
): Promise<{ isValid: boolean; message: string }> {
  const prompt = `You are a language learning assistant validating if a student's question is related to the conversation topic.

Topic: ${topic}

Student's question: "${question}"

Your ONLY job is to check if the question is related to the topic "${topic}". 
DO NOT check:
- Grammar or spelling
- Language correctness
- Question structure
- Vocabulary usage

Simply determine: Is this question asking about something related to "${topic}"?

Respond with JSON in this exact format:
{
  "isValid": boolean,
  "message": "Brief explanation if not related to topic (empty string if related)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You validate if questions are topically relevant, ignoring all grammar, spelling, and structure issues."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      isValid: result.isValid ?? true,
      message: result.message || ""
    };
  } catch (error: any) {
    console.error("Error validating question:", error);
    // On error, allow the question through
    return { isValid: true, message: "" };
  }
}

interface VocabularyWord {
  word: string;
  type: "noun" | "verb" | "adjective";
  english: string;
  pinyin?: string;
}

export async function generateVocabulary(
  topic: string,
  language: string,
  difficulty: "Easy" | "Medium" | "Hard"
): Promise<VocabularyWord[]> {
  const wordCounts = {
    Easy: 3,
    Medium: 5,
    Hard: 8
  };
  
  const count = wordCounts[difficulty];
  
  const difficultyInstructions: Record<string, string> = {
    Easy: "Generate EXTREMELY simple, basic vocabulary words that absolute beginners would know (like 'go', 'eat', 'water', 'yes', 'no', 'hello'). These should be the most fundamental words in the language.",
    Medium: "Generate conversational vocabulary words that intermediate learners would use in everyday situations. Mix common verbs, adjectives, and nouns.",
    Hard: "Generate advanced vocabulary words including nuanced verbs, descriptive adjectives, and sophisticated nouns. Include idiomatic expressions or compound words when appropriate."
  };

  const prompt = `You are a ${language} language teacher creating vocabulary for a lesson about "${topic}" at ${difficulty} difficulty level.

${difficultyInstructions[difficulty]}

Generate EXACTLY ${count} vocabulary words that:
- Are relevant to the topic "${topic}"
- Include a VARIETY of word types: verbs, adjectives, and nouns (not just nouns!)
- Match the ${difficulty} difficulty level
- Are useful for conversation practice

${language === "Chinese" ? "Include pinyin romanization for each word." : ""}

Respond with JSON in this exact format:
{
  "words": [
    {
      "word": "word in ${language}",
      "type": "noun" | "verb" | "adjective",
      "english": "English translation"${language === "Chinese" ? ',\n      "pinyin": "pinyin romanization"' : ''}
    }
  ]
}

Make sure to return EXACTLY ${count} words.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ${language} language teacher creating diverse, practical vocabulary lists. Always include varied word types (verbs, adjectives, nouns).`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.words || !Array.isArray(result.words)) {
      throw new Error("Invalid response format from AI");
    }
    
    // Ensure we have exactly the right number of words
    const words = result.words.slice(0, count);
    
    return words.map((w: any) => ({
      word: w.word || "",
      type: w.type || "noun",
      english: w.english || "",
      ...(language === "Chinese" && { pinyin: w.pinyin || "" })
    }));
  } catch (error: any) {
    console.error("Error generating vocabulary:", error);
    throw new Error("Failed to generate vocabulary");
  }
}
