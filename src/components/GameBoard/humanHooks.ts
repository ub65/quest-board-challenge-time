import { useCallback } from "react";
import { getRandomQuestion } from "./utils";
import { canMoveTo } from "./defenseHelpers";

export function useHumanMoveHandler({
  winner, disableInput, turn, positions, BOARD_SIZE, defenseTiles, difficulty,
  defenseMode, handleDefenseClick, setSound, setPositions, setBoardPoints,
  setIsModalOpen, setMoveState, setTurn, setHumanPoints, handleSurprise,
  questionType,
  getQuestionForTurn,
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
  setSound: (s: any) => void;
  setPositions: any;
  setBoardPoints: any;
  setIsModalOpen: any;
  setMoveState: any;
  setTurn: any;
  setHumanPoints: any;
  handleSurprise: any;
  questionType: "math" | "translate";
  getQuestionForTurn: () => any;
}) {
  const handleTileClick = useCallback((tile) => {
    if (defenseMode) {
      handleDefenseClick(tile);
      return;
    }
    if (winner || disableInput || turn !== "human") return;

    // Check if the human can move to the selected tile
    if (!canMoveTo(tile, positions.ai, defenseTiles, BOARD_SIZE)) {
      setSound("wrong");
      return;
    }

    // Show a question for human move
    const question = getQuestionForTurn();
    setMoveState({
      tile,
      question,
      resolve: (ok: boolean) => {
        setSound(ok ? "move" : "wrong");
        setIsModalOpen(false);
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
  }, [BOARD_SIZE, canMoveTo, defenseMode, defenseTiles, disableInput, getQuestionForTurn, handleDefenseClick, handleSurprise, positions.ai, setBoardPoints, setHumanPoints, setIsModalOpen, setMoveState, setPositions, setSound, setTurn, winner]);

  return { handleTileClick };
}
