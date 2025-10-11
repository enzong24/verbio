interface VocabularyBadgeProps {
  chinese: string;
  pinyin: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export default function VocabularyBadge({ chinese, pinyin, variant = "secondary", className = "" }: VocabularyBadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-background"
  };

  return (
    <div className={`inline-flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      <span className="text-[10px] opacity-70 leading-none">{pinyin}</span>
      <span className="leading-none">{chinese}</span>
    </div>
  );
}
