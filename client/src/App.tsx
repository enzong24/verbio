import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
import type { GradingResult } from "@shared/schema";
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

  //todo: remove mock functionality - This is prototype data for guest mode
  const [userElo, setUserElo] = useState(1000);
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
    
    // Convert to VocabWord format (for non-Chinese languages, word and romanization are the same)
    const vocabulary: VocabWord[] = vocabStrings.map(word => ({
      word,
      romanization: language === "Chinese" ? "" : word // Will be populated from theme data if needed
    }));
    
    // For Chinese, get the actual pinyin from theme data
    if (language === "Chinese") {
      const themeVocab = randomTheme.vocabulary[difficulty];
      vocabulary.forEach((v, i) => {
        const matchingWord = themeVocab[i];
        if (matchingWord?.pinyin) {
          v.romanization = matchingWord.pinyin;
        }
      });
    }
    
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

  const handleResultsContinue = () => {
    // Update Elo based on result
    if (gradingResult) {
      const isWin = gradingResult.overall >= 70;
      const change = isWin ? 15 : -15;
      setUserElo(prev => prev + change);
    }
    setMatchData(null);
    setGradingResult(null);
    setCurrentPage("duel");
  };

  const handleForfeit = () => {
    // Forfeit penalty
    setUserElo(prev => prev - 25);
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
          <MatchFinder onMatchFound={handleMatchFound} />
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
        
        {currentPage === "results" && gradingResult && (
          <MatchResults
            gradingResult={gradingResult}
            eloChange={15}
            newElo={userElo}
            onContinue={handleResultsContinue}
          />
        )}
        
        {currentPage === "leaderboard" && (
          <Leaderboard />
        )}
        
        {currentPage === "profile" && (
          <ProfileStats username={username} elo={userElo} />
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
