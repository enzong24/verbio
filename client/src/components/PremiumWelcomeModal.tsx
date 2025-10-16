import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Infinity, Target, MessageSquare, Sparkles } from "lucide-react";

interface PremiumWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumWelcomeModal({ isOpen, onClose }: PremiumWelcomeModalProps) {
  const [visibleBenefits, setVisibleBenefits] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setVisibleBenefits([]);
      // Stagger the appearance of benefits
      const timers = [0, 1, 2, 3].map((index) =>
        setTimeout(() => {
          setVisibleBenefits((prev) => [...prev, index]);
        }, index * 200)
      );

      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen]);

  const benefits = [
    {
      icon: Infinity,
      title: "Unlimited Matches",
      description: "No daily limits on Medium & Hard difficulties",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Target,
      title: "Topic Selection",
      description: "Choose your learning themes in practice mode",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: MessageSquare,
      title: "Detailed AI Feedback",
      description: "Comprehensive grammar and vocabulary analysis",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Sparkles,
      title: "Premium Badge",
      description: "Stand out with your exclusive PRO status",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-premium-welcome">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="animate-bounce">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Welcome to Premium!
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-6 py-2 font-bold"
            >
              <Crown className="w-5 h-5 mr-2" />
              PRO MEMBER
            </Badge>
            <p className="text-muted-foreground mt-3">
              You now have access to all premium features!
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const isVisible = visibleBenefits.includes(index);
              
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border border-border transition-all duration-500 ${
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  }`}
                  data-testid={`premium-benefit-${index}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${benefit.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${benefit.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            data-testid="button-close-premium-welcome"
          >
            Start Learning!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
