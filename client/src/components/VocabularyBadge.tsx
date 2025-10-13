import { useState } from "react";

interface VocabularyBadgeProps {
  chinese: string;
  pinyin: string;
  language?: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
  definition?: string;
}

export default function VocabularyBadge({ 
  chinese, 
  pinyin, 
  language = "Chinese", 
  variant = "secondary", 
  className = "",
  definition
}: VocabularyBadgeProps) {
  const [showDefinition, setShowDefinition] = useState(false);

  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-background"
  };

  // Only show pinyin/romanization for Chinese
  const showPinyin = language === "Chinese";

  const handleClick = () => {
    if (definition) {
      setShowDefinition(!showDefinition);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div 
        className={`inline-flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${variantClasses[variant]} ${className} ${definition ? 'cursor-pointer hover-elevate active-elevate-2' : ''}`}
        onClick={handleClick}
        data-testid={`vocab-badge-${chinese}`}
      >
        {showPinyin && <span className="text-[10px] opacity-70 leading-none">{pinyin}</span>}
        <span className="leading-none">{chinese}</span>
      </div>
      {showDefinition && definition && (
        <div className="text-xs text-muted-foreground text-center px-1">
          {definition}
        </div>
      )}
    </div>
  );
}
