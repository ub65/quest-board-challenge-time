
import React from "react";
import { Gift } from "lucide-react";

type Tile = { x: number; y: number };
type PlayerPositions = { human: Tile; ai: Tile };
type SurpriseTile = Tile & { type: string; used: boolean };

type GameBoardGridProps = {
  BOARD_SIZE: number;
  boardPoints: number[][];
  positions: PlayerPositions;
  humanTarget: Tile;
  aiTarget: Tile;
  winner: "human" | "ai" | null;
  turn: "human" | "ai";
  disableInput: boolean;
  onTileClick: (tile: Tile) => void;
  getValidMoves: (pos: Tile) => Tile[];
  positionsEqual: (a: Tile, b: Tile) => boolean;
  // NEW
  surpriseTiles: SurpriseTile[];
};

const GameBoardGrid: React.FC<GameBoardGridProps> = ({
  BOARD_SIZE,
  boardPoints,
  positions,
  humanTarget,
  aiTarget,
  winner,
  turn,
  disableInput,
  onTileClick,
  getValidMoves,
  positionsEqual,
  surpriseTiles,
}) => {
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

    // Surprise tile
    const surprise =
      surpriseTiles?.find(st => st.x === x && st.y === y && !st.used);

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
        onClick={() => onTileClick({ x, y })}
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
        {/* Surprise tile: if not occupied or target */}
        {surprise && !isHuman && !isAI && !isHumanTarget && !isAITarget && (
          <span className="absolute top-1 left-1">
            <Gift size={22} className="text-pink-500 animate-bounce" />
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

  return (
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
  );
};

export default GameBoardGrid;
