import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Settings, ArrowRightLeft, BookOpen, Clock, Trophy } from "lucide-react";

interface HowToPlayDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayDialog({ open, onClose }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-how-to-play">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription>
            Learn a language through conversation battles
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {/* Step 1: Setup */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">1. Choose Your Setup</h4>
              <p className="text-xs text-muted-foreground">Select Practice (learn) or Competitive (ranked), pick your language, and difficulty level</p>
            </div>
          </div>

          {/* Step 2: Question Phase */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <ArrowRightLeft className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">2. Question & Answer Phases</h4>
              <p className="text-xs text-muted-foreground mb-2">Take turns asking and answering questions</p>
              <div className="space-y-2 pl-0">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-500">Q</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1"><strong>Question Phase:</strong> Your opponent asks you a question</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-green-500">A</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1"><strong>Answer Phase:</strong> You respond using vocabulary words, then ask a question back</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Vocabulary */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">3. Use Vocabulary Words</h4>
              <p className="text-xs text-muted-foreground">Type the provided words in your answers - they highlight when recognized</p>
            </div>
          </div>

          {/* Step 4: Time */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">4. Beat the Clock</h4>
              <p className="text-xs text-muted-foreground">Answer within the time limit to score points</p>
            </div>
          </div>

          {/* Step 5: Win */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">5. Win & Rank Up</h4>
              <p className="text-xs text-muted-foreground">Score more points to win and increase your Fluency Score</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} data-testid="button-close-how-to-play">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
