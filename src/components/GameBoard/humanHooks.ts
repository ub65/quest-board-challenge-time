
import { useCallback } from "react";
import { getRandomQuestion, getValidMoves } from "./utils";

export function useHumanMoveHandler({
  winner, disableInput, turn, positions, BOARD_SIZE, defenseTiles, difficulty,
  defenseMode, handleDefenseClick, setPositions, setBoardPoints,
  setIsModalOpen, setMoveState, setTurn, setHumanPoints, handleSurprise,
  questionType, getQuestionForTurn,
  setHumanHasMoved, // <-- Accept as prop
  humanHasMoved, // <-- Accept as prop (optional, not used here but for clarity)
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
  // Helper function to determine if human can move to a tile
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
      // Removed setSound("wrong") call since sound functionality was removed
      return;
    }

    const question = getQuestionForTurn();
    setMoveState({
      tile,
      question,
      resolve: (ok: boolean) => {
        // Removed setSound calls since sound functionality was removed
        setIsModalOpen(false);
        setMoveState(null);

        if (!ok) {
          setTurn("ai");
          return;
        }

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

        setHumanHasMoved(true); // <-- Set this on *first* valid move

        setTimeout(() => {
          handleSurprise(tile, "human");
          setTimeout(() => {
            if (!winner) {
              setTurn("ai");
            }
          }, 600);
        }, 100);
      }
    });
    setIsModalOpen(true);
  }, [BOARD_SIZE, defenseMode, defenseTiles, disableInput, getQuestionForTurn, handleDefenseClick, handleSurprise, positions.ai, positions.human, setBoardPoints, setHumanPoints, setIsModalOpen, setMoveState, setPositions, setTurn, setHumanHasMoved, winner]);

  return { handleTileClick };
}
