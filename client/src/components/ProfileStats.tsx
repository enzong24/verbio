import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Trophy, Target, Calendar, Flame, Zap, Eye, MessageSquare, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import type { Match } from "@shared/schema";
import MatchDetails from "@/components/MatchDetails";

interface ProfileStatsProps {
  username?: string;
  elo?: number;
  totalMatches?: number;
  wins?: number;
  losses?: number;
  currentLanguage?: string;
  isAuthenticated?: boolean;
  winStreak?: number;
  bestWinStreak?: number;
  dailyLoginStreak?: number;
}

export default function ProfileStats({
  username = "Alex",
  elo = 1000,
  totalMatches = 0,
  wins = 0,
  losses = 0,
  currentLanguage = "Chinese",
  isAuthenticated = false,
  winStreak = 0,
  bestWinStreak = 0,
  dailyLoginStreak = 0,
}: ProfileStatsProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Fetch recent matches - explicitly pass language parameter
  const { data: matches } = useQuery<Match[]>({
    queryKey: [`/api/user/matches`, currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/user/matches?language=${currentLanguage}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch skill progress
  const { data: skillProgress } = useQuery<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }>({
    queryKey: [`/api/user/skill-progress?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="border-card-border">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-border">
              <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xl">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl" data-testid="text-username">{username}</CardTitle>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge variant="outline" className="font-mono font-semibold text-base">
                  {elo} Fluency
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {currentLanguage}
                </Badge>
                {bestWinStreak > 0 && (
                  <Badge variant="outline" className="gap-1 bg-orange-500/10 border-orange-500/20 text-orange-500">
                    <Trophy className="w-3 h-3" />
                    Best: {bestWinStreak}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-card-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{wins}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-destructive/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{losses}</div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{winStreak}</div>
                <div className="text-sm text-muted-foreground">Win Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{dailyLoginStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAuthenticated && (
        <>
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {matches && matches.filter((m: any) => m.isPracticeMode === 0).length > 0 ? (
                <div className="space-y-3">
                  {matches.filter((m: any) => m.isPracticeMode === 0).map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center gap-4 p-3 rounded-md hover-elevate cursor-pointer transition-all"
                          onClick={() => setSelectedMatch(match)}
                          data-testid={`match-history-${match.id}`}
                        >
                          <Badge
                            variant={match.result === "win" ? "default" : "destructive"}
                            className="w-12 justify-center font-semibold"
                          >
                            {match.result === "win" ? "W" : "L"}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <span>vs {match.opponent}</span>
                              {(match.isForfeit === 1 || (match as any).is_forfeit === 1) && (
                                <Badge variant="outline" className="hidden md:inline-flex text-xs px-1.5 py-0 h-4">
                                  Forfeit
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span>
                                {match.createdAt ? formatDistanceToNow(new Date(match.createdAt), { addSuffix: true }) : "Unknown"}
                                {match.topic && ` • ${match.topic}`}
                              </span>
                              {match.fluencyScore !== undefined && match.fluencyScore !== null && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {match.fluencyScore}
                                </span>
                              )}
                              {match.vocabularyScore !== undefined && match.vocabularyScore !== null && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {match.vocabularyScore}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`font-mono font-bold ${
                              match.result === "win" ? "text-success" : "text-destructive"
                            }`}>
                              {match.result === "win" ? "+" : ""}{match.eloChange}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMatch(match);
                              }}
                              data-testid={`button-view-match-${match.id}`}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No competitive matches yet. Start a competitive match to see your history!
                    </p>
                  )}
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader>
              <CardTitle>Skill Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillProgress ? (
                <>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Grammar</span>
                      <span className="font-mono font-semibold text-sm">{skillProgress.grammar}%</span>
                    </div>
                    <Progress value={skillProgress.grammar} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Fluency</span>
                      <span className="font-mono font-semibold text-sm">{skillProgress.fluency}%</span>
                    </div>
                    <Progress value={skillProgress.fluency} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Vocabulary</span>
                      <span className="font-mono font-semibold text-sm">{skillProgress.vocabulary}%</span>
                    </div>
                    <Progress value={skillProgress.vocabulary} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Naturalness</span>
                      <span className="font-mono font-semibold text-sm">{skillProgress.naturalness}%</span>
                    </div>
                    <Progress value={skillProgress.naturalness} className="h-2" />
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No skill data yet. Complete matches to see your progress!
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
      
      {selectedMatch && (
        <MatchDetails
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          language={currentLanguage}
        />
      )}
    </div>
  );
}
