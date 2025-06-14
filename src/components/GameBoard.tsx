import React, { useEffect, useState, useRef } from "react";
import TranslateQuestionModal from "./TranslateQuestionModal";
import SoundManager from "./SoundManager";
import { questionsByDifficulty } from "@/lib/questions";
import GameSettingsModal from "./GameSettingsModal";
import AITranslateQuestionModal from "./AITranslateQuestionModal";
import LanguageSelector from "./LanguageSelector";
import { useLocalization } from "@/contexts/LocalizationContext";

export type PlayerType = "human" | "ai";

const DEFAULT_BOARD_SIZE = 7;
const DEFAULT_QUESTION_TIME = 14;

const initialPositions = {
  human: { x: 0, y: 0 },
  ai: { x: DEFAULT_BOARD_SIZE - 1, y: DEFAULT_BOARD_SIZE - 1 }
};

type Tile = { x: number; y: number };
type MoveState = null | { tile: any; question: any; resolve: (ok: boolean) => void };

function positionsEqual(a: Tile, b: Tile) {
  return a.x === b.x && a.y === b.y;
}

function getValidMoves(pos: Tile): Tile[] {
  const moves: Tile[] = [];
  if (pos.x > 0) moves.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < DEFAULT_BOARD_SIZE - 1) moves.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0) moves.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < DEFAULT_BOARD_SIZE - 1) moves.push({ x: pos.x, y: pos.y + 1 });
  return moves;
}

function getRandomQuestion(difficulty: "easy" | "medium" | "hard") {
  const arr = questionsByDifficulty[difficulty];
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDistance(a: Tile, b: Tile) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Simple AI: move closer to target, always answers correctly.
function getAIMove(pos: Tile, target: Tile) {
  const moves = getValidMoves(pos);
  // Pick move that minimizes distance
  let best = moves[0];
  let bestDist = getDistance(moves[0], target);
  for (const move of moves) {
    const d = getDistance(move, target);
    if (d < bestDist) {
      bestDist = d;
      best = move;
    }
  }
  return best;
}

// Generate a 2D array of random ints [1,100] for points
function generateRandomPoints(boardSize: number) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.floor(Math.random() * 100) + 1)
  );
}

const GameBoard = ({
  difficulty,
  onRestart
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
}) => {
  const { t } = useLocalization();
  
  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New settings: question time and board size
  const [questionTime, setQuestionTime] = useState<number>(DEFAULT_QUESTION_TIME);
  const [boardSize, setBoardSize] = useState<number>(DEFAULT_BOARD_SIZE);

  // Points board state: NxN grid, each cell: points remaining (0 if collected)
  const [boardPoints, setBoardPoints] = useState<number[][]>(
    () => generateRandomPoints(DEFAULT_BOARD_SIZE)
  );
  // Points tracker (collected points)
  const [humanPoints, setHumanPoints] = useState(0);
  const [aiPoints, setAIPoints] = useState(0);

  // Gameplay state
  const [positions, setPositions] = useState(() => ({
    human: { x: 0, y: 0 },
    ai: { x: boardSize - 1, y: boardSize - 1 }
  }));
  const [turn, setTurn] = useState<PlayerType>("human");
  const [moveState, setMoveState] = useState<null | { tile: any; question: any; resolve: (ok: boolean) => void }>(null);
  const [winner, setWinner] = useState<null | PlayerType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sound, setSound] = useState<"move" | "wrong" | "win" | null>(null);
  const [disableInput, setDisableInput] = useState(false);

  // AI state
  const aiMovingRef = useRef(false);
  const [aiModalState, setAIModalState] = useState<null | { question: any; targetTile: any }>(null);

  // Adjusted for dynamic board size
  const BOARD_SIZE = boardSize;
  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // When board size changes, reset positions, winner, boardPoints, points
  useEffect(() => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
    });
    setWinner(null);
    setTurn("human");
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(BOARD_SIZE));
  }, [BOARD_SIZE]);

  // When a winner is set, immediately finish the game (clear all modals and block moves).
  useEffect(() => {
    if (winner) {
      setMoveState(null);
      setAIModalState(null);
      setIsModalOpen(false);
      setDisableInput(true);
      aiMovingRef.current = false;
    }
  }, [winner]);

  // Check for victory
  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
      setSound("win");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
      setSound("win");
    }
  }, [positions, humanTarget.x, humanTarget.y, aiTarget.x, aiTarget.y]);

  // AI turn: only run if no winner and no modal already up.
  useEffect(() => {
    if (winner) {
      aiMovingRef.current = false;
      return;
    }
    if (turn === "ai" && !aiModalState && !aiMovingRef.current) {
      aiMovingRef.current = true;
      setDisableInput(true);

      // Prepare to ask a question before allowing AI to move
      const move = getValidMoves(positions.ai).filter(
        tile => tile.x >= 0 && tile.y >= 0 && tile.x < BOARD_SIZE && tile.y < BOARD_SIZE
      );
      const nextTile = move.length > 0 ? getAIMove(positions.ai, aiTarget) : positions.ai;

      const question = getRandomQuestion(difficulty);
      setTimeout(() => {
        // STOP if winner determined in a race condition
        if (!winner) setAIModalState({ question, targetTile: nextTile });
      }, 650);
    }
    if (turn === "human" || winner) {
      aiMovingRef.current = false;
    }
    // eslint-disable-next-line
  }, [turn, winner, positions.ai, aiModalState, BOARD_SIZE, difficulty]);

  // AI modal submit: collect points, move, update score
  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
    setSound("move");
    setPositions((p) => {
      const { x, y } = aiModalState.targetTile;
      // Collect points if not start tile and not already 0
      setBoardPoints((prev) => {
        if (prev[y][x] === 0) return prev;
        // Don't collect on start (0,0) or human start (bottom right)
        if ((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)) return prev;
        // Add to AI score
        setAIPoints((cur) => cur + prev[y][x]);
        // Update points grid
        const next = prev.map((row) => [...row]);
        next[y][x] = 0;
        return next;
      });
      return { ...p, ai: { x, y } };
    });
    setAIModalState(null);
    setTimeout(() => {
      if (!winner) {
        setTurn("human");
        setDisableInput(false);
        aiMovingRef.current = false;
      }
    }, 600);
  };

  // Human move: pick tile -> answer question -> collect points
  const handleTileClick = async (tile: any) => {
    if (turn !== "human" || winner || disableInput) return;
    const validMoves = getValidMoves(positions.human).filter(
      t => t.x >= 0 && t.y >= 0 && t.x < BOARD_SIZE && t.y < BOARD_SIZE
    );
    if (!validMoves.some((t) => positionsEqual(t, tile))) return;
    const question = getRandomQuestion(difficulty);
    const ok = await new Promise<boolean>((resolve) => {
      setMoveState({ tile, question, resolve });
      setIsModalOpen(true);
    });
    setIsModalOpen(false);
    setMoveState(null);
    if (winner) return; // abort moves after winning
    if (ok) {
      setPositions((p) => {
        const { x, y } = tile;
        setBoardPoints((prev) => {
          if (prev[y][x] === 0) return prev;
          // Don't collect on start (0,0) or AI start (top left or bottom right depending on board)
          if ((x === 0 && y === 0) || (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)) return prev;
          // Add to human score
          setHumanPoints((cur) => cur + prev[y][x]);
          // Update points grid
          const next = prev.map((row) => [...row]);
          next[y][x] = 0;
          return next;
        });
        return { ...p, human: { x, y } };
      });
      setSound("move");
      setTurn("ai");
    } else {
      setSound("wrong");
      setTurn("ai");
    }
  };

  // RENDERING: show collected points on each tile (uncollected), hidden if start/end or player's on it
  const renderTile = (x: number, y: number) => {
    const isHuman = positions.human.x === x && positions.human.y === y;
    const isAI = positions.ai.x === x && positions.ai.y === y;
    const isHumanTarget = x === humanTarget.x && y === humanTarget.y;
    const isAITarget = x === aiTarget.x && y === aiTarget.y;
    let bg = "bg-gray-200";
    let border = "";
    let content = "";
    if (isHuman) {
      bg = "bg-blue-600";
      border = "border-4 border-blue-400";
      content = "YOU";
    } else if (isAI) {
      bg = "bg-red-600";
      border = "border-4 border-red-400";
      content = "AI";
    } else if (isHumanTarget) {
      bg = "bg-green-300";
      content = "";
    } else if (isAITarget) {
      bg = "bg-orange-200";
      content = "";
    }
    const highlight =
      !winner &&
      turn === "human" &&
      getValidMoves(positions.human)
        .filter(t => t.x >= 0 && t.y >= 0 && t.x < BOARD_SIZE && t.y < BOARD_SIZE)
        .some((t) => t.x === x && t.y === y) &&
      !isHuman && !isAI;

    return (
      <button
        key={x + "-" + y}
        className={`
        relative w-16 h-16 md:w-20 md:h-20 text-sm md:text-lg font-bold flex items-center justify-center rounded-lg shadow
        transition-all duration-200
        ${bg} ${border}
        ${highlight ? "hover:scale-110 ring-4 ring-primary/50 cursor-pointer animate-pulse" : "cursor-default"}
        ${isHuman || isAI ? "text-white" : "text-gray-700"}
        `}
        style={{
          outline: isHumanTarget || isAITarget ? "2px dashed #6ee7b7" : undefined,
          zIndex: isHuman || isAI ? 2 : 1,
        }}
        disabled={!highlight || disableInput || !!winner}
        onClick={() => handleTileClick({ x, y })}
        aria-label={
          isHuman
            ? "You"
            : isAI
            ? "AI"
            : isHumanTarget
            ? "Your Target"
            : isAITarget
            ? "AI Target"
            : "Empty"
        }
      >
        <span>{content}</span>
        {/* Show uncollected points if: not a start/end tile and not currently occupied */}
        {(content === "" &&
          !isHuman &&
          !isAI &&
          !(
            (x === 0 && y === 0) ||
            (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)
          ) &&
          boardPoints[y] &&
          boardPoints[y][x] > 0) && (
            <span className="absolute bottom-1 right-2 text-xs text-amber-700 font-medium bg-white/80 px-1 py-0.5 rounded shadow">
              {boardPoints[y][x]}
            </span>
          )}
        {isHumanTarget && (
          <span className="absolute inset-1 rounded bg-green-400/40 border border-green-600 pointer-events-none">
            <span className="sr-only">Your target</span>
          </span>
        )}
        {isAITarget && (
          <span className="absolute inset-1 rounded bg-orange-300/50 border border-orange-400 pointer-events-none">
            <span className="sr-only">AI target</span>
          </span>
        )}
      </button>
    );
  };

  // On restart, preserve settings but reset game state, points and boardPoints
  const handleRestart = () => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
    });
    setWinner(null);
    setTurn("human");
    setIsModalOpen(false);
    setMoveState(null);
    setAIModalState(null);
    setDisableInput(false);
    setHumanPoints(0);
    setAIPoints(0);
    setBoardPoints(generateRandomPoints(BOARD_SIZE));
    onRestart();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Respect sound setting: pass soundEnabled to SoundManager */}
      <SoundManager trigger={sound} />
      {/* Settings button and modal */}
      <div className="flex flex-row justify-between items-center w-full mb-4 gap-2">
        <button
          onClick={() => setSettingsOpen(true)}
          className="px-3 py-2 rounded-md bg-gray-100 hover:bg-blue-200 text-blue-700 font-medium shadow transition-colors text-base"
        >
          {t('game.settings')}
        </button>
        <div className="flex flex-col">
          <span className="font-semibold">{t('game.difficulty')}:</span>
          <span className="capitalize">{t(`difficulty.${difficulty}`)}</span>
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 rounded-md bg-gray-200 shadow hover:bg-blue-200 font-bold transition-colors"
        >
          {t('game.restart')}
        </button>
      </div>
      {/* POINTS DISPLAY - top of board */}
      <div className="flex flex-row gap-8 mb-2 w-full justify-center text-lg font-semibold">
        <div className="flex flex-row items-center gap-2">
          <span className="w-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">YOU</span>
          <span className="text-blue-900 ml-2">{t('game.points')}: {humanPoints}</span>
        </div>
        <div className="flex flex-row items-center gap-2">
          <span className="w-7 rounded bg-red-600 text-white flex items-center justify-center font-bold shadow-md">AI</span>
          <span className="text-red-800 ml-2">{t('game.points')}: {aiPoints}</span>
        </div>
      </div>
      <GameSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        boardSize={boardSize}
        onBoardSizeChange={v => setBoardSize(Math.max(5, Math.min(12, v || DEFAULT_BOARD_SIZE)))}
        questionTime={questionTime}
        onQuestionTimeChange={v => setQuestionTime(Math.max(6, Math.min(40, v || DEFAULT_QUESTION_TIME)))}
        languageSelector={<LanguageSelector />}
      />
      <div className="relative my-3">
        <div
          className="grid gap-1"
          style={{
            gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: BOARD_SIZE }).map((_, y) =>
            Array.from({ length: BOARD_SIZE }).map((_, x) => renderTile(x, y))
          )}
        </div>
        {winner && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in z-10">
            <div className="text-3xl font-bold text-white mb-3 drop-shadow-2xl">
              {winner === "human" ? t('game.youWin') : t('game.aiWins')}
            </div>
            <div className="flex flex-col gap-1 text-lg text-white font-semibold mb-2">
              <div>
                {t('game.yourPoints')}: <span className="text-amber-200 font-bold">{humanPoints}</span>
              </div>
              <div>
                {t('game.aiPoints')}: <span className="text-amber-200 font-bold">{aiPoints}</span>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="bg-green-400 shadow px-5 py-2 rounded-lg text-xl font-bold text-white hover:bg-green-500 hover:scale-105 transition-all mt-2"
            >
              {t('game.playAgain')}
            </button>
          </div>
        )}
      </div>
      {/* Human question modal */}
      {moveState && !winner && (
        <TranslateQuestionModal
          isOpen={isModalOpen}
          question={moveState.question}
          timeLimit={questionTime}
          key={moveState.tile.x + "-" + moveState.tile.y + "-human"}
          onSubmit={moveState.resolve}
        />
      )}
      {/* AI question modal */}
      {aiModalState && !winner && (
        <AITranslateQuestionModal
          isOpen={true}
          question={aiModalState.question}
          key={aiModalState.targetTile.x + "-" + aiModalState.targetTile.y + "-ai"}
          onSubmit={handleAIModalSubmit}
        />
      )}
      {!winner && (
        <div className="w-full mt-4 flex justify-between items-center">
          <div className="font-medium">
            {t('game.yourTarget')}
          </div>
          <div className={`font-medium text-right`}>
            {turn === "human" ? (
              <span className="text-blue-700 animate-pulse">{t('game.yourTurn')}</span>
            ) : (
              <span className="text-red-700">{t('game.aiThinking')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;

// NOTE: This file is now quite long. Consider refactoring for maintainability!
