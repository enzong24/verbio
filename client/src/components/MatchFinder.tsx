import { useState } from "react";
import { Swords, Bot, Loader2, Languages, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THEMES } from "@shared/themes";

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
  onMatchFound?: (opponent: string, isBot: boolean, language: Language, difficulty: Difficulty, topic?: string) => void;
  onLanguageChange?: (language: Language) => void;
  currentLanguage?: Language;
  userElo?: number;
  userWins?: number;
  userLosses?: number;
}

export default function MatchFinder({ 
  onMatchFound,
  onLanguageChange,
  currentLanguage = "Chinese",
  userElo = 1000,
  userWins = 0,
  userLosses = 0
}: MatchFinderProps) {
  const [searching, setSearching] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Medium");
  const [selectedTopic, setSelectedTopic] = useState<string>("random");

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    onLanguageChange?.(language);
  };

  const handleFindMatch = () => {
    setSearching(true);
    // Simulate matchmaking - competitive mode (affects Elo)
    setTimeout(() => {
      setSearching(false);
      const topic = selectedTopic === "random" ? undefined : selectedTopic;
      onMatchFound?.("Maria García", false, selectedLanguage, selectedDifficulty, topic);
    }, 2000);
  };

  const handlePractice = () => {
    const randomBotName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const topic = selectedTopic === "random" ? undefined : selectedTopic;
    onMatchFound?.(randomBotName, true, selectedLanguage, selectedDifficulty, topic);
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
              <Languages className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedLanguage} onValueChange={(value) => handleLanguageChange(value as Language)}>
                <SelectTrigger className="flex-1" data-testid="select-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chinese" data-testid="option-chinese">Chinese (中文)</SelectItem>
                  <SelectItem value="Spanish" data-testid="option-spanish">Spanish (Español)</SelectItem>
                  <SelectItem value="Italian" data-testid="option-italian">Italian (Italiano)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="flex items-center gap-3 mb-2">
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
              className="w-full h-14 text-lg font-semibold"
              onClick={handleFindMatch}
              disabled={searching}
              data-testid="button-find-match"
            >
              {searching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding opponent...
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  Find Match
                </>
              )}
            </Button>
            
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
