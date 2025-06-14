
import React from "react";

type GameBoardTurnInfoProps = {
  winner: "human" | "ai" | null;
  turn: "human" | "ai";
  language: string;
  t: (key: string, params?: any) => string;
};

const GameBoardTurnInfo: React.FC<GameBoardTurnInfoProps> = ({
  winner,
  turn,
  language,
  t,
}) => {
  if (winner) return null;
  return (
    <div
      className={`w-full mt-4 flex justify-between items-center`}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <div className="font-medium">
        {t("game.yourTarget")}
      </div>
      <div className="font-medium text-right">
        {turn === "human" ? (
          <span className="text-blue-700 animate-pulse">{t("game.yourTurn")}</span>
        ) : (
          <span className="text-red-700">{t("game.aiThinking")}</span>
        )}
      </div>
    </div>
  );
};

export default GameBoardTurnInfo;

