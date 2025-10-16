import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, MessageCircle, Award } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InitialLevelDialogProps {
  open: boolean;
  language: string;
  onComplete: () => void;
}

const levelOptions = [
  {
    id: "beginner",
    title: "New Learner",
    description: "Just starting with the language",
    elo: 700,
    icon: BookOpen,
    color: "text-blue-500"
  },
  {
    id: "conversational",
    title: "Conversational",
    description: "Can hold basic conversations",
    elo: 1000,
    icon: MessageCircle,
    color: "text-green-500"
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Comfortable with complex topics",
    elo: 1300,
    icon: Award,
    color: "text-purple-500"
  }
];

export default function InitialLevelDialog({ open, language, onComplete }: InitialLevelDialogProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const { toast } = useToast();

  const setInitialLevelMutation = useMutation({
    mutationFn: async (elo: number) => {
      return apiRequest("POST", "/api/user/set-initial-level", { language, elo });
    },
    onSuccess: () => {
      toast({
        title: "Level Set!",
        description: `Your starting level for ${language} has been set.`
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set initial level. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleConfirm = () => {
    const level = levelOptions.find(l => l.id === selectedLevel);
    if (level) {
      setInitialLevelMutation.mutate(level.elo);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Choose Your Starting Level</DialogTitle>
          <DialogDescription>
            Select your current proficiency in {language} to get matched with appropriate opponents
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {levelOptions.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;
            
            return (
              <Card
                key={level.id}
                className={`p-4 cursor-pointer transition-all hover-elevate ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedLevel(level.id)}
                data-testid={`card-level-${level.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center ${level.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{level.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{level.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedLevel || setInitialLevelMutation.isPending}
          className="w-full"
          data-testid="button-confirm-level"
        >
          {setInitialLevelMutation.isPending ? "Setting Level..." : "Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
