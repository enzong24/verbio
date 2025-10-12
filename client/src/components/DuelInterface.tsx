import { useState, useEffect } from "react";
import { Send, Flag, Clock, HelpCircle } from "lucide-react";
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
import type { Message, GradingResult } from "@shared/schema";

interface VocabWord {
  word: string;
  romanization: string;
}

interface DuelInterfaceProps {
  topic?: string;
  vocabulary?: VocabWord[];
  opponentName?: string;
  opponentElo?: number;
  userElo?: number;
  isBot?: boolean;
  language?: string;
  difficulty?: string;
  onComplete?: (result: GradingResult) => void;
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
  language = "Chinese",
  difficulty = "Medium",
  onComplete,
  onForfeit
}: DuelInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [round, setRound] = useState(1);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>("bot-question");
  const [isGrading, setIsGrading] = useState(false);
  const [botQuestions, setBotQuestions] = useState<string[]>([]);
  const maxRounds = 5;

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

  const gradingMutation = useMutation({
    mutationFn: async (msgs: Message[]) => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/grade", {
        messages: msgs,
        topic,
        vocabulary: vocabStrings,
        language,
        difficulty
      });
      return await response.json() as GradingResult;
    },
    onSuccess: (result) => {
      onComplete?.(result);
    },
  });

  // Bot asks first question when component mounts
  useEffect(() => {
    if (isBot && messages.length === 0) {
      askBotQuestion();
    }
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (round < maxRounds) {
            // Move to next round
            if (turnPhase === "user-answer" || turnPhase === "bot-question") {
              // Skip to user question phase if user didn't answer
              handleDontKnow();
            }
            return 30;
          } else {
            clearInterval(timer);
            handleComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [round, turnPhase]);

  const askBotQuestion = async () => {
    setTurnPhase("bot-question"); // Show "Bot is thinking..." state
    
    // Add delay to simulate bot typing (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await botQuestionMutation.mutateAsync();
    if (response?.question) {
      const botMessage: Message = {
        sender: "opponent",
        text: response.question,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
      setBotQuestions(prev => [...prev, response.question]);
      setTurnPhase("user-answer");
      setTimeLeft(30);
    }
  };

  const handleComplete = async () => {
    if (isGrading || messages.length === 0) return;
    setIsGrading(true);
    await gradingMutation.mutateAsync(messages);
  };

  const handleDontKnow = () => {
    // User skips answering - add a placeholder message
    const skipMessage: Message = {
      sender: "user",
      text: "(Skipped)",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, skipMessage]);
    setTurnPhase("user-question");
    setTimeLeft(30);
  };

  const handleUserAnswer = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTurnPhase("user-question");
    setTimeLeft(30);
  };

  const handleUserQuestion = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setTurnPhase("bot-answer");

    // Bot answers the question
    if (isBot) {
      // Add delay to simulate bot typing (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await botAnswerMutation.mutateAsync(userMessage.text);
      if (response?.answer) {
        const botAnswerMsg: Message = {
          sender: "opponent",
          text: response.answer,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botAnswerMsg]);
        
        // Move to next round or complete
        if (round < maxRounds) {
          setRound(r => r + 1);
          setTimeout(() => askBotQuestion(), 1000);
        } else {
          setTimeout(() => handleComplete(), 2000);
        }
      }
    }
  };

  const handleSend = () => {
    if (turnPhase === "user-answer") {
      handleUserAnswer();
    } else if (turnPhase === "user-question") {
      handleUserQuestion();
    }
  };

  const handleForfeit = () => {
    const message = isBot 
      ? "Are you sure you want to end this practice session?" 
      : "Are you sure you want to forfeit this match? You will lose Elo points.";
    
    if (window.confirm(message)) {
      onForfeit?.();
    }
  };

  const progress = (round / maxRounds) * 100;
  const isUserTurn = turnPhase === "user-answer" || turnPhase === "user-question";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-card-border bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                {opponentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold flex items-center gap-2" data-testid="text-opponent-name">
                {opponentName}
                {isBot && <Badge variant="secondary" className="text-xs">AI Bot</Badge>}
              </div>
              <div className="text-sm text-muted-foreground font-mono">{opponentElo} Elo</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : ''}`} data-testid="text-timer">
                {timeLeft}s
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Round: {round}/{maxRounds}
            </div>
          </div>

          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleForfeit}
            disabled={isGrading}
            data-testid="button-forfeit"
          >
            <Flag className="w-4 h-4 mr-2" />
            Forfeit
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex">
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-card-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Topic:</span>
                <Badge variant="outline">{topic}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {vocabulary.map((vocabItem) => (
                  <VocabularyBadge 
                    key={vocabItem.word}
                    chinese={vocabItem.word}
                    pinyin={vocabItem.romanization}
                    language={language}
                    className="text-xs"
                  />
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {turnPhase === "user-answer" && "⏳ Your turn to answer the question"}
                {turnPhase === "user-question" && "❓ Your turn to ask a question using vocabulary"}
                {turnPhase === "bot-question" && "🤖 Bot is thinking..."}
                {turnPhase === "bot-answer" && "🤖 Bot is answering..."}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-md ${
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
                  <Badge variant="outline" className="animate-pulse">
                    AI is grading your performance...
                  </Badge>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-card-border bg-card">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    turnPhase === "user-answer" 
                      ? `Answer in ${language}...` 
                      : `Ask a question in ${language}...`
                  }
                  className="flex-1"
                  disabled={!isUserTurn || isGrading}
                  data-testid="input-message"
                />
                {turnPhase === "user-answer" && (
                  <Button 
                    variant="outline"
                    onClick={handleDontKnow} 
                    disabled={isGrading}
                    data-testid="button-dont-know"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Don't Know
                  </Button>
                )}
                <Button 
                  onClick={handleSend} 
                  disabled={!isUserTurn || isGrading || !input.trim()}
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="w-80 border-l border-card-border bg-card/50 p-6">
            <Card className="border-card-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Match Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-mono font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Elo</span>
                    <span className="font-mono font-semibold">{userElo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Opponent Elo</span>
                    <span className="font-mono font-semibold">{opponentElo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Round</span>
                    <span className="font-mono font-semibold">
                      {round}/{maxRounds}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Turn Phase</span>
                    <span className="font-mono font-semibold text-xs">
                      {turnPhase === "user-answer" && "Answer"}
                      {turnPhase === "user-question" && "Ask"}
                      {turnPhase === "bot-question" && "Bot Asks"}
                      {turnPhase === "bot-answer" && "Bot Answers"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
