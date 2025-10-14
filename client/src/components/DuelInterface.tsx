import { useState, useEffect, useRef } from "react";
import { Send, Flag, Clock, HelpCircle, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import VocabularyBadge from "@/components/VocabularyBadge";
import TextWithPinyin from "@/components/TextWithPinyin";
import AccentKeyboard from "@/components/AccentKeyboard";
import type { Message, GradingResult } from "@shared/schema";

interface VocabWord {
  word: string;
  romanization: string;
  definition?: string;
}

interface DuelInterfaceProps {
  topic?: string;
  vocabulary?: VocabWord[];
  opponentName?: string;
  opponentElo?: number;
  userElo?: number;
  isBot?: boolean;
  isPracticeMode?: boolean;
  language?: string;
  difficulty?: string;
  onComplete?: (result: GradingResult, messages?: Message[]) => void;
  onForfeit?: () => void;
  startsFirst?: boolean;
  matchId?: string;
  playerId?: string;
  multiplayerWsRef?: React.MutableRefObject<WebSocket | null>;
}

type TurnPhase = "bot-question" | "user-answer" | "user-question" | "bot-answer";

export default function DuelInterface({
  topic = "Travel & Tourism",
  vocabulary = [
    { word: "旅行", romanization: "lǚxíng" },
    { word: "目的地", romanization: "mùdìdì" },
    { word: "探索", romanization: "tànsuǒ" }
  ],
  opponentName = "AI Bot",
  opponentElo = 1520,
  userElo = 1000,
  isBot = true,
  isPracticeMode = false,
  language = "Chinese",
  difficulty = "Medium",
  onComplete,
  onForfeit,
  startsFirst = false,
  matchId,
  playerId,
  multiplayerWsRef
}: DuelInterfaceProps) {
  // Get timer duration based on difficulty
  const getTimerDuration = () => {
    switch (difficulty) {
      case "Beginner": return 120; // 2 minutes (very generous)
      case "Easy": return 90;      // 1.5 minutes
      case "Medium": return 60;    // 1 minute
      case "Hard": return 30;      // 30 seconds
      default: return 60;
    }
  };

  // Get max rounds based on difficulty
  const getMaxRounds = () => {
    switch (difficulty) {
      case "Beginner": return 2;   // Only 2 rounds for beginners
      case "Easy": return 3;
      case "Medium": return 4;
      case "Hard": return 5;
      default: return 3;
    }
  };

  // Determine initial turn phase based on who starts first
  const initialTurnPhase: TurnPhase = startsFirst ? "user-question" : "bot-question";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(getTimerDuration());
  const [round, setRound] = useState(1);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>(initialTurnPhase);
  const [isGrading, setIsGrading] = useState(false);
  const [botQuestions, setBotQuestions] = useState<string[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [inactivityTimeLeft, setInactivityTimeLeft] = useState(60);
  const [validationError, setValidationError] = useState("");
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const maxRounds = getMaxRounds();
  
  // Refs to avoid recreating timer interval
  const shouldCountRef = useRef(false);
  const currentRoundRef = useRef(1);
  const currentTurnPhaseRef = useRef<TurnPhase>(initialTurnPhase);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityCountRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  const botQuestionMutation = useMutation({
    mutationFn: async () => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/bot-question", {
        topic,
        vocabulary: vocabStrings,
        language,
        difficulty,
        previousQuestions: botQuestions,
        isPracticeMode
      });
      return await response.json();
    },
  });

  const translateMutation = useMutation({
    mutationFn: async ({ text, fromLanguage }: { text: string; fromLanguage: string }) => {
      const response = await apiRequest("POST", "/api/translate", {
        text,
        fromLanguage,
        toLanguage: "English"
      });
      return await response.json();
    },
  });

  const botAnswerMutation = useMutation({
    mutationFn: async (userQuestion: string) => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/bot-answer", {
        userQuestion,
        topic,
        vocabulary: vocabStrings,
        language,
        difficulty,
        isPracticeMode
      });
      return await response.json();
    },
  });

  const validateQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/validate-question", {
        question,
        topic,
        vocabulary: vocabStrings,
        language
      });
      return await response.json();
    },
  });

  const gradingMutation = useMutation({
    mutationFn: async (messagesToGrade: Message[]) => {
      const response = await apiRequest("POST", "/api/grade", {
        messages: messagesToGrade,
        topic,
        vocabulary: vocabulary.map(v => v.word),
        language,
        difficulty,
        skippedQuestions
      });
      return await response.json();
    },
  });

  // Setup WebSocket message handlers for human vs human matches
  useEffect(() => {
    if (!isBot && matchId && playerId && multiplayerWsRef?.current) {
      const ws = multiplayerWsRef.current;
      
      // Set up message handlers on the existing WebSocket from App.tsx
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'opponent_message') {
            // Receive opponent's message
            setMessages(prev => [...prev, { 
              sender: "opponent", 
              text: data.text, 
              timestamp: data.timestamp 
            }]);
          }
          
          if (data.type === 'opponent_turn_complete') {
            // Opponent completed their turn, now it's our turn
            setTurnPhase(data.turnPhase);
            currentTurnPhaseRef.current = data.turnPhase;
            shouldCountRef.current = true;
            setTimeLeft(getTimerDuration());
            resetInactivity();
          }
          
          if (data.type === 'opponent_disconnected') {
            // Opponent disconnected, you win by forfeit
            handleOpponentForfeit();
          }
          
          if (data.type === 'opponent_forfeit') {
            // Opponent forfeited, you win!
            handleOpponentForfeit();
          }
          
          // opponent_grading_result is handled by App.tsx
        } catch (error) {
          console.error('DuelInterface: WebSocket message error:', error);
        }
      };
      
      ws.addEventListener('message', messageHandler);
      
      return () => {
        // Remove our message handler but don't close the WebSocket
        ws.removeEventListener('message', messageHandler);
      };
    }
  }, [isBot, matchId, playerId, multiplayerWsRef?.current]);

  // Initialize with bot question only if bot starts first (only for AI opponents)
  useEffect(() => {
    if (isBot && !startsFirst) {
      botQuestionMutation.mutate();
    } else if (startsFirst || !isBot) {
      // User starts first or human match, enable timer and inactivity tracking immediately
      shouldCountRef.current = true;
      inactivityCountRef.current = true;
      setTimeLeft(getTimerDuration());
      setInactivityTimeLeft(60);
    }
  }, []);

  // Update when bot question is ready
  useEffect(() => {
    if (botQuestionMutation.isSuccess && botQuestionMutation.data) {
      const botQuestion = botQuestionMutation.data.question;
      setBotQuestions(prev => [...prev, botQuestion]);
      setMessages(prev => [...prev, { sender: "opponent", text: botQuestion, timestamp: Date.now() }]);
      setTurnPhase("user-answer");
      currentTurnPhaseRef.current = "user-answer";
      shouldCountRef.current = true;
      setTimeLeft(getTimerDuration());
      resetInactivity();
    }
  }, [botQuestionMutation.isSuccess, botQuestionMutation.data]);

  // Update when bot answer is ready
  useEffect(() => {
    if (botAnswerMutation.isSuccess && botAnswerMutation.data) {
      const newMessage = { sender: "opponent" as const, text: botAnswerMutation.data.answer, timestamp: Date.now() };
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      if (round >= maxRounds) {
        shouldCountRef.current = false;
        setIsGrading(true);
        gradingMutation.mutate(updatedMessages);
      } else {
        setRound(prev => prev + 1);
        currentRoundRef.current = round + 1;
        setTimeout(() => {
          botQuestionMutation.mutate();
        }, 500);
      }
    }
  }, [botAnswerMutation.isSuccess, botAnswerMutation.data]);

  // Update when grading is complete
  useEffect(() => {
    if (gradingMutation.isSuccess && gradingMutation.data) {
      // Send grading result to opponent if multiplayer
      if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN && matchId && playerId) {
        console.log('DuelInterface: Sending player grading result to opponent');
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_grading_result',
          playerId,
          matchId,
          gradingResult: {
            grammar: gradingMutation.data.grammar,
            fluency: gradingMutation.data.fluency,
            vocabulary: gradingMutation.data.vocabulary,
            naturalness: gradingMutation.data.naturalness,
            overall: gradingMutation.data.overall
          }
        }));
      }
      
      onComplete?.(gradingMutation.data, messages);
    }
  }, [gradingMutation.isSuccess, gradingMutation.data, multiplayerWsRef]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldCountRef.current && timeLeft > 0) {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          console.log(`Timer counting: ${prev} -> ${newTime}`);
          if (newTime === 0) {
            handleTimeUp();
          }
          return newTime;
        });
      }

      if (inactivityCountRef.current && inactivityTimeLeft > 0) {
        setInactivityTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime === 0) {
            handleInactivityTimeout();
          }
          return newTime;
        });
      }
    }, 1000);

    return () => {
      console.log("Cleaning up timer interval");
      clearInterval(interval);
    };
  }, [timeLeft, inactivityTimeLeft]);

  const resetInactivity = () => {
    setInactivityTimeLeft(60);
    inactivityCountRef.current = true;
  };

  const handleInactivityTimeout = () => {
    inactivityCountRef.current = false;
    handleForfeit();
  };

  const handleTimeUp = () => {
    shouldCountRef.current = false;
    
    if (currentTurnPhaseRef.current === "user-answer") {
      handleDontKnow();
    } else if (currentTurnPhaseRef.current === "user-question") {
      handleDontKnow();
    }
  };

  const handleSend = async () => {
    // Prevent sending during any loading state
    if (!input.trim() || !isUserTurn || isGrading || 
        validateQuestionMutation.isPending || 
        botQuestionMutation.isPending || 
        botAnswerMutation.isPending) return;

    const messageToSend = input;
    const timestamp = Date.now();

    if (turnPhase === "user-answer") {
      shouldCountRef.current = false;
      setMessages(prev => [...prev, { sender: "user", text: messageToSend, timestamp }]);
      setInput("");
      
      // Send message to opponent if multiplayer
      if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN) {
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_message',
          playerId,
          text: messageToSend,
          sender: "user",
          timestamp
        }));
      }
      
      setTurnPhase("user-question");
      currentTurnPhaseRef.current = "user-question";
      setTimeLeft(getTimerDuration());
      shouldCountRef.current = true;
      resetInactivity();
    } else if (turnPhase === "user-question") {
      const validation = await validateQuestionMutation.mutateAsync(messageToSend);
      
      if (!validation.isValid) {
        setValidationError(validation.message || "Invalid question. Please try asking something related to the topic.");
        return;
      }

      shouldCountRef.current = false;
      setMessages(prev => [...prev, { sender: "user", text: messageToSend, timestamp }]);
      setInput("");
      
      // For multiplayer: send message and wait for opponent's answer
      if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN) {
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_message',
          playerId,
          text: messageToSend,
          sender: "user",
          timestamp
        }));
        
        // Notify opponent that it's their turn to answer
        multiplayerWsRef.current.send(JSON.stringify({
          type: 'player_turn_complete',
          playerId,
          turnPhase: "user-answer"
        }));
        
        // Wait for opponent's answer
        setTurnPhase("bot-answer");
        currentTurnPhaseRef.current = "bot-answer";
        shouldCountRef.current = false;
      } else {
        // For AI: use bot answer mutation
        setTurnPhase("bot-answer");
        currentTurnPhaseRef.current = "bot-answer";
        botAnswerMutation.mutate(messageToSend);
      }
      resetInactivity();
    }
  };

  const handleDontKnow = () => {
    shouldCountRef.current = false;
    setSkippedQuestions(prev => prev + 1);
    
    if (turnPhase === "user-answer") {
      setMessages(prev => [...prev, { sender: "user", text: "(Skipped)", timestamp: Date.now() }]);
      setTurnPhase("user-question");
      currentTurnPhaseRef.current = "user-question";
      setTimeLeft(getTimerDuration());
      shouldCountRef.current = true;
      resetInactivity();
    } else if (turnPhase === "user-question") {
      setMessages(prev => [...prev, { sender: "user", text: "(Skipped)", timestamp: Date.now() }]);
      setTurnPhase("bot-answer");
      currentTurnPhaseRef.current = "bot-answer";
      const defaultQuestion = language === "Chinese" ? "请告诉我更多" : 
                             language === "Spanish" ? "Cuéntame más" : 
                             "Raccontami di più";
      botAnswerMutation.mutate(defaultQuestion);
      resetInactivity();
    }
  };

  const handleForfeit = () => {
    shouldCountRef.current = false;
    inactivityCountRef.current = false;
    
    // Notify opponent if multiplayer
    if (!isBot && multiplayerWsRef?.current?.readyState === WebSocket.OPEN && matchId && playerId) {
      multiplayerWsRef.current.send(JSON.stringify({
        type: 'player_forfeit',
        playerId,
        matchId
      }));
    }
    
    onForfeit?.();
  };

  const handleOpponentForfeit = () => {
    shouldCountRef.current = false;
    inactivityCountRef.current = false;
    
    // When opponent forfeits, complete the match with a win for the current player
    // Set opponent scores to 0 and user scores high to ensure a win
    onComplete?.({
      grammar: 90,
      fluency: 90,
      vocabulary: 90,
      naturalness: 90,
      overall: 90,
      botGrammar: 0,
      botFluency: 0,
      botVocabulary: 0,
      botNaturalness: 0,
      botOverall: 0,
      botElo: opponentElo,
      feedback: ["Opponent forfeited. You win!"],
      isForfeit: true // Match ended by forfeit, show forfeit message for both players
    });
  };

  const handleAccentClick = (accent: string) => {
    const cursorPosition = inputRef.current?.selectionStart || input.length;
    const newInput = input.slice(0, cursorPosition) + accent + input.slice(cursorPosition);
    setInput(newInput);
    
    // Focus input and set cursor position after the inserted accent
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursorPosition + accent.length, cursorPosition + accent.length);
    }, 0);
  };

  const progress = (round / maxRounds) * 100;
  const isUserTurn = turnPhase === "user-answer" || turnPhase === "user-question";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-card p-3 md:p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-primary flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs md:text-sm">
                {opponentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold flex items-center gap-1 md:gap-2 text-sm md:text-base truncate" data-testid="text-opponent-name">
                <span className="truncate">{opponentName}</span>
                {isBot && <Badge className="text-xs flex-shrink-0 bg-accent/20 text-accent border-accent/30">Bot</Badge>}
              </div>
              {!isPracticeMode && (
                <div className="text-xs text-muted-foreground font-mono">{opponentElo} Fluency</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="flex items-center gap-1 md:gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`} data-testid="text-timer">
                  {timeLeft}s
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Round: {round}/{maxRounds}
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleForfeit}
              disabled={isGrading}
              data-testid="button-forfeit"
              className="flex-shrink-0 min-h-[48px] md:min-h-[40px] px-4"
            >
              <Flag className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Forfeit</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Topic Header */}
            <div className="p-3 md:p-4 border-b bg-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Swords className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-sm md:text-base">Topic:</span>
                  <Badge className="ml-2 text-xs md:text-sm bg-accent/20 text-accent border-accent/30">{topic}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {vocabulary.map((vocabItem) => (
                  <VocabularyBadge 
                    key={vocabItem.word}
                    chinese={vocabItem.word}
                    pinyin={vocabItem.romanization}
                    language={language}
                    className="text-xs"
                    definition={vocabItem.definition}
                  />
                ))}
              </div>
              <div className="mt-3 text-xs md:text-sm font-medium">
                {turnPhase === "user-answer" && <span className="text-primary">⏳ Your turn to answer the question</span>}
                {turnPhase === "user-question" && <span className="text-accent">❓ Your turn to ask a question using vocabulary</span>}
                {turnPhase === "bot-question" && (
                  <span className="text-muted-foreground">
                    {isBot ? "🤖 Bot is thinking..." : "⏳ Opponent is thinking..."}
                  </span>
                )}
                {turnPhase === "bot-answer" && (
                  <span className="text-success">
                    {isBot ? "🤖 Bot is answering..." : "💬 Opponent is answering..."}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4" data-testid="chat-messages">
              {messages.map((msg, idx) => {
                const isBotMessage = msg.sender === "opponent";
                const isBeginnerMode = difficulty === "Beginner";
                const shouldShowTranslation = isBotMessage && isBeginnerMode;
                const isHovered = hoveredMessageIndex === idx;
                const translation = translations[idx];

                return (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`inline-block max-w-[85%] md:max-w-2xl px-4 py-3 rounded-md text-base ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${shouldShowTranslation ? "cursor-help transition-all" : ""}`}
                      onMouseEnter={() => {
                        if (shouldShowTranslation && msg.text !== "(Skipped)") {
                          setHoveredMessageIndex(idx);
                          // Fetch translation if not already cached
                          if (!translations[idx]) {
                            translateMutation.mutate(
                              { text: msg.text, fromLanguage: language },
                              {
                                onSuccess: (data) => {
                                  setTranslations(prev => ({ ...prev, [idx]: data.translation }));
                                }
                              }
                            );
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        if (shouldShowTranslation) {
                          setHoveredMessageIndex(null);
                        }
                      }}
                    >
                      {msg.text === "(Skipped)" ? (
                        <span className="italic opacity-60">Skipped question</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div>
                            <TextWithPinyin text={msg.text} language={language} />
                          </div>
                          {shouldShowTranslation && isHovered && translation && (
                            <div className="pt-2 border-t border-primary/20 text-sm italic opacity-80">
                              {translation}
                            </div>
                          )}
                          {shouldShowTranslation && isHovered && !translation && translateMutation.isPending && (
                            <div className="pt-2 border-t border-primary/20 text-sm italic opacity-60">
                              Translating...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isGrading && (
                <div className="flex justify-center">
                  <Badge className="animate-pulse text-xs md:text-sm bg-accent/20 text-accent border-accent/30">
                    AI is grading your performance...
                  </Badge>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t bg-card pb-safe-bottom">
              <AccentKeyboard language={language} onAccentClick={handleAccentClick} />
              {validationError && (
                <div className="mb-2 p-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs md:text-sm" data-testid="validation-error">
                  {validationError}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    resetInactivity();
                    if (validationError) setValidationError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    turnPhase === "user-answer" 
                      ? `Answer in ${language}...` 
                      : `Ask a question in ${language}...`
                  }
                  className="flex-1 text-base min-h-[48px] md:min-h-[40px]"
                  disabled={!isUserTurn || isGrading || validateQuestionMutation.isPending || botQuestionMutation.isPending || botAnswerMutation.isPending}
                  data-testid="input-message"
                />
                {turnPhase === "user-answer" && (
                  <Button 
                    variant="outline"
                    onClick={handleDontKnow} 
                    disabled={isGrading || validateQuestionMutation.isPending || botQuestionMutation.isPending || botAnswerMutation.isPending}
                    data-testid="button-dont-know"
                    className="flex-shrink-0 min-h-[48px] md:min-h-[40px] px-4"
                  >
                    <HelpCircle className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Skip (-20pts)</span>
                    <span className="md:hidden">Skip</span>
                  </Button>
                )}
                <Button 
                  onClick={handleSend} 
                  disabled={!isUserTurn || isGrading || validateQuestionMutation.isPending || botQuestionMutation.isPending || botAnswerMutation.isPending}
                  data-testid="button-send"
                  className="flex-shrink-0 min-h-[48px] md:min-h-[40px] px-4"
                >
                  <Send className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Send</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Side Panel - Progress */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l bg-card p-3 md:p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Match Progress</span>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-accent/30 bg-accent/5 hidden md:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`
                  ${difficulty === 'Easy' ? 'bg-success/20 text-success border-success/30' : ''}
                  ${difficulty === 'Medium' ? 'bg-highlight/20 text-highlight-foreground border-highlight/30' : ''}
                  ${difficulty === 'Hard' ? 'bg-destructive/20 text-destructive border-destructive/30' : ''}
                `}>
                  {difficulty}
                </Badge>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <div>• {getTimerDuration()}s per turn</div>
                  <div>• {maxRounds} rounds total</div>
                  <div>• {skippedQuestions} questions skipped</div>
                </div>
              </CardContent>
            </Card>

            {!isPracticeMode && (
              <Card className="mt-3 border-primary/30 bg-primary/5 hidden md:block">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Fluency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">{userElo}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
