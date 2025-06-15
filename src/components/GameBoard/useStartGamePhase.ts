
import { useState, useEffect } from "react";
import { generateRandomPoints, getRandomSurpriseTiles } from "./utils";
import { Tile, SurpriseTile, DefenseTile } from "./types";

/**
 * Handles the pre-game: randomizing starting player and waiting for "Start Game".
 */
export function useStartGamePhase({
  boardSize,
  numSurprises,
  numDefenses,
  setPositions,
  setWinner,
  setTurn,
  setHumanPoints,
  setAIPoints,
  setBoardPoints,
  setSurpriseTiles,
  setDefenseTiles,
  setDefensesUsed,
  setDefenseMode,
  setHumanHasMoved,
  setDisableInput,
  getRandomStartingPlayer,
}) {
  const [gameStarted, setGameStarted] = useState(false);
  const [startingPlayer, setStartingPlayer] = useState<"human" | "ai" | null>(null);

  // On new config, reset the game state for pre-game
  useEffect(() => {
    const randomStartingPlayer = getRandomStartingPlayer();
    setStartingPlayer(randomStartingPlayer);
    setGameStarted(false);
    setTurn(randomStartingPlayer);
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({ human: 0, ai: 0 });
    setDefenseMode(false);
    setHumanHasMoved(false);
    setDisableInput(true);
    // eslint-disable-next-line
  }, [boardSize, numSurprises, numDefenses, setPositions, setWinner, setTurn, setHumanPoints, setAIPoints, setBoardPoints, setSurpriseTiles, setDefenseTiles, setDefensesUsed, setDefenseMode, setHumanHasMoved, getRandomStartingPlayer]);

  function handleStartGame() {
    setGameStarted(true);
    setDisableInput(false);
    setHumanHasMoved(startingPlayer === "ai"); // If AI starts, "human" has "moved"
  }

  return {
    gameStarted,
    startingPlayer,
    handleStartGame,
  };
}
