import { useState, useCallback, useRef, useEffect } from "react";
import { Bot, Loader2, Target, BookOpen, AlertCircle, Swords, Trophy, Zap, X, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { THEMES } from "@shared/themes";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { canGuestPlayMatch, getRemainingGuestMatches, getGuestMatchLimit } from "@/utils/guestRateLimit";
import { useSound } from "@/hooks/use-sound";
import { apiRequest } from "@/lib/queryClient";
import BotSelection from "./BotSelection";

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
  onMatchFound?: (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topic?: string, opponentElo?: number, isPracticeMode?: boolean, startsFirst?: boolean, matchId?: string, vocabularyFromServer?: any[], botId?: string) => void;
  currentLanguage?: Language;
  userElo?: number;
  userWins?: number;
  userLosses?: number;
  username?: string;
  isGuest?: boolean;
  isPremium?: boolean;
  userId?: string; // Authenticated user ID (not session ID)
}

export default function MatchFinder({ 
  onMatchFound,
  currentLanguage = "Chinese",
  userElo = 1000,
  userWins = 0,
  userLosses = 0,
  username = "Player",
  isGuest = false,
  isPremium = false,
  userId
}: MatchFinderProps) {
  // Load difficulty from localStorage, default to "Medium"
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(() => {
    const saved = localStorage.getItem('selectedDifficulty');
    return (saved as Difficulty) || "Medium";
  });
  const [selectedTopic, setSelectedTopic] = useState<string>("random");
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const practiceLoadingRef = useRef(false);
  const { resumeAudio } = useSound();
  const [showBotSelection, setShowBotSelection] = useState(false);
  const [selectedBot, setSelectedBot] = useState<{ id: string; name: string } | null>(null);

  // Save difficulty to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedDifficulty', selectedDifficulty);
  }, [selectedDifficulty]);
  
  // Premium access tracking
  const [difficultyAccess, setDifficultyAccess] = useState<{
    allowed: boolean;
    isPremium: boolean;
    remaining?: number;
    limit?: number;
    message?: string;
  }>({ allowed: true, isPremium: false });
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  
  const canPlay = !isGuest || canGuestPlayMatch();
  const remainingMatches = isGuest ? getRemainingGuestMatches() : null;

  // Check if user can play selected difficulty (medium/hard have limits for free users)
  useEffect(() => {
    const checkDifficultyAccess = async () => {
      if (selectedDifficulty === "Beginner" || selectedDifficulty === "Easy") {
        setDifficultyAccess({ allowed: true, isPremium: false });
        return;
      }

      // Guest users can't play medium/hard
      if (isGuest) {
        setDifficultyAccess({ 
          allowed: false, 
          isPremium: false, 
          message: "Sign in required for Medium/Hard modes" 
        });
        return;
      }

      setIsCheckingAccess(true);
      try {
        const response = await apiRequest("POST", "/api/user/check-difficulty-access", {
          difficulty: selectedDifficulty
        });
        const data = await response.json();
        setDifficultyAccess(data);
      } catch (error) {
        console.error("Error checking difficulty access:", error);
        setDifficultyAccess({ allowed: true, isPremium: false });
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkDifficultyAccess();
  }, [selectedDifficulty, isGuest]);

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

  // Use authenticated userId if available, otherwise use session ID for guests
  const playerId = userId || getSessionId();

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
      
      // Check difficulty access before starting match
      if (!difficultyAccess.allowed) {
        return;
      }
      
      // Server-side tracking happens when joining queue
      findMatch(currentLanguage, selectedDifficulty);
    }
  };

  const handleChooseBot = () => {
    // Resume audio on user interaction
    resumeAudio();
    
    // Show bot selection dialog
    setShowBotSelection(true);
  };

  const handlePractice = async () => {
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
    
    try {
      let botId = selectedBot?.id;
      let botName = selectedBot?.name;
      
      // If no bot selected, pick a random one
      if (!botId) {
        const response = await fetch(`/api/bots?language=${currentLanguage}`);
        const bots = await response.json();
        
        if (bots.length > 0) {
          const randomBot = bots[Math.floor(Math.random() * bots.length)];
          botId = randomBot.id;
          botName = randomBot.name;
        } else {
          // Fallback to hardcoded bot name
          botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        }
      }
      
      const topic = selectedTopic === "random" ? undefined : selectedTopic;
      onMatchFound?.(botName!, true, currentLanguage, selectedDifficulty, topic, 1000, true, undefined, undefined, undefined, botId);
    } catch (err) {
      console.error('Error starting practice:', err);
      // Fallback
      const randomBotName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const topic = selectedTopic === "random" ? undefined : selectedTopic;
      onMatchFound?.(randomBotName, true, currentLanguage, selectedDifficulty, topic, 1000, true);
    } finally {
      setIsPracticeLoading(false);
      practiceLoadingRef.current = false;
    }
  };

  const handleBotSelected = async (botId: string) => {
    try {
      // Fetch bot details
      const response = await fetch(`/api/bots/${botId}`);
      const bot = await response.json();
      
      // Save selected bot
      setSelectedBot({ id: botId, name: bot.name });
      setShowBotSelection(false);
    } catch (err) {
      console.error('Error fetching bot:', err);
      setShowBotSelection(false);
    }
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

        {/* Premium Feature Alerts */}
        {!difficultyAccess.allowed && !difficultyAccess.isPremium && (selectedDifficulty === "Medium" || selectedDifficulty === "Hard") && (
          <Alert variant="destructive" className="max-w-4xl mx-auto mb-8" data-testid="alert-premium-required">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              {difficultyAccess.message || `You've reached the daily limit of ${difficultyAccess.limit || 3} ${selectedDifficulty} matches. Upgrade to Premium for unlimited access!`}
              <a href="/subscribe" className="ml-2 font-semibold underline hover:no-underline" data-testid="button-upgrade">
                Upgrade to Premium
              </a>
            </AlertDescription>
          </Alert>
        )}
        {difficultyAccess.allowed && !difficultyAccess.isPremium && difficultyAccess.remaining !== undefined && (selectedDifficulty === "Medium" || selectedDifficulty === "Hard") && (
          <Alert className="max-w-4xl mx-auto mb-8 border-accent/50 bg-accent/10" data-testid="alert-premium-remaining">
            <Crown className="h-4 w-4 text-accent" />
            <AlertDescription>
              Free tier: {difficultyAccess.remaining} {selectedDifficulty} {difficultyAccess.remaining === 1 ? 'match' : 'matches'} remaining today.
              <a href="/subscribe" className="ml-2 font-semibold underline text-accent hover:no-underline" data-testid="button-upgrade-accent">
                Upgrade to Premium
              </a>
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
                  <li>• Use vocabulary definitions freely - no penalties!</li>
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
                  variant="default"
                  onClick={handleFindMatch}
                  disabled={!isConnected || !canPlay || !difficultyAccess.allowed}
                  data-testid="button-find-match"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Finding match...
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
                  <p className="text-sm text-muted-foreground">Perfect native-level AI • {isPremium ? 'Choose your topic' : 'Random topics only'} • No scoring or competition</p>
                </div>
                
                {/* Bot Selection */}
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-md border bg-background text-sm">
                      {selectedBot ? (
                        <span className="font-medium" data-testid="text-selected-bot">{selectedBot.name}</span>
                      ) : (
                        <span className="text-muted-foreground" data-testid="text-random-bot">Random Bot</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChooseBot}
                      disabled={isPracticeLoading || isSearching}
                      data-testid="button-choose-bot"
                    >
                      Choose Bot
                    </Button>
                  </div>
                </div>

                {/* Topic Selection */}
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 relative">
                    <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={isSearching || isPracticeLoading || !isPremium}>
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
                    {!isPremium && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                {!isPremium && (
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-accent" />
                    <span>Topic selection is a Premium feature</span>
                  </p>
                )}
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
                      Start Practice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bot Selection Dialog */}
      <BotSelection
        open={showBotSelection}
        onClose={() => setShowBotSelection(false)}
        language={currentLanguage}
        onSelectBot={handleBotSelected}
      />
    </div>
  );
}
