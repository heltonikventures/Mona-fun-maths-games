import React, { useState, useEffect } from 'react';
import { ArrowLeft, Compass, Key, Battery, Award, HelpCircle, CheckCircle } from 'lucide-react';
import { UserProfile, Question } from '../../types';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface TreasureHuntProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenTutor: (q: Question, studentAns: string | null) => void;
  onOpenScratchpad: () => void;
}

interface Tile {
  id: number;
  revealed: boolean;
  type: 'empty' | 'chest' | 'energy' | 'coins';
}

export const TreasureHunt: React.FC<TreasureHuntProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenTutor,
  onOpenScratchpad
}) => {
  const [grid, setGrid] = useState<Tile[]>([]);
  const [energy, setEnergy] = useState<number>(14);
  const [chestsUnlocked, setChestsUnlocked] = useState<number>(0);
  const [totalChests] = useState<number>(3);
  const [coinsFound, setCoinsFound] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Question modal when opening a chest
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [pendingChestTileId, setPendingChestTileId] = useState<number | null>(null);

  const initGame = () => {
    soundManager.playClick();
    setEnergy(14);
    setChestsUnlocked(0);
    setCoinsFound(0);
    setGameWon(false);
    setGameOver(false);
    setActiveQuestion(null);

    // Create 5x5 grid (25 tiles)
    const tiles: Tile[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      revealed: false,
      type: 'empty'
    }));

    // Place 3 chests randomly
    const indices = Array.from({ length: 25 }, (_, i) => i).sort(() => 0.5 - Math.random());
    tiles[indices[0]].type = 'chest';
    tiles[indices[1]].type = 'chest';
    tiles[indices[2]].type = 'chest';

    // Place 3 energy potions
    tiles[indices[3]].type = 'energy';
    tiles[indices[4]].type = 'energy';
    tiles[indices[5]].type = 'energy';

    // Place 4 coin pouches
    tiles[indices[6]].type = 'coins';
    tiles[indices[7]].type = 'coins';
    tiles[indices[8]].type = 'coins';
    tiles[indices[9]].type = 'coins';

    setGrid(tiles);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleTileClick = async (tile: Tile) => {
    if (tile.revealed || energy <= 0 || gameWon || gameOver || activeQuestion) return;

    soundManager.playClick();
    const newEnergy = energy - 1;
    setEnergy(newEnergy);

    // Reveal tile
    setGrid(prev => prev.map(t => t.id === tile.id ? { ...t, revealed: true } : t));

    if (tile.type === 'chest') {
      soundManager.playSpell();
      setPendingChestTileId(tile.id);
      // Fetch question to unlock chest
      const qs = await fetchGameQuestions(profile.level, 'Word Problems', 'Medium', 1, 'Treasure Hunt');
      if (qs.length > 0) {
        setActiveQuestion(qs[0]);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    } else if (tile.type === 'energy') {
      soundManager.playCorrect();
      setEnergy(e => Math.min(18, e + 3));
    } else if (tile.type === 'coins') {
      soundManager.playCorrect();
      setCoinsFound(c => c + 50);
    }

    if (newEnergy <= 0 && tile.type !== 'chest') {
      setGameOver(true);
      soundManager.playWrong();
    }
  };

  const handleSelectChestAnswer = (ans: string) => {
    if (isAnswered || !activeQuestion) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    const isCorrect = ans === activeQuestion.correctAnswer;
    if (isCorrect) {
      soundManager.playCorrect();
      const newChests = chestsUnlocked + 1;
      setChestsUnlocked(newChests);
      setCoinsFound(c => c + 100);

      if (newChests >= totalChests) {
        // Victory!
        setTimeout(() => {
          winGame();
        }, 800);
      }
    } else {
      soundManager.playWrong();
      // Penalty of 1 energy
      setEnergy(e => Math.max(0, e - 1));
    }
  };

  const winGame = () => {
    setActiveQuestion(null);
    setGameWon(true);
    soundManager.playFanfare();

    const xpGained = 200;
    const coinsGained = coinsFound + 150;
    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, 'first_win');
    onUpdateProfile(updatedProfile);
    saveProfile(updatedProfile);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const closeQuestionModal = () => {
    setActiveQuestion(null);
    if (energy <= 0 && chestsUnlocked < totalChests) {
      setGameOver(true);
      soundManager.playWrong();
    }
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
          <div className="text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-600/40 px-3 py-1.5 rounded-xl">
            🗺️ Treasure Hunt: Nok Kingdom
          </div>
        </div>
      </div>

      {/* Island Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          {/* Energy */}
          <div className="flex items-center gap-2">
            <Battery size={20} className={energy <= 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'} />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Dig Energy</div>
              <div className="text-base font-extrabold text-white">{energy} / 18</div>
            </div>
          </div>

          {/* Chests */}
          <div className="flex items-center gap-2">
            <Key size={20} className="text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Golden Chests</div>
              <div className="text-base font-extrabold text-amber-400">{chestsUnlocked} / {totalChests}</div>
            </div>
          </div>
        </div>

        {/* Found coins */}
        <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-300 font-bold text-sm">
          <span>Found: ₦{coinsFound}</span>
        </div>
      </div>

      {/* Grid Container */}
      {gameWon ? (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl animate-bounce">👑</div>
          <div>
            <h3 className="text-2xl font-bold text-white font-game">Crown Recovered!</h3>
            <p className="text-sm text-amber-300 mt-1">
              You cracked all ancient mathematical seals and found the sacred Nok Golden Crown!
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 max-w-xs mx-auto">
            <div className="text-xs text-slate-400">Total Reward</div>
            <div className="text-xl font-bold text-emerald-400">+200 XP • +₦{coinsFound + 150}</div>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGame}
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
      ) : gameOver ? (
        <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in fade-in">
          <div className="text-6xl">🪫</div>
          <div>
            <h3 className="text-2xl font-bold text-white font-game">Out of Digging Energy!</h3>
            <p className="text-sm text-slate-300 mt-1">
              You found {chestsUnlocked} of {totalChests} chests before your expedition team got fatigued.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition"
            >
              Try Expedition Again
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-md mx-auto aspect-square">
            {grid.map((tile) => {
              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  disabled={tile.revealed || energy <= 0}
                  className={`rounded-xl border flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-300 ${
                    tile.revealed
                      ? tile.type === 'chest'
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-inner'
                        : tile.type === 'energy'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : tile.type === 'coins'
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-600'
                      : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 border-emerald-600/40 hover:border-amber-400 hover:scale-105 shadow-md active:scale-95'
                  }`}
                >
                  {tile.revealed ? (
                    tile.type === 'chest' ? '🗝️' :
                    tile.type === 'energy' ? '🧪' :
                    tile.type === 'coins' ? '💰' : '🍃'
                  ) : (
                    '❓'
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            Tap tiles to dig! Uncover ancient Golden Chests 🗝️ and answer the maths questions to unlock them.
          </p>
        </div>
      )}

      {/* Math Key Lock Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="text-2xl">🗝️</span>
              <h4 className="text-lg font-bold font-game">Chest Cipher Lock!</h4>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {activeQuestion.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {activeQuestion.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === activeQuestion.correctAnswer;
                let btnStyle = 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200';
                if (isAnswered) {
                  if (isCorrect) btnStyle = 'bg-emerald-600/40 border-emerald-400 text-emerald-200';
                  else if (isSelected) btnStyle = 'bg-rose-600/40 border-rose-400 text-rose-200';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectChestAnswer(opt)}
                    disabled={isAnswered}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-amber-400">Solution: </span>
                {activeQuestion.explanation}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onOpenTutor(activeQuestion, selectedAnswer)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
              >
                👩🏾‍🏫 Ask Teacher Folake
              </button>

              {isAnswered && (
                <button
                  onClick={closeQuestionModal}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  Continue Expedition →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
