
import { generateRandomPoints, getRandomSurpriseTiles } from "./utils";
import type { Tile, DefenseTile, SurpriseTile } from "./types";

type UseGameRestartArgs = {
  boardSize: number;
  numSurprises: number;
  setPositions: (pos: { human: Tile; ai: Tile }) => void;
  setWinner: (w: null) => void;
  setTurn: (t: "human") => void;
  setIsModalOpen: (b: boolean) => void;
  setMoveState: (s: any) => void;
  setAIModalState: (s: any) => void;
  setDisableInput: (b: boolean) => void;
  setHumanPoints: (n: number) => void;
  setAIPoints: (n: number) => void;
  setBoardPoints: (pts: number[][]) => void;
  setSurpriseTiles: (tiles: SurpriseTile[]) => void;
  setDefenseTiles: (d: DefenseTile[]) => void;
  setDefensesUsed: (v: { human: number; ai: number }) => void;
  setDefenseMode: (b: boolean) => void;
};

export function useGameRestart({
  boardSize,
  numSurprises,
  setPositions,
  setWinner,
  setTurn,
  setIsModalOpen,
  setMoveState,
  setAIModalState,
  setDisableInput,
  setHumanPoints,
  setAIPoints,
  setBoardPoints,
  setSurpriseTiles,
  setDefenseTiles,
  setDefensesUsed,
  setDefenseMode,
}: UseGameRestartArgs) {
  return () => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setTurn("human");
    setIsModalOpen(false);
    setMoveState(null);
    setAIModalState(null);
    setDisableInput(false);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({ human: 0, ai: 0 });
    setDefenseMode(false);
  };
}
