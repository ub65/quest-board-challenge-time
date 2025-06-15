// Refactored GameBoard: uses split files for state and logic
import React, { useRef, useEffect, useState } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "@/components/ui/use-toast";
import {
  PlayerType,
  DEFAULT_BOARD_SIZE,
  DEFAULT_QUESTION_TIME,
} from "./GameBoard/types";
import {
  getValidMoves,
  positionsEqual,
  generateRandomPoints,
  getRandomSurpriseTiles,
  getRandomQuestion // Add this import
} from "./GameBoard/utils";
import { useAITurn } from "./GameBoard/aiHooks";
import { useHumanMoveHandler } from "./GameBoard/humanHooks";
import { useSurprise } from "./GameBoard/useSurprise";
import { useGameRestart } from "./GameBoard/useGameRestart";
import { canPlaceDefenseHere } from "./GameBoard/defenseHelpers";
import { useGameSettings } from "./GameBoard/useGameSettings";
import { useGameBoardState } from "./GameBoard/useGameBoardState";
import GameBoardArea from "./GameBoard/GameBoardArea";
import { useDefenseModeHandler } from "./GameBoard/useDefenseModeHandler";
import { getRandomMathQuestion } from "@/lib/mathQuestions";
import GameBoardModals from "./GameBoard/GameBoardModals";

const GameBoard = ({
  difficulty: initialDifficulty,
  onRestart,
  playerName,
  gameCode,
  onlineRole,
  questionType = "translate",
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
  playerName?: string;
  gameCode?: string;
  onlineRole?: "host" | "guest";
  questionType?: "translate" | "math";
}) => {
  const { t, language } = useLocalization();

  // Settings
  const {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    soundEnabled, setSoundEnabled,
    questionTime, setQuestionTime,
    boardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
  } = useGameSettings(initialDifficulty);

  // Board/game state
  const {
    boardPoints, setBoardPoints,
    humanPoints, setHumanPoints,
    aiPoints, setAIPoints,
    surpriseTiles, setSurpriseTiles,
    defenseTiles, setDefenseTiles,
    defensesUsed, setDefensesUsed,
    defenseMode, setDefenseMode,
    positions, setPositions,
    winner, setWinner,
    turn, setTurn,
    moveState, setMoveState,
    isModalOpen, setIsModalOpen,
    sound, setSound,
    disableInput, setDisableInput,
  } = useGameBoardState(boardSize, numSurprises, numDefenses);

  // --- Derived targets
  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // Modal management for AI
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);
  const aiMovingRef = useRef(false);

  // On game reset (board size/settings change)
  useEffect(() => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setTurn("human");
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({ human: 0, ai: 0 });
    setDefenseMode(false);
  }, [boardSize, numSurprises, numDefenses, setPositions, setWinner, setTurn, setHumanPoints, setAIPoints, setBoardPoints, setSurpriseTiles, setDefenseTiles, setDefensesUsed, setDefenseMode]);

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
      setDefenseMode(false);
    }
  }, [winner, setMoveState, setAIModalState, setIsModalOpen, setDisableInput, setDefenseMode]);

  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
      setSound("win");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
      setSound("win");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y, setWinner, setSound]);

  // This change allows using math/translate Qs as per setting
  function getQuestionForTurn() {
    const qtype = questionType;
    let q;
    if (qtype === "math") {
      q = getRandomMathQuestion(difficulty);
    } else {
      q = getRandomQuestion(difficulty);
    }
    console.log("[QUESTION GENERATOR]", { qtype, result: q });
    return q;
  }

  // AI turn (with defense/board state passed)
  useAITurn({
    turn,
    winner,
    aiModalState,
    disableInput,
    positions,
    defensesUsed,
    defenseTiles,
    surpriseTiles,
    numDefenses,
    difficulty,
    BOARD_SIZE,
    aiTarget,
    humanTarget,
    t,
    setDisableInput,
    setDefenseTiles,
    setDefensesUsed,
    toast,
    setTurn,
    setAIModalState,
    aiMovingRef
  });

  // SURPRISE logic
  const surpriseHandler = useSurprise({
    boardPoints,
    surpriseTiles,
    setSurpriseTiles,
    setHumanPoints,
    setAIPoints,
    humanPoints,
    aiPoints,
    t,
    toast,
  });

  // HUD Actions (defense mode)
  const { startDefensePlacement } = useDefenseModeHandler({
    t,
    toast,
    setDefenseMode,
    handleDefenseClick,
  });

  // Human move handler
  const { handleTileClick } = useHumanMoveHandler({
    winner,
    disableInput,
    turn,
    positions,
    BOARD_SIZE,
    defenseTiles,
    difficulty,
    defenseMode,
    handleDefenseClick,
    setSound,
    setPositions,
    setBoardPoints,
    setIsModalOpen,
    setMoveState,
    setTurn,
    setHumanPoints,
    handleSurprise: surpriseHandler,
    questionType,
    getQuestionForTurn,
  });

  // AI move modal submit handler
  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
    setSound("move");
    setPositions((p) => {
      const { x, y } = aiModalState.targetTile;
      setBoardPoints((prev) => {
        const newBoard = prev.map((row) => [...row]);
        if (!((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1))) {
          setAIPoints((cur) => cur + newBoard[y][x]);
        }
        return newBoard;
      });
      return { ...p, ai: { x, y } };
    });
    setTimeout(() => {
      surpriseHandler(aiModalState.targetTile, "ai");
      setAIModalState(null);
      setTimeout(() => {
        if (!winner) {
          setTurn("human");
          setDisableInput(false);
          aiMovingRef.current = false;
        }
      }, 600);
    }, 100);
  };

  // Defense placement
  function handleDefenseClick(tile: { x: number; y: number }) {
    const problem = canPlaceDefenseHere({
      tile,
      BOARD_SIZE,
      numDefenses,
      positions,
      defenseTiles,
      surpriseTiles,
      defensesUsed,
      t,
    });
    if (problem) {
      toast({
        title: t("game.defense_fail") || "Invalid defense placement",
        description: problem,
        duration: 2500,
      });
      return;
    }
    setDefenseTiles((prev) => [...prev, { ...tile, owner: "human" }]);
    setDefensesUsed((d) => ({ ...d, human: d.human + 1 }));
    setDefenseMode(false);
    toast({
      title: t("game.defense_placed") || "Defense Placed",
      description: t("game.defense_success") || "AI cannot move to this tile!",
      duration: 2000,
    });
  }

  // Restart game
  const handleRestart = useGameRestart({
    boardSize,
    numSurprises,
    setPositions,
    setWinner,
    setTurn,
    setIsModalOpen,
    setMoveState,
    setAIModalState,
    setDisableInput,
    setHumanPoints,
    setAIPoints,
    setBoardPoints,
    setSurpriseTiles,
    setDefenseTiles,
    setDefensesUsed,
    setDefenseMode,
  });

  // Debug: log turns to help trace
  useEffect(() => {
    console.log("[GAMEBOARD] Turn changed:", turn, "Winner:", winner);
  }, [turn, winner]);

  return (
    <GameBoardArea
      language={language}
      t={t}
      sound={sound}
      turn={turn}
      winner={winner}
      difficulty={difficulty}
      humanPoints={humanPoints}
      aiPoints={aiPoints}
      numDefenses={numDefenses}
      defensesUsed={defensesUsed}
      onPlaceDefense={startDefensePlacement}
      defenseMode={defenseMode}
      boardSize={BOARD_SIZE}
      boardPoints={boardPoints}
      positions={positions}
      humanTarget={humanTarget}
      aiTarget={aiTarget}
      disableInput={disableInput}
      handleTileClick={handleTileClick}
      getValidMoves={(pos) =>
        getValidMoves(
          pos,
          BOARD_SIZE,
          defenseTiles,
          pos === positions.human ? positions.ai : positions.human
        )
      }
      positionsEqual={positionsEqual}
      surpriseTiles={surpriseTiles}
      defenseTiles={defenseTiles}
      aiPendingTarget={aiModalState ? aiModalState.targetTile : null}
      moveState={moveState}
      isModalOpen={isModalOpen}
      aiModalState={aiModalState}
      questionTime={questionTime}
      onHumanSubmit={moveState?.resolve}
      onAISubmit={handleAIModalSubmit}
      onRestart={handleRestart}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
      onBoardSizeChange={v => setBoardSize(Math.max(5, Math.min(12, v || DEFAULT_BOARD_SIZE)))}
      onQuestionTimeChange={v => setQuestionTime(Math.max(6, Math.min(40, v || DEFAULT_QUESTION_TIME)))}
      onSurpriseCountChange={setNumSurprises}
      onNumDefensesChange={setNumDefenses}
      onDifficultyChange={setDifficulty}
      surpriseCount={numSurprises}
      playerName={playerName}
    >
      {/* Inject modals for human/ai turn based on current move/question type */}
      <GameBoardModals
        moveState={moveState}
        isModalOpen={isModalOpen}
        aiModalState={aiModalState}
        winner={winner}
        questionTime={questionTime}
        onHumanSubmit={moveState?.resolve}
        onAISubmit={handleAIModalSubmit}
        questionType={questionType}
      />
    </GameBoardArea>
  );
};

export default GameBoard;

// NOTE: This file is now much smaller and delegates logic via hooks and separated files.
