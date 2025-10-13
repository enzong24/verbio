export type Difficulty = "Easy" | "Medium" | "Hard";

interface EloResult {
  newElo: number;
  eloChange: number;
}

const BASE_ELO_CHANGES = {
  Easy: 6,
  Medium: 8,
  Hard: 12,
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
