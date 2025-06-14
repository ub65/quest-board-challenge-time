
import type { Tile, DefenseTile, SurpriseTile } from "./types";

type CanPlaceDefenseParams = {
  tile: Tile;
  BOARD_SIZE: number;
  numDefenses: number;
  positions: { human: Tile; ai: Tile };
  defenseTiles: DefenseTile[];
  surpriseTiles: SurpriseTile[];
  defensesUsed: { human: number; ai: number };
  t: (key: string) => string;
};

export function canPlaceDefenseHere({
  tile,
  BOARD_SIZE,
  numDefenses,
  positions,
  defenseTiles,
  surpriseTiles,
  defensesUsed,
  t,
}: CanPlaceDefenseParams): string | null {
  if (defensesUsed.human >= numDefenses)
    return t("game.defense_already_used") || "No more defenses";
  if ((tile.x === 0 && tile.y === 0) || (tile.x === BOARD_SIZE - 1 && tile.y === BOARD_SIZE - 1))
    return t("game.defense_no_corner") || "Can't place on start/end";
  if (
    (positions.human.x === tile.x && positions.human.y === tile.y) ||
    (positions.ai.x === tile.x && positions.ai.y === tile.y)
  )
    return t("game.defense_no_player") || "Can't place on pieces";
  if (defenseTiles.some((d) => d.x === tile.x && d.y === tile.y))
    return t("game.defense_already_here") || "Already a defense";
  if (surpriseTiles.some((s) => s.x === tile.x && s.y === tile.y && !s.used))
    return t("game.defense_no_surprise") || "Can't place on a surprise";
  return null;
}
