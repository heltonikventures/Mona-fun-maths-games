import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Award, CheckCircle, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { UserProfile, Question, SchoolLevel, MathTopic } from '../../types';
import { ADVENTURE_STAGES } from '../../data/curriculum';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface MathsAdventureProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenTutor: (q: Question, studentAns: string | null) => void;
  onOpenScratchpad: () => void;
}

export const MathsAdventure: React.FC<MathsAdventureProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenTutor,
  onOpenScratchpad
}) => {
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [stageFinished, setStageFinished] = useState<boolean>(false);

  // Boss HP for final stage question
  const [bossHp, setBossHp] = useState<number>(100);
  const [bossMaxHp, setBossMaxHp] = useState<number>(100);

  const startStage = async (stageId: number) => {
    const stage = ADVENTURE_STAGES.find(s => s.id === stageId);
    if (!stage) return;

    soundManager.playClick();
    setSelectedStageId(stageId);
    setLoading(true);
    setStageFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setEliminatedOptions([]);
    setBossHp(stage.bossHp);
    setBossMaxHp(stage.bossHp);

    const fetched = await fetchGameQuestions(
      profile.level,
      stage.topic,
      'Medium',
      4,
      `Adventure Mode: ${stage.name}`
    );

    setQuestions(fetched);
    setLoading(false);
  };

  const currentQ = questions[currentIdx];

  const handleSelectAnswer = (ans: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedAnswer(ans);
    setIsAnswered(true);

    const isCorrect = ans === currentQ.correctAnswer;
    if (isCorrect) {
      soundManager.playCorrect();
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setBossHp(prev => Math.max(0, prev - Math.ceil(bossMaxHp / questions.length)));
    } else {
      soundManager.playWrong();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setEliminatedOptions([]);
    } else {
      // Stage completed!
      finishStage();
    }
  };

  const finishStage = () => {
    setStageFinished(true);
    const finalScore = score + (selectedAnswer === currentQ?.correctAnswer ? 1 : 0);
    const starsEarned = finalScore === questions.length ? 3 : finalScore >= Math.ceil(questions.length * 0.6) ? 2 : 1;
    
    // Awards
    const xpGained = starsEarned * 70;
    const coinsGained = starsEarned * 50;

    // Check next stage unlock
    const currentStage = selectedStageId || 1;
    const nextUnlocked = Math.max(profile.unlockedAdventureStages, currentStage + 1);
    const starsMap = { ...profile.adventureStars, [currentStage]: Math.max(profile.adventureStars[currentStage] || 0, starsEarned) };

    let newBadge: string | undefined = undefined;
    if (currentStage === 1 && starsEarned === 3) {
      newBadge = 'market_master';
    }

    const { updatedProfile } = awardReward(profile, xpGained, coinsGained, newBadge);
    const fullyUpdated: UserProfile = {
      ...updatedProfile,
      unlockedAdventureStages: nextUnlocked,
      adventureStars: starsMap
    };
    onUpdateProfile(fullyUpdated);
    saveProfile(fullyUpdated);

    soundManager.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const useFiftyFifty = () => {
    if (!currentQ || profile.unlockedPowerups.fiftyFifty <= 0 || isAnswered) return;
    soundManager.playSpell();
    const wrong = currentQ.options.filter(opt => opt !== currentQ.correctAnswer);
    const toEliminate = wrong.slice(0, 2);
    setEliminatedOptions(toEliminate);

    const updated: UserProfile = {
      ...profile,
      unlockedPowerups: {
        ...profile.unlockedPowerups,
        fiftyFifty: profile.unlockedPowerups.fiftyFifty - 1
      }
    };
    onUpdateProfile(updated);
    saveProfile(updated);
  };

  // Stage Selection Screen
  if (selectedStageId === null) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
          >
            <ArrowLeft size={18} /> Back to Games
          </button>
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-game">
              Maths Adventure: Journey Through Nigeria
            </h2>
            <p className="text-xs text-slate-400">Complete historical landmark quests to unlock new regions!</p>
          </div>
        </div>

        {/* Stage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADVENTURE_STAGES.map((stage) => {
            const isUnlocked = stage.id <= profile.unlockedAdventureStages;
            const stars = profile.adventureStars[stage.id] || 0;

            return (
              <div
                key={stage.id}
                className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-slate-800/90 border-amber-500/40 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                {/* Header Banner */}
                <div className={`p-4 bg-gradient-to-r ${stage.bgGradient} relative`}>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                      Stage {stage.id}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          size={16}
                          className={starIdx <= stars ? 'text-yellow-300 fill-yellow-300' : 'text-black/30 fill-black/30'}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white font-game mt-2">{stage.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-100 mt-0.5">
                    <MapPin size={12} />
                    <span>{stage.city}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="inline-block px-2 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-[11px] font-bold mb-2">
                      Topic: {stage.topic}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {stage.description}
                    </p>
                  </div>

                  {/* Stage Boss Preview */}
                  <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{stage.bossAvatar}</span>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Guardian</div>
                        <div className="text-xs font-bold text-slate-200">{stage.bossName}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => isUnlocked && startStage(stage.id)}
                      disabled={!isUnlocked}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? (stars > 0 ? 'Replay' : 'Embark Quest') : 'Locked 🔒'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Stage Game View
  const currentStage = ADVENTURE_STAGES.find(s => s.id === selectedStageId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setSelectedStageId(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          <ArrowLeft size={16} /> Exit Stage
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScratchpad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-indigo-300 text-xs font-bold transition"
          >
            <span>📝</span> Scratchpad
          </button>
          <div className="text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-600/40 px-3 py-1.5 rounded-xl">
            Stage {currentStage?.id}: {currentStage?.name}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xl">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 font-medium">Entering {currentStage?.landmark}...</p>
        </div>
      ) : stageFinished ? (
        /* Stage Results */
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="text-6xl animate-bounce">🏆</div>
          <div>
            <h3 className="text-2xl font-bold text-white font-game">Stage Completed!</h3>
            <p className="text-sm text-amber-200 mt-1">You conquered {currentStage?.landmark}!</p>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((starIdx) => {
              const starsWon = score === questions.length ? 3 : score >= Math.ceil(questions.length * 0.6) ? 2 : 1;
              return (
                <Star
                  key={starIdx}
                  size={36}
                  className={starIdx <= starsWon ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700 fill-slate-700'}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-xl font-bold text-white">{score} / {questions.length}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Coins Earned</div>
              <div className="text-xl font-bold text-amber-400">+₦{score * 25}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => startStage(selectedStageId)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Replay Stage
            </button>
            <button
              onClick={() => setSelectedStageId(null)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg transition"
            >
              Continue Adventure
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Active Question Card */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Boss / Guardian Progress Bar */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentStage?.bossAvatar}</span>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Guardian HP</div>
                <div className="text-xs font-bold text-slate-200">{currentStage?.bossName}</div>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Checkpoint {currentIdx + 1} of {questions.length}</span>
                <span>{bossHp} HP</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {currentQ.topic || currentStage?.topic}
              </span>
              {/* Power-up button */}
              <button
                onClick={useFiftyFifty}
                disabled={profile.unlockedPowerups.fiftyFifty <= 0 || isAnswered}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold disabled:opacity-40 transition"
              >
                <span>🧪 50/50</span>
                <span className="text-[10px] font-bold bg-indigo-800 px-1.5 py-0.2 rounded-full">
                  {profile.unlockedPowerups.fiftyFifty}
                </span>
              </button>
            </div>

            <h4 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-6 font-game">
              {currentQ.question}
            </h4>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQ.correctAnswer;
                const isEliminated = eliminatedOptions.includes(opt);

                let btnStyle = 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-200';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-md';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-600/30 border-rose-400 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
                  }
                } else if (isEliminated) {
                  btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-30 cursor-not-allowed';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isEliminated && handleSelectAnswer(opt)}
                    disabled={isAnswered || isEliminated}
                    className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle size={18} className="text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Feedback Banner */}
            {isAnswered && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    selectedAnswer === currentQ.correctAnswer ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedAnswer === currentQ.correctAnswer ? '✨ Correct Answer!' : '❌ Not Quite Right'}
                  </span>
                  <button
                    onClick={() => onOpenTutor(currentQ, selectedAnswer)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition"
                  >
                    <span>👨🏾‍🏫 Ask Teacher Helton for Step-by-Step</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => onOpenTutor(currentQ, selectedAnswer)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition"
              >
                <HelpCircle size={15} /> Need a hint?
              </button>

              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg transition"
                >
                  {currentIdx + 1 < questions.length ? 'Next Checkpoint →' : 'Complete Stage 🏁'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
