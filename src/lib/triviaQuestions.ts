/**
 * Hebrew trivia questions by difficulty level
 * Returns an object: { prompt: string, answers: string[], correct: number }
 */

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type TriviaQ = {
  prompt: string;
  answers: string[];
  correct: number;
};

// Easy trivia questions in Hebrew
const EASY_TRIVIA = [
  {
    prompt: "מה הצבע של השמש?",
    answers: ["צהוב", "כחול", "אדום", "ירוק"],
    correct: 0
  },
  {
    prompt: "כמה רגליים יש לכלב?",
    answers: ["שתיים", "שלוש", "ארבע", "חמש"],
    correct: 2
  },
  {
    prompt: "איך קוראים לבית הספר הגבוה ביותר?",
    answers: ["תיכון", "אוניברסיטה", "יסודי", "גן ילדים"],
    correct: 1
  },
  {
    prompt: "מה הפרי הכי פופולרי בישראל?",
    answers: ["תפוח", "בננה", "תפוז", "ענבים"],
    correct: 2
  },
  {
    prompt: "איך קוראים לבירת ישראל?",
    answers: ["תל אביב", "חיפה", "ירושלים", "באר שבע"],
    correct: 2
  },
  {
    prompt: "כמה ימים יש בשבוע?",
    answers: ["חמישה", "שישה", "שבעה", "שמונה"],
    correct: 2
  },
  {
    prompt: "מה הצבע של הדשא?",
    answers: ["אדום", "ירוק", "כחול", "צהוב"],
    correct: 1
  },
  {
    prompt: "איך קוראים לחיה הכי גדולה בים?",
    answers: ["דולפין", "כריש", "לוויתן", "צב ים"],
    correct: 2
  },
  {
    prompt: "מה אוכלים בפסח?",
    answers: ["חמץ", "מצה", "אורז", "פסטה"],
    correct: 1
  },
  {
    prompt: "איך קוראים לכוכב הכי קרוב לכדור הארץ?",
    answers: ["הירח", "השמש", "נוגה", "מאדים"],
    correct: 1
  },
  {
    prompt: "כמה עיניים יש לאדם?",
    answers: ["אחת", "שתיים", "שלוש", "ארבע"],
    correct: 1
  },
  {
    prompt: "מה הצבע של הדם?",
    answers: ["כחול", "ירוק", "אדום", "צהוב"],
    correct: 2
  },
  {
    prompt: "איך קוראים לחג האורים?",
    answers: ["פסח", "חנוכה", "ראש השנה", "יום כיפור"],
    correct: 1
  },
  {
    prompt: "מה הכלי הכי חשוב במטבח?",
    answers: ["מקרר", "תנור", "כיור", "שולחן"],
    correct: 0
  },
  {
    prompt: "איך קוראים לחיה שנותנת חלב?",
    answers: ["חזיר", "כבש", "פרה", "עז"],
    correct: 2
  },
  {
  prompt: "איזו חיה נובחת?",
  answers: ["חתול", "כלב", "פרה", "תרנגול"],
  correct: 1
},
{
  prompt: "מה שותים בארוחת בוקר?",
  answers: ["חלב", "מים", "מיץ תפוזים", "כל התשובות נכונות"],
  correct: 3
},
{
  prompt: "מה שמים על הראש כשהשמש חזקה?",
  answers: ["כובע", "מעיל", "כפפות", "מטרייה"],
  correct: 0
},
{
  prompt: "כמה אצבעות יש ביד אחת?",
  answers: ["ארבע", "חמש", "שש", "שלוש"],
  correct: 1
},
{
  prompt: "מה עושים עם עיפרון?",
  answers: ["מציירים", "אוכלים", "שומעים", "רוקדים"],
  correct: 0
},
{
  prompt: "איך קוראים לאימא של אבא?",
  answers: ["אחות", "סבתא", "דודה", "אימא"],
  correct: 1
},
{
  prompt: "באיזו עונה יורד הכי הרבה גשם?",
  answers: ["קיץ", "אביב", "סתיו", "חורף"],
  correct: 3
},
{
  prompt: "מה שמים בתוך סנדוויץ'?",
  answers: ["דף", "עיפרון", "גבינה", "נעל"],
  correct: 2
},
{
  prompt: "מה שומעים באוזניים?",
  answers: ["קולות", "טעמים", "ריחות", "צבעים"],
  correct: 0
},
{
  prompt: "איזה מאכל עגול ויש לו גבינה ורוטב עגבניות?",
  answers: ["עוגה", "לחם", "פיצה", "במבה"],
  correct: 2
}

];

// Medium trivia questions in Hebrew
const MEDIUM_TRIVIA = [
  {
  prompt: "מה בירת צרפת?",
  answers: ["ברלין", "רומא", "פריז", "לונדון"],
  correct: 2
},
{
  prompt: "איזה איבר שייך למערכת הנשימה?",
  answers: ["ריאות", "לב", "קיבה", "כבד"],
  correct: 0
},
{
  prompt: "מהי שפת התכנות הראשונה?",
  answers: ["Java", "C", "Python", "Fortran"],
  correct: 3
},
{
  prompt: "כמה מדינות יש בארצות הברית?",
  answers: ["48", "49", "50", "51"],
  correct: 2
},
{
  prompt: "מהי עיר הבירה של יוון?",
  answers: ["אתונה", "סלוניקי", "רודוס", "סופיה"],
  correct: 0
},
{
  prompt: "איך נקרא השיר הלאומי של ישראל?",
  answers: ["התקווה", "ירושלים של זהב", "אם אשכחך", "שלום עליכם"],
  correct: 0
},
{
  prompt: "מהי המילה ההפוכה מחם?",
  answers: ["רטוב", "חזק", "קר", "כבד"],
  correct: 2
},
{
  prompt: "איזו יבשת הכי גדולה?",
  answers: ["אפריקה", "אסיה", "אירופה", "אמריקה"],
  correct: 1
},
{
  prompt: "איזה גוף שולט על החוקים בישראל?",
  answers: ["הצבא", "המשטרה", "הכנסת", "בג\"ץ"],
  correct: 2
},
{
  prompt: "איזה חג בא אחרי יום כיפור?",
  answers: ["ראש השנה", "חנוכה", "סוכות", "שבועות"],
  correct: 2
},

  {
    prompt: "מי כתב את התנ\"ך?",
    answers: ["משה רבנו", "דוד המלך", "נביאים שונים", "אברהם אבינו"],
    correct: 2
  },
  {
    prompt: "באיזו שנה הוקמה מדינת ישראל?",
    answers: ["1947", "1948", "1949", "1950"],
    correct: 1
  },
  {
    prompt: "מה השם של הים הכי מלוח בעולם?",
    answers: ["הים התיכון", "ים סוף", "הים המלח", "הכנרת"],
    correct: 2
  },
  {
    prompt: "איך קוראים לראש הממשלה הראשון של ישראל?",
    answers: ["דוד בן גוריון", "גולדה מאיר", "יצחק רבין", "מנחם בגין"],
    correct: 0
  },
  {
    prompt: "כמה אותיות יש באלפבית העברי?",
    answers: ["20", "22", "24", "26"],
    correct: 1
  },
  {
    prompt: "מה הפרח הלאומי של ישראל?",
    answers: ["ורד", "חמנית", "כלנית", "נרקיס"],
    correct: 2
  },
  {
    prompt: "איך קוראים לנהר הארוך ביותר בישראל?",
    answers: ["הירדן", "הירקון", "הקישון", "האלכסנדר"],
    correct: 0
  },
  {
    prompt: "מה הצבע של דגל ישראל?",
    answers: ["אדום ולבן", "כחול ולבן", "ירוק ולבן", "צהוב ולבן"],
    correct: 1
  },
  {
    prompt: "איך קוראים לעיר הכי גדולה בישראל?",
    answers: ["ירושלים", "תל אביב", "חיפה", "ראשון לציון"],
    correct: 0
  },
  {
    prompt: "מה השם של הכנסת בישראל?",
    answers: ["פרלמנט", "קונגרס", "כנסת", "סנט"],
    correct: 2
  },
  {
    prompt: "כמה חגים יש ביהדות?",
    answers: ["שלושה עיקריים", "חמישה עיקריים", "שבעה עיקריים", "עשרה עיקריים"],
    correct: 0
  },
  {
    prompt: "מה השם של המטבע הישראלי?",
    answers: ["דולר", "יורו", "שקל", "לירה"],
    correct: 2
  },
  {
    prompt: "איך קוראים לחג הקציר?",
    answers: ["פסח", "שבועות", "סוכות", "ראש השנה"],
    correct: 1
  },
  {
    prompt: "מה השם של הים שמזרח לישראל?",
    answers: ["הים התיכון", "הים האדום", "הים המלח", "הכנרת"],
    correct: 2
  },
  {
    prompt: "איך קוראים לעיר הקדושה ביותר ביהדות?",
    answers: ["תל אביב", "חיפה", "ירושלים", "צפת"],
    correct: 2
  }
];

// Hard trivia questions in Hebrew
const HARD_TRIVIA = [
  {
  prompt: "מי חיבר את 'מורה נבוכים'?",
  answers: ["רש\"י", "הרמב\"ם", "רבי נחמן", "הרמב\"ן"],
  correct: 1
},
{
  prompt: "באיזו שנה נחתם הסכם אוסלו?",
  answers: ["1991", "1993", "1995", "1999"],
  correct: 1
},
{
  prompt: "מה שם הספר של הרצל שמתאר את מדינת היהודים?",
  answers: ["המדינה היהודית", "אלטנוילנד", "תקומה", "חזון ציון"],
  correct: 1
},
{
  prompt: "מהי העיר הראשונה שהוקמה בתקופת המנדט?",
  answers: ["תל אביב", "בני ברק", "הרצליה", "רמת גן"],
  correct: 0
},
{
  prompt: "מי היה הרמטכ\"ל במלחמת יום כיפור?",
  answers: ["רפאל איתן", "דדו אלוף דוד אלעזר", "משה דיין", "אהוד ברק"],
  correct: 1
},
{
  prompt: "מי כתב את 'הליקון'?",
  answers: ["נתן יונתן", "דליה רביקוביץ'", "לאה גולדברג", "יהודה עמיחי"],
  correct: 3
},
{
  prompt: "מה שמו של הסכם השלום בין ישראל לירדן?",
  answers: ["קמפ דייוויד", "וושינגטון", "ערבה", "שלום אמת"],
  correct: 2
},
{
  prompt: "איזו מדינה שלטה בארץ לפני הקמת המדינה?",
  answers: ["טורקיה", "בריטניה", "גרמניה", "צרפת"],
  correct: 1
},
{
  prompt: "באיזו שנה החלה העלייה הראשונה?",
  answers: ["1881", "1897", "1904", "1917"],
  correct: 0
},
{
  prompt: "איזה פרופסור זכה בפרס נובל בכלכלה מטעם ישראל?",
  answers: ["יוסף ש. מגר", "ישראל אומן", "דניאל כהנמן", "אברהם הרשקוביץ"],
  correct: 1
},

  {
    prompt: "מי היה המלך השלישי של ישראל העתיקה?",
    answers: ["שאול", "דוד", "שלמה", "רחבעם"],
    correct: 2
  },
  {
    prompt: "באיזו שנה נחרב בית המקדש השני?",
    answers: ["70 לספירה", "68 לספירה", "72 לספירה", "66 לספירה"],
    correct: 0
  },
  {
    prompt: "מי כתב את ההגדה של פסח?",
    answers: ["רש\"י", "הרמב\"ם", "חכמי המשנה", "רבי עקיבא"],
    correct: 2
  },
  {
    prompt: "איך קוראים למחבר 'המדינה היהודית'?",
    answers: ["תיאודור הרצל", "חיים ויצמן", "דוד בן גוריון", "זאב ז'בוטינסקי"],
    correct: 0
  },
  {
    prompt: "מה השם של המלחמה הראשונה של ישראל?",
    answers: ["מלחמת העצמאות", "מלחמת ששת הימים", "מלחמת יום כיפור", "מלחמת לבנון"],
    correct: 0
  },
  {
    prompt: "איך קוראים לפילוסוף היהודי הגדול מהמאה ה-12?",
    answers: ["רש\"י", "הרמב\"ם", "הרמב\"ן", "הרשב\"א"],
    correct: 1
  },
  {
    prompt: "מה השם של הארגון שהקים את ישראל?",
    answers: ["ההגנה", "האצ\"ל", "לח\"י", "הסוכנות היהודית"],
    correct: 3
  },
  {
    prompt: "איך קוראים למחבר 'אם הבנים שמחה'?",
    answers: ["הרב קוק", "הרב טייכטל", "הרב הרצוג", "הרב פיינשטיין"],
    correct: 1
  },
  {
    prompt: "מה השם של המבצע לחילוץ יהודי אתיופיה?",
    answers: ["מבצע משה", "מבצע שלמה", "מבצע עזרא ונחמיה", "כל התשובות נכונות"],
    correct: 3
  },
  {
    prompt: "איך קוראים לכותב 'תקומה'?",
    answers: ["ש\"י עגנון", "חיים נחמן ביאליק", "שאול טשרניחובסקי", "נתן אלתרמן"],
    correct: 3
  },
  {
    prompt: "מה השם של המושב הראשון בישראל?",
    answers: ["פתח תקווה", "ראשון לציון", "זכרון יעקב", "רחובות"],
    correct: 1
  },
  {
    prompt: "איך קוראים למחבר 'הטיול האחרון של רבין'?",
    answers: ["עמוס עוז", "א.ב. יהושע", "דוד גרוסמן", "מאיר שלו"],
    correct: 2
  },
  {
    prompt: "מה השם של הקיבוץ הראשון בישראל?",
    answers: ["דגניה א'", "עין חרוד", "גבעת ברנר", "נהלל"],
    correct: 0
  },
  {
    prompt: "איך קוראים לראש הממשלה שזכה בפרס נובל לשלום?",
    answers: ["יצחק רבין", "שמעון פרס", "מנחם בגין", "כל התשובות נכונות"],
    correct: 3
  },
  {
    prompt: "מה השם של האוניברסיטה הראשונה בישראל?",
    answers: ["האוניברסיטה העברית", "הטכניון", "אוניברסיטת תל אביב", "אוניברסיטת בר אילן"],
    correct: 0
  }

  
];

// Track used questions to avoid repetition
const usedQuestions: Record<"easy" | "medium" | "hard", Set<number>> = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomTriviaQuestion(difficulty: "easy" | "medium" | "hard"): TriviaQ {
  let questions: TriviaQ[];
  
  switch (difficulty) {
    case "easy":
      questions = EASY_TRIVIA;
      break;
    case "medium":
      questions = MEDIUM_TRIVIA;
      break;
    case "hard":
      questions = HARD_TRIVIA;
      break;
    default:
      questions = EASY_TRIVIA;
  }

  // Get available questions (not used yet)
  const availableIndices = questions
    .map((_, index) => index)
    .filter(index => !usedQuestions[difficulty].has(index));

  // If all questions used, reset the used set
  if (availableIndices.length === 0) {
    usedQuestions[difficulty].clear();
    availableIndices.push(...questions.map((_, index) => index));
  }

  // Pick a random available question
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedQuestions[difficulty].add(randomIndex);

  const selectedQuestion = questions[randomIndex];
  
  // Shuffle the answers and find the new correct index
  const answersWithCorrect = selectedQuestion.answers.map((answer, index) => ({
    answer,
    isCorrect: index === selectedQuestion.correct
  }));
  
  const shuffledAnswers = shuffle(answersWithCorrect);
  const newCorrectIndex = shuffledAnswers.findIndex(item => item.isCorrect);

  return {
    prompt: selectedQuestion.prompt,
    answers: shuffledAnswers.map(item => item.answer),
    correct: newCorrectIndex,
  };
}