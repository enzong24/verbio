import { Bot, Book, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VocabularyBadge from "@/components/VocabularyBadge";

interface VocabWord {
  chinese: string;
  pinyin: string;
}

interface Topic {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  vocabulary: VocabWord[];
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
      vocabulary: [
        { chinese: "旅行", pinyin: "lǚxíng" },
        { chinese: "目的地", pinyin: "mùdìdì" },
        { chinese: "探索", pinyin: "tànsuǒ" },
        { chinese: "冒险", pinyin: "màoxiǎn" },
        { chinese: "文化", pinyin: "wénhuà" }
      ]
    },
    {
      id: "2",
      title: "Food & Dining",
      difficulty: "Beginner",
      vocabulary: [
        { chinese: "美味", pinyin: "měiwèi" },
        { chinese: "菜谱", pinyin: "càipǔ" },
        { chinese: "餐厅", pinyin: "cāntīng" },
        { chinese: "味道", pinyin: "wèidào" },
        { chinese: "风味", pinyin: "fēngwèi" }
      ]
    },
    {
      id: "3",
      title: "Business & Work",
      difficulty: "Advanced",
      vocabulary: [
        { chinese: "同事", pinyin: "tóngshì" },
        { chinese: "截止日期", pinyin: "jiézhǐ rìqī" },
        { chinese: "项目", pinyin: "xiàngmù" },
        { chinese: "会议", pinyin: "huìyì" },
        { chinese: "策略", pinyin: "cèlüè" }
      ]
    },
    {
      id: "4",
      title: "Family & Friends",
      difficulty: "Beginner",
      vocabulary: [
        { chinese: "家庭", pinyin: "jiātíng" },
        { chinese: "朋友", pinyin: "péngyou" },
        { chinese: "关系", pinyin: "guānxi" },
        { chinese: "一起", pinyin: "yìqǐ" },
        { chinese: "庆祝", pinyin: "qìngzhù" }
      ]
    },
    {
      id: "5",
      title: "Technology",
      difficulty: "Intermediate",
      vocabulary: [
        { chinese: "设备", pinyin: "shèbèi" },
        { chinese: "软件", pinyin: "ruǎnjiàn" },
        { chinese: "创新", pinyin: "chuàngxīn" },
        { chinese: "数字", pinyin: "shùzì" },
        { chinese: "连接", pinyin: "liánjiē" }
      ]
    },
    {
      id: "6",
      title: "Health & Wellness",
      difficulty: "Intermediate",
      vocabulary: [
        { chinese: "锻炼", pinyin: "duànliàn" },
        { chinese: "营养", pinyin: "yíngyǎng" },
        { chinese: "健康", pinyin: "jiànkāng" },
        { chinese: "养生", pinyin: "yǎngshēng" },
        { chinese: "健身", pinyin: "jiànshēn" }
      ]
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
                  <VocabularyBadge 
                    key={word.chinese} 
                    chinese={word.chinese} 
                    pinyin={word.pinyin}
                    className="text-xs"
                  />
                ))}
                {topic.vocabulary.length > 3 && (
                  <VocabularyBadge 
                    chinese={`+${topic.vocabulary.length - 3}更多`}
                    pinyin="gèng duō"
                    className="text-xs"
                  />
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
