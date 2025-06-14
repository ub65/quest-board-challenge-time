
import React, { useState } from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";
import GameModeSelector from "@/components/GameModeSelector";
import OnlineLobby from "@/components/OnlineLobby";

// Define an online game interface to store online info
type OnlineGameState = {
  gameCode: string;
  role: "host" | "guest";
} | null;

const Index = () => {
  const { t, language } = useLocalization();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);

  const [step, setStep] = useState<"mode" | "welcome" | "game" | "online">("mode");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);

  const [mode, setMode] = useState<"ai" | "online" | null>(null);

  // Online game state
  const [onlineGame, setOnlineGame] = useState<OnlineGameState>(null);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setStep("mode");
    setMode(null);
    setOnlineGame(null);
  };

  // Handle mode selection
  const handleSelectMode = (selectedMode: "ai" | "online") => {
    setMode(selectedMode);
    if (selectedMode === "ai") {
      setStep("welcome");
    } else {
      setStep("online");
    }
  };

  // Callback triggered by OnlineLobby to actually start the online game
  const handleOnlineGameStart = (gameCode: string, role: "host" | "guest") => {
    setOnlineGame({ gameCode, role });
    setStep("game");
  };

  // Callback for OnlineLobby: play vs AI after lobby creation/join
  const handleOnlineVsAISolo = () => {
    setOnlineGame(null);
    setMode("ai");
    setStep("welcome");
  };

  // Mode selection screen
  if (step === "mode") {
    return (
      <GameModeSelector
        t={t}
        onSelect={handleSelectMode}
      />
    );
  }

  // Online: if onlineGame is set, show board; else show OnlineLobby
  if (mode === "online") {
    if (step === "online" && !onlineGame) {
      return (
        <OnlineLobby
          t={t}
          onBack={() => {
            setMode(null);
            setStep("mode");
          }}
          onGameStart={handleOnlineGameStart}
          onVsAISolo={handleOnlineVsAISolo}
        />
      );
    }
    // If onlineGame is set, show game board (pass online props here as needed)
    if (step === "game" && onlineGame) {
      return (
        <div className="w-full max-w-3xl animate-fade-in">
          <GameBoard
            key={gameKey}
            difficulty={difficulty}
            onRestart={handleRestart}
            playerName={playerName}
            // Optionally, pass gameCode/role as props for online
            // gameCode={onlineGame.gameCode}
            // onlineRole={onlineGame.role}
          />
        </div>
      );
    }
  }

  // AI flow (welcome -> game)
  return (
    <div
      className={`
        min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 flex flex-col items-center justify-center px-2 sm:px-6
      `}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <GameSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        boardSize={boardSize}
        onBoardSizeChange={setBoardSize}
        questionTime={questionTime}
        onQuestionTimeChange={setQuestionTime}
        surpriseCount={numSurprises}
        onSurpriseCountChange={setNumSurprises}
        numDefenses={numDefenses}
        onNumDefensesChange={setNumDefenses}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
      {step === "welcome" && (
        <WelcomeScreen
          language={language}
          playerName={playerName}
          setPlayerName={setPlayerName}
          t={t}
          onStart={() => setStep("game")}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      {step === "game" && mode === "ai" && (
        <div className="w-full max-w-3xl animate-fade-in">
          <GameBoard
            key={gameKey}
            difficulty={difficulty}
            onRestart={handleRestart}
            playerName={playerName}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
