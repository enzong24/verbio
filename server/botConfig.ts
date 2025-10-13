// Bot Elo ranges based on difficulty
export function getBotElo(difficulty: string): number {
  const ranges: Record<string, { min: number; max: number }> = {
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
    Easy: { min: 60, max: 70 },   // Bot performs at 60-70% for Easy
    Medium: { min: 65, max: 75 }, // Bot performs at 65-75% for Medium
    Hard: { min: 70, max: 80 },   // Bot performs at 70-80% for Hard
  };

  const range = accuracyRanges[difficulty] || accuracyRanges.Medium;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}
