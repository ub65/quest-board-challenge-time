
import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import {
  getValidMoves,
  positionsEqual,
} from "./utils";
import GameBoardArea from "./GameBoardArea";
import GameBoardModals from "./GameBoardModals";
import GameBoardPreGameOverlay from "./GameBoardPreGameOverlay";
import { useMainGameBoard } from "./useMainGameBoard";
import { DEFAULT_BOARD_SIZE, DEFAULT_QUESTION_TIME } from "./types";

const MainGameBoard = ({
  difficulty: initialDifficulty,
  onRestart,
  playerName,
  gameCode,
  onlineRole,
  questionType = "translate",
  isOnline = false,
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
  playerName?: string;
  gameCode?: string;
  onlineRole?: "host" | "guest";
  questionType?: "translate" | "math";
  isOnline?: boolean;
}) => {
  const { language } = useLocalization();
  const gameBoard = useMainGameBoard({
    initialDifficulty,
    questionType,
  });

  const onlineBanner = isOnline && gameCode && onlineRole ? (
    <div className="bg-blue-50 border border-blue-300 text-blue-700 rounded p-3 mb-3 text-center">
      <span className="font-bold">Online Mode:</span>{" "}
      Game Code: <span className="font-mono text-base">{gameCode}</span> |{" "}
      Role: {onlineRole === "host" ? "Host" : "Guest"}
    </div>
  ) : null;

  return (
    <div className="relative w-full">
      {onlineBanner}
      
      <GameBoardPreGameOverlay
        gameStarted={gameBoard.startPhase.gameStarted}
        startingPlayer={gameBoard.startPhase.startingPlayer}
        t={gameBoard.t}
        onStartGame={gameBoard.startPhase.handleStartGame}
      />
      
      {gameBoard.startPhase.gameStarted && (
        <GameBoardArea
          language={language}
          t={gameBoard.t}
          sound={gameBoard.sound}
          turn={gameBoard.turn}
          winner={gameBoard.winner}
          difficulty={gameBoard.difficulty}
          humanPoints={gameBoard.humanPoints}
          aiPoints={gameBoard.aiPoints}
          numDefenses={gameBoard.numDefenses}
          defensesUsed={gameBoard.defensesUsed}
          onPlaceDefense={gameBoard.startDefensePlacement}
          defenseMode={gameBoard.defenseMode}
          boardSize={gameBoard.BOARD_SIZE}
          boardPoints={gameBoard.boardPoints}
          positions={gameBoard.positions}
          humanTarget={gameBoard.humanTarget}
          aiTarget={gameBoard.aiTarget}
          disableInput={gameBoard.disableInput}
          handleTileClick={gameBoard.handleTileClick}
          getValidMoves={(pos) =>
            getValidMoves(
              pos,
              gameBoard.BOARD_SIZE,
              gameBoard.defenseTiles,
              pos === gameBoard.positions.human ? gameBoard.positions.ai : gameBoard.positions.human
            )
          }
          positionsEqual={positionsEqual}
          surpriseTiles={gameBoard.surpriseTiles}
          defenseTiles={gameBoard.defenseTiles}
          aiPendingTarget={gameBoard.aiModalState ? gameBoard.aiModalState.targetTile : null}
          moveState={gameBoard.moveState}
          isModalOpen={gameBoard.isModalOpen}
          aiModalState={gameBoard.aiModalState}
          questionTime={gameBoard.questionTime}
          onHumanSubmit={gameBoard.moveState?.resolve}
          onAISubmit={gameBoard.handleAIModalSubmit}
          onRestart={gameBoard.handleRestart}
          settingsOpen={gameBoard.settingsOpen}
          setSettingsOpen={gameBoard.setSettingsOpen}
          soundEnabled={gameBoard.soundEnabled}
          setSoundEnabled={gameBoard.setSoundEnabled}
          onBoardSizeChange={v => gameBoard.setBoardSize(Math.max(5, Math.min(12, v || DEFAULT_BOARD_SIZE)))}
          onQuestionTimeChange={v => gameBoard.setQuestionTime(Math.max(6, Math.min(40, v || DEFAULT_QUESTION_TIME)))}
          onSurpriseCountChange={gameBoard.setNumSurprises}
          onNumDefensesChange={gameBoard.setNumDefenses}
          onDifficultyChange={gameBoard.setDifficulty}
          surpriseCount={gameBoard.numSurprises}
          playerName={playerName}
        >
          <GameBoardModals
            moveState={gameBoard.moveState}
            isModalOpen={gameBoard.isModalOpen}
            aiModalState={gameBoard.aiModalState}
            winner={gameBoard.winner}
            questionTime={gameBoard.questionTime}
            onHumanSubmit={gameBoard.moveState?.resolve}
            onAISubmit={gameBoard.handleAIModalSubmit}
            questionType={questionType}
          />
        </GameBoardArea>
      )}
    </div>
  );
};

export default MainGameBoard;
