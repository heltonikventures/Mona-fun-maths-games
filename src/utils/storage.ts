import { UserProfile, SchoolLevel, CustomGame } from '../types';

const STORAGE_KEY = 'mathsquest_profile_v2';

export const getInitialXpHistory = () => [
  { date: 'Start', xp: 0, questionsSolved: 0 }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Learner',
  level: 'Primary 5',
  avatar: '👧🏾',
  xp: 0,
  nairaCoins: 0,
  stars: 0,
  streak: 0,
  lastPlayedDate: '',
  unlockedAdventureStages: 1,
  adventureStars: {},
  unlockedAvatars: ['mona_hero', 'scholar_boy', 'scholar_girl'],
  unlockedPowerups: {
    fiftyFifty: 0,
    extraTime: 0,
    shield: 0
  },
  badges: [],
  xpHistory: getInitialXpHistory(),
  customGames: [
    {
      id: 'default_market_challenge',
      title: 'Lagos Market Challenge',
      description: 'Test your shopping smarts at Balogun and Tejuosho markets!',
      targetLevel: 'Primary 5',
      topic: 'Money & Naira Maths',
      createdAt: new Date().toISOString(),
      questions: [
        {
          question: "Titi buys 2 loaves of Agege bread for ₦800 each and butter for ₦600. How much is the total?",
          options: ["₦1,800", "₦2,000", "₦2,200", "₦2,400"],
          correctAnswer: "₦2,200",
          explanation: "(2 × 800) + 600 = 1,600 + 600 = ₦2,200.",
          hint: "Multiply 2 by 800, then add 600."
        },
        {
          question: "If a pack of plantain chips is sold for ₦250, how much will 6 packs cost?",
          options: ["₦1,250", "₦1,500", "₦1,750", "₦2,000"],
          correctAnswer: "₦1,500",
          explanation: "6 × ₦250 = ₦1,500.",
          hint: "Multiply 6 by 250 (think 6 × 25 = 150, so 1500)."
        }
      ]
    }
  ]
};

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    // If legacy v1 demo profile is detected in localStorage, clear it
    if (localStorage.getItem('mathsquest_profile_v1')) {
      localStorage.removeItem('mathsquest_profile_v1');
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (err) {
    console.error('Failed to load profile:', err);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function calculateLevelInfo(xp: number) {
  // Every 250 XP is a level
  const levelNum = Math.floor(xp / 250) + 1;
  const currentLevelBaseXP = (levelNum - 1) * 250;
  const nextLevelXP = levelNum * 250;
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevelBaseXP) / 250) * 100));

  const titles = [
    'Maths Explorer',
    'Number Scout',
    'Arithmetic Apprentice',
    'Equation Warrior',
    'Geometric Knight',
    'Campus Champion',
    'Naira Strategist',
    'Super Eagle Scholar',
    'Algebraic Master',
    'Grand Professor'
  ];

  const title = titles[Math.min(levelNum - 1, titles.length - 1)];

  return {
    levelNum,
    title,
    currentLevelBaseXP,
    nextLevelXP,
    progressPercent: Math.round(progressPercent),
    xpInCurrentLevel: xp - currentLevelBaseXP
  };
}

export function awardReward(
  profile: UserProfile, 
  xpGained: number, 
  coinsGained: number, 
  newBadgeId?: string
): { updatedProfile: UserProfile; levelUp: boolean } {
  const oldLevel = calculateLevelInfo(profile.xp).levelNum;
  const newXp = profile.xp + xpGained;
  const newLevel = calculateLevelInfo(newXp).levelNum;

  const badges = [...profile.badges];
  if (newBadgeId && !badges.includes(newBadgeId)) {
    badges.push(newBadgeId);
  }

  // Check milestone badges
  if (badges.length === 0 && (xpGained > 0 || coinsGained > 0)) {
    badges.push('first_win');
  }

  // Update or append to xpHistory
  const history = profile.xpHistory && profile.xpHistory.length > 0 
    ? [...profile.xpHistory] 
    : getInitialXpHistory();
  
  const lastIndex = history.length - 1;
  if (lastIndex >= 0) {
    history[lastIndex] = {
      ...history[lastIndex],
      xp: newXp,
      questionsSolved: (history[lastIndex].questionsSolved || 0) + 1
    };
  }

  const updated: UserProfile = {
    ...profile,
    xp: newXp,
    nairaCoins: profile.nairaCoins + coinsGained,
    badges,
    xpHistory: history
  };

  saveProfile(updated);

  return {
    updatedProfile: updated,
    levelUp: newLevel > oldLevel
  };
}
