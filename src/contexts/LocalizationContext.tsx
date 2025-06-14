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
