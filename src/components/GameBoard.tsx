import React, { useRef, useEffect, useState } from "react";
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
import { soundManager } from "@/lib/soundManager";

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
  }, [boardSize, numSurprises, numDefenses]);

  const handleStartGame = () => {
    setGameStarted(true);
    setDisableInput(false);
    setHumanHasMoved(startingPlayer === "ai");
    soundManager.play('gameStart');
  };

  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
      setDefenseMode(false);
      
      // Play win/lose sound
      if (winner === "human") {
        soundManager.play('win');
      } else {
        soundManager.play('lose');
      }
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
    setPositions,
    setBoardPoints,
    setIsModalOpen,
    setMoveState,
    setTurn,
    setHumanPoints,
    handleSurprise: surpriseHandler,
    questionType,
    getQuestionForTurn: () => generateQuestion(questionType, difficulty),
    setHumanHasMoved,
    humanHasMoved,
  });

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
    
    // Play AI move sound
    soundManager.play('aiMove');
    
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
      soundManager.play('wrong');
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
    
    // Play defense sound
    soundManager.play('defense');
    
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