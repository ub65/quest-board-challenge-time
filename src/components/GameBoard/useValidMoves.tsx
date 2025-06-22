import { useMemo } from "react";
import { Tile, DefenseTile } from "./types";

type UseValidMovesProps = {
  turn: "human" | "ai";
  winner: "human" | "ai" | null;
  BOARD_SIZE: number;
  positions: { human: Tile; ai: Tile };
  defenseTiles: DefenseTile[];
  getValidMoves: (pos: Tile) => Tile[];
};

export const useValidMoves = ({
  turn,
  winner,
  BOARD_SIZE,
  positions,
  defenseTiles,
  getValidMoves,
}: UseValidMovesProps) => {
  return useMemo(() => {
    const validMovesSet = new Set<string>();
    
    if (!winner && turn === "human") {
      const validMoves = getValidMoves(positions.human);
      validMoves.forEach(move => {
        const defense = defenseTiles?.find(dt => dt.x === move.x && dt.y === move.y);
        if (!defense) {
          validMovesSet.add(`${move.x},${move.y}`);
        }
      });
    }
    
    return validMovesSet;
  }, [turn, winner, positions.human, defenseTiles, getValidMoves]);
};