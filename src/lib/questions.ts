export type Question = {
  prompt: string;
  answers: string[];
  correct: number;
};

type WordEntry = {
  id: string;
  english: string;
  hebrew: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
};

const WORDS: WordEntry[] = [
  // Easy words
  { id: '1', english: 'house', hebrew: 'בית', difficulty: 'easy', category: 'basic' },
  { id: '2', english: 'water', hebrew: 'מים', difficulty: 'easy', category: 'basic' },
  { id: '3', english: 'food', hebrew: 'אוכל', difficulty: 'easy', category: 'basic' },
  { id: '4', english: 'book', hebrew: 'ספר', difficulty: 'easy', category: 'basic' },
  { id: '5', english: 'cat', hebrew: 'חתול', difficulty: 'easy', category: 'animals' },
  { id: '6', english: 'dog', hebrew: 'כלב', difficulty: 'easy', category: 'animals' },
  { id: '7', english: 'car', hebrew: 'מכונית', difficulty: 'easy', category: 'transport' },
  { id: '8', english: 'tree', hebrew: 'עץ', difficulty: 'easy', category: 'nature' },
  { id: '9', english: 'sun', hebrew: 'שמש', difficulty: 'easy', category: 'nature' },
  { id: '10', english: 'moon', hebrew: 'ירח', difficulty: 'easy', category: 'nature' },
  { id: '11', english: 'red', hebrew: 'אדום', difficulty: 'easy', category: 'colors' },
  { id: '12', english: 'blue', hebrew: 'כחול', difficulty: 'easy', category: 'colors' },
  { id: '13', english: 'green', hebrew: 'ירוק', difficulty: 'easy', category: 'colors' },
  { id: '14', english: 'big', hebrew: 'גדול', difficulty: 'easy', category: 'adjectives' },
  { id: '15', english: 'small', hebrew: 'קטן', difficulty: 'easy', category: 'adjectives' },
  { id: '46', english: 'milk', hebrew: 'חלב', difficulty: 'easy', category: 'food' },
  { id: '47', english: 'bread', hebrew: 'לחם', difficulty: 'easy', category: 'food' },
  { id: '48', english: 'apple', hebrew: 'תפוח', difficulty: 'easy', category: 'food' },
  { id: '49', english: 'banana', hebrew: 'בננה', difficulty: 'easy', category: 'food' },
  { id: '50', english: 'fish', hebrew: 'דג', difficulty: 'easy', category: 'animals' },

  // Medium words
  { id: '16', english: 'computer', hebrew: 'מחשב', difficulty: 'medium', category: 'technology' },
  { id: '17', english: 'telephone', hebrew: 'טלפון', difficulty: 'medium', category: 'technology' },
  { id: '18', english: 'university', hebrew: 'אוניברסיטה', difficulty: 'medium', category: 'education' },
  { id: '19', english: 'restaurant', hebrew: 'מסעדה', difficulty: 'medium', category: 'places' },
  { id: '20', english: 'hospital', hebrew: 'בית חולים', difficulty: 'medium', category: 'places' },
  { id: '21', english: 'beautiful', hebrew: 'יפה', difficulty: 'medium', category: 'adjectives' },
  { id: '22', english: 'interesting', hebrew: 'מעניין', difficulty: 'medium', category: 'adjectives' },
  { id: '23', english: 'important', hebrew: 'חשוב', difficulty: 'medium', category: 'adjectives' },
  { id: '24', english: 'breakfast', hebrew: 'ארוחת בוקר', difficulty: 'medium', category: 'food' },
  { id: '25', english: 'evening', hebrew: 'ערב', difficulty: 'medium', category: 'time' },

  // Hard words
  { id: '31', english: 'responsibility', hebrew: 'אחריות', difficulty: 'hard', category: 'abstract' },
  { id: '32', english: 'independence', hebrew: 'עצמאות', difficulty: 'hard', category: 'abstract' },
  { id: '33', english: 'development', hebrew: 'פיתוח', difficulty: 'hard', category: 'abstract' },
  { id: '34', english: 'democracy', hebrew: 'דמוקרטיה', difficulty: 'hard', category: 'politics' },
  { id: '35', english: 'philosophy', hebrew: 'פילוסופיה', difficulty: 'hard', category: 'academic' },
  { id: '36', english: 'psychology', hebrew: 'פסיכולוגיה', difficulty: 'hard', category: 'academic' },
  { id: '37', english: 'architecture', hebrew: 'אדריכלות', difficulty: 'hard', category: 'professions' },
  { id: '38', english: 'engineering', hebrew: 'הנדסה', difficulty: 'hard', category: 'professions' },
  { id: '39', english: 'environment', hebrew: 'סביבה', difficulty: 'hard', category: 'science' },
  { id: '40', english: 'technology', hebrew: 'טכנולוגיה', difficulty: 'hard', category: 'science' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomSample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

const usedWordIds: Record<"easy" | "medium" | "hard", Set<string>> = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
};

export function getRandomQuestionByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): Question {
  const words = WORDS.filter((w) => w.difficulty === difficulty);
  const availableWords = words.filter(w => !usedWordIds[difficulty].has(w.id));
  let promptWord: WordEntry;

  if (availableWords.length === 0) {
    usedWordIds[difficulty].clear();
    promptWord = getRandomSample(words, 1)[0];
  } else {
    promptWord = getRandomSample(availableWords, 1)[0];
  }
  usedWordIds[difficulty].add(promptWord.id);

  const distractors = getRandomSample(
    words.filter((w) => w.id !== promptWord.id),
    3
  );

  const options = shuffle([
    { txt: promptWord.hebrew, isCorrect: true },
    ...distractors.map((w) => ({ txt: w.hebrew, isCorrect: false })),
  ]);
  const correctIdx = options.findIndex((o) => o.isCorrect);

  return {
    prompt: promptWord.english,
    answers: options.map((o) => o.txt),
    correct: correctIdx,
  };
}

export const questionsByDifficulty: Record<"easy" | "medium" | "hard", Question[]> = {
  easy: [getRandomQuestionByDifficulty("easy")],
  medium: [getRandomQuestionByDifficulty("medium")],
  hard: [getRandomQuestionByDifficulty("hard")],
};