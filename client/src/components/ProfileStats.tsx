import { TrendingUp, Trophy, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface MatchHistory {
  id: string;
  opponent: string;
  result: "win" | "loss";
  eloChange: number;
  date: string;
}

interface ProfileStatsProps {
  username?: string;
  elo?: number;
  totalMatches?: number;
  wins?: number;
  losses?: number;
  streak?: number;
  recentMatches?: MatchHistory[];
}

export default function ProfileStats({
  username = "Alex",
  elo = 1547,
  totalMatches = 35,
  wins = 23,
  losses = 12,
  streak = 5,
  recentMatches = [
    { id: "1", opponent: "Maria García", result: "win", eloChange: 15, date: "2 hours ago" },
    { id: "2", opponent: "Carlos Ruiz", result: "win", eloChange: 12, date: "5 hours ago" },
    { id: "3", opponent: "Sofia López", result: "loss", eloChange: -14, date: "1 day ago" },
    { id: "4", opponent: "AI Bot", result: "win", eloChange: 8, date: "2 days ago" },
    { id: "5", opponent: "Diego Fernández", result: "win", eloChange: 13, date: "3 days ago" },
  ]
}: ProfileStatsProps) {
  const winRate = Math.round((wins / totalMatches) * 100);

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
                  {elo} Elo
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {streak} win streak
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

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMatches.map((match) => (
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
                  <div className="font-medium">vs {match.opponent}</div>
                  <div className="text-sm text-muted-foreground">{match.date}</div>
                </div>
                <div className={`font-mono font-bold ${
                  match.result === "win" ? "text-success" : "text-destructive"
                }`}>
                  {match.result === "win" ? "+" : ""}{match.eloChange}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Grammar</span>
              <span className="font-mono font-semibold text-sm">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Fluency</span>
              <span className="font-mono font-semibold text-sm">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Vocabulary</span>
              <span className="font-mono font-semibold text-sm">92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Naturalness</span>
              <span className="font-mono font-semibold text-sm">81%</span>
            </div>
            <Progress value={81} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
