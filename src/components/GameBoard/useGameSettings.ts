
import { useState } from "react";
import { DEFAULT_BOARD_SIZE, DEFAULT_QUESTION_TIME, DEFAULT_DEFENSES } from "./types";

export function useGameSettings(initialDifficulty: "easy" | "medium" | "hard") {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(initialDifficulty);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState<number>(DEFAULT_QUESTION_TIME);
  const [boardSize, setBoardSize] = useState<number>(DEFAULT_BOARD_SIZE);
  const [numSurprises, setNumSurprises] = useState<number>(4);
  const [numDefenses, setNumDefenses] = useState(DEFAULT_DEFENSES);

  return {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    soundEnabled, setSoundEnabled,
    questionTime, setQuestionTime,
    boardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
  };
}
