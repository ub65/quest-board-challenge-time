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

  console.log('[INDEX] Current flow state:', {
    step: flow.step,
    boardSize: flow.boardSize,
    difficulty: flow.difficulty,
    questionTime: flow.questionTime,
    numSurprises: flow.numSurprises,
    numDefenses: flow.numDefenses,
    gameKey: flow.gameKey
  });

  // Enhanced board size change handler with detailed logging
  const handleBoardSizeChange = (newSize: number) => {
    console.log('[INDEX] Board size change requested:', {
      from: flow.boardSize,
      to: newSize,
      gameKey: flow.gameKey
    });
    flow.setBoardSize(newSize);
  };

  // Enhanced question time change handler
  const handleQuestionTimeChange = (newTime: number) => {
    console.log('[INDEX] Question time change requested:', {
      from: flow.questionTime,
      to: newTime
    });
    flow.setQuestionTime(newTime);
  };

  // Enhanced surprises change handler
  const handleSurprisesChange = (newCount: number) => {
    console.log('[INDEX] Surprises count change requested:', {
      from: flow.numSurprises,
      to: newCount,
      gameKey: flow.gameKey
    });
    flow.setNumSurprises(newCount);
  };

  // Enhanced defenses change handler
  const handleDefensesChange = (newCount: number) => {
    console.log('[INDEX] Defenses count change requested:', {
      from: flow.numDefenses,
      to: newCount,
      gameKey: flow.gameKey
    });
    flow.setNumDefenses(newCount);
  };

  // Enhanced pause handler
  const handlePause = () => {
    console.log('[INDEX] Game paused, returning to welcome screen');
    flow.setStep("welcome");
  };

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
        onBoardSizeChange={handleBoardSizeChange}
        questionTime={flow.questionTime}
        onQuestionTimeChange={handleQuestionTimeChange}
        surpriseCount={flow.numSurprises}
        onSurpriseCountChange={handleSurprisesChange}
        numDefenses={flow.numDefenses}
        onNumDefensesChange={handleDefensesChange}
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
            onPause={handlePause}
            playerName={flow.playerName}
            questionType={flow.questionType}
            soundEnabled={flow.soundEnabled}
            volume={flow.volume}
            boardSize={flow.boardSize}
            questionTime={flow.questionTime}
            numSurprises={flow.numSurprises}
            numDefenses={flow.numDefenses}
          />
        </div>
      )}
    </div>
  );
};

export default Index;