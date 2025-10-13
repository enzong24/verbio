import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Landing from "@/pages/Landing";
import MatchFinder, { type Language, type Difficulty } from "@/components/MatchFinder";
import DuelInterface from "@/components/DuelInterface";
import MatchResults from "@/components/MatchResults";
import Leaderboard from "@/components/Leaderboard";
import ProfileStats from "@/components/ProfileStats";
import AIReview from "@/components/AIReview";
import type { GradingResult, UserLanguageStats } from "@shared/schema";
import { THEMES, getThemeVocabulary, getThemeTitle } from "@shared/themes";

type Page = "duel" | "leaderboard" | "profile" | "match" | "results" | "ai-review";

interface VocabWord {
  word: string;
  romanization: string;
  definition?: string;
}

function MainApp() {
  const { user, isLoading, isAuthenticated } = useAuth();
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
  } | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [matchMessages, setMatchMessages] = useState<any[]>([]);

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

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>;
  }

  if (!isAuthenticated && !isGuestMode) {
    return <Landing />;
  }

  const handleMatchFound = async (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topicId?: string, opponentElo?: number, isPracticeMode: boolean = false) => {
    // Use selected topic or random if not specified
    const theme = topicId ? THEMES.find(t => t.id === topicId) || THEMES[Math.floor(Math.random() * THEMES.length)] : THEMES[Math.floor(Math.random() * THEMES.length)];
    
    try {
      // Generate vocabulary using AI
      const response = await apiRequest("POST", "/api/generate-vocabulary", {
        topic: getThemeTitle(theme.id),
        language,
        difficulty
      });
      
      const data = await response.json();
      
      // Convert AI vocabulary to VocabWord format
      const vocabulary: VocabWord[] = data.vocabulary.map((item: any) => ({
        word: item.word,
        romanization: item.pinyin || item.word,
        definition: `${item.english} (${item.type})`
      }));
      
      setMatchData({
        opponent,
        opponentElo: opponentElo || (isBot ? 1000 : 1200),
        isBot,
        isPracticeMode,
        topic: getThemeTitle(theme.id),
        vocabulary,
        language,
        difficulty,
      });
      setCurrentPage("match");
    } catch (error) {
      console.error("Failed to generate vocabulary:", error);
      // Fallback to static vocabulary if API fails
      const vocabStrings = getThemeVocabulary(theme.id, difficulty, language);
      const themeVocab = theme.vocabulary[difficulty];
      
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
      
      setMatchData({
        opponent,
        opponentElo: opponentElo || (isBot ? 1000 : 1200),
        isBot,
        isPracticeMode,
        topic: getThemeTitle(theme.id),
        vocabulary,
        language,
        difficulty,
      });
      setCurrentPage("match");
    }
  };

  const handleDuelComplete = (result: GradingResult, messages?: any[]) => {
    setGradingResult(result);
    if (messages) {
      setMatchMessages(messages);
    }
    setCurrentPage("results");
  };

  const handleAIReview = () => {
    setCurrentPage("ai-review");
  };

  const updateStats = async (eloChange: number, isWin: boolean, isLoss: boolean) => {
    const newElo = userElo + eloChange;
    const newWins = userWins + (isWin ? 1 : 0);
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
    // Update Elo based on comparative scoring (user vs bot)
    if (gradingResult && matchData) {
      const userScore = gradingResult.overall;
      const botScore = gradingResult.botOverall || 0;
      const botElo = gradingResult.botElo || 1000;
      
      // Determine result based on comparative scoring
      const isWin = userScore > botScore;
      const isDraw = userScore === botScore;
      
      // Calculate Elo change using standard Elo formula
      const K_FACTOR = 32;
      const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));
      const actualScore = isWin ? 1 : (isDraw ? 0.5 : 0);
      const change = Math.round(K_FACTOR * (actualScore - expectedScore));
      
      // Only update stats if not in practice mode
      if (!matchData.isPracticeMode) {
        // Save match history for authenticated users
        if (isAuthenticated) {
          try {
            await apiRequest("POST", "/api/match/save", {
              opponent: matchData.opponent,
              result: isWin ? "win" : "loss",
              eloChange: change,
              language: matchData.language,
              difficulty: matchData.difficulty,
              scores: {
                grammar: gradingResult.grammar,
                fluency: gradingResult.fluency,
                vocabulary: gradingResult.vocabulary,
                naturalness: gradingResult.naturalness,
                overall: gradingResult.overall,
              },
            });
            // Invalidate match history and skill progress queries
            queryClient.invalidateQueries({ queryKey: [`/api/user/matches?language=${matchData.language}`, matchData.language] });
            queryClient.invalidateQueries({ queryKey: [`/api/user/skill-progress?language=${matchData.language}`, matchData.language] });
          } catch (error) {
            console.error("Failed to save match:", error);
          }
        }
        
        await updateStats(change, isWin, !isWin && !isDraw);
      }
    }
    setMatchData(null);
    setGradingResult(null);
    setCurrentPage("duel");
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
    
    // Create a forfeit result (all scores 0)
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
        : ["Match forfeited. You have lost Elo points."]
    };
    
    setGradingResult(forfeitResult);
    setCurrentPage("results");
    
    // Don't update stats here - let handleResultsContinue handle it
    // This prevents double Elo updates (once here, once on Continue)
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
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
          />
        )}
        
        {currentPage === "match" && matchData && (
          <DuelInterface
            topic={matchData.topic}
            vocabulary={matchData.vocabulary}
            opponentName={matchData.opponent}
            opponentElo={matchData.opponentElo}
            userElo={userElo}
            isBot={matchData.isBot}
            isPracticeMode={matchData.isPracticeMode}
            language={matchData.language}
            difficulty={matchData.difficulty}
            onComplete={handleDuelComplete}
            onForfeit={handleForfeit}
          />
        )}
        
        {currentPage === "results" && gradingResult && matchData && (
          <MatchResults
            gradingResult={gradingResult}
            eloChange={matchData.isPracticeMode ? 0 : undefined}
            newElo={userElo}
            isBot={matchData.isBot}
            onContinue={handleResultsContinue}
            onAIReview={handleAIReview}
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
          />
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
      
      <Toaster />
    </div>
  );
}

function Router() {
  return (
    <Switch>
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
