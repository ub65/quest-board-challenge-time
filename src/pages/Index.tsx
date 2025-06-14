
import React, { useState } from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";
import GameModeSelector from "@/components/GameModeSelector";
import OnlineLobby from "@/components/OnlineLobby";

const Index = () => {
  const { t, language } = useLocalization();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);

  const [step, setStep] = useState<"mode" | "welcome" | "game" | "online">("mode");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  // Game settings state for initial modal - pass dummy handlers as non-restart game
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);

  // New: Track current mode ("ai" or "online")
  const [mode, setMode] = useState<"ai" | "online" | null>(null);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setStep("mode");
    setMode(null);
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

  // If mode selection, show that first
  if (step === "mode") {
    return (
      <GameModeSelector
        t={t}
        onSelect={handleSelectMode}
      />
    );
  }

  // Online: show online lobby (placeholder)
  if (mode === "online" && step === "online") {
    return (
      <OnlineLobby
        t={t}
        onBack={() => {
          setMode(null);
          setStep("mode");
        }}
      />
    );
  }

  // AI: normal flow (welcome -> game)
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
      {step === "game" && (
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
