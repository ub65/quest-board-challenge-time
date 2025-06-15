
import React from "react";
import GameBoard from "@/components/GameBoard";
import { useLocalization } from "@/contexts/LocalizationContext";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameSettingsModal from "@/components/GameSettingsModal";
import useIndexGameFlow from "./useIndexGameFlow";
import GameModeSelector from "@/components/GameModeSelector";
import OnlineLobby from "@/components/OnlineLobby";

// Main Index component
const Index = () => {
  const { t, language } = useLocalization();
  const flow = useIndexGameFlow();

  // Add dummy props for questionType and onQuestionTypeChange to GameSettingsModal,
  // which are required but in this flow are only controlled (user-facing) from welcome screen.
  const dummyQuestionType = "translate";
  const dummySetQuestionType = () => {};

  // Show lobby or board based on step/mode
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
        questionType={dummyQuestionType}
        onQuestionTypeChange={dummySetQuestionType}
      />
      {/* Game mode selection is now first step */}
      {flow.step === "mode-select" && (
        <GameModeSelector onSelect={flow.handleModeSelect} t={t} />
      )}
      {/* If "online", show the online lobby */}
      {flow.step === "lobby" && (
        <OnlineLobby
          onBack={() => flow.setStep("mode-select")}
          t={t}
          onGameStart={flow.handleOnlineGameStart}
          onVsAISolo={flow.handleVsAISolo}
        />
      )}
      {/* Old single-player welcome screen */}
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
      {/* If in-game, pass all relevant props */}
      {flow.step === "game" && (
        <div className="w-full max-w-3xl animate-fade-in">
          <GameBoard
            key={flow.gameKey}
            difficulty={flow.difficulty}
            onRestart={flow.handleRestart}
            playerName={flow.playerName}
            gameCode={flow.gameCode}
            onlineRole={flow.onlineRole}
            questionType={flow.questionType}
            isOnline={flow.mode === "online"}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
