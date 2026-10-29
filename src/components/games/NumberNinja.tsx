import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Zap, Award, RotateCcw } from 'lucide-react';
import { UserProfile } from '../../types';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface NumberNinjaProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenScratchpad: () => void;
}

interface FloatingTarget {
  id: number;
  val: number | string;
  isCorrect: boolean;
  isBomb: boolean;
  x: number;
  y: number;
  speed: number;
  sliced: boolean;
}

export const NumberNinja: React.FC<NumberNinjaProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenScratchpad
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hearts, setHearts] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [slicedCount, setSlicedCount] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [rulePrompt, setRulePrompt] = useState<string>('Slash Multiples of 5!');
  const [targets, setTargets] = useState<FloatingTarget[]>([]);

  const animFrameRef = useRef<number | null>(null);
  const nextTargetId = useRef<number>(1);
  const currentRuleChecker = useRef<(val: number) => boolean>((n) => n % 5 === 0);

  const RULES = [
    { prompt: 'Slash Multiples of 3! (3, 6, 9, 12...)', check: (n: number) => n % 3 === 0 },
    { prompt: 'Slash Even Numbers! (2, 4, 6, 8...)', check: (n: number) => n % 2 === 0 },
    { prompt: 'Slash Multiples of 5! (5, 10, 15...)', check: (n: number) => n % 5 === 0 },
    { prompt: 'Slash Numbers Greater Than 30!', check: (n: number) => n > 30 },
    { prompt: 'Slash Multiples of 7! (7, 14, 21...)', check: (n: number) => n % 7 === 0 }
  ];

  const startGame = () => {
    soundManager.playClick();
    setHearts(3);
    setScore(0);
    setSlicedCount(0);
    setGameOver(false);
    setTargets([]);

    // Pick random rule
    const rule = RULES[Math.floor(Math.random() * RULES.length)];
    setRulePrompt(rule.prompt);
    currentRuleChecker.current = rule.check;

    setIsPlaying(true);
  };

  // Game animation and spawner loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastSpawn = Date.now();

    const loop = () => {
      const now = Date.now();

      // Spawn target every ~1.2s
      if (now - lastSpawn > 1200) {
        lastSpawn = now;
        spawnTargets();
      }

      // Update positions
      setTargets((prev) => {
        return prev
          .map((t) => ({
            ...t,
            y: t.y - t.speed
          }))
          .filter((t) => t.y > -10); // Remove when off screen top
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const spawnTargets = () => {
    // 25% chance of a bomb, otherwise random number 2..60
    const isBomb = Math.random() < 0.22;
    const num = Math.floor(Math.random() * 50) + 2;
    const isCorrect = isBomb ? false : currentRuleChecker.current(num);

    const newTarget: FloatingTarget = {
      id: nextTargetId.current++,
      val: isBomb ? '💣' : num,
      isCorrect,
      isBomb,
      x: Math.floor(Math.random() * 70) + 15, // 15% to 85%
      y: 95, // starts at bottom
      speed: Math.random() * 0.45 + 0.55,
      sliced: false
    };

    setTargets((prev) => [...prev, newTarget]);
  };

  const sliceTarget = (target: FloatingTarget) => {
    if (target.sliced || !isPlaying) return;

    soundManager.playSlash();

    // Mark sliced
    setTargets((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, sliced: true } : t))
    );

    if (target.isBomb) {
      soundManager.playWrong();
      loseHeart();
    } else if (target.isCorrect) {
      soundManager.playCorrect();
      setScore((s) => s + 10);
      setSlicedCount((sc) => sc + 1);
    } else {
      // Wrong number sliced
      soundManager.playWrong();
      loseHeart();
    }
  };

  const loseHeart = () => {
    setHearts((h) => {
      const remaining = h - 1;
      if (remaining <= 0) {
        endGame();
      }
      return Math.max(0, remaining);
    });
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    soundManager.playFanfare();

    const xpGained = score * 2;
    const coinsGained = Math.floor(score * 1.5);
    let newBadge: string | undefined = undefined;
    if (slicedCount >= 15) {
      newBadge = 'ninja_slasher';
    }

    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, newBadge);
    onUpdateProfile(updatedProfile);
    saveProfile(updatedProfile);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

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
          <div className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-600/40 px-3 py-1.5 rounded-xl">
            ⚔️ Number Ninja Dojo
          </div>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        /* Start Screen */
        <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center text-4xl shadow-xl animate-pulse">
            ⚔️
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">
              Number Ninja: Math Blade!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              Slash floating targets that match the dojo rule! Dodge bombs 💣 and wrong numbers to preserve your 3 ninja hearts!
            </p>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-extrabold text-base shadow-xl hover:scale-105 active:scale-95 transition"
          >
            Enter the Dojo ⚔️
          </button>
        </div>
      ) : gameOver ? (
        /* Game Over Screen */
        <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-6 animate-in fade-in">
          <div className="text-6xl animate-bounce">🥷🏾</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">Dojo Trial Finished!</h3>
            <p className="text-sm text-rose-300 mt-1">Honourable blade work, math ninja!</p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-2xl font-bold text-rose-400">{score}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Sliced Targets</div>
              <div className="text-2xl font-bold text-amber-400">{slicedCount} ⚔️</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Reward</div>
              <div className="text-2xl font-bold text-emerald-400">+{score * 2} XP</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-bold text-sm shadow-md transition"
            >
              Play Again ⚔️
            </button>
            <button
              onClick={onBackToMenu}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      ) : (
        /* Ninja Action Screen */
        <div className="bg-slate-950 border-2 border-rose-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
          {/* Status Bar */}
          <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex items-center justify-between z-20">
            {/* Hearts */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  size={20}
                  className={h <= hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-700 fill-slate-700'}
                />
              ))}
            </div>

            {/* Current Objective */}
            <div className="text-center">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Target Objective</div>
              <div className="text-sm sm:text-base font-extrabold text-white font-game">{rulePrompt}</div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
              <div className="text-lg font-extrabold text-amber-400 font-mono">{score}</div>
            </div>
          </div>

          {/* Slicing Canvas / Arena */}
          <div className="relative w-full h-[450px] overflow-hidden bg-radial from-slate-900 to-slate-950 cursor-crosshair">
            {targets.map((target) => (
              <button
                key={target.id}
                onClick={() => sliceTarget(target)}
                disabled={target.sliced}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-lg transition-transform ${
                  target.sliced
                    ? 'scale-125 opacity-20 pointer-events-none'
                    : target.isBomb
                    ? 'bg-rose-950 border-2 border-rose-500 animate-spin'
                    : 'bg-gradient-to-tr from-indigo-600 to-teal-400 border-2 border-white/50 text-white hover:scale-110 active:scale-95'
                }`}
              >
                {target.sliced ? '💥' : target.val}
              </button>
            ))}
          </div>

          {/* Footer instruction */}
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
            Slash / click matching numbers swiftly before they float away! Avoid the 💣 bombs!
          </div>
        </div>
      )}
    </div>
  );
};
