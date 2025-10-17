import { useState, useEffect } from "react";
import { X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Check if already running as installed app (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    
    // Check if user dismissed the prompt before
    const wasDismissed = localStorage.getItem('installPromptDismissed') === 'true';
    
    // Detect iOS or Android
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const android = /Android/i.test(navigator.userAgent);
    
    setIsIOS(ios);
    setIsAndroid(android);
    
    // Show prompt only if: mobile, not standalone, and not previously dismissed
    if (isMobile && !isStandalone && !wasDismissed) {
      // Check if user is a new user (hasn't seen How to Play dialog yet)
      const hasSeenHowToPlay = localStorage.getItem('hasSeenHowToPlay') === 'true';
      
      if (hasSeenHowToPlay) {
        // Existing user - show prompt after short delay
        setTimeout(() => setShowPrompt(true), 2000);
      } else {
        // New user - wait longer to allow other dialogs to show first
        // Check periodically if How to Play dialog has been seen
        const checkInterval = setInterval(() => {
          const nowHasSeen = localStorage.getItem('hasSeenHowToPlay') === 'true';
          if (nowHasSeen) {
            clearInterval(checkInterval);
            // Show install prompt after How to Play dialog is dismissed
            setTimeout(() => setShowPrompt(true), 1000);
          }
        }, 500);
        
        // Fallback: show after 15 seconds even if How to Play isn't dismissed
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!showPrompt) {
            setShowPrompt(true);
          }
        }, 15000);
        
        return () => clearInterval(checkInterval);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="p-4 shadow-lg border-primary/30 bg-card/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Install Verbio as an App</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get the best experience! Add Verbio to your home screen for quick access.
            </p>
            
            {isIOS && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Share className="w-4 h-4 text-primary" />
                  <span>Tap the Share button</span>
                </div>
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>Select "Add to Home Screen"</span>
                </div>
              </div>
            )}
            
            {isAndroid && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>Tap menu (⋮) → "Add to Home screen"</span>
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleDismiss}
            data-testid="button-dismiss-install-prompt"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
