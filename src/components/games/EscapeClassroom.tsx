import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Lock, Key, Award, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface EscapeClassroomProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenScratchpad: () => void;
}

interface ClassroomClue {
  id: number;
  title: string;
  location: string;
  icon: string;
  question: string;
  options: string[];
  correctDigit: string;
  solved: boolean;
}

export const EscapeClassroom: React.FC<EscapeClassroomProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenScratchpad
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeClueId, setActiveClueId] = useState<number | null>(null);
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [escaped, setEscaped] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const [clues, setClues] = useState<ClassroomClue[]>([
    {
      id: 1,
      title: "Teacher's Blackboard",
      location: "Front Wall",
      icon: "📋",
      question: "Solve for the single digit: 3x - 5 = 16. What is x?",
      options: ["5", "7", "8", "9"],
      correctDigit: "7",
      solved: false
    },
    {
      id: 2,
      title: "School Bag Locker",
      location: "Corner Locker 12",
      icon: "🎒",
      question: "Amara had ₦1000 and spent 3/5 of it on textbooks. What digit is in the hundreds place of the money she has left? (Left = ₦400)",
      options: ["2", "4", "6", "8"],
      correctDigit: "4",
      solved: false
    },
    {
      id: 3,
      title: "Classroom Wall Clock",
      location: "Above the Door",
      icon: "⏰",
      question: "The assembly starts at 8:00 AM. If the lesson ends after 180 minutes, what hour does the clock show? (180 mins = 3 hours. 8 + 3 = 11)",
      options: ["1", "3", "9", "11"],
      correctDigit: "3", // 3 hours duration
      solved: false
    },
    {
      id: 4,
      title: "Lab Balance Scale",
      location: "Science Table",
      icon: "⚖️",
      question: "A cube weights 240g. If 4 equal smaller weights balance it, how many tens of grams is each weight? (240 / 4 = 60g, which is 6 tens).",
      options: ["4", "5", "6", "8"],
      correctDigit: "6",
      solved: false
    }
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startEscape = () => {
    soundManager.playClick();
    setTimeLeft(180);
    setEnteredCode('');
    setEscaped(false);
    setFailed(false);
    setStatusMsg('');
    setActiveClueId(null);
    setClues(prev => prev.map(c => ({ ...c, solved: false })));
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          setFailed(true);
          soundManager.playWrong();
          return 0;
        }
        if (prev <= 10) soundManager.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const solveClue = (clueId: number, chosenOption: string) => {
    const clue = clues.find(c => c.id === clueId);
    if (!clue) return;

    if (chosenOption === clue.correctDigit) {
      soundManager.playCorrect();
      setClues(prev => prev.map(c => c.id === clueId ? { ...c, solved: true } : c));
      setStatusMsg(`🎉 Correct! Clue #${clueId} solved. Digit is: ${clue.correctDigit}`);
      setActiveClueId(null);
    } else {
      soundManager.playWrong();
      setStatusMsg("❌ Incorrect calculation. Look closely at the clue!");
    }
  };

  const handleKeypadPress = (val: string) => {
    soundManager.playClick();
    if (enteredCode.length < 4) {
      setEnteredCode(prev => prev + val);
    }
  };

  const handleKeypadClear = () => {
    soundManager.playClick();
    setEnteredCode('');
  };

  const handleUnlockDoor = () => {
    const masterCode = clues.map(c => c.correctDigit).join(''); // e.g. "7436"

    if (enteredCode === masterCode) {
      soundManager.playFanfare();
      setIsPlaying(false);
      setEscaped(true);

      const { updatedProfile } = awardReward(profile, 250, 180, 'classroom_escape');
      onUpdateProfile(updatedProfile);
      saveProfile(updatedProfile);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      soundManager.playWrong();
      setStatusMsg("🚨 Access Denied! Master code is incorrect. Check your clue digits!");
      setEnteredCode('');
    }
  };

  const activeClue = clues.find(c => c.id === activeClueId);

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
            🚪 Escape the Classroom: Unity High
          </div>
        </div>
      </div>

      {!isPlaying && !escaped && !failed ? (
        /* Intro Card */
        <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl">
            🏫
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">
              Escape the Classroom!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              The school bell is ringing! The classroom door has a 4-digit digital lock. Inspect the 4 objects around the room, solve each maths puzzle to collect the 4 digits, and escape before the principal arrives!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-xs text-slate-300">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 font-semibold">
              ⏱️ Time Limit: 3 Mins
            </div>
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 font-semibold">
              🔢 Code Length: 4 Digits
            </div>
          </div>

          <button
            onClick={startEscape}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-base shadow-xl hover:scale-105 active:scale-95 transition"
          >
            Start Room Escape 🏃🏾💨
          </button>
        </div>
      ) : escaped ? (
        /* Success Screen */
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl animate-bounce">🚪✨</div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-game">
              Classroom Door Unlocked!
            </h3>
            <p className="text-sm text-emerald-300 mt-1">
              You cracked all 4 mathematical clues and made it out in time for morning assembly!
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 max-w-xs mx-auto">
            <div className="text-xs text-slate-400">Escape Reward</div>
            <div className="text-xl font-bold text-emerald-400">+250 XP • +₦180</div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={startEscape}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
            >
              Play Again
            </button>
            <button
              onClick={onBackToMenu}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      ) : failed ? (
        /* Time Out Screen */
        <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl">🔔</div>
          <div>
            <h3 className="text-2xl font-bold text-white font-game">The Principal Has Arrived!</h3>
            <p className="text-sm text-slate-300 mt-1">
              Time ran out before the master code could be cracked. Don't worry, try again!
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={startEscape}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
            >
              Try Again 🔄
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
        /* Room Escape Interactive View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: 4 Interactive Room Clues */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top Timer Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className={timeLeft <= 30 ? 'text-rose-500 animate-pulse' : 'text-amber-400'} />
                <span className={`text-lg font-bold font-mono ${timeLeft <= 30 ? 'text-rose-400' : 'text-white'}`}>
                  {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Solved: <strong className="text-amber-400">{clues.filter(c => c.solved).length} / 4 Clues</strong>
              </div>
            </div>

            {/* 4 Interactive Zone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clues.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveClueId(c.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    c.solved
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{c.icon}</span>
                    {c.solved ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Digit: {c.correctDigit}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">Tap to inspect 🔍</span>
                    )}
                  </div>
                  <h5 className="font-bold text-white text-sm">{c.title}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{c.location}</p>
                </button>
              ))}
            </div>

            {/* Status Message */}
            {statusMsg && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 animate-in fade-in">
                {statusMsg}
              </div>
            )}
          </div>

          {/* Right: Digital Door Keypad */}
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-amber-400" />
                  <h4 className="font-bold text-white text-sm font-game">Exit Door Keypad</h4>
                </div>
                <span className="text-[10px] text-slate-400">4-Digit Master Code</span>
              </div>

              {/* Code Screen */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center mb-4">
                <div className="text-2xl font-mono font-extrabold tracking-widest text-amber-400">
                  {enteredCode.padEnd(4, '•')}
                </div>
              </div>

              {/* Number Buttons 1..9, Clear, 0, Enter */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleKeypadPress(n)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition active:scale-95"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={handleKeypadClear}
                  className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-rose-300 font-bold text-xs transition"
                >
                  CLR
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handleUnlockDoor}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
                >
                  OPEN
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-4">
              Enter digits in order (Clue 1 → 2 → 3 → 4) then tap OPEN!
            </p>
          </div>
        </div>
      )}

      {/* Clue Question Modal */}
      {activeClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{activeClue.icon}</span>
              <div>
                <h4 className="text-lg font-bold text-white font-game">{activeClue.title}</h4>
                <p className="text-xs text-indigo-300">Location: {activeClue.location}</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {activeClue.question}
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {activeClue.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => solveClue(activeClue.id, opt)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-400 text-white font-bold text-base transition active:scale-95"
                >
                  Digit {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveClueId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Close Clue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
