export type FluencyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface FluencyLevelInfo {
  level: FluencyLevel;
  name: string;
  description: string;
  minElo: number;
  maxElo: number;
  color: string;
}

export const FLUENCY_LEVELS: Record<FluencyLevel, FluencyLevelInfo> = {
  A1: {
    level: "A1",
    name: "Beginner",
    description: "Can understand and use familiar everyday expressions",
    minElo: 0,
    maxElo: 899,
    color: "text-gray-500"
  },
  A2: {
    level: "A2",
    name: "Elementary",
    description: "Can communicate in simple routine tasks",
    minElo: 900,
    maxElo: 1099,
    color: "text-blue-500"
  },
  B1: {
    level: "B1",
    name: "Intermediate",
    description: "Can deal with most situations while traveling",
    minElo: 1100,
    maxElo: 1299,
    color: "text-green-500"
  },
  B2: {
    level: "B2",
    name: "Upper Intermediate",
    description: "Can interact with fluency and spontaneity",
    minElo: 1300,
    maxElo: 1499,
    color: "text-yellow-500"
  },
  C1: {
    level: "C1",
    name: "Advanced",
    description: "Can express ideas fluently and spontaneously",
    minElo: 1500,
    maxElo: 1699,
    color: "text-orange-500"
  },
  C2: {
    level: "C2",
    name: "Mastery",
    description: "Can understand virtually everything with ease",
    minElo: 1700,
    maxElo: Infinity,
    color: "text-purple-500"
  }
};

/**
 * Get fluency level based on ELO rating
 */
export function getFluencyLevel(elo: number): FluencyLevelInfo {
  if (elo >= FLUENCY_LEVELS.C2.minElo) return FLUENCY_LEVELS.C2;
  if (elo >= FLUENCY_LEVELS.C1.minElo) return FLUENCY_LEVELS.C1;
  if (elo >= FLUENCY_LEVELS.B2.minElo) return FLUENCY_LEVELS.B2;
  if (elo >= FLUENCY_LEVELS.B1.minElo) return FLUENCY_LEVELS.B1;
  if (elo >= FLUENCY_LEVELS.A2.minElo) return FLUENCY_LEVELS.A2;
  return FLUENCY_LEVELS.A1;
}

/**
 * Check if user leveled up based on old and new ELO
 */
export function checkLevelUp(oldElo: number, newElo: number): { 
  leveledUp: boolean; 
  oldLevel?: FluencyLevelInfo; 
  newLevel?: FluencyLevelInfo;
} {
  const oldLevel = getFluencyLevel(oldElo);
  const newLevel = getFluencyLevel(newElo);
  
  if (oldLevel.level !== newLevel.level) {
    return {
      leveledUp: true,
      oldLevel,
      newLevel
    };
  }
  
  return { leveledUp: false };
}

/**
 * Get progress to next level (0-100%)
 */
export function getProgressToNextLevel(elo: number): number {
  const currentLevel = getFluencyLevel(elo);
  
  // If at max level, return 100%
  if (currentLevel.level === "C2") return 100;
  
  const range = currentLevel.maxElo - currentLevel.minElo + 1;
  const progress = elo - currentLevel.minElo;
  
  return Math.min(100, Math.round((progress / range) * 100));
}
