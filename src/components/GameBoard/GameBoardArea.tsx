
import React, { RefObject } from "react";
import GameHeader from "../GameHeader";
import GameBoardHud from "./GameBoardHud";
import GameBoardGrid from "../GameBoardGrid";
import GameBoardWinnerOverlay from "./GameBoardWinnerOverlay";
import GameBoardModals from "./GameBoardModals";
import GameBoardTurnInfo from "./GameBoardTurnInfo";
import GameSettingsModal from "../GameSettingsModal";
import SoundManager from "../SoundManager";

type GameBoardAreaProps = {
  language: string;
  t: (key: string, params?: any) => string;
  sound: "move" | "wrong" | "win" | null;
  turn: "human" | "ai";
  winner: "human" | "ai" | null;
  difficulty: "easy" | "medium" | "hard";
  humanPoints: number;
  aiPoints: number;
  numDefenses: number;
  defensesUsed: { human: number; ai: number };
  onPlaceDefense: () => void;
  defenseMode: boolean;
  boardSize: number;
  boardPoints: number[][];
  positions: { human: { x: number; y: number }; ai: { x: number; y: number } };
  humanTarget: { x: number; y: number };
  aiTarget: { x: number; y: number };
  disableInput: boolean;
  handleTileClick: (tile: { x: number; y: number }) => void;
  getValidMoves: (pos: { x: number; y: number }) => { x: number; y: number }[];
  positionsEqual: (a: { x: number; y: number }, b: { x: number; y: number }) => boolean;
  surpriseTiles: any[];
  defenseTiles: any[];
  aiPendingTarget: any;
  moveState: any;
  isModalOpen: boolean;
  aiModalState: any;
  questionTime: number;
  onHumanSubmit: (ok: boolean) => void;
  onAISubmit: () => void;
  onRestart: () => void;
  settingsOpen: boolean;
  setSettingsOpen: (b: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (b: boolean) => void;
  onBoardSizeChange: (v: number) => void;
  onQuestionTimeChange: (v: number) => void;
  onSurpriseCountChange: (n: number) => void;
  onNumDefensesChange: (n: number) => void;
  onDifficultyChange: (d: "easy" | "medium" | "hard") => void;
  surpriseCount: number;
};

const GameBoardArea: React.FC<GameBoardAreaProps> = ({
  language, t, sound, turn, winner, difficulty, humanPoints, aiPoints, numDefenses, defensesUsed, onPlaceDefense, defenseMode,
  boardSize, boardPoints, positions, humanTarget, aiTarget, disableInput,
  handleTileClick, getValidMoves, positionsEqual, surpriseTiles, defenseTiles, aiPendingTarget,
  moveState, isModalOpen, aiModalState, questionTime, onHumanSubmit, onAISubmit, onRestart,
  settingsOpen, setSettingsOpen, soundEnabled, setSoundEnabled,
  onBoardSizeChange, onQuestionTimeChange, onSurpriseCountChange, onNumDefensesChange, onDifficultyChange, surpriseCount,
}) => {
  return (
    <div
      className="flex flex-col items-center"
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <SoundManager trigger={sound} />
      <GameHeader
        onSettingsOpen={() => setSettingsOpen(true)}
        onRestart={onRestart}
        difficulty={difficulty}
      />
      <GameBoardHud
        humanPoints={humanPoints}
        aiPoints={aiPoints}
        numDefenses={numDefenses}
        defensesUsed={defensesUsed}
        t={t}
        winner={winner}
        turn={turn}
        onPlaceDefense={onPlaceDefense}
        defenseMode={defenseMode}
      />
      <div className="relative my-3">
        <GameBoardGrid
          BOARD_SIZE={boardSize}
          boardPoints={boardPoints}
          positions={positions}
          humanTarget={humanTarget}
          aiTarget={aiTarget}
          winner={winner}
          turn={turn}
          disableInput={disableInput}
          onTileClick={handleTileClick}
          getValidMoves={getValidMoves}
          positionsEqual={positionsEqual}
          surpriseTiles={surpriseTiles}
          defenseTiles={defenseTiles}
          aiPendingTarget={aiPendingTarget}
        />
        <GameBoardWinnerOverlay
          winner={winner}
          humanPoints={humanPoints}
          aiPoints={aiPoints}
          t={t}
          onRestart={onRestart}
        />
      </div>
      <GameBoardModals
        moveState={moveState}
        isModalOpen={isModalOpen}
        aiModalState={aiModalState}
        winner={winner}
        questionTime={questionTime}
        onHumanSubmit={onHumanSubmit}
        onAISubmit={onAISubmit}
      />
      <GameBoardTurnInfo
        winner={winner}
        turn={turn}
        language={language}
        t={t}
      />
      <GameSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        boardSize={boardSize}
        onBoardSizeChange={onBoardSizeChange}
        questionTime={questionTime}
        onQuestionTimeChange={onQuestionTimeChange}
        surpriseCount={surpriseCount}
        onSurpriseCountChange={onSurpriseCountChange}
        numDefenses={numDefenses}
        onNumDefensesChange={onNumDefensesChange}
        difficulty={difficulty}
        onDifficultyChange={onDifficultyChange}
      />
    </div>
  );
};

export default GameBoardArea;
