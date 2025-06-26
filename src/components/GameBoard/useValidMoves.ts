
import { useMemo } from "react";
import { Tile, DefenseTile } from "./types";

export function useValidMoves({
  turn,
  winner,
  BOARD_SIZE,
  positions,
  defenseTiles,
  getValidMoves
}: {
  turn: "human" | "ai";
  winner: "human" | "ai" | null;
  BOARD_SIZE: number;
  positions: { human: Tile; ai: Tile };
  defenseTiles: DefenseTile[];
  getValidMoves: (pos: Tile) => Tile[];
}) {
  return useMemo(() => {
    if (winner || turn !== "human") return new Set<string>();
    return new Set(
      getValidMoves(positions.human)
        .filter(
          (t) =>
            t.x >= 0 &&
            t.y >= 0 &&
            t.x < BOARD_SIZE &&
            t.y < BOARD_SIZE
        )
        .map((t) => `${t.x},${t.y}`)
    );
  }, [positions.human.x, positions.human.y, defenseTiles, BOARD_SIZE, winner, turn, getValidMoves]);
}
