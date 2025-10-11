import { Bot, Book, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  vocabulary: string[];
}

interface PracticeModeProps {
  topics?: Topic[];
  onSelectTopic?: (topicId: string) => void;
}

export default function PracticeMode({
  topics = [
    {
      id: "1",
      title: "Travel & Tourism",
      difficulty: "Intermediate",
      vocabulary: ["旅行", "目的地", "探索", "冒险", "文化"]
    },
    {
      id: "2",
      title: "Food & Dining",
      difficulty: "Beginner",
      vocabulary: ["美味", "菜谱", "餐厅", "味道", "风味"]
    },
    {
      id: "3",
      title: "Business & Work",
      difficulty: "Advanced",
      vocabulary: ["同事", "截止日期", "项目", "会议", "策略"]
    },
    {
      id: "4",
      title: "Family & Friends",
      difficulty: "Beginner",
      vocabulary: ["家庭", "朋友", "关系", "一起", "庆祝"]
    },
    {
      id: "5",
      title: "Technology",
      difficulty: "Intermediate",
      vocabulary: ["设备", "软件", "创新", "数字", "连接"]
    },
    {
      id: "6",
      title: "Health & Wellness",
      difficulty: "Intermediate",
      vocabulary: ["锻炼", "营养", "健康", "养生", "健身"]
    },
  ],
  onSelectTopic
}: PracticeModeProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-success";
      case "Intermediate": return "text-warning";
      case "Advanced": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return <Book className="w-4 h-4" />;
      case "Intermediate": return <Zap className="w-4 h-4" />;
      case "Advanced": return <Bot className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Practice Mode</h1>
        </div>
        <p className="text-muted-foreground">
          Warm up with AI bots and learn new topics at your own pace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <Card key={topic.id} className="border-card-border hover-elevate transition-all" data-testid={`topic-card-${topic.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <Badge
                  variant="outline"
                  className={`gap-1 ${getDifficultyColor(topic.difficulty)}`}
                >
                  {getDifficultyIcon(topic.difficulty)}
                  {topic.difficulty}
                </Badge>
              </div>
              <CardDescription>
                Practice with {topic.vocabulary.length} target words
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {topic.vocabulary.slice(0, 3).map((word) => (
                  <Badge key={word} variant="secondary" className="text-xs">
                    {word}
                  </Badge>
                ))}
                {topic.vocabulary.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{topic.vocabulary.length - 3} more
                  </Badge>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => onSelectTopic?.(topic.id)}
                data-testid={`button-start-${topic.id}`}
              >
                <Bot className="w-4 h-4 mr-2" />
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
