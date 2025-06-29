import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Volume2, VolumeX } from "lucide-react";

type GameHeaderProps = {
  onRestart: () => void;
  difficulty: "easy" | "medium" | "hard";
  soundEnabled: boolean;
  onToggleSound: () => void;
};

const GameHeader: React.FC<GameHeaderProps> = ({ 
  onRestart, 
  difficulty, 
  soundEnabled, 
  onToggleSound 
}) => {
  const { t, language } = useLocalization();
  return (
    <div
      className={`flex flex-row justify-between items-center w-full mb-4 gap-2`}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <button
        onClick={onToggleSound}
        className="px-3 py-2 rounded-md bg-gray-100 hover:bg-blue-200 text-blue-700 font-medium shadow transition-colors text-base flex items-center gap-2"
        title={soundEnabled ? t("sound.mute") || "Mute" : t("sound.unmute") || "Unmute"}
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        {soundEnabled ? t("sound.on") || "Sound On" : t("sound.off") || "Sound Off"}
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