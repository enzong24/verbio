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
import type { GradingResult, UserLanguageStats } from "@shared/schema";
import { THEMES, getThemeVocabulary, getThemeTitle } from "@shared/themes";

type Page = "duel" | "leaderboard" | "profile" | "match" | "results";

interface VocabWord {
  word: string;
  romanization: string;
}

function MainApp() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("duel");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [matchData, setMatchData] = useState<{
    opponent: string;
    isBot: boolean;
    topic: string;
    vocabulary: VocabWord[];
    language: Language;
    difficulty: Difficulty;
  } | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

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
    queryKey: [`/api/user/stats/${currentLanguage}`, currentLanguage],
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

  const handleMatchFound = (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty) => {
    // Select a random theme
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    
    // Get vocabulary for the selected difficulty and language
    const vocabStrings = getThemeVocabulary(randomTheme.id, difficulty, language);
    const themeVocab = randomTheme.vocabulary[difficulty];
    
    // Convert to VocabWord format with definitions
    const vocabulary: VocabWord[] = vocabStrings.map((word, i) => {
      const matchingWord = themeVocab[i];
      let definition = "";
      let romanization = language === "Chinese" ? "" : word;
      
      // Get romanization for Chinese
      if (language === "Chinese" && matchingWord?.pinyin) {
        romanization = matchingWord.pinyin;
      }
      
      // Get definition (translation to help understand the word)
      if (matchingWord) {
        if (language === "Chinese") {
          definition = matchingWord.spanish || matchingWord.italian || "";
        } else if (language === "Spanish") {
          definition = matchingWord.italian || matchingWord.chinese || "";
        } else if (language === "Italian") {
          definition = matchingWord.spanish || matchingWord.chinese || "";
        }
      }
      
      return {
        word,
        romanization,
        definition
      };
    });
    
    setMatchData({
      opponent,
      isBot,
      topic: getThemeTitle(randomTheme.id),
      vocabulary,
      language,
      difficulty,
    });
    setCurrentPage("match");
  };

  const handleDuelComplete = (result: GradingResult) => {
    setGradingResult(result);
    setCurrentPage("results");
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
        // Refetch stats and invalidate caches
        await refetchStats();
        queryClient.invalidateQueries({ queryKey: [`/api/user/matches?language=${currentLanguage}`, currentLanguage] });
        queryClient.invalidateQueries({ queryKey: [`/api/user/skill-progress?language=${currentLanguage}`, currentLanguage] });
        queryClient.invalidateQueries({ queryKey: [`/api/leaderboard?language=${currentLanguage}`, currentLanguage] });
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
    // Update Elo based on result and difficulty
    if (gradingResult && matchData) {
      const isWin = gradingResult.overall >= 70;
      
      // Calculate Elo change based on difficulty
      const eloChanges = {
        Easy: 8,
        Medium: 12,
        Hard: 16,
      };
      const change = isWin 
        ? eloChanges[matchData.difficulty] 
        : -eloChanges[matchData.difficulty];
      
      // Only update stats if not a bot match (practice mode)
      if (!matchData.isBot) {
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
        
        await updateStats(change, isWin, !isWin);
      }
    }
    setMatchData(null);
    setGradingResult(null);
    setCurrentPage("duel");
  };

  const handleForfeit = async () => {
    // Only apply forfeit penalty if not a bot match
    if (matchData && !matchData.isBot) {
      await updateStats(-25, false, true);
    }
    setMatchData(null);
    setCurrentPage("duel");
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
      />
      
      <main className="pt-16">
        {currentPage === "duel" && (
          <MatchFinder 
            onMatchFound={handleMatchFound}
            onLanguageChange={setCurrentLanguage}
            currentLanguage={currentLanguage}
            userElo={userElo}
            userWins={userWins}
            userLosses={userLosses}
          />
        )}
        
        {currentPage === "match" && matchData && (
          <DuelInterface
            topic={matchData.topic}
            vocabulary={matchData.vocabulary}
            opponentName={matchData.opponent}
            opponentElo={matchData.isBot ? 1200 : 1520}
            userElo={userElo}
            isBot={matchData.isBot}
            language={matchData.language}
            difficulty={matchData.difficulty}
            onComplete={handleDuelComplete}
            onForfeit={handleForfeit}
          />
        )}
        
        {currentPage === "results" && gradingResult && matchData && (
          <MatchResults
            gradingResult={gradingResult}
            eloChange={
              matchData.isBot ? 0 : (
                (gradingResult.overall >= 70 ? 1 : -1) * 
                ({ Easy: 8, Medium: 12, Hard: 16 }[matchData.difficulty])
              )
            }
            newElo={userElo}
            isBot={matchData.isBot}
            onContinue={handleResultsContinue}
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
