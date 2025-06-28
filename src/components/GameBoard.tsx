import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "@/components/ui/use-toast";
import { PlayerType, DEFAULT_BOARD_SIZE, DEFAULT_QUESTION_TIME } from "./GameBoard/types";
import { getValidMoves, positionsEqual, generateRandomPoints, getRandomSurpriseTiles } from "./GameBoard/utils";
import { useAITurn } from "./GameBoard/aiHooks";
import { useHumanMoveHandler } from "./GameBoard/humanHooks";
import { useSurprise } from "./GameBoard/useSurprise";
import { useGameRestart } from "./GameBoard/useGameRestart";
import { canPlaceDefenseHere } from "./GameBoard/defenseHelpers";
import { useGameSettings } from "./GameBoard/useGameSettings";
import { useGameBoardState } from "./GameBoard/useGameBoardState";
import GameBoardArea from "./GameBoard/GameBoardArea";
import { useDefenseModeHandler } from "./GameBoard/useDefenseModeHandler";
import GameBoardModals from "./GameBoard/GameBoardModals";
import { generateQuestion } from "./GameBoard/questionGenerator";

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

  const {
    difficulty, setDifficulty,
    settingsOpen, setSettingsOpen,
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
    disableInput, setDisableInput,
    humanHasMoved, setHumanHasMoved,
    getRandomStartingPlayer,
  } = useGameBoardState(boardSize, numSurprises);

  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);
  const aiMovingRef = useRef(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startingPlayer, setStartingPlayer] = useState<"human" | "ai" | null>(null);

  useEffect(() => {
    const randomStartingPlayer = getRandomStartingPlayer();
    setStartingPlayer(randomStartingPlayer);
    setGameStarted(false);
    setTurn(randomStartingPlayer);
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: boardSize - 1, y: boardSize - 1 }
    });
    setWinner(null);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(boardSize));
    setSurpriseTiles(getRandomSurpriseTiles(boardSize, numSurprises));
    setDefenseTiles([]);
    setDefensesUsed({ human: 0, ai: 0 });
    setDefenseMode(false);
    setHumanHasMoved(false);
    setDisableInput(true);
    // eslint-disable-next-line
  }, [boardSize, numSurprises, numDefenses]);

  const handleStartGame = () => {
    setGameStarted(true);
    setDisableInput(false);
    setHumanHasMoved(startingPlayer === "ai");
  };

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
      setDefenseMode(false);
    }
  }, [winner]);

  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y]);

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
          question: generateQuestion(questionType, difficulty)
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

  // Enhanced handleDefenseClick function
  const handleDefenseClick = useCallback((tile: { x: number; y: number }) => {
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
      // Don't exit defense mode on failed placement
      return;
    }
    
    // Successfully placed defense
    setDefenseTiles((prev) => [...prev, { ...tile, owner: "human" }]);
    setDefensesUsed((d) => ({ ...d, human: d.human + 1 }));
    setDefenseMode(false); // Exit defense mode after successful placement
    
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
  }, [BOARD_SIZE, numDefenses, positions, defenseTiles, surpriseTiles, defensesUsed, t, toast, setDefenseTiles, setDefensesUsed, setDefenseMode]);

  // Enhanced useDefenseModeHandler hook
  const { toggleDefensePlacement } = useDefenseModeHandler({
    t,
    toast,
    setDefenseMode,
    handleDefenseClick,
    defenseMode,
  });

  // Enhanced handleTileClick function to properly handle defense cancellation
  const handleTileClick = useCallback((x: number, y: number) => {
    // If in defense mode, handle defense placement
    if (defenseMode) {
      handleDefenseClick({ x, y });
      return; // Important: return early to prevent normal move logic
    }

    // ... rest of your normal tile click logic would go here
  }, [defenseMode, handleDefenseClick]);

  // Add escape key handler for canceling defense mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && defenseMode) {
        setDefenseMode(false);
        toast({
          title: t("game.defense_cancelled") || "Defense Cancelled",
          description: t("game.defense_cancelled_desc") || "Defense placement mode disabled",
          duration: 1500,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [defenseMode, setDefenseMode, t, toast]);

  // Cancel defense mode when turn changes
  useEffect(() => {
    if (defenseMode && turn !== 'human') {
      setDefenseMode(false);
    }
  }, [turn, defenseMode, setDefenseMode]);

  // Cancel defense mode when game ends
  useEffect(() => {
    if (winner && defenseMode) {
      setDefenseMode(false);
    }
  }, [winner, defenseMode, setDefenseMode]);

  // Enhanced UI feedback - add visual indicator for defense mode
  const DefenseModeIndicator = ({ defenseMode, onCancel }: { defenseMode: boolean; onCancel: () => void }) => {
    if (!defenseMode) return null;
    
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span>🛡️ Defense Mode Active - Click a tile to place defense</span>
        <button 
          onClick={onCancel}
          className="ml-2 bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-sm"
        >
          Cancel (ESC)
        </button>
      </div>
    );
  };

  const handleAIModalSubmit = useCallback((isCorrect: boolean) => {
    if (aiModalState) {
      // Handle AI modal submission logic here
      setAIModalState(null);
    }
  }, [aiModalState, setAIModalState]);

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

  const announcementKey =
    startingPlayer === "human"
      ? "game.startingPlayer.human"
      : "game.startingPlayer.ai";

  return (
    <div className="relative w-full">
      {!gameStarted && startingPlayer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5 min-w-[320px] max-w-xs mx-auto">
            <h2 className="text-xl font-bold mb-0">{t("game.title")}</h2>
            <div className="text-base text-center text-gray-700 mb-3">
              {t(announcementKey)}
            </div>
            <button
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-primary/90 transition"
              onClick={handleStartGame}
              autoFocus
              data-testid="start-game-btn"
            >
              {t("welcome.startGame") || "Start Game"}
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <DefenseModeIndicator 
            defenseMode={defenseMode} 
            onCancel={() => setDefenseMode(false)} 
          />
          <GameBoardArea
            language={language}
            t={t}
            turn={turn}
            winner={winner}
            difficulty={difficulty}
            humanPoints={humanPoints}
            aiPoints={aiPoints}
            numDefenses={numDefenses}
            defensesUsed={defensesUsed}
            onPlaceDefense={toggleDefensePlacement}
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
        </>
      )}
    </div>
  );
};

export default GameBoard;