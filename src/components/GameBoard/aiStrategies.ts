
import { Tile, DefenseTile, SurpriseTile } from "./types";
import { getDistance, positionsEqual } from "./utils";

export interface AIStrategy {
  name: string;
  weight: number;
  evaluate: (options: AIEvaluationOptions) => number;
}

export interface AIEvaluationOptions {
  move: Tile;
  currentPos: Tile;
  target: Tile;
  humanPos: Tile;
  humanTarget: Tile;
  defenseTiles: DefenseTile[];
  surpriseTiles: SurpriseTile[];
  boardSize: number;
  difficulty: "easy" | "medium" | "hard";
}

// Strategy: Move toward AI's goal
export const goalSeekingStrategy: AIStrategy = {
  name: "goal-seeking",
  weight: 1.0,
  evaluate: ({ move, target }) => {
    const distance = getDistance(move, target);
    // Higher score for closer positions to goal
    return Math.max(0, 20 - distance);
  }
};

// Strategy: Block or intercept human player
export const playerInterceptionStrategy: AIStrategy = {
  name: "player-interception",
  weight: 0.8,
  evaluate: ({ move, humanPos, humanTarget, difficulty }) => {
    const distanceToHuman = getDistance(move, humanPos);
    const humanToGoalDistance = getDistance(humanPos, humanTarget);
    
    // More aggressive on harder difficulties
    const aggressionMultiplier = difficulty === "hard" ? 1.5 : difficulty === "medium" ? 1.2 : 1.0;
    
    // Prefer positions that are close to human's path to goal
    let score = 0;
    
    // If human is close to winning, prioritize blocking
    if (humanToGoalDistance <= 3) {
      score += 15 * aggressionMultiplier;
    }
    
    // Prefer being close to human (within 2-3 tiles)
    if (distanceToHuman >= 2 && distanceToHuman <= 4) {
      score += 8;
    } else if (distanceToHuman <= 1) {
      score += 12; // Very close is valuable for blocking
    }
    
    return score;
  }
};

// Strategy: Collect surprise tiles
export const surpriseCollectionStrategy: AIStrategy = {
  name: "surprise-collection",
  weight: 0.6,
  evaluate: ({ move, surpriseTiles }) => {
    // Check if this move lands on an unused surprise
    const onSurprise = surpriseTiles.find(
      s => s.x === move.x && s.y === move.y && !s.used
    );
    
    if (onSurprise) {
      return 25; // High reward for landing on surprise
    }
    
    // Bonus for being close to surprises
    const closestSurprise = surpriseTiles
      .filter(s => !s.used)
      .reduce((closest, s) => {
        const dist = getDistance(move, s);
        return dist < closest.distance ? { distance: dist, tile: s } : closest;
      }, { distance: Infinity, tile: null as SurpriseTile | null });
    
    if (closestSurprise.tile && closestSurprise.distance <= 2) {
      return Math.max(0, 8 - closestSurprise.distance * 2);
    }
    
    return 0;
  }
};

// Strategy: Avoid getting trapped near defenses
export const defenseAvoidanceStrategy: AIStrategy = {
  name: "defense-avoidance",
  weight: 0.4,
  evaluate: ({ move, defenseTiles }) => {
    let penalty = 0;
    
    for (const defense of defenseTiles) {
      const distance = getDistance(move, defense);
      if (distance <= 1) {
        penalty -= 8; // Penalize being adjacent to defenses
      } else if (distance <= 2) {
        penalty -= 3; // Light penalty for being near defenses
      }
    }
    
    return penalty;
  }
};

// Strategy: Control center positions
export const boardControlStrategy: AIStrategy = {
  name: "board-control",
  weight: 0.3,
  evaluate: ({ move, boardSize }) => {
    const center = (boardSize - 1) / 2;
    const distanceFromCenter = Math.abs(move.x - center) + Math.abs(move.y - center);
    
    // Prefer positions closer to center (more mobility options)
    return Math.max(0, 6 - distanceFromCenter);
  }
};

// Strategy: Maintain flexible positioning
export const mobilityStrategy: AIStrategy = {
  name: "mobility",
  weight: 0.5,
  evaluate: ({ move, boardSize, defenseTiles, humanPos }) => {
    let openMoves = 0;
    const directions = [
      { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 0 }, { x: -1, y: 0 }
    ];
    
    for (const dir of directions) {
      const nextPos = { x: move.x + dir.x, y: move.y + dir.y };
      
      if (nextPos.x >= 0 && nextPos.x < boardSize && 
          nextPos.y >= 0 && nextPos.y < boardSize &&
          !defenseTiles.some(d => positionsEqual(d, nextPos)) &&
          !positionsEqual(nextPos, humanPos)) {
        openMoves++;
      }
    }
    
    return openMoves * 2; // Reward mobility
  }
};

export const ALL_STRATEGIES: AIStrategy[] = [
  goalSeekingStrategy,
  playerInterceptionStrategy,
  surpriseCollectionStrategy,
  defenseAvoidanceStrategy,
  boardControlStrategy,
  mobilityStrategy
];
