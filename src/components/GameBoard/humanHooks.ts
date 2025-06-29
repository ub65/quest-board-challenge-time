import { useCallback } from "react";
import { getValidMoves } from "./utils";
import { playSound } from "@/lib/audioManager";

export function useHumanMoveHandler({
  winner, disableInput, turn, positions, BOARD_SIZE, defenseTiles, difficulty,
  defenseMode, handleDefenseClick, setPositions, setBoardPoints,
  setIsModalOpen, setMoveState, setTurn, setHumanPoints, handleSurprise,
  questionType, getQuestionForTurn, setHumanHasMoved, humanHasMoved,
  soundEnabled, volume,
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
  soundEnabled?: boolean;
  volume?: number;
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
          // Play wrong sound immediately when answer is incorrect
          console.log('[AUDIO] Human answered incorrectly, playing wrong sound');
          if (soundEnabled) {
            playSound("wrong", soundEnabled, volume || 0.5);
          }
          setTurn("ai");
          return;
        }

        // Play correct sound immediately when answer is correct
        console.log('[AUDIO] Human answered correctly, playing correct sound');
        if (soundEnabled) {
          playSound("correct", soundEnabled, volume || 0.5);
        }

        // Move the player
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

        // Play move sound after a short delay
        setTimeout(() => {
          console.log('[AUDIO] Human moved, playing move sound');
          if (soundEnabled) {
            playSound("move", soundEnabled, volume || 0.5);
          }
          
          // Handle surprise after move sound
          setTimeout(() => {
            handleSurprise(tile, "human");
            setTimeout(() => {
              if (!winner) {
                setTurn("ai");
              }
            }, 600);
          }, 200);
        }, 300);
      }
    });
    setIsModalOpen(true);
  }, [BOARD_SIZE, defenseMode, defenseTiles, disableInput, getQuestionForTurn, handleDefenseClick, handleSurprise, positions.ai, positions.human, setBoardPoints, setHumanPoints, setIsModalOpen, setMoveState, setPositions, setTurn, setHumanHasMoved, winner, soundEnabled, volume]);

  return { handleTileClick };
}