import { useCallback } from "react";
import { getValidMoves } from "./utils";
import { playSound } from "@/lib/audioManager";

export function useHumanMoveHandler({
  winner, disableInput, turn, positions, BOARD_SIZE, defenseTiles, difficulty,
  defenseMode, handleDefenseClick, setPositions, setBoardPoints,
  setIsModalOpen, setMoveState, setTurn, setHumanPoints, handleSurprise,
  questionType, getQuestionForTurn, setHumanHasMoved, humanHasMoved,
}: {
  winner: any;
  disableInput: boolean;
  turn: any;
  positions: any;
  BOARD_SIZE: number;
  defenseTiles: any[];
  difficulty: string;
  defenseMode: boolean;
  handleDefenseClick: (tile: {x: number, y: number}) => void;
  setPositions: any;
  setBoardPoints: any;
  setIsModalOpen: any;
  setMoveState: any;
  setTurn: any;
  setHumanPoints: any;
  handleSurprise: any;
  questionType: "math" | "translate";
  getQuestionForTurn: () => any;
  setHumanHasMoved: (b: boolean) => void;
  humanHasMoved?: boolean;
}) {
  function canMoveTo(tile: { x: number; y: number }, aiPos: { x: number; y: number }, defenseTiles: any[], BOARD_SIZE: number) {
    const valid = getValidMoves(positions.human, BOARD_SIZE, defenseTiles, aiPos);
    return valid.some((t: { x: number; y: number }) => t.x === tile.x && t.y === tile.y);
  }

  const handleTileClick = useCallback((tile) => {
    if (defenseMode) {
      handleDefenseClick(tile);
      return;
    }
    if (winner || disableInput || turn !== "human") return;

    if (!canMoveTo(tile, positions.ai, defenseTiles, BOARD_SIZE)) {
      return;
    }

    const question = getQuestionForTurn();
    setMoveState({
      tile,
      question,
      resolve: (ok: boolean) => {
        setIsModalOpen(false);
        setMoveState(null);

        if (!ok) {
          // Wrong answer - switch turn immediately, no move sound
          setTurn("ai");
          return;
        }

        // Correct answer - move the player and play move sound with perfect timing
        setPositions((p) => {
          setBoardPoints((prev) => {
            const newBoard = prev.map((row) => [...row]);
            if (!((tile.x === BOARD_SIZE - 1 && tile.y === BOARD_SIZE - 1) || (tile.x === 0 && tile.y === 0))) {
              setHumanPoints((cur) => cur + newBoard[tile.y][tile.x]);
            }
            return newBoard;
          });
          return { ...p, human: { x: tile.x, y: tile.y } };
        });

        setHumanHasMoved(true);

        // Play move sound immediately after successful move
        console.log('[AUDIO] Human moved successfully, playing move sound');
        playSound("move", true, 0.5, 50); // Small delay to ensure position update

        // Handle surprise after move sound
        setTimeout(() => {
          handleSurprise(tile, "human");
          // Switch turn after surprise handling
          setTimeout(() => {
            if (!winner) {
              setTurn("ai");
            }
          }, 700); // Increased delay to prevent overlap with surprise sounds
        }, 200); // Delay to let move sound play first
      }
    });
    setIsModalOpen(true);
  }, [BOARD_SIZE, defenseMode, defenseTiles, disableInput, getQuestionForTurn, handleDefenseClick, handleSurprise, positions.ai, positions.human, setBoardPoints, setHumanPoints, setIsModalOpen, setMoveState, setPositions, setTurn, setHumanHasMoved, winner]);

  return { handleTileClick };
}