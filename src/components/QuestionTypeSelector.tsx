import React from "react";

type Props = {
  value: "translate" | "math" | "trivia";
  onChange: (type: "translate" | "math" | "trivia") => void;
  t: (k: string, params?: any) => string;
};

const QuestionTypeSelector: React.FC<Props> = ({ value, onChange, t }) => {
  return (
    <div className="flex flex-col gap-2 mb-3">
      <label className="font-medium text-center">
        {t("welcome.questionType") || "Question Type"}
      </label>
      <div className="flex flex-col gap-2 justify-center w-full">
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg border text-base font-semibold transition-all shadow-sm
            ${value === "translate"
              ? "bg-blue-500 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
            }
            `}
          onClick={() => onChange("translate")}
        >
          {t("settings.questionTypeTranslate") || "Word Translate"}
        </button>
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg border text-base font-semibold transition-all shadow-sm
            ${value === "math"
              ? "bg-green-500 text-white border-green-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
            }
            `}
          onClick={() => onChange("math")}
        >
          {t("settings.questionTypeMath") || "Math Question"}
        </button>
        <button
          type="button"
          className={`w-full px-4 py-2 rounded-lg border text-base font-semibold transition-all shadow-sm
            ${value === "trivia"
              ? "bg-purple-500 text-white border-purple-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50"
            }
            `}
          onClick={() => onChange("trivia")}
        >
          {t("settings.questionTypeTrivia") || "Hebrew Trivia"}
        </button>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;