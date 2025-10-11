import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import MatchFinder from "@/components/MatchFinder";
import DuelInterface from "@/components/DuelInterface";
import MatchResults from "@/components/MatchResults";
import Leaderboard from "@/components/Leaderboard";
import ProfileStats from "@/components/ProfileStats";
import PracticeMode from "@/components/PracticeMode";
import type { GradingResult } from "@shared/schema";

type Page = "duel" | "practice" | "leaderboard" | "profile" | "match" | "results";

function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>("duel");
  const [matchData, setMatchData] = useState<{
    opponent: string;
    isBot: boolean;
    topic: string;
    vocabulary: string[];
  } | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  //todo: remove mock functionality - This is prototype data
  const [userElo, setUserElo] = useState(1547);
  const username = "Alex";

  const handleMatchFound = (opponent: string, isBot: boolean) => {
    // todo: remove mock functionality - Simulated match setup
    const topics = [
      { title: "Travel & Tourism", vocabulary: ["journey", "destination", "explore", "adventure", "culture"] },
      { title: "Food & Dining", vocabulary: ["delicious", "recipe", "restaurant", "taste", "flavor"] },
      { title: "Technology", vocabulary: ["device", "software", "innovation", "digital", "connect"] },
    ];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    setMatchData({
      opponent,
      isBot,
      topic: topic.title,
      vocabulary: topic.vocabulary,
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

  const handlePracticeTopic = (topicId: string) => {
    console.log('Starting practice with topic:', topicId);
    handleMatchFound("AI Bot", true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        username={username} 
        elo={userElo} 
        onNavigate={(page) => setCurrentPage(page as Page)}
        currentPage={currentPage}
      />
      
      <main className="pt-16">
        {currentPage === "duel" && (
          <MatchFinder onMatchFound={handleMatchFound} />
        )}
        
        {currentPage === "practice" && (
          <PracticeMode onSelectTopic={handlePracticeTopic} />
        )}
        
        {currentPage === "match" && matchData && (
          <DuelInterface
            topic={matchData.topic}
            vocabulary={matchData.vocabulary}
            opponentName={matchData.opponent}
            opponentElo={matchData.isBot ? 1200 : 1520}
            userElo={userElo}
            isBot={matchData.isBot}
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
