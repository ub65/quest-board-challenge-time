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

  // Refactor steps for clarity
  // mode: which mode user picked, step: UI progression
  const [step, setStep] = useState<"mode" | "welcome" | "game" | "matchmaking" | "lobby">("mode");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Reset player name when changing mode, to ensure no confusion
  const [playerName, setPlayerName] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);

  const [mode, setMode] = useState<"ai" | "online" | null>(null);
  const [onlineGame, setOnlineGame] = useState<OnlineGameState>(null);

  // When "Restart" go back to root state
  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setStep("mode");
    setMode(null);
    setOnlineGame(null);
    setPlayerName(""); // reset name for next new game
  };

  // Show mode selection UI
  if (step === "mode") {
    return (
      <GameModeSelector
        t={t}
        onSelect={(selectedMode) => {
          setMode(selectedMode);
          setPlayerName("");
          if (selectedMode === "ai") {
            setStep("welcome");
          } else if (selectedMode === "online") {
            setStep("lobby");
          }
        }}
      />
    );
  }

  // --- LOBBY FLOW FOR ONLINE ---
  if (mode === "online" && step === "lobby") {
    return (
      <OnlineLobby
        t={t}
        onBack={() => {
          setStep("mode");
          setMode(null);
          setOnlineGame(null);
          setPlayerName("");
        }}
        onGameStart={(gameCode: string, role: "host" | "guest") => {
          setOnlineGame({ gameCode, role });
          setStep("game");
        }}
        onVsAISolo={() => {
          setMode("ai");
          setStep("welcome");
          setOnlineGame(null);
        }}
      />
    );
  }

  // --- ONLINE: SHOW BOARD WHEN ONLINE GAME IS ACTIVE ---
  if (mode === "online" && step === "game" && onlineGame) {
    return (
      <div className="w-full max-w-3xl animate-fade-in">
        <GameBoard
          key={gameKey}
          difficulty={difficulty}
          onRestart={handleRestart}
          playerName={playerName}
          gameCode={onlineGame.gameCode}
          onlineRole={onlineGame.role}
        />
      </div>
    );
  }

  // AI SINGLE PLAYER FLOW
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
      {/* Show welcome only in AI mode */}
      {step === "welcome" && mode === "ai" && (
        <WelcomeScreen
          language={language}
          playerName={playerName}
          setPlayerName={setPlayerName}
          t={t}
          onStart={() => setStep("game")}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      {/* AI game */}
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
