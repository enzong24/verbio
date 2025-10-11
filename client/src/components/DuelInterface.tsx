import { useState, useEffect } from "react";
import { Send, Flag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Message {
  id: string;
  sender: "user" | "opponent";
  text: string;
}

interface DuelInterfaceProps {
  topic?: string;
  vocabulary?: string[];
  opponentName?: string;
  opponentElo?: number;
  userElo?: number;
  onComplete?: () => void;
}

export default function DuelInterface({
  topic = "Travel & Tourism",
  vocabulary = ["journey", "destination", "explore", "adventure", "culture"],
  opponentName = "Maria García",
  opponentElo = 1520,
  userElo = 1547,
  onComplete
}: DuelInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [round, setRound] = useState(1);
  const maxRounds = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (round < maxRounds) {
            setRound(r => r + 1);
            return 30;
          } else {
            clearInterval(timer);
            setTimeout(() => onComplete?.(), 1000);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [round, onComplete]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: "user",
      text: input
    }]);
    setInput("");

    // Simulate opponent response
    setTimeout(() => {
      const responses = [
        "¡Me encanta viajar! Mi último destino fue Barcelona.",
        "La cultura española es fascinante, especialmente su gastronomía.",
        "Explorar nuevos lugares siempre es una aventura emocionante."
      ];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "opponent",
        text: responses[Math.floor(Math.random() * responses.length)]
      }]);
    }, 1500);
  };

  const progress = ((maxRounds - round + 1) / maxRounds) * 100;

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
              <div className="font-semibold" data-testid="text-opponent-name">{opponentName}</div>
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
            <div className="text-xs text-muted-foreground">Round {round}/{maxRounds}</div>
          </div>

          <Button variant="destructive" size="sm" data-testid="button-forfeit">
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
                {vocabulary.map((word) => (
                  <Badge key={word} variant="secondary" className="text-xs">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-md ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-card-border bg-card">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message in Spanish..."
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button onClick={handleSend} data-testid="button-send">
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
                      {messages.filter(m => m.sender === "user").length}/5
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
