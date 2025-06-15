
import React, { createContext, useContext } from "react";
import { useGameBoardState } from "./useGameBoardState";
import { useGameSettings } from "./useGameSettings";

// Provide board and game state as Context for deep children if needed (future-proofing)
const GameBoardContext = createContext<any>(undefined);

export function GameBoardProvider({ children, settings }: { children: React.ReactNode; settings: any }) {
  // Settings state and board state brought together
  const settingsState = useGameSettings(settings.initialDifficulty);
  const boardState = useGameBoardState(settingsState.boardSize, settingsState.numSurprises, settingsState.numDefenses);

  return (
    <GameBoardContext.Provider
      value={{
        ...settingsState,
        ...boardState,
      }}
    >
      {children}
    </GameBoardContext.Provider>
  );
}

export function useGameBoard() {
  const ctx = useContext(GameBoardContext);
  if (!ctx) throw new Error("useGameBoard must be used within GameBoardProvider");
  return ctx;
}
