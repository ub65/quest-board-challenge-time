
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

export const goalSeekingStrategy: AIStrategy = {
  name: "goal-seeking",
  weight: 1.5,
  evaluate: ({ move, target, currentPos, humanPos, humanTarget }) => {
    const currentDistance = getDistance(currentPos, target);
    const moveDistance = getDistance(move, target);
    const humanToGoalDistance = getDistance(humanPos, humanTarget);
    
    let score = Math.max(0, 25 - moveDistance * 1.5);
    
    if (moveDistance < currentDistance) {
      score += 10;
    }
    
    if (humanToGoalDistance <= 3 && moveDistance < currentDistance) {
      score += 15;
    }
    
    if (moveDistance > currentDistance) {
      score -= 8;
    }
    
    return score;
  }
};

export const playerInterceptionStrategy: AIStrategy = {
  name: "player-interception",
  weight: 0.5,
  evaluate: ({ move, humanPos, humanTarget, difficulty, currentPos, target }) => {
    const distanceToHuman = getDistance(move, humanPos);
    const humanToGoalDistance = getDistance(humanPos, humanTarget);
    const aiToGoalDistance = getDistance(currentPos, target);
    
    if (humanToGoalDistance <= 2 && aiToGoalDistance > 3) {
      const aggressionMultiplier = difficulty === "hard" ? 1.2 : difficulty === "medium" ? 1.0 : 0.8;
      return 12 * aggressionMultiplier;
    }
    
    if (humanToGoalDistance < aiToGoalDistance && humanToGoalDistance <= 4 && distanceToHuman <= 2) {
      return 5;
    }
    
    return 0;
  }
};

export const surpriseCollectionStrategy: AIStrategy = {
  name: "surprise-collection",
  weight: 0.4,
  evaluate: ({ move, surpriseTiles, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    
    const onSurprise = surpriseTiles.find(
      s => s.x === move.x && s.y === move.y && !s.used
    );
    
    if (onSurprise) {
      if (aiToGoalDistance <= 3) {
        return 8;
      }
      return 15;
    }
    
    if (aiToGoalDistance <= 4) {
      return 0;
    }
    
    const closestSurprise = surpriseTiles
      .filter(s => !s.used)
      .reduce((closest, s) => {
        const dist = getDistance(move, s);
        return dist < closest.distance ? { distance: dist, tile: s } : closest;
      }, { distance: Infinity, tile: null as SurpriseTile | null });
    
    if (closestSurprise.tile && closestSurprise.distance <= 1) {
      return 4;
    }
    
    return 0;
  }
};

export const defenseAvoidanceStrategy: AIStrategy = {
  name: "defense-avoidance",
  weight: 0.3,
  evaluate: ({ move, defenseTiles, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    let penalty = 0;
    
    for (const defense of defenseTiles) {
      const distance = getDistance(move, defense);
      if (distance <= 1) {
        const moveToGoalDistance = getDistance(move, target);
        if (moveToGoalDistance < aiToGoalDistance) {
          penalty -= 3;
        } else {
          penalty -= 6;
        }
      }
    }
    
    return penalty;
  }
};

export const boardControlStrategy: AIStrategy = {
  name: "board-control",
  weight: 0.1,
  evaluate: ({ move, boardSize, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    
    if (aiToGoalDistance <= 4) {
      return 0;
    }
    
    const center = (boardSize - 1) / 2;
    const distanceFromCenter = Math.abs(move.x - center) + Math.abs(move.y - center);
    
    return Math.max(0, 3 - distanceFromCenter);
  }
};

export const mobilityStrategy: AIStrategy = {
  name: "mobility",
  weight: 0.2,
  evaluate: ({ move, boardSize, defenseTiles, humanPos, currentPos, target }) => {
    const aiToGoalDistance = getDistance(currentPos, target);
    
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
    
    return openMoves;
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
