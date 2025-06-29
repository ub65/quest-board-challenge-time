import React from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";
import useIndexGameFlow from "./useIndexGameFlow";

const Index = () => {
  const { t, language } = useLocalization();
  const flow = useIndexGameFlow();

  // Add dummy props for questionType and onQuestionTypeChange to GameSettingsModal,
  // which are required but in this flow are only controlled (user-facing) from welcome screen.
  const dummyQuestionType = "translate";
  const dummySetQuestionType = () => {};

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
        questionType={dummyQuestionType}
        onQuestionTypeChange={dummySetQuestionType}
        soundEnabled={flow.soundEnabled}
        onSoundEnabledChange={flow.setSoundEnabled}
        volume={flow.volume}
        onVolumeChange={flow.setVolume}
      />
      {flow.step === "welcome" && (
        <WelcomeScreen
          language={language}
          playerName={flow.playerName}
          setPlayerName={flow.setPlayerName}
          t={t}
          onStart={flow.handleStart}
          onSettings={() => flow.setSettingsOpen(true)}
          questionType={flow.questionType}
          setQuestionType={flow.setQuestionType}
        />
      )}
      {flow.step === "game" && (
        <div className="w-full max-w-3xl animate-fade-in">
          <GameBoard
            key={flow.gameKey}
            difficulty={flow.difficulty}
            onRestart={flow.handleRestart}
            playerName={flow.playerName}
            questionType={flow.questionType}
            soundEnabled={flow.soundEnabled}
            volume={flow.volume}
          />
        </div>
      )}
    </div>
  );
};

export default Index;