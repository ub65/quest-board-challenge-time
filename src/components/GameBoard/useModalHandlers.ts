
import { useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

export function useModalHandlers({
  winner,
  BOARD_SIZE,
  setPositions,
  setBoardPoints,
  setAIPoints,
  setSound,
  setTurn,
  setDisableInput,
  surpriseHandler,
}: {
  winner: any;
  BOARD_SIZE: number;
  setPositions: any;
  setBoardPoints: any;
  setAIPoints: any;
  setSound: any;
  setTurn: any;
  setDisableInput: any;
  surpriseHandler: any;
}) {
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);
  const aiMovingRef = useRef(false);

  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
    setSound("move");
    setPositions((p) => {
      const { x, y } = aiModalState.targetTile;
      setBoardPoints((prev) => {
        const newBoard = prev.map((row) => [...row]);
        if (!((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1))) {
          setAIPoints((cur) => cur + newBoard[y][x]);
        }
        return newBoard;
      });
      return { ...p, ai: { x, y } };
    });
    setTimeout(() => {
      surpriseHandler(aiModalState.targetTile, "ai");
      setAIModalState(null);
      setTimeout(() => {
        if (!winner) {
          setTurn("human");
          setDisableInput(false);
          aiMovingRef.current = false;
        }
      }, 600);
    }, 100);
  };

  return {
    aiModalState,
    setAIModalState,
    aiMovingRef,
    handleAIModalSubmit,
  };
}
