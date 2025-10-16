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
    Beginner: { min: 50, max: 60 }, // Bot performs at 50-60% for Beginner (many mistakes)
    Easy: { min: 60, max: 70 },     // Bot performs at 60-70% for Easy (beginner level)
    Medium: { min: 70, max: 80 },   // Bot performs at 70-80% for Medium (intermediate)
    Hard: { min: 80, max: 90 },     // Bot performs at 80-90% for Hard (advanced)
  };

  const range = accuracyRanges[difficulty] || accuracyRanges.Medium;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}
