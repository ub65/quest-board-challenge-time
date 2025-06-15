
import { useState } from "react";
import { DEFAULT_DEFENSES } from "@/components/GameBoard/types";

// Modes: "ai" (solo) or "online" (multiplayer)
type Mode = "ai" | "online";
type Step = "mode-select" | "lobby" | "welcome" | "game";

export default function useIndexGameFlow() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);

  // Add online gameCode/role state
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [onlineRole, setOnlineRole] = useState<"host" | "guest" | null>(null);

  // Steps: now start at mode-select
  const [step, setStep] = useState<Step>("mode-select");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(DEFAULT_DEFENSES);
  const [questionType, setQuestionType] = useState<"translate" | "math">("translate");

  // Mode: single player ("ai") or online multiplayer ("online")
  const [mode, setMode] = useState<Mode>("ai");

  // Step 1: User selects mode (ai/online)
  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    if (selectedMode === "ai") {
      setStep("welcome");
    } else if (selectedMode === "online") {
      setStep("lobby");
    }
  };

  // "Solo" play (AI)
  const handleVsAISolo = () => {
    setGameKey(k => k + 1);
    setOnlineRole(null);
    setGameCode(null);
    setStep("welcome");
  };

  // For online, pass up from lobby component the code+role
  const handleOnlineGameStart = (code: string, role: "host" | "guest") => {
    setGameCode(code);
    setOnlineRole(role);
    setStep("game");
  };

  // When user starts solo game (enters name and presses Start), go to game
  const handleStart = () => {
    setStep("game");
    setOnlineRole(null);
    setGameCode(null);
  };

  // Restart: Reset everything except settings
  const handleRestart = () => {
    setGameKey(k => k + 1);
    setStep(mode === "online" ? "lobby" : "welcome");
    setPlayerName("");
    setOnlineRole(null);
    setGameCode(null);
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
    questionType, setQuestionType,
    mode, setMode,
    handleRestart,
    handleStart,
    gameCode, setGameCode,
    onlineRole, setOnlineRole,
    handleModeSelect,
    handleOnlineGameStart,
    handleVsAISolo,
  };
}
