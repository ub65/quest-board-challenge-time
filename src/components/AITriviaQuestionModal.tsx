import React, { useEffect, useState } from "react";
import { useLocalization } from "@/contexts/LocalizationContext";

type TriviaQ = {
  prompt: string;
  answers: string[];
  correct: number;
};

const THINK_DELAY = 1000;
const FEEDBACK_DELAY = 800;

interface AITriviaQuestionModalProps {
  isOpen: boolean;
  question: TriviaQ;
  onSubmit: (ok: boolean) => void;
  soundEnabled?: boolean;
  volume?: number;
}

type ShuffledAnswer = { answer: string; idx: number };

function shuffle<T>(arr: T[]): T[] {
  // Fisher-Yates
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const AITriviaQuestionModal: React.FC<AITriviaQuestionModalProps> = ({ 
  isOpen, 
  question, 
  onSubmit,
  soundEnabled = true,
  volume = 0.5 
}) => {
  const { t, language } = useLocalization();
  const [shuffled, setShuffled] = useState<ShuffledAnswer[]>([]);
  const [aiChoice, setAIChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  console.log("[AITriviaQuestionModal] Sound settings:", { soundEnabled, volume, isOpen });

  // Shuffle and reset state on open
  useEffect(() => {
    if (question && isOpen) {
      const arr = question.answers.map((answer, idx) => ({ answer, idx }));
      setShuffled(shuffle(arr));
      setAIChoice(null);
      setShowFeedback(false);
    }
  }, [question, isOpen]);

  // Simulate AI thinking and selecting the correct answer, then feedback
  useEffect(() => {
    if (!isOpen || aiChoice !== null) return;
    const thinkTimer = setTimeout(() => {
      // Find the shuffled index of the correct answer
      const correctShuffledIdx = shuffled.findIndex(({ idx }) => idx === question.correct);
      setAIChoice(correctShuffledIdx);

      setTimeout(() => {
        setShowFeedback(true);
        setTimeout(() => onSubmit(true), FEEDBACK_DELAY);
      }, 500);
    }, THINK_DELAY);
    return () => clearTimeout(thinkTimer);
  }, [isOpen, aiChoice, shuffled, question, onSubmit]);

  // Set direction for Hebrew
  const direction = language === "he" ? "rtl" : "ltr";

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-fade-in
      `}
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-scale-in flex flex-col items-center">
        <div className="mb-2 text-lg font-bold flex items-center gap-2">
          <span>{t('ai.answering')}</span>
        </div>
        <div
          className="mb-6 text-xl text-primary font-semibold select-none text-center"
          style={{ direction }}
        >
          {question.prompt}
        </div>
        <div className="flex flex-col gap-4 w-full">
          {shuffled.map(({ answer }, i) => (
            <button
              key={i}
              disabled
              className={`
                border px-5 py-3 rounded-lg text-lg text-center w-full
                transition-all duration-150
                ${
                  aiChoice === null
                    ? "bg-gray-50 border-gray-200"
                    : i === aiChoice && shuffled[i].idx === question.correct
                    ? "bg-green-200 border-green-600"
                    : "bg-gray-100 border-gray-300"
                }
                ${aiChoice === i ? "opacity-100 font-bold scale-105" : "opacity-70"}
              `}
              tabIndex={-1}
              style={{ direction }}
            >
              {answer}
            </button>
          ))}
        </div>
        <div className="flex items-center mt-5 min-h-[2rem]">
          {aiChoice === null ? (
            <span className="text-base text-blue-700 font-medium animate-pulse">
              {t('ai.thinking')}
            </span>
          ) : showFeedback ? (
            <span className="text-green-700 text-lg font-bold">{t('ai.correct')}</span>
          ) : (
            <span className="text-base text-gray-700 font-medium">{t('ai.pickedAnswer')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITriviaQuestionModal;