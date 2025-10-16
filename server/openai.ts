import OpenAI from "openai";
import type { GradingRequest, GradingResult } from "@shared/schema";
import { getBotElo, getBotTargetAccuracy } from "./botConfig";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gradeConversation(request: GradingRequest, isPremium: boolean = false): Promise<GradingResult> {
  const difficultyGuidelines: Record<string, string> = {
    Beginner: "Grade with ABSOLUTE MAXIMUM encouragement. This is for complete beginners - celebrate ANY word or sound in the target language! Give extremely high scores (80-95+) for trying AT ALL. Even if they write in English or use translator, give encouragement. Focus purely on participation and effort.",
    Easy: "Grade with MAXIMUM encouragement and patience. This is absolute beginner level - accept ANY attempt at communication, even single words or very broken sentences. Focus ONLY on effort and attempting to communicate. Give high scores (70-90+) for any genuine attempt.",
    Medium: "Grade with encouragement. Accept basic grammar and simple vocabulary. Focus on communication success. Expect simple but complete sentences.",
    Hard: "Grade with balanced standards. Expect correct grammar, appropriate vocabulary, and natural language flow for intermediate level."
  };
  
  // Format messages with indices for detailed analysis
  const formattedMessages = request.messages.map((msg, idx) => 
    `[${idx}] ${msg.sender === "user" ? "Student" : "Bot"}: ${msg.text}`
  ).join("\n");
  
  // Different prompts based on premium status
  const detailedAnalysisSection = isPremium ? `
2. COMPREHENSIVE MESSAGE-BY-MESSAGE ANALYSIS (messageAnalysis array):
For EVERY SINGLE student message, provide DETAILED analysis:
- messageIndex: the message number [0, 1, 2...]
- sender: "user" 
- originalText: the exact message text
- grammarCorrections: array of EVERY grammar error {original: "exact text with error", corrected: "corrected version", explanation: "detailed explanation of the grammar rule"}
  Include ALL errors: word order, particles, verb conjugation, tense usage, articles, prepositions, etc.
- vocabularySuggestions: array of BETTER word choices {word: "word used", betterAlternative: "more natural/advanced word", reason: "detailed explanation why it's better"}
  Suggest more natural, idiomatic, or contextually appropriate alternatives for EVERY improvable word
- sentenceImprovement: {
    original: "student's sentence",
    improved: "how a native speaker would say it",
    explanation: "detailed explanation of ALL changes made and why"
  }
- strengths: array of 2-3 specific things done well (grammar structures used correctly, good vocabulary choices, natural expressions)
- improvements: array of 2-3 specific actionable suggestions to improve this message

CRITICAL REQUIREMENTS:
- Analyze EVERY student message, even if it seems perfect
- Be THOROUGH - find and explain ALL errors, not just major ones
- For each message, provide AT LEAST 2-3 grammar corrections or vocabulary suggestions (unless truly perfect)
- The sentenceImprovement field is REQUIRED for every message - show how a native would say it
- Give detailed, educational explanations that teach the student
- Empty arrays only if the message is grammatically perfect AND uses optimal vocabulary` : '';
  
  const prompt = `You are an expert ${request.language} language teacher providing ${isPremium ? 'detailed, message-by-message' : 'general'} feedback for a conversation at ${request.difficulty} difficulty level.

Topic: ${request.topic}
Target vocabulary: ${request.vocabulary.join(", ")}
Difficulty level: ${request.difficulty}

${difficultyGuidelines[request.difficulty] || difficultyGuidelines.Medium}

CONVERSATION (with message indices):
${formattedMessages}

Provide ${isPremium ? 'TWO types of' : 'ONE type of'} analysis:

1. OVERALL SCORES for both participants:
- Student: grammar, fluency, vocabulary, naturalness, overall (0-100 each)
- Bot: botGrammar, botFluency, botVocabulary, botNaturalness, botOverall (0-100 each)
- General feedback: 3-5 summary points for the student

${detailedAnalysisSection}

Respond with JSON in this ${isPremium ? 'EXACT' : 'format (NO messageAnalysis field for free users)'} format:
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
  "botOverall": number${isPremium ? `,
  "messageAnalysis": [
    {
      "messageIndex": 0,
      "sender": "user",
      "originalText": "original message text",
      "grammarCorrections": [{"original": "错误部分", "corrected": "正确部分", "explanation": "detailed grammar explanation"}],
      "vocabularySuggestions": [{"word": "used word", "betterAlternative": "better word", "reason": "detailed reason"}],
      "sentenceImprovement": {
        "original": "student sentence",
        "improved": "native speaker version",
        "explanation": "detailed explanation of all improvements"
      },
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "improvements": ["improvement 1", "improvement 2"]
    }
  ]` : ''}
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert language teacher providing ${isPremium ? 'detailed, constructive' : 'general'} feedback. Always respond with valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: isPremium ? 4000 : 1500, // More tokens for comprehensive premium feedback
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
      messageAnalysis: result.messageAnalysis || [],
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
  previousQuestions: string[] = [],
  isPracticeMode: boolean = false
): Promise<string> {
  const targetAccuracy = isPracticeMode ? 100 : getBotTargetAccuracy(difficulty);
  
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
    Beginner: `You are a TRUE BEGINNER learner (${targetAccuracy}% proficiency). Make 3-4 MAJOR mistakes:
- Use VERY basic vocabulary (like "hello", "I", "you", "good") with many errors
- Mix in English words when you don't know the target language word
- Make SEVERE grammar mistakes - wrong word order, missing words, incorrect everything
- Use single words or 2-3 word fragments instead of full sentences
- Make it sound like someone in their first week of learning`,
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

  const prompt = isPracticeMode 
    ? `You are a NATIVE ${language} speaker asking a question during a Q&A session about ${topic}.

Target vocabulary to incorporate: ${vocabulary.join(", ")}
${previousQuestions.length > 0 ? `\nPrevious questions you asked:\n${previousQuestions.join("\n")}\n\nMake sure to ask a DIFFERENT question.` : ""}

Generate ONE PERFECT question in ${language} that:
- Uses at least one vocabulary word from the list
- Is relevant to the topic "${topic}"
- Uses PERFECT grammar, vocabulary, and natural phrasing
- Sounds like a native speaker would speak
- Is clear and natural

IMPORTANT: Generate PERFECT ${language}. No mistakes. This is for language practice.

Respond with ONLY the question in ${language}, nothing else.`
    : `You are roleplaying as a human ${language} language LEARNER (not a teacher) asking a question during a Q&A session about ${topic}.

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
          content: isPracticeMode
            ? `You are a NATIVE ${language} speaker. Generate PERFECT ${language} with no mistakes. This is for language practice.`
            : `You are roleplaying as a ${language} language learner at ${difficulty} level with ${targetAccuracy}% proficiency. You make realistic, believable mistakes that real learners make. You are NOT a teacher - you are a student with imperfect language skills.`
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
  difficulty: string = "Medium",
  isPracticeMode: boolean = false
): Promise<string> {
  const targetAccuracy = isPracticeMode ? 100 : getBotTargetAccuracy(difficulty);
  
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
    Beginner: `You are a TRUE BEGINNER learner (${targetAccuracy}% proficiency). Make 3-4 MAJOR mistakes:
- Use VERY basic vocabulary (like "hello", "I", "you", "good") with many errors
- Mix in English words when you don't know the target language word
- Make SEVERE grammar mistakes - wrong word order, missing words, incorrect everything
- Keep answers VERY short - just 1-3 words or tiny fragments
- Make it sound like someone in their first week of learning`,
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

  const prompt = isPracticeMode
    ? `You are a NATIVE ${language} speaker answering a question during a Q&A session about ${topic}.

Question you're answering: ${userQuestion}

Target vocabulary to incorporate: ${vocabulary.join(", ")}

Answer the question in ${language} with 1-2 sentences that:
- Directly answer the question
- Naturally incorporate at least one vocabulary word from the list
- Uses PERFECT grammar, vocabulary, and natural phrasing
- Sounds like a native speaker would speak
- Is clear and natural

IMPORTANT: Generate PERFECT ${language}. No mistakes. This is for language practice.

Respond with ONLY the answer in ${language}, nothing else.`
    : `You are roleplaying as a human ${language} language LEARNER (not a native speaker) answering a question during a Q&A session about ${topic}.

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
          content: isPracticeMode 
            ? `You are a NATIVE ${language} speaker. Generate PERFECT ${language} with no mistakes. This is for language practice.`
            : `You are roleplaying as a ${language} language learner at ${difficulty} level with ${targetAccuracy}% proficiency. You make realistic, believable mistakes that real learners make. You are NOT a native speaker - you are a student with imperfect language skills.`
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
  const prompt = `You are a language learning assistant validating if a student's question is answerable and relevant to the conversation topic.

Topic: ${topic}

Student's question: "${question}"

Validation criteria - the question should be:
1. Related to "${topic}" (can be loosely connected, but must have some relevance)
2. Actually answerable - someone should be able to provide a meaningful response
3. Clear enough to understand what's being asked (even with grammar/spelling errors)

ACCEPT questions that:
- Are related or loosely connected to the topic
- Make sense and can be answered, even if imperfectly worded
- Have grammar/spelling errors but the intent is clear
- Ask about opinions, experiences, or information related to the topic

REJECT questions that:
- Are completely off-topic (e.g., asking about cars when topic is food)
- Are too vague or nonsensical to answer meaningfully
- Don't actually ask anything (just statements or gibberish)
- Are impossible to respond to with a real answer

IGNORE (don't check):
- Grammar or spelling quality
- Perfect language correctness
- Vocabulary sophistication

The key test: "Could a reasonable person provide a meaningful answer to this question about ${topic}?"

Respond with JSON:
{
  "isValid": boolean (true if answerable and topic-related, false otherwise),
  "message": string (brief, encouraging explanation if rejecting - suggest what kind of question would work)
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a supportive validator helping language learners ask better questions. Accept questions that are answerable and topic-related, even if imperfectly worded. Reject only if truly off-topic or impossible to answer meaningfully."
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
  difficulty: "Beginner" | "Easy" | "Medium" | "Hard"
): Promise<VocabularyWord[]> {
  const wordCounts = {
    Beginner: 2,
    Easy: 3,
    Medium: 5,
    Hard: 8
  };
  
  const count = wordCounts[difficulty];
  
  const difficultyInstructions: Record<string, string> = {
    Beginner: "Generate the MOST BASIC vocabulary words possible - the absolute first words someone would learn (like 'I', 'you', 'hello', 'yes', 'no', 'good'). These should be survival-level essential words.",
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

export async function translateText(text: string, fromLanguage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use cheaper model for translation
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given ${fromLanguage} text to English. Provide ONLY the English translation, nothing else. Be natural and accurate.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    });

    const translation = completion.choices[0]?.message?.content?.trim() || text;
    return translation;
  } catch (error: any) {
    console.error("Error translating text:", error);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
}

export async function generateExampleResponse(params: {
  language: string;
  difficulty: string;
  topic: string;
  vocabulary: string[];
  phase: "user-question" | "user-answer";
  context?: string; // The bot's question if user is answering
}): Promise<string> {
  const { language, difficulty, topic, vocabulary, phase, context } = params;

  const phaseInstruction = phase === "user-question" 
    ? `Generate an example QUESTION in ${language} about the topic "${topic}".`
    : `Generate an example ANSWER in ${language} to this question: "${context}"`;

  const prompt = `You are a ${language} language teacher helping a BEGINNER student who is stuck and needs an example.

${phaseInstruction}

Topic: ${topic}
Difficulty: ${difficulty}
Available vocabulary to use: ${vocabulary.join(", ")}

Create a GOOD example response that:
- Is appropriate for ${difficulty} level (simple and clear for beginners)
- Uses at least ONE word from the vocabulary list
- Is grammatically correct and natural
- Is helpful but not overly complex
- Shows what a good response looks like
${phase === "user-answer" ? "- Actually answers the question asked" : "- Asks a relevant, clear question"}

IMPORTANT: Generate a HELPFUL, CLEAR example that a beginner can learn from. Keep it simple!

Respond with ONLY the example ${phase === "user-question" ? "question" : "answer"} in ${language}, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful ${language} language teacher creating clear examples for beginners.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const example = response.choices[0]?.message?.content?.trim() || "";
    return example;
  } catch (error: any) {
    console.error("Error generating example response:", error);
    throw new Error(`Failed to generate example: ${error.message}`);
  }
}
