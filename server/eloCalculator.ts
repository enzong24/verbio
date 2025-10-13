export type Difficulty = "Easy" | "Medium" | "Hard";

interface EloResult {
  newElo: number;
  eloChange: number;
  result: "win" | "loss" | "draw";
}

const K_FACTOR = 32; // Standard Elo K-factor

/**
 * Calculate Elo change based on comparative performance (user vs bot)
 * Win/loss determined by who scores higher
 * Elo change based on rating difference (standard Elo formula)
 */
export function calculateComparativeElo(
  userElo: number,
  botElo: number,
  userScore: number,
  botScore: number
): EloResult {
  // Determine result based on scores
  let result: "win" | "loss" | "draw";
  let actualScore: number; // 1 for win, 0 for loss, 0.5 for draw
  
  if (userScore > botScore) {
    result = "win";
    actualScore = 1;
  } else if (userScore < botScore) {
    result = "loss";
    actualScore = 0;
  } else {
    result = "draw";
    actualScore = 0.5;
  }

  // Calculate expected score using Elo formula
  const expectedScore = 1 / (1 + Math.pow(10, (botElo - userElo) / 400));

  // Calculate Elo change
  const eloChange = Math.round(K_FACTOR * (actualScore - expectedScore));
  const newElo = Math.max(0, userElo + eloChange);

  return {
    newElo,
    eloChange,
    result,
  };
}

// Legacy function for backward compatibility
export function calculateEloChange(
  currentElo: number,
  result: "win" | "loss",
  difficulty: Difficulty
): EloResult {
  const BASE_ELO_CHANGES = {
    Easy: 6,
    Medium: 8,
    Hard: 12,
  };
  
  const baseChange = BASE_ELO_CHANGES[difficulty];
  const eloChange = result === "win" ? baseChange : -baseChange;
  const newElo = Math.max(0, currentElo + eloChange);

  return {
    newElo,
    eloChange,
    result,
  };
}
