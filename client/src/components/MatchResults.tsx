import { Trophy, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GradingResult } from "@shared/schema";

interface MatchResultsProps {
  gradingResult: GradingResult;
  eloChange?: number;
  newElo?: number;
  onContinue?: () => void;
}

export default function MatchResults({
  gradingResult,
  eloChange = 15,
  newElo = 1562,
  onContinue
}: MatchResultsProps) {
  const isWinner = gradingResult.overall >= 70;
  const actualEloChange = isWinner ? Math.abs(eloChange) : -Math.abs(eloChange);

  const scores = {
    grammar: gradingResult.grammar,
    fluency: gradingResult.fluency,
    vocabulary: gradingResult.vocabulary,
    naturalness: gradingResult.naturalness,
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-card-border">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className={`w-24 h-24 rounded-md flex items-center justify-center ${
                isWinner ? 'bg-success/20' : 'bg-destructive/20'
              }`}>
                <Trophy className={`w-12 h-12 ${isWinner ? 'text-success' : 'text-destructive'}`} />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-2" data-testid="text-result">
              {isWinner ? "Victory!" : "Good Effort!"}
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold">
              {actualEloChange > 0 ? (
                <>
                  <TrendingUp className="w-6 h-6 text-success" />
                  <span className="text-success">+{actualEloChange}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-6 h-6 text-destructive" />
                  <span className="text-destructive">{actualEloChange}</span>
                </>
              )}
              <span className="text-muted-foreground mx-2">→</span>
              <span data-testid="text-new-elo">{newElo + actualEloChange} Elo</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Performance Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(scores).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm capitalize text-muted-foreground">{key}</span>
                      <span className="font-mono font-semibold">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-lg font-mono">
                  Average: {gradingResult.overall}%
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">AI Feedback</h3>
              <div className="space-y-2">
                {gradingResult.feedback.map((item, idx) => (
                  <div key={idx} className="flex gap-2 text-sm" data-testid={`feedback-${idx}`}>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={onContinue} data-testid="button-continue">
                Continue
              </Button>
              <Button variant="outline" className="flex-1" data-testid="button-rematch">
                New Match
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
