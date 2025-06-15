
import React, { useEffect, useRef, useState } from "react";
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

  // --- Tile visual state
  // Stronger highlight and saturated gradient backgrounds for special states
  let bg = "bg-gradient-to-b from-white via-indigo-100 to-violet-100";
  let border = "border-2 border-indigo-100/60";
  let content = "";

  if (isHuman) {
    bg = "bg-gradient-to-b from-blue-500 via-blue-400 to-cyan-400";
    border =
      "border-4 border-blue-700/60 shadow-blue-300/70 shadow-2xl ring-2 ring-blue-400/20";
    content = "YOU";
  } else if (isAI) {
    bg = "bg-gradient-to-b from-red-600 via-red-500 to-orange-400";
    border =
      "border-4 border-red-700/70 shadow-orange-400/70 shadow-2xl ring-2 ring-orange-500/20";
    content = "AI";
  } else if (isHumanTarget) {
    bg = "bg-gradient-to-b from-green-300 via-green-200 to-emerald-100";
    content = "";
  } else if (isAITarget) {
    bg = "bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100";
    content = "";
  } else if (surprise && !defense) {
    bg = "bg-gradient-to-b from-pink-100 to-pink-200";
    border = "border-2 border-pink-200";
  } else if (defense) {
    bg = "bg-gradient-to-b from-gray-200 to-gray-100";
    border = "border-2 border-gray-400/60";
  }

  let targetBorder = "";
  if (isHumanTarget) {
    targetBorder = "border-2 border-dashed border-green-400";
  } else if (isAITarget) {
    targetBorder = "border-2 border-dashed border-orange-300";
  }

  // Glow border on target transition
  const [showGlow, setShowGlow] = useState(false);
  const prevTargetRef = useRef({ human: { x: -1, y: -1 }, ai: { x: -1, y: -1 } });

  useEffect(() => {
    let shouldGlow = false;
    if (isHumanTarget) {
      const prev = prevTargetRef.current.human;
      if (prev.x !== x || prev.y !== y) {
        shouldGlow = true;
        prevTargetRef.current.human = { x, y };
      }
    }
    if (isAITarget) {
      const prev = prevTargetRef.current.ai;
      if (prev.x !== x || prev.y !== y) {
        shouldGlow = true;
        prevTargetRef.current.ai = { x, y };
      }
    }
    setShowGlow(shouldGlow);
    if (shouldGlow) {
      const t = setTimeout(() => setShowGlow(false), 1000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [isHumanTarget, isAITarget, x, y]);

  let glowAnimClass = "";
  if (showGlow && isHumanTarget) {
    glowAnimClass = "animate-glow-green";
  } else if (showGlow && isAITarget) {
    glowAnimClass = "animate-glow-orange";
  }

  // --- Responsive sizing for mobile/desktop
  // Special tile class for extra shadow and animations
  const raisedClass = (highlight || isHuman || isAI)
    ? "hover:scale-[1.08] md:hover:scale-105 active:scale-100"
    : "";

  // Content/text color/decoration
  const isSpecial = isHuman || isAI || isHumanTarget || isAITarget || defense || surprise;

  return (
    <button
      key={x + "-" + y}
      data-tile-x={x}
      data-tile-y={y}
      className={`
        relative select-none
        w-[10vw] h-[10vw] min-w-[40px] min-h-[40px] max-w-[54px] max-h-[54px]
        md:w-[54px] md:h-[54px]
        lg:w-16 lg:h-16
        text-[4.5vw] md:text-lg font-extrabold flex items-center justify-center
        rounded-2xl
        shadow-2xl ${bg} ${border} ${targetBorder} ${glowAnimClass} 
        ${highlight ? "cursor-pointer hover:ring-2 hover:ring-indigo-400/60 hover:shadow-indigo-200/70 transition-transform duration-150" : "cursor-default"}
        ${raisedClass}
        ${isHuman ? "text-white drop-shadow-[0_2px_3px_rgba(0,32,108,0.18)]" : ""}
        ${isAI ? "text-white drop-shadow-[0_2px_3px_rgba(160,32,32,0.18)]" : ""}
        ${(isHumanTarget || isAITarget) ? "text-gray-600" : ""}
        ${(surprise && !isHuman && !isAI) ? "ring-2 ring-pink-200/40" : ""}
        transition-all duration-200 ease-in-out
        overflow-hidden
        touch-manipulation
      `}
      style={{
        zIndex: isHuman || isAI ? 2 : isSpecial ? 1.5 : 1,
        aspectRatio: "1 / 1",
        boxSizing: "border-box",
        WebkitTapHighlightColor: "transparent",
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
          <span className="absolute bottom-[2px] right-[8px] text-xs md:text-base text-orange-700 font-black bg-white/90 px-2 py-0.5 rounded shadow-lg pointer-events-none select-none border border-amber-100">
            {boardPoints[y][x]}
          </span>
        )}
      {surprise && !isHuman && !isAI && !isHumanTarget && !isAITarget && !defense && (
        <span className="absolute top-2 left-2 z-20">
          <Gift size={22} className="text-pink-500 drop-shadow-glow animate-bounce" />
        </span>
      )}
      {defense && !isHuman && !isAI && (
        <span className={`absolute top-2 right-2 z-20`}>
          <Shield
            size={22}
            className={defense.owner === "human"
              ? "text-blue-900 drop-shadow-[0_0_7px_rgba(30,140,255,0.18)]"
              : "text-red-800 drop-shadow-[0_0_7px_rgba(230,80,50,0.18)]"}
          />
        </span>
      )}
      {isHumanTarget && (
        <span className="absolute inset-1 rounded bg-green-400/35 border border-green-600/70 pointer-events-none z-10" />
      )}
      {isAITarget && (
        <span className="absolute inset-1 rounded bg-orange-300/40 border border-orange-400/70 pointer-events-none z-10" />
      )}
    </button>
  );
};

export default GameTile;
