import React from "react";
import GameScoreboard from "../GameScoreboard";
import { Shield } from "lucide-react";
import { PlayerType, DefenseTile } from "./types";

type GameBoardHudProps = {
  humanPoints: number;
  aiPoints: number;
  numDefenses: number;
  defensesUsed: { human: number; ai: number };
  t: (key: string, params?: any) => string;
  winner: PlayerType | null;
  turn: PlayerType;
  onPlaceDefense: () => void;
  defenseMode: boolean;
  playerName?: string;
};

const GameBoardHud: React.FC<GameBoardHudProps> = ({
  humanPoints,
  aiPoints,
  numDefenses,
  defensesUsed,
  t,
  winner,
  turn,
  onPlaceDefense,
  defenseMode,
  playerName,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <GameScoreboard humanPoints={humanPoints} aiPoints={aiPoints} playerName={playerName} />
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-primary" />
          <span className="text-xs text-blue-700 font-semibold">
            {t("game.defenses_left")}: {numDefenses - defensesUsed.human}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-red-700" />
          <span className="text-xs text-red-700 font-semibold">
            {t("game.ai_defenses_left")}: {numDefenses - defensesUsed.ai}
          </span>
        </div>
        {!winner && turn === "human" && (numDefenses - defensesUsed.human > 0) && (
          <button
            onClick={onPlaceDefense}
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all animate-pulse"
            type="button"
          >
            <Shield size={20} className="inline-block mr-1" />
            {t("game.defense_place_btn")}
          </button>
        )}
      </div>
      <div className="w-full flex justify-center">
        {defenseMode && (
          <span className="text-sm text-blue-600 mt-2 animate-pulse">
            {t("game.defense_mode_select")}
          </span>
        )}
      </div>
    </div>
  );
};

export default GameBoardHud;
