
import React from "react";

type Props = {
  value: "translate" | "math";
  onChange: (type: "translate" | "math") => void;
  t: (k: string, params?: any) => string;
};

const QuestionTypeSelector: React.FC<Props> = ({ value, onChange, t }) => {
  return (
    <div className="flex flex-col gap-2 mb-3">
      <label className="font-medium text-center">
        {t("welcome.questionType") || "Question Type"}
      </label>
      <div className="flex flex-row gap-3 justify-center">
        <button
          type="button"
          className={`px-4 py-2 rounded-lg border text-base font-semibold transition-all shadow-sm
            ${value === "translate"
              ? "bg-blue-500 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
            }
            `}
          onClick={() => onChange("translate")}
        >
          {t("welcome.wordTranslate") || "Word Translate"}
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-lg border text-base font-semibold transition-all shadow-sm
            ${value === "math"
              ? "bg-green-500 text-white border-green-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
            }
            `}
          onClick={() => onChange("math")}
        >
          {t("welcome.mathQuestion") || "Math Question"}
        </button>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;
