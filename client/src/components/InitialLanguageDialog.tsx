import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InitialLanguageDialogProps {
  open: boolean;
  onComplete: (language: string) => void;
}

const languageOptions = [
  {
    id: "Chinese",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    description: "Learn Mandarin Chinese"
  },
  {
    id: "Spanish",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    description: "Learn Spanish"
  },
  {
    id: "Italian",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    description: "Learn Italian"
  }
];

export default function InitialLanguageDialog({ open, onComplete }: InitialLanguageDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfirm = () => {
    if (selectedLanguage) {
      toast({
        title: "Language Selected!",
        description: `You've chosen to learn ${selectedLanguage}.`
      });
      onComplete(selectedLanguage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Choose Your Language
          </DialogTitle>
          <DialogDescription>
            Select the language you want to learn
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {languageOptions.map((language) => {
            const isSelected = selectedLanguage === language.id;
            
            return (
              <Card
                key={language.id}
                className={`p-4 cursor-pointer transition-all hover-elevate ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedLanguage(language.id)}
                data-testid={`card-language-${language.id.toLowerCase()}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {language.flag}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {language.name} <span className="text-muted-foreground">({language.nativeName})</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{language.description}</p>
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
          disabled={!selectedLanguage}
          className="w-full"
          data-testid="button-confirm-language"
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
