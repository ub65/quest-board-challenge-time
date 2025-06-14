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

// --- Word List ---
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
  { id: '51', english: 'bird', hebrew: 'ציפור', difficulty: 'easy', category: 'animals' },
  { id: '52', english: 'flower', hebrew: 'פרח', difficulty: 'easy', category: 'nature' },
  { id: '53', english: 'rain', hebrew: 'גשם', difficulty: 'easy', category: 'nature' },
  { id: '54', english: 'snow', hebrew: 'שלג', difficulty: 'easy', category: 'nature' },
  { id: '55', english: 'wind', hebrew: 'רוח', difficulty: 'easy', category: 'nature' },
  { id: '56', english: 'mother', hebrew: 'אמא', difficulty: 'easy', category: 'family' },
  { id: '57', english: 'father', hebrew: 'אבא', difficulty: 'easy', category: 'family' },
  { id: '58', english: 'child', hebrew: 'ילד', difficulty: 'easy', category: 'family' },
  { id: '59', english: 'boy', hebrew: 'בן', difficulty: 'easy', category: 'people' },
  { id: '60', english: 'girl', hebrew: 'בת', difficulty: 'easy', category: 'people' },
  { id: '61', english: 'man', hebrew: 'איש', difficulty: 'easy', category: 'people' },
  { id: '62', english: 'woman', hebrew: 'אישה', difficulty: 'easy', category: 'people' },
  { id: '63', english: 'head', hebrew: 'ראש', difficulty: 'easy', category: 'body' },
  { id: '64', english: 'hand', hebrew: 'יד', difficulty: 'easy', category: 'body' },
  { id: '65', english: 'foot', hebrew: 'רגל', difficulty: 'easy', category: 'body' },
  { id: '66', english: 'eye', hebrew: 'עין', difficulty: 'easy', category: 'body' },
  { id: '67', english: 'ear', hebrew: 'אוזן', difficulty: 'easy', category: 'body' },
  { id: '68', english: 'mouth', hebrew: 'פה', difficulty: 'easy', category: 'body' },
  { id: '69', english: 'door', hebrew: 'דלת', difficulty: 'easy', category: 'home' },
  { id: '70', english: 'window', hebrew: 'חלון', difficulty: 'easy', category: 'home' },
  { id: '71', english: 'table', hebrew: 'שולחן', difficulty: 'easy', category: 'home' },
  { id: '72', english: 'chair', hebrew: 'כסא', difficulty: 'easy', category: 'home' },
  { id: '73', english: 'bed', hebrew: 'מיטה', difficulty: 'easy', category: 'home' },
  { id: '74', english: 'shirt', hebrew: 'חולצה', difficulty: 'easy', category: 'clothing' },
  { id: '75', english: 'shoes', hebrew: 'נעליים', difficulty: 'easy', category: 'clothing' },
  { id: '76', english: 'hat', hebrew: 'כובע', difficulty: 'easy', category: 'clothing' },
  { id: '77', english: 'bag', hebrew: 'תיק', difficulty: 'easy', category: 'objects' },
  { id: '78', english: 'key', hebrew: 'מפתח', difficulty: 'easy', category: 'objects' },
  { id: '79', english: 'money', hebrew: 'כסף', difficulty: 'easy', category: 'objects' },
  { id: '80', english: 'clock', hebrew: 'שעון', difficulty: 'easy', category: 'objects' },
  { id: '81', english: 'ball', hebrew: 'כדור', difficulty: 'easy', category: 'toys' },
  { id: '82', english: 'game', hebrew: 'משחק', difficulty: 'easy', category: 'activities' },
  { id: '83', english: 'school', hebrew: 'בית ספר', difficulty: 'easy', category: 'places' },
  { id: '84', english: 'store', hebrew: 'חנות', difficulty: 'easy', category: 'places' },
  { id: '85', english: 'street', hebrew: 'רחוב', difficulty: 'easy', category: 'places' },
  { id: '86', english: 'city', hebrew: 'עיר', difficulty: 'easy', category: 'places' },
  { id: '87', english: 'country', hebrew: 'מדינה', difficulty: 'easy', category: 'places' },
  { id: '88', english: 'world', hebrew: 'עולם', difficulty: 'easy', category: 'places' },
  { id: '89', english: 'day', hebrew: 'יום', difficulty: 'easy', category: 'time' },
  { id: '90', english: 'night', hebrew: 'לילה', difficulty: 'easy', category: 'time' },
  { id: '91', english: 'morning', hebrew: 'בוקר', difficulty: 'easy', category: 'time' },
  { id: '92', english: 'year', hebrew: 'שנה', difficulty: 'easy', category: 'time' },
  { id: '93', english: 'week', hebrew: 'שבוע', difficulty: 'easy', category: 'time' },
  { id: '94', english: 'month', hebrew: 'חודש', difficulty: 'easy', category: 'time' },
  { id: '95', english: 'hour', hebrew: 'שעה', difficulty: 'easy', category: 'time' },
  { id: '96', english: 'minute', hebrew: 'דקה', difficulty: 'easy', category: 'time' },
  { id: '97', english: 'old', hebrew: 'זקן', difficulty: 'easy', category: 'adjectives' },
  { id: '98', english: 'young', hebrew: 'צעיר', difficulty: 'easy', category: 'adjectives' },
  { id: '99', english: 'new', hebrew: 'חדש', difficulty: 'easy', category: 'adjectives' },
  { id: '100', english: 'good', hebrew: 'טוב', difficulty: 'easy', category: 'adjectives' },
  { id: '101', english: 'bad', hebrew: 'רע', difficulty: 'easy', category: 'adjectives' },
  { id: '102', english: 'hot', hebrew: 'חם', difficulty: 'easy', category: 'adjectives' },
  { id: '103', english: 'cold', hebrew: 'קר', difficulty: 'easy', category: 'adjectives' },
  { id: '104', english: 'fast', hebrew: 'מהיר', difficulty: 'easy', category: 'adjectives' },
  { id: '105', english: 'slow', hebrew: 'איטי', difficulty: 'easy', category: 'adjectives' },
  { id: '106', english: 'happy', hebrew: 'שמח', difficulty: 'easy', category: 'emotions' },
  { id: '107', english: 'sad', hebrew: 'עצוב', difficulty: 'easy', category: 'emotions' },
  { id: '108', english: 'love', hebrew: 'אהבה', difficulty: 'easy', category: 'emotions' },
  { id: '109', english: 'peace', hebrew: 'שלום', difficulty: 'easy', category: 'abstract' },
  { id: '110', english: 'work', hebrew: 'עבודה', difficulty: 'easy', category: 'activities' },

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
  { id: '26', english: 'tomorrow', hebrew: 'מחר', difficulty: 'medium', category: 'time' },
  { id: '27', english: 'yesterday', hebrew: 'אתמול', difficulty: 'medium', category: 'time' },
  { id: '28', english: 'friend', hebrew: 'חבר', difficulty: 'medium', category: 'relationships' },
  { id: '29', english: 'family', hebrew: 'משפחה', difficulty: 'medium', category: 'relationships' },
  { id: '30', english: 'music', hebrew: 'מוסיקה', difficulty: 'medium', category: 'arts' },

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
  { id: '41', english: 'economy', hebrew: 'כלכלה', difficulty: 'hard', category: 'business' },
  { id: '42', english: 'investment', hebrew: 'השקעה', difficulty: 'hard', category: 'business' },
  { id: '43', english: 'organization', hebrew: 'ארגון', difficulty: 'hard', category: 'business' },
  { id: '44', english: 'communication', hebrew: 'תקשורת', difficulty: 'hard', category: 'social' },
  { id: '45', english: 'relationship', hebrew: 'מערכת יחסים', difficulty: 'hard', category: 'social' },
];

// Utility: Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Utility: randomly select n elements from a filtered array
function getRandomSample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/**
 * Generate a question for "Translate English to Hebrew" with multiple-choice answers,
 * using random distractors and ONE correct answer.
 */
export function getRandomQuestionByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): Question {
  // Filter words by difficulty
  const words = WORDS.filter((w) => w.difficulty === difficulty);
  // Select a prompt word
  const [promptWord] = getRandomSample(words, 1);
  // Use promptWord.english as prompt, promptWord.hebrew as correct
  // Select distractors: sample 3 other words (not the correct one)
  const distractors = getRandomSample(
    words.filter((w) => w.id !== promptWord.id),
    3
  );
  // Compose answers, randomize order
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

// For backward compatibility: create a questionsByDifficulty object that generates on the fly
export const questionsByDifficulty: Record<"easy" | "medium" | "hard", Question[]> = {
  easy: [getRandomQuestionByDifficulty("easy")],
  medium: [getRandomQuestionByDifficulty("medium")],
  hard: [getRandomQuestionByDifficulty("hard")],
};
