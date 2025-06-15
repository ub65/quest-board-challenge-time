import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'he';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations = {
  en: {
    // Game titles and UI
    'game.title': 'Translate Race',
    'game.difficulty': 'Difficulty',
    'game.restart': 'Restart',
    'game.settings': '⚙️ Settings',
    'game.yourTurn': 'Your turn',
    'game.aiThinking': 'AI is thinking...',
    'game.yourTarget': 'Your Target: Bottom-right',
    'game.yourPoints': 'Your Points',
    'game.aiPoints': 'AI Points',
    'game.points': 'Points',
    'game.youWin': '🎉 You Win!',
    'game.aiWins': '😔 AI Wins',
    'game.playAgain': 'Play Again',
    
    // Question modal
    'question.translateTo': 'Translate to Hebrew:',
    'question.timeLeft': 'Time left:',
    'question.correct': 'Correct!',
    'question.wrong': 'Wrong',
    
    // AI modal
    'ai.answering': 'AI is answering...',
    'ai.thinking': 'Thinking...',
    'ai.correct': 'Correct!',
    'ai.pickedAnswer': 'Picked answer...',
    
    // Settings
    'settings.title': 'Game Settings',
    'settings.sound': 'Sound Effects',
    'settings.boardSize': 'Board Size',
    'settings.questionTime': 'Question Time (seconds)',
    'settings.language': 'Language',
    'settings.close': 'Close',
    'settings.desc': 'Adjust your preferences for sound, board size, and timer.',
    'settings.surpriseCount': 'Surprise Tiles',
    'settings.surpriseMin': '1',
    'settings.surpriseMax': '8',
    'settings.defenseCount': 'Number of Defenses',
    'settings.defenseMin': '1',
    'settings.defenseMax': '4',
    'settings.boardMin': '5x5',
    'settings.boardMax': '12x12',
    'settings.timeMin': '6s',
    'settings.timeMax': '40s',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.questionType': 'Question Type',
    'settings.questionTypeTranslate': 'Word Translate',
    'settings.questionTypeMath': 'Math Question',
    'question.mathPrompt': 'Solve:',
    
    // Difficulty selector
    'difficulty.choose': 'Choose Your Challenge Level',
    'difficulty.easy': 'Easy',
    'difficulty.medium': 'Medium',
    'difficulty.hard': 'Hard',
    'difficulty.start': 'Start Game',
    
    // Languages
    'lang.english': 'English',
    'lang.hebrew': 'עברית',
    
    // SURPRISES
    'surprise.title': 'Surprise!',
    'surprise.double.self': 'You got double points from this tile!',
    'surprise.double.ai': 'AI got double points from this tile!',
    'surprise.lose.self': 'Oh no! You lost 20% of your points!',
    'surprise.lose.ai': 'AI lost 20% of its points!',
    'surprise.free.self': 'Free move! Answer another question for a bonus move.',
    'surprise.free.ai': 'AI got a free move!',
    'surprise.steal.self': 'You stole {n} points from AI!',
    'surprise.steal.ai': 'AI stole {n} points from you!',
    'surprise.extra.self': 'Bonus! You got {n} extra points!',
    'surprise.extra.ai': 'AI got {n} extra points!',
    
    // DEFENSES
    "game.defenses_left": "Your defenses left",
    "game.ai_defenses_left": "AI defenses left",
    "game.defense_place_btn": "Place Defense",
    "game.defense_mode_on": "Defense Mode",
    "game.defense_mode_on_desc": "Select a tile (not start/end, not occupied, not surprise) to block the AI.",
    "game.defense_mode_select": "Select a tile to place your defense...",
    "game.defense_placed": "Defense Placed",
    "game.defense_success": "AI cannot move to this tile!",
    "game.defense_fail": "Invalid defense placement",
    "game.defense_already_used": "You have used all your defenses",
    "game.defense_no_corner": "Cannot place defense on start or target tiles",
    "game.defense_no_player": "Cannot place defense on player tiles",
    "game.defense_already_here": "There's already a defense here",
    "game.defense_no_surprise": "Cannot place a defense on a surprise tile",
    "game.defense_ai_placed": "AI placed a defense!",
    "game.defense_ai_msg": "AI blocked your path!",
    
    // WELCOME SCREEN
    'welcome.startGame': 'Start Game',
    'welcome.desc': 'A math board game for fun and learning!',
    'welcome.playerName': 'Your Name',
    'welcome.playerNamePlaceholder': 'Enter your name',
    'welcome.settings': 'Settings',
    'welcome.back': 'Back',
    
    // New: support fallbacks for {n} interpolation
    'game.youLabel': 'You',
  },
  he: {
    // Game titles and UI
    'game.title': 'מירוץ התרגום',
    'game.difficulty': 'רמת קושי',
    'game.restart': 'התחל מחדש',
    'game.settings': '⚙️ הגדרות',
    'game.yourTurn': 'התור שלך',
    'game.aiThinking': 'הבינה המלאכותית חושבת...',
    'game.yourTarget': 'היעד שלך: פינה ימנית תחתונה',
    'game.yourPoints': 'הנקודות שלך',
    'game.aiPoints': 'נקודות הבינה המלאכותית',
    'game.points': 'נקודות',
    'game.youWin': '🎉 ניצחת!',
    'game.aiWins': '😔 הבינה המלאכותית ניצחה',
    'game.playAgain': 'שחק שוב',
    
    // Question modal
    'question.translateTo': 'תרגם לעברית:',
    'question.timeLeft': 'זמן שנותר:',
    'question.correct': 'נכון!',
    'question.wrong': 'שגוי',
    
    // AI modal
    'ai.answering': 'הבינה המלאכותית עונה...',
    'ai.thinking': 'חושבת...',
    'ai.correct': 'נכון!',
    'ai.pickedAnswer': 'בחרה תשובה...',
    
    // Settings
    'settings.title': 'הגדרות המשחק',
    'settings.sound': 'אפקטי קול',
    'settings.boardSize': 'גודל הלוח',
    'settings.questionTime': 'זמן לשאלה (שניות)',
    'settings.language': 'שפה',
    'settings.close': 'סגור',
    'settings.desc': 'התאימו את ההעדפות לאפקטים, גודל לוח וטיימר.',
    'settings.surpriseCount': 'משבצות הפתעה',
    'settings.surpriseMin': '1',
    'settings.surpriseMax': '8',
    'settings.defenseCount': 'מספר מחסומים',
    'settings.defenseMin': '1',
    'settings.defenseMax': '4',
    'settings.boardMin': '5x5',
    'settings.boardMax': '12x12',
    'settings.timeMin': '6שנ',
    'settings.timeMax': '40שנ',
    'settings.save': 'שמור',
    'settings.cancel': 'בטל',
    'settings.questionType': 'סוג שאלה',
    'settings.questionTypeTranslate': 'תרגום מילים',
    'settings.questionTypeMath': 'שאלה במתמטיקה',
    'question.mathPrompt': 'פתור:',
    
    // Difficulty selector
    'difficulty.choose': 'בחר את רמת האתגר שלך',
    'difficulty.easy': 'קל',
    'difficulty.medium': 'בינוני',
    'difficulty.hard': 'קשה',
    'difficulty.start': 'התחל משחק',
    
    // Languages
    'lang.english': 'English',
    'lang.hebrew': 'עברית',
    
    // SURPRISES
    'surprise.title': 'הפתעה!',
    'surprise.double.self': 'קיבלת נקודות כפולות מהמשבצת!',
    'surprise.double.ai': 'הבינה קיבלה נקודות כפולות מהמשבצת!',
    'surprise.lose.self': 'אוי לא! איבדת 20% מהנקודות שלך!',
    'surprise.lose.ai': 'הבינה איבדה 20% מהנקודות!',
    'surprise.free.self': 'קיבלת תור נוסף! ענה על שאלה נוספת.',
    'surprise.free.ai': 'הבינה קיבלה תור נוסף!',
    'surprise.steal.self': 'גנבת {n} נקודות מהבינה!',
    'surprise.steal.ai': 'הבינה גנבה {n} נקודות ממך!',
    'surprise.extra.self': 'בונוס! קיבלת {n} נקודות נוספות!',
    'surprise.extra.ai': 'הבינה קיבלה {n} נקודות נוספות!',
    
    // DEFENSES
    "game.defenses_left": "מספר מחסומים שנותרו לך",
    "game.ai_defenses_left": "מחסומי הבינה שנותרו",
    "game.defense_place_btn": "הצב מחסום",
    "game.defense_mode_on": "מצב מחסום",
    "game.defense_mode_on_desc": "בחר משבצת (לא פינה, לא תפוסה, לא הפתעה) כדי לחסום את הבינה.",
    "game.defense_mode_select": "בחר משבצת להצבת המחסום...",
    "game.defense_placed": "המחסום הוצב",
    "game.defense_success": "הבינה לא יכולה לעבור למשבצת זו!",
    "game.defense_fail": "לא ניתן להציב מחסום כאן",
    "game.defense_already_used": "ניצלת כבר את כל המחסומים שלך",
    "game.defense_no_corner": "לא ניתן להציב מחסום בפינות",
    "game.defense_no_player": "לא ניתן להציב מחסום על שחקן",
    "game.defense_already_here": "כבר קיים מחסום כאן",
    "game.defense_no_surprise": "לא ניתן להציב מחסום על הפתעה",
    "game.defense_ai_placed": "הבינה הציבה מחסום!",
    "game.defense_ai_msg": "הבינה חסמה את דרכך!",
    
    // WELCOME SCREEN
    'welcome.startGame': 'התחל משחק',
    'welcome.desc': 'משחק לוח ללמידה עם כיף במתמטיקה!',
    'welcome.playerName': 'השם שלך',
    'welcome.playerNamePlaceholder': 'הכנס את שמך',
    'welcome.settings': 'הגדרות',
    'welcome.back': 'חזרה',
    
    // New: support fallbacks for {n} interpolation
    'game.youLabel': 'אתה',
  },
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  // New: support fallbacks for {n} interpolation
  const t = (key: string, vars?: Record<string, string | number>) => {
    let txt = translations[language][key as keyof typeof translations[typeof language]] || key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        txt = txt.replace(`{${k}}`, String(vars[k]));
      });
    }
    return txt;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
