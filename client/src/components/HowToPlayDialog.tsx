import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface HowToPlayDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function HowToPlayDialog({ open, onClose }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-how-to-play">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription>
            Learn a language through conversation battles
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><strong>1. Choose your mode:</strong> Practice (no pressure) or Competitive (ranked)</li>
            <li><strong>2. Select language & difficulty</strong></li>
            <li><strong>3. Use vocabulary words</strong> in your answers - they highlight when typed</li>
            <li><strong>4. Answer within the time limit</strong> to score points</li>
            <li><strong>5. Win matches</strong> to increase your Fluency Score and climb the leaderboard</li>
          </ul>
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
