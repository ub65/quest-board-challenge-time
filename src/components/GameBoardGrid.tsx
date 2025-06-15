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

  // Responsive: calculate max grid width based on screen size
  // (Larger on desktop, nearly full on mobile)
  // Grid will shrink to fit mobile screens, keeping spacing tight.
  return (
    <div
      className="w-full flex justify-center items-center"
      style={{
        WebkitOverflowScrolling: "touch"
      }}
    >
      <div
        className={`
          grid gap-[2vw] 
          md:gap-1
          rounded-2xl p-[2vw] md:p-2 shadow-lg bg-white/90
          border border-gray-200
          transition-all
        `}
        style={{
          gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: "100%",
          maxWidth: "450px",
          minWidth: "min(92vw, 400px)",
          // Ensures mobile grid fits screen, prevents overflow.
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
