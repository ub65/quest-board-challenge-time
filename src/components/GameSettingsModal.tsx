import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SlidersHorizontal, Save, Volume2 } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import GameSettingsDifficultySelector from "./GameSettingsDifficultySelector";
import GameSettingsSliderGroup from "./GameSettingsSliderGroup";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { playSound } from "@/lib/audioManager";

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
  soundEnabled = true,
  onSoundEnabledChange,
  volume = 0.5,
  onVolumeChange,
}: GameSettingsModalProps) => {
  const { t } = useLocalization();

  const [pendingBoardSize, setPendingBoardSize] = useState(boardSize);
  const [pendingQuestionTime, setPendingQuestionTime] = useState(questionTime);
  const [pendingSurpriseCount, setPendingSurpriseCount] = useState(surpriseCount);
  const [pendingNumDefenses, setPendingNumDefenses] = useState(numDefenses);
  const [pendingDifficulty, setPendingDifficulty] = useState<"easy" | "medium" | "hard">(difficulty);
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
  }, [open, boardSize, questionTime, surpriseCount, numDefenses, difficulty, soundEnabled, volume]);

  const sliders = [
    {
      id: "board-size-slider",
      labelKey: "settings.boardSize",
      min: 5,
      max: 12,
      step: 1,
      value: pendingBoardSize,
      onValueChange: (v: number) => { setPendingBoardSize(v); },
      displayValue: `${pendingBoardSize}x${pendingBoardSize}`,
      minLabelKey: "settings.boardMin",
      maxLabelKey: "settings.boardMax"
    },
    {
      id: "question-time-slider",
      labelKey: "settings.questionTime",
      min: 6,
      max: 40,
      step: 1,
      value: pendingQuestionTime,
      onValueChange: (v: number) => { setPendingQuestionTime(v); },
      suffix: "s",
      minLabelKey: "settings.timeMin",
      maxLabelKey: "settings.timeMax"
    },
    {
      id: "surprise-count-slider",
      labelKey: "settings.surpriseCount",
      min: 1,
      max: 8,
      step: 1,
      value: pendingSurpriseCount,
      onValueChange: (v: number) => { setPendingSurpriseCount(v); },
      minLabelKey: "settings.surpriseMin",
      maxLabelKey: "settings.surpriseMax"
    },
    {
      id: "defense-count-slider",
      labelKey: "settings.defenseCount",
      min: 1,
      max: 4,
      step: 1,
      value: pendingNumDefenses,
      onValueChange: (v: number) => { setPendingNumDefenses(v); },
      minLabelKey: "settings.defenseMin",
      maxLabelKey: "settings.defenseMax"
    },
    ...(pendingSoundEnabled ? [{
      id: "volume-slider",
      labelKey: "settings.volume",
      min: 0,
      max: 1,
      step: 0.1,
      value: pendingVolume,
      onValueChange: (v: number) => { 
        setPendingVolume(v);
        // Play test sound when adjusting volume
        if (v > 0) {
          playSound('test', true, v);
        }
      },
      displayValue: `${Math.round(pendingVolume * 100)}%`,
      minLabelKey: "settings.volumeMin",
      maxLabelKey: "settings.volumeMax"
    }] : [])
  ];

  const handleSave = () => {
    onBoardSizeChange(pendingBoardSize);
    onQuestionTimeChange(pendingQuestionTime);
    onSurpriseCountChange(pendingSurpriseCount);
    onNumDefensesChange(pendingNumDefenses);
    onDifficultyChange(pendingDifficulty);
    if (onSoundEnabledChange) onSoundEnabledChange(pendingSoundEnabled);
    if (onVolumeChange) onVolumeChange(pendingVolume);
    onOpenChange(false);
  };

  const handleTestSound = () => {
    if (pendingSoundEnabled && pendingVolume > 0) {
      playSound('test', true, pendingVolume);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background to-secondary p-0 shadow-2xl rounded-2xl border-0 max-w-[500px] max-h-[95vh] sm:max-h-[700px] w-full flex flex-col">
        <ScrollArea className="flex-1 px-6 pt-7 pb-4 w-full overflow-y-auto">
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
          <div className="py-2 flex flex-col gap-7 w-full">
            <LanguageSelector />
            <GameSettingsDifficultySelector 
              difficulty={pendingDifficulty} 
              onDifficultyChange={(d) => { setPendingDifficulty(d); }} 
            />
            
            {/* Sound Settings */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold">
                  {t('settings.sound') || 'Sound Effects'}
                </label>
                <Switch
                  checked={pendingSoundEnabled}
                  onCheckedChange={(checked) => {
                    setPendingSoundEnabled(checked);
                    if (checked && pendingVolume > 0) {
                      // Play test sound when enabling
                      setTimeout(() => playSound('test', true, pendingVolume), 100);
                    }
                  }}
                />
              </div>
              {pendingSoundEnabled && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600 flex-1">
                    {t('settings.soundDesc') || 'Enable sound effects for game actions'}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestSound}
                    className="flex items-center gap-1"
                  >
                    <Volume2 size={14} />
                    Test
                  </Button>
                </div>
              )}
            </div>
            
            <GameSettingsSliderGroup sliders={sliders} />
          </div>
        </ScrollArea>
        <DialogFooter className="pt-3 pb-4 px-6 flex flex-col gap-2 bg-gradient-to-b from-transparent to-white/95 w-full z-10">
          <div className="flex gap-2 w-full">
            <Button className="flex-1 font-semibold" onClick={handleSave} variant="default">
              <Save className="w-4 h-4 mr-2" />
              {t('settings.save') || "Save"}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={() => onOpenChange(false)} type="button">
              {t('settings.cancel') || "Cancel"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;