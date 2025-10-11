import { Trophy, Medal, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  currentUserId?: string;
}

export default function Leaderboard({
  entries = [
    { rank: 1, username: "Elena", elo: 2145, wins: 156, losses: 43 },
    { rank: 2, username: "Carlos", elo: 1998, wins: 134, losses: 52 },
    { rank: 3, username: "Sofia", elo: 1876, wins: 121, losses: 61 },
    { rank: 4, username: "Miguel", elo: 1743, wins: 98, losses: 54 },
    { rank: 5, username: "Alex", elo: 1547, wins: 23, losses: 12, isCurrentUser: true },
    { rank: 6, username: "Isabella", elo: 1489, wins: 87, losses: 68 },
    { rank: 7, username: "Diego", elo: 1432, wins: 76, losses: 71 },
    { rank: 8, username: "Luna", elo: 1398, wins: 65, losses: 59 },
  ]
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="border-card-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-gold" />
            <div>
              <CardTitle className="text-2xl">Global Leaderboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Top Spanish learners worldwide</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-md transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover-elevate'
                }`}
                data-testid={`leaderboard-entry-${entry.rank}`}
              >
                <div className="w-12 text-center">
                  {getRankIcon(entry.rank) || (
                    <span className="font-mono font-bold text-muted-foreground">#{entry.rank}</span>
                  )}
                </div>

                <Avatar className="w-10 h-10 border border-border">
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {entry.username}
                    {entry.isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.wins}W - {entry.losses}L
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xl">{entry.elo}</div>
                  <div className="text-xs text-muted-foreground">Elo</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
