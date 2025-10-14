export type Difficulty = "Beginner" | "Easy" | "Medium" | "Hard";

interface EloResult {
  newElo: number;
  eloChange: number;
  result: "win" | "loss" | "draw";
}

/**
 * Calculate K-factor based on Elo rating (Chess.com style)
 * Higher K-factor for lower ratings, lower K-factor for higher ratings
 */
function getKFactor(elo: number): number {
  if (elo < 1200) return 40;
  if (elo < 1800) return 32;
  if (elo < 2400) return 24;
  return 16;
}

/**
 * Calculate Elo change based on comparative performance (user vs bot)
 * Win/loss determined by who scores higher
 * Implements Chess.com-style Elo calculation:
 * - Dynamic K-factor based on rating
 * - 300+ Elo difference rule: no gain for winning against much lower opponent, but still lose points
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

  // Get dynamic K-factor based on user's Elo
  const kFactor = getKFactor(userElo);

  // Calculate Elo change
  let eloChange = Math.round(kFactor * (actualScore - expectedScore));

  // Apply 300+ Elo difference rule (Chess.com style)
  const eloDifference = userElo - botElo;
  if (eloDifference >= 300) {
    // If user's Elo is 300+ higher than opponent
    if (result === "win") {
      // No Elo gain for beating much weaker opponent
      eloChange = 0;
    } else if (result === "loss") {
      // Double the loss penalty for losing to much weaker opponent
      eloChange = eloChange * 2;
    }
  } else if (eloDifference <= -300) {
    // If user's Elo is 300+ lower than opponent
    if (result === "win") {
      // Increased Elo gain for beating much stronger opponent
      eloChange = Math.round(eloChange * 1.5);
    }
  }

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
    Beginner: 4,
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
