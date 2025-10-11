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
  // Use rule-based conversation system for prototype
  return generateThematicResponse(conversationHistory, topic, vocabulary, language);
}

function generateThematicResponse(
  conversationHistory: Array<{ sender: string; text: string }>,
  topic: string,
  vocabulary: string[],
  language: string
): string {
  const messageCount = conversationHistory.filter(m => m.sender === "opponent").length;
  const lastUserMessage = conversationHistory.filter(m => m.sender === "user").slice(-1)[0]?.text || "";
  
  // Theme-specific response templates
  const responseTemplates: Record<string, Record<string, string[]>> = {
    "Travel & Tourism": {
      Chinese: [
        `我也很喜欢${vocabulary[0] || "旅行"}！你最喜欢去哪里？`,
        `${vocabulary[1] || "探索"}新地方真的很有趣。你觉得呢？`,
        `我对${vocabulary[2] || "文化"}也很感兴趣。你去过哪些国家？`,
        `${vocabulary[3] || "冒险"}让生活更精彩！你有什么难忘的经历吗？`,
        `我最近计划去一个新的${vocabulary[4] || "目的地"}。你有推荐吗？`
      ],
      Spanish: [
        `¡A mí también me encanta ${vocabulary[0] || "viajar"}! ¿Cuál es tu lugar favorito?`,
        `${vocabulary[1] || "Explorar"} nuevos lugares es realmente emocionante. ¿Qué piensas?`,
        `También me interesa mucho la ${vocabulary[2] || "cultura"}. ¿Qué países has visitado?`,
        `¡La ${vocabulary[3] || "aventura"} hace la vida más emocionante! ¿Tienes alguna experiencia memorable?`,
        `Estoy planeando ir a un nuevo ${vocabulary[4] || "destino"} pronto. ¿Tienes alguna recomendación?`
      ],
      Italian: [
        `Anche a me piace molto ${vocabulary[0] || "viaggiare"}! Qual è il tuo posto preferito?`,
        `${vocabulary[1] || "Esplorare"} posti nuovi è davvero emozionante. Cosa ne pensi?`,
        `Mi interessa molto anche la ${vocabulary[2] || "cultura"}. Quali paesi hai visitato?`,
        `L'${vocabulary[3] || "avventura"} rende la vita più eccitante! Hai qualche esperienza memorabile?`,
        `Sto pianificando di andare in una nuova ${vocabulary[4] || "destinazione"} presto. Hai qualche raccomandazione?`
      ]
    },
    "Food & Dining": {
      Chinese: [
        `我也很喜欢${vocabulary[0] || "美食"}！你最喜欢什么菜？`,
        `${vocabulary[1] || "烹饪"}是一门艺术。你会做菜吗？`,
        `这个${vocabulary[2] || "餐厅"}听起来不错！你经常去吗？`,
        `我喜欢尝试新的${vocabulary[3] || "菜单"}。你呢？`,
        `${vocabulary[4] || "味道"}很重要。你喜欢什么口味？`
      ],
      Spanish: [
        `¡A mí también me encanta la ${vocabulary[0] || "comida"}! ¿Cuál es tu plato favorito?`,
        `${vocabulary[1] || "Cocinar"} es un arte. ¿Sabes cocinar?`,
        `¡Ese ${vocabulary[2] || "restaurante"} suena genial! ¿Vas a menudo?`,
        `Me gusta probar ${vocabulary[3] || "menús"} nuevos. ¿Y tú?`,
        `El ${vocabulary[4] || "sabor"} es muy importante. ¿Qué sabores te gustan?`
      ],
      Italian: [
        `Anche a me piace molto il ${vocabulary[0] || "cibo"}! Qual è il tuo piatto preferito?`,
        `${vocabulary[1] || "Cucinare"} è un'arte. Sai cucinare?`,
        `Quel ${vocabulary[2] || "ristorante"} sembra fantastico! Ci vai spesso?`,
        `Mi piace provare ${vocabulary[3] || "menu"} nuovi. E tu?`,
        `Il ${vocabulary[4] || "sapore"} è molto importante. Quali sapori ti piacciono?`
      ]
    },
    "Technology": {
      Chinese: [
        `${vocabulary[0] || "科技"}发展真快！你怎么看？`,
        `我也对${vocabulary[1] || "创新"}很感兴趣。你用什么设备？`,
        `这个${vocabulary[2] || "应用"}很有用。你试过吗？`,
        `${vocabulary[3] || "人工智能"}改变了很多。你的看法是什么？`,
        `${vocabulary[4] || "未来"}会更加数字化。你觉得呢？`
      ],
      Spanish: [
        `¡La ${vocabulary[0] || "tecnología"} avanza muy rápido! ¿Qué opinas?`,
        `También me interesa la ${vocabulary[1] || "innovación"}. ¿Qué dispositivos usas?`,
        `Esta ${vocabulary[2] || "aplicación"} es muy útil. ¿La has probado?`,
        `La ${vocabulary[3] || "inteligencia artificial"} ha cambiado mucho. ¿Cuál es tu opinión?`,
        `El ${vocabulary[4] || "futuro"} será más digital. ¿Qué piensas?`
      ],
      Italian: [
        `La ${vocabulary[0] || "tecnologia"} avanza molto velocemente! Cosa ne pensi?`,
        `Anche a me interessa l'${vocabulary[1] || "innovazione"}. Quali dispositivi usi?`,
        `Questa ${vocabulary[2] || "applicazione"} è molto utile. L'hai provata?`,
        `L'${vocabulary[3] || "intelligenza artificiale"} ha cambiato molto. Qual è la tua opinione?`,
        `Il ${vocabulary[4] || "futuro"} sarà più digitale. Cosa ne pensi?`
      ]
    }
  };

  // Get templates for current topic and language, or use Travel as default
  const topicTemplates = responseTemplates[topic]?.[language] || 
                         responseTemplates["Travel & Tourism"]?.[language] ||
                         responseTemplates["Travel & Tourism"]["Chinese"];
  
  // Select response based on message count to ensure variety
  const responseIndex = messageCount % topicTemplates.length;
  return topicTemplates[responseIndex];
}
