
import {
  SURPRISE_TYPES,
  Tile,
  SurpriseTile,
  DefenseTile,
  PlayerType,
} from "./types";
import { getRandomQuestionByDifficulty } from "@/lib/questions";

// Tiles and moves
export function positionsEqual(a: Tile, b: Tile) {
  return a.x === b.x && a.y === b.y;
}

export function getValidMoves(
  pos: Tile,
  BOARD_SIZE: number,
  defenseTiles: DefenseTile[] = [],
  otherPlayerPos?: Tile // add optional param for the other player
) {
  const moves: Tile[] = [];
  // Can't move to defense tiles or onto the other player
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

export function getRandomQuestion(difficulty: "easy" | "medium" | "hard") {
  return getRandomQuestionByDifficulty(difficulty);
}

export function getDistance(a: Tile, b: Tile) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getAIMove(pos: Tile, target: Tile, BOARD_SIZE: number, defenseTiles: DefenseTile[]) {
  const moves = getValidMoves(pos, BOARD_SIZE, defenseTiles);
  let best = moves[0] || pos; // fallback to current pos
  let bestDist = getDistance(best, target);
  for (const move of moves) {
    const d = getDistance(move, target);
    if (d < bestDist) {
      bestDist = d;
      best = move;
    }
  }
  return best;
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

// New: Best tile for AI to block (closest to straight path, not occupied)
export function getAIDefenseTile(options: {
  humanPos: Tile,
  humanTarget: Tile,
  boardSize: number,
  defenseTiles: DefenseTile[],
  positions: {human: Tile, ai: Tile},
  surpriseTiles: SurpriseTile[]
}): Tile | null {
  const { humanPos, humanTarget, boardSize, defenseTiles, positions, surpriseTiles } = options;
  const dx = Math.sign(humanTarget.x - humanPos.x);
  const dy = Math.sign(humanTarget.y - humanPos.y);
  let candidates: Tile[] = [];
  let px = humanPos.x, py = humanPos.y;
  for (let i = 1; i < boardSize - 1; i++) {
    let tx = px + i * dx;
    let ty = py + i * dy;
    if (tx < 0 || ty < 0 || tx >= boardSize || ty >= boardSize) continue;
    candidates.push({ x: tx, y: ty });
  }
  candidates.push(
    ...[
      {x: humanPos.x+1, y: humanPos.y},
      {x: humanPos.x-1, y: humanPos.y},
      {x: humanPos.x, y: humanPos.y+1},
      {x: humanPos.x, y: humanPos.y-1}
    ].filter(
      t=> t.x >=0 && t.x < boardSize && t.y >=0 && t.y < boardSize
    )
  );
  for (const c of candidates) {
    if (
      (c.x === 0 && c.y === 0) ||
      (c.x === boardSize - 1 && c.y === boardSize - 1) ||
      (positionsEqual(positions.human, c)) ||
      (positionsEqual(positions.ai, c)) ||
      defenseTiles.some(dt => dt.x === c.x && dt.y === c.y) ||
      surpriseTiles.some(st => st.x === c.x && st.y === c.y && !st.used)
    ) continue;
    return c;
  }
  return null;
}
