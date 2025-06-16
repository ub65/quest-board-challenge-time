
import React from "react";
import { Bot } from "lucide-react";

type GameModeSelectorProps = {
  onSelect: (mode: "ai") => void;
  t: (k: string, params?: any) => string;
};

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelect, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 px-4">
    <div className="w-full max-w-sm mx-auto bg-white/95 shadow-xl rounded-3xl p-7 flex flex-col gap-9 mt-10">
      <h1 className="text-3xl font-extrabold text-center tracking-tight text-primary mb-2">
        {t("welcome.chooseMode") || "Choose Game Mode"}
      </h1>
      <div className="flex flex-col gap-6">
        <button
          className="flex items-center gap-3 justify-center px-6 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg shadow transition hover:bg-primary/90"
          onClick={() => onSelect("ai")}
        >
          <Bot className="w-7 h-7" /> {t("welcome.playVsAi") || "Play vs AI"}
        </button>
      </div>
    </div>
    <div className="mt-8 text-xs text-gray-500">
      &copy; {new Date().getFullYear()} Math Board Game ❤️
    </div>
  </div>
);

export default GameModeSelector;

