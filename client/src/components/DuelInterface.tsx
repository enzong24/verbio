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
  onForfeit
}: DuelInterfaceProps) {
  // Get timer duration based on difficulty
  const getTimerDuration = () => {
    switch (difficulty) {
      case "Easy": return 90;    // 1.5 minutes
      case "Medium": return 60;  // 1 minute
      case "Hard": return 30;    // 30 seconds
      default: return 60;
    }
  };

  // Get max rounds based on difficulty
  const getMaxRounds = () => {
    switch (difficulty) {
      case "Easy": return 3;
      case "Medium": return 4;
      case "Hard": return 5;
      default: return 3;
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(getTimerDuration());
  const [round, setRound] = useState(1);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>("bot-question");
  const [isGrading, setIsGrading] = useState(false);
  const [botQuestions, setBotQuestions] = useState<string[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [inactivityTimeLeft, setInactivityTimeLeft] = useState(60);
  const [validationError, setValidationError] = useState("");
  const maxRounds = getMaxRounds();
  
  // Refs to avoid recreating timer interval
  const shouldCountRef = useRef(false);
  const currentRoundRef = useRef(1);
  const currentTurnPhaseRef = useRef<TurnPhase>("bot-question");
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityCountRef = useRef(false);

  const botQuestionMutation = useMutation({
    mutationFn: async () => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/bot-question", {
        topic,
        vocabulary: vocabStrings,
        language,
        difficulty,
        previousQuestions: botQuestions
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
        difficulty
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
        vocabulary: vocabulary.map(v => v.word),
        language,
        difficulty,
        skippedQuestions
      });
      return await response.json();
    },
  });

  // Initialize with bot question
  useEffect(() => {
    botQuestionMutation.mutate();
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
      onComplete?.(gradingMutation.data, messages);
    }
  }, [gradingMutation.isSuccess, gradingMutation.data]);

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
    if (!input.trim() || !isUserTurn || isGrading) return;

    if (turnPhase === "user-answer") {
      shouldCountRef.current = false;
      setMessages(prev => [...prev, { sender: "user", text: input, timestamp: Date.now() }]);
      setInput("");
      setTurnPhase("user-question");
      currentTurnPhaseRef.current = "user-question";
      setTimeLeft(getTimerDuration());
      shouldCountRef.current = true;
      resetInactivity();
    } else if (turnPhase === "user-question") {
      const validation = await validateQuestionMutation.mutateAsync(input);
      
      if (!validation.isValid) {
        setValidationError(validation.reason || "Invalid question. Please ask using the vocabulary words.");
        return;
      }

      shouldCountRef.current = false;
      setMessages(prev => [...prev, { sender: "user", text: input, timestamp: Date.now() }]);
      const userQuestion = input;
      setInput("");
      setTurnPhase("bot-answer");
      currentTurnPhaseRef.current = "bot-answer";
      botAnswerMutation.mutate(userQuestion);
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
    onForfeit?.();
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
                {turnPhase === "bot-question" && <span className="text-muted-foreground">🤖 Bot is thinking...</span>}
                {turnPhase === "bot-answer" && <span className="text-success">🤖 Bot is answering...</span>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4" data-testid="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-md text-base ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.text === "(Skipped)" ? (
                      <span className="italic opacity-60">Skipped question</span>
                    ) : (
                      <TextWithPinyin text={msg.text} language={language} />
                    )}
                  </div>
                </div>
              ))}
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
                  disabled={!isUserTurn || isGrading}
                  data-testid="input-message"
                />
                {turnPhase === "user-answer" && (
                  <Button 
                    variant="outline"
                    onClick={handleDontKnow} 
                    disabled={isGrading}
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
                  disabled={!isUserTurn || isGrading}
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
