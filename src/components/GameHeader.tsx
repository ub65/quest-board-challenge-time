
import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";

type GameHeaderProps = {
  onSettingsOpen: () => void;
  onRestart: () => void;
  difficulty: "easy" | "medium" | "hard";
};

const GameHeader: React.FC<GameHeaderProps> = ({ onSettingsOpen, onRestart, difficulty }) => {
  const { t, language } = useLocalization();
  return (
    <div
      className={`flex flex-row justify-between items-center w-full mb-4 gap-2`}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <button
        onClick={onSettingsOpen}
        className="px-3 py-2 rounded-md bg-gray-100 hover:bg-blue-200 text-blue-700 font-medium shadow transition-colors text-base"
      >
        {t("game.settings")}
      </button>
      <div className="flex flex-col">
        <span className="font-semibold">{t("game.difficulty")}:</span>
        <span className="capitalize">{t(`difficulty.${difficulty}`)}</span>
      </div>
      <button
        onClick={onRestart}
        className="px-4 py-2 rounded-md bg-gray-200 shadow hover:bg-blue-200 font-bold transition-colors"
      >
        {t("game.restart")}
      </button>
    </div>
  );
};

export default GameHeader;
