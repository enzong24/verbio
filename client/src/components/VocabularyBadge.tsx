import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [isOpen, setIsOpen] = useState(false);

  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-background"
  };

  // Only show pinyin/romanization for Chinese
  const showPinyin = language === "Chinese";

  if (definition) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`inline-flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${variantClasses[variant]} ${className} cursor-pointer focus:outline-none`}
            data-testid={`vocab-badge-${chinese}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            aria-label={`${chinese} - ${definition}`}
          >
            {showPinyin && <span className="text-[10px] opacity-70 leading-none">{pinyin}</span>}
            <span className="leading-none">{chinese}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto max-w-xs p-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="text-xs">{definition}</p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div 
      className={`inline-flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${variantClasses[variant]} ${className}`}
      data-testid={`vocab-badge-${chinese}`}
    >
      {showPinyin && <span className="text-[10px] opacity-70 leading-none">{pinyin}</span>}
      <span className="leading-none">{chinese}</span>
    </div>
  );
}
