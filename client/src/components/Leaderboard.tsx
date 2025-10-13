import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Crown, Swords } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  rank?: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  currentUserId?: string;
  currentLanguage?: string;
}

export default function Leaderboard({
  currentUserId,
  currentLanguage = "Chinese"
}: LeaderboardProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const { data: leaderboardData, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/leaderboard?language=${selectedLanguage}`],
    refetchOnWindowFocus: false,
  });

  const entries = leaderboardData?.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  })) || [];
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0";
    return "";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Global Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Top {selectedLanguage} learners competing worldwide
          </p>
        </div>

        {/* Language Tabs */}
        <Card className="mb-6 border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <CardContent className="pt-6">
            <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Chinese" data-testid="tab-chinese">🇨🇳 Chinese</TabsTrigger>
                <TabsTrigger value="Spanish" data-testid="tab-spanish">🇪🇸 Spanish</TabsTrigger>
                <TabsTrigger value="Italian" data-testid="tab-italian">🇮🇹 Italian</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Leaderboard Entries */}
        <Card className="border-card-border bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    entry.isCurrentUser
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500/40'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 hover-elevate'
                  } ${entry.rank <= 3 ? 'ring-2 ring-offset-2 ' + (
                    entry.rank === 1 ? 'ring-yellow-500/50' :
                    entry.rank === 2 ? 'ring-gray-400/50' :
                    'ring-amber-500/50'
                  ) : ''}`}
                  data-testid={`leaderboard-entry-${entry.rank}`}
                >
                  <div className="w-14 flex justify-center">
                    {getRankIcon(entry.rank) || (
                      <span className="font-mono font-bold text-lg text-muted-foreground">#{entry.rank}</span>
                    )}
                  </div>

                  <Avatar className={`w-12 h-12 border-2 ${
                    entry.rank === 1 ? 'border-yellow-500' :
                    entry.rank === 2 ? 'border-gray-400' :
                    entry.rank === 3 ? 'border-amber-500' :
                    'border-border'
                  }`}>
                    <AvatarFallback className={`font-semibold ${
                      entry.rank <= 3 ? getRankBadgeColor(entry.rank) : 'bg-muted text-muted-foreground'
                    }`}>
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-semibold text-base flex items-center gap-2">
                      {entry.username}
                      {entry.isCurrentUser && (
                        <Badge className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">You</Badge>
                      )}
                      {entry.rank <= 3 && !entry.isCurrentUser && (
                        <Swords className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400 font-semibold">{entry.wins}W</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-red-600 dark:text-red-400 font-semibold">{entry.losses}L</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-2xl ${
                      entry.rank === 1 ? 'text-yellow-600' :
                      entry.rank === 2 ? 'text-gray-600 dark:text-gray-400' :
                      entry.rank === 3 ? 'text-amber-600' :
                      ''
                    }`}>{entry.elo}</div>
                    <div className="text-xs text-muted-foreground">Elo Rating</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading leaderboard...
                </div>
              )}

              {!isLoading && entries.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No players yet. Be the first to compete!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
