
export type PlayerType = "human" | "ai";

export const DEFAULT_BOARD_SIZE = 7;
export const DEFAULT_QUESTION_TIME = 14;
export const DEFAULT_DEFENSES = 3;
export const SURPRISE_TYPES = [
  "double",
  "lose",
  "free",
  "steal",
  "extra",
] as const;
export type SurpriseType = typeof SURPRISE_TYPES[number];

export type Tile = { x: number; y: number };
export type SurpriseTile = Tile & { type: SurpriseType; used: boolean };
export type DefenseOwner = "human" | "ai";
export type DefenseTile = Tile & { owner: DefenseOwner };
