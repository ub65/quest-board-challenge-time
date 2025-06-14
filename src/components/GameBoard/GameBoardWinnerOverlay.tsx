
import React from "react";

type GameBoardWinnerOverlayProps = {
  winner: "human" | "ai" | null;
  humanPoints: number;
  aiPoints: number;
  t: (key: string, params?: any) => string;
  onRestart: () => void;
};

const GameBoardWinnerOverlay: React.FC<GameBoardWinnerOverlayProps> = ({
  winner,
  humanPoints,
  aiPoints,
  t,
  onRestart,
}) => {
  if (!winner) return null;
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in z-10">
      <div className="text-3xl font-bold text-white mb-3 drop-shadow-2xl">
        {winner === "human" ? t("game.youWin") : t("game.aiWins")}
      </div>
      <div className="flex flex-col gap-1 text-lg text-white font-semibold mb-2">
        <div>
          {t("game.yourPoints")}: <span className="text-amber-200 font-bold">{humanPoints}</span>
        </div>
        <div>
          {t("game.aiPoints")}: <span className="text-amber-200 font-bold">{aiPoints}</span>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="bg-green-400 shadow px-5 py-2 rounded-lg text-xl font-bold text-white hover:bg-green-500 hover:scale-105 transition-all mt-2"
      >
        {t("game.playAgain")}
      </button>
    </div>
  );
};

export default GameBoardWinnerOverlay;

