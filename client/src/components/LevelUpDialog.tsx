import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles } from "lucide-react";
import { FluencyLevelInfo } from "@shared/fluencyLevels";

interface LevelUpDialogProps {
  open: boolean;
  onClose: () => void;
  newLevel: FluencyLevelInfo;
  oldLevel: FluencyLevelInfo;
}

export default function LevelUpDialog({ open, onClose, newLevel, oldLevel }: LevelUpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-level-up">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-highlight to-accent flex items-center justify-center animate-pulse">
                  <Trophy className="w-10 h-10 text-highlight-foreground" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-highlight animate-bounce" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Level Up!</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Congratulations on your progress
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Level Progression */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2 text-base px-3 py-1">
                {oldLevel.level}
              </Badge>
              <p className="text-xs text-muted-foreground">{oldLevel.name}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-border"></div>
              <Star className="w-5 h-5 text-highlight" />
              <div className="h-px w-8 bg-border"></div>
            </div>
            
            <div className="text-center">
              <Badge 
                className="mb-2 text-base px-3 py-1"
                style={{ 
                  backgroundColor: 'hsl(var(--highlight))', 
                  color: 'hsl(var(--highlight-foreground))' 
                }}
              >
                {newLevel.level}
              </Badge>
              <p className="text-xs text-muted-foreground">{newLevel.name}</p>
            </div>
          </div>

          {/* New Level Info */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <h3 className="font-semibold mb-2">{newLevel.name} Level</h3>
            <p className="text-sm text-muted-foreground">
              {newLevel.description}
            </p>
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            onClick={onClose}
            data-testid="button-level-up-continue"
          >
            Continue Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
