import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface BotProfile {
  id: string;
  name: string;
  languages: string[];
  backstory: string;
  personality: string;
  description: string;
}

interface BotSelectionProps {
  open: boolean;
  onClose: () => void;
  language: string;
  onSelectBot: (botId: string) => void;
}

export default function BotSelection({ open, onClose, language, onSelectBot }: BotSelectionProps) {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  const { data: bots = [], isLoading } = useQuery<BotProfile[]>({
    queryKey: [`/api/bots?language=${language}`],
    enabled: open,
  });

  const handleSelect = () => {
    if (selectedBotId) {
      onSelectBot(selectedBotId);
      onClose();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Your Practice Partner</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Practice {language} with a native speaker
          </p>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          {isLoading ? (
            <div className="space-y-3 pr-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {bots.map((bot) => (
                <Card
                  key={bot.id}
                  className={`cursor-pointer transition-all hover-elevate ${
                    selectedBotId === bot.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedBotId(bot.id)}
                  data-testid={`bot-card-${bot.id}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="shrink-0">
                        <AvatarFallback>{getInitials(bot.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold">{bot.name}</h3>
                          <Badge variant="secondary" className="text-xs">Native Speaker</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{bot.description}</p>
                        
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {bot.backstory}
                          </p>
                        </div>

                        {bot.languages.length > 1 && (
                          <div className="flex gap-1 flex-wrap pt-1">
                            {bot.languages.map(lang => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-bot-selection"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={!selectedBotId}
            data-testid="button-confirm-bot-selection"
          >
            Start Practice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
