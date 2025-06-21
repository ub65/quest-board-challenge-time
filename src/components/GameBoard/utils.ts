
import { SURPRISE_TYPES, Tile, SurpriseTile, DefenseTile } from "./types";
import { getRandomQuestionByDifficulty } from "@/lib/questions";
import { AIDecisionEngine } from "./aiDecisionEngine";

export function positionsEqual(a: Tile, b: Tile) {
  return a.x === b.x && a.y === b.y;
}

export function getValidMoves(
  pos: Tile,
  BOARD_SIZE: number,
  defenseTiles: DefenseTile[] = [],
  otherPlayerPos?: Tile
) {
  const moves: Tile[] = [];
  function isBlocked(x: number, y: number) {
    if (defenseTiles.some((t) => t.x === x && t.y === y)) return true;
    if (otherPlayerPos && otherPlayerPos.x === x && otherPlayerPos.y === y) return true;
    return false;
  }
  if (pos.x > 0 && !isBlocked(pos.x - 1, pos.y)) moves.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < BOARD_SIZE - 1 && !isBlocked(pos.x + 1, pos.y)) moves.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0 && !isBlocked(pos.x, pos.y - 1)) moves.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < BOARD_SIZE - 1 && !isBlocked(pos.x, pos.y + 1)) moves.push({ x: pos.x, y: pos.y + 1 });
  return moves;
}

export function getRandomTranslationQuestion(difficulty: "easy" | "medium" | "hard") {
  return getRandomQuestionByDifficulty(difficulty);
}

export function getDistance(a: Tile, b: Tile) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getAIMove(
  pos: Tile, 
  target: Tile, 
  BOARD_SIZE: number, 
  defenseTiles: DefenseTile[],
  humanPos: Tile,
  humanTarget: Tile,
  surpriseTiles: SurpriseTile[],
  difficulty: "easy" | "medium" | "hard"
) {
  const moves = getValidMoves(pos, BOARD_SIZE, defenseTiles, humanPos);
  
  if (moves.length === 0) {
    return pos;
  }

  const aiEngine = new AIDecisionEngine(difficulty);
  const decision = aiEngine.chooseBestMove({
    availableMoves: moves,
    currentPos: pos,
    target,
    humanPos,
    humanTarget,
    defenseTiles,
    surpriseTiles,
    boardSize: BOARD_SIZE
  });

  console.log(`[AI DECISION] Move: (${decision.move.x}, ${decision.move.y}), Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
  console.log(`[AI REASONING] ${decision.reasoning.join(", ")}`);

  return decision.move;
}

export function generateRandomPoints(boardSize: number) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.floor(Math.random() * 100) + 1)
  );
}

export function getRandomSurpriseTiles(boardSize: number, count: number): SurpriseTile[] {
  const chosen: SurpriseTile[] = [];
  for (let i = 0; i < count; i++) {
    let attempt = 0;
    while (attempt++ < 30) {
      const x = Math.floor(Math.random() * boardSize);
      const y = Math.floor(Math.random() * boardSize);
      if (
        (x === 0 && y === 0) ||
        (x === boardSize - 1 && y === boardSize - 1) ||
        chosen.some((t) => t.x === x && t.y === y)
      ) continue;
      const t: SurpriseTile = {
        x, y,
        type: SURPRISE_TYPES[Math.floor(Math.random() * SURPRISE_TYPES.length)],
        used: false,
      };
      chosen.push(t);
      break;
    }
  }
  return chosen;
}

export function getAIDefenseTile(options: {
  humanPos: Tile,
  humanTarget: Tile,
  boardSize: number,
  defenseTiles: DefenseTile[],
  positions: {human: Tile, ai: Tile},
  surpriseTiles: SurpriseTile[],
  difficulty: "easy" | "medium" | "hard"
}): Tile | null {
  const { humanPos, humanTarget, boardSize, defenseTiles, positions, surpriseTiles, difficulty } = options;
  
  const aiEngine = new AIDecisionEngine(difficulty);
  const defenseDecision = aiEngine.shouldPlaceDefense({
    humanPos,
    humanTarget,
    aiPos: positions.ai,
    aiTarget: { x: 0, y: 0 },
    availableDefenses: 1,
    boardSize
  });

  console.log(`[AI DEFENSE] Should place: ${defenseDecision.shouldPlace}, Urgency: ${(defenseDecision.urgency * 100).toFixed(1)}%, Reason: ${defenseDecision.reasoning}`);

  if (!defenseDecision.shouldPlace) {
    return null;
  }

  const candidates: Array<{tile: Tile, score: number}> = [];
  
  const dx = Math.sign(humanTarget.x - humanPos.x);
  const dy = Math.sign(humanTarget.y - humanPos.y);
  
  for (let i = 1; i <= 3; i++) {
    const blockX = humanPos.x + i * dx;
    const blockY = humanPos.y + i * dy;
    
    if (blockX >= 0 && blockX < boardSize && blockY >= 0 && blockY < boardSize) {
      const tile = { x: blockX, y: blockY };
      if (isValidDefensePosition(tile, boardSize, positions, defenseTiles, surpriseTiles)) {
        const distanceToHuman = getDistance(tile, humanPos);
        const distanceToGoal = getDistance(tile, humanTarget);
        const score = 20 - distanceToHuman + (10 - distanceToGoal);
        candidates.push({ tile, score });
      }
    }
  }

  const adjacentPositions = [
    { x: humanPos.x + 1, y: humanPos.y },
    { x: humanPos.x - 1, y: humanPos.y },
    { x: humanPos.x, y: humanPos.y + 1 },
    { x: humanPos.x, y: humanPos.y - 1 }
  ];

  for (const tile of adjacentPositions) {
    if (tile.x >= 0 && tile.x < boardSize && tile.y >= 0 && tile.y < boardSize) {
      if (isValidDefensePosition(tile, boardSize, positions, defenseTiles, surpriseTiles)) {
        candidates.push({ tile, score: 15 });
      }
    }
  }

  const goalApproaches = [
    { x: humanTarget.x - 1, y: humanTarget.y },
    { x: humanTarget.x, y: humanTarget.y - 1 },
    { x: humanTarget.x - 1, y: humanTarget.y - 1 }
  ];

  for (const tile of goalApproaches) {
    if (tile.x >= 0 && tile.x < boardSize && tile.y >= 0 && tile.y < boardSize) {
      if (isValidDefensePosition(tile, boardSize, positions, defenseTiles, surpriseTiles)) {
        const score = 12 + (defenseDecision.urgency * 5);
        candidates.push({ tile, score });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  
  console.log(`[AI DEFENSE] Best position: (${candidates[0].tile.x}, ${candidates[0].tile.y}) with score ${candidates[0].score}`);
  
  return candidates[0].tile;
}

function isValidDefensePosition(
  tile: Tile,
  boardSize: number,
  positions: {human: Tile, ai: Tile},
  defenseTiles: DefenseTile[],
  surpriseTiles: SurpriseTile[]
): boolean {
  if ((tile.x === 0 && tile.y === 0) || (tile.x === boardSize - 1 && tile.y === boardSize - 1)) {
    return false;
  }
  
  if (positionsEqual(positions.human, tile) || positionsEqual(positions.ai, tile)) {
    return false;
  }
  
  if (defenseTiles.some(dt => positionsEqual(dt, tile))) {
    return false;
  }
  
  if (surpriseTiles.some(st => positionsEqual(st, tile) && !st.used)) {
    return false;
  }
  
  return true;
}

export const getRandomQuestion = getRandomTranslationQuestion;
