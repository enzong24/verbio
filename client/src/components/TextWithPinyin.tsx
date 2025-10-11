import pinyin from "pinyin";

interface TextWithPinyinProps {
  text: string;
  language: string;
  className?: string;
}

export default function TextWithPinyin({ text, language, className = "" }: TextWithPinyinProps) {
  // Only show pinyin for Chinese
  if (language !== "Chinese") {
    return <span className={className}>{text}</span>;
  }

  // Convert Chinese text to pinyin
  const pinyinArray = pinyin(text, {
    style: pinyin.STYLE_TONE,
    segment: true,
  });

  // Split text into characters/words for display
  const chars = text.split('');
  const words: Array<{ char: string; pinyin: string }> = [];
  
  let pinyinIndex = 0;
  chars.forEach((char) => {
    // Check if character is Chinese
    if (/[\u4e00-\u9fa5]/.test(char)) {
      const pinyinForChar = pinyinArray[pinyinIndex]?.[0] || '';
      words.push({ char, pinyin: pinyinForChar });
      pinyinIndex++;
    } else {
      words.push({ char, pinyin: '' });
    }
  });

  return (
    <span className={`inline-flex flex-wrap gap-x-1 ${className}`}>
      {words.map((word, idx) => (
        <span key={idx} className="inline-flex flex-col items-center">
          {word.pinyin && (
            <span className="text-[10px] leading-tight opacity-70 whitespace-nowrap">
              {word.pinyin}
            </span>
          )}
          <span>{word.char}</span>
        </span>
      ))}
    </span>
  );
}
