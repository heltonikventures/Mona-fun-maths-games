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

/**
 * Save or sync user profile to Firestore
 */
export async function saveProfileToFirestore(profile: UserProfile): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}`;
  const profileData = {
    userId: user.uid,
    name: profile.name || user.displayName || 'Maths Champion',
    avatar: profile.avatar || '⭐',
    level: profile.level,
    xp: profile.xp,
    nairaCoins: profile.nairaCoins,
    stars: profile.stars || 0,
    streak: profile.streak || 1,
    lastPlayedDate: profile.lastPlayedDate || new Date().toISOString().split('T')[0],
    unlockedAdventureStages: profile.unlockedAdventureStages || 1,
    adventureStars: profile.adventureStars || {},
    unlockedAvatars: profile.unlockedAvatars || ['⭐', '🦁', '🦅'],
    unlockedPowerups: profile.unlockedPowerups || { fiftyFifty: 2, extraTime: 2, shield: 1 },
    badges: profile.badges || [],
    customGames: profile.customGames || [],
    xpHistory: profile.xpHistory || [],
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
  if (!user) return; // Guest play doesn't write to cloud leaderboard

  const scoreId = `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `scores/${scoreId}`;

  const payload: CloudScore = {
    scoreId,
    userId: user.uid,
    userName: scoreData.profile.name || user.displayName || 'Champion',
    userAvatar: scoreData.profile.avatar || '⭐',
    level: scoreData.profile.level,
    gameMode: scoreData.gameMode,
    score: Math.max(0, Math.floor(scoreData.score)),
    xpEarned: scoreData.xpEarned,
    nairaEarned: scoreData.nairaEarned,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'scores', scoreId), payload);
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
    creatorName: quiz.creatorName || user.displayName || 'Maths Hero',
    title: quiz.title,
    topic: quiz.topic,
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
