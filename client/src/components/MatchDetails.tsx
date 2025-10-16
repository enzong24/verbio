import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, CheckCircle2, AlertCircle, Lightbulb, Trophy, TrendingUp } from "lucide-react";
import type { Match, Message, MessageAnalysis } from "@shared/schema";
import TextWithPinyin from "@/components/TextWithPinyin";

interface MatchDetailsProps {
  match: Match;
  onClose: () => void;
  language?: string;
}

export default function MatchDetails({ match, onClose, language = "Chinese" }: MatchDetailsProps) {
  const [expandedMessageIndex, setExpandedMessageIndex] = useState<number | null>(null);
  
  const conversation = (match.conversation as Message[]) || [];
  const detailedFeedback = (match.detailedFeedback as MessageAnalysis[]) || [];
  
  const getFeedbackForMessage = (index: number): MessageAnalysis | undefined => {
    return detailedFeedback.find(feedback => feedback.messageIndex === index);
  };

  const toggleMessageExpansion = (index: number) => {
    setExpandedMessageIndex(expandedMessageIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b border-card-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Match Details</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {match.topic || "Unknown Topic"} • {match.difficulty} • {match.language}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-match-details"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Match Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <Trophy className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="font-bold text-lg">{match.overallScore}</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-success" />
                  <div className="font-bold text-lg">{match.grammarScore}</div>
                  <div className="text-xs text-muted-foreground">Grammar</div>
                </div>
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <div className="font-bold text-lg">{match.fluencyScore}</div>
                  <div className="text-xs text-muted-foreground">Fluency</div>
                </div>
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <div className="font-bold text-lg">{match.vocabularyScore}</div>
                  <div className="text-xs text-muted-foreground">Vocabulary</div>
                </div>
              </div>

              {/* Conversation with Feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Conversation & AI Feedback
                </h3>
                
                {conversation.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No conversation data available for this match.
                  </p>
                )}

                {conversation.map((message, index) => {
                  const feedback = getFeedbackForMessage(index);
                  const isUser = message.sender === "user";
                  const isExpanded = expandedMessageIndex === index;
                  const hasFeedback = feedback && (
                    (feedback.grammarCorrections && feedback.grammarCorrections.length > 0) ||
                    (feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0) ||
                    feedback.sentenceImprovement ||
                    (feedback.strengths && feedback.strengths.length > 0) ||
                    (feedback.improvements && feedback.improvements.length > 0)
                  );

                  return (
                    <div
                      key={index}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={isUser ? "bg-primary/10 text-primary" : "bg-muted"}>
                            {isUser ? "You" : match.opponent.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div
                            className={`rounded-lg p-3 ${
                              isUser 
                                ? "bg-primary/10 border border-primary/20" 
                                : "bg-muted border border-card-border"
                            }`}
                          >
                            {language === "Chinese" ? (
                              <TextWithPinyin text={message.text} language={language} />
                            ) : (
                              <p className="text-sm">{message.text}</p>
                            )}
                          </div>

                          {isUser && hasFeedback && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleMessageExpansion(index)}
                                className="text-xs"
                                data-testid={`button-toggle-feedback-${index}`}
                              >
                                {isExpanded ? "Hide" : "Show"} AI Feedback
                                {!isExpanded && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {(feedback.grammarCorrections?.length || 0) + (feedback.vocabularySuggestions?.length || 0) + (feedback.sentenceImprovement ? 1 : 0)}
                                  </Badge>
                                )}
                              </Button>

                              {isExpanded && feedback && (
                                <Card className="mt-2 border-primary/20 bg-primary/5">
                                  <CardContent className="p-4 space-y-3">
                                    {/* Grammar Corrections */}
                                    {feedback.grammarCorrections && feedback.grammarCorrections.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                          <AlertCircle className="w-4 h-4 text-destructive" />
                                          Grammar Corrections
                                        </h4>
                                        <div className="space-y-2">
                                          {feedback.grammarCorrections.map((correction, i) => (
                                            <div key={i} className="text-xs bg-background/50 p-2 rounded">
                                              <div className="flex items-start gap-2 mb-1">
                                                <span className="text-destructive line-through">
                                                  {language === "Chinese" ? (
                                                    <TextWithPinyin text={correction.original} language={language} />
                                                  ) : (
                                                    correction.original
                                                  )}
                                                </span>
                                                <span>→</span>
                                                <span className="text-success font-medium">
                                                  {language === "Chinese" ? (
                                                    <TextWithPinyin text={correction.corrected} language={language} />
                                                  ) : (
                                                    correction.corrected
                                                  )}
                                                </span>
                                              </div>
                                              <p className="text-muted-foreground">{correction.explanation}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Sentence Improvement */}
                                    {feedback.sentenceImprovement && (
                                      <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                          <Lightbulb className="w-4 h-4 text-blue-500" />
                                          How a Native Would Say It
                                        </h4>
                                        <div className="text-xs bg-background/50 p-3 rounded space-y-2">
                                          <div>
                                            <span className="text-muted-foreground font-medium">Your sentence:</span>
                                            <div className="mt-1 p-2 bg-muted/50 rounded">
                                              {language === "Chinese" ? (
                                                <TextWithPinyin text={feedback.sentenceImprovement.original} language={language} />
                                              ) : (
                                                feedback.sentenceImprovement.original
                                              )}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-success font-medium">Native speaker version:</span>
                                            <div className="mt-1 p-2 bg-success/10 rounded font-medium">
                                              {language === "Chinese" ? (
                                                <TextWithPinyin text={feedback.sentenceImprovement.improved} language={language} />
                                              ) : (
                                                feedback.sentenceImprovement.improved
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-muted-foreground pt-1 border-t border-border">
                                            {feedback.sentenceImprovement.explanation}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Vocabulary Suggestions */}
                                    {feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                          <Lightbulb className="w-4 h-4 text-warning" />
                                          Better Vocabulary
                                        </h4>
                                        <div className="space-y-2">
                                          {feedback.vocabularySuggestions.map((suggestion, i) => (
                                            <div key={i} className="text-xs bg-background/50 p-2 rounded">
                                              <div className="flex items-start gap-2 mb-1">
                                                <span className="text-muted-foreground">
                                                  {language === "Chinese" ? (
                                                    <TextWithPinyin text={suggestion.word} language={language} />
                                                  ) : (
                                                    suggestion.word
                                                  )}
                                                </span>
                                                <span>→</span>
                                                <span className="text-primary font-medium">
                                                  {language === "Chinese" ? (
                                                    <TextWithPinyin text={suggestion.betterAlternative} language={language} />
                                                  ) : (
                                                    suggestion.betterAlternative
                                                  )}
                                                </span>
                                              </div>
                                              <p className="text-muted-foreground">{suggestion.reason}</p>
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
                                          What You Did Well
                                        </h4>
                                        <ul className="text-xs space-y-1">
                                          {feedback.strengths.map((strength, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <span className="text-success">•</span>
                                              <span>{strength}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Improvements */}
                                    {feedback.improvements && feedback.improvements.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                          <TrendingUp className="w-4 h-4 text-primary" />
                                          Areas to Improve
                                        </h4>
                                        <ul className="text-xs space-y-1">
                                          {feedback.improvements.map((improvement, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <span className="text-primary">•</span>
                                              <span>{improvement}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
