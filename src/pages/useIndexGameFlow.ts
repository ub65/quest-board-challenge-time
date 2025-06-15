
import { useState } from "react";

export type OnlineGameState = {
  gameCode: string;
  role: "host" | "guest";
} | null;

type Mode = "ai" | "online" | null;
type Step = "mode" | "welcome" | "game" | "matchmaking" | "lobby";

export default function useIndexGameFlow() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);

  const [step, setStep] = useState<Step>("mode");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);
  const [mode, setMode] = useState<Mode>(null);
  const [onlineGame, setOnlineGame] = useState<OnlineGameState>(null);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setStep("mode");
    setMode(null);
    setOnlineGame(null);
    setPlayerName("");
  };

  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    setPlayerName("");
    if (selectedMode === "ai") {
      setStep("welcome");
    } else if (selectedMode === "online") {
      setStep("lobby");
    }
  };

  // For passing to OnlineLobby
  const handleLobbyBack = () => {
    setStep("mode");
    setMode(null);
    setOnlineGame(null);
    setPlayerName("");
  };
  const handleOnlineGameStart = (gameCode: string, role: "host" | "guest") => {
    setOnlineGame({ gameCode, role });
    setStep("game");
  };
  const handleLobbyVsAISolo = () => {
    setMode("ai");
    setStep("welcome");
    setOnlineGame(null);
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
    mode, setMode,
    onlineGame, setOnlineGame,

    handleRestart,
    handleModeSelect,
    handleLobbyBack,
    handleOnlineGameStart,
    handleLobbyVsAISolo,
  };
}
