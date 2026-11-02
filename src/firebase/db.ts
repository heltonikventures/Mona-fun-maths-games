import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserProfile } from '../types';

export interface CloudScore {
  scoreId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  level: string;
  gameMode: string;
  score: number;
  xpEarned: number;
  nairaEarned: number;
  timestamp: string;
}

export interface CloudCustomQuiz {
  quizId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  topic: string;
  level: string;
  questions: any[];
  createdAt: string;
}

export interface LearnerCloudBackup {
  backupCode: string;
  name: string;
  avatar: string;
  level: string;
  xp: number;
  nairaCoins: number;
  stars: number;
  streak: number;
  lastPlayedDate: string;
  unlockedAdventureStages: number;
  adventureStars: Record<number, number>;
  unlockedAvatars: string[];
  unlockedPowerups: { fiftyFifty: number; extraTime: number; shield: number };
  badges: string[];
  customGames: any[];
  xpHistory: any[];
  updatedAt: string;
}

const CLOUD_CODE_STORAGE_KEY = 'mathsquest_cloud_sync_code';

/**
 * Sanitize objects recursively to prevent Firestore "Unsupported field value: undefined" errors
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (value === undefined) return null;
      return value;
    })
  );
}

/**
 * Get or create a persistent Learner Cloud Sync Code
 */
export function getOrCreateCloudSyncCode(learnerName: string = 'Learner'): string {
  if (typeof window === 'undefined') return 'MQ-HERO-1001';
  let code = localStorage.getItem(CLOUD_CODE_STORAGE_KEY);
  if (!code || !code.startsWith('MQ-')) {
    const cleanName = learnerName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'HERO';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    code = `MQ-${cleanName}-${randomDigits}`;
    localStorage.setItem(CLOUD_CODE_STORAGE_KEY, code);
  }
  return code;
}

/**
 * Save user profile to Firestore (/users/{uid} when logged in)
 */
export async function saveProfileToFirestore(profile: UserProfile): Promise<void> {
  const user = auth.currentUser;
  const syncCode = getOrCreateCloudSyncCode(profile.name);

  // Always keep universal cloud backup in sync
  try {
    await saveLearnerBackupToFirestore(profile, syncCode);
  } catch (err) {
    console.warn('Universal backup sync warning:', err);
  }

  // If user is authenticated, sync to their private user profile
  if (user) {
    const path = `users/${user.uid}`;
    const rawData = {
      userId: user.uid,
      name: (profile.name || user.displayName || 'Maths Champion').slice(0, 120),
      avatar: profile.avatar || '⭐',
      level: (profile.level || 'Primary 5').slice(0, 40),
      xp: Math.max(0, Math.floor(Number(profile.xp) || 0)),
      nairaCoins: Math.max(0, Math.floor(Number(profile.nairaCoins) || 0)),
      stars: Math.max(0, Math.floor(Number(profile.stars) || 0)),
      streak: Math.max(0, Math.floor(Number(profile.streak) || 1)),
      lastPlayedDate: profile.lastPlayedDate || new Date().toISOString().split('T')[0],
      unlockedAdventureStages: Number(profile.unlockedAdventureStages) || 1,
      adventureStars: profile.adventureStars || {},
      unlockedAvatars: profile.unlockedAvatars || ['⭐', '🦁', '🦅'],
      unlockedPowerups: profile.unlockedPowerups || { fiftyFifty: 2, extraTime: 2, shield: 1 },
      badges: profile.badges || [],
      customGames: profile.customGames || [],
      xpHistory: profile.xpHistory || [],
      updatedAt: new Date().toISOString(),
    };

    const profileData = sanitizeForFirestore(rawData);

    try {
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

/**
 * Universal 1-Click Cloud Backup to Firestore (/backups/{backupCode})
 */
export async function saveLearnerBackupToFirestore(
  profile: UserProfile,
  customCode?: string
): Promise<{ backupCode: string; timestamp: string }> {
  const code = (customCode || getOrCreateCloudSyncCode(profile.name)).trim().toUpperCase();
  const path = `backups/${code}`;
  const timestamp = new Date().toISOString();

  const rawData: LearnerCloudBackup = {
    backupCode: code,
    name: (profile.name || 'Maths Champion').slice(0, 120),
    avatar: profile.avatar || '⭐',
    level: (profile.level || 'Primary 5').slice(0, 40),
    xp: Math.max(0, Math.floor(Number(profile.xp) || 0)),
    nairaCoins: Math.max(0, Math.floor(Number(profile.nairaCoins) || 0)),
    stars: Math.max(0, Math.floor(Number(profile.stars) || 0)),
    streak: Math.max(0, Math.floor(Number(profile.streak) || 1)),
    lastPlayedDate: profile.lastPlayedDate || timestamp.split('T')[0],
    unlockedAdventureStages: Number(profile.unlockedAdventureStages) || 1,
    adventureStars: profile.adventureStars || {},
    unlockedAvatars: profile.unlockedAvatars || ['⭐', '🦁', '🦅'],
    unlockedPowerups: profile.unlockedPowerups || { fiftyFifty: 2, extraTime: 2, shield: 1 },
    badges: profile.badges || [],
    customGames: profile.customGames || [],
    xpHistory: profile.xpHistory || [],
    updatedAt: timestamp,
  };

  const backupData = sanitizeForFirestore(rawData);

  try {
    await setDoc(doc(db, 'backups', code), backupData, { merge: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLOUD_CODE_STORAGE_KEY, code);
    }
    return { backupCode: code, timestamp };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Restore learner profile from Firestore using Cloud Sync Code
 */
export async function restoreLearnerBackupFromFirestore(
  backupCode: string
): Promise<UserProfile | null> {
  const cleanCode = backupCode.trim().toUpperCase();
  const path = `backups/${cleanCode}`;

  try {
    const docRef = doc(db, 'backups', cleanCode);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as LearnerCloudBackup;
      const restoredProfile: UserProfile = {
        name: data.name || 'Learner',
        level: (data.level as any) || 'Primary 5',
        avatar: data.avatar || '⭐',
        xp: Number(data.xp) || 0,
        nairaCoins: Number(data.nairaCoins) || 0,
        stars: Number(data.stars) || 0,
        streak: Number(data.streak) || 1,
        lastPlayedDate: data.lastPlayedDate || new Date().toISOString().split('T')[0],
        unlockedAdventureStages: Number(data.unlockedAdventureStages) || 1,
        adventureStars: data.adventureStars || {},
        unlockedAvatars: Array.isArray(data.unlockedAvatars) ? data.unlockedAvatars : ['⭐', '🦁', '🦅'],
        unlockedPowerups: data.unlockedPowerups || { fiftyFifty: 2, extraTime: 2, shield: 1 },
        badges: Array.isArray(data.badges) ? data.badges : [],
        customGames: Array.isArray(data.customGames) ? data.customGames : [],
        xpHistory: Array.isArray(data.xpHistory) ? data.xpHistory : [],
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(CLOUD_CODE_STORAGE_KEY, cleanCode);
      }
      return restoredProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetch user profile from Firestore upon login
 */
export async function fetchProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        name: data.name || 'Maths Champion',
        avatar: data.avatar || '⭐',
        level: data.level || 'Primary 5',
        xp: Number(data.xp) || 0,
        nairaCoins: Number(data.nairaCoins) || 0,
        stars: Number(data.stars) || 0,
        streak: Number(data.streak) || 1,
        lastPlayedDate: data.lastPlayedDate || new Date().toISOString().split('T')[0],
        unlockedAdventureStages: Number(data.unlockedAdventureStages) || 1,
        adventureStars: data.adventureStars || {},
        unlockedAvatars: Array.isArray(data.unlockedAvatars) ? data.unlockedAvatars : ['⭐', '🦁', '🦅'],
        unlockedPowerups: data.unlockedPowerups || { fiftyFifty: 2, extraTime: 2, shield: 1 },
        badges: Array.isArray(data.badges) ? data.badges : [],
        customGames: Array.isArray(data.customGames) ? data.customGames : [],
        xpHistory: Array.isArray(data.xpHistory) ? data.xpHistory : [],
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Record a game completion score to the global Firestore leaderboard
 */
export async function recordGameScore(scoreData: {
  gameMode: string;
  score: number;
  xpEarned: number;
  nairaEarned: number;
  profile: UserProfile;
}): Promise<void> {
  const user = auth.currentUser;
  const scoreId = `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `scores/${scoreId}`;

  const payload: CloudScore = {
    scoreId,
    userId: user ? user.uid : getOrCreateCloudSyncCode(scoreData.profile.name),
    userName: (scoreData.profile.name || user?.displayName || 'Champion').slice(0, 60),
    userAvatar: scoreData.profile.avatar || '⭐',
    level: scoreData.profile.level,
    gameMode: scoreData.gameMode,
    score: Math.max(0, Math.floor(scoreData.score)),
    xpEarned: scoreData.xpEarned,
    nairaEarned: scoreData.nairaEarned,
    timestamp: new Date().toISOString(),
  };

  try {
    if (user) {
      await setDoc(doc(db, 'scores', scoreId), payload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetch top scores for Leaderboard
 */
export async function fetchTopScores(maxCount: number = 10): Promise<CloudScore[]> {
  const path = 'scores';
  try {
    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, orderBy('score', 'desc'), limit(maxCount));
    const querySnapshot = await getDocs(q);

    const results: CloudScore[] = [];
    querySnapshot.forEach((d) => {
      results.push(d.data() as CloudScore);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Subscribe to realtime leaderboard updates
 */
export function subscribeToLeaderboard(
  callback: (scores: CloudScore[]) => void,
  maxCount: number = 10
): () => void {
  const path = 'scores';
  try {
    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, orderBy('score', 'desc'), limit(maxCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const scores: CloudScore[] = [];
        snapshot.forEach((d) => scores.push(d.data() as CloudScore));
        callback(scores);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Save user custom quiz to community database
 */
export async function saveCustomQuizToFirestore(quiz: {
  title: string;
  topic: string;
  level: string;
  questions: any[];
  creatorName: string;
}): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `customQuizzes/${quizId}`;

  const payload: CloudCustomQuiz = {
    quizId,
    creatorId: user.uid,
    creatorName: (quiz.creatorName || user.displayName || 'Maths Hero').slice(0, 60),
    title: quiz.title.slice(0, 100),
    topic: quiz.topic.slice(0, 50),
    level: quiz.level,
    questions: quiz.questions,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'customQuizzes', quizId), payload);
    return quizId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetch community shared quizzes
 */
export async function fetchCommunityQuizzes(): Promise<CloudCustomQuiz[]> {
  const path = 'customQuizzes';
  try {
    const quizzesRef = collection(db, 'customQuizzes');
    const q = query(quizzesRef, orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    const quizzes: CloudCustomQuiz[] = [];
    snapshot.forEach((d) => quizzes.push(d.data() as CloudCustomQuiz));
    return quizzes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
