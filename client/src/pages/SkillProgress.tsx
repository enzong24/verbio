import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Brain, TrendingUp, Activity, BookOpen } from "lucide-react";
import type { Match } from "@shared/schema";

interface SkillProgressProps {
  currentLanguage: string;
  isAuthenticated?: boolean;
}

export default function SkillProgress({ currentLanguage, isAuthenticated }: SkillProgressProps) {
  // Fetch matches for the current language
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: [`/api/user/matches?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  // Fetch skill progress for authenticated users
  const { data: skillProgress } = useQuery<{
    grammar: number;
    fluency: number;
    vocabulary: number;
    naturalness: number;
  }>({
    queryKey: [`/api/user/skill-progress?language=${currentLanguage}`],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Skill Progress Unavailable</h3>
            <p className="text-muted-foreground text-sm">
              Sign in to view your detailed skill progression and performance breakdown.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate skill progression over last 20 matches
  const skillProgression = matches.slice(-20).map((match, idx) => ({
    match: idx + 1,
    grammar: match.grammarScore,
    fluency: match.fluencyScore,
    vocabulary: match.vocabularyScore,
    naturalness: match.naturalnessScore,
  }));

  // Calculate average scores by difficulty
  const difficultyGroups = matches.reduce((acc, match) => {
    if (!acc[match.difficulty]) {
      acc[match.difficulty] = { total: 0, count: 0, grammar: 0, fluency: 0, vocabulary: 0, naturalness: 0 };
    }
    acc[match.difficulty].grammar += match.grammarScore;
    acc[match.difficulty].fluency += match.fluencyScore;
    acc[match.difficulty].vocabulary += match.vocabularyScore;
    acc[match.difficulty].naturalness += match.naturalnessScore;
    acc[match.difficulty].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const difficultyData = Object.entries(difficultyGroups).map(([difficulty, data]) => ({
    difficulty,
    grammar: Math.round(data.grammar / data.count),
    fluency: Math.round(data.fluency / data.count),
    vocabulary: Math.round(data.vocabulary / data.count),
    naturalness: Math.round(data.naturalness / data.count),
  }));

  // Skill distribution pie chart data
  const skillData = skillProgress ? [
    { name: "Grammar", value: skillProgress.grammar, color: "hsl(var(--chart-1))" },
    { name: "Fluency", value: skillProgress.fluency, color: "hsl(var(--chart-2))" },
    { name: "Vocabulary", value: skillProgress.vocabulary, color: "hsl(var(--chart-3))" },
    { name: "Naturalness", value: skillProgress.naturalness, color: "hsl(var(--chart-4))" },
  ] : [];

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Skill Progress - {currentLanguage}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Detailed breakdown of your language skills and progression
        </p>
      </div>

      {/* Current Skill Levels */}
      {skillProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Skill Levels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Grammar</span>
                <span className="font-semibold font-mono">{skillProgress.grammar}%</span>
              </div>
              <Progress value={skillProgress.grammar} className="h-3" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fluency</span>
                <span className="font-semibold font-mono">{skillProgress.fluency}%</span>
              </div>
              <Progress value={skillProgress.fluency} className="h-3" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vocabulary</span>
                <span className="font-semibold font-mono">{skillProgress.vocabulary}%</span>
              </div>
              <Progress value={skillProgress.vocabulary} className="h-3" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Naturalness</span>
                <span className="font-semibold font-mono">{skillProgress.naturalness}%</span>
              </div>
              <Progress value={skillProgress.naturalness} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Distribution */}
      {skillData.length > 0 && skillData.some(s => s.value > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Skill Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
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

      {/* Skill Progression Over Time */}
      {skillProgression.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Skill Progression (Last 20 Matches)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={skillProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="match" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="grammar" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="fluency" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vocabulary" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="naturalness" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Performance by Difficulty */}
      {difficultyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Average Performance by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="difficulty" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="grammar" fill="hsl(var(--chart-1))" />
                <Bar dataKey="fluency" fill="hsl(var(--chart-2))" />
                <Bar dataKey="vocabulary" fill="hsl(var(--chart-3))" />
                <Bar dataKey="naturalness" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {matches.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-sm">
              Complete some matches to see your skill progression and performance charts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
