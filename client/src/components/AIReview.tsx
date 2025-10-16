import { useState } from "react";
import { ArrowLeft, Brain, MessageSquare, AlertCircle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GradingResult, MessageAnalysis } from "@shared/schema";
import TextWithPinyin from "@/components/TextWithPinyin";

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
  const [expandedMessageIndex, setExpandedMessageIndex] = useState<number | null>(null);
  
  // Extract premium message-by-message feedback if available
  const messageAnalysis = (gradingResult?.messageAnalysis as MessageAnalysis[]) || [];
  const hasPremiumFeedback = messageAnalysis.length > 0;
  
  const getFeedbackForMessage = (index: number): MessageAnalysis | undefined => {
    return messageAnalysis.find(feedback => feedback.messageIndex === index);
  };

  const toggleMessageExpansion = (index: number) => {
    setExpandedMessageIndex(expandedMessageIndex === index ? null : index);
  };
  
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
            {/* Conversation History with Premium Feedback */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation {hasPremiumFeedback && <Badge variant="secondary" className="text-xs">Premium Analysis</Badge>}
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {messages.map((message, idx) => {
                  const isUser = message.sender === "user";
                  const feedback = getFeedbackForMessage(idx);
                  const isExpanded = expandedMessageIndex === idx;
                  const hasFeedback = feedback && (
                    (feedback.grammarCorrections && feedback.grammarCorrections.length > 0) ||
                    (feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0) ||
                    (feedback.sentenceImprovement && typeof feedback.sentenceImprovement === 'object') ||
                    (feedback.strengths && feedback.strengths.length > 0) ||
                    (feedback.improvements && feedback.improvements.length > 0)
                  );

                  return (
                    <div key={idx}>
                      <div
                        className={`p-3 rounded-md ${
                          isUser
                            ? "bg-primary/10 ml-8"
                            : "bg-muted mr-8"
                        }`}
                        data-testid={`message-${idx}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isUser ? "default" : "secondary"} className="text-xs">
                            {isUser ? "You" : "Bot"}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.text}</p>

                        {/* Show AI Feedback button for user messages with premium feedback */}
                        {isUser && hasFeedback && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleMessageExpansion(idx)}
                              className="text-xs"
                              data-testid={`button-toggle-feedback-${idx}`}
                            >
                              {isExpanded ? "Hide" : "Show"} AI Feedback
                              {!isExpanded && (
                                <Badge variant="outline" className="ml-2 text-xs px-2">
                                  {(feedback.grammarCorrections?.length || 0) + (feedback.vocabularySuggestions?.length || 0) + (feedback.sentenceImprovement && typeof feedback.sentenceImprovement === 'object' ? 1 : 0)} insights
                                </Badge>
                              )}
                            </Button>

                            {isExpanded && feedback && (
                              <Card className="mt-2 border-primary/20 bg-primary/5">
                                <CardContent className="p-4 space-y-3">
                                  {/* Grammar Corrections */}
                                  {feedback.grammarCorrections && feedback.grammarCorrections.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        Grammar Analysis ({feedback.grammarCorrections.length})
                                      </h4>
                                      <div className="space-y-3">
                                        {feedback.grammarCorrections.map((correction, i) => (
                                          <div key={i} className="text-xs bg-background/50 p-3 rounded-md border border-border/50">
                                            <div className="flex items-start gap-2 mb-2">
                                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">#{i + 1}</Badge>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-destructive line-through">
                                                    {language === "Chinese" ? (
                                                      <TextWithPinyin text={correction.original} language={language} />
                                                    ) : (
                                                      correction.original
                                                    )}
                                                  </span>
                                                  <span className="text-muted-foreground">→</span>
                                                  <span className="text-success font-medium">
                                                    {language === "Chinese" ? (
                                                      <TextWithPinyin text={correction.corrected} language={language} />
                                                    ) : (
                                                      correction.corrected
                                                    )}
                                                  </span>
                                                </div>
                                                <p className="text-muted-foreground mt-1">{correction.explanation}</p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Native Speaker Comparison */}
                                  {feedback.sentenceImprovement && (
                                    <div>
                                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        Native Speaker Comparison
                                      </h4>
                                      <div className="text-xs bg-background/50 p-3 rounded-md border border-border/50">
                                        <p className="text-muted-foreground mb-2">How a native speaker would say it:</p>
                                        <p className="font-medium">
                                          {language === "Chinese" ? (
                                            <TextWithPinyin text={feedback.sentenceImprovement.improved} language={language} />
                                          ) : (
                                            feedback.sentenceImprovement.improved
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Vocabulary Enhancement */}
                                  {feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                        Vocabulary Enhancement ({feedback.vocabularySuggestions.length})
                                      </h4>
                                      <div className="space-y-2">
                                        {feedback.vocabularySuggestions.map((suggestion, i) => (
                                          <div key={i} className="text-xs bg-background/50 p-3 rounded-md border border-border/50">
                                            <div className="flex items-start gap-2">
                                              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">#{i + 1}</Badge>
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-medium">
                                                    {language === "Chinese" ? (
                                                      <TextWithPinyin text={suggestion.betterAlternative} language={language} />
                                                    ) : (
                                                      suggestion.betterAlternative
                                                    )}
                                                  </span>
                                                  {suggestion.word && (
                                                    <>
                                                      <span className="text-muted-foreground text-[10px]">instead of</span>
                                                      <span className="text-muted-foreground">
                                                        {language === "Chinese" ? (
                                                          <TextWithPinyin text={suggestion.word} language={language} />
                                                        ) : (
                                                          suggestion.word
                                                        )}
                                                      </span>
                                                    </>
                                                  )}
                                                </div>
                                                <p className="text-muted-foreground">{suggestion.reason}</p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Strengths */}
                                  {feedback.strengths && feedback.strengths.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                        Strengths ({feedback.strengths.length})
                                      </h4>
                                      <div className="space-y-1">
                                        {feedback.strengths.map((strength, i) => (
                                          <div key={i} className="text-xs bg-success/5 p-2 rounded-md flex items-start gap-2">
                                            <span className="text-success">•</span>
                                            <span className="text-muted-foreground">{strength}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Study Recommendations */}
                                  {feedback.improvements && feedback.improvements.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-primary" />
                                        Study Recommendations ({feedback.improvements.length})
                                      </h4>
                                      <div className="space-y-1">
                                        {feedback.improvements.map((improvement, i) => (
                                          <div key={i} className="text-xs bg-primary/5 p-2 rounded-md flex items-start gap-2">
                                            <span className="text-primary">•</span>
                                            <span className="text-muted-foreground">{improvement}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General AI Feedback for non-premium users */}
            {!hasPremiumFeedback && gradingResult && (
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
