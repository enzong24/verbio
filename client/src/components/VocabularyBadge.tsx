import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VocabularyBadgeProps {
  chinese: string;
  pinyin: string;
  language?: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
  definition?: string;
  onDefinitionView?: () => void;
}

export default function VocabularyBadge({ 
  chinese, 
  pinyin, 
  language = "Chinese", 
  variant = "secondary", 
  className = "",
  definition,
  onDefinitionView
}: VocabularyBadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-background"
  };

  // Only show pinyin/romanization for Chinese
  const showPinyin = language === "Chinese";

  const badgeContent = (
    <div 
      className={`inline-flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${variantClasses[variant]} ${className} ${definition ? 'cursor-pointer hover-elevate active-elevate-2' : ''}`}
      data-testid={`vocab-badge-${chinese}`}
    >
      {showPinyin && <span className="text-[10px] opacity-70 leading-none">{pinyin}</span>}
      <span className="leading-none">{chinese}</span>
    </div>
  );

  if (definition && onDefinitionView) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild onClick={onDefinitionView}>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">{definition}</p>
            <p className="text-xs text-muted-foreground mt-1">-5 points for viewing</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
}
