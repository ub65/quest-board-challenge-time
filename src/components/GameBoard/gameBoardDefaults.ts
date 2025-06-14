
import { generateRandomPoints, getRandomSurpriseTiles } from "./utils";
import { DEFAULT_BOARD_SIZE, DEFAULT_DEFENSES } from "./types";

export function getInitialPositions(boardSize: number) {
  return {
    human: { x: 0, y: 0 },
    ai: { x: boardSize - 1, y: boardSize - 1 },
  };
}

export function getInitialPoints() {
  return generateRandomPoints(DEFAULT_BOARD_SIZE);
}

export function getInitialSurprises() {
  return getRandomSurpriseTiles(DEFAULT_BOARD_SIZE, 4);
}

export function getInitialDefenses() {
  return [];
}

export function getInitialDefensesUsed() {
  return { human: 0, ai: 0 };
}
