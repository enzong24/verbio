import { useState, useEffect } from "react";
import { Send, Flag, Clock } from "lucide-react";
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

export default function DuelInterface({
  topic = "Travel & Tourism",
  vocabulary = [
    { word: "旅行", romanization: "lǚxíng" },
    { word: "目的地", romanization: "mùdìdì" },
    { word: "探索", romanization: "tànsuǒ" }
  ],
  opponentName = "Maria García",
  opponentElo = 1520,
  userElo = 1547,
  isBot = false,
  language = "Chinese",
  difficulty = "Medium",
  onComplete,
  onForfeit
}: DuelInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [round, setRound] = useState(1);
  const [isGrading, setIsGrading] = useState(false);
  const maxRounds = 5;
  const userMessageCount = messages.filter(m => m.sender === "user").length;

  const botResponseMutation = useMutation({
    mutationFn: async (conversationHistory: Message[]) => {
      const vocabStrings = vocabulary.map(v => v.word);
      const response = await apiRequest("POST", "/api/bot-response", {
        conversationHistory,
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (userMessageCount < maxRounds) {
            setRound(r => r + 1);
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
  }, [userMessageCount]);

  const handleComplete = async () => {
    if (isGrading || messages.length === 0) return;
    setIsGrading(true);
    await gradingMutation.mutateAsync(messages);
  };

  const handleSend = async () => {
    if (!input.trim() || userMessageCount >= maxRounds) return;
    
    const newMessage: Message = {
      sender: "user",
      text: input,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");

    // If it's a bot match, generate response
    if (isBot) {
      const response = await botResponseMutation.mutateAsync(updatedMessages);
      if (response?.response) {
        setMessages([...updatedMessages, {
          sender: "opponent",
          text: response.response,
          timestamp: Date.now()
        }]);
      }
    } else {
      // Simulate opponent response for human matches (would be WebSocket in real app)
      setTimeout(() => {
        const responsesByLanguage: Record<string, string[]> = {
          Chinese: [
            "我很喜欢旅行！我最近去了北京。",
            "中国文化真的很迷人，特别是美食。",
            "探索新地方总是一个令人兴奋的冒险。",
            "你去过中国吗？",
            "旅行是了解其他文化的最好方式。"
          ],
          Spanish: [
            "¡Me encanta viajar! Recientemente fui a Madrid.",
            "La cultura española es fascinante, especialmente la comida.",
            "Explorar nuevos lugares siempre es una aventura emocionante.",
            "¿Has estado en España?",
            "Viajar es la mejor manera de conocer otras culturas."
          ],
          Italian: [
            "Adoro viaggiare! Recentemente sono stato a Roma.",
            "La cultura italiana è affascinante, soprattutto il cibo.",
            "Esplorare nuovi luoghi è sempre un'avventura emozionante.",
            "Sei mai stato in Italia?",
            "Viaggiare è il modo migliore per conoscere altre culture."
          ]
        };
        
        const responses = responsesByLanguage[language] || responsesByLanguage.Chinese;
        setMessages(prev => [...prev, {
          sender: "opponent",
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now()
        }]);
      }, 1500);
    }

    // Check if this was the last message
    if (userMessageCount + 1 >= maxRounds) {
      setTimeout(() => handleComplete(), 2000);
    }
  };

  const handleForfeit = () => {
    if (window.confirm("Are you sure you want to forfeit this match? You will lose Elo points.")) {
      onForfeit?.();
    }
  };

  const progress = (userMessageCount / maxRounds) * 100;

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
            <div className="text-xs text-muted-foreground">Messages: {userMessageCount}/{maxRounds}</div>
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
                    <TextWithPinyin text={msg.text} language={language} />
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
                  placeholder={`Type your message in ${language}...`}
                  className="flex-1"
                  disabled={userMessageCount >= maxRounds || isGrading}
                  data-testid="input-message"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={userMessageCount >= maxRounds || isGrading || !input.trim()}
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
                    <span className="text-muted-foreground">Messages Sent</span>
                    <span className="font-mono font-semibold">
                      {userMessageCount}/{maxRounds}
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
