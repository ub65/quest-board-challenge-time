import React from "react";
import { User, Bot, Clock, Target } from "lucide-react";

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
      className={`w-full mt-6 flex justify-center`}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 px-6 py-4 flex items-center gap-4 min-w-[280px] justify-between">
        {/* Your Target */}
        <div className="flex items-center gap-2 text-gray-600">
          <Target size={18} className="text-green-600" />
          <span className="text-sm font-medium">{t("game.yourTarget")}</span>
        </div>
        
        {/* Turn Indicator */}
        <div className="flex items-center gap-3">
          {turn === "human" ? (
            <>
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-xl border border-blue-200">
                <User size={18} className="text-blue-700" />
                <span className="text-blue-700 font-semibold text-sm">{t("game.yourTurn")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-blue-500 animate-pulse" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-xl border border-orange-200">
                <Bot size={18} className="text-orange-700" />
                <span className="text-orange-700 font-semibold text-sm">{t("game.aiThinking")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoardTurnInfo;