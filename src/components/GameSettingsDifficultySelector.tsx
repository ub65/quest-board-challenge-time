
import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";

type Props = {
  difficulty: "easy" | "medium" | "hard";
  onDifficultyChange: (d: "easy" | "medium" | "hard") => void;
};

const difficulties = [
  { labelKey: "difficulty.easy", value: "easy", color: "bg-green-200" },
  { labelKey: "difficulty.medium", value: "medium", color: "bg-yellow-200" },
  { labelKey: "difficulty.hard", value: "hard", color: "bg-red-200" },
];

const GameSettingsDifficultySelector = ({ difficulty, onDifficultyChange }: Props) => {
  const { t } = useLocalization();

  return (
    <div className="flex flex-col items-center w-full">
      <Label className="text-base font-semibold mb-2 block text-center w-full">
        {t("game.difficulty")}
      </Label>
      <div className="flex gap-2 justify-center w-full">
        {difficulties.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onDifficultyChange(d.value as "easy" | "medium" | "hard")}
            className={cn(
              "min-w-0 flex-1 max-w-[90px] px-0 py-0 flex items-stretch"
            )}
            style={{ flexBasis: 0 }}
          >
            <span
              className={cn(
                "w-full h-8 sm:h-9 rounded-md font-bold shadow ring-primary transition-all text-xs flex items-center justify-center border select-none px-1",
                d.color,
                difficulty === d.value
                  ? "ring-2 ring-offset-2 scale-105 bg-opacity-80"
                  : "hover:scale-105 bg-opacity-80"
              )}
            >
              {t(d.labelKey)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSettingsDifficultySelector;
