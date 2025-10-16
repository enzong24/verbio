import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface StreakNotificationProps {
  type: "win" | "daily";
  streakCount: number;
  isVisible: boolean;
  onClose: () => void;
  playSound?: () => void;
}

export function StreakNotification({ type, streakCount, isVisible, onClose, playSound }: StreakNotificationProps) {
  const isWinStreak = type === "win";
  const Icon = isWinStreak ? Flame : Zap;
  const title = isWinStreak ? "Win Streak!" : "Daily Streak!";
  const message = isWinStreak 
    ? `${streakCount} consecutive wins! Keep it up!`
    : `${streakCount} days in a row! Come back tomorrow!`;

  // Play sound when notification appears
  useEffect(() => {
    if (isVisible && playSound) {
      playSound();
    }
  }, [isVisible, playSound]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.3 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 25
          }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
          data-testid="notification-streak"
        >
          <Card className={cn(
            "bg-card shadow-2xl min-w-[300px]",
            isWinStreak ? "border-orange-500/50" : "border-blue-500/50"
          )}>
            <div className="p-4 flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                }}
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  isWinStreak ? "bg-orange-500/10" : "bg-blue-500/10"
                )}
              >
                <Icon className={cn(
                  "w-8 h-8",
                  isWinStreak ? "text-orange-500" : "text-blue-500"
                )} />
              </motion.div>
              
              <div className="flex-1">
                <div className="font-bold text-lg">{title}</div>
                <div className="text-sm text-muted-foreground">{message}</div>
              </div>

              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-close-streak-notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
