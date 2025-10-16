import { useState, useEffect, useRef } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useSound } from "@/hooks/use-sound";
import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import Subscribe from "@/pages/Subscribe";
import AdminWhitelist from "@/pages/AdminWhitelist";
import MatchFinder, { type Language, type Difficulty } from "@/components/MatchFinder";
import DuelInterface from "@/components/DuelInterface";
import MatchResults from "@/components/MatchResults";
import Leaderboard from "@/components/Leaderboard";
import ProfileStats from "@/components/ProfileStats";
import AIReview from "@/components/AIReview";
import Friends from "@/components/Friends";
import Analytics from "@/components/Analytics";
import { StreakNotification } from "@/components/StreakNotification";
import LevelUpDialog from "@/components/LevelUpDialog";
import InstallPrompt from "@/components/InstallPrompt";
import type { GradingResult, UserLanguageStats } from "@shared/schema";
import { THEMES, getThemeVocabulary, getThemeTitle } from "@shared/themes";
import { incrementGuestMatches } from "@/utils/guestRateLimit";
import { FLUENCY_LEVELS, type FluencyLevel } from "@shared/fluencyLevels";

type Page = "duel" | "leaderboard" | "profile" | "match" | "results" | "ai-review" | "friends" | "analytics";

interface VocabWord {
  word: string;
  romanization: string;
  definition?: string;
}

function MainApp() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { playStreak, playDailyStreak } = useSound();
  const [currentPage, setCurrentPage] = useState<Page>("duel");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [matchData, setMatchData] = useState<{
    opponent: string;
    opponentElo: number;
    isBot: boolean;
    isPracticeMode: boolean;
    topic: string;
    vocabulary: VocabWord[];
    language: Language;
    difficulty: Difficulty;
    startsFirst?: boolean;
    matchId?: string;
    playerId?: string;
    botId?: string;
  } | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [matchMessages, setMatchMessages] = useState<any[]>([]);
  const multiplayerWsRef = useRef<WebSocket | null>(null);
  const [waitingForOpponentResult, setWaitingForOpponentResult] = useState(false);
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  
  // Level-up state
  const [levelUpInfo, setLevelUpInfo] = useState<{
    oldLevel: import("@shared/fluencyLevels").FluencyLevelInfo;
    newLevel: import("@shared/fluencyLevels").FluencyLevelInfo;
    language: string;
  } | null>(null);
  
  // Streak notification state
  const [streakNotification, setStreakNotification] = useState<{
    type: "win" | "daily";
    count: number;
    visible: boolean;
  } | null>(null);
  const previousStreaksRef = useRef<{ winStreak: number; dailyLoginStreak: number } | null>(null);
  const streakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedStreaksRef = useRef(false);

  // Track current language (persisted to localStorage)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('currentLanguage');
    return (saved as Language) || "Chinese";
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('currentLanguage', currentLanguage);
  }, [currentLanguage]);

  // Fetch language-specific stats for authenticated users
  const { data: languageStats, refetch: refetchStats } = useQuery<UserLanguageStats>({
    queryKey: [`/api/user/stats/${currentLanguage}`],
    enabled: isAuthenticated,
  });

  // Reset streak refs when language or user changes to prevent false notifications
  useEffect(() => {
    previousStreaksRef.current = null;
    hasInitializedStreaksRef.current = false;
  }, [currentLanguage, user?.id]);

  // Detect streak increases and show notifications
  useEffect(() => {
    if (!languageStats || !isAuthenticated) return;

    const currentWinStreak = languageStats.winStreak ?? 0;
    const currentDailyStreak = languageStats.dailyLoginStreak ?? 0;

    // Initialize previous values on first load
    if (previousStreaksRef.current === null) {
      previousStreaksRef.current = {
        winStreak: currentWinStreak,
        dailyLoginStreak: currentDailyStreak
      };
      hasInitializedStreaksRef.current = true;
      return;
    }

    // Don't show notifications on the very first initialization (login/page load)
    // Only show when streaks actually change after initialization
    if (!hasInitializedStreaksRef.current) {
      hasInitializedStreaksRef.current = true;
      previousStreaksRef.current = {
        winStreak: currentWinStreak,
        dailyLoginStreak: currentDailyStreak
      };
      return;
    }

    const previousWinStreak = previousStreaksRef.current.winStreak;
    const previousDailyStreak = previousStreaksRef.current.dailyLoginStreak;

    // Clear any existing timeout
    if (streakTimeoutRef.current) {
      clearTimeout(streakTimeoutRef.current);
      streakTimeoutRef.current = null;
    }

    // Check if win streak increased
    if (currentWinStreak > previousWinStreak && currentWinStreak > 1) {
      setStreakNotification({
        type: "win",
        count: currentWinStreak,
        visible: true
      });
      // Auto-hide after 4 seconds
      streakTimeoutRef.current = setTimeout(() => {
        setStreakNotification(null);
        streakTimeoutRef.current = null;
      }, 4000);
    }
    // Check if daily streak increased (only if win streak didn't trigger)
    else if (currentDailyStreak > previousDailyStreak && currentDailyStreak > 1) {
      setStreakNotification({
        type: "daily",
        count: currentDailyStreak,
        visible: true
      });
      // Auto-hide after 4 seconds
      streakTimeoutRef.current = setTimeout(() => {
        setStreakNotification(null);
        streakTimeoutRef.current = null;
      }, 4000);
    }

    // Update previous values
    previousStreaksRef.current = {
      winStreak: currentWinStreak,
      dailyLoginStreak: currentDailyStreak
    };
  }, [languageStats, isAuthenticated, playStreak]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (streakTimeoutRef.current) {
        clearTimeout(streakTimeoutRef.current);
      }
    };
  }, []);

  // Get stats from languageStats for authenticated, or localStorage for guest
  const getGuestStats = (language: Language) => {
    const saved = localStorage.getItem(`guest_${language}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return { elo: 1000, wins: 0, losses: 0 };
  };

  const [guestStats, setGuestStats] = useState(() => getGuestStats(currentLanguage));

  useEffect(() => {
    setGuestStats(getGuestStats(currentLanguage));
  }, [currentLanguage]);

  const userElo = isAuthenticated ? (languageStats?.elo ?? 1000) : guestStats.elo;
  const userWins = isAuthenticated ? (languageStats?.wins ?? 0) : guestStats.wins;
  const userLosses = isAuthenticated ? (languageStats?.losses ?? 0) : guestStats.losses;
  const username = user?.firstName || user?.email?.split('@')[0] || "Guest";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storedGuestMode = localStorage.getItem('guestMode') === 'true';
    
    if (urlParams.get('guest') === 'true') {
      setIsGuestMode(true);
      localStorage.setItem('guestMode', 'true');
      window.history.replaceState({}, '', '/');
    } else if (storedGuestMode) {
      setIsGuestMode(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem('guestMode');
      setIsGuestMode(false);
    }
  }, [isAuthenticated]);


  // Set up WebSocket for multiplayer matches
  useEffect(() => {
    if (matchData && !matchData.isBot && matchData.matchId && matchData.playerId) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/matchmaking`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('App.tsx: WebSocket connected for multiplayer match');
        // Register this WebSocket with the server for this match
        ws.send(JSON.stringify({
          type: 'register_match_socket',
          playerId: matchData.playerId,
          matchId: matchData.matchId
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'opponent_grading_result') {
            console.log('App.tsx: Received opponent grading result', data.gradingResult);
            // Store it in sessionStorage for retrieval
            sessionStorage.setItem(`opponent_result_${matchData.matchId}`, JSON.stringify(data.gradingResult));
            
            // If we're already waiting for opponent result, update immediately
            if (waitingForOpponentResult && gradingResult) {
              setGradingResult(prev => prev ? {
                ...prev,
                botGrammar: data.gradingResult.grammar,
                botFluency: data.gradingResult.fluency,
                botVocabulary: data.gradingResult.vocabulary,
                botNaturalness: data.gradingResult.naturalness,
                botOverall: data.gradingResult.overall,
              } : prev);
              setWaitingForOpponentResult(false);
              
              // Close the WebSocket
              if (multiplayerWsRef.current?.readyState === WebSocket.OPEN) {
                multiplayerWsRef.current.close();
                multiplayerWsRef.current = null;
              }
            }
          }
        } catch (error) {
          console.error('App.tsx: WebSocket message error:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('App.tsx: WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('App.tsx: WebSocket closed');
      };
      
      multiplayerWsRef.current = ws;
      
      return () => {
        // Don't close the WebSocket here - we need it to stay alive
        // It will be closed when opponent result is received or timeout occurs
      };
    }
  }, [matchData?.matchId, matchData?.playerId]);

  // Handle timeout for waiting for opponent result
  useEffect(() => {
    if (waitingForOpponentResult) {
      const timeout = setTimeout(() => {
        console.log('App.tsx: Timeout waiting for opponent result');
        setWaitingForOpponentResult(false);
        // Close WebSocket on timeout
        if (multiplayerWsRef.current?.readyState === WebSocket.OPEN) {
          multiplayerWsRef.current.close();
          multiplayerWsRef.current = null;
        }
      }, 30000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [waitingForOpponentResult]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>;
  }

  // Show main app if authenticated OR guest mode
  const shouldShowMainApp = isAuthenticated || isGuestMode;
  
  console.log('[App] Auth state:', {
    isAuthenticated,
    isGuestMode,
    shouldShowMainApp
  });
  
  if (!shouldShowMainApp) {
    return <Landing />;
  }

  // Helper to get/generate playerId
  const getSessionId = () => {
    let sessionId = localStorage.getItem('matchmaking_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('matchmaking_session_id', sessionId);
    }
    return sessionId;
  };

  // Use authenticated userId if available, otherwise use session ID for guests
  const playerId = user?.id || getSessionId();

  const handleMatchFound = async (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topicId?: string, opponentElo?: number, isPracticeMode: boolean = false, startsFirst?: boolean, matchId?: string, vocabularyFromServer?: any[], botId?: string) => {
    // Use selected topic or random if not specified
    const theme = topicId ? THEMES.find(t => t.id === topicId) || THEMES[Math.floor(Math.random() * THEMES.length)] : THEMES[Math.floor(Math.random() * THEMES.length)];
    
    let vocabulary: VocabWord[];
    
    // If vocabulary was provided by server (for multiplayer matches), use it directly
    if (vocabularyFromServer && vocabularyFromServer.length > 0) {
      vocabulary = vocabularyFromServer;
      
      // Increment guest match counter
      if (isGuestMode) {
        incrementGuestMatches();
      }
      
      setMatchData({
        opponent,
        opponentElo: opponentElo || (isBot ? 1000 : 1200),
        isBot,
        isPracticeMode,
        topic: getThemeTitle(theme.id),
        vocabulary,
        language,
        difficulty,
        startsFirst,
        matchId,
        playerId: playerId,
        botId,
      });
      setCurrentPage("match");
      return;
    }
    
    // Otherwise generate vocabulary (for bot matches or practice mode)
    try {
      // Generate vocabulary using AI
      const response = await apiRequest("POST", "/api/generate-vocabulary", {
        topic: getThemeTitle(theme.id),
        language,
        difficulty
      });
      
      const data = await response.json();
      
      // Convert AI vocabulary to VocabWord format
      vocabulary = data.vocabulary.map((item: any) => ({
        word: item.word,
        romanization: item.pinyin || item.word,
        definition: `${item.english} (${item.type})`
      }));
      
      // Increment guest match counter now that match is confirmed
      if (isGuestMode) {
        incrementGuestMatches();
      }
      
      setMatchData({
        opponent,
        opponentElo: opponentElo || (isBot ? 1000 : 1200),
        isBot,
        isPracticeMode,
        topic: getThemeTitle(theme.id),
        vocabulary,
        language,
        difficulty,
        startsFirst,
        matchId,
        playerId: playerId,
        botId,
      });
      setCurrentPage("match");
    } catch (error) {
      console.error("Failed to generate vocabulary:", error);
      // Fallback to static vocabulary if API fails
      const vocabStrings = getThemeVocabulary(theme.id, difficulty, language);
      // For Beginner, use Easy vocabulary from theme
      const effectiveDifficulty = difficulty === "Beginner" ? "Easy" : difficulty;
      const themeVocab = theme.vocabulary[effectiveDifficulty];
      
      const vocabulary: VocabWord[] = vocabStrings.map((word, i) => {
        const matchingWord = themeVocab[i];
        let definition = "";
        let romanization = language === "Chinese" ? "" : word;
        
        if (language === "Chinese" && matchingWord?.pinyin) {
          romanization = matchingWord.pinyin;
        }
        
        if (matchingWord) {
          definition = matchingWord.english || "";
        }
        
        return {
          word,
          romanization,
          definition
        };
      });
      
      // Increment guest match counter now that match is confirmed (even with fallback vocab)
      if (isGuestMode) {
        incrementGuestMatches();
      }
      
      setMatchData({
        opponent,
        opponentElo: opponentElo || (isBot ? 1000 : 1200),
        isBot,
        isPracticeMode,
        topic: getThemeTitle(theme.id),
        vocabulary,
        language,
        difficulty,
        startsFirst,
        matchId,
        playerId: playerId,
        botId,
      });
      setCurrentPage("match");
    }
  };

  const handleDuelComplete = (result: GradingResult, messages?: any[]) => {
    // For human vs human matches, try to get opponent's grading result
    if (matchData && !matchData.isBot && matchData.matchId) {
      const opponentResultStr = sessionStorage.getItem(`opponent_result_${matchData.matchId}`);
      if (opponentResultStr) {
        try {
          const opponentResult = JSON.parse(opponentResultStr);
          // Populate opponent scores for comparison
          result.botGrammar = opponentResult.grammar;
          result.botFluency = opponentResult.fluency;
          result.botVocabulary = opponentResult.vocabulary;
          result.botNaturalness = opponentResult.naturalness;
          result.botOverall = opponentResult.overall;
          result.botElo = matchData.opponentElo;
          
          // Clean up
          sessionStorage.removeItem(`opponent_result_${matchData.matchId}`);
          
          // Close the WebSocket now that we have the opponent result
          if (multiplayerWsRef.current?.readyState === WebSocket.OPEN) {
            multiplayerWsRef.current.close();
            multiplayerWsRef.current = null;
          }
        } catch (error) {
          console.error('Failed to parse opponent result:', error);
          result.botElo = matchData.opponentElo;
        }
      } else {
        // Opponent result not yet received, wait for it
        result.botElo = matchData.opponentElo;
        setWaitingForOpponentResult(true);
      }
    }
    
    setGradingResult(result);
    if (messages) {
      setMatchMessages(messages);
    }
    setCurrentPage("results");
  };

  const handleAIReview = () => {
    setCurrentPage("ai-review");
  };

  const updateStats = async (eloChange: number, isWin: boolean, isLoss: boolean, isForfeit: boolean = false) => {
    const newElo = userElo + eloChange;
    // Forfeits count as losses but not as wins
    const newWins = userWins + (isWin && !isForfeit ? 1 : 0);
    const newLosses = userLosses + (isLoss ? 1 : 0);

    if (isAuthenticated) {
      // Update database for authenticated users
      try {
        await apiRequest("POST", "/api/user/stats", {
          language: currentLanguage,
          elo: newElo,
          wins: newWins,
          losses: newLosses
        });
        // Invalidate and refetch stats to ensure fresh data
        queryClient.invalidateQueries({ queryKey: [`/api/user/stats/${currentLanguage}`] });
        await refetchStats();
        queryClient.invalidateQueries({ queryKey: [`/api/user/matches?language=${currentLanguage}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/user/skill-progress?language=${currentLanguage}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/leaderboard?language=${currentLanguage}`] });
      } catch (error) {
        console.error("Failed to update stats:", error);
      }
    } else {
      // Update localStorage for guests
      const newGuestStats = { elo: newElo, wins: newWins, losses: newLosses };
      setGuestStats(newGuestStats);
      localStorage.setItem(`guest_${currentLanguage}`, JSON.stringify(newGuestStats));
    }
  };

  const handleResultsContinue = async () => {
    // Prevent duplicate saves
    if (isSavingMatch) return;
    setIsSavingMatch(true);
    
    try {
      // Update Elo based on comparative scoring (user vs bot)
      if (gradingResult && matchData) {
        const userScore = gradingResult.overall;
        const botScore = gradingResult.botOverall || 0;
        const botElo = gradingResult.botElo || 1000;
        const isForfeit = gradingResult.isForfeit || false;
        
        // Determine result based on comparative scoring
        const hasOpponentScores = botScore > 0;
        const isWin = userScore > botScore;
        const isDraw = userScore === botScore;
        const isLoss = userScore < botScore;
        
        // Calculate Elo change using standard Elo formula (only applies to competitive)
        const K_FACTOR = 32;
        const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));
        const actualScore = isWin ? 1 : (isDraw ? 0.5 : 0);
        const change = Math.round(K_FACTOR * (actualScore - expectedScore));
        
        // Save match history for authenticated users (both practice and competitive)
        if (isAuthenticated) {
          try {
            const response = await apiRequest("POST", "/api/match/save", {
              opponent: matchData.opponent,
              result: isWin ? "win" : "loss",
              eloChange: matchData.isPracticeMode ? 0 : change, // No Elo change for practice
              language: matchData.language,
              difficulty: matchData.difficulty,
              scores: {
                grammar: gradingResult.grammar,
                fluency: gradingResult.fluency,
                vocabulary: gradingResult.vocabulary,
                naturalness: gradingResult.naturalness,
                overall: gradingResult.overall,
              },
              isForfeit: isForfeit,
              isPracticeMode: matchData.isPracticeMode || false, // Track if this was a practice match
              conversation: matchMessages || [], // Full chat log
              detailedFeedback: {
                messageAnalysis: gradingResult.messageAnalysis || [], // Detailed AI feedback with corrections (premium)
                generalFeedback: gradingResult.feedback || [], // General feedback points (free users)
              },
              topic: matchData.topic || null, // Match topic
            });
            
            // Check for level-up
            const data = await response.json() as any;
            if (data.levelUpInfo) {
              // Convert level strings to FluencyLevelInfo objects
              const oldLevelInfo = FLUENCY_LEVELS[data.levelUpInfo.oldLevel as FluencyLevel];
              const newLevelInfo = FLUENCY_LEVELS[data.levelUpInfo.newLevel as FluencyLevel];
              if (oldLevelInfo && newLevelInfo) {
                setLevelUpInfo({
                  oldLevel: oldLevelInfo,
                  newLevel: newLevelInfo,
                  language: data.levelUpInfo.language
                });
              }
            }
            
            // Invalidate match history and skill progress queries
            queryClient.invalidateQueries({ queryKey: [`/api/user/matches?language=${matchData.language}`] });
            queryClient.invalidateQueries({ queryKey: [`/api/user/skill-progress?language=${matchData.language}`] });
          } catch (error) {
            console.error("Failed to save match:", error);
          }
        }
        
        // Only update Elo stats if not in practice mode
        if (!matchData.isPracticeMode) {
          await updateStats(change, isWin, isLoss, isForfeit);
        }
      }
      
      setMatchData(null);
      setGradingResult(null);
      setCurrentPage("duel");
    } finally {
      // Always reset saving state, even on error
      setIsSavingMatch(false);
    }
  };

  const handleForfeit = async () => {
    if (!matchData) return;
    
    // Capture isPracticeMode before any state changes
    const isPracticeMode = matchData.isPracticeMode;
    
    // Generate varied bot stats (70-95 range for realistic variation)
    const botGrammar = 70 + Math.floor(Math.random() * 26);
    const botFluency = 70 + Math.floor(Math.random() * 26);
    const botVocabulary = 70 + Math.floor(Math.random() * 26);
    const botNaturalness = 70 + Math.floor(Math.random() * 26);
    const botOverall = Math.round((botGrammar + botFluency + botVocabulary + botNaturalness) / 4);
    
    // Create a forfeit result - set user score lower than bot to count as loss
    // This ensures forfeit counts as a loss but won't affect skill progress
    const forfeitResult: GradingResult = {
      grammar: 0,
      fluency: 0,
      vocabulary: 0,
      naturalness: 0,
      overall: 0,
      botGrammar,
      botFluency,
      botVocabulary,
      botNaturalness,
      botOverall,
      botElo: matchData.opponentElo || 1000,
      feedback: isPracticeMode
        ? ["Practice session ended. Try again to improve your skills!"]
        : ["Match forfeited. Counts as a loss but won't affect skill progress."],
      isForfeit: true // Mark as forfeit so it doesn't show in skill progress
    };
    
    setGradingResult(forfeitResult);
    setCurrentPage("results");
    
    // Don't update stats here - let handleResultsContinue handle it
    // This prevents double Elo updates (once here, once on Continue)
  };


  return (
    <div className={`min-h-screen bg-background text-foreground ${currentPage === "match" ? "h-screen overflow-hidden" : ""}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Streak Notification */}
      {streakNotification && (
        <StreakNotification
          type={streakNotification.type}
          streakCount={streakNotification.count}
          isVisible={streakNotification.visible}
          onClose={() => setStreakNotification(null)}
          playSound={streakNotification.type === "win" ? playStreak : playDailyStreak}
        />
      )}
      
      {/* Level Up Dialog */}
      {levelUpInfo && (
        <LevelUpDialog
          open={!!levelUpInfo}
          onClose={() => setLevelUpInfo(null)}
          oldLevel={levelUpInfo.oldLevel}
          newLevel={levelUpInfo.newLevel}
        />
      )}
      
      <Header 
        username={username} 
        elo={userElo} 
        onNavigate={(page) => setCurrentPage(page as Page)}
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        profileImageUrl={user?.profileImageUrl}
        currentLanguage={currentLanguage}
        wins={userWins}
        losses={userLosses}
        onLanguageChange={(lang) => setCurrentLanguage(lang as Language)}
        winStreak={isAuthenticated ? (languageStats?.winStreak ?? 0) : 0}
        bestWinStreak={isAuthenticated ? (languageStats?.bestWinStreak ?? 0) : 0}
        dailyLoginStreak={isAuthenticated ? (languageStats?.dailyLoginStreak ?? 0) : 0}
        bestDailyLoginStreak={0}
        isPremium={user?.isPremium === 1}
        hideProfile={currentPage === "match"}
      />
      
      <main className="pt-16">
        {currentPage === "duel" && (
          <MatchFinder 
            onMatchFound={handleMatchFound}
            currentLanguage={currentLanguage}
            userElo={userElo}
            userWins={userWins}
            userLosses={userLosses}
            username={username}
            isGuest={isGuestMode}
            isPremium={user?.isPremium === 1}
            userId={user?.id}
          />
        )}
        
        {currentPage === "match" && matchData && (
          <DuelInterface
            topic={matchData.topic}
            vocabulary={matchData.vocabulary}
            opponentName={matchData.opponent}
            opponentElo={matchData.opponentElo}
            userElo={userElo}
            userName={username}
            isPremium={user?.isPremium === 1}
            isBot={matchData.isBot}
            isPracticeMode={matchData.isPracticeMode}
            language={matchData.language}
            difficulty={matchData.difficulty}
            onComplete={handleDuelComplete}
            onForfeit={handleForfeit}
            startsFirst={matchData.startsFirst}
            matchId={matchData.matchId}
            botId={matchData.botId}
            playerId={matchData.playerId}
            multiplayerWsRef={multiplayerWsRef}
          />
        )}
        
        {currentPage === "results" && gradingResult && matchData && (
          <MatchResults
            gradingResult={gradingResult}
            eloChange={matchData.isPracticeMode ? 0 : undefined}
            newElo={userElo}
            isBot={matchData.isBot}
            opponentName={matchData.opponent}
            isPracticeMode={matchData.isPracticeMode}
            onContinue={handleResultsContinue}
            onAIReview={handleAIReview}
            isSaving={isSavingMatch}
          />
        )}
        
        {currentPage === "leaderboard" && (
          <Leaderboard currentLanguage={currentLanguage} />
        )}
        
        {currentPage === "profile" && (
          <ProfileStats 
            username={username} 
            elo={userElo}
            wins={userWins}
            losses={userLosses}
            totalMatches={userWins + userLosses}
            currentLanguage={currentLanguage}
            isAuthenticated={isAuthenticated}
            winStreak={isAuthenticated ? (languageStats?.winStreak ?? 0) : 0}
            bestWinStreak={isAuthenticated ? (languageStats?.bestWinStreak ?? 0) : 0}
            dailyLoginStreak={isAuthenticated ? (languageStats?.dailyLoginStreak ?? 0) : 0}
          />
        )}
        
        {currentPage === "friends" && isAuthenticated && <Friends />}
        
        {currentPage === "analytics" && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Analytics currentLanguage={currentLanguage} isAuthenticated={isAuthenticated} />
          </div>
        )}
        
        {currentPage === "ai-review" && matchData && (
          <AIReview
            messages={matchMessages}
            gradingResult={gradingResult || undefined}
            topic={matchData.topic}
            language={matchData.language}
            onBack={() => setCurrentPage("results")}
          />
        )}
      </main>
      
      <InstallPrompt />
      <Toaster />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/admin/whitelist" component={AdminWhitelist} />
      <Route path="/" component={MainApp} />
      <Route path="/:rest*" component={MainApp} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
