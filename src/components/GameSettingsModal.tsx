
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SlidersHorizontal, Save } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import GameSettingsDifficultySelector from "./GameSettingsDifficultySelector";
import GameSettingsSoundToggle from "./GameSettingsSoundToggle";
import GameSettingsSlider from "./GameSettingsSlider";
import GameSettingsVolumeSlider from "./GameSettingsVolumeSlider";
import { Button } from "@/components/ui/button";
import TickSound from "./TickSound";

type QuestionType = "translate" | "math";
type GameSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
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
};

const GameSettingsModal = ({
  open,
  onOpenChange,
  soundEnabled,
  onSoundChange,
  volume,
  onVolumeChange,
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
  onQuestionTypeChange
}: GameSettingsModalProps) => {
  const { t } = useLocalization();

  // Local state for "pending" settings
  const [pendingSound, setPendingSound] = useState(soundEnabled);
  const [pendingVolume, setPendingVolume] = useState(volume);
  const [pendingBoardSize, setPendingBoardSize] = useState(boardSize);
  const [pendingQuestionTime, setPendingQuestionTime] = useState(questionTime);
  const [pendingSurpriseCount, setPendingSurpriseCount] = useState(surpriseCount);
  const [pendingNumDefenses, setPendingNumDefenses] = useState(numDefenses);
  const [pendingDifficulty, setPendingDifficulty] = useState<"easy" | "medium" | "hard">(difficulty);
  const [pendingQuestionType, setPendingQuestionType] = useState<QuestionType>(questionType);

  // Add tick counter for sound feedback
  const [tickCounter, setTickCounter] = useState(0);

  // Reset local state whenever the modal is opened
  useEffect(() => {
    if (open) {
      setPendingSound(soundEnabled);
      setPendingVolume(volume);
      setPendingBoardSize(boardSize);
      setPendingQuestionTime(questionTime);
      setPendingSurpriseCount(surpriseCount);
      setPendingNumDefenses(numDefenses);
      setPendingDifficulty(difficulty);
      setPendingQuestionType(questionType);
    }
  }, [open, soundEnabled, volume, boardSize, questionTime, surpriseCount, numDefenses, difficulty, questionType]);

  // Helper to trigger tick sound
  const triggerTick = () => {
    setTickCounter(prev => prev + 1);
  };

  // Wrapped handlers that trigger sound feedback and immediately apply changes
  const handleSoundChange = (value: boolean) => {
    setPendingSound(value);
    onSoundChange(value); // Apply immediately
    triggerTick();
  };

  const handleVolumeChange = (value: number) => {
    setPendingVolume(value);
    onVolumeChange(value); // Apply immediately
    triggerTick();
  };

  const handleBoardSizeChange = (value: number) => {
    setPendingBoardSize(value);
    triggerTick();
  };

  const handleQuestionTimeChange = (value: number) => {
    setPendingQuestionTime(value);
    triggerTick();
  };

  const handleSurpriseCountChange = (value: number) => {
    setPendingSurpriseCount(value);
    triggerTick();
  };

  const handleNumDefensesChange = (value: number) => {
    setPendingNumDefenses(value);
    triggerTick();
  };

  const handleDifficultyChange = (value: "easy" | "medium" | "hard") => {
    setPendingDifficulty(value);
    triggerTick();
  };

  // Save handler - now only saves non-sound settings since sound is applied immediately
  const handleSave = () => {
    onBoardSizeChange(pendingBoardSize);
    onQuestionTimeChange(pendingQuestionTime);
    onSurpriseCountChange(pendingSurpriseCount);
    onNumDefensesChange(pendingNumDefenses);
    onDifficultyChange(pendingDifficulty);
    triggerTick();
    onOpenChange(false);
  };

  // Cancel handler: revert sound settings and close
  const handleCancel = () => {
    // Revert sound settings to original values
    onSoundChange(soundEnabled);
    onVolumeChange(volume);
    onOpenChange(false);
  };

  console.log("[GameSettingsModal] Current sound state:", { pendingSound, pendingVolume, soundEnabled, volume });

  return (
    <>
      <TickSound tick={tickCounter} enabled={pendingSound} volume={pendingVolume} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          style={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: "60vh",
            maxHeight: "95vh",
            height: "95vh",
          }}
          className="bg-gradient-to-br from-background to-secondary p-0 shadow-2xl rounded-2xl border-0 max-w-[500px] max-h-[95vh] sm:max-h-[700px] w-full flex flex-col"
        >
          <ScrollArea
            className="flex-1 px-6 pt-7 pb-4 w-full overflow-y-auto"
            style={{
              minHeight: 0,
            }}
          >
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
              <GameSettingsDifficultySelector difficulty={pendingDifficulty} onDifficultyChange={handleDifficultyChange} />
              <GameSettingsSoundToggle soundEnabled={pendingSound} onSoundChange={handleSoundChange} />
              <GameSettingsVolumeSlider 
                volume={pendingVolume} 
                onVolumeChange={handleVolumeChange} 
                disabled={!pendingSound}
              />
              <GameSettingsSlider id="board-size-slider" labelKey="settings.boardSize" min={5} max={12} step={1} value={pendingBoardSize} onValueChange={handleBoardSizeChange} displayValue={`${pendingBoardSize}x${pendingBoardSize}`} minLabelKey="settings.boardMin" maxLabelKey="settings.boardMax" />
              <GameSettingsSlider id="question-time-slider" labelKey="settings.questionTime" min={6} max={40} step={1} value={pendingQuestionTime} onValueChange={handleQuestionTimeChange} suffix="s" minLabelKey="settings.timeMin" maxLabelKey="settings.timeMax" />
              <GameSettingsSlider id="surprise-count-slider" labelKey="settings.surpriseCount" min={1} max={8} step={1} value={pendingSurpriseCount} onValueChange={handleSurpriseCountChange} minLabelKey="settings.surpriseMin" maxLabelKey="settings.surpriseMax" />
              <GameSettingsSlider id="defense-count-slider" labelKey="settings.defenseCount" min={1} max={4} step={1} value={pendingNumDefenses} onValueChange={handleNumDefensesChange} minLabelKey="settings.defenseMin" maxLabelKey="settings.defenseMax" />
            </div>
          </ScrollArea>
          <DialogFooter className="pt-3 pb-4 px-6 flex flex-col gap-2 bg-gradient-to-b from-transparent to-white/95 w-full z-10">
            <div className="flex gap-2 w-full">
              <Button className="flex-1 font-semibold" onClick={handleSave} variant="default">
                <Save className="w-4 h-4 mr-2" />
                {t('settings.save') || "Save"}
              </Button>
              <Button className="flex-1" variant="secondary" onClick={handleCancel} type="button">
                {t('settings.cancel') || "Cancel"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameSettingsModal;
