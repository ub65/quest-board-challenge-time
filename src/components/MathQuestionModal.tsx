import React from "react";
import BaseModal from "@/components/ui/base-modal";

type MathQ = {
  prompt: string;
  answers: string[];
  correct: number;
};

const MathQuestionContent = ({ question, modalState, direction, language, t }: any) => (
  <>
    <div className="mb-2 text-lg font-bold">{t('question.answerMath') || "Solve the math problem"}</div>
    <div
      className="mb-6 text-2xl text-primary font-semibold select-none"
      dir="ltr"
      style={{ textAlign: language === "he" ? "right" : undefined }}
    >
      {question.prompt}
    </div>
    <div className="flex flex-col gap-4">
      {modalState.shuffled.map(({ answer }: any, i: number) => (
        <button
          key={i}
          className={`
            border px-5 py-3 rounded-lg text-lg text-left
            transition-all duration-150
            ${
              modalState.answered
                ? modalState.shuffled[i].idx === question.correct
                  ? "bg-green-200 border-green-600"
                  : modalState.selected === i
                  ? "bg-red-200 border-red-400"
                  : "bg-gray-100 border-gray-300"
                : modalState.selected === i
                ? "border-blue-400 bg-blue-100"
                : "bg-gray-50 border-gray-200 hover:bg-blue-200 hover:border-blue-500"
            }
            ${modalState.answered ? "opacity-75" : ""}
          `}
          disabled={modalState.answered}
          onClick={() => modalState.handlePick(i)}
          style={{ direction }}
        >
          <span dir="ltr" style={{ display: "inline-block", minWidth: 40 }}>
            {answer}
          </span>
        </button>
      ))}
    </div>
  </>
);

const MathQuestionModal = ({
  isOpen,
  question,
  onSubmit,
  timeLimit = 14,
  soundEnabled = true,
  volume = 0.5,
}: {
  isOpen: boolean;
  question: MathQ;
  onSubmit: (isCorrect: boolean) => void;
  timeLimit?: number;
  soundEnabled?: boolean;
  volume?: number;
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      question={question}
      onSubmit={onSubmit}
      timeLimit={timeLimit}
      soundEnabled={soundEnabled}
      volume={volume}
    >
      <MathQuestionContent question={question} />
    </BaseModal>
  );
};

export default MathQuestionModal;