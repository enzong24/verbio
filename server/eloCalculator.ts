export type Difficulty = "Easy" | "Medium" | "Hard";

interface EloResult {
  newElo: number;
  eloChange: number;
}

const BASE_ELO_CHANGES = {
  Easy: 8,
  Medium: 12,
  Hard: 16,
};

export function calculateEloChange(
  currentElo: number,
  result: "win" | "loss",
  difficulty: Difficulty
): EloResult {
  const baseChange = BASE_ELO_CHANGES[difficulty];
  const eloChange = result === "win" ? baseChange : -baseChange;
  const newElo = Math.max(0, currentElo + eloChange); // Elo can't go below 0

  return {
    newElo,
    eloChange,
  };
}
