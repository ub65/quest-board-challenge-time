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

  // KEYBOARD KEY STYLE
  let bg =
    "bg-white dark:bg-neutral-900"; // light/white key background, dark mode support
  let border =
    "border border-neutral-300 dark:border-neutral-700"; // subtle "key" border
  let innerShadow =
    "shadow-inner shadow-black/5 dark:shadow-white/5"; // faint inner shadow
  let boxShadow =
    "shadow-lg shadow-neutral-400/25 dark:shadow-neutral-950/50"; // outer shadow
  let fontClass =
    "font-mono tracking-widest"; // monospaced keyboard text

  let content = "";

  if (isHuman) {
    // Main key highlight for human
    bg =
      "bg-blue-100 dark:bg-blue-800";
    border =
      "border-2 border-blue-400 dark:border-blue-700";
    boxShadow =
      "shadow-[0_2px_10px_-3px_rgba(37,99,235,0.22)] dark:shadow-[0_2px_24px_-6px_rgba(56,189,248,0.22)]";
    fontClass =
      "font-mono font-bold text-blue-800 dark:text-blue-200 tracking-widest";
    content = "YOU";
  } else if (isAI) {
    bg =
      "bg-orange-100 dark:bg-orange-900";
    border =
      "border-2 border-orange-500 dark:border-orange-700";
    boxShadow =
      "shadow-[0_2px_10px_-3px_rgba(249,115,22,0.2)] dark:shadow-[0_2px_24px_-6px_rgba(251,146,60,0.18)]";
    fontClass =
      "font-mono font-bold text-orange-700 dark:text-orange-200 tracking-widest";
    content = "AI";
  } else if (isHumanTarget) {
    bg =
      "bg-green-50 dark:bg-green-900";
    border = "border-2 border-green-400 dark:border-green-700";
    fontClass =
      "font-mono font-bold text-green-600 dark:text-green-200 tracking-widest";
    content = "";
  } else if (isAITarget) {
    bg =
      "bg-yellow-50 dark:bg-yellow-900";
    border = "border-2 border-yellow-300 dark:border-yellow-600";
    fontClass =
      "font-mono font-bold text-yellow-600 dark:text-yellow-200 tracking-widest";
    content = "";
  } else if (surprise && !defense) {
    bg =
      "bg-pink-50 dark:bg-pink-900";
    border = "border-2 border-pink-200 dark:border-pink-600";
    fontClass = "font-mono tracking-widest";
  } else if (defense) {
    bg =
      "bg-gray-50 dark:bg-gray-800";
    border = "border-2 border-gray-400 dark:border-gray-500";
    fontClass = "font-mono tracking-widest";
  }

  // Border for targets (see above logic)
  let targetBorder = "";
  if (isHumanTarget) {
    targetBorder = "border-2 border-dashed border-green-400 dark:border-green-600";
  } else if (isAITarget) {
    targetBorder = "border-2 border-dashed border-yellow-300 dark:border-yellow-600";
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

  // Responsive keyboard key sizing
  // Aspect ratio and sizing like a wide keyboard key
  const raisedClass = (highlight || isHuman || isAI)
    ? "hover:scale-[1.04] md:hover:scale-105 active:scale-100"
    : "";

  // Press/active effect to "depress" keyboard key
  const activeClass =
    "active:shadow-sm active:translate-y-[2px] active:bg-neutral-200 dark:active:bg-neutral-700";

  // "Key" highlight for anything with user interaction
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
        text-[4.2vw] md:text-[1.1rem] font-extrabold flex items-center justify-center
        rounded-xl
        ${bg} ${border} ${innerShadow} ${boxShadow} ${fontClass}
        ${highlight ? "cursor-pointer hover:ring-2 hover:ring-indigo-400/60 transition-transform duration-150" : "cursor-default"}
        ${raisedClass} ${activeClass}
        ${glowAnimClass}
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
      <span className="z-10">{content}</span>
      {(content === "" &&
        !isHuman &&
        !isAI &&
        !(
          (x === 0 && y === 0) ||
          (x === BOARD_SIZE - 1 && y === BOARD_SIZE - 1)
        ) &&
        boardPoints[y] &&
        boardPoints[y][x] > 0) && (
          <span className="absolute bottom-[3px] right-[10px] text-xs md:text-base text-orange-700 font-black bg-white/80 dark:bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-amber-100">
            {boardPoints[y][x]}
          </span>
        )}
      {surprise && !isHuman && !isAI && !isHumanTarget && !isAITarget && !defense && (
        <span className="absolute top-2 left-2 z-20">
          <Gift size={20} className="text-pink-500 drop-shadow-glow animate-bounce" />
        </span>
      )}
      {defense && !isHuman && !isAI && (
        <span className={`absolute top-2 right-2 z-20`}>
          <Shield
            size={20}
            className={defense.owner === "human"
              ? "text-blue-900 dark:text-blue-200 drop-shadow-[0_0_7px_rgba(30,140,255,0.18)]"
              : "text-red-800 dark:text-red-400 drop-shadow-[0_0_7px_rgba(230,80,50,0.18)]"}
          />
        </span>
      )}
      {isHumanTarget && (
        <span className="absolute inset-1 rounded bg-green-400/15 border border-green-600/15 pointer-events-none z-10" />
      )}
      {isAITarget && (
        <span className="absolute inset-1 rounded bg-orange-300/15 border border-orange-400/15 pointer-events-none z-10" />
      )}
    </button>
  );
};

export default GameTile;
