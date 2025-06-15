import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { SlidersHorizontal, Save } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import GameSettingsDifficultySelector from "./GameSettingsDifficultySelector";
import GameSettingsSoundToggle from "./GameSettingsSoundToggle";
import GameSettingsSlider from "./GameSettingsSlider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

type QuestionType = "translate" | "math";

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
  questionType: QuestionType;
  onQuestionTypeChange: (q: QuestionType) => void;
};

const QUESTION_TYPE_OPTIONS = [
  { value: "translate", labelKey: "settings.questionTypeTranslate" },
  { value: "math", labelKey: "settings.questionTypeMath" },
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
  questionType,
  onQuestionTypeChange,
}: GameSettingsModalProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();

  // Local state for "pending" settings
  const [pendingSound, setPendingSound] = useState(soundEnabled);
  const [pendingBoardSize, setPendingBoardSize] = useState(boardSize);
  const [pendingQuestionTime, setPendingQuestionTime] = useState(questionTime);
  const [pendingSurpriseCount, setPendingSurpriseCount] = useState(surpriseCount);
  const [pendingNumDefenses, setPendingNumDefenses] = useState(numDefenses);
  const [pendingDifficulty, setPendingDifficulty] = useState<"easy" | "medium" | "hard">(difficulty);
  const [pendingQuestionType, setPendingQuestionType] = useState<QuestionType>(questionType);

  // Reset local state whenever the modal is opened
  useEffect(() => {
    if (open) {
      setPendingSound(soundEnabled);
      setPendingBoardSize(boardSize);
      setPendingQuestionTime(questionTime);
      setPendingSurpriseCount(surpriseCount);
      setPendingNumDefenses(numDefenses);
      setPendingDifficulty(difficulty);
      setPendingQuestionType(questionType);
    }
  }, [
    open,
    soundEnabled,
    boardSize,
    questionTime,
    surpriseCount,
    numDefenses,
    difficulty,
    questionType,
  ]);

  // Save handler
  const handleSave = () => {
    onSoundChange(pendingSound);
    onBoardSizeChange(pendingBoardSize);
    onQuestionTimeChange(pendingQuestionTime);
    onSurpriseCountChange(pendingSurpriseCount);
    onNumDefensesChange(pendingNumDefenses);
    onDifficultyChange(pendingDifficulty);
    onQuestionTypeChange(pendingQuestionType);

    onOpenChange(false);
  };

  // Cancel handler: just close, discard changes
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-background to-secondary p-0 shadow-2xl rounded-2xl border-0 max-w-[500px] max-h-[95vh] sm:max-h-[700px] w-full">
        <ScrollArea className="px-6 pt-7 pb-2 max-h-[88vh] sm:max-h-[630px]">
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
            {/* QUESTION TYPE SELECTOR */}
            <div className="flex flex-col items-center gap-2 w-full">
              <Label className="text-base font-semibold mb-2 block text-center w-full">
                {t("settings.questionType")}
              </Label>
              <div className="flex gap-3 justify-center w-full">
                {QUESTION_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPendingQuestionType(opt.value as QuestionType)}
                    className={`flex-1 px-2 py-2 rounded-md font-bold shadow border select-none transition-all text-xs
                      ${pendingQuestionType === opt.value ? "bg-blue-600 text-white border-blue-700 scale-105" : "bg-gray-100 border-gray-300 hover:bg-blue-200"}
                    `}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <GameSettingsDifficultySelector
              difficulty={pendingDifficulty}
              onDifficultyChange={setPendingDifficulty}
            />
            <GameSettingsSoundToggle
              soundEnabled={pendingSound}
              onSoundChange={setPendingSound}
            />
            <GameSettingsSlider
              id="board-size-slider"
              labelKey="settings.boardSize"
              min={5}
              max={12}
              step={1}
              value={pendingBoardSize}
              onValueChange={setPendingBoardSize}
              displayValue={`${pendingBoardSize}x${pendingBoardSize}`}
              minLabelKey="settings.boardMin"
              maxLabelKey="settings.boardMax"
            />
            <GameSettingsSlider
              id="question-time-slider"
              labelKey="settings.questionTime"
              min={6}
              max={40}
              step={1}
              value={pendingQuestionTime}
              onValueChange={setPendingQuestionTime}
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
              value={pendingSurpriseCount}
              onValueChange={setPendingSurpriseCount}
              minLabelKey="settings.surpriseMin"
              maxLabelKey="settings.surpriseMax"
            />
            <GameSettingsSlider
              id="defense-count-slider"
              labelKey="settings.defenseCount"
              min={1}
              max={4}
              step={1}
              value={pendingNumDefenses}
              onValueChange={setPendingNumDefenses}
              minLabelKey="settings.defenseMin"
              maxLabelKey="settings.defenseMax"
            />
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2 flex flex-col gap-2">
          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 w-full">
            <Button
              className="flex-1 font-semibold"
              onClick={handleSave}
              variant="default"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('settings.save') || "Save"}
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              onClick={handleCancel}
              type="button"
            >
              {t('settings.cancel') || "Cancel"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;
