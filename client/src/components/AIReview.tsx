import { ArrowLeft, Brain, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GradingResult } from "@shared/schema";

interface Message {
  sender: string;
  text: string;
  timestamp: number;
}

interface AIReviewProps {
  messages?: Message[];
  gradingResult?: GradingResult;
  topic?: string;
  language?: string;
  onBack?: () => void;
}

export default function AIReview({
  messages = [],
  gradingResult,
  topic = "Conversation",
  language = "Chinese",
  onBack
}: AIReviewProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-card-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI Review & Analysis
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Topic: {topic} · Language: {language}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Conversation History */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation History
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-md ${
                      message.sender === "user"
                        ? "bg-primary/10 ml-8"
                        : "bg-muted mr-8"
                    }`}
                    data-testid={`message-${idx}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={message.sender === "user" ? "default" : "secondary"} className="text-xs">
                        {message.sender === "user" ? "You" : "AI"}
                      </Badge>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Feedback */}
            {gradingResult && (
              <div>
                <h3 className="font-semibold mb-3">AI Feedback & Suggestions</h3>
                <div className="space-y-2">
                  {Array.isArray(gradingResult.feedback) ? (
                    gradingResult.feedback.map((item, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-md text-sm" data-testid={`feedback-${idx}`}>
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {gradingResult.feedback}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            {gradingResult && (
              <div>
                <h3 className="font-semibold mb-3">Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-muted rounded-md text-center">
                    <div className="text-2xl font-mono font-bold">{gradingResult.grammar}%</div>
                    <div className="text-xs text-muted-foreground">Grammar</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-center">
                    <div className="text-2xl font-mono font-bold">{gradingResult.fluency}%</div>
                    <div className="text-xs text-muted-foreground">Fluency</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-center">
                    <div className="text-2xl font-mono font-bold">{gradingResult.vocabulary}%</div>
                    <div className="text-xs text-muted-foreground">Vocabulary</div>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-center">
                    <div className="text-2xl font-mono font-bold">{gradingResult.naturalness}%</div>
                    <div className="text-xs text-muted-foreground">Naturalness</div>
                  </div>
                </div>
              </div>
            )}

            <Button className="w-full" onClick={onBack} data-testid="button-back-to-results">
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
