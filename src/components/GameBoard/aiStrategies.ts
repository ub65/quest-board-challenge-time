
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

// Strategy: Move toward AI's goal - ENHANCED for better goal-seeking
export const goalSeekingStrategy: AIStrategy = {
  name: "goal-seeking",
  weight: 1.5, // Increased weight to prioritize goal-seeking
  evaluate: ({ move, target, currentPos, humanPos, humanTarget }) => {
    const currentDistance = getDistance(currentPos, target);
    const moveDistance = getDistance(move, target);
    const humanToGoalDistance = getDistance(humanPos, humanTarget);
    
    // Base score: heavily reward moves that get closer to goal
    let score = Math.max(0, 25 - moveDistance * 1.5);
    
    // Bonus for making progress toward goal
    if (moveDistance < currentDistance) {
      score += 10; // Big bonus for getting closer
    }
    
    // Emergency boost if human is close to winning
    if (humanToGoalDistance <= 3 && moveDistance < currentDistance) {
      score += 15; // Extra urgency to reach goal
    }
    
    // Penalty for moving away from goal
    if (moveDistance > currentDistance) {
      score -= 8;
    }
    
    return score;
  }
};

// Strategy: Block or intercept human player - REDUCED weight
export const playerInterceptionStrategy: AIStrategy = {
  name: "player-interception",
  weight: 0.5, // Reduced from 0.8 to focus more on goal
  evaluate: ({ move, humanPos, humanTarget, difficulty, currentPos, target }) => {
    const distanceToHuman = getDistance(move, humanPos);
    const humanToGoalDistance = getDistance(humanPos, humanTarget);
    const aiToGoalDistance = getDistance(currentPos, target);
    
    // Only intercept if human is very close to winning AND we're not close to our goal
    if (humanToGoalDistance <= 2 && aiToGoalDistance > 3) {
      const aggressionMultiplier = difficulty === "hard" ? 1.2 : difficulty === "medium" ? 1.0 : 0.8;
      return 12 * aggressionMultiplier;
    }
    
    // Light blocking if human is ahead but we're also making progress
    if (humanToGoalDistance < aiToGoalDistance && humanToGoalDistance <= 4 && distanceToHuman <= 2) {
      return 5;
    }
    
    return 0;
  }
};

// Strategy: Collect surprise tiles - REDUCED weight
export const surpriseCollectionStrategy: AIStrategy = {
  name: "surprise-collection",
  weight: 0.4, // Reduced from 0.6 to focus more on goal
  evaluate: ({ move, surpriseTiles, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    
    // Check if this move lands on an unused surprise
    const onSurprise = surpriseTiles.find(
      s => s.x === move.x && s.y === move.y && !s.used
    );
    
    if (onSurprise) {
      // Reduce surprise priority if we're close to goal
      if (aiToGoalDistance <= 3) {
        return 8; // Reduced reward when close to goal
      }
      return 15; // Reduced from 25
    }
    
    // Don't chase distant surprises if we're making good progress to goal
    if (aiToGoalDistance <= 4) {
      return 0;
    }
    
    // Bonus for being close to surprises (only when far from goal)
    const closestSurprise = surpriseTiles
      .filter(s => !s.used)
      .reduce((closest, s) => {
        const dist = getDistance(move, s);
        return dist < closest.distance ? { distance: dist, tile: s } : closest;
      }, { distance: Infinity, tile: null as SurpriseTile | null });
    
    if (closestSurprise.tile && closestSurprise.distance <= 1) {
      return 4; // Reduced from 8
    }
    
    return 0;
  }
};

// Strategy: Avoid getting trapped near defenses - REDUCED weight
export const defenseAvoidanceStrategy: AIStrategy = {
  name: "defense-avoidance",
  weight: 0.3, // Reduced from 0.4
  evaluate: ({ move, defenseTiles, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    let penalty = 0;
    
    for (const defense of defenseTiles) {
      const distance = getDistance(move, defense);
      if (distance <= 1) {
        // Less penalty if the move still gets us closer to goal
        const moveToGoalDistance = getDistance(move, target);
        if (moveToGoalDistance < aiToGoalDistance) {
          penalty -= 3; // Reduced penalty when making progress
        } else {
          penalty -= 6; // Reduced from 8
        }
      }
    }
    
    return penalty;
  }
};

// Strategy: Control center positions - SIGNIFICANTLY REDUCED
export const boardControlStrategy: AIStrategy = {
  name: "board-control",
  weight: 0.1, // Reduced from 0.3
  evaluate: ({ move, boardSize, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    
    // Don't care about center control if we're close to goal
    if (aiToGoalDistance <= 4) {
      return 0;
    }
    
    const center = (boardSize - 1) / 2;
    const distanceFromCenter = Math.abs(move.x - center) + Math.abs(move.y - center);
    
    // Very light preference for center positions
    return Math.max(0, 3 - distanceFromCenter);
  }
};

// Strategy: Maintain flexible positioning - REDUCED weight
export const mobilityStrategy: AIStrategy = {
  name: "mobility",
  weight: 0.2, // Reduced from 0.5
  evaluate: ({ move, boardSize, defenseTiles, humanPos, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    
    // Mobility is less important when close to goal
    if (aiToGoalDistance <= 2) {
      return 0;
    }
    
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
    
    return openMoves; // Reduced from openMoves * 2
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
