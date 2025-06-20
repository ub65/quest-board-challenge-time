
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
  getRandomQuestion
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
    disableInput, setDisableInput,
    humanHasMoved, setHumanHasMoved,
    getRandomStartingPlayer,
  } = useGameBoardState(boardSize, numSurprises, numDefenses);

  // --- Derived targets
  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // Modal management for AI
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);
  const aiMovingRef = useRef(false);

  // NEW: State to track if the game proper has started.
  const [gameStarted, setGameStarted] = useState(false);

  // Store starting player and announcement, but do not proceed till "Start Game" button is clicked.
  const [startingPlayer, setStartingPlayer] = useState<"human" | "ai" | null>(null);

  // Randomize starting player and show a message on new game
  useEffect(() => {
    // On mount or relevant setting changes: pick starting player, but do not start game immediately
    const randomStartingPlayer = getRandomStartingPlayer();
    setStartingPlayer(randomStartingPlayer);
    setGameStarted(false); // Block normal gameplay
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
    setDisableInput(true); // Block interactions until "Start Game"
    // eslint-disable-next-line
  }, [boardSize, numSurprises, numDefenses, setPositions, setWinner, setTurn, setHumanPoints, setAIPoints, setBoardPoints, setSurpriseTiles, setDefenseTiles, setDefensesUsed, setDefenseMode, setHumanHasMoved, getRandomStartingPlayer]);

  // On "Start Game" click:
  const handleStartGame = () => {
    setGameStarted(true);
    setDisableInput(false);
    // If AI is starting player, flag as "human has moved" so AI can actually move:
    if (startingPlayer === "ai") {
      setHumanHasMoved(true);
    } else {
      setHumanHasMoved(false);
    }
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
  }, [winner, setMoveState, setAIModalState, setIsModalOpen, setDisableInput, setDefenseMode]);

  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y, setWinner]);

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

  // Helper for AI to get question of correct type:
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

  // Human move handler (removed setSound parameter)
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

  // AI move modal submit handler
  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
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

  // START GAME ANNOUNCEMENT OVERLAY (visible only before game actually starts)
  const announcementKey =
    startingPlayer === "human"
      ? "game.startingPlayer.human"
      : "game.startingPlayer.ai";
  const announcementText = t(announcementKey);

  return (
    <div className="relative w-full">
      {/* Show overlay modal before game starts */}
      {!gameStarted && startingPlayer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-5 min-w-[320px] max-w-xs mx-auto">
            <h2 className="text-xl font-bold mb-0">{t("game.title")}</h2>
            <div className="text-base text-center text-gray-700 mb-3">
              {announcementText}
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

      {/* Only show board UI if game has started */}
      {gameStarted && (
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
      )}
    </div>
  );
};

export default GameBoard;
