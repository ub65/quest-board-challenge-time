
import React, { useState } from "react";
import GameBoard from "@/components/GameBoard";
import DifficultySelector from "@/components/DifficultySelector";
import { useLocalization } from "@/contexts/LocalizationContext";

const Index = () => {
  const { t, language } = useLocalization();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setDifficulty(null);
  };

  return (
    <div
      className={`
        min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-violet-100 flex flex-col items-center justify-center px-6
      `}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-5xl mt-6">
        <h1 className="text-4xl font-extrabold mb-4 text-center tracking-tight text-primary drop-shadow-sm">
          {t("game.title")}
        </h1>
      </div>
      {!difficulty ? (
        <DifficultySelector onSelect={setDifficulty} />
      ) : (
        <div className="w-full max-w-3xl animate-fade-in">
          <GameBoard key={gameKey} difficulty={difficulty} onRestart={handleRestart} />
        </div>
      )}
    </div>
  );
};

export default Index;
