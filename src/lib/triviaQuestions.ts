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
  prompt: "מה שותים פרות?",
  answers: ["מים", "חלב", "מיץ", "קולה"],
  correct: 0
},
{
  prompt: "מה שמים על הראש כשחם?",
  answers: ["נעליים", "כובע", "מעיל", "צעיף"],
  correct: 1
},
{
  prompt: "כמה אוזניים יש לאדם?",
  answers: ["אחת", "שתיים", "שלוש", "ארבע"],
  correct: 1
},
{
  prompt: "איך קוראים לצורה שיש לה שלושה צדדים?",
  answers: ["ריבוע", "עיגול", "משולש", "מלבן"],
  correct: 2
},
{
  prompt: "איזו חיה מייללת?",
  answers: ["כלב", "חתול", "תרנגול", "פרה"],
  correct: 1
},
{
  prompt: "מה לובשים ברגליים?",
  answers: ["כובע", "חולצה", "גרביים", "משקפיים"],
  correct: 2
},
{
  prompt: "מה שמים על הפנים כששמש חזקה?",
  answers: ["כפפות", "מכנסיים", "משקפי שמש", "מעיל"],
  correct: 2
},
{
  prompt: "מה עושים כשעייפים?",
  answers: ["רוקדים", "ישנים", "אוכלים", "צוחקים"],
  correct: 1
},
{
  prompt: "מה יוצא מהשמש?",
  answers: ["גשם", "אור", "שלג", "רוח"],
  correct: 1
},
{
  prompt: "איזו עונה חמה מאוד?",
  answers: ["חורף", "סתיו", "אביב", "קיץ"],
  correct: 3
}

  
];

// Medium trivia questions in Hebrew
const MEDIUM_TRIVIA = [
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
  },
  {
  prompt: "איזו עיר נחשבת לבירת ההייטק של ישראל?",
  answers: ["ירושלים", "תל אביב", "חיפה", "באר שבע"],
  correct: 1
},
{
  prompt: "מהו הספר הראשון בתנ\"ך?",
  answers: ["שמות", "בראשית", "ויקרא", "דברים"],
  correct: 1
},
{
  prompt: "מי היה הנשיא הראשון של מדינת ישראל?",
  answers: ["חיים ויצמן", "יצחק בן צבי", "דוד בן גוריון", "שמעון פרס"],
  correct: 0
},
{
  prompt: "מהו ההר הגבוה ביותר בישראל?",
  answers: ["הר תבור", "הר מירון", "הר החרמון", "הר כרמל"],
  correct: 2
},
{
  prompt: "כמה מדינות גובלות בישראל?",
  answers: ["2", "3", "4", "5"],
  correct: 2
},
{
  prompt: "מהו האגם היחיד בישראל?",
  answers: ["הכנרת", "החולה", "הים המלח", "אילת"],
  correct: 0
},
{
  prompt: "איזו חיה מופיעה בסמל של שב\"כ?",
  answers: ["אריה", "נשר", "כלב", "שועל"],
  correct: 1
},
{
  prompt: "איזו עיר ישראלית נקראת עיר הבהדים?",
  answers: ["דימונה", "ערד", "באר שבע", "מצפה רמון"],
  correct: 2
},
{
  prompt: "מהו האי היחיד השייך לישראל?",
  answers: ["אי הדולפינים", "אי השלום", "אי תמרים", "אין אי לישראל"],
  correct: 1
},
{
  prompt: "מהו שם הרשות שמנהלת את הבחירות בישראל?",
  answers: ["רשות האוכלוסין", "ועדת הבחירות המרכזית", "משרד הפנים", "הכנסת"],
  correct: 1
}

];

// Hard trivia questions in Hebrew
const HARD_TRIVIA = [
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
  },
  {
  prompt: "מה היה שמו המקורי של דוד בן גוריון?",
  answers: ["דוד יוסף", "דוד גרין", "דוד גולדמן", "דוד פרידמן"],
  correct: 1
},
{
  prompt: "באיזו שנה נחתמה הכרזת בלפור?",
  answers: ["1915", "1917", "1919", "1921"],
  correct: 1
},
{
  prompt: "מי היה מפקד האצ\"ל לפני מנחם בגין?",
  answers: ["דוד רזיאל", "אברהם שטרן", "משה סנה", "יוסף טבנקין"],
  correct: 0
},
{
  prompt: "מה היה שם מבצע העלאת יהודי עיראק לישראל?",
  answers: ["מבצע שלמה", "מבצע עזרא ונחמיה", "מבצע יכין", "מבצע יציאה"],
  correct: 1
},
{
  prompt: "מי כתב את ההמנון הלאומי 'התקווה'?",
  answers: ["חיים נחמן ביאליק", "נפתלי הרץ אימבר", "אלתרמן", "הרצל"],
  correct: 1
},
{
  prompt: "כמה פעמים כיהן בן גוריון כראש ממשלה?",
  answers: ["פעם אחת", "פעמיים", "שלוש פעמים", "ארבע פעמים"],
  correct: 1
},
{
  prompt: "מה היה שמו של מטוס הקרב הישראלי הראשון?",
  answers: ["כפיר", "שחק", "נשר", "לביא"],
  correct: 3
},
{
  prompt: "מי היה ראש השב\"כ בזמן פרשת קו 300?",
  answers: ["כרמי גילון", "יעקב פרי", "אברהם שלום", "נדב ארגמן"],
  correct: 2
},
{
  prompt: "מי כתב את הספר 'אורח נטה ללון'?",
  answers: ["עמוס עוז", "ש\"י עגנון", "ברנר", "א.ב. יהושע"],
  correct: 1
},
{
  prompt: "מהו שם התוכנית הכלכלית לייצוב המשק מ-1985?",
  answers: ["תוכנית ברק", "התוכנית הגדולה", "התוכנית לייצוב", "רפורמת בגין"],
  correct: 2
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