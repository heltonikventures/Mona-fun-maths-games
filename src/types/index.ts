export type SchoolLevel = 
  | 'Primary 1' | 'Primary 2' | 'Primary 3' 
  | 'Primary 4' | 'Primary 5' | 'Primary 6'
  | 'JSS 1' | 'JSS 2' | 'JSS 3'
  | 'SS 1' | 'SS 2' | 'SS 3';

export type MathTopic =
  | 'Numbers & Counting'
  | 'Addition & Subtraction'
  | 'Multiplication & Division'
  | 'Fractions, Decimals & %'
  | 'Money & Naira Maths'
  | 'Word Problems'
  | 'Algebra & Equations'
  | 'Geometry & Shapes'
  | 'Perimeter, Area & Volume'
  | 'Statistics & Probability'
  | 'Business Maths';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Genius';

export type GameModeId =
  | 'adventure'
  | 'speed'
  | 'treasure'
  | 'basketball'
  | 'ninja'
  | 'puzzle'
  | 'escape'
  | 'boss'
  | 'daily'
  | 'builder';

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  topic?: string;
  difficulty?: Difficulty;
  level?: SchoolLevel;
}

export interface XpHistoryEntry {
  date: string;
  xp: number;
  questionsSolved: number;
}

export interface UserProfile {
  name: string;
  level: SchoolLevel;
  avatar: string;
  xp: number;
  nairaCoins: number;
  stars: number;
  streak: number;
  lastPlayedDate: string;
  unlockedAdventureStages: number;
  adventureStars: Record<number, number>;
  unlockedAvatars: string[];
  unlockedPowerups: {
    fiftyFifty: number;
    extraTime: number;
    shield: number;
  };
  badges: string[];
  customGames: CustomGame[];
  xpHistory?: XpHistoryEntry[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'adventure' | 'speed' | 'ninja' | 'escape' | 'boss' | 'general';
}

export interface CustomGame {
  id: string;
  title: string;
  description: string;
  targetLevel: SchoolLevel;
  topic: MathTopic;
  createdAt: string;
  questions: Question[];
}

export interface AdventureStage {
  id: number;
  name: string;
  landmark: string;
  city: string;
  topic: MathTopic;
  description: string;
  bgGradient: string;
  bossName: string;
  bossAvatar: string;
  bossHp: number;
}
