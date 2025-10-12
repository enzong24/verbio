import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import MatchFinder, { type Language, type Difficulty } from "@/components/MatchFinder";
import DuelInterface from "@/components/DuelInterface";
import MatchResults from "@/components/MatchResults";
import Leaderboard from "@/components/Leaderboard";
import ProfileStats from "@/components/ProfileStats";
import PracticeMode from "@/components/PracticeMode";
import type { GradingResult } from "@shared/schema";

type Page = "duel" | "practice" | "leaderboard" | "profile" | "match" | "results";

interface VocabWord {
  word: string;
  romanization: string;
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>("duel");
  const [matchData, setMatchData] = useState<{
    opponent: string;
    isBot: boolean;
    topic: string;
    vocabulary: VocabWord[];
    language: Language;
    difficulty: Difficulty;
  } | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  //todo: remove mock functionality - This is prototype data
  const [userElo, setUserElo] = useState(1547);
  const username = "Alex";

  const handleMatchFound = (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty) => {
    // todo: remove mock functionality - Simulated match setup
    const topicsByLanguage: Record<Language, Array<{ title: string; vocabulary: VocabWord[] }>> = {
      Chinese: [
        { 
          title: "Travel & Tourism", 
          vocabulary: [
            { word: "旅行", romanization: "lǚxíng" },
            { word: "目的地", romanization: "mùdìdì" },
            { word: "探索", romanization: "tànsuǒ" },
            { word: "冒险", romanization: "màoxiǎn" },
            { word: "文化", romanization: "wénhuà" }
          ] 
        },
        { 
          title: "Food & Dining", 
          vocabulary: [
            { word: "美味", romanization: "měiwèi" },
            { word: "菜谱", romanization: "càipǔ" },
            { word: "餐厅", romanization: "cāntīng" },
            { word: "味道", romanization: "wèidào" },
            { word: "风味", romanization: "fēngwèi" }
          ] 
        },
        { 
          title: "Technology", 
          vocabulary: [
            { word: "设备", romanization: "shèbèi" },
            { word: "软件", romanization: "ruǎnjiàn" },
            { word: "创新", romanization: "chuàngxīn" },
            { word: "数字", romanization: "shùzì" },
            { word: "连接", romanization: "liánjiē" }
          ] 
        },
      ],
      Spanish: [
        { 
          title: "Travel & Tourism", 
          vocabulary: [
            { word: "viajar", romanization: "viajar" },
            { word: "destino", romanization: "destino" },
            { word: "explorar", romanization: "explorar" },
            { word: "aventura", romanization: "aventura" },
            { word: "cultura", romanization: "cultura" }
          ] 
        },
        { 
          title: "Food & Dining", 
          vocabulary: [
            { word: "delicioso", romanization: "delicioso" },
            { word: "receta", romanization: "receta" },
            { word: "restaurante", romanization: "restaurante" },
            { word: "sabor", romanization: "sabor" },
            { word: "plato", romanization: "plato" }
          ] 
        },
        { 
          title: "Technology", 
          vocabulary: [
            { word: "dispositivo", romanization: "dispositivo" },
            { word: "software", romanization: "software" },
            { word: "innovación", romanization: "innovación" },
            { word: "digital", romanization: "digital" },
            { word: "conexión", romanization: "conexión" }
          ] 
        },
      ],
      Italian: [
        { 
          title: "Travel & Tourism", 
          vocabulary: [
            { word: "viaggiare", romanization: "viaggiare" },
            { word: "destinazione", romanization: "destinazione" },
            { word: "esplorare", romanization: "esplorare" },
            { word: "avventura", romanization: "avventura" },
            { word: "cultura", romanization: "cultura" }
          ] 
        },
        { 
          title: "Food & Dining", 
          vocabulary: [
            { word: "delizioso", romanization: "delizioso" },
            { word: "ricetta", romanization: "ricetta" },
            { word: "ristorante", romanization: "ristorante" },
            { word: "sapore", romanization: "sapore" },
            { word: "piatto", romanization: "piatto" }
          ] 
        },
        { 
          title: "Technology", 
          vocabulary: [
            { word: "dispositivo", romanization: "dispositivo" },
            { word: "software", romanization: "software" },
            { word: "innovazione", romanization: "innovazione" },
            { word: "digitale", romanization: "digitale" },
            { word: "connessione", romanization: "connessione" }
          ] 
        },
      ],
    };
    
    const topics = topicsByLanguage[language];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    setMatchData({
      opponent,
      isBot,
      topic: topic.title,
      vocabulary: topic.vocabulary,
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

  const handlePracticeTopic = (topicId: string) => {
    console.log('Starting practice with topic:', topicId);
    handleMatchFound("AI Bot", true, "Chinese", "Medium");
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
