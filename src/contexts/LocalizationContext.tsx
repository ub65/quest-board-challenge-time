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
    'game.title': 'Tile Titans',
    'game.difficulty': 'Difficulty',
    'game.restart': 'Restart',
    'game.pause': 'Back to Main Menu',
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
    'game.opponentWins': '😔 Opponent Wins!',
    'game.opponentTurn': "Opponent's Turn",
    
    // Sound controls
    'sound.on': 'Sound On',
    'sound.off': 'Sound Off',
    'sound.mute': 'Mute',
    'sound.unmute': 'Unmute',
    
    // Question modal
    'question.translateTo': 'Translate to Hebrew:',
    'question.timeLeft': 'Time left:',
    'question.correct': 'Correct!',
    'question.wrong': 'Wrong',
    'question.answerMath': 'Solve the math problem',
    'question.answerTrivia': 'Answer the trivia question',
    
    // AI modal
    'ai.answering': 'AI is answering...',
    'ai.thinking': 'Thinking...',
    'ai.correct': 'Correct!',
    'ai.pickedAnswer': 'Picked answer...',
    
    // Settings
    'settings.title': 'Game Settings',
    'settings.sound': 'Sound Effects',
    'settings.soundDesc': 'Enable sound effects for game actions',
    'settings.volume': 'Volume',
    'settings.volumeMin': '0%',
    'settings.volumeMax': '100%',
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
    'settings.boardMax': '10x10',
    'settings.timeMin': '10s',
    'settings.timeMax': '30s',
    'settings.save': 'Save',
    'settings.cancel': 'Cancel',
    'settings.questionType': 'Question Type',
    'settings.questionTypeTranslate': 'Word Translate',
    'settings.questionTypeMath': 'Math Question',
    'settings.questionTypeTrivia': 'Hebrew Trivia',
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
    "game.defense_cancel_btn": "Cancel Defense",
    "game.defense_mode_on": "Defense Mode",
    "game.defense_mode_on_desc": "Select a tile to place your defense",
    "game.defense_mode_off": "Defense mode canceled",
    "game.defense_mode_off_desc": "Defense placement has been canceled",
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
    "game.defense_cancelled": "Defense Cancelled",
    "game.defense_cancelled_desc": "Defense placement mode disabled",
    
    // WELCOME SCREEN
    'welcome.startGame': 'Start Game',
    'welcome.desc': 'A fun math and word game!',
    'welcome.playerName': 'Your Name',
    'welcome.playerNamePlaceholder': 'Enter your name',
    'welcome.settings': 'Settings',
    'welcome.questionType': 'Question Type',
    'welcome.back': 'Back',
    'welcome.chooseMode': 'Choose Game Mode',
    'welcome.playVsAi': 'Play vs AI',
    'welcome.playOnline': 'Play Online',
    
    // ONLINE MULTIPLAYER
    'online.title': 'Online Multiplayer',
    'online.description': 'Play with a friend online! Create a game or join with a code.',
    'online.createGame': 'Create Game',
    'online.joinGame': 'Join Game',
    'online.enterCode': 'Enter Game Code',
    'online.creating': 'Creating...',
    'online.joining': 'Joining...',
    'online.gameCreated': 'Game Created',
    'online.shareCode': 'Share this code:',
    'online.joined': 'Joined game!',
    'online.gameStarting': 'Game is starting...',
    'online.error': 'Error',
    'online.createFailed': 'Failed to create game',
    'online.joinFailed': 'Failed to join game. Check the code and try again.',
    'online.invalidCode': 'Invalid code',
    'online.enterValidCode': 'Please enter a valid game code.',
    'online.waitingForPlayer': 'Waiting for opponent...',
    'online.shareThisCode': 'Share this code:',
    'online.waitingDescription': 'Your friend can join using this code',
    'online.cancel': 'Cancel',
    'online.connecting': 'Connecting to game...',
    'online.disconnected': 'Connection lost',
    'online.backToLobby': 'Back to Lobby',
    'online.loading': 'Loading game...',
    'online.host': 'Host',
    'online.guest': 'Guest',
    
    // New: support fallbacks for {n} interpolation
    'game.youLabel': 'You',
    
    // General
    'general.back': 'Back',
    
    // --- Instructions ---
    "instructions.button": "Instructions",
    "instructions.title": "How to Play Tile Titans",
    "instructions.content":
      "Welcome to Tile Titans!\n\nGoal: Be the first to reach your opponent's starting tile (the opposite corner) before the AI does!\n\nHow To Play:\n• You and the AI take turns. Your goal is to reach the opponent's start tile.\n• Each move, answer a question correctly to advance.\n• You can only move up, down, left, or right – no diagonal moves!\n• Question types: translation, math, or Hebrew trivia, as you choose on the opening screen.\n• There are surprise tiles – land on them for random effects!\n• Use defense blocks to block the AI (if enabled in settings).\n• The first to reach the opponent's starting tile (top-left for AI, bottom-right for you) wins.\n\nGood luck, Titan!",
    // --- Add these new keys:
    'game.startingPlayer.human': 'You start the game! 🚶 Click Start Game.',
    'game.startingPlayer.ai': 'AI starts the game! 🤖 Click Start Game.',
  },
  he: {
    // Game titles and UI
    'game.title': 'דרך למטרה',
    'game.difficulty': 'רמת קושי',
    'game.restart': 'התחל מחדש',
    'game.pause': 'חזרה למסך הראשי',
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
    'game.opponentWins': '😔 היריב ניצח!',
    'game.opponentTurn': 'תור היריב',
    
    // Sound controls
    'sound.on': 'קול פועל',
    'sound.off': 'קול כבוי',
    'sound.mute': 'השתק',
    'sound.unmute': 'בטל השתקה',
    
    // Question modal
    'question.translateTo': 'תרגם לעברית:',
    'question.timeLeft': 'זמן שנותר:',
    'question.correct': 'נכון!',
    'question.wrong': 'שגוי',
    'question.answerMath': 'פתור את התרגיל',
    'question.answerTrivia': 'ענה על שאלת הטריוויה',
    
    // AI modal
    'ai.answering': 'הבינה המלאכותית עונה...',
    'ai.thinking': 'חושבת...',
    'ai.correct': 'נכון!',
    'ai.pickedAnswer': 'בחרה תשובה...',
    
    // Settings
    'settings.title': 'הגדרות המשחק',
    'settings.sound': 'אפקטי קול',
    'settings.soundDesc': 'הפעל אפקטי קול לפעולות במשחק',
    'settings.volume': 'עוצמת קול',
    'settings.volumeMin': '0%',
    'settings.volumeMax': '100%',
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
    'settings.boardMax': '10x10',
    'settings.timeMin': '10שנ',
    'settings.timeMax': '30שנ',
    'settings.save': 'שמור',
    'settings.cancel': 'בטל',
    'settings.questionType': 'סוג שאלה',
    'settings.questionTypeTranslate': 'תרגום מילים',
    'settings.questionTypeMath': 'שאלה במתמטיקה',
    'settings.questionTypeTrivia': 'טריוויה בעברית',
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
    "game.defense_cancel_btn": "בטל מחסום",
    "game.defense_mode_on": "מצב מחסום",
    "game.defense_mode_on_desc": "בחר משבצת להצבת המחסום",
    "game.defense_mode_off": "מצב מחסום בוטל",
    "game.defense_mode_off_desc": "הצבת המחסום בוטלה",
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
    "game.defense_cancelled": "מחסום בוטל",
    "game.defense_cancelled_desc": "מצב הצבת מחסום בוטל",
    
    // WELCOME SCREEN
    'welcome.startGame': 'התחל משחק',
    'welcome.desc': 'משחק חשבון ומילים כיפי!',
    'welcome.playerName': 'השם שלך',
    'welcome.playerNamePlaceholder': 'הכנס את שמך',
    'welcome.settings': 'הגדרות',
    'welcome.questionType': 'סוג שאלה',
    'welcome.back': 'חזרה',
    'welcome.chooseMode': 'בחר מצב משחק',
    'welcome.playVsAi': 'שחק נגד הבינה המלאכותית',
    'welcome.playOnline': 'שחק אונליין',
    
    // ONLINE MULTIPLAYER
    'online.title': 'משחק מקוון',
    'online.description': 'שחק עם חבר באינטרנט! צור משחק או הצטרף עם קוד.',
    'online.createGame': 'צור משחק',
    'online.joinGame': 'הצטרף למשחק',
    'online.enterCode': 'הכנס קוד משחק',
    'online.creating': 'יוצר...',
    'online.joining': 'מצטרף...',
    'online.gameCreated': 'המשחק נוצר',
    'online.shareCode': 'שתף את הקוד הזה:',
    'online.joined': 'הצטרפת למשחק!',
    'online.gameStarting': 'המשחק מתחיל...',
    'online.error': 'שגיאה',
    'online.createFailed': 'יצירת המשחק נכשלה',
    'online.joinFailed': 'הצטרפות למשחק נכשלה. בדוק את הקוד ונסה שוב.',
    'online.invalidCode': 'קוד לא תקין',
    'online.enterValidCode': 'אנא הכנס קוד משחק תקין.',
    'online.waitingForPlayer': 'מחכה ליריב...',
    'online.shareThisCode': 'שתף את הקוד הזה:',
    'online.waitingDescription': 'החבר שלך יכול להצטרף באמצעות הקוד הזה',
    'online.cancel': 'בטל',
    'online.connecting': 'מתחבר למשחק...',
    'online.disconnected': 'החיבור אבד',
    'online.backToLobby': 'חזרה ללובי',
    'online.loading': 'טוען משחק...',
    'online.host': 'מארח',
    'online.guest': 'אורח',
    
    // New: support fallbacks for {n} interpolation
    'game.youLabel': 'אתה',
    
    // General
    'general.back': 'חזרה',
    
    // --- Instructions ---
    "instructions.button": "הוראות משחק",
    "instructions.title": "איך משחקים דרך למטרה",
    "instructions.content":
      "ברוכים הבאים לדרך למטרה!\n\nמטרה: להגיע ראשון למשבצת ההתחלה של היריב (הפינה הנגדית) לפני הבינה המלאכותית!\n\nאיך משחקים:\n• אתה והבינה משחקים בתורות. המטרה להגיע ראשון למשבצת ההתחלה של היריב.\n• בכל תור, ענה נכון על שאלה כדי להתקדם.\n• אפשר לזוז רק למעלה, למטה, שמאלה או ימינה – אין תזוזה באלכסון!\n• סוגי שאלות: תרגום, חשבון או טריוויה בעברית — לבחירתך על מסך הפתיחה.\n• יש משבצות הפתעה לאורך הדרך — פגוש אותן לאפקטים אקראיים!\n• אפשר להציב מחסומים נגד הבינה (אם הגדרת בהגדרות).\n• הראשון שמגיע לפינה של היריב (משמאל למעלה לבינה; מימין למטה עבורך) מנצח.\n\nבהצלחה!",
    // --- Add these new keys:
    'game.startingPlayer.human': 'אתה מתחיל! 🚶 לחץ "התחל משחק".',
    'game.startingPlayer.ai': 'הבינה המלאכותית מתחילה! 🤖 לחץ "התחל משחק".',
  },
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("he");

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