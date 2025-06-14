
import React, { useEffect, useState } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { Slider } from "@/components/ui/slider";

type Question = {
  prompt: string;
  answers: string[];
  correct: number;
};

const shuffle = (arr: any[]) => {
  // Fisher-Yates
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MIN_TIME = 6;
const MAX_TIME = 40;

const TranslateQuestionModal = ({
  isOpen,
  question,
  onSubmit,
  timeLimit = 14,
}: {
  isOpen: boolean;
  question: Question;
  onSubmit: (isCorrect: boolean) => void;
  timeLimit?: number;
}) => {
  const { t } = useLocalization();
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffled, setShuffled] = useState<{ answer: string; idx: number }[]>([]);
  const [time, setTime] = useState(timeLimit);
  const [answered, setAnswered] = useState<boolean>(false);

  useEffect(() => {
    if (question) {
      const arr = question.answers.map((answer: string, idx: number) => ({
        answer,
        idx,
      }));
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
      setTimeout(() => onSubmit(false), 800);
      return;
    }
    const tmo = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(tmo);
  }, [time, isOpen, answered, onSubmit]);

  const handlePick = (pickedIdx: number) => {
    if (answered) return;
    setSelected(pickedIdx);
    const originalIdx = shuffled[pickedIdx].idx;
    const correct = originalIdx === question.correct;
    setAnswered(true);
    setTimeout(() => onSubmit(correct), 800);
  };

  return (
    <div
      className={`
      fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in
    `}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-scale-in flex flex-col">
        {/* Time Remaining - show only once as text */}
        <div className="flex flex-col gap-2 mb-5">
          <label className="font-semibold flex items-center justify-between select-none">
            <span>{t('question.timeLeft') || "Time left"}</span>
            <span className="ml-2 text-primary">{time}s</span>
          </label>
          <Slider
            min={0}
            max={timeLimit}
            value={[time]}
            hideThumb
            className="mt-1"
            aria-label={t('question.timeLeft')}
          />
        </div>
        {/* Question prompt */}
        <div className="mb-2 text-lg font-bold">{t('question.translateTo')}</div>
        <div className="mb-6 text-2xl text-primary font-semibold select-none">
          {question.prompt}
        </div>
        <div className="flex flex-col gap-4">
          {shuffled.map(({ answer }, i) => (
            <button
              key={i}
              className={`
                border px-5 py-3 rounded-lg text-lg text-left
                transition-all duration-150
                ${
                  answered
                    ? shuffled[i].idx === question.correct
                      ? "bg-green-200 border-green-600"
                      : selected === i
                      ? "bg-red-200 border-red-400"
                      : "bg-gray-100 border-gray-300"
                    : selected === i
                    ? "border-blue-400 bg-blue-100"
                    : "bg-gray-50 border-gray-200 hover:bg-blue-200 hover:border-blue-500"
                }
                ${answered ? "opacity-75" : ""}
              `}
              disabled={answered}
              onClick={() => handlePick(i)}
            >
              {answer}
            </button>
          ))}
        </div>
        {/* Removed duplicate second time counter here */}
        {answered && (
          <div className="mt-4 text-center text-lg font-bold">
            {selected !== null && shuffled[selected].idx === question.correct
              ? t('question.correct')
              : t('question.wrong')}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslateQuestionModal;

