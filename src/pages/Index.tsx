
import React, { useState } from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";
import GameModeSelector from "@/components/GameModeSelector";

// Define an online game interface to store online info
type OnlineGameState = {
  gameCode: string;
  role: "host" | "guest";
} | null;

const Index = () => {
  const { t, language } = useLocalization();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);

  const [step, setStep] = useState<"mode" | "welcome" | "game" | "matchmaking">("mode");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);

  const [mode, setMode] = useState<"ai" | "online" | null>(null);
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
    } else if (selectedMode === "online") {
      // Go to "matchmaking" state: searching for opponent
      setStep("matchmaking");
      setTimeout(() => {
        // Simulate being matched: assign a random game code and role HOST
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setOnlineGame({ gameCode: code, role: "host" });
        setStep("game");
      }, 1600); // simulate matchmaking delay
    }
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

  // "Searching for opponent" screen for New Game/Online
  if (mode === "online" && step === "matchmaking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 px-4 animate-fade-in">
        <div className="w-full max-w-sm mx-auto bg-white/95 shadow-xl rounded-3xl p-7 flex flex-col gap-8 mt-10 items-center">
          <span className="text-4xl animate-pulse">🔎</span>
          <h2 className="text-xl font-bold text-center">{t("online.matchMakingTitle") || "Searching for another player..."}</h2>
          <p className="text-gray-500 text-center">{t("online.matchMakingDesc") || "Hang tight! We'll start the game as soon as a player is found."}</p>
        </div>
        <button
          className="mt-8 text-blue-600 underline"
          onClick={() => {
            setMode(null);
            setStep("mode");
          }}
        >
          {t("general.back") || "Back"}
        </button>
      </div>
    );
  }

  // Online: when onlineGame is set, show board
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
