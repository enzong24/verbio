import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Trophy, Target, Zap, Flame, BarChart3, BookOpen, AlertCircle, Activity, Swords, Eye, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import type { Match, UserLanguageStats } from "@shared/schema";
import { useState } from "react";
import MatchDetails from "@/components/MatchDetails";

interface AnalyticsProps {
  currentLanguage: string;
  isAuthenticated?: boolean;
}

export default function Analytics({ currentLanguage, isAuthenticated }: AnalyticsProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Fetch matches for the current language
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: [`/api/user/matches?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  // Fetch language stats
  const { data: languageStats } = useQuery<UserLanguageStats>({
    queryKey: [`/api/user/stats/${currentLanguage}`],
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

  // Fetch study recommendations
  const { data: studyRecommendations } = useQuery<{
    grammarIssues: { issue: string; count: number }[];
    vocabularyTips: { tip: string; count: number }[];
    generalAdvice: { advice: string; count: number }[];
    totalMatches: number;
  }>({
    queryKey: [`/api/user/study-recommendations?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Analytics Unavailable</h3>
            <p className="text-muted-foreground text-sm">
              Sign in to view your progress analytics and detailed stats.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process Fluency Score over time
  const fluencyOverTime = matches
    .slice(0, 20)
    .reverse()
    .map((match, index) => {
      const previousMatches = matches.slice(0, matches.indexOf(match));
      const eloBeforeMatch = (languageStats?.elo || 1200) - 
        previousMatches.reduce((sum, m) => sum + (m.eloChange || 0), 0);
      
      return {
        match: `Match ${index + 1}`,
        elo: eloBeforeMatch + (match.eloChange || 0),
        date: match.createdAt ? format(new Date(match.createdAt), 'MMM d') : ''
      };
    });

  // Calculate skill improvement (compare recent matches vs previous matches)
  const calculateImprovement = () => {
    // Need at least 4 matches to show meaningful improvement (2 vs 2 minimum)
    if (matches.length < 4) return null;
    
    // Calculate how many matches to compare (half of total, up to 10)
    const compareSize = Math.min(10, Math.floor(matches.length / 2));
    
    const recentMatches = matches.slice(0, compareSize);
    const olderMatches = matches.slice(compareSize, compareSize * 2);

    const recentAvg = {
      grammar: recentMatches.reduce((sum, m) => sum + m.grammarScore, 0) / recentMatches.length,
      fluency: recentMatches.reduce((sum, m) => sum + m.fluencyScore, 0) / recentMatches.length,
      vocabulary: recentMatches.reduce((sum, m) => sum + m.vocabularyScore, 0) / recentMatches.length,
      naturalness: recentMatches.reduce((sum, m) => sum + m.naturalnessScore, 0) / recentMatches.length,
    };

    const olderAvg = {
      grammar: olderMatches.reduce((sum, m) => sum + m.grammarScore, 0) / olderMatches.length,
      fluency: olderMatches.reduce((sum, m) => sum + m.fluencyScore, 0) / olderMatches.length,
      vocabulary: olderMatches.reduce((sum, m) => sum + m.vocabularyScore, 0) / olderMatches.length,
      naturalness: olderMatches.reduce((sum, m) => sum + m.naturalnessScore, 0) / olderMatches.length,
    };

    return {
      grammar: Math.round(recentAvg.grammar - olderAvg.grammar),
      fluency: Math.round(recentAvg.fluency - olderAvg.fluency),
      vocabulary: Math.round(recentAvg.vocabulary - olderAvg.vocabulary),
      naturalness: Math.round(recentAvg.naturalness - olderAvg.naturalness),
      compareSize, // Return the comparison size for display
    };
  };

  const improvement = calculateImprovement();

  // Study recommendations data
  const hasRecommendations = studyRecommendations && 
    studyRecommendations.totalMatches > 0 && 
    (studyRecommendations.grammarIssues.length > 0 || 
     studyRecommendations.vocabularyTips.length > 0 || 
     studyRecommendations.generalAdvice.length > 0);

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

  const totalMatches = (languageStats?.wins || 0) + (languageStats?.losses || 0);
  const overallWinRate = totalMatches > 0 ? Math.round(((languageStats?.wins || 0) / totalMatches) * 100) : 0;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics - {currentLanguage}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Track your progress and performance over time</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fluency Score</p>
                <p className="text-2xl font-bold font-mono" data-testid="text-analytics-fluency">{languageStats?.elo || 1200}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold font-mono">{overallWinRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Streak</p>
                <p className="text-2xl font-bold font-mono">{languageStats?.winStreak || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Streak</p>
                <p className="text-2xl font-bold font-mono">{languageStats?.dailyLoginStreak || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fluency Score Over Time */}
      {fluencyOverTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Fluency Score Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fluencyOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="elo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Current Skill Levels with Improvement */}
      {skillProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Skill Levels
            </CardTitle>
            {improvement && (
              <p className="text-xs text-muted-foreground mt-1">
                Comparing last {improvement.compareSize} matches to previous {improvement.compareSize} matches
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Grammar</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-mono">{skillProgress.grammar}%</span>
                  {improvement && improvement.grammar !== 0 && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                      improvement.grammar > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {improvement.grammar > 0 ? (
                        <><TrendingUp className="w-3 h-3" />+{improvement.grammar}%</>
                      ) : (
                        <><TrendingDown className="w-3 h-3" />{improvement.grammar}%</>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={skillProgress.grammar} className="h-3" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fluency</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-mono">{skillProgress.fluency}%</span>
                  {improvement && improvement.fluency !== 0 && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                      improvement.fluency > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {improvement.fluency > 0 ? (
                        <><TrendingUp className="w-3 h-3" />+{improvement.fluency}%</>
                      ) : (
                        <><TrendingDown className="w-3 h-3" />{improvement.fluency}%</>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={skillProgress.fluency} className="h-3" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vocabulary</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-mono">{skillProgress.vocabulary}%</span>
                  {improvement && improvement.vocabulary !== 0 && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                      improvement.vocabulary > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {improvement.vocabulary > 0 ? (
                        <><TrendingUp className="w-3 h-3" />+{improvement.vocabulary}%</>
                      ) : (
                        <><TrendingDown className="w-3 h-3" />{improvement.vocabulary}%</>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={skillProgress.vocabulary} className="h-3" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Naturalness</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold font-mono">{skillProgress.naturalness}%</span>
                  {improvement && improvement.naturalness !== 0 && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                      improvement.naturalness > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {improvement.naturalness > 0 ? (
                        <><TrendingUp className="w-3 h-3" />+{improvement.naturalness}%</>
                      ) : (
                        <><TrendingDown className="w-3 h-3" />{improvement.naturalness}%</>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={skillProgress.naturalness} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Recommendations */}
      {hasRecommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Focus Areas
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {studyRecommendations.totalMatches} recent matches with AI feedback
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {studyRecommendations.grammarIssues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  Common Grammar Patterns
                </h4>
                <div className="space-y-1.5">
                  {studyRecommendations.grammarIssues.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">{item.count}×</Badge>
                      <span className="text-muted-foreground">{item.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {studyRecommendations.vocabularyTips.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-primary" />
                  Vocabulary Improvements
                </h4>
                <div className="space-y-1.5">
                  {studyRecommendations.vocabularyTips.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">{item.count}×</Badge>
                      <span className="text-muted-foreground">{item.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {studyRecommendations.generalAdvice.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  General Improvements
                </h4>
                <div className="space-y-1.5">
                  {studyRecommendations.generalAdvice.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="text-xs shrink-0">{item.count}×</Badge>
                      <span className="text-muted-foreground">{item.advice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Match History */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Match History ({matches.length} Matches)
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
      )}

      {/* No Data Message */}
      {matches.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-sm">
              Complete some matches to see your analytics and progress charts.
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
