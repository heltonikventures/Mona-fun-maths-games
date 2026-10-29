import React, { useState, useEffect } from 'react';
import { ArrowLeft, Award, HelpCircle, RotateCcw } from 'lucide-react';
import { UserProfile, Question } from '../../types';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface MathsBasketballProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenTutor: (q: Question, studentAns: string | null) => void;
  onOpenScratchpad: () => void;
}

export const MathsBasketball: React.FC<MathsBasketballProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenTutor,
  onOpenScratchpad
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [shootingIndex, setShootingIndex] = useState<number | null>(null);
  const [isSwishing, setIsSwishing] = useState<number | null>(null);
  const [isClanging, setIsClanging] = useState<number | null>(null);
  const [isShotInAir, setIsShotInAir] = useState<boolean>(false);

  const totalShots = 8;

  const initGame = async () => {
    soundManager.playClick();
    setLoading(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentIdx(0);
    setShootingIndex(null);
    setIsSwishing(null);
    setIsClanging(null);
    setIsShotInAir(false);

    const qs = await fetchGameQuestions(
      profile.level,
      'Multiplication & Division',
      'Medium',
      totalShots,
      'Maths Basketball'
    );
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const shootAtHoop = (optionIndex: number, optionVal: string) => {
    if (isShotInAir || gameOver || !currentQ) return;

    soundManager.playClick();
    setIsShotInAir(true);
    setShootingIndex(optionIndex);

    const isCorrect = optionVal === currentQ.correctAnswer;

    // Simulate ball arc travel
    setTimeout(() => {
      if (isCorrect) {
        soundManager.playSwish();
        soundManager.playCorrect();
        setIsSwishing(optionIndex);
        setScore(s => s + 2);
        setStreak(s => {
          const next = s + 1;
          if (next > maxStreak) setMaxStreak(next);
          if (next >= 5) {
            soundManager.playCheer();
          }
          return next;
        });
      } else {
        soundManager.playWrong();
        setIsClanging(optionIndex);
        setStreak(0);
      }

      // Transition to next shot after animation completes
      setTimeout(() => {
        setIsSwishing(null);
        setIsClanging(null);
        setShootingIndex(null);
        setIsShotInAir(false);

        if (currentIdx + 1 < questions.length) {
          setCurrentIdx(idx => idx + 1);
        } else {
          finishGame();
        }
      }, 1200);
    }, 600);
  };

  const finishGame = () => {
    setGameOver(true);
    soundManager.playFanfare();

    const xpGained = score * 20;
    const coinsGained = score * 15;
    let newBadge: string | undefined = undefined;
    if (maxStreak >= 5) {
      newBadge = 'swish_king';
    }

    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, newBadge);
    onUpdateProfile(updatedProfile);
    saveProfile(updatedProfile);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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
            🏀 National Stadium Shootout
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xl">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 font-medium">Entering the Basketball Arena...</p>
        </div>
      ) : gameOver ? (
        /* Game Over Screen */
        <div className="bg-slate-900 border-2 border-orange-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-6 animate-in fade-in">
          <div className="text-6xl animate-bounce">🏀</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">Full Time Buzzer!</h3>
            <p className="text-sm text-orange-200 mt-1">Super Eagles Basketball Champion performance!</p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Total Points</div>
              <div className="text-2xl font-bold text-amber-400">{score} PTS</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Max Swish Streak</div>
              <div className="text-2xl font-bold text-orange-400">{maxStreak} 🔥</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Coins</div>
              <div className="text-2xl font-bold text-emerald-400">+₦{score * 15}</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-sm transition"
            >
              Play Again 🏀
            </button>
            <button
              onClick={onBackToMenu}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Basketball Court View */
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-orange-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Top Scoreboard */}
          <div className="bg-slate-950/90 px-6 py-3 border-b border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Shot</span>
                <div className="text-base font-extrabold text-white">{currentIdx + 1} / {totalShots}</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Streak</span>
                <div className="text-base font-extrabold text-orange-400">{streak} 🔥</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Scoreboard</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">{score} PTS</div>
            </div>
          </div>

          {/* Question Banner */}
          <div className="px-6 py-4 bg-slate-900/80 text-center border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Shoot the ball into the correct rim!
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white mt-1 font-game">
              {currentQ.question}
            </h4>
          </div>

          {/* Court Arena & 4 Hoops */}
          <div className="p-6 relative min-h-[300px] flex flex-col justify-between">
            {/* 4 Rims / Backboards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative z-10">
              {currentQ.options.map((opt, idx) => {
                const isTarget = shootingIndex === idx;
                const swished = isSwishing === idx;
                const clanged = isClanging === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => shootAtHoop(idx, opt)}
                    disabled={isShotInAir}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all duration-300 group ${
                      swished
                        ? 'bg-emerald-600/30 border-emerald-400 scale-105 shadow-xl'
                        : clanged
                        ? 'bg-rose-600/30 border-rose-400 scale-95'
                        : 'bg-slate-900/90 border-orange-500/50 hover:border-orange-400 hover:scale-102 hover:shadow-lg'
                    }`}
                  >
                    {/* Backboard Visual */}
                    <div className="w-full bg-slate-800 border border-slate-600 rounded-lg py-1 px-2 mb-2 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-white truncate max-w-full">
                        {opt}
                      </span>
                    </div>

                    {/* Hoop & Net */}
                    <div className={`relative my-2 transition-transform ${swished ? 'animate-hoop-swish' : ''}`}>
                      {/* Rim */}
                      <div className="w-14 h-4 rounded-full border-3 border-orange-500 bg-orange-600/30 mx-auto" />
                      {/* Net */}
                      <div className="w-10 h-7 border-x border-b border-white/60 mx-auto bg-gradient-to-b from-white/20 to-transparent clip-path-polygon" />
                      {swished && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-extrabold text-emerald-400 bg-black/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                          SWISH! +2
                        </div>
                      )}
                      {clanged && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-extrabold text-rose-400 bg-black/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                          CLANG!
                        </div>
                      )}
                    </div>

                    {/* Shoot Button */}
                    <div className="w-full py-1.5 rounded-xl bg-orange-500/20 group-hover:bg-orange-500 text-orange-300 group-hover:text-slate-950 font-bold text-xs transition">
                      Shoot 🏀
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Ball Shooter Zone at Bottom */}
            <div className="mt-8 text-center relative">
              {/* Animated Basketball */}
              <div className="inline-block relative">
                <div 
                  className={`w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 border-2 border-orange-700 shadow-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
                    isShotInAir ? '-translate-y-24 scale-75 rotate-180 opacity-90' : 'animate-bounce'
                  }`}
                >
                  🏀
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Tap any hoop above to take your shot!
              </p>
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onOpenTutor(currentQ, null)}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              👨🏾‍🏫 Need shooting guidance? Ask Teacher Helton
            </button>
            <span className="text-slate-400">Class: {profile.level}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
