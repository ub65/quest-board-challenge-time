
import { useState } from "react";

type Mode = "ai";
type Step = "welcome" | "game";

export default function useIndexGameFlow() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);

  // Only "welcome" and "game" remain
  const [step, setStep] = useState<Step>("welcome");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);

  // Only single-player "ai" mode
  const mode: Mode = "ai";

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setStep("welcome");
    setPlayerName("");
  };

  // No online/other mode select - always AI
  const handleStart = () => {
    setStep("game");
  };

  return {
    difficulty, setDifficulty,
    gameKey, setGameKey,
    step, setStep,
    settingsOpen, setSettingsOpen,
    playerName, setPlayerName,
    soundEnabled, setSoundEnabled,
    questionTime, setQuestionTime,
    boardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
    mode,
    handleRestart,
    handleStart,
  };
}
