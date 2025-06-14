
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
    // DEBUG LOGS to track effect activations and blockers
    console.log("[AI TURN HOOK] running", {turn, winner, aiModalState, aiMoving: aiMovingRef.current, disableInput});

    // Always reset moving ref when human's turn or game over
    if (winner || turn === "human") {
      if (aiMovingRef.current) console.log("[AI TURN HOOK] Resetting aiMovingRef.current", {winner, turn});
      aiMovingRef.current = false;
      return;
    }

    // AI turn begins
    // Don't permit moving if already in modal, or marked as "moving"
    if (turn === "ai" && !aiModalState && !aiMovingRef.current) {
      // Activate AI logic!
      console.log("[AI TURN HOOK] AI is starting move!");
      aiMovingRef.current = true;
      setDisableInput(true);

      // AI defense logic
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
      // AI move logic
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
    // eslint-disable-next-line
  }, [
    turn, winner, aiModalState, disableInput, positions, defensesUsed.ai,
    BOARD_SIZE, numDefenses, t, setDisableInput, setDefenseTiles, setDefensesUsed,
    toast, setTurn, setAIModalState, aiMovingRef, aiTarget, humanTarget, defenseTiles, surpriseTiles,
  ]);

  // Extra: always reset blockers on unmount/game restart
  useEffect(() => {
    return () => {
      aiMovingRef.current = false;
    };
  }, [aiMovingRef]);
}
