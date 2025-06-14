
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
    <div>
      <Label className="text-base font-semibold mb-2 block">
        {t("game.difficulty")}
      </Label>
      <div className="flex gap-2 justify-between flex-wrap">
        {difficulties.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onDifficultyChange(d.value as "easy" | "medium" | "hard")}
            className={cn(
              "flex-1 min-w-0 max-w-[110px] sm:max-w-[120px] px-0 py-0 flex items-stretch"
            )}
            style={{ flexBasis: 0 }}
          >
            <span
              className={cn(
                "w-full h-10 sm:h-11 rounded-md font-bold shadow ring-primary transition-all text-sm flex items-center justify-center border select-none px-2",
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
