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

function chooseAIMove(moves: any[], current: any, target: any, difficulty: "easy" | "medium" | "hard") {
  // Higher difficulty = more likely to pick optimal move
  const mistakeProb = difficulty === "easy" ? 0.30 : difficulty === "medium" ? 0.15 : 0.07;
  if (moves.length === 0) return current;
  if (Math.random() < mistakeProb) {
    // Choose a random move
    return moves[Math.floor(Math.random() * moves.length)];
  }
  // Otherwise best move towards target
  let best = moves[0];
  let bestDist = Math.abs(moves[0].x - target.x) + Math.abs(moves[0].y - target.y);
  for (const move of moves) {
    const d = Math.abs(move.x - target.x) + Math.abs(move.y - target.y);
    if (d < bestDist) {
      best = move;
      bestDist = d;
    }
  }
  return best;
}

function maybeWrongAnswer(question: any, difficulty: "easy" | "medium" | "hard") {
  // AI has higher chance to make mistakes at lower difficulty (only for multiple-choice)
  const mistakeProb = difficulty === "easy" ? 0.35 : difficulty === "medium" ? 0.18 : 0.05;
  let aiAnswer = question.correct;
  if (question.answers && Array.isArray(question.answers) && Math.random() < mistakeProb) {
    // Pick a wrong answer that's not the correct one
    const wrongs = question.answers.map((_, i) => i).filter(i => i !== question.correct);
    aiAnswer = wrongs[Math.floor(Math.random() * wrongs.length)];
  }
  return aiAnswer;
}

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
      const allMoves = getValidMoves(positions.ai, BOARD_SIZE, defenseTiles);
      const move = chooseAIMove(allMoves, positions.ai, aiTarget, difficulty);

      // getRandomQuestion may be replaced by user code for math/translate, so just get latest from props
      const question = getRandomQuestion(difficulty);
      // Now, choose AI's answer, possibly making a mistake
      const aiAnswer = maybeWrongAnswer(question, difficulty);

      // Inject chosen answer as `aiChoice` into modal/question object, so game logic can act as if AI selected it
      const aiQuestionWithChoice = { ...question, aiChoice: aiAnswer };

      setTimeout(() => {
        if (!winner) {
          setAIModalState({ question: aiQuestionWithChoice, targetTile: move });
        }
      }, 650);
    }
    // eslint-disable-next-line
  }, [
    turn, winner, aiModalState, disableInput, positions, defensesUsed.ai,
    BOARD_SIZE, numDefenses, t, setDisableInput, setDefenseTiles, setDefensesUsed,
    toast, setTurn, setAIModalState, aiMovingRef, aiTarget, humanTarget, defenseTiles, surpriseTiles,
    difficulty
  ]);

  // Extra: always reset blockers on unmount/game restart
  useEffect(() => {
    return () => {
      aiMovingRef.current = false;
    };
  }, [aiMovingRef]);
}
