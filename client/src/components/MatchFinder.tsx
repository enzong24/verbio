import { useState, useCallback } from "react";
import { Swords, Bot, Loader2, Languages, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THEMES } from "@shared/themes";
import { useMatchmaking } from "@/hooks/useMatchmaking";

export type Language = "Chinese" | "Spanish" | "Italian";
export type Difficulty = "Easy" | "Medium" | "Hard";

const BOT_NAMES = [
  "AI Bot",
  "Language Master",
  "Fluent Helper",
  "Smart Partner",
  "Language Coach",
  "Study Buddy",
  "Conversation Expert",
  "Polyglot Pro",
  "AI Language Partner",
  "Wise Tutor",
  "Practice Assistant",
  "Grammar Expert",
  "Pronunciation Coach",
  "Vocabulary Master",
  "Culture Guide",
];

interface MatchFinderProps {
  onMatchFound?: (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topic?: string, opponentElo?: number) => void;
  currentLanguage?: Language;
  userElo?: number;
  userWins?: number;
  userLosses?: number;
  username?: string;
}

export default function MatchFinder({ 
  onMatchFound,
  currentLanguage = "Chinese",
  userElo = 1000,
  userWins = 0,
  userLosses = 0,
  username = "Player"
}: MatchFinderProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Medium");
  const [selectedTopic, setSelectedTopic] = useState<string>("random");

  // Generate a persistent session ID that survives remounts (SSR-safe)
  const getSessionId = () => {
    if (typeof window === 'undefined') {
      // Fallback for SSR/test environments
      return `temp-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    let sessionId = localStorage.getItem('matchmaking_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('matchmaking_session_id', sessionId);
    }
    return sessionId;
  };

  const playerId = getSessionId();

  // WebSocket matchmaking hook
  const handleWebSocketMatch = useCallback((matchData: any) => {
    // Call onMatchFound with server-provided match details
    onMatchFound?.(
      matchData.opponent.username,
      matchData.isAI,
      matchData.language as Language, // Use server-provided language
      matchData.difficulty as Difficulty, // Use server-provided difficulty
      matchData.topic, // Topic from matchmaking
      matchData.opponent.elo // Opponent's Elo rating
    );
  }, [onMatchFound]);

  const { isConnected, isSearching, findMatch, cancelSearch } = useMatchmaking({
    playerId,
    username,
    elo: userElo,
    onMatchFound: handleWebSocketMatch,
  });

  const handleFindMatch = () => {
    if (isSearching) {
      cancelSearch();
    } else {
      // Competitive mode - no topic selection (random topic)
      findMatch(currentLanguage, selectedDifficulty);
    }
  };

  const handlePractice = () => {
    const randomBotName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const topic = selectedTopic === "random" ? undefined : selectedTopic;
    onMatchFound?.(randomBotName, true, currentLanguage, selectedDifficulty, topic);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl px-4">
        <Card className="border-card-border">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center">
                <Swords className="w-10 h-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Ready for a Language Duel?</CardTitle>
            <CardDescription className="text-base mt-2">
              Challenge opponents at your skill level and improve your fluency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty)}>
                <SelectTrigger className="flex-1" data-testid="select-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy" data-testid="option-easy">Easy - Simple vocabulary</SelectItem>
                  <SelectItem value="Medium" data-testid="option-medium">Medium - Conversational</SelectItem>
                  <SelectItem value="Hard" data-testid="option-hard">Hard - Advanced & Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-t border-card-border pt-4 mt-4">
              <div className="text-sm text-muted-foreground mb-3">
                Competitive matches use random topics for fair ranking
                {!isConnected && <span className="text-destructive ml-2">(Connecting to server...)</span>}
              </div>
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold"
                onClick={handleFindMatch}
                disabled={!isConnected}
                data-testid="button-find-match"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Finding opponent... (Click to cancel)
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5 mr-2" />
                    Find Match (Random Topic)
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-card-border pt-4 mt-4">
              <div className="text-sm text-muted-foreground mb-3">
                Practice mode - Choose your topic
              </div>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="flex-1" data-testid="select-topic">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random Topic</SelectItem>
                    {THEMES.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-lg"
                onClick={handlePractice}
                data-testid="button-practice"
              >
                <Bot className="w-5 h-5 mr-2" />
                Practice with AI Bot
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div>
                <div className="text-2xl font-bold font-mono" data-testid="text-user-elo">{userElo}</div>
                <div className="text-sm text-muted-foreground">Your Elo</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono" data-testid="text-user-wins">{userWins}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono" data-testid="text-user-losses">{userLosses}</div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
