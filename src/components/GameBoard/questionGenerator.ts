
import { getRandomQuestion } from "./utils";
import { getRandomMathQuestion } from "@/lib/mathQuestions";

export function generateQuestion(
  questionType: "math" | "translate", 
  difficulty: "easy" | "medium" | "hard"
) {
  const question = questionType === "math" 
    ? getRandomMathQuestion(difficulty)
    : getRandomQuestion(difficulty);
  
  console.log("[QUESTION GENERATOR]", { questionType, difficulty, result: question });
  return question;
}
