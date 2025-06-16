
import { getRandomQuestion } from "./utils";
import { getRandomMathQuestion } from "@/lib/mathQuestions";

export function useQuestionHandlers(
  questionType: "translate" | "math",
  difficulty: "easy" | "medium" | "hard"
) {
  function getQuestionForTurn() {
    const qtype = questionType;
    let q;
    if (qtype === "math") {
      q = getRandomMathQuestion(difficulty);
    } else {
      q = getRandomQuestion(difficulty);
    }
    console.log("[QUESTION GENERATOR]", { qtype, result: q });
    return q;
  }

  function getQuestionForAiTurn() {
    const qtype = questionType;
    let q;
    if (qtype === "math") {
      q = getRandomMathQuestion(difficulty);
    } else {
      q = getRandomQuestion(difficulty);
    }
    console.log("[QUESTION GENERATOR][AI]", { qtype, result: q });
    return q;
  }

  return {
    getQuestionForTurn,
    getQuestionForAiTurn,
  };
}
