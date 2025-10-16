import OpenAI from "openai";
import type { GradingRequest, GradingResult } from "@shared/schema";
import { getBotElo, getBotTargetAccuracy } from "./botConfig";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function gradeConversation(request: GradingRequest, isPremium: boolean = false): Promise<GradingResult> {
  // Consistent grading standards across all difficulties
  const standardGuidelines = `
Grade using CONSISTENT standards regardless of difficulty level:

GRAMMAR (0-100):
- 90-100: Perfect or near-perfect grammar with minor slip-ups
- 70-89: Generally correct with some errors that don't impede understanding
- 50-69: Multiple errors but message is understandable
- 30-49: Significant errors that sometimes confuse meaning
- 0-29: Grammar severely impedes communication

FLUENCY (0-100):
- 90-100: Natural, smooth expression like a proficient speaker
- 70-89: Clear communication with some awkwardness
- 50-69: Understandable but noticeably non-native
- 30-49: Choppy, requires effort to understand
- 0-29: Very broken, difficult to follow

VOCABULARY (0-100):
- 90-100: Excellent word choice, appropriate and natural
- 70-89: Good vocabulary with occasional awkward choices
- 50-69: Basic vocabulary, gets point across
- 30-49: Limited vocabulary, some incorrect usage
- 0-29: Very poor vocabulary, wrong words frequently

NATURALNESS (0-100):
- 90-100: Sounds like a native or advanced speaker
- 70-89: Natural with minor non-native patterns
- 50-69: Functional but clearly non-native
- 30-49: Unnatural phrasing, sounds foreign
- 0-29: Very unnatural, doesn't sound like natural language

Apply these standards EQUALLY to all difficulty levels. A score of 70 means the same thing whether in Beginner or Hard mode.`;

  const difficultyGuidelines: Record<string, string> = {
    Beginner: standardGuidelines,
    Easy: standardGuidelines,
    Medium: standardGuidelines,
    Hard: standardGuidelines
  };
  
  // Format messages with indices for detailed analysis
  const formattedMessages = request.messages.map((msg, idx) => 
    `[${idx}] ${msg.sender === "user" ? "Student" : "Bot"}: ${msg.text}`
  ).join("\n");
  
  // Different prompts based on premium status
  const detailedAnalysisSection = isPremium ? `
2. ULTRA-DETAILED MESSAGE-BY-MESSAGE ANALYSIS (messageAnalysis array):
For EVERY SINGLE student message, provide EXHAUSTIVE linguistic analysis:

- messageIndex: the message number [0, 1, 2...]
- sender: "user" 
- originalText: the exact message text

- grammarCorrections: array of EVERY grammar issue (minimum 2-3 per message unless truly perfect)
  {original: "exact error phrase", corrected: "proper form", explanation: "detailed grammar rule + why this matters"}
  Find ALL issues:
  * Word order errors and particle placement
  * Verb conjugation, tense, aspect, mood errors
  * Article usage, preposition choice
  * Subject-verb agreement, noun-adjective agreement
  * Case markers, classifiers, measure words
  * Sentence structure and clause connection
  * Honorific/formality level appropriateness

- vocabularySuggestions: array of BETTER word choices (minimum 2-3 per message)
  {word: "student's word", betterAlternative: "superior choice", reason: "why it's more natural/precise/idiomatic"}
  Suggest improvements for:
  * More natural, idiomatic expressions
  * More precise vocabulary
  * More contextually appropriate words
  * More advanced/native-sounding alternatives
  * Better collocations and word combinations

- sentenceImprovement: REQUIRED for every message
  {
    original: "student's exact sentence",
    improved: "how a fluent native speaker would express this same idea",
    explanation: "line-by-line breakdown: what changed and why each change makes it more natural"
  }
  Even if sentence is good, show the native-level version with subtle improvements

- strengths: array of 3-4 specific things done well
  * Specific grammar structures used correctly
  * Good vocabulary choices and why
  * Natural expressions or phrasing
  * Appropriate cultural/contextual usage

- improvements: array of 3-4 actionable suggestions
  * Specific grammar points to study
  * Vocabulary areas to expand
  * Practice recommendations
  * Cultural/contextual improvements

ANALYSIS REQUIREMENTS:
- NO message should have empty arrays - find something to improve in EVERY message
- Be EXHAUSTIVE: analyze word choice, grammar, naturalness, cultural appropriateness
- Provide TEACHING explanations: explain the "why" behind every correction
- Compare to native speaker level: how would a native say this?
- Give detailed linguistic reasoning for all suggestions
- For beginners: be encouraging but still thorough
- For advanced: be precise and highlight subtle improvements` : '';
  
  const prompt = `You are an expert ${request.language} language teacher and linguistic analyst providing ${isPremium ? 'ULTRA-DETAILED, professional-grade message-by-message' : 'general'} feedback for a conversation at ${request.difficulty} difficulty level.

Topic: ${request.topic}
Target vocabulary: ${request.vocabulary.join(", ")}
Difficulty level: ${request.difficulty}

${difficultyGuidelines[request.difficulty] || difficultyGuidelines.Medium}

${isPremium ? `
PREMIUM ANALYSIS STANDARDS:
Your analysis must be comprehensive and educational. Every message deserves detailed linguistic examination:
- Find subtle improvements even in good sentences
- Explain grammar rules thoroughly with examples
- Suggest more natural/native alternatives
- Provide cultural and contextual insights
- Give specific, actionable study recommendations
- Make your feedback a learning resource, not just corrections
` : ''}

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
      max_tokens: isPremium ? 6000 : 1500, // Increased tokens for ultra-detailed premium feedback
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
  isPracticeMode: boolean = false,
  botPersonality?: string
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
    Beginner: `You are a TRUE BEGINNER learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use ONLY the most basic, fundamental words that beginners learn first:
- Basic verbs: be, have, want, like, go, eat, do, see, need
- Basic nouns: I, you, he, she, thing, person, place, time, day
- Basic adjectives: good, bad, big, small, happy, new, old
- No complex words, no idioms, no advanced expressions
- Stick to survival-level vocabulary only

SENTENCE STRUCTURE: Use extremely simple structures:
- Single words or 2-4 word fragments
- Subject + verb only ("I go", "You like?")
- No complex sentences, no subordinate clauses
- Very basic, choppy expression

ERROR PATTERN: Make 3-4 MAJOR mistakes:
- Mix in English words when you don't know the target language word
- SEVERE grammar mistakes - wrong word order, missing words, incorrect everything
- Make it sound like someone in their first week of learning`,
    Easy: `You are a BEGINNER learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use simple, everyday vocabulary appropriate for early learners:
- Common daily verbs: think, know, say, help, take, give, make, find
- Common nouns: home, work, food, friend, family, city, country
- Simple adjectives: nice, easy, difficult, important, interesting
- Avoid idioms, avoid complex or technical terms
- Elementary conversational level only

SENTENCE STRUCTURE: Use simple, straightforward structures:
- Short sentences with basic structures
- Simple present/past tense primarily
- Subject + verb + object patterns
- Avoid complex clauses or advanced constructions

ERROR PATTERN: Make 2-3 noticeable mistakes:
- Basic grammar errors (particles, word order, articles/gender)
- Include awkward phrasing or unnatural expressions
- Keep questions short and simple despite the errors`,
    Medium: `You are an INTERMEDIATE learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use standard conversational vocabulary:
- Everyday conversational words and phrases
- Common expressions and idioms
- Mix of simple and moderately complex vocabulary
- Normal social and casual register
- Vocabulary appropriate for daily conversations

SENTENCE STRUCTURE: Use natural conversational structures:
- Full, complete sentences with natural flow
- Mix of simple and compound sentences
- Occasional complex structures
- Normal spoken language patterns

ERROR PATTERN: Make 1-2 moderate mistakes:
- Occasional grammar slips (verb conjugations, prepositions, measure words)
- Sound mostly natural but with noticeable learner imperfections
- Questions are understandable but not perfect`,
    Hard: `You are an ADVANCED learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use sophisticated, nuanced vocabulary:
- Advanced vocabulary and expressions
- Idiomatic phrases and cultural references
- Precise, specific word choices
- Formal and informal register variation
- Near-native vocabulary range

SENTENCE STRUCTURE: Use complex, natural structures:
- Complex sentences with multiple clauses
- Natural connecting phrases and transitions
- Sophisticated grammatical constructions
- Fluid, native-like expression

ERROR PATTERN: Make 1 subtle mistake:
- Minor errors that even advanced learners make (tone mistakes, subjunctive errors)
- Mostly fluent with only small imperfections
- Questions demonstrate high proficiency`
  };

  const mistakeTypes = mistakeGuidelines[language] || mistakeGuidelines.Chinese;

  const personalityContext = botPersonality ? `\n\nYour character/personality: ${botPersonality}` : '';

  const prompt = isPracticeMode 
    ? `You are a NATIVE ${language} speaker asking a question during a Q&A session about ${topic}.${personalityContext}

Target vocabulary to incorporate: ${vocabulary.join(", ")}
${previousQuestions.length > 0 ? `\nPrevious questions you asked:\n${previousQuestions.join("\n")}\n\nMake sure to ask a DIFFERENT question.` : ""}

Generate ONE PERFECT question in ${language} that:
- Uses at least one vocabulary word from the list
- Is relevant to the topic "${topic}"
- Uses PERFECT grammar, vocabulary, and natural phrasing
- Sounds like a native speaker would speak
- Is clear and natural
${botPersonality ? '- Reflects your personality and background' : ''}

IMPORTANT: Generate PERFECT ${language}. No mistakes. This is for language practice.

Respond with ONLY the question in ${language}, nothing else.`
    : `You are roleplaying as a human ${language} language LEARNER (not a teacher) asking a question during a Q&A session about ${topic}.${personalityContext}

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
${botPersonality ? '- Reflects your personality and background' : ''}

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
  isPracticeMode: boolean = false,
  botPersonality?: string
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
    Beginner: `You are a TRUE BEGINNER learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use ONLY the most basic, fundamental words that beginners learn first:
- Basic verbs: be, have, want, like, go, eat, do, see, need
- Basic nouns: I, you, he, she, thing, person, place, time, day
- Basic adjectives: good, bad, big, small, happy, new, old
- No complex words, no idioms, no advanced expressions
- Stick to survival-level vocabulary only

SENTENCE STRUCTURE: Use extremely simple structures:
- Single words or 1-4 word fragments ("Good!", "I like", "Yes, me too")
- Subject + verb only patterns
- No complex sentences, no subordinate clauses
- Very basic, choppy expression

ERROR PATTERN: Make 3-4 MAJOR mistakes:
- Mix in English words when you don't know the target language word
- SEVERE grammar mistakes - wrong word order, missing words, incorrect everything
- Keep answers VERY short - just 1-3 words or tiny fragments
- Make it sound like someone in their first week of learning`,
    Easy: `You are a BEGINNER learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use simple, everyday vocabulary appropriate for early learners:
- Common daily verbs: think, know, say, help, take, give, make, find
- Common nouns: home, work, food, friend, family, city, country
- Simple adjectives: nice, easy, difficult, important, interesting
- Avoid idioms, avoid complex or technical terms
- Elementary conversational level only

SENTENCE STRUCTURE: Use simple, straightforward structures:
- Short sentences (1-2 simple sentences)
- Simple present/past tense primarily
- Subject + verb + object patterns
- Avoid complex clauses or advanced constructions

ERROR PATTERN: Make 2-3 noticeable mistakes:
- Basic grammar errors (particles, word order, articles/gender)
- Include awkward phrasing or unnatural expressions
- Keep answers very short despite the errors`,
    Medium: `You are an INTERMEDIATE learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use standard conversational vocabulary:
- Everyday conversational words and phrases
- Common expressions and idioms
- Mix of simple and moderately complex vocabulary
- Normal social and casual register
- Vocabulary appropriate for daily conversations

SENTENCE STRUCTURE: Use natural conversational structures:
- Full, complete sentences (1-2 sentences)
- Mix of simple and compound sentences
- Occasional complex structures
- Normal spoken language patterns

ERROR PATTERN: Make 1-2 moderate mistakes:
- Occasional grammar slips (verb conjugations, prepositions, measure words)
- Sound mostly natural but with noticeable learner imperfections
- Answers are understandable but not perfect`,
    Hard: `You are an ADVANCED learner (${targetAccuracy}% proficiency).

VOCABULARY LEVEL: Use sophisticated, nuanced vocabulary:
- Advanced vocabulary and expressions
- Idiomatic phrases and cultural references
- Precise, specific word choices
- Formal and informal register variation
- Near-native vocabulary range

SENTENCE STRUCTURE: Use complex, natural structures:
- Complex sentences with multiple clauses (1-2 sentences)
- Natural connecting phrases and transitions
- Sophisticated grammatical constructions
- Fluid, native-like expression

ERROR PATTERN: Make 1 subtle mistake:
- Minor errors that even advanced learners make (tone mistakes, subjunctive errors)
- Mostly fluent with only small imperfections
- Answers demonstrate high proficiency`
  };

  const mistakeTypes = mistakeGuidelines[language] || mistakeGuidelines.Chinese;
  const personalityContext = botPersonality ? `\n\nYour character/personality: ${botPersonality}` : '';

  const prompt = isPracticeMode
    ? `You are a NATIVE ${language} speaker answering a question during a Q&A session about ${topic}.${personalityContext}

Question you're answering: ${userQuestion}

Target vocabulary to incorporate: ${vocabulary.join(", ")}

Answer the question in ${language} with 1-2 sentences that:
- Directly answer the question
- Naturally incorporate at least one vocabulary word from the list
- Uses PERFECT grammar, vocabulary, and natural phrasing
- Sounds like a native speaker would speak
- Is clear and natural
${botPersonality ? '- Reflects your personality and background' : ''}

IMPORTANT: Generate PERFECT ${language}. No mistakes. This is for language practice.

Respond with ONLY the answer in ${language}, nothing else.`
    : `You are roleplaying as a human ${language} language LEARNER (not a native speaker) answering a question during a Q&A session about ${topic}.${personalityContext}

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
${botPersonality ? '- Reflects your personality and background' : ''}

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
