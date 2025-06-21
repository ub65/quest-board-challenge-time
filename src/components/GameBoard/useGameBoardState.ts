
import { useState } from "react";
import { generateRandomPoints, getRandomSurpriseTiles } from "./utils";
import { PlayerType, Tile, SurpriseTile, DefenseTile } from "./types";

function getRandomStartingPlayer(): PlayerType {
  return Math.random() < 0.5 ? "human" : "ai";
}

export function useGameBoardState(boardSize: number, numSurprises: number) {
  const [boardPoints, setBoardPoints] = useState<number[][]>(() => generateRandomPoints(boardSize));
  const [humanPoints, setHumanPoints] = useState(0);
  const [aiPoints, setAIPoints] = useState(0);
  const [surpriseTiles, setSurpriseTiles] = useState<SurpriseTile[]>(() => getRandomSurpriseTiles(boardSize, numSurprises));
  const [defenseTiles, setDefenseTiles] = useState<DefenseTile[]>([]);
  const [defensesUsed, setDefensesUsed] = useState<{human: number; ai: number}>({human: 0, ai: 0});
  const [defenseMode, setDefenseMode] = useState(false);
  const [positions, setPositions] = useState(() => ({
    human: { x: 0, y: 0 },
    ai: { x: boardSize - 1, y: boardSize - 1 }
  }));
  const [winner, setWinner] = useState<null | PlayerType>(null);
  const [turn, setTurn] = useState<PlayerType>("human");
  const [moveState, setMoveState] = useState<null | { tile: any; question: any; resolve: (ok: boolean) => void }>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [humanHasMoved, setHumanHasMoved] = useState(false);

  return {
    boardPoints, setBoardPoints,
    humanPoints, setHumanPoints,
    aiPoints, setAIPoints,
    surpriseTiles, setSurpriseTiles,
    defenseTiles, setDefenseTiles,
    defensesUsed, setDefensesUsed,
    defenseMode, setDefenseMode,
    positions, setPositions,
    winner, setWinner,
    turn, setTurn,
    moveState, setMoveState,
    isModalOpen, setIsModalOpen,
    disableInput, setDisableInput,
    humanHasMoved, setHumanHasMoved,
    getRandomStartingPlayer,
  }
}
