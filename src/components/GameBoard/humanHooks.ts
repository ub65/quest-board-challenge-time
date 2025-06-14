
import { useCallback } from "react";
import { getRandomQuestion, getValidMoves, positionsEqual } from "./utils";
import { Tile, PlayerType, DefenseTile } from "./types";

type UseHumanMovesProps = {
  winner: PlayerType | null;
  disableInput: boolean;
  turn: PlayerType;
  positions: { human: Tile; ai: Tile };
  BOARD_SIZE: number;
  defenseTiles: DefenseTile[];
  difficulty: "easy" | "medium" | "hard";
  defenseMode: boolean;
  handleDefenseClick: (tile: Tile) => void;

  setSound: (s: any) => void;
  setPositions: (f: (p: any) => any) => void;
  setBoardPoints: (f: (bp: number[][]) => number[][]) => void;
  setIsModalOpen: (b: boolean) => void;
  setMoveState: (v: any) => void;
  setTurn: (p: PlayerType) => void;
  setHumanPoints: (f: (v: number) => number) => void;
  handleSurprise: (tile: Tile, player: PlayerType) => boolean | undefined;
};

export function useHumanMoveHandler({
  winner,
  disableInput,
  turn,
  positions,
  BOARD_SIZE,
  defenseTiles,
  difficulty,
  defenseMode,
  handleDefenseClick,
  setSound,
  setPositions,
  setBoardPoints,
  setIsModalOpen,
  setMoveState,
  setTurn,
  setHumanPoints,
  handleSurprise,
}: UseHumanMovesProps) {
  // returns a stable tile click handler for GameBoardGrid
  const handleTileClick = useCallback(
    async (tile: Tile) => {
      if (winner || disableInput) return;

      // In defense mode, clicks should place a defense instead of moving
      if (defenseMode) {
        handleDefenseClick(tile);
        return;
      }

      // NOT DEFENSE MODE: regular move
      if (turn !== "human") return;

      const validMoves = getValidMoves(
        positions.human,
        BOARD_SIZE,
        defenseTiles,
        positions.ai
      ).filter(
        (t) =>
          t.x >= 0 &&
          t.y >= 0 &&
          t.x < BOARD_SIZE &&
          t.y < BOARD_SIZE
      );
      if (!validMoves.some((t) => positionsEqual(t, tile))) return;
      const question = getRandomQuestion(difficulty);
      const ok = await new Promise<boolean>((resolve) => {
        setMoveState({ tile, question, resolve });
        setIsModalOpen(true);
      });
      setIsModalOpen(false);
      setMoveState(null);
      if (winner) return;

      if (ok) {
        setPositions((p) => {
          const { x, y } = tile;
          setBoardPoints((prev) => {
            if (prev[y][x] === 0) return prev;
            if (
              (x === 0 && y === 0) ||
              (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)
            )
              return prev;
            setHumanPoints((cur) => cur + prev[y][x]);
            const next = prev.map((row) => [...row]);
            next[y][x] = 0;
            return next;
          });
          return { ...p, human: { x, y } };
        });
        setSound("move");

        setTimeout(() => {
          const doFreeMove = handleSurprise(tile, "human");
          if (!doFreeMove) {
            setTurn("ai");
          }
          // If doFreeMove: stay on human
        }, 100);
      } else {
        setSound("wrong");
        setTurn("ai");
      }
    },
    [
      winner,
      disableInput,
      defenseMode,
      turn,
      positions,
      BOARD_SIZE,
      defenseTiles,
      difficulty,
      handleDefenseClick,
      setSound,
      setPositions,
      setBoardPoints,
      setIsModalOpen,
      setMoveState,
      setTurn,
      setHumanPoints,
      handleSurprise,
    ]
  );

  return { handleTileClick };
}
