// Bot Elo ranges based on difficulty
export function getBotElo(difficulty: string): number {
  const ranges: Record<string, { min: number; max: number }> = {
    Beginner: { min: 600, max: 800 },   // Very low Elo for absolute beginners
    Easy: { min: 800, max: 1000 },
    Medium: { min: 1100, max: 1300 },
    Hard: { min: 1300, max: 1600 },
  };

  const range = ranges[difficulty] || ranges.Medium;
  // Return a random Elo within the difficulty range
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// Bot target accuracy by difficulty (affects grading expectations)
export function getBotTargetAccuracy(difficulty: string): number {
  const accuracyRanges: Record<string, { min: number; max: number }> = {
    Beginner: { min: 40, max: 52 }, // Bot performs at 40-52% for Beginner (many mistakes)
    Easy: { min: 55, max: 67 },     // Bot performs at 55-67% for Easy (beginner level)
    Medium: { min: 68, max: 78 },   // Bot performs at 68-78% for Medium (intermediate)
    Hard: { min: 82, max: 92 },     // Bot performs at 82-92% for Hard (advanced)
  };

  const range = accuracyRanges[difficulty] || accuracyRanges.Medium;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}
