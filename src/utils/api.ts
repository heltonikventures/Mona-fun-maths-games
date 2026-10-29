import { Question, SchoolLevel, MathTopic, Difficulty } from '../types';
import { FALLBACK_QUESTIONS } from '../data/curriculum';

export async function fetchGameQuestions(
  level: SchoolLevel,
  topic: MathTopic,
  difficulty: Difficulty,
  count: number = 5,
  gameMode: string = 'General'
): Promise<Question[]> {
  try {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, topic, difficulty, count, gameMode }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions.map((q: any, idx: number) => ({
          ...q,
          id: `q-${Date.now()}-${idx}`
        }));
      }
    }
  } catch (err) {
    console.warn('API question fetch failed, using offline fallback engine:', err);
  }

  // Fallback: match by topic/level or return fallback set
  let matches = FALLBACK_QUESTIONS.filter(q => q.topic === topic);
  if (matches.length === 0) {
    matches = FALLBACK_QUESTIONS;
  }

  // Shuffle and slice
  const shuffled = [...matches].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  // If fewer than count, duplicate with slight numeric alterations
  while (selected.length < count) {
    const base = matches[Math.floor(Math.random() * matches.length)];
    selected.push({
      ...base,
      id: `fallback-${Date.now()}-${selected.length}`
    });
  }

  return selected.map((q, idx) => ({ ...q, id: `fallback-${Date.now()}-${idx}` }));
}

export async function askTeacherFolake(
  question: string,
  studentAnswer: string | null,
  correctAnswer: string,
  level: SchoolLevel
): Promise<string> {
  try {
    const res = await fetch('/api/tutor-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, studentAnswer, correctAnswer, level }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.explanation) {
        return data.explanation;
      }
    }
  } catch (err) {
    console.warn('Tutor API fetch failed:', err);
  }

  return `Well done for your effort! Let's solve this clearly:\n\nThe correct answer is **${correctAnswer}**.\nBreak the calculation down step-by-step: write out what you have, apply the formula or operation, and check your work twice. Keep practicing, maths champion!`;
}
