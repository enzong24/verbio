import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Target, MessageCircle, BookOpen, Flame } from "lucide-react";

interface HowToPlayDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayDialog({ open, onClose }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-how-to-play">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Play Verbio</DialogTitle>
          <DialogDescription>
            Master language learning through competitive conversations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Game Basics */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Game Basics</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Choose <strong>Practice</strong> (learn without pressure) or <strong>Competitive</strong> (ranked matches)</li>
                <li>• Select your language and difficulty level</li>
                <li>• Use the provided vocabulary words to answer questions</li>
                <li>• Type vocabulary words in your responses - they'll highlight when recognized</li>
                <li>• Answer within the time limit to score points</li>
              </ul>
            </CardContent>
          </Card>

          {/* Fluency Score */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Fluency Score System</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Win matches to increase your Fluency Score (like chess ratings)</li>
                <li>• Higher scores unlock harder opponents and challenges</li>
                <li>• Practice Mode doesn't affect your score - perfect for learning</li>
                <li>• Each language has its own independent Fluency Score</li>
              </ul>
            </CardContent>
          </Card>

          {/* Streaks & Multipliers */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Streaks & Multipliers</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• <strong>Day Streak:</strong> Login daily to build streaks (+5% bonus per 3 days, max +20%)</li>
                <li>• <strong>Win Streak:</strong> Win consecutive matches (+10% bonus per 2 wins, max +30%)</li>
                <li>• Combined multiplier caps at 1.5x and applies to winning matches</li>
                <li>• Each language tracks its own streaks independently</li>
              </ul>
            </CardContent>
          </Card>

          {/* Scoring Tips */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Scoring Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Use vocabulary words to boost your score</li>
                <li>• Answer quickly for better time bonuses</li>
                <li>• Grammar and fluency matter - write naturally</li>
                <li>• Skip costs 20 points (Beginner only)</li>
                <li>• "Need help?" costs 10 points but gives hints</li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Tips */}
          <Card className="border-primary/20">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Pro Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground pl-7">
                <li>• Start with Practice Mode to learn vocabulary without pressure</li>
                <li>• Build daily login streaks for maximum multiplier bonuses</li>
                <li>• Premium users get detailed AI feedback after each match</li>
                <li>• Check Analytics to track your progress and focus areas</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} data-testid="button-close-how-to-play">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
