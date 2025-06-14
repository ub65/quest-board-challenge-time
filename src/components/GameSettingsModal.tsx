import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import GameSettingsDifficultySelector from "./GameSettingsDifficultySelector";
import GameSettingsSoundToggle from "./GameSettingsSoundToggle";
import GameSettingsSlider from "./GameSettingsSlider";

type GameSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
  boardSize: number;
  onBoardSizeChange: (v: number) => void;
  questionTime: number;
  onQuestionTimeChange: (v: number) => void;
  surpriseCount: number;
  onSurpriseCountChange: (v: number) => void;
  numDefenses: number;
  onNumDefensesChange: (v: number) => void;
  difficulty: "easy" | "medium" | "hard";
  onDifficultyChange: (d: "easy" | "medium" | "hard") => void;
};

const difficulties = [
  { labelKey: "difficulty.easy", value: "easy", color: "bg-green-200" },
  { labelKey: "difficulty.medium", value: "medium", color: "bg-yellow-200" },
  { labelKey: "difficulty.hard", value: "hard", color: "bg-red-200" },
];

const GameSettingsModal = ({
  open,
  onOpenChange,
  soundEnabled,
  onSoundChange,
  boardSize,
  onBoardSizeChange,
  questionTime,
  onQuestionTimeChange,
  surpriseCount,
  onSurpriseCountChange,
  numDefenses,
  onNumDefensesChange,
  difficulty,
  onDifficultyChange,
}: GameSettingsModalProps) => {
  const { t } = useLocalization();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background to-secondary p-0 shadow-2xl rounded-2xl border-0 max-w-[420px] max-h-[90vh] sm:max-h-[650px]">
        <ScrollArea className="px-8 pt-8 pb-0 max-h-[80vh] sm:max-h-[610px]">
          <DialogHeader>
            <div className="flex flex-col items-center gap-1 mb-2">
              <SlidersHorizontal size={32} className="text-primary" />
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {t('settings.title')}
              </DialogTitle>
              <DialogDescription className="mb-0 text-center">
                {t('settings.desc')}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-7">
            <LanguageSelector />
            <GameSettingsDifficultySelector
              difficulty={difficulty}
              onDifficultyChange={onDifficultyChange}
            />
            <GameSettingsSoundToggle
              soundEnabled={soundEnabled}
              onSoundChange={onSoundChange}
            />
            <GameSettingsSlider
              id="board-size-slider"
              labelKey="settings.boardSize"
              min={5}
              max={12}
              step={1}
              value={boardSize}
              onValueChange={onBoardSizeChange}
              displayValue={`${boardSize}x${boardSize}`}
              minLabelKey="settings.boardMin"
              maxLabelKey="settings.boardMax"
            />
            <GameSettingsSlider
              id="question-time-slider"
              labelKey="settings.questionTime"
              min={6}
              max={40}
              step={1}
              value={questionTime}
              onValueChange={onQuestionTimeChange}
              suffix="s"
              minLabelKey="settings.timeMin"
              maxLabelKey="settings.timeMax"
            />
            <GameSettingsSlider
              id="surprise-count-slider"
              labelKey="settings.surpriseCount"
              min={1}
              max={8}
              step={1}
              value={surpriseCount}
              onValueChange={onSurpriseCountChange}
              minLabelKey="settings.surpriseMin"
              maxLabelKey="settings.surpriseMax"
            />
            <GameSettingsSlider
              id="defense-count-slider"
              labelKey="settings.defenseCount"
              min={1}
              max={4}
              step={1}
              value={numDefenses}
              onValueChange={onNumDefensesChange}
              minLabelKey="settings.defenseMin"
              maxLabelKey="settings.defenseMax"
            />
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 font-semibold text-base transition-colors w-full shadow mb-2">
              {t('settings.close')}
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;
