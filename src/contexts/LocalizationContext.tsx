
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'he';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
  },
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'he' ? 'rtl' : 'ltr'} className={language === 'he' ? 'font-hebrew' : ''}>
        {children}
      </div>
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
