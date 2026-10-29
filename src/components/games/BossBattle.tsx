import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Zap, Sparkles, Heart, Award, RotateCcw } from 'lucide-react';
import { UserProfile, Question } from '../../types';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface BossBattleProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenTutor: (q: Question, studentAns: string | null) => void;
  onOpenScratchpad: () => void;
}

const BOSSES = [
  {
    id: 'phantom',
    name: 'The Fraction Phantom',
    avatar: '👻',
    hp: 120,
    quote: "You cannot divide and conquer me, puny student!",
    topic: 'Fractions, Decimals & %' as const
  },
  {
    id: 'dragon',
    name: 'The Algebraic Dragon',
    avatar: '🐉',
    hp: 160,
    quote: "I breathe the fire of unknown variables!",
    topic: 'Algebra & Equations' as const
  },
  {
    id: 'calculator',
    name: 'The Chaos Calculator',
    avatar: '🤖',
    hp: 180,
    quote: "SYNTAX ERROR! Prepare for arithmetic obliteration!",
    topic: 'Multiplication & Division' as const
  }
];

export const BossBattle: React.FC<BossBattleProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenTutor,
  onOpenScratchpad
}) => {
  const [selectedBossIdx, setSelectedBossIdx] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(120);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null);

  const startBattle = async (bossIdx: number) => {
    const boss = BOSSES[bossIdx];
    soundManager.playClick();
    setSelectedBossIdx(bossIdx);
    setBossHp(boss.hp);
    setPlayerHp(100);
    setShieldActive(false);
    setCurrentIdx(0);
    setGameOver(null);
    setBattleLogs([`⚔️ You challenged ${boss.name}! "${boss.quote}"`]);
    setLoading(true);

    const qs = await fetchGameQuestions(profile.level, boss.topic, 'Hard', 10, 'Boss Battle');
    setQuestions(qs);
    setLoading(false);
    setIsPlaying(true);
  };

  const handleCastSpell = (spellType: 'lightning' | 'shield' | 'heal', chosenAnswer: string) => {
    const currentQ = questions[currentIdx];
    const boss = BOSSES[selectedBossIdx];
    if (!currentQ || gameOver) return;

    const isCorrect = chosenAnswer === currentQ.correctAnswer;

    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playSpell();

      if (spellType === 'lightning') {
        const dmg = Math.floor(Math.random() * 15) + 35; // 35 - 50 dmg
        const newBossHp = Math.max(0, bossHp - dmg);
        setBossHp(newBossHp);
        setBattleLogs(prev => [`⚡ Cast Naira Lightning! ${boss.name} took ${dmg} damage!`, ...prev.slice(0, 4)]);

        if (newBossHp <= 0) {
          winBattle();
          return;
        }
      } else if (spellType === 'shield') {
        setShieldActive(true);
        setBattleLogs(prev => [`🛡️ Geometric Shield activated! Next counter-attack will be deflected.`, ...prev.slice(0, 4)]);
      } else if (spellType === 'heal') {
        setPlayerHp(p => Math.min(100, p + 30));
        setBattleLogs(prev => [`🧪 Archimedes Potion drank! Restored 30 HP.`, ...prev.slice(0, 4)]);
      }
    } else {
      soundManager.playWrong();
      // Boss counter-attack!
      if (shieldActive) {
        setShieldActive(false);
        setBattleLogs(prev => [`🛡️ Your Geometric Shield absorbed ${boss.name}'s ferocious strike!`, ...prev.slice(0, 4)]);
      } else {
        const bossDmg = Math.floor(Math.random() * 10) + 20; // 20 - 30 dmg
        const newPlayerHp = Math.max(0, playerHp - bossDmg);
        setPlayerHp(newPlayerHp);
        setBattleLogs(prev => [`💥 Answer was incorrect (${currentQ.correctAnswer})! ${boss.name} struck you for ${bossDmg} damage!`, ...prev.slice(0, 4)]);

        if (newPlayerHp <= 0) {
          loseBattle();
          return;
        }
      }
    }

    // Move to next question
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  const winBattle = () => {
    setGameOver('win');
    soundManager.playFanfare();

    const xpGained = 300;
    const coinsGained = 200;
    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, 'boss_slayer');
    onUpdateProfile(updatedProfile);
    saveProfile(updatedProfile);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const loseBattle = () => {
    setGameOver('lose');
    soundManager.playWrong();
  };

  const currentBoss = BOSSES[selectedBossIdx];
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
          <div className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-600/40 px-3 py-1.5 rounded-xl">
            🐉 Boss Battle Arena
          </div>
        </div>
      </div>

      {!isPlaying ? (
        /* Boss Selection */
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">
              Maths Monster Showdown
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select a titan to challenge! Answer questions correctly to unleash magical arithmetic spells!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOSSES.map((boss, idx) => (
              <div
                key={boss.id}
                className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-6 text-center flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl"
              >
                <div>
                  <div className="text-6xl my-3">{boss.avatar}</div>
                  <h4 className="font-bold text-white text-lg font-game">{boss.name}</h4>
                  <div className="text-xs text-rose-400 font-semibold mt-1">Boss HP: {boss.hp}</div>
                  <div className="text-[11px] text-slate-400 italic mt-2">"{boss.quote}"</div>
                </div>

                <button
                  onClick={() => startBattle(idx)}
                  className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition"
                >
                  Challenge Titan ⚔️
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : gameOver === 'win' ? (
        /* Victory Screen */
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl animate-bounce">🏆💥</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">Titan Defeated!</h3>
            <p className="text-sm text-amber-300 mt-1">
              You banished {currentBoss.name} with your supreme mathematical powers!
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 max-w-xs mx-auto">
            <div className="text-xs text-slate-400">Battle Spoils</div>
            <div className="text-xl font-bold text-emerald-400">+300 XP • +₦200</div>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsPlaying(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
            >
              Choose Another Boss
            </button>
            <button
              onClick={onBackToMenu}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      ) : gameOver === 'lose' ? (
        /* Defeat Screen */
        <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl">💀</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">Defeated in Battle!</h3>
            <p className="text-sm text-slate-300 mt-1">
              {currentBoss.name}'s counter-attacks overpowered you. Rest up and try again!
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => startBattle(selectedBossIdx)}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition"
            >
              Rematch Boss 🔄
            </button>
            <button
              onClick={() => setIsPlaying(false)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Change Boss
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Combat Arena */
        <div className="space-y-4">
          {/* Health Bars Display */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">{profile.avatar}</span> {profile.name}
                </span>
                <span className="font-bold text-emerald-400">{playerHp} / 100 HP</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
              {shieldActive && (
                <div className="text-[10px] text-indigo-300 font-bold mt-1 flex items-center gap-1">
                  <Shield size={12} /> Shield Active!
                </div>
              )}
            </div>

            {/* Boss Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-lg">{currentBoss.avatar}</span> {currentBoss.name}
                </span>
                <span className="font-bold text-rose-400">{bossHp} / {currentBoss.hp} HP</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300"
                  style={{ width: `${(bossHp / currentBoss.hp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question & Spell Cast Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Solve to Unleash Spell
            </div>
            <h4 className="text-xl font-bold text-white font-game max-w-xl mx-auto">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleCastSpell('lightning', opt)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500 text-white font-bold text-sm shadow-md transition active:scale-95"
                >
                  ⚡ Cast with: {opt}
                </button>
              ))}
            </div>

            {/* Battle Log */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Combat Log</div>
              {battleLogs.map((log, idx) => (
                <p key={idx} className="text-xs text-slate-300 leading-snug">{log}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
