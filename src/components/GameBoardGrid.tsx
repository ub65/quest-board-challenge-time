
import React from "react";
import GameTile from "./GameBoard/GameTile";
import { useValidMoves } from "./GameBoard/useValidMoves";
import { Tile, SurpriseTile, DefenseTile } from "./GameBoard/types";

type PlayerPositions = { human: Tile; ai: Tile };

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
  surpriseTiles: SurpriseTile[];
  defenseTiles?: DefenseTile[];
  aiPendingTarget?: Tile | null;
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
  defenseTiles = [],
  aiPendingTarget = null,
}) => {
  const validMovesSet = useValidMoves({
    turn,
    winner,
    BOARD_SIZE,
    positions,
    defenseTiles,
    getValidMoves,
  });

  // Calculate responsive gap and padding based on board size
  const getResponsiveSpacing = (boardSize: number) => {
    if (boardSize <= 5) return "gap-3 md:gap-4 p-4 md:p-6";
    if (boardSize <= 7) return "gap-2 md:gap-3 p-3 md:p-4";
    if (boardSize <= 9) return "gap-1 md:gap-2 p-2 md:p-3";
    return "gap-0.5 md:gap-1 p-1 md:p-2";
  };

  // Modern frosted glass+gradient effect for the board background
  return (
    <div
      className="w-full flex justify-center items-center"
      style={{
        WebkitOverflowScrolling: "touch"
      }}
    >
      <div
        className={`
          grid ${getResponsiveSpacing(BOARD_SIZE)}
          rounded-[2.6rem] md:rounded-2xl
          shadow-2xl
          bg-gradient-to-br from-blue-100/85 via-white/85 to-violet-200/80
          border border-blue-100/60 backdrop-blur-xl
          relative
          ring-2 ring-sky-100/60
          transition-all
        `}
        style={{
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: "100%",
          maxWidth: "min(95vw, 460px)",
          minWidth: "min(95vw, 280px)",
        }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, y) =>
          Array.from({ length: BOARD_SIZE }).map((_, x) => {
            const surprise =
              surpriseTiles?.find(st => st.x === x && st.y === y && !st.used);
            const defense = defenseTiles?.find(dt => dt.x === x && dt.y === y);

            // Highlight only if tile is in validMovesSet and turn is human
            const highlight =
              !winner &&
              turn === "human" &&
              validMovesSet.has(`${x},${y}`) &&
              !(positions.human.x === x && positions.human.y === y) &&
              !(positions.ai.x === x && positions.ai.y === y) &&
              !defense;

            return (
              <GameTile
                key={x + "-" + y}
                x={x}
                y={y}
                BOARD_SIZE={BOARD_SIZE}
                boardPoints={boardPoints}
                positions={positions}
                humanTarget={humanTarget}
                aiTarget={aiTarget}
                winner={winner}
                turn={turn}
                disableInput={disableInput}
                highlight={highlight}
                onTileClick={onTileClick}
                positionsEqual={positionsEqual}
                surprise={surprise}
                defense={defense}
                aiPendingTarget={aiPendingTarget}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoardGrid;
