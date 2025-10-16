import { Trophy, TrendingUp, TrendingDown, ArrowRight, Bot, User, Users, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GradingResult } from "@shared/schema";
import { useEffect } from "react";
import { useSound } from "@/hooks/use-sound";
import { motion } from "framer-motion";

interface MatchResultsProps {
  gradingResult: GradingResult;
  eloChange?: number;
  newElo?: number;
  isBot?: boolean;
  opponentName?: string;
  isPracticeMode?: boolean;
  onContinue?: () => void;
  onAIReview?: () => void;
  isSaving?: boolean;
}

export default function MatchResults({
  gradingResult,
  eloChange = 15,
  newElo = 1562,
  isBot = false,
  opponentName = "Opponent",
  isPracticeMode = false,
  onContinue,
  onAIReview,
  isSaving = false
}: MatchResultsProps) {
  const { playWin, playLoss } = useSound();
  const userScore = gradingResult.overall;
  const botScore = gradingResult.botOverall || 0;
  const botElo = gradingResult.botElo || 1000;
  // Check if opponent scores exist (not just if > 0, since 0 is a valid score)
  const hasOpponentScores = gradingResult.botGrammar !== undefined && gradingResult.botGrammar !== null;
  const isForfeit = gradingResult.isForfeit || false;
  
  // Determine win/loss by comparing scores (whoever has higher score wins)
  const isWinner = userScore > botScore;
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
  
  const botScores = hasOpponentScores ? {
    grammar: gradingResult.botGrammar || 0,
    fluency: gradingResult.botFluency || 0,
    vocabulary: gradingResult.botVocabulary || 0,
    naturalness: gradingResult.botNaturalness || 0,
  } : null;

  // Play sound effect on mount (but not in practice mode)
  useEffect(() => {
    if (isPracticeMode) {
      // No win/loss sounds in practice mode
      return;
    }
    if (isDraw) {
      // No sound for draw
      return;
    }
    if (isWinner) {
      playWin();
    } else {
      playLoss();
    }
  }, [isWinner, isDraw, isPracticeMode, playWin, playLoss]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-card-border">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <motion.div 
                className={`w-24 h-24 rounded-md flex items-center justify-center ${
                  isPracticeMode ? 'bg-primary/20' : (isWinner ? 'bg-success/20' : 'bg-destructive/20')
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.1
                }}
              >
                <motion.div
                  animate={!isPracticeMode && isWinner ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.4,
                    repeat: !isPracticeMode && isWinner ? 2 : 0
                  }}
                >
                  {isPracticeMode ? (
                    <Brain className="w-12 h-12 text-primary" />
                  ) : (
                    <Trophy className={`w-12 h-12 ${isWinner ? 'text-success' : 'text-destructive'}`} />
                  )}
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-4xl font-bold mb-2" data-testid="text-result">
                {isPracticeMode ? "Practice Complete!" : (isWinner ? "Victory!" : "Good Effort!")}
              </CardTitle>
            </motion.div>
            {eloChange === 0 ? (
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Practice Mode - No Fluency Score Change
              </motion.p>
            ) : (
              <motion.div 
                className="flex items-center justify-center gap-2 text-2xl font-mono font-bold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {actualEloChange > 0 ? (
                  <>
                    <TrendingUp className="w-6 h-6 text-success" />
                    <motion.span 
                      className="text-success"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      +{actualEloChange}
                    </motion.span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-6 h-6 text-destructive" />
                    <motion.span 
                      className="text-destructive"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {actualEloChange}
                    </motion.span>
                  </>
                )}
                <span className="text-muted-foreground mx-2">→</span>
                <motion.span 
                  data-testid="text-new-elo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {newElo + actualEloChange} Fluency
                </motion.span>
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {isForfeit ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg">Match ended by forfeit</p>
              </div>
            ) : isPracticeMode ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <h3 className="font-semibold mb-4">Your Performance</h3>
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
              </motion.div>
            ) : hasOpponentScores ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
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

                  {/* Opponent Scores */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      {isBot ? <Bot className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      <span className="font-semibold">{isBot ? "AI Bot" : opponentName}</span>
                      <Badge variant="outline" className="ml-auto font-mono" data-testid="text-bot-score">
                        {botScore}%
                      </Badge>
                      {gradingResult.botElo && (
                        <Badge variant="secondary" className="font-mono">
                          {gradingResult.botElo} Fluency
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
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
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <h3 className="font-semibold mb-3">Feedback</h3>
              <div className="space-y-2">
                {gradingResult.feedback.map((item, idx) => (
                  <div key={idx} className="flex gap-2 text-sm" data-testid={`feedback-${idx}`}>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
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
                <Button 
                  className="flex-1" 
                  onClick={onContinue} 
                  data-testid="button-continue"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Continue"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={onContinue} 
                  data-testid="button-new-match"
                  disabled={isSaving}
                >
                  New Match
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
