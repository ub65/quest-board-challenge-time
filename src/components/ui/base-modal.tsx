import React, { useEffect, useState } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Slider } from "@/components/ui/slider";
import { soundManager } from "@/lib/soundManager";

type BaseModalProps = {
  isOpen: boolean;
  question: any;
  onSubmit: (isCorrect: boolean) => void;
  timeLimit?: number;
  children: React.ReactNode;
  onAnswerSelect?: (selectedIdx: number, correct: boolean) => void;
};

const shuffle = (arr: any[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getTimeSliderColor = (timeLeft: number, timeLimit: number) => {
  const percent = timeLeft / timeLimit;
  if (percent > 2 / 3) return "bg-green-500";
  if (percent > 1 / 3) return "bg-yellow-400";
  if (percent > 0.15) return "bg-orange-400";
  return "bg-red-500";
};

export const useQuestionModal = (question: any, timeLimit: number, isOpen: boolean, onSubmit: (correct: boolean) => void) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffled, setShuffled] = useState<{ answer: string; idx: number }[]>([]);
  const [time, setTime] = useState(timeLimit);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (question) {
      const arr = question.answers.map((answer: string, idx: number) => ({ answer, idx }));
      setShuffled(shuffle(arr));
      setSelected(null);
      setTime(timeLimit);
      setAnswered(false);
    }
  }, [question, timeLimit]);

  useEffect(() => {
    if (!isOpen || answered) return;
    if (time <= 0) {
      setAnswered(true);
      soundManager.play('wrong');
      setTimeout(() => onSubmit(false), 800);
      return;
    }
    
    // Play tick sound when time is running low
    if (time <= 5 && time > 0) {
      soundManager.play('tick');
    }
    
    const tmo = setTimeout(() => setTime(s => s - 1), 1000);
    return () => clearTimeout(tmo);
  }, [time, isOpen, answered, onSubmit]);

  const handlePick = (pickedIdx: number) => {
    if (answered) return;
    setSelected(pickedIdx);
    const originalIdx = shuffled[pickedIdx].idx;
    const correct = originalIdx === question.correct;
    setAnswered(true);
    
    // Play correct/wrong sound
    soundManager.play(correct ? 'correct' : 'wrong');
    
    setTimeout(() => onSubmit(correct), 800);
  };

  return {
    selected,
    shuffled,
    time,
    answered,
    handlePick,
    sliderColorClass: getTimeSliderColor(time, timeLimit)
  };
};

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  question,
  onSubmit,
  timeLimit = 14,
  children
}) => {
  const { t, language } = useLocalization();
  const modalState = useQuestionModal(question, timeLimit, isOpen, onSubmit);
  const direction = language === "he" ? "rtl" : "ltr";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in"
      style={{ pointerEvents: isOpen ? "auto" : "none", direction }}
    >
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-scale-in flex flex-col" style={{ direction }}>
        <div className="flex flex-col gap-2 mb-5">
          <label className="font-semibold flex items-center justify-between select-none">
            <span>{t('question.timeLeft') || "Time left"}</span>
            <span className="ml-2 text-primary">{modalState.time}s</span>
          </label>
          <Slider
            min={0}
            max={timeLimit}
            value={[modalState.time]}
            hideThumb
            className="mt-1"
            rangeClassName={modalState.sliderColorClass}
          />
        </div>

        {React.cloneElement(children as React.ReactElement, { 
          modalState, 
          direction, 
          language, 
          t 
        })}

        {modalState.answered && (
          <div className="mt-4 text-center text-lg font-bold">
            {modalState.selected !== null && modalState.shuffled[modalState.selected].idx === question.correct
              ? t('question.correct')
              : t('question.wrong')}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;