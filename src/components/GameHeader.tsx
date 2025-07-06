import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Volume2, VolumeX, RotateCcw, Home } from "lucide-react";

type GameHeaderProps = {
  onRestart: () => void;
  onPause: () => void;
  difficulty: "easy" | "medium" | "hard";
  soundEnabled: boolean;
  onToggleSound: () => void;
};

const GameHeader: React.FC<GameHeaderProps> = ({ 
  onRestart, 
  onPause,
  difficulty, 
  soundEnabled, 
  onToggleSound 
}) => {
  const { t, language } = useLocalization();
  
  const handleSoundToggle = () => {
    console.log(`[SOUND] Header sound toggle clicked, current state: ${soundEnabled}`);
    onToggleSound();
  };
  
  return (
    <div
      className={`flex flex-row justify-between items-center w-full mb-4 gap-2`}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      {/* Modern Sound Toggle Button */}
      <div className="relative">
        <button
          onClick={handleSoundToggle}
          className={`
            group relative overflow-hidden
            w-12 h-12 rounded-2xl
            transition-all duration-300 ease-out
            transform hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl
            ${soundEnabled 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
              : 'bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
            }
          `}
          title={soundEnabled ? t("sound.mute") || "Mute" : t("sound.unmute") || "Unmute"}
        >
          {/* Background glow effect */}
          <div className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${soundEnabled ? 'bg-blue-400/30' : 'bg-gray-300/30'}
            blur-xl scale-110
          `} />
          
          {/* Icon container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {soundEnabled ? (
              <Volume2 
                size={20} 
                className="text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110" 
              />
            ) : (
              <VolumeX 
                size={20} 
                className="text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110" 
              />
            )}
          </div>
          
          {/* Ripple effect on click */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />
          
          {/* Sound waves animation when enabled */}
          {soundEnabled && (
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-0.5 h-3 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-0.5 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </button>
        
        {/* Status indicator dot */}
        <div className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
          transition-all duration-300
          ${soundEnabled ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'}
          shadow-lg
        `} />
      </div>

      {/* Difficulty Display */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-gray-600">{t("game.difficulty")}:</span>
        <div className={`
          px-3 py-1 rounded-full text-sm font-bold shadow-sm
          ${difficulty === 'easy' ? 'bg-green-100 text-green-700 border border-green-200' : 
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
            'bg-red-100 text-red-700 border border-red-200'}
        `}>
          {t(`difficulty.${difficulty}`)}
        </div>
      </div>

      {/* Control Buttons Group */}
      <div className="flex items-center gap-2">
        {/* Modern Pause/Home Button */}
        <div className="relative">
          <button
            onClick={onPause}
            className="
              group relative overflow-hidden
              w-12 h-12 rounded-2xl
              bg-gradient-to-br from-orange-500 to-orange-600 
              hover:from-orange-600 hover:to-orange-700
              transition-all duration-300 ease-out
              transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
            "
            title={t("game.pause") || "חזרה למסך הראשי"}
          >
            {/* Background glow effect */}
            <div className="
              absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              bg-orange-400/30 blur-xl scale-110
            " />
            
            {/* Icon container */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <Home 
                size={20} 
                className="text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110" 
              />
            </div>
            
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />
            
            {/* Pause indicator */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
            </div>
          </button>
          
          {/* Action indicator dot */}
          <div className="
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
            bg-yellow-400 shadow-yellow-400/50 shadow-lg
            transition-all duration-300
          " />
        </div>

        {/* Modern Restart Button */}
        <div className="relative">
          <button
            onClick={onRestart}
            className="
              group relative overflow-hidden
              w-12 h-12 rounded-2xl
              bg-gradient-to-br from-emerald-500 to-emerald-600 
              hover:from-emerald-600 hover:to-emerald-700
              transition-all duration-300 ease-out
              transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
            "
            title={t("game.restart")}
          >
            {/* Background glow effect */}
            <div className="
              absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              bg-emerald-400/30 blur-xl scale-110
            " />
            
            {/* Icon container */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <RotateCcw 
                size={20} 
                className="text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:rotate-180" 
              />
            </div>
            
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />
            
            {/* Rotating animation indicator */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" />
            </div>
          </button>
          
          {/* Action indicator dot */}
          <div className="
            absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
            bg-orange-400 shadow-orange-400/50 shadow-lg
            transition-all duration-300
          " />
        </div>
      </div>
    </div>
  );
};

export default GameHeader;