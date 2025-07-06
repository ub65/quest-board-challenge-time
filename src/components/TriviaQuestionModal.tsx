import React from "react";
import BaseModal from "@/components/ui/base-modal";

type TriviaQ = {
  prompt: string;
  answers: string[];
  correct: number;
};

const TriviaQuestionContent = ({ question, modalState, t }: any) => (
  <>
    <div className="mb-2 text-lg font-bold">{t('question.answerTrivia') || "ענה על שאלת הטריוויה"}</div>
    <div className="mb-6 text-xl text-primary font-semibold select-none text-center">
      {question.prompt}
    </div>
    <div className="flex flex-col gap-4">
      {modalState.shuffled.map(({ answer }: any, i: number) => (
        <button
          key={i}
          className={`
            border px-5 py-3 rounded-lg text-lg text-center
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
        >
          {answer}
        </button>
      ))}
    </div>
  </>
);

const TriviaQuestionModal = ({
  isOpen,
  question,
  onSubmit,
  timeLimit = 14,
  soundEnabled = true,
  volume = 0.5,
}: {
  isOpen: boolean;
  question: TriviaQ;
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
      <TriviaQuestionContent question={question} />
    </BaseModal>
  );
};

export default TriviaQuestionModal;