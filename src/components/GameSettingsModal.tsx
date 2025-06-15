
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
import GameSettingsSoundToggle from "./GameSettingsSoundToggle";
import GameSettingsSlider from "./GameSettingsSlider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Utility to detect iOS/keyboard (very basic, best-effort)
const useKeyboardPadding = () => {
  const [keyboardPad, setKeyboardPad] = useState(0);

  useEffect(() => {
    const handler = () => {
      if (window.visualViewport) {
        setKeyboardPad(
          Math.max(0, window.outerHeight - window.visualViewport.height)
        );
      } else {
        setKeyboardPad(0);
      }
    };
    window.visualViewport?.addEventListener("resize", handler);
    window.visualViewport?.addEventListener("scroll", handler);
    return () => {
      window.visualViewport?.removeEventListener("resize", handler);
      window.visualViewport?.removeEventListener("scroll", handler);
    };
  }, []);

  return keyboardPad;
};

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
    onOpenChange(false);
  };

  // Cancel handler: just close, discard changes
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Add extra bottom padding if keyboard is open (for iOS esp.)
  const keyboardPad = useKeyboardPadding();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          !p-0
          max-w-[420px]
          sm:max-w-[440px]
          w-full
          rounded-2xl
          overflow-hidden
          border
          bg-white
          shadow-xl
          flex flex-col
          min-h-[66vh]
          max-h-[97vh]
          animate-fade-in
        `}
        style={{
          minHeight: "66vh",
          maxHeight: "97vh",
          borderWidth: 1,
          borderColor: "rgb(228,232,240)",
          backgroundColor: "white"
        }}
      >
        {/* Classic "windowed" header */}
        <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 pb-4 w-full border-b flex flex-col items-center">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-primary/10 p-2 flex items-center justify-center">
              <SlidersHorizontal size={28} className="text-primary" />
            </span>
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900">
              {t("settings.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-2 text-base text-gray-500 text-center max-w-[340px]">
            {t("settings.desc")}
          </DialogDescription>
        </div>
        <Separator className="w-full" />
        {/* SCROLL AREA FOR SETTINGS */}
        <ScrollArea
          className="flex-1 px-5 pt-3 pb-2 overflow-y-auto w-full"
          style={{
            minHeight: 0,
            maxHeight: "calc(97vh - 182px)",
            paddingBottom: (keyboardPad || 96) + "px",
          }}
        >
          {/* CONTENTS */}
          <div className="flex flex-col gap-4 w-full mx-auto max-w-[350px]">
            <section>
              <LanguageSelector />
            </section>
            <Separator className="my-2" />
            <section>
              <GameSettingsDifficultySelector
                difficulty={pendingDifficulty}
                onDifficultyChange={setPendingDifficulty}
              />
            </section>
            <Separator className="my-2" />
            <section>
              <GameSettingsSoundToggle
                soundEnabled={pendingSound}
                onSoundChange={setPendingSound}
              />
            </section>
            <Separator className="my-2" />
            <section>
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
            </section>
            <section>
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
            </section>
            <section>
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
            </section>
            <section>
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
            </section>
          </div>
          {/* Spacer for bottom footer */}
          <div style={{ height: (keyboardPad || 104) }} />
        </ScrollArea>
        {/* Fixed footer */}
        <DialogFooter
          className="
            bg-gradient-to-b from-slate-100 to-white/95
            px-6
            py-4
            flex flex-row-reverse gap-3
            border-t
            sticky
            bottom-0
            w-full
            shadow-[0_-3px_12px_-6px_rgba(0,0,0,0.07)]
            z-30
          "
        >
          <Button
            className="font-semibold min-w-[110px]"
            onClick={handleSave}
            variant="default"
          >
            <Save className="w-4 h-4 mr-2" />
            {t("settings.save") || "Save"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            type="button"
            className="min-w-[100px]"
          >
            {t("settings.cancel") || "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettingsModal;
