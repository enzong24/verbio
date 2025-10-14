import { useState, useCallback, useRef, useEffect } from "react";
import { Bot, Loader2, Target, BookOpen, AlertCircle, Swords, Trophy, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { THEMES } from "@shared/themes";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { canGuestPlayMatch, getRemainingGuestMatches, getGuestMatchLimit } from "@/utils/guestRateLimit";
import { useSound } from "@/hooks/use-sound";

export type Language = "Chinese" | "Spanish" | "Italian";
export type Difficulty = "Beginner" | "Easy" | "Medium" | "Hard";

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
  onMatchFound?: (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topic?: string, opponentElo?: number, isPracticeMode?: boolean, startsFirst?: boolean, matchId?: string, vocabularyFromServer?: any[]) => void;
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
  const practiceLoadingRef = useRef(false);
  const { resumeAudio } = useSound();
  
  const canPlay = !isGuest || canGuestPlayMatch();
  const remainingMatches = isGuest ? getRemainingGuestMatches() : null;

  // Reset loading ref when component unmounts or practice completes
  useEffect(() => {
    if (!isPracticeLoading) {
      practiceLoadingRef.current = false;
    }
  }, [isPracticeLoading]);

  const getSessionId = () => {
    if (typeof window === 'undefined') {
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

  const handleWebSocketMatch = useCallback((matchData: any) => {
    // Convert server vocabulary to VocabWord format if provided
    let vocabulary: any[] | undefined = undefined;
    if (matchData.vocabulary && matchData.vocabulary.length > 0) {
      vocabulary = matchData.vocabulary.map((item: any) => ({
        word: item.word,
        romanization: item.pinyin || item.word,
        definition: `${item.english} (${item.type})`
      }));
    }
    
    onMatchFound?.(
      matchData.opponent.username,
      matchData.isAI,
      matchData.language as Language,
      matchData.difficulty as Difficulty,
      matchData.topic,
      matchData.opponent.elo,
      false,
      matchData.startsFirst,
      matchData.matchId,
      vocabulary
    );
  }, [onMatchFound]);

  const { isConnected, isSearching, findMatch, cancelSearch } = useMatchmaking({
    playerId,
    username,
    elo: userElo,
    onMatchFound: handleWebSocketMatch,
  });

  const handleFindMatch = () => {
    // Resume audio on user interaction
    resumeAudio();
    
    if (isSearching) {
      cancelSearch();
    } else {
      if (isGuest && !canGuestPlayMatch()) {
        return;
      }
      findMatch(currentLanguage, selectedDifficulty);
    }
  };

  const handlePractice = () => {
    // Resume audio on user interaction
    resumeAudio();
    
    // Immediate double-click prevention using ref
    if (practiceLoadingRef.current) return;
    practiceLoadingRef.current = true;
    
    if (isGuest && !canGuestPlayMatch()) {
      practiceLoadingRef.current = false;
      return;
    }
    
    setIsPracticeLoading(true);
    const randomBotName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const topic = selectedTopic === "random" ? undefined : selectedTopic;
    onMatchFound?.(randomBotName, true, currentLanguage, selectedDifficulty, topic, 1000, true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12 lg:py-16">
        {/* Guest Rate Limit Alerts */}
        {isGuest && !canPlay && (
          <Alert variant="destructive" className="max-w-4xl mx-auto mb-8" data-testid="alert-rate-limit">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached the daily limit of {getGuestMatchLimit()} matches for guest accounts.
              <a href="/api/login" className="underline ml-2 font-semibold">Sign in</a> for unlimited matches!
            </AlertDescription>
          </Alert>
        )}
        {isGuest && canPlay && remainingMatches !== null && (
          <Alert className="max-w-4xl mx-auto mb-8 border-primary/50 bg-primary/10" data-testid="alert-remaining-matches">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              Guest account: {remainingMatches} {remainingMatches === 1 ? 'match' : 'matches'} remaining today.
              <a href="/api/login" className="underline ml-2 font-semibold text-primary">Sign in</a> for unlimited access!
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fluency Score</p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-user-elo">{userElo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-success" data-testid="text-user-wins">{userWins}</p>
                    <p className="text-sm text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive" data-testid="text-user-losses">{userLosses}</p>
                    <p className="text-sm text-muted-foreground">Losses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hidden md:block">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Quick Tips</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Practice mode doesn't affect Fluency Score</li>
                  <li>• Use vocabulary hints freely - no penalties!</li>
                  <li>• Avoid skipping questions (-20 pts each)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Match Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Difficulty Selection */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Select Difficulty</h3>
                </div>
                <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty)} disabled={isSearching || isPracticeLoading}>
                  <SelectTrigger className="w-full" data-testid="select-difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner" data-testid="option-beginner">⭐ Beginner - First steps</SelectItem>
                    <SelectItem value="Easy" data-testid="option-easy">🟢 Easy - Simple vocabulary</SelectItem>
                    <SelectItem value="Medium" data-testid="option-medium">🟡 Medium - Conversational</SelectItem>
                    <SelectItem value="Hard" data-testid="option-hard">🔴 Hard - Advanced & Complex</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Competitive Mode */}
            <Card className="border-primary/30 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Competitive Match</h3>
                  <p className="text-sm text-muted-foreground">
                    Random topics • Fluency Score changes apply
                    {!isConnected && <span className="text-destructive ml-2">(Connecting...)</span>}
                  </p>
                </div>
                <Button
                  className="w-full text-lg font-semibold min-h-[56px] md:min-h-[48px]"
                  variant={isSearching ? "destructive" : "default"}
                  onClick={handleFindMatch}
                  disabled={!isConnected || !canPlay}
                  data-testid="button-find-match"
                >
                  {isSearching ? (
                    <>
                      <X className="w-5 h-5 mr-2" />
                      Cancel Search
                    </>
                  ) : (
                    <>
                      <Swords className="w-5 h-5 mr-2" />
                      Find Match
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Practice Mode */}
            <Card className="border-accent/50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Practice Mode</h3>
                  <p className="text-sm text-muted-foreground">Perfect native-level AI • Choose your topic • No scoring or competition</p>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={isSearching || isPracticeLoading}>
                    <SelectTrigger className="flex-1" data-testid="select-topic">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">🎲 Random Topic</SelectItem>
                      {THEMES.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full text-lg min-h-[56px] md:min-h-[48px]"
                  variant="default"
                  style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', borderColor: 'hsl(var(--accent))' }}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
