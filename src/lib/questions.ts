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

  // 50 New Easy words
  { id: '111', english: 'light', hebrew: 'אור', difficulty: 'easy', category: 'nature' },
  { id: '112', english: 'dark', hebrew: 'חושך', difficulty: 'easy', category: 'nature' },
  { id: '113', english: 'fire', hebrew: 'אש', difficulty: 'easy', category: 'nature' },
  { id: '114', english: 'ice', hebrew: 'קרח', difficulty: 'easy', category: 'nature' },
  { id: '115', english: 'stone', hebrew: 'אבן', difficulty: 'easy', category: 'nature' },
  { id: '116', english: 'sand', hebrew: 'חול', difficulty: 'easy', category: 'nature' },
  { id: '117', english: 'sea', hebrew: 'ים', difficulty: 'easy', category: 'nature' },
  { id: '118', english: 'river', hebrew: 'נהר', difficulty: 'easy', category: 'nature' },
  { id: '119', english: 'mountain', hebrew: 'הר', difficulty: 'easy', category: 'nature' },
  { id: '120', english: 'grass', hebrew: 'דשא', difficulty: 'easy', category: 'nature' },
  { id: '121', english: 'leaf', hebrew: 'עלה', difficulty: 'easy', category: 'nature' },
  { id: '122', english: 'branch', hebrew: 'ענף', difficulty: 'easy', category: 'nature' },
  { id: '123', english: 'root', hebrew: 'שורש', difficulty: 'easy', category: 'nature' },
  { id: '124', english: 'seed', hebrew: 'זרע', difficulty: 'easy', category: 'nature' },
  { id: '125', english: 'fruit', hebrew: 'פרי', difficulty: 'easy', category: 'food' },
  { id: '126', english: 'vegetable', hebrew: 'ירק', difficulty: 'easy', category: 'food' },
  { id: '127', english: 'meat', hebrew: 'בשר', difficulty: 'easy', category: 'food' },
  { id: '128', english: 'egg', hebrew: 'ביצה', difficulty: 'easy', category: 'food' },
  { id: '129', english: 'cheese', hebrew: 'גבינה', difficulty: 'easy', category: 'food' },
  { id: '130', english: 'rice', hebrew: 'אורז', difficulty: 'easy', category: 'food' },
  { id: '131', english: 'sugar', hebrew: 'סוכר', difficulty: 'easy', category: 'food' },
  { id: '132', english: 'salt', hebrew: 'מלח', difficulty: 'easy', category: 'food' },
  { id: '133', english: 'oil', hebrew: 'שמן', difficulty: 'easy', category: 'food' },
  { id: '134', english: 'soup', hebrew: 'מרק', difficulty: 'easy', category: 'food' },
  { id: '135', english: 'cake', hebrew: 'עוגה', difficulty: 'easy', category: 'food' },
  { id: '136', english: 'cookie', hebrew: 'עוגייה', difficulty: 'easy', category: 'food' },
  { id: '137', english: 'tea', hebrew: 'תה', difficulty: 'easy', category: 'drinks' },
  { id: '138', english: 'coffee', hebrew: 'קפה', difficulty: 'easy', category: 'drinks' },
  { id: '139', english: 'juice', hebrew: 'מיץ', difficulty: 'easy', category: 'drinks' },
  { id: '140', english: 'wine', hebrew: 'יין', difficulty: 'easy', category: 'drinks' },
  { id: '141', english: 'beer', hebrew: 'בירה', difficulty: 'easy', category: 'drinks' },
  { id: '142', english: 'bottle', hebrew: 'בקבוק', difficulty: 'easy', category: 'objects' },
  { id: '143', english: 'cup', hebrew: 'כוס', difficulty: 'easy', category: 'objects' },
  { id: '144', english: 'plate', hebrew: 'צלחת', difficulty: 'easy', category: 'objects' },
  { id: '145', english: 'knife', hebrew: 'סכין', difficulty: 'easy', category: 'objects' },
  { id: '146', english: 'fork', hebrew: 'מזלג', difficulty: 'easy', category: 'objects' },
  { id: '147', english: 'spoon', hebrew: 'כף', difficulty: 'easy', category: 'objects' },
  { id: '148', english: 'bowl', hebrew: 'קערה', difficulty: 'easy', category: 'objects' },
  { id: '149', english: 'pot', hebrew: 'סיר', difficulty: 'easy', category: 'objects' },
  { id: '150', english: 'pan', hebrew: 'מחבת', difficulty: 'easy', category: 'objects' },
  { id: '151', english: 'box', hebrew: 'קופסה', difficulty: 'easy', category: 'objects' },
  { id: '152', english: 'paper', hebrew: 'נייר', difficulty: 'easy', category: 'objects' },
  { id: '153', english: 'pen', hebrew: 'עט', difficulty: 'easy', category: 'objects' },
  { id: '154', english: 'pencil', hebrew: 'עיפרון', difficulty: 'easy', category: 'objects' },
  { id: '155', english: 'picture', hebrew: 'תמונה', difficulty: 'easy', category: 'objects' },
  { id: '156', english: 'mirror', hebrew: 'מראה', difficulty: 'easy', category: 'objects' },
  { id: '157', english: 'lamp', hebrew: 'מנורה', difficulty: 'easy', category: 'objects' },
  { id: '158', english: 'candle', hebrew: 'נר', difficulty: 'easy', category: 'objects' },
  { id: '159', english: 'soap', hebrew: 'סבון', difficulty: 'easy', category: 'objects' },
  { id: '160', english: 'towel', hebrew: 'מגבת', difficulty: 'easy', category: 'objects' },

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

  // 50 New Medium words
  { id: '161', english: 'television', hebrew: 'טלוויזיה', difficulty: 'medium', category: 'technology' },
  { id: '162', english: 'radio', hebrew: 'רדיו', difficulty: 'medium', category: 'technology' },
  { id: '163', english: 'camera', hebrew: 'מצלמה', difficulty: 'medium', category: 'technology' },
  { id: '164', english: 'internet', hebrew: 'אינטרנט', difficulty: 'medium', category: 'technology' },
  { id: '165', english: 'website', hebrew: 'אתר אינטרנט', difficulty: 'medium', category: 'technology' },
  { id: '166', english: 'email', hebrew: 'דואר אלקטרוני', difficulty: 'medium', category: 'technology' },
  { id: '167', english: 'password', hebrew: 'סיסמה', difficulty: 'medium', category: 'technology' },
  { id: '168', english: 'software', hebrew: 'תוכנה', difficulty: 'medium', category: 'technology' },
  { id: '169', english: 'keyboard', hebrew: 'מקלדת', difficulty: 'medium', category: 'technology' },
  { id: '170', english: 'mouse', hebrew: 'עכבר', difficulty: 'medium', category: 'technology' },
  { id: '171', english: 'screen', hebrew: 'מסך', difficulty: 'medium', category: 'technology' },
  { id: '172', english: 'printer', hebrew: 'מדפסת', difficulty: 'medium', category: 'technology' },
  { id: '173', english: 'library', hebrew: 'ספרייה', difficulty: 'medium', category: 'places' },
  { id: '174', english: 'museum', hebrew: 'מוזיאון', difficulty: 'medium', category: 'places' },
  { id: '175', english: 'theater', hebrew: 'תיאטרון', difficulty: 'medium', category: 'places' },
  { id: '176', english: 'cinema', hebrew: 'קולנוע', difficulty: 'medium', category: 'places' },
  { id: '177', english: 'bank', hebrew: 'בנק', difficulty: 'medium', category: 'places' },
  { id: '178', english: 'post office', hebrew: 'דואר', difficulty: 'medium', category: 'places' },
  { id: '179', english: 'pharmacy', hebrew: 'בית מרקחת', difficulty: 'medium', category: 'places' },
  { id: '180', english: 'supermarket', hebrew: 'סופרמרקט', difficulty: 'medium', category: 'places' },
  { id: '181', english: 'airport', hebrew: 'שדה תעופה', difficulty: 'medium', category: 'places' },
  { id: '182', english: 'train station', hebrew: 'תחנת רכבת', difficulty: 'medium', category: 'places' },
  { id: '183', english: 'bus stop', hebrew: 'תחנת אוטובוס', difficulty: 'medium', category: 'places' },
  { id: '184', english: 'hotel', hebrew: 'מלון', difficulty: 'medium', category: 'places' },
  { id: '185', english: 'apartment', hebrew: 'דירה', difficulty: 'medium', category: 'places' },
  { id: '186', english: 'office', hebrew: 'משרד', difficulty: 'medium', category: 'places' },
  { id: '187', english: 'factory', hebrew: 'מפעל', difficulty: 'medium', category: 'places' },
  { id: '188', english: 'garden', hebrew: 'גן', difficulty: 'medium', category: 'places' },
  { id: '189', english: 'park', hebrew: 'פארק', difficulty: 'medium', category: 'places' },
  { id: '190', english: 'beach', hebrew: 'חוף', difficulty: 'medium', category: 'places' },
  { id: '191', english: 'forest', hebrew: 'יער', difficulty: 'medium', category: 'nature' },
  { id: '192', english: 'desert', hebrew: 'מדבר', difficulty: 'medium', category: 'nature' },
  { id: '193', english: 'island', hebrew: 'אי', difficulty: 'medium', category: 'nature' },
  { id: '194', english: 'valley', hebrew: 'עמק', difficulty: 'medium', category: 'nature' },
  { id: '195', english: 'hill', hebrew: 'גבעה', difficulty: 'medium', category: 'nature' },
  { id: '196', english: 'bridge', hebrew: 'גשר', difficulty: 'medium', category: 'structures' },
  { id: '197', english: 'building', hebrew: 'בניין', difficulty: 'medium', category: 'structures' },
  { id: '198', english: 'floor', hebrew: 'קומה', difficulty: 'medium', category: 'structures' },
  { id: '199', english: 'ceiling', hebrew: 'תקרה', difficulty: 'medium', category: 'structures' },
  { id: '200', english: 'wall', hebrew: 'קיר', difficulty: 'medium', category: 'structures' },
  { id: '201', english: 'stairs', hebrew: 'מדרגות', difficulty: 'medium', category: 'structures' },
  { id: '202', english: 'elevator', hebrew: 'מעלית', difficulty: 'medium', category: 'structures' },
  { id: '203', english: 'kitchen', hebrew: 'מטבח', difficulty: 'medium', category: 'home' },
  { id: '204', english: 'bathroom', hebrew: 'חדר אמבטיה', difficulty: 'medium', category: 'home' },
  { id: '205', english: 'bedroom', hebrew: 'חדר שינה', difficulty: 'medium', category: 'home' },
  { id: '206', english: 'living room', hebrew: 'סלון', difficulty: 'medium', category: 'home' },
  { id: '207', english: 'balcony', hebrew: 'מרפסת', difficulty: 'medium', category: 'home' },
  { id: '208', english: 'garage', hebrew: 'חניון', difficulty: 'medium', category: 'home' },
  { id: '209', english: 'basement', hebrew: 'מרתף', difficulty: 'medium', category: 'home' },
  { id: '210', english: 'attic', hebrew: 'עליית גג', difficulty: 'medium', category: 'home' },

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

  // 50 New Hard words
  { id: '211', english: 'consciousness', hebrew: 'תודעה', difficulty: 'hard', category: 'abstract' },
  { id: '212', english: 'intelligence', hebrew: 'אינטליגנציה', difficulty: 'hard', category: 'abstract' },
  { id: '213', english: 'creativity', hebrew: 'יצירתיות', difficulty: 'hard', category: 'abstract' },
  { id: '214', english: 'spirituality', hebrew: 'רוחניות', difficulty: 'hard', category: 'abstract' },
  { id: '215', english: 'morality', hebrew: 'מוסר', difficulty: 'hard', category: 'abstract' },
  { id: '216', english: 'authenticity', hebrew: 'אותנטיות', difficulty: 'hard', category: 'abstract' },
  { id: '217', english: 'sophistication', hebrew: 'תחכום', difficulty: 'hard', category: 'abstract' },
  { id: '218', english: 'transformation', hebrew: 'טרנספורמציה', difficulty: 'hard', category: 'abstract' },
  { id: '219', english: 'manifestation', hebrew: 'התגלמות', difficulty: 'hard', category: 'abstract' },
  { id: '220', english: 'interpretation', hebrew: 'פרשנות', difficulty: 'hard', category: 'abstract' },
  { id: '221', english: 'comprehension', hebrew: 'הבנה', difficulty: 'hard', category: 'abstract' },
  { id: '222', english: 'consideration', hebrew: 'התחשבות', difficulty: 'hard', category: 'abstract' },
  { id: '223', english: 'determination', hebrew: 'נחישות', difficulty: 'hard', category: 'abstract' },
  { id: '224', english: 'appreciation', hebrew: 'הערכה', difficulty: 'hard', category: 'abstract' },
  { id: '225', english: 'concentration', hebrew: 'ריכוז', difficulty: 'hard', category: 'abstract' },
  { id: '226', english: 'collaboration', hebrew: 'שיתוף פעולה', difficulty: 'hard', category: 'social' },
  { id: '227', english: 'negotiation', hebrew: 'משא ומתן', difficulty: 'hard', category: 'social' },
  { id: '228', english: 'consultation', hebrew: 'התייעצות', difficulty: 'hard', category: 'social' },
  { id: '229', english: 'documentation', hebrew: 'תיעוד', difficulty: 'hard', category: 'professional' },
  { id: '230', english: 'administration', hebrew: 'מינהל', difficulty: 'hard', category: 'professional' },
  { id: '231', english: 'implementation', hebrew: 'יישום', difficulty: 'hard', category: 'professional' },
  { id: '232', english: 'coordination', hebrew: 'תיאום', difficulty: 'hard', category: 'professional' },
  { id: '233', english: 'optimization', hebrew: 'אופטימיזציה', difficulty: 'hard', category: 'professional' },
  { id: '234', english: 'standardization', hebrew: 'סטנדרטיזציה', difficulty: 'hard', category: 'professional' },
  { id: '235', english: 'systematization', hebrew: 'שיטתיות', difficulty: 'hard', category: 'professional' },
  { id: '236', english: 'entrepreneurship', hebrew: 'יזמות', difficulty: 'hard', category: 'business' },
  { id: '237', english: 'globalization', hebrew: 'גלובליזציה', difficulty: 'hard', category: 'business' },
  { id: '238', english: 'digitalization', hebrew: 'דיגיטליזציה', difficulty: 'hard', category: 'business' },
  { id: '239', english: 'commercialization', hebrew: 'מסחור', difficulty: 'hard', category: 'business' },
  { id: '240', english: 'industrialization', hebrew: 'תיעוש', difficulty: 'hard', category: 'business' },
  { id: '241', english: 'sustainability', hebrew: 'קיימות', difficulty: 'hard', category: 'environment' },
  { id: '242', english: 'biodiversity', hebrew: 'מגוון ביולוגי', difficulty: 'hard', category: 'environment' },
  { id: '243', english: 'conservation', hebrew: 'שימור', difficulty: 'hard', category: 'environment' },
  { id: '244', english: 'contamination', hebrew: 'זיהום', difficulty: 'hard', category: 'environment' },
  { id: '245', english: 'deforestation', hebrew: 'כריתת יערות', difficulty: 'hard', category: 'environment' },
  { id: '246', english: 'urbanization', hebrew: 'עיור', difficulty: 'hard', category: 'sociology' },
  { id: '247', english: 'modernization', hebrew: 'מודרניזציה', difficulty: 'hard', category: 'sociology' },
  { id: '248', english: 'secularization', hebrew: 'חילון', difficulty: 'hard', category: 'sociology' },
  { id: '249', english: 'democratization', hebrew: 'דמוקרטיזציה', difficulty: 'hard', category: 'politics' },
  { id: '250', english: 'bureaucracy', hebrew: 'ביורוקרטיה', difficulty: 'hard', category: 'politics' },
  { id: '251', english: 'legislation', hebrew: 'חקיקה', difficulty: 'hard', category: 'politics' },
  { id: '252', english: 'constitution', hebrew: 'חוקה', difficulty: 'hard', category: 'politics' },
  { id: '253', english: 'jurisdiction', hebrew: 'סמכות שיפוט', difficulty: 'hard', category: 'politics' },
  { id: '254', english: 'municipality', hebrew: 'עיריה', difficulty: 'hard', category: 'politics' },
  { id: '255', english: 'infrastructure', hebrew: 'תשתית', difficulty: 'hard', category: 'politics' },
  { id: '256', english: 'methodology', hebrew: 'מתודולוגיה', difficulty: 'hard', category: 'academic' },
  { id: '257', english: 'anthropology', hebrew: 'אנתרופולוגיה', difficulty: 'hard', category: 'academic' },
  { id: '258', english: 'archaeology', hebrew: 'ארכיאולוגיה', difficulty: 'hard', category: 'academic' },
  { id: '259', english: 'sociology', hebrew: 'סוציולוגיה', difficulty: 'hard', category: 'academic' },
  { id: '260', english: 'linguistics', hebrew: 'בלשנות', difficulty: 'hard', category: 'academic' },
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

// ------------------------
// Track used word IDs
const usedWordIds: Record<"easy" | "medium" | "hard", Set<string>> = {
  easy: new Set(),
  medium: new Set(),
  hard: new Set(),
};

/**
 * Generate a question for "Translate English to Hebrew" with multiple-choice answers,
 * using random distractors and ONE correct answer.
 * Ensures that the same word is not selected again until all are used (after which it resets).
 */
export function getRandomQuestionByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): Question {
  // Filter words by difficulty
  const words = WORDS.filter((w) => w.difficulty === difficulty);

  // Exclude used words
  const availableWords = words.filter(w => !usedWordIds[difficulty].has(w.id));
  let promptWord: WordEntry;

  // If all words used, reset list
  if (availableWords.length === 0) {
    usedWordIds[difficulty].clear();
    // After clearing, use all words
    promptWord = getRandomSample(words, 1)[0];
  } else {
    promptWord = getRandomSample(availableWords, 1)[0];
  }
  usedWordIds[difficulty].add(promptWord.id);

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
