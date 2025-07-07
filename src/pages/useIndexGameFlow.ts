import { useState } from "react";
import { DEFAULT_DEFENSES } from "@/components/GameBoard/types";

type Mode = "ai" | "online";
type Step = "welcome" | "mode-select" | "online-lobby" | "game";

type OnlineGameData = {
  roomId: string;
  role: "host" | "guest";
  opponentName: string;
};

export default function useIndexGameFlow() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);
  const [step, setStep] = useState<Step>("welcome");
  const [mode, setMode] = useState<Mode>("ai");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState<number>(0.5);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(7);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(DEFAULT_DEFENSES);
  const [questionType, setQuestionType] = useState<"translate" | "math" | "trivia">("translate");
  const [onlineGameData, setOnlineGameData] = useState<OnlineGameData | null>(null);

  const handleRestart = () => {
    console.log('[FLOW] Restarting game, incrementing game key');
    setGameKey((k) => k + 1);
    setStep("welcome");
    setPlayerName("");
    setOnlineGameData(null);
  };

  const handleStart = () => {
    console.log('[FLOW] Starting game selection');
    setStep("mode-select");
  };

  const handleModeSelect = (selectedMode: Mode) => {
    console.log('[FLOW] Mode selected:', selectedMode);
    setMode(selectedMode);
    
    if (selectedMode === "ai") {
      setStep("game");
    } else if (selectedMode === "online") {
      setStep("online-lobby");
    }
  };

  const handleOnlineGameStart = (roomId: string, role: "host" | "guest", opponentName: string) => {
    console.log('[FLOW] Online game starting:', { roomId, role, opponentName });
    setOnlineGameData({ roomId, role, opponentName });
    setMode("online");
    setStep("game");
  };

  // Enhanced setBoardSize with proper logging and game restart
  const handleSetBoardSize = (newSize: number) => {
    console.log('[FLOW] Board size change requested from', boardSize, 'to', newSize);
    
    if (newSize !== boardSize) {
      console.log('[FLOW] Board size is different, updating and restarting game');
      setBoardSize(newSize);
      
      // Force game restart when board size changes during gameplay
      if (step === "game") {
        setGameKey((k) => {
          const newKey = k + 1;
          console.log('[FLOW] Game key incremented to', newKey);
          return newKey;
        });
      }
    } else {
      console.log('[FLOW] Board size unchanged, no restart needed');
    }
  };

  // Enhanced setNumSurprises with proper logging and game restart
  const handleSetNumSurprises = (newCount: number) => {
    console.log('[FLOW] Surprises count change requested from', numSurprises, 'to', newCount);
    
    if (newCount !== numSurprises) {
      console.log('[FLOW] Surprises count is different, updating and restarting game');
      setNumSurprises(newCount);
      
      // Force game restart when surprises count changes during gameplay
      if (step === "game") {
        setGameKey((k) => {
          const newKey = k + 1;
          console.log('[FLOW] Game key incremented to', newKey, 'due to surprises change');
          return newKey;
        });
      }
    } else {
      console.log('[FLOW] Surprises count unchanged, no restart needed');
    }
  };

  // Enhanced setNumDefenses with proper logging and game restart
  const handleSetNumDefenses = (newCount: number) => {
    console.log('[FLOW] Defenses count change requested from', numDefenses, 'to', newCount);
    
    if (newCount !== numDefenses) {
      console.log('[FLOW] Defenses count is different, updating and restarting game');
      setNumDefenses(newCount);
      
      // Force game restart when defenses count changes during gameplay
      if (step === "game") {
        setGameKey((k) => {
          const newKey = k + 1;
          console.log('[FLOW] Game key incremented to', newKey, 'due to defenses change');
          return newKey;
        });
      }
    } else {
      console.log('[FLOW] Defenses count unchanged, no restart needed');
    }
  };

  return {
    difficulty, setDifficulty,
    gameKey, setGameKey,
    step, setStep,
    mode, setMode,
    settingsOpen, setSettingsOpen,
    playerName, setPlayerName,
    soundEnabled, setSoundEnabled,
    volume, setVolume,
    questionTime, setQuestionTime,
    boardSize, 
    setBoardSize: handleSetBoardSize,
    numSurprises, 
    setNumSurprises: handleSetNumSurprises,
    numDefenses, 
    setNumDefenses: handleSetNumDefenses,
    questionType, setQuestionType,
    onlineGameData, setOnlineGameData,
    handleRestart,
    handleStart,
    handleModeSelect,
    handleOnlineGameStart,
  };
}