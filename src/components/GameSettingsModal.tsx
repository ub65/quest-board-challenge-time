import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SlidersHorizontal, Save } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import GameSettingsDifficultySelector from "./GameSettingsDifficultySelector";
import GameSettingsSliderGroup from "./GameSettingsSliderGroup";
import { SoundControls } from "@/components/ui/sound-controls";
import { Button } from "@/components/ui/button";

type QuestionType = "translate" | "math";

type GameSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  questionType: QuestionType;
  onQuestionTypeChange: (q: QuestionType) => void;
  soundEnabled?: boolean;
  onSoundEnabledChange?: (enabled: boolean) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
};

const GameSettingsModal = ({
  open,
  onOpenChange,
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
  questionType,
  onQuestionTypeChange,
  soundEnabled = true,
  onSoundEnabledChange = () => {},
  volume = 0.5,
  onVolumeChange = () => {},
}: GameSettingsModalProps) => {
  const { t } = useLocalization();

  const [pendingBoardSize, setPendingBoardSize] = useState(boardSize);
  const [pendingQuestionTime, setPendingQuestionTime] = useState(questionTime);
  const [pendingSurpriseCount, setPendingSurpriseCount] = useState(surpriseCount);
  const [pendingNumDefenses, setPendingNumDefenses] = useState(numDefenses);
  const [pendingDifficulty, setPendingDifficulty] = useState(difficulty);
  const [pendingSoundEnabled, setPendingSoundEnabled] = useState(soundEnabled);
  const [pendingVolume, setPendingVolume] = useState(volume);

  useEffect(() => {
    if (open) {
      setPendingBoardSize(boardSize);
      setPendingQuestionTime(questionTime);
      setPendingSurpriseCount(surpriseCount);
      setPendingNumDefenses(numDefenses);
      setPendingDifficulty(difficulty);
      setPendingSoundEnabled(soundEnabled);
      setPendingVolume(volume);
    }
  }, [open]);

  const sliders = [
    {
      id: "board-size-slider",
      labelKey: "settings.boardSize",
      min: 5,
      max: 12,
      step: 1,
      value: pendingBoardSize,
      onValueChange: setPendingBoardSize,
      displayValue: `${pendingBoardSize}x${pendingBoardSize}`,
      minLabelKey: "settings.boardMin",
      maxLabelKey: "settings.boardMax",
    },
    {
      id: "question-time-slider",
      labelKey: "settings.questionTime",
      min: 6,
      max: 40,
      step: 1,
      value: pendingQuestionTime,
      onValueChange: setPendingQuestionTime,
      suffix: "s",
      minLabelKey: "settings.timeMin",
      maxLabelKey: "settings.timeMax",
    },
    {
      id: "surprise-count-slider",
      labelKey: "settings.surpriseCount",
      min: 1,
      max: 8,
      step: 1,
      value: pendingSurpriseCount,
      onValueChange: setPendingSurpriseCount,
      minLabelKey: "settings.surpriseMin",
      maxLabelKey: "settings.surpriseMax",
    },
    {
      id: "defense-count-slider",
      labelKey: "settings.defenseCount",
      min: 1,
      max: 4,
      step: 1,
      value: pendingNumDefenses,
      onValueChange: setPendingNumDefenses,
      minLabelKey: "settings.defenseMin",
      maxLabelKey: "settings.defenseMax",
    },
  ];

  const handleSave = () => {
    onBoardSizeChange(pendingBoardSize);
    onQuestionTimeChange(pendingQuestionTime);
    onSurpriseCountChange(pendingSurpriseCount);
    onNumDefensesChange(pendingNumDefenses);
    onDifficultyChange(pendingDifficulty);
    onSoundEnabledChange(pendingSoundEnabled);
    onVolumeChange(pendingVolume);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background to-secondary shadow-2xl rounded-2xl border-0 max-w-[500px] max-h-[90vh] w-full flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <SlidersHorizontal size={32} className="text-primary" />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {t("settings.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("settings.desc")}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 min-h-0">
          <div className="py-4 flex flex-col gap-6 pb-6">
            <LanguageSelector />
            <SoundControls
              soundEnabled={pendingSoundEnabled}
              onSoundEnabledChange={setPendingSoundEnabled}
              volume={pendingVolume}
              onVolumeChange={setPendingVolume}
            />
            <GameSettingsDifficultySelector
              difficulty={pendingDifficulty}
              onDifficultyChange={setPendingDifficulty}
            />
            <GameSettingsSliderGroup sliders={sliders} />
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 shrink-0 border-t bg-gradient-to-b from-transparent to-white/50">
          <div className="flex gap-3 w-full">
            <Button 
              className="flex-1 font-semibold" 
              onClick={handleSave} 
              variant="default"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("settings.save")}
            </Button>
            <Button 
              className="flex-1" 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
            >
              {t("settings.cancel")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;