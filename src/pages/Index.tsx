import React, { useState } from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";

const Index = () => {
  const { t, language } = useLocalization();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [gameKey, setGameKey] = useState(0);
  const [step, setStep] = useState<"welcome" | "game">("welcome");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // Game settings state for initial modal - pass dummy handlers as non-restart game
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [questionTime, setQuestionTime] = useState(20);
  const [boardSize, setBoardSize] = useState(8);
  const [numSurprises, setNumSurprises] = useState(4);
  const [numDefenses, setNumDefenses] = useState(2);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setStep("welcome");
  };

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
