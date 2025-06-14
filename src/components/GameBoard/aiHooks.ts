
import { useEffect, useRef } from "react";
import { getRandomQuestion, getValidMoves, getAIMove, getAIDefenseTile } from "./utils";
import { PlayerType, Tile, DefenseTile, SurpriseTile } from "./types";

type AIMoveProps = {
  turn: PlayerType;
  winner: PlayerType | null;
  aiModalState: any;
  disableInput: boolean;
  positions: { human: Tile; ai: Tile; };
  defensesUsed: { human: number; ai: number };
  defenseTiles: DefenseTile[];
  surpriseTiles: SurpriseTile[];
  numDefenses: number;
  difficulty: "easy" | "medium" | "hard";
  BOARD_SIZE: number;
  aiTarget: Tile;
  humanTarget: Tile;
  t: (key: string, params?: any) => string;
  setDisableInput: (b: boolean) => void;
  setDefenseTiles: (f: (p: DefenseTile[]) => DefenseTile[]) => void;
  setDefensesUsed: (f: (d: { human: number; ai: number }) => { human: number; ai: number }) => void;
  toast: (args: any) => void;
  setTurn: (p: PlayerType) => void;
  setAIModalState: (f: any) => void;
  aiMovingRef: React.MutableRefObject<boolean>;
};

export function useAITurn({
  turn, winner, aiModalState, disableInput, positions, defensesUsed, defenseTiles, surpriseTiles, numDefenses, difficulty, BOARD_SIZE,
  aiTarget, humanTarget, t, setDisableInput, setDefenseTiles, setDefensesUsed, toast, setTurn, setAIModalState, aiMovingRef,
}: AIMoveProps) {
  useEffect(() => {
    if (winner) {
      aiMovingRef.current = false;
      return;
    }
    if (turn === "ai" && !aiModalState && !aiMovingRef.current) {
      aiMovingRef.current = true;
      setDisableInput(true);
      if (defensesUsed.ai < numDefenses) {
        const aiDefense = getAIDefenseTile({
          humanPos: positions.human,
          humanTarget,
          boardSize: BOARD_SIZE,
          defenseTiles,
          positions,
          surpriseTiles,
        });
        if (aiDefense) {
          setDefenseTiles(prev => [...prev, { ...aiDefense, owner: "ai" }]);
          setDefensesUsed(d => ({ ...d, ai: d.ai + 1 }));
          toast({
            title: t("game.defense_ai_placed") || "AI placed a defense!",
            description: t("game.defense_ai_msg") || "AI blocked your path!",
            duration: 1400,
          });
          setTimeout(() => {
            aiMovingRef.current = false;
            setTurn("human");
            setDisableInput(false);
          }, 900);
          return;
        }
      }
      // AI move logic as normal
      const move = getValidMoves(positions.ai, BOARD_SIZE, defenseTiles).filter(
        tile => tile.x >= 0 && tile.y >= 0 && tile.x < BOARD_SIZE && tile.y < BOARD_SIZE
      );
      const nextTile = move.length > 0 ? getAIMove(positions.ai, aiTarget, BOARD_SIZE, defenseTiles) : positions.ai;
      const question = getRandomQuestion(difficulty);
      setTimeout(() => {
        if (!winner) {
          setAIModalState({ question, targetTile: nextTile });
        }
      }, 650);
    }
    if (turn === "human" || winner) {
      aiMovingRef.current = false;
    }
    // eslint-disable-next-line
  }, [
    turn, winner, aiModalState, disableInput, positions, defensesUsed.ai,
    BOARD_SIZE, numDefenses, t, setDisableInput, setDefenseTiles, setDefensesUsed,
    toast, setTurn, setAIModalState, aiMovingRef, aiTarget, humanTarget, defenseTiles, surpriseTiles,
  ]);
}
