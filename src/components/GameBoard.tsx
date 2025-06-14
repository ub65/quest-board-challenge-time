import React, { useEffect, useState, useRef } from "react";
import TranslateQuestionModal from "./TranslateQuestionModal";
import SoundManager from "./SoundManager";
import { questionsByDifficulty } from "@/lib/questions";
import GameSettingsModal from "./GameSettingsModal";
import AITranslateQuestionModal from "./AITranslateQuestionModal";

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

const GameBoard = ({
  difficulty,
  onRestart
}: {
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
}) => {
  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New settings: question time and board size
  const [questionTime, setQuestionTime] = useState<number>(DEFAULT_QUESTION_TIME);
  const [boardSize, setBoardSize] = useState<number>(DEFAULT_BOARD_SIZE);

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

  // When board size changes, reset positions and winner
  useEffect(() => {
    setPositions({
      human: { x: 0, y: 0 },
      ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
    });
    setWinner(null);
    setTurn("human");
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

  const handleAIModalSubmit = () => {
    if (!aiModalState || winner) return;
    setSound("move");
    setPositions((p) => ({ ...p, ai: aiModalState.targetTile }));
    setAIModalState(null);
    setTimeout(() => {
      if (!winner) {
        setTurn("human");
        setDisableInput(false);
        aiMovingRef.current = false;
      }
    }, 600);
  };

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
      setPositions((p) => ({ ...p, human: tile }));
      setSound("move");
      setTurn("ai");
    } else {
      setSound("wrong");
      setTurn("ai");
    }
  };

  const renderTile = (x: number, y: number) => {
    // winner disables all highlight/click logic
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
        {content}
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

  // On restart, preserve settings but reset game
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
          ⚙️ Settings
        </button>
        <div className="flex flex-col">
          <span className="font-semibold">Difficulty:</span>
          <span className="capitalize">{difficulty}</span>
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 rounded-md bg-gray-200 shadow hover:bg-blue-200 font-bold transition-colors"
        >
          Restart
        </button>
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
              {winner === "human" ? "🎉 You Win!" : "😔 AI Wins"}
            </div>
            <button
              onClick={handleRestart}
              className="bg-green-400 shadow px-5 py-2 rounded-lg text-xl font-bold text-white hover:bg-green-500 hover:scale-105 transition-all mt-2"
            >
              Play Again
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
            Your Target: <span className="font-bold">Bottom-right</span>
          </div>
          <div className={`font-medium text-right`}>
            {turn === "human" ? (
              <span className="text-blue-700 animate-pulse">Your turn</span>
            ) : (
              <span className="text-red-700">AI is thinking...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;

// NOTE: This file is now quite long. Consider refactoring for maintainability!
