
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

  // --- STEP: Mode selection ---
  if (flow.step === "mode") {
    return (
      <GameModeSelector
        t={t}
        onSelect={flow.handleModeSelect}
      />
    );
  }

  // --- STEP: Online / Lobby ---
  if (flow.mode === "online" && flow.step === "lobby") {
    return (
      <OnlineLobby
        t={t}
        onBack={flow.handleLobbyBack}
        onGameStart={flow.handleOnlineGameStart}
        onVsAISolo={flow.handleLobbyVsAISolo}
      />
    );
  }

  // --- STEP: Online board ---
  if (flow.mode === "online" && flow.step === "game" && flow.onlineGame) {
    return (
      <div className="w-full max-w-3xl animate-fade-in">
        <GameBoard
          key={flow.gameKey}
          difficulty={flow.difficulty}
          onRestart={flow.handleRestart}
          playerName={flow.playerName}
          gameCode={flow.onlineGame.gameCode}
          onlineRole={flow.onlineGame.role}
        />
      </div>
    );
  }

  // --- STEP: AI flow ---
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
      {flow.step === "welcome" && flow.mode === "ai" && (
        <WelcomeScreen
          language={language}
          playerName={flow.playerName}
          setPlayerName={flow.setPlayerName}
          t={t}
          onStart={() => flow.setStep("game")}
          onSettings={() => flow.setSettingsOpen(true)}
        />
      )}
      {flow.step === "game" && flow.mode === "ai" && (
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
