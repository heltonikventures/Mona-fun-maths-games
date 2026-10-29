import React, { useState } from 'react';
import { ArrowLeft, Plus, Play, Trash2, Download, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile, CustomGame, Question, SchoolLevel, MathTopic } from '../../types';
import { SCHOOL_LEVELS, MATH_TOPICS } from '../../data/curriculum';
import { fetchGameQuestions } from '../../utils/api';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface BuildYourOwnGameProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenScratchpad: () => void;
}

export const BuildYourOwnGame: React.FC<BuildYourOwnGameProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenScratchpad
}) => {
  const [view, setView] = useState<'list' | 'create' | 'play'>('list');
  const [activePlayGame, setActivePlayGame] = useState<CustomGame | null>(null);

  // Play state
  const [playIdx, setPlayIdx] = useState<number>(0);
  const [playScore, setPlayScore] = useState<number>(0);
  const [playSelected, setPlaySelected] = useState<string | null>(null);
  const [playAnswered, setPlayAnswered] = useState<boolean>(false);
  const [playFinished, setPlayFinished] = useState<boolean>(false);

  // Creator state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newLevel, setNewLevel] = useState<SchoolLevel>(profile.level);
  const [newTopic, setNewTopic] = useState<MathTopic>('Money & Naira Maths');
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "If 1 meat pie costs ₦350, how much will 4 meat pies cost?",
      options: ["₦1,200", "₦1,400", "₦1,500", "₦1,600"],
      correctAnswer: "₦1,400",
      explanation: "Multiply 4 by ₦350: 4 × 350 = ₦1,400.",
      hint: "Multiply 350 by 4."
    }
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  const addEmptyQuestion = () => {
    soundManager.playClick();
    setQuestions(prev => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        hint: ""
      }
    ]);
  };

  const updateQuestionField = (idx: number, field: keyof Question, value: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    soundManager.playClick();
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAiAutoFill = async () => {
    soundManager.playClick();
    setIsAiGenerating(true);
    try {
      const generated = await fetchGameQuestions(newLevel, newTopic, 'Medium', 3, 'Custom Game Builder');
      if (generated.length > 0) {
        soundManager.playCorrect();
        setQuestions(generated);
      }
    } catch (e) {
      console.warn('AI fill failed');
    }
    setIsAiGenerating(false);
  };

  const saveCustomGame = () => {
    if (!newTitle.trim()) {
      alert('Please enter a title for your custom game!');
      return;
    }

    soundManager.playFanfare();
    const newGame: CustomGame = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom created mathematics challenge.',
      targetLevel: newLevel,
      topic: newTopic,
      createdAt: new Date().toISOString(),
      questions: questions.filter(q => q.question.trim().length > 0)
    };

    const existing = profile.customGames || [];
    const { updatedProfile } = awardReward(profile, 100, 100, 'custom_creator');
    const fullyUpdated: UserProfile = {
      ...updatedProfile,
      customGames: [newGame, ...existing]
    };

    onUpdateProfile(fullyUpdated);
    saveProfile(fullyUpdated);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setView('list');
  };

  const startPlayingGame = (game: CustomGame) => {
    soundManager.playClick();
    setActivePlayGame(game);
    setPlayIdx(0);
    setPlayScore(0);
    setPlaySelected(null);
    setPlayAnswered(false);
    setPlayFinished(false);
    setView('play');
  };

  const handlePlayAnswer = (ans: string) => {
    if (playAnswered || !activePlayGame) return;
    const currentQ = activePlayGame.questions[playIdx];
    setPlaySelected(ans);
    setPlayAnswered(true);

    if (ans === currentQ.correctAnswer) {
      soundManager.playCorrect();
      setPlayScore(s => s + 1);
    } else {
      soundManager.playWrong();
    }
  };

  const handleNextPlayQ = () => {
    if (!activePlayGame) return;
    soundManager.playClick();
    if (playIdx + 1 < activePlayGame.questions.length) {
      setPlayIdx(i => i + 1);
      setPlaySelected(null);
      setPlayAnswered(false);
    } else {
      setPlayFinished(true);
      soundManager.playFanfare();
      const { updatedProfile } = awardReward(profile, playScore * 25, playScore * 20);
      onUpdateProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  };

  const deleteCustomGame = (gameId: string) => {
    if (window.confirm('Delete this custom game?')) {
      const filtered = (profile.customGames || []).filter(g => g.id !== gameId);
      const updated: UserProfile = { ...profile, customGames: filtered };
      onUpdateProfile(updated);
      saveProfile(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={view === 'list' ? onBackToMenu : () => setView('list')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          <ArrowLeft size={16} /> {view === 'list' ? 'Exit Game' : 'Back to Custom List'}
        </button>
        <div className="text-xs text-indigo-400 font-bold bg-indigo-950/60 border border-indigo-600/40 px-3 py-1.5 rounded-xl">
          🛠️ Build Your Own Maths Game
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-game">Custom Games Studio</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Design mathematics quizzes, test them with friends, or generate instant packs with AI!
              </p>
            </div>
            <button
              onClick={() => { setView('create'); soundManager.playClick(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition shrink-0"
            >
              <Plus size={16} /> Create New Game
            </button>
          </div>

          {/* List of Custom Games */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profile.customGames || []).map((game) => (
              <div
                key={game.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-indigo-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {game.targetLevel}
                    </span>
                    <span className="text-xs text-slate-400">{game.questions.length} Questions</span>
                  </div>
                  <h4 className="font-bold text-white text-base font-game">{game.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{game.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => startPlayingGame(game)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                  >
                    <Play size={14} /> Play Quiz
                  </button>
                  <button
                    onClick={() => deleteCustomGame(game.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white font-game">Craft a Custom Maths Game</h3>
              <p className="text-xs text-slate-400">Fill in details or click AI Generator for instant draft questions!</p>
            </div>
            <button
              onClick={handleAiAutoFill}
              disabled={isAiGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Sparkles size={14} />
              {isAiGenerating ? 'Drafting Questions...' : 'Draft with Gemini AI'}
            </button>
          </div>

          {/* Form Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Game Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Lagos Super Market Challenge"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description / Backstory</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Calculate correct change for mama Nkechi's stall"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Class Level</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as SchoolLevel)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {SCHOOL_LEVELS.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Math Topic</label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value as MathTopic)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-indigo-500"
              >
                {MATH_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question List Editor */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-400 font-game">Questions ({questions.length})</h4>
              <button
                onClick={addEmptyQuestion}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                <Plus size={14} /> Add Another Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Question #{qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIdx)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestionField(qIdx, 'question', e.target.value)}
                  placeholder="Enter math problem prompt..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-medium"
                />

                {/* 4 Choices */}
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <input
                      key={optIdx}
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-bold">Exact Correct Answer:</span>
                  <input
                    type="text"
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestionField(qIdx, 'correctAnswer', e.target.value)}
                    placeholder="Must match one of the 4 options above"
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-emerald-600/50 rounded-lg text-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setView('list')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={saveCustomGame}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
            >
              Save Custom Game 💾
            </button>
          </div>
        </div>
      )}

      {view === 'play' && activePlayGame && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {playFinished ? (
            <div className="text-center space-y-5 animate-in fade-in">
              <div className="text-6xl animate-bounce">🏆</div>
              <h3 className="text-2xl font-bold text-white font-game">Custom Game Complete!</h3>
              <p className="text-sm text-slate-300">
                You scored <strong>{playScore} / {activePlayGame.questions.length}</strong> on "{activePlayGame.title}"!
              </p>
              <button
                onClick={() => setView('list')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Back to Custom Studio
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="font-bold text-white font-game">{activePlayGame.title}</span>
                <span>Question {playIdx + 1} of {activePlayGame.questions.length}</span>
              </div>

              <h4 className="text-xl font-bold text-white font-game leading-relaxed">
                {activePlayGame.questions[playIdx].question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePlayGame.questions[playIdx].options.map((opt, i) => {
                  const isSelected = playSelected === opt;
                  const isCorrect = opt === activePlayGame.questions[playIdx].correctAnswer;
                  let style = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200';
                  if (playAnswered) {
                    if (isCorrect) style = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                    else if (isSelected) style = 'bg-rose-600/30 border-rose-400 text-rose-200';
                    else style = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-50';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePlayAnswer(opt)}
                      disabled={playAnswered}
                      className={`p-4 rounded-xl border text-left font-semibold text-sm transition flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {playAnswered && isCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {playAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextPlayQ}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                  >
                    {playIdx + 1 < activePlayGame.questions.length ? 'Next Question →' : 'Finish Quiz 🏁'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
