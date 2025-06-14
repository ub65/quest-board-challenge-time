
import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";

type GameScoreboardProps = {
  humanPoints: number;
  aiPoints: number;
};

const GameScoreboard: React.FC<GameScoreboardProps> = ({ humanPoints, aiPoints }) => {
  const { t, language } = useLocalization();
  return (
    <div
      className={`
        flex ${language === "he" ? "flex-row-reverse" : "flex-row"}
        gap-8 mb-2 w-full justify-center text-lg font-semibold
      `}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <div className="flex flex-row items-center gap-2">
        <span className="w-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
          YOU
        </span>
        <span className="text-blue-900 ml-2">{t("game.points")}: {humanPoints}</span>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="w-7 rounded bg-red-600 text-white flex items-center justify-center font-bold shadow-md">
          AI
        </span>
        <span className="text-red-800 ml-2">{t("game.points")}: {aiPoints}</span>
      </div>
    </div>
  );
};

export default GameScoreboard;
