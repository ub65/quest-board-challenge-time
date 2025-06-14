
import React, { useEffect, useState } from "react";
import TranslateQuestionModal from "./TranslateQuestionModal";
import SoundManager from "./SoundManager";
import { questionsByDifficulty } from "@/lib/questions";

export type PlayerType = "human" | "ai";

const BOARD_SIZE = 7;

const initialPositions = {
  human: { x: 0, y: 0 },
  ai: { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 }
};

type Tile = { x: number; y: number };
type MoveState = null | { tile: Tile; question: any; resolve: (ok: boolean) => void };

function positionsEqual(a: Tile, b: Tile) {
  return a.x === b.x && a.y === b.y;
}

function getValidMoves(pos: Tile): Tile[] {
  const moves: Tile[] = [];
  if (pos.x > 0) moves.push({ x: pos.x - 1, y: pos.y });
  if (pos.x < BOARD_SIZE - 1) moves.push({ x: pos.x + 1, y: pos.y });
  if (pos.y > 0) moves.push({ x: pos.x, y: pos.y - 1 });
  if (pos.y < BOARD_SIZE - 1) moves.push({ x: pos.x, y: pos.y + 1 });
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
  const [positions, setPositions] = useState({ ...initialPositions });
  const [turn, setTurn] = useState<PlayerType>("human");
  const [moveState, setMoveState] = useState<MoveState>(null);
  const [winner, setWinner] = useState<null | PlayerType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sound, setSound] = useState<"move" | "wrong" | "win" | null>(null);
  const [disableInput, setDisableInput] = useState(false);

  const aiTarget = { x: 0, y: 0 };
  const humanTarget = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

  // Check for victory
  useEffect(() => {
    if (positions.human.x === humanTarget.x && positions.human.y === humanTarget.y) {
      setWinner("human");
      setSound("win");
    } else if (positions.ai.x === aiTarget.x && positions.ai.y === aiTarget.y) {
      setWinner("ai");
      setSound("win");
    }
  }, [positions]);

  // AI turn: "think", then move
  useEffect(() => {
    if (turn === "ai" && !winner) {
      setDisableInput(true);
      setTimeout(() => {
        const move = getAIMove(positions.ai, aiTarget);
        setSound("move");
        setPositions((p) => ({ ...p, ai: move }));
        setTimeout(() => {
          setTurn("human");
          setDisableInput(false);
        }, 600);
      }, 800 + Math.random() * 500);
    }
  }, [turn, winner, positions.ai]);

  // Human move: pick tile -> answer question
  const handleTileClick = async (tile: Tile) => {
    if (turn !== "human" || winner || disableInput) return;
    const validMoves = getValidMoves(positions.human);
    if (!validMoves.some((t) => positionsEqual(t, tile))) return;
    const question = getRandomQuestion(difficulty);
    const ok = await new Promise<boolean>((resolve) => {
      setMoveState({ tile, question, resolve });
      setIsModalOpen(true);
    });
    setIsModalOpen(false);
    setMoveState(null);
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
      turn === "human" &&
      getValidMoves(positions.human).some((t) => t.x === x && t.y === y) &&
      !isHuman && !isAI &&
      !winner;

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
        disabled={!highlight || disableInput}
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

  return (
    <div className="flex flex-col items-center">
      <SoundManager trigger={sound} />
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex flex-col">
          <span className="font-semibold">Difficulty:</span>
          <span className="capitalize">{difficulty}</span>
        </div>
        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-md bg-gray-200 shadow hover:bg-blue-200 font-bold transition-colors"
        >
          Restart
        </button>
      </div>
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
              onClick={onRestart}
              className="bg-green-400 shadow px-5 py-2 rounded-lg text-xl font-bold text-white hover:bg-green-500 hover:scale-105 transition-all mt-2"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      {/* Question modal */}
      {moveState && (
        <TranslateQuestionModal
          isOpen={isModalOpen}
          question={moveState.question}
          key={moveState.tile.x + "-" + moveState.tile.y}
          onSubmit={moveState.resolve}
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
