import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Trophy, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import type { Match } from "@shared/schema";

interface ProfileStatsProps {
  username?: string;
  elo?: number;
  totalMatches?: number;
  wins?: number;
  losses?: number;
  currentLanguage?: string;
  isAuthenticated?: boolean;
}

export default function ProfileStats({
  username = "Alex",
  elo = 1000,
  totalMatches = 0,
  wins = 0,
  losses = 0,
  currentLanguage = "Chinese",
  isAuthenticated = false,
}: ProfileStatsProps) {
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Fetch recent matches
  const { data: matches } = useQuery<Match[]>({
    queryKey: [`/api/user/matches?language=${currentLanguage}`],
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
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="font-mono font-semibold text-base">
                  {elo} Fluency
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {currentLanguage}
                </Badge>
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
              <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{winRate}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">{totalMatches}</div>
                <div className="text-sm text-muted-foreground">Total</div>
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
              {matches && matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-4 p-3 rounded-md hover-elevate"
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
                          {match.isForfeit === 1 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                              Forfeit
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {match.createdAt ? formatDistanceToNow(new Date(match.createdAt), { addSuffix: true }) : "Unknown"}
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${
                        match.result === "win" ? "text-success" : "text-destructive"
                      }`}>
                        {match.result === "win" ? "+" : ""}{match.eloChange}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No matches played yet. Start a duel to see your history!
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
    </div>
  );
}
