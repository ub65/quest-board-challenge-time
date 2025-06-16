import React, { useRef, useEffect, useState } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "@/components/ui/use-toast";
import { useOnlineGame } from "@/hooks/useOnlineGame";
import {
  PlayerType,
  DEFAULT_BOARD_SIZE,
  DEFAULT_QUESTION_TIME,
} from "./types";
import {
  getValidMoves,
  positionsEqual,
  generateRandomPoints,
  getRandomSurpriseTiles,
  getRandomQuestion
} from "./utils";
import { useAITurn } from "./aiHooks";
import { useHumanMoveHandler } from "./humanHooks";
import { useSurprise } from "./useSurprise";
import { useGameRestart } from "./useGameRestart";
import { canPlaceDefenseHere } from "./defenseHelpers";
import { useGameSettings } from "./useGameSettings";
import { useGameBoardState } from "./useGameBoardState";
import GameBoardArea from "./GameBoardArea";
import { useDefenseModeHandler } from "./useDefenseModeHandler";
import { getRandomMathQuestion } from "@/lib/mathQuestions";
import GameBoardModals from "./GameBoardModals";
import { useStartGamePhase } from "./useStartGamePhase";

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
  const { t, language } = useLocalization();
  const {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
    soundEnabled, setSoundEnabled,
    questionTime, setQuestionTime,
    boardSize, setBoardSize,
    numSurprises, setNumSurprises,
    numDefenses, setNumDefenses,
  } = useGameSettings(initialDifficulty);

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
    humanHasMoved, setHumanHasMoved,
    getRandomStartingPlayer,
  } = useGameBoardState(boardSize, numSurprises, numDefenses);

  // Overlay/starting phase management
  const startPhase = useStartGamePhase({
    boardSize,
    numSurprises,
    numDefenses,
    setPositions,
    setWinner,
    setTurn,
    setHumanPoints,
    setAIPoints,
    setBoardPoints,
    setSurpriseTiles,
    setDefenseTiles,
    setDefensesUsed,
    setDefenseMode,
    setHumanHasMoved,
    setDisableInput,
    getRandomStartingPlayer,
  });

  const onlineBanner = isOnline && gameCode && onlineRole ? (
    <div className="bg-blue-50 border border-blue-300 text-blue-700 rounded p-3 mb-3 text-center">
      <span className="font-bold">Online Mode:</span>{" "}
      Game Code: <span className="font-mono text-base">{gameCode}</span> |{" "}
      Role: {onlineRole === "host" ? "Host" : "Guest"}
    </div>
  ) : null;

  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // Modal management for AI
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);
  const aiMovingRef = useRef(false);

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

  function getQuestionForAiTurn() {
    const qtype = questionType;
    let q;
    if (qtype === "math") {
      q = getRandomMathQuestion(difficulty);
    } else {
      q = getRandomQuestion(difficulty);
    }
    console.log("[QUESTION GENERATOR][AI]", { qtype, result: q });
    return q;
  }

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
    aiMovingRef,
    humanHasMoved,
    setAIModalState: (val) => {
      if (val && val.targetTile) {
        setAIModalState({
          ...val,
          question: getQuestionForAiTurn()
        });
      } else {
        setAIModalState(val);
      }
    }
  });

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

  const { startDefensePlacement } = useDefenseModeHandler({
    t,
    toast,
    setDefenseMode,
    handleDefenseClick,
  });

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
    setHumanHasMoved,
    humanHasMoved,
  });

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
        description: (
          <span className="flex items-center gap-2">
            <span className="font-semibold">⛔ Defense! </span>
            {problem}
          </span>
        ),
        duration: 2500,
      });
      return;
    }
    setDefenseTiles((prev) => [...prev, { ...tile, owner: "human" }]);
    setDefensesUsed((d) => ({ ...d, human: d.human + 1 }));
    setDefenseMode(false);
    toast({
      title: t("game.defense_placed") || "Defense Placed",
      description: (
        <span className="flex items-center gap-2">
          <span className="font-semibold">🛡️ Defense! </span>
          {t("game.defense_success") || "AI cannot move to this tile!"}
        </span>
      ),
      duration: 2000,
    });
  }

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

  useEffect(() => {
    console.log("[GAMEBOARD] Turn changed:", turn, "Winner:", winner);
  }, [turn, winner]);

  // Overlay message for pre-game phase
  const announcementKey =
    startPhase.startingPlayer === "human"
      ? "game.startingPlayer.human"
      : "game.startingPlayer.ai";
  const announcementText = t(announcementKey);

  return (
    <div className="relative w-full">
      {onlineBanner}
      {/* Overlay before "Start Game" */}
      {!startPhase.gameStarted && startPhase.startingPlayer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5 min-w-[320px] max-w-xs mx-auto">
            <h2 className="text-xl font-bold mb-0">{t("game.title")}</h2>
            <div className="text-base text-center text-gray-700 mb-3">
              {announcementText}
            </div>
            <button
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-primary/90 transition"
              onClick={startPhase.handleStartGame}
              autoFocus
              data-testid="start-game-btn"
            >
              {t("welcome.startGame") || "Start Game"}
            </button>
          </div>
        </div>
      )}
      {/* Only show board UI if game has started */}
      {startPhase.gameStarted && (
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
      )}
    </div>
  );
};

export default MainGameBoard;
