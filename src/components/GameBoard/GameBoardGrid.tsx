import React, { useMemo } from "react";
import GameTile from "./GameTile";
import { Tile, SurpriseTile, DefenseTile } from "./types";

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
  const validMovesSet = useMemo(() => {
    if (winner || turn !== "human") return new Set<string>();
    return new Set(
      getValidMoves(positions.human)
        .filter(
          (t) =>
            t.x >= 0 &&
            t.y >= 0 &&
            t.x < BOARD_SIZE &&
            t.y < BOARD_SIZE
        )
        .map((t) => `${t.x},${t.y}`)
    );
  }, [positions.human.x, positions.human.y, defenseTiles, BOARD_SIZE, winner, turn, getValidMoves]);

  const getResponsiveSpacing = (boardSize: number) => {
    if (boardSize <= 5) return "gap-3 md:gap-4 p-4 md:p-6";
    if (boardSize <= 7) return "gap-2 md:gap-3 p-3 md:p-4";
    if (boardSize <= 9) return "gap-1 md:gap-2 p-2 md:p-3";
    return "gap-0.5 md:gap-1 p-1 md:p-2";
  };

  return (
    <div
      className="w-full flex justify-center items-center"
      style={{ WebkitOverflowScrolling: "touch" }}
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
            const surprise = surpriseTiles?.find(st => st.x === x && st.y === y && !st.used);
            const defense = defenseTiles?.find(dt => dt.x === x && dt.y === y);

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