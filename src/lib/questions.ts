
export type Question = {
  prompt: string;
  answers: string[];
  correct: number;
};

// Sample static English-to-Hebrew multiple-choice questions (improve/replace in future)
export const questionsByDifficulty: Record<"easy" | "medium" | "hard", Question[]> = {
  easy: [
    {
      prompt: "Dog",
      answers: ["כלב", "חתול", "בית", "מכונית"],
      correct: 0,
    },
    {
      prompt: "Apple",
      answers: ["עץ", "תפוח", "ספר", "אננס"],
      correct: 1,
    },
    {
      prompt: "Mother",
      answers: ["אמא", "אבא", "סבתא", "ילד"],
      correct: 0,
    },
    {
      prompt: "Book",
      answers: ["ספר", "כיסא", "חולצה", "בית ספר"],
      correct: 0,
    },
    {
      prompt: "Red",
      answers: ["אדום", "כחול", "ירוק", "צהוב"],
      correct: 0,
    },
  ],
  medium: [
    {
      prompt: "Window",
      answers: ["חלון", "דלת", "שולחן", "שעון"],
      correct: 0,
    },
    {
      prompt: "Garden",
      answers: ["גינה", "עיר", "נהר", "שדה"],
      correct: 0,
    },
    {
      prompt: "Friend",
      answers: ["חבר", "אויב", "אח", "מורה"],
      correct: 0,
    },
    {
      prompt: "Breakfast",
      answers: ["ארוחת בוקר", "ארוחת ערב", "ארוחת צהריים", "ארוחה"],
      correct: 0,
    },
    {
      prompt: "Chair",
      answers: ["כיסא", "שולחן", "מיטה", "ספה"],
      correct: 0,
    },
  ],
  hard: [
    {
      prompt: "Independence",
      answers: ["עצמאות", "תלות", "שלום", "מלחמה"],
      correct: 0,
    },
    {
      prompt: "Invention",
      answers: ["המצאה", "מסורת", "אמונה", "חובה"],
      correct: 0,
    },
    {
      prompt: "Courage",
      answers: ["אומץ", "פחד", "נחישות", "תקווה"],
      correct: 0,
    },
    {
      prompt: "Solution",
      answers: ["פתרון", "בעיה", "שאלה", "הסבר"],
      correct: 0,
    },
    {
      prompt: "Effort",
      answers: ["מאמץ", "עצלנות", "התחלה", "הצלח"],
      correct: 0,
    },
  ],
};
