import { useState, useCallback } from "react";
import { Bot, Loader2, Target, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { THEMES } from "@shared/themes";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { canGuestPlayMatch, incrementGuestMatches, getRemainingGuestMatches, getGuestMatchLimit } from "@/utils/guestRateLimit";

export type Language = "Chinese" | "Spanish" | "Italian";
export type Difficulty = "Easy" | "Medium" | "Hard";

const BOT_NAMES = [
  "Emma Chen",
  "Lucas Rodriguez",
  "Sofia Rossi",
  "James Wang",
  "Maria Garcia",
  "Alex Zhang",
  "Isabella Martinez",
  "Noah Li",
  "Olivia Romano",
  "Ethan Liu",
  "Mia Fernandez",
  "Liam Zhang",
  "Ava Moretti",
  "Oliver Wang",
  "Charlotte Hu",
];

interface MatchFinderProps {
  onMatchFound?: (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topic?: string, opponentElo?: number, isPracticeMode?: boolean) => void;
  currentLanguage?: Language;
  userElo?: number;
  userWins?: number;
  userLosses?: number;
  username?: string;
  isGuest?: boolean;
}

export default function MatchFinder({ 
  onMatchFound,
  currentLanguage = "Chinese",
  userElo = 1000,
  userWins = 0,
  userLosses = 0,
  username = "Player",
  isGuest = false
}: MatchFinderProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Medium");
  const [selectedTopic, setSelectedTopic] = useState<string>("random");
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  
  const canPlay = !isGuest || canGuestPlayMatch();
  const remainingMatches = isGuest ? getRemainingGuestMatches() : null;

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
      matchData.opponent.elo, // Opponent's Elo rating
      false // Find Match is always competitive (isPracticeMode = false)
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
      // Check rate limit for guests
      if (isGuest && !canGuestPlayMatch()) {
        return;
      }
      
      // Don't increment here - will increment in App.tsx when match is confirmed
      findMatch(currentLanguage, selectedDifficulty);
    }
  };

  const handlePractice = () => {
    if (isPracticeLoading) return; // Prevent duplicate clicks
    
    // Check rate limit for guests
    if (isGuest && !canGuestPlayMatch()) {
      return;
    }
    
    setIsPracticeLoading(true);
    
    // Don't increment here - will increment in App.tsx when match is confirmed
    const randomBotName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const topic = selectedTopic === "random" ? undefined : selectedTopic;
    onMatchFound?.(randomBotName, true, currentLanguage, selectedDifficulty, topic, 1000, true); // Practice mode with bot Elo 1000
    
    // Component will unmount when match starts, no need to reset loading state
    // If it doesn't unmount (error case), button stays disabled which is correct
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl px-4">
        <Card className="border-card-border">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold">Ready for a Language Duel?</CardTitle>
            <CardDescription className="text-base mt-2">
              Challenge opponents at your skill level and improve your fluency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            {isGuest && !canPlay && (
              <Alert variant="destructive" className="mb-4" data-testid="alert-rate-limit">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached the daily limit of {getGuestMatchLimit()} matches for guest accounts.
                  <a href="/api/login" className="underline ml-2 font-semibold">Sign in</a> for unlimited matches!
                </AlertDescription>
              </Alert>
            )}
            {isGuest && canPlay && remainingMatches !== null && (
              <Alert className="mb-4" data-testid="alert-remaining-matches">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Guest account: {remainingMatches} {remainingMatches === 1 ? 'match' : 'matches'} remaining today.
                  <a href="/api/login" className="underline ml-2 font-semibold">Sign in</a> for unlimited access!
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty)} disabled={isSearching || isPracticeLoading}>
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
                disabled={!isConnected || !canPlay}
                data-testid="button-find-match"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Finding opponent... (Click to cancel)
                  </>
                ) : (
                  "Find Match (Random Topic)"
                )}
              </Button>
            </div>

            <div className="border-t border-card-border pt-4 mt-4">
              <div className="text-sm text-muted-foreground mb-3">
                Practice mode - Choose your topic
              </div>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={isSearching || isPracticeLoading}>
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
                disabled={isPracticeLoading || isSearching || !canPlay}
                data-testid="button-practice"
              >
                {isPracticeLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting practice...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    Practice with AI Bot
                  </>
                )}
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
