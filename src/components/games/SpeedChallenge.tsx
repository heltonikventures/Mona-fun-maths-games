import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Zap, Flame, Award, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { UserProfile, Question } from '../../types';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface SpeedChallengeProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenScratchpad: () => void;
}

export const SpeedChallenge: React.FC<SpeedChallengeProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenScratchpad
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = async () => {
    soundManager.playClick();
    setLoading(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalAnswered(0);
    setTimeLeft(60);
    setCurrentIdx(0);

    const pool = await fetchGameQuestions(
      profile.level,
      'Addition & Subtraction',
      'Medium',
      20,
      'Speed Challenge'
    );

    setQuestions(pool);
    setLoading(false);
    setIsPlaying(true);
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endGame();
          return 0;
        }
        if (prev <= 10) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    soundManager.playFanfare();

    // Calculate XP and awards
    const xpGained = score * 15;
    const coinsGained = Math.floor(score * 10);
    let newBadge: string | undefined = undefined;

    if (score >= 10) {
      newBadge = 'speed_demon';
    }
    if (maxCombo >= 5) {
      newBadge = 'combo_fire';
    }

    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, newBadge);
    onUpdateProfile(updatedProfile);
    saveProfile(updatedProfile);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleAnswer = (ans: string) => {
    const currentQ = questions[currentIdx];
    if (!currentQ || !isPlaying) return;

    setTotalAnswered(prev => prev + 1);
    const isCorrect = ans === currentQ.correctAnswer;

    if (isCorrect) {
      soundManager.playCorrect();
      const currentMultiplier = combo >= 5 ? 5 : combo >= 3 ? 3 : combo >= 2 ? 2 : 1;
      const points = 1 * currentMultiplier;
      setScore(prev => prev + points);
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
    } else {
      soundManager.playWrong();
      setCombo(0);
    }

    // Move to next question immediately
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Loop or fetch more
      setCurrentIdx(0);
    }
  };

  const useExtraTime = () => {
    if (profile.unlockedPowerups.extraTime <= 0 || !isPlaying) return;
    soundManager.playSpell();
    setTimeLeft(prev => prev + 15);
    const updated: UserProfile = {
      ...profile,
      unlockedPowerups: {
        ...profile.unlockedPowerups,
        extraTime: profile.unlockedPowerups.extraTime - 1
      }
    };
    onUpdateProfile(updated);
    saveProfile(updated);
  };

  const currentQ = questions[currentIdx];
  const multiplier = combo >= 5 ? 5 : combo >= 3 ? 3 : combo >= 2 ? 2 : 1;

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
          <div className="text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-600/40 px-3 py-1.5 rounded-xl">
            ⚡ 60s Speed Challenge
          </div>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        /* Welcome & Start Screen */
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-4xl shadow-xl animate-pulse">
            ⚡
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">
              Speed Challenge: 60-Second Blitz!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              Test your rapid calculation reflexes! Answer questions swiftly to trigger the blazing{' '}
              <strong className="text-amber-400">Combo Multiplier (up to 5x points!)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Time</div>
              <div className="text-lg font-bold text-white">60s</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Level</div>
              <div className="text-lg font-bold text-indigo-400 truncate">{profile.level}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Max Combo</div>
              <div className="text-lg font-bold text-amber-400">5x 🔥</div>
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-extrabold text-base shadow-xl hover:scale-105 active:scale-95 transition"
          >
            {loading ? 'Preparing Questions...' : 'Start 60s Blitz! 🔥'}
          </button>
        </div>
      ) : gameOver ? (
        /* Game Over Score Screen */
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-6 animate-in fade-in">
          <div className="text-6xl animate-bounce">⏱️</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">Time's Up!</h3>
            <p className="text-sm text-amber-300 mt-1">Magnificent speed effort, maths champion!</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Points</div>
              <div className="text-2xl font-bold text-amber-400">{score}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Answered</div>
              <div className="text-2xl font-bold text-white">{totalAnswered}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Max Streak</div>
              <div className="text-2xl font-bold text-orange-400">{maxCombo} 🔥</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Reward</div>
              <div className="text-2xl font-bold text-emerald-400">+{score * 15} XP</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-md transition"
            >
              Play Again ⚡
            </button>
            <button
              onClick={onBackToMenu}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Active Game Loop */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Top Live Status Bar */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock size={18} className={timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'} />
              <span className={`text-xl font-extrabold font-mono ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Combo Multiplier */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              <Flame size={16} className={multiplier > 1 ? 'text-orange-500 fill-orange-500' : 'text-slate-500'} />
              <span className={`text-xs font-extrabold ${multiplier > 1 ? 'text-amber-400' : 'text-slate-400'}`}>
                {multiplier}x COMBO
              </span>
            </div>

            {/* Score & Extra Time Power-up */}
            <div className="flex items-center gap-3">
              <button
                onClick={useExtraTime}
                disabled={profile.unlockedPowerups.extraTime <= 0}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 text-xs font-bold disabled:opacity-40 transition"
                title="Use Chronos Freeze (+15s)"
              >
                <span>⏱️ +15s</span>
                <span className="text-[10px] bg-amber-800 px-1 rounded-full">
                  {profile.unlockedPowerups.extraTime}
                </span>
              </button>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Score: </span>
                <span className="text-lg font-extrabold text-amber-400">{score}</span>
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Question Board */}
          <div className="p-6 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Question #{totalAnswered + 1}
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-8 font-game leading-relaxed">
              {currentQ.question}
            </h4>

            {/* 4 Large Choice Buttons for rapid response */}
            <div className="grid grid-cols-2 gap-3.5 max-w-lg mx-auto">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="py-4 px-3 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-400 text-white font-bold text-base sm:text-lg shadow-md active:scale-95 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
