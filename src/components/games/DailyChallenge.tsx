import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Flame, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { UserProfile, Question } from '../../types';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface DailyChallengeProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenTutor: (q: Question, studentAns: string | null) => void;
  onOpenScratchpad: () => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenTutor,
  onOpenScratchpad
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyCompletedToday = profile.lastPlayedDate === todayStr && profile.xp > 0 && false; // Allow play testing

  const initDaily = async () => {
    soundManager.playClick();
    setLoading(true);
    setCompleted(false);
    setScore(0);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);

    const qs = await fetchGameQuestions(
      profile.level,
      'Word Problems',
      'Medium',
      5,
      'Daily Quest Challenge'
    );
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    initDaily();
  }, []);

  const handleSelectAnswer = (ans: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    if (ans === currentQ.correctAnswer) {
      soundManager.playCorrect();
      setScore(s => s + 1);
    } else {
      soundManager.playWrong();
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishDaily();
    }
  };

  const finishDaily = () => {
    setCompleted(true);
    soundManager.playFanfare();

    const newStreak = profile.streak + 1;
    let newBadge: string | undefined = undefined;
    if (newStreak >= 3) {
      newBadge = 'streak_star';
    }

    const xpGained = score * 50 + 200; // Big daily bonus!
    const coinsGained = score * 30 + 100;

    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, newBadge);
    const fullyUpdated: UserProfile = {
      ...updatedProfile,
      streak: newStreak,
      lastPlayedDate: todayStr
    };

    onUpdateProfile(fullyUpdated);
    saveProfile(fullyUpdated);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          <ArrowLeft size={16} /> Exit Game
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScratchpad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-indigo-300 text-xs font-bold transition"
          >
            <span>📝</span> Scratchpad
          </button>
          <div className="text-xs text-orange-400 font-bold bg-orange-950/60 border border-orange-600/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Flame size={14} className="fill-orange-400" />
            <span>{profile.streak} Day Quest Streak</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xl">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 font-medium">Fetching Today's Maths Challenge...</p>
        </div>
      ) : completed ? (
        /* Daily Completed Screen */
        <div className="bg-slate-900 border-2 border-orange-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl animate-bounce">🌟🔥</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">Daily Quest Complete!</h3>
            <p className="text-sm text-orange-200 mt-1">
              You kept your flame alive! Streak boosted to <strong>{profile.streak} Days</strong>!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-xl font-bold text-white">{score} / {questions.length}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Daily Bonus</div>
              <div className="text-xl font-bold text-amber-400">+₦{score * 30 + 100}</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onBackToMenu}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-sm shadow-lg transition"
            >
              Back to Main Hub
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Daily Question Card */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="font-bold text-orange-400 flex items-center gap-1.5">
              <Calendar size={14} /> Daily Question #{currentIdx + 1} of {questions.length}
            </span>
            <span>Class: {profile.level}</span>
          </div>

          <h4 className="text-xl sm:text-2xl font-bold text-white font-game leading-relaxed">
            {currentQ.question}
          </h4>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === currentQ.correctAnswer;
              let style = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200';
              if (isAnswered) {
                if (isCorrect) style = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-md';
                else if (isSelected) style = 'bg-rose-600/30 border-rose-400 text-rose-200';
                else style = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl border text-left font-semibold text-sm transition flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in">
              <span className="font-bold text-emerald-400">Teacher's Note: </span>
              {currentQ.explanation}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onOpenTutor(currentQ, selectedAnswer)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
            >
              👨🏾‍🏫 Ask Teacher Helton for Guidance
            </button>

            {isAnswered && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                {currentIdx + 1 < questions.length ? 'Next Question →' : 'Finish Daily Challenge 🏁'}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
