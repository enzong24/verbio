import { Trophy, TrendingUp, TrendingDown, ArrowRight, Bot, User, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GradingResult } from "@shared/schema";

interface MatchResultsProps {
  gradingResult: GradingResult;
  eloChange?: number;
  newElo?: number;
  isBot?: boolean;
  onContinue?: () => void;
  onAIReview?: () => void;
}

export default function MatchResults({
  gradingResult,
  eloChange = 15,
  newElo = 1562,
  isBot = false,
  onContinue,
  onAIReview
}: MatchResultsProps) {
  const userScore = gradingResult.overall;
  const botScore = gradingResult.botOverall || 0;
  const botElo = gradingResult.botElo || 1000;
  const hasBot = botScore > 0;
  
  // Win/loss determined by comparative scoring
  const isWinner = hasBot ? userScore > botScore : userScore >= 70;
  const isDraw = userScore === botScore;
  
  // Calculate Elo change using standard Elo formula (same as backend)
  const K_FACTOR = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (botElo - newElo) / 400));
  const actualScore = isWinner ? 1 : (isDraw ? 0.5 : 0);
  const actualEloChange = eloChange === 0 ? 0 : Math.round(K_FACTOR * (actualScore - expectedScore));

  const userScores = {
    grammar: gradingResult.grammar,
    fluency: gradingResult.fluency,
    vocabulary: gradingResult.vocabulary,
    naturalness: gradingResult.naturalness,
  };
  
  const botScores = hasBot ? {
    grammar: gradingResult.botGrammar || 0,
    fluency: gradingResult.botFluency || 0,
    vocabulary: gradingResult.botVocabulary || 0,
    naturalness: gradingResult.botNaturalness || 0,
  } : null;

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
            {eloChange === 0 ? (
              <p className="text-muted-foreground">Practice Mode - No Elo Change</p>
            ) : (
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
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {hasBot ? (
              <div>
                <h3 className="font-semibold mb-4">Score Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Scores */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5" />
                      <span className="font-semibold">You</span>
                      <Badge variant="outline" className="ml-auto font-mono" data-testid="text-user-score">
                        {userScore}%
                      </Badge>
                    </div>
                    {Object.entries(userScores).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm capitalize text-muted-foreground">{key}</span>
                          <span className="font-mono text-sm">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>

                  {/* Bot Scores */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5" />
                      <span className="font-semibold">AI Bot</span>
                      <Badge variant="outline" className="ml-auto font-mono" data-testid="text-bot-score">
                        {botScore}%
                      </Badge>
                      {gradingResult.botElo && (
                        <Badge variant="secondary" className="font-mono">
                          {gradingResult.botElo} Elo
                        </Badge>
                      )}
                    </div>
                    {botScores && Object.entries(botScores).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm capitalize text-muted-foreground">{key}</span>
                          <span className="font-mono text-sm">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-4">Performance Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(userScores).map(([key, value]) => (
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
            )}

            <div>
              <h3 className="font-semibold mb-3">Feedback</h3>
              <div className="space-y-2">
                {gradingResult.feedback.map((item, idx) => (
                  <div key={idx} className="flex gap-2 text-sm" data-testid={`feedback-${idx}`}>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                variant="secondary" 
                className="w-full gap-2" 
                onClick={onAIReview} 
                data-testid="button-ai-review"
              >
                <Brain className="w-4 h-4" />
                AI Review & Analysis
              </Button>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={onContinue} data-testid="button-continue">
                  Continue
                </Button>
                <Button variant="outline" className="flex-1" onClick={onContinue} data-testid="button-new-match">
                  New Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
