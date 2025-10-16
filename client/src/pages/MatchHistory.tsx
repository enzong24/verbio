import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Trophy, TrendingUp, TrendingDown, Eye, Swords } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Match } from "@shared/schema";
import { useState } from "react";
import MatchDetails from "@/components/MatchDetails";

interface MatchHistoryProps {
  currentLanguage: string;
  isAuthenticated?: boolean;
}

export default function MatchHistory({ currentLanguage, isAuthenticated }: MatchHistoryProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Fetch matches for the current language
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: [`/api/user/matches?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Match History Unavailable</h3>
            <p className="text-muted-foreground text-sm">
              Sign in to view your complete match history and performance details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "Easy": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "Hard": return "bg-red-500/20 text-red-500 border-red-500/30";
      default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="w-6 h-6" />
          Match History - {currentLanguage}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Complete history of your past {matches.length} matches
        </p>
      </div>

      {matches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Matches ({matches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border ${
                      match.result === 'win' 
                        ? 'border-success/30 bg-success/5' 
                        : 'border-destructive/30 bg-destructive/5'
                    } hover-elevate transition-all`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={match.result === 'win' ? 'border-success text-success' : 'border-destructive text-destructive'}
                          >
                            {match.result === 'win' ? (
                              <><Trophy className="w-3 h-3 mr-1" /> Victory</>
                            ) : (
                              <>Defeat</>
                            )}
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(match.difficulty)}>
                            {match.difficulty}
                          </Badge>
                          {match.isForfeit === 1 && (
                            <Badge variant="outline" className="border-muted text-muted-foreground">
                              Forfeit
                            </Badge>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold">vs {match.opponent}</p>
                          <p className="text-sm text-muted-foreground">{match.topic || 'No topic'}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Score:</span>
                            <span className="font-mono font-semibold">{match.overallScore}/100</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {match.eloChange >= 0 ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-success" />
                                <span className="font-mono font-semibold text-success">+{match.eloChange}</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-4 h-4 text-destructive" />
                                <span className="font-mono font-semibold text-destructive">{match.eloChange}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Grammar:</span>
                            <span className="ml-1 font-semibold">{match.grammarScore}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fluency:</span>
                            <span className="ml-1 font-semibold">{match.fluencyScore}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Vocabulary:</span>
                            <span className="ml-1 font-semibold">{match.vocabularyScore}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Naturalness:</span>
                            <span className="ml-1 font-semibold">{match.naturalnessScore}%</span>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(match.createdAt || new Date()), { addSuffix: true })}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMatch(match)}
                        data-testid={`button-view-match-${match.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
            <p className="text-muted-foreground text-sm">
              Complete some matches to see your match history here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Match Details Dialog */}
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
