
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

  // Refactor steps for clarity
  // mode: which mode user picked, step: UI progression
  const [step, setStep] = useState<"mode" | "welcome" | "game" | "matchmaking">("mode");
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

  // Mode selection logic
  const handleSelectMode = (selectedMode: "ai" | "online") => {
    setMode(selectedMode);
    setPlayerName(""); // reset name in both flows, to ensure clean screen

    if (selectedMode === "ai") {
      // Start AI welcome flow
      setStep("welcome");
    } else if (selectedMode === "online") {
      // Enter "matchmaking" state: searching for opponent
      setStep("matchmaking");
      // Simulate matchmaking delay, then match and enter game
      setTimeout(() => {
        // Generate a random game code and assign role "host"
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setOnlineGame({ gameCode: code, role: "host" });
        setStep("game");
      }, 1600);
    }
  };

  // 1. Main mode SELECTOR
  if (step === "mode") {
    return (
      <GameModeSelector
        t={t}
        onSelect={handleSelectMode}
      />
    );
  }

  // 2. Online: "Searching for another player..." (matchmaking)
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
            setOnlineGame(null);
            setPlayerName(""); // clear name when returning to mode select
          }}
        >
          {t("general.back") || "Back"}
        </button>
      </div>
    );
  }

  // 3. Online: When matched, show board (with game code & role)
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

  // 4. AI flow: Welcome, then game
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

