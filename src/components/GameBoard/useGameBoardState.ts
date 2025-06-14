
import { useState } from "react";
import { generateRandomPoints, getRandomSurpriseTiles } from "./utils";
import { DEFAULT_BOARD_SIZE, DEFAULT_DEFENSES, PlayerType, Tile, SurpriseTile, DefenseTile } from "./types";

export function useGameBoardState(boardSize: number, numSurprises: number, numDefenses: number) {
  const [boardPoints, setBoardPoints] = useState<number[][]>(
    () => generateRandomPoints(boardSize)
  );
  const [humanPoints, setHumanPoints] = useState(0);
  const [aiPoints, setAIPoints] = useState(0);
  const [surpriseTiles, setSurpriseTiles] = useState<SurpriseTile[]>(
    () => getRandomSurpriseTiles(boardSize, numSurprises)
  );
  const [defenseTiles, setDefenseTiles] = useState<DefenseTile[]>([]);
  const [defensesUsed, setDefensesUsed] = useState<{human: number; ai: number}>({human: 0, ai: 0});
  const [defenseMode, setDefenseMode] = useState(false);

  // Initial player positions
  const [positions, setPositions] = useState(() => ({
    human: { x: 0, y: 0 },
    ai: { x: boardSize - 1, y: boardSize - 1 }
  }));

  // Winner, turn, and sound state
  const [winner, setWinner] = useState<null | PlayerType>(null);
  const [turn, setTurn] = useState<PlayerType>("human");
  const [moveState, setMoveState] = useState<null | { tile: any; question: any; resolve: (ok: boolean) => void }>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sound, setSound] = useState<"move" | "wrong" | "win" | null>(null);
  const [disableInput, setDisableInput] = useState(false);

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
    sound, setSound,
    disableInput, setDisableInput,
  }
}
