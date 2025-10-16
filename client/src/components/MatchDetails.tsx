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
                                  <Badge variant="outline" className="ml-2 text-xs px-2">
                                    {(feedback.grammarCorrections?.length || 0) + (feedback.vocabularySuggestions?.length || 0) + (feedback.sentenceImprovement ? 1 : 0)} insights
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
                                                  <p className="text-muted-foreground leading-relaxed mt-2 pl-2 border-l-2 border-muted">
                                                    {correction.explanation}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Sentence Improvement */}
                                    {feedback.sentenceImprovement && (
                                      <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                          <Lightbulb className="w-4 h-4 text-blue-500" />
                                          Native Speaker Comparison
                                        </h4>
                                        <div className="text-xs bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-4 rounded-md border border-blue-500/20 space-y-3">
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Your version</Badge>
                                            </div>
                                            <div className="mt-1 p-2.5 bg-muted/50 rounded border border-border/50">
                                              {language === "Chinese" ? (
                                                <TextWithPinyin text={feedback.sentenceImprovement.original} language={language} />
                                              ) : (
                                                feedback.sentenceImprovement.original
                                              )}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-success/90">Native version</Badge>
                                            </div>
                                            <div className="mt-1 p-2.5 bg-success/10 rounded border border-success/30 font-medium">
                                              {language === "Chinese" ? (
                                                <TextWithPinyin text={feedback.sentenceImprovement.improved} language={language} />
                                              ) : (
                                                feedback.sentenceImprovement.improved
                                              )}
                                            </div>
                                          </div>
                                          <div className="pt-2 border-t border-blue-500/20">
                                            <span className="text-blue-600 dark:text-blue-400 font-medium block mb-1">Why this is better:</span>
                                            <p className="text-muted-foreground leading-relaxed">
                                              {feedback.sentenceImprovement.explanation}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Vocabulary Suggestions */}
                                    {feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                                          <Lightbulb className="w-4 h-4 text-amber-500" />
                                          Vocabulary Enhancement ({feedback.vocabularySuggestions.length})
                                        </h4>
                                        <div className="space-y-3">
                                          {feedback.vocabularySuggestions.map((suggestion, i) => (
                                            <div key={i} className="text-xs bg-background/50 p-3 rounded-md border border-border/50">
                                              <div className="flex items-start gap-2 mb-2">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-500/30">#{i + 1}</Badge>
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-muted-foreground">
                                                      {language === "Chinese" ? (
                                                        <TextWithPinyin text={suggestion.word} language={language} />
                                                      ) : (
                                                        suggestion.word
                                                      )}
                                                    </span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                      {language === "Chinese" ? (
                                                        <TextWithPinyin text={suggestion.betterAlternative} language={language} />
                                                      ) : (
                                                        suggestion.betterAlternative
                                                      )}
                                                    </span>
                                                  </div>
                                                  <p className="text-muted-foreground leading-relaxed mt-2 pl-2 border-l-2 border-muted">
                                                    {suggestion.reason}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Strengths */}
                                    {feedback.strengths && feedback.strengths.length > 0 && (
                                      <div className="bg-success/5 p-3 rounded-md border border-success/20">
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                          <CheckCircle2 className="w-4 h-4 text-success" />
                                          Strengths ({feedback.strengths.length})
                                        </h4>
                                        <ul className="text-xs space-y-2">
                                          {feedback.strengths.map((strength, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                                              <span className="leading-relaxed">{strength}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Improvements */}
                                    {feedback.improvements && feedback.improvements.length > 0 && (
                                      <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                          <TrendingUp className="w-4 h-4 text-primary" />
                                          Study Recommendations ({feedback.improvements.length})
                                        </h4>
                                        <ul className="text-xs space-y-2">
                                          {feedback.improvements.map((improvement, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <TrendingUp className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                              <span className="leading-relaxed">{improvement}</span>
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
