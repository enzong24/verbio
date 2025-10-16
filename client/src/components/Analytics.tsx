import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trophy, Target, Zap, Flame, BarChart3, Calendar, BookOpen, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, format, subDays } from "date-fns";
import type { Match, UserLanguageStats } from "@shared/schema";

interface AnalyticsProps {
  currentLanguage: string;
  isAuthenticated?: boolean;
}

export default function Analytics({ currentLanguage, isAuthenticated }: AnalyticsProps) {
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

  // Study recommendations data
  const hasRecommendations = studyRecommendations && 
    studyRecommendations.totalMatches > 0 && 
    (studyRecommendations.grammarIssues.length > 0 || 
     studyRecommendations.vocabularyTips.length > 0 || 
     studyRecommendations.generalAdvice.length > 0);

  // Recent performance (last 10 matches)
  const recentMatches = matches.slice(0, 10);
  const recentWins = recentMatches.filter(m => m.result === 'win').length;
  const recentWinRate = recentMatches.length > 0 ? Math.round((recentWins / recentMatches.length) * 100) : 0;

  // Skill breakdown data for pie chart
  const skillData = skillProgress ? [
    { name: 'Grammar', value: skillProgress.grammar, color: '#3b82f6' },
    { name: 'Fluency', value: skillProgress.fluency, color: '#10b981' },
    { name: 'Vocabulary', value: skillProgress.vocabulary, color: '#f59e0b' },
    { name: 'Naturalness', value: skillProgress.naturalness, color: '#8b5cf6' },
  ] : [];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Skill Breakdown */}
        {skillData.length > 0 && skillData.some(s => s.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--card-border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Performance */}
      {recentMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Performance (Last 10 Matches)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Recent Win Rate</p>
                <p className="text-2xl font-bold font-mono">{recentWinRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recentWins}W - {recentMatches.length - recentWins}L
                </p>
              </div>
              <div className="flex gap-1">
                {recentMatches.map((match, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      match.result === 'win' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}
                    title={`vs ${match.opponent} - ${match.result === 'win' ? 'Win' : 'Loss'}`}
                  >
                    {match.result === 'win' ? 'W' : 'L'}
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
}
