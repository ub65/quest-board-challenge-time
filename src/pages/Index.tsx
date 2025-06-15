import React from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";
import GameModeSelector from "@/components/GameModeSelector";
import OnlineLobby from "@/components/OnlineLobby";
import useIndexGameFlow from "./useIndexGameFlow";

const Index = () => {
  const { t, language } = useLocalization();
  const flow = useIndexGameFlow();

  // --- Single-player flow only ---
  return (
    <div
      className={`
        min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 flex flex-col items-center justify-center px-2 sm:px-6
      `}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <GameSettingsModal
        open={flow.settingsOpen}
        onOpenChange={flow.setSettingsOpen}
        soundEnabled={flow.soundEnabled}
        onSoundChange={flow.setSoundEnabled}
        boardSize={flow.boardSize}
        onBoardSizeChange={flow.setBoardSize}
        questionTime={flow.questionTime}
        onQuestionTimeChange={flow.setQuestionTime}
        surpriseCount={flow.numSurprises}
        onSurpriseCountChange={flow.setNumSurprises}
        numDefenses={flow.numDefenses}
        onNumDefensesChange={flow.setNumDefenses}
        difficulty={flow.difficulty}
        onDifficultyChange={flow.setDifficulty}
      />
      {flow.step === "welcome" && (
        <WelcomeScreen
          language={language}
          playerName={flow.playerName}
          setPlayerName={flow.setPlayerName}
          t={t}
          onStart={flow.handleStart}
          onSettings={() => flow.setSettingsOpen(true)}
        />
      )}
      {flow.step === "game" && (
        <div className="w-full max-w-3xl animate-fade-in">
          <GameBoard
            key={flow.gameKey}
            difficulty={flow.difficulty}
            onRestart={flow.handleRestart}
            playerName={flow.playerName}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
