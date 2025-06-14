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

            {/* Difficulty Setting */}
            <div>
              <Label className="text-base font-semibold mb-2 block">{t("game.difficulty")}</Label>
              <div className="flex gap-3">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => onDifficultyChange(d.value as "easy" | "medium" | "hard")}
                    className={cn(
                      "flex-1 min-w-0 px-0 py-0 flex items-stretch",
                      // container for button children
                    )}
                  >
                    <span
                      className={cn(
                        "w-full h-12 sm:h-14 rounded-lg font-bold shadow ring-primary transition-all text-base flex items-center justify-center border select-none",
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

            {/* Sound Toggle */}
            <div className="flex items-center justify-between gap-4 px-1">
              <Label htmlFor="sound-toggle" className="text-base cursor-pointer select-none">
                {t('settings.sound')}
              </Label>
              <Switch
                id="sound-toggle"
                checked={soundEnabled}
                onCheckedChange={onSoundChange}
                className="scale-110"
              />
            </div>
            {/* Board Size Slider */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="board-size-slider" className="text-base font-semibold mb-1 select-none flex justify-between">
                <span>{t('settings.boardSize')}</span>
                <span className="text-primary">{boardSize}x{boardSize}</span>
              </Label>
              <Slider
                id="board-size-slider"
                min={5}
                max={12}
                step={1}
                value={[boardSize]}
                onValueChange={([val]) => onBoardSizeChange(val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{t('settings.boardMin')}</span>
                <span>{t('settings.boardMax')}</span>
              </div>
            </div>
            {/* Question Time Slider */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="question-time-slider" className="text-base font-semibold mb-1 select-none flex justify-between">
                <span>{t('settings.questionTime')}</span>
                <span className="text-primary">{questionTime} s</span>
              </Label>
              <Slider
                id="question-time-slider"
                min={6}
                max={40}
                step={1}
                value={[questionTime]}
                onValueChange={([val]) => onQuestionTimeChange(val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{t('settings.timeMin')}</span>
                <span>{t('settings.timeMax')}</span>
              </div>
            </div>
            {/* Surprise Count Slider */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="surprise-count-slider" className="text-base font-semibold mb-1 select-none flex justify-between">
                <span>{t('settings.surpriseCount')}</span>
                <span className="text-primary">{surpriseCount}</span>
              </Label>
              <Slider
                id="surprise-count-slider"
                min={1}
                max={8}
                step={1}
                value={[surpriseCount]}
                onValueChange={([val]) => onSurpriseCountChange(val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{t('settings.surpriseMin')}</span>
                <span>{t('settings.surpriseMax')}</span>
              </div>
            </div>
            {/* Defense Count Slider */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="defense-count-slider" className="text-base font-semibold mb-1 select-none flex justify-between">
                <span>{t('settings.defenseCount')}</span>
                <span className="text-primary">{numDefenses}</span>
              </Label>
              <Slider
                id="defense-count-slider"
                min={1}
                max={4}
                step={1}
                value={[numDefenses]}
                onValueChange={([val]) => onNumDefensesChange(val)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{t('settings.defenseMin')}</span>
                <span>{t('settings.defenseMax')}</span>
              </div>
            </div>
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
