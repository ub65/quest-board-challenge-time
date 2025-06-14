
import React from "react";
import { Gift, Shield } from "lucide-react";
import { Tile, SurpriseTile, DefenseTile } from "./types";

type Props = {
  x: number;
  y: number;
  BOARD_SIZE: number;
  boardPoints: number[][];
  positions: { human: Tile; ai: Tile };
  humanTarget: Tile;
  aiTarget: Tile;
  winner: "human" | "ai" | null;
  turn: "human" | "ai";
  disableInput: boolean;
  highlight: boolean;
  onTileClick: (tile: Tile) => void;
  positionsEqual: (a: Tile, b: Tile) => boolean;
  surprise?: SurpriseTile | undefined;
  defense?: DefenseTile | undefined;
  aiPendingTarget?: Tile | null;
};

const GameTile: React.FC<Props> = ({
  x,
  y,
  BOARD_SIZE,
  boardPoints,
  positions,
  humanTarget,
  aiTarget,
  winner,
  turn,
  disableInput,
  highlight,
  onTileClick,
  positionsEqual,
  surprise,
  defense,
  aiPendingTarget
}) => {
  const isHuman = positions.human.x === x && positions.human.y === y;
  const isAI = positions.ai.x === x && positions.ai.y === y;
  const isHumanTarget = x === humanTarget.x && y === humanTarget.y;
  let isAITarget = !aiPendingTarget && x === aiTarget.x && y === aiTarget.y;

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

  return (
    <button
      key={x + "-" + y}
      data-tile-x={x}
      data-tile-y={y}
      className={`
        relative 
        w-[10vw] h-[10vw] min-w-[42px] min-h-[42px]
        md:w-16 md:h-16 lg:w-20 lg:h-20
        text-sm md:text-lg font-bold flex items-center justify-center rounded-lg shadow
        transition-all duration-200
        ${bg} ${border}
        ${highlight ? "hover:scale-110 ring-4 ring-primary/50 cursor-pointer animate-glow" : "cursor-default"}
        ${isHuman || isAI ? "text-white" : "text-gray-700"}
      `}
      style={{
        outline: isHumanTarget || isAITarget ? "2px dashed #6ee7b7" : undefined,
        zIndex: isHuman || isAI ? 2 : 1,
        aspectRatio: "1 / 1",
        maxWidth: "64px",
        maxHeight: "64px",
      }}
      disabled={disableInput || !!winner}
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
          : defense
          ? defense.owner === "human"
            ? "Human Defense"
            : "AI Defense"
          : "Empty"
      }
    >
      <span>{content}</span>
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
      {surprise && !isHuman && !isAI && !isHumanTarget && !isAITarget && !defense && (
        <span className="absolute top-1 left-1">
          <Gift size={22} className="text-pink-500 animate-bounce" />
        </span>
      )}
      {defense && !isHuman && !isAI && (
        <span className={`absolute top-1 right-1 z-10`}>
          <Shield
            size={22}
            className={defense.owner === "human" ? "text-blue-900 drop-shadow" : "text-red-800 drop-shadow"}
          />
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

export default GameTile;
