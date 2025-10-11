import { useState } from "react";
import { Swords, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchFinderProps {
  onMatchFound?: (opponent: string, isBot: boolean) => void;
}

export default function MatchFinder({ onMatchFound }: MatchFinderProps) {
  const [searching, setSearching] = useState(false);

  const handleFindMatch = () => {
    setSearching(true);
    // Simulate matchmaking
    setTimeout(() => {
      setSearching(false);
      onMatchFound?.("Maria García", false);
    }, 2000);
  };

  const handlePractice = () => {
    onMatchFound?.("AI Bot", true);
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
                <div className="text-2xl font-bold font-mono">1,547</div>
                <div className="text-sm text-muted-foreground">Your Elo</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">23</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">12</div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
