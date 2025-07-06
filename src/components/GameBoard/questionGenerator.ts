import { getRandomQuestion } from "./utils";
import { getRandomMathQuestion } from "@/lib/mathQuestions";
import { getRandomTriviaQuestion } from "@/lib/triviaQuestions";

export function generateQuestion(
  questionType: "math" | "translate" | "trivia", 
  difficulty: "easy" | "medium" | "hard"
) {
  let question;
  
  switch (questionType) {
    case "math":
      question = getRandomMathQuestion(difficulty);
      break;
    case "trivia":
      question = getRandomTriviaQuestion(difficulty);
      break;
    case "translate":
    default:
      question = getRandomQuestion(difficulty);
      break;
  }
  
  console.log("[QUESTION GENERATOR]", { questionType, difficulty, result: question });
  return question;
}