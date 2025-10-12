import { Button } from "@/components/ui/button";

interface AccentKeyboardProps {
  language: string;
  onAccentClick: (accent: string) => void;
}

const SPANISH_ACCENTS = [
  { char: "á", label: "á" },
  { char: "é", label: "é" },
  { char: "í", label: "í" },
  { char: "ó", label: "ó" },
  { char: "ú", label: "ú" },
  { char: "ñ", label: "ñ" },
  { char: "ü", label: "ü" },
  { char: "¿", label: "¿" },
  { char: "¡", label: "¡" },
];

const ITALIAN_ACCENTS = [
  { char: "à", label: "à" },
  { char: "è", label: "è" },
  { char: "é", label: "é" },
  { char: "ì", label: "ì" },
  { char: "ò", label: "ò" },
  { char: "ù", label: "ù" },
];

export default function AccentKeyboard({ language, onAccentClick }: AccentKeyboardProps) {
  const accents = language === "Spanish" ? SPANISH_ACCENTS : language === "Italian" ? ITALIAN_ACCENTS : [];

  if (accents.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 pb-2">
      {accents.map((accent) => (
        <Button
          key={accent.char}
          variant="outline"
          size="sm"
          onClick={() => onAccentClick(accent.char)}
          className="h-7 w-7 p-0 text-sm font-medium"
          type="button"
          data-testid={`button-accent-${accent.char}`}
        >
          {accent.label}
        </Button>
      ))}
    </div>
  );
}
