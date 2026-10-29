/**
 * MATHS QUEST – Learn Maths Through Games
 * Interactive educational mathematics platform with Nigerian curriculum & culture
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, Sparkles, BookOpen, Flame, Award, ShoppingBag, 
  Map, Zap, Compass, Target, Scissors, Puzzle, DoorOpen, 
  Skull, Calendar, PlusCircle, Filter, CheckCircle2, ChevronRight 
} from 'lucide-react';

import { UserProfile, SchoolLevel, MathTopic, Difficulty, GameModeId, Question } from './types';
import { SCHOOL_LEVELS, MATH_TOPICS } from './data/curriculum';
import { loadProfile, saveProfile, calculateLevelInfo } from './utils/storage';
import { soundManager } from './utils/audio';

import { Header } from './components/Header';
import { ScratchpadModal } from './components/ScratchpadModal';
import { AITutorModal } from './components/AITutorModal';
import { QuestShopModal } from './components/QuestShopModal';
import { ProfileModal } from './components/ProfileModal';
import { BadgesModal } from './components/BadgesModal';
import { LearningDashboard } from './components/LearningDashboard';

// Game Mode Components
import { MathsAdventure } from './components/games/MathsAdventure';
import { SpeedChallenge } from './components/games/SpeedChallenge';
import { TreasureHunt } from './components/games/TreasureHunt';
import { MathsBasketball } from './components/games/MathsBasketball';
import { NumberNinja } from './components/games/NumberNinja';
import { MathsPuzzle } from './components/games/MathsPuzzle';
import { EscapeClassroom } from './components/games/EscapeClassroom';
import { BossBattle } from './components/games/BossBattle';
import { DailyChallenge } from './components/games/DailyChallenge';
import { BuildYourOwnGame } from './components/games/BuildYourOwnGame';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [activeGame, setActiveGame] = useState<GameModeId | null>(null);

  // Filter selections for curriculum practice
  const [selectedTopic, setSelectedTopic] = useState<MathTopic>('Money & Naira Maths');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

  // Modals state
  const [scratchpadOpen, setScratchpadOpen] = useState<boolean>(false);
  const [shopOpen, setShopOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [badgesOpen, setBadgesOpen] = useState<boolean>(false);

  // AI Tutor Modal
  const [tutorOpen, setTutorOpen] = useState<boolean>(false);
  const [tutorQuestion, setTutorQuestion] = useState<Question | null>(null);
  const [tutorStudentAnswer, setTutorStudentAnswer] = useState<string | null>(null);

  useEffect(() => {
    soundManager.init();
  }, []);

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);
  };

  const openTutorForQuestion = (q: Question, studentAns: string | null) => {
    soundManager.playClick();
    setTutorQuestion(q);
    setTutorStudentAnswer(studentAns);
    setTutorOpen(true);
  };

  const handleSelectGame = (gameId: GameModeId) => {
    soundManager.playClick();
    setActiveGame(gameId);
  };

  const levelInfo = calculateLevelInfo(profile.xp);

  const GAME_MODES = [
    {
      id: 'adventure' as GameModeId,
      title: 'Maths Adventure',
      tagline: 'Journey Through Nigeria',
      description: 'Conquer Balogun Market, Olumo Rock, Zuma Rock, & National Stadium!',
      icon: '🗺️',
      color: 'from-amber-500 to-orange-600',
      badge: 'Story Quest',
      highlight: true
    },
    {
      id: 'speed' as GameModeId,
      title: 'Speed Challenge',
      tagline: '60-Second Blitz',
      description: 'Rapid-fire math reflexes! Chain correct answers for 5x FIRE COMBOS!',
      icon: '⚡',
      color: 'from-amber-600 to-red-600',
      badge: 'Rapid Fire'
    },
    {
      id: 'treasure' as GameModeId,
      title: 'Treasure Hunt',
      tagline: 'Nok Mystery Grid',
      description: 'Dig hidden island tiles, solve math locks, and find the ancient Golden Crown!',
      icon: '🗝️',
      color: 'from-emerald-600 to-teal-700',
      badge: 'Exploration'
    },
    {
      id: 'basketball' as GameModeId,
      title: 'Maths Basketball',
      tagline: 'Shootout Arena',
      description: 'Aim and shoot the ball into the correct math hoop! Swish streaks!',
      icon: '🏀',
      color: 'from-orange-500 to-amber-600',
      badge: 'Sports Arcade'
    },
    {
      id: 'ninja' as GameModeId,
      title: 'Number Ninja',
      tagline: 'Dojo Blade Slicer',
      description: 'Slash floating target numbers, dodge exploding bombs, test your reflexes!',
      icon: '⚔️',
      color: 'from-rose-600 to-red-700',
      badge: 'Action Slicer'
    },
    {
      id: 'puzzle' as GameModeId,
      title: 'Maths Puzzle',
      tagline: 'Brain Teasers',
      description: 'Number bond pyramids, missing operational signs, and magic matrices!',
      icon: '🧩',
      color: 'from-indigo-600 to-purple-700',
      badge: 'Logic & IQ'
    },
    {
      id: 'escape' as GameModeId,
      title: 'Escape the Classroom',
      tagline: 'Unity High Mystery',
      description: 'Crack 4 interactive classroom clues before the school assembly bell!',
      icon: '🚪',
      color: 'from-cyan-600 to-blue-700',
      badge: 'Room Escape'
    },
    {
      id: 'boss' as GameModeId,
      title: 'Boss Battle',
      tagline: 'Monster Showdown',
      description: 'Cast Naira Lightning and shields to defeat Fraction Phantom and Algebraic Dragon!',
      icon: '🐉',
      color: 'from-purple-700 to-rose-800',
      badge: 'Boss Combat'
    },
    {
      id: 'daily' as GameModeId,
      title: 'Daily Challenge',
      tagline: 'Quest of the Day',
      description: 'Keep your streak burning with today\'s 5 curated problems for +500 XP!',
      icon: '📅',
      color: 'from-amber-600 to-yellow-600',
      badge: 'Daily Streak'
    },
    {
      id: 'builder' as GameModeId,
      title: 'Build Your Own Game',
      tagline: 'Custom Studio',
      description: 'Create custom quizzes with AI assistance and challenge your classmates!',
      icon: '🛠️',
      color: 'from-indigo-700 to-violet-800',
      badge: 'Creator Lab'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sticky Global Navigation */}
      <Header
        profile={profile}
        onOpenScratchpad={() => setScratchpadOpen(true)}
        onOpenShop={() => setShopOpen(true)}
        onOpenBadges={() => setBadgesOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onGoHome={() => setActiveGame(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeGame === 'adventure' && (
          <MathsAdventure
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenTutor={openTutorForQuestion}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'speed' && (
          <SpeedChallenge
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'treasure' && (
          <TreasureHunt
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenTutor={openTutorForQuestion}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'basketball' && (
          <MathsBasketball
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenTutor={openTutorForQuestion}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'ninja' && (
          <NumberNinja
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'puzzle' && (
          <MathsPuzzle
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'escape' && (
          <EscapeClassroom
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'boss' && (
          <BossBattle
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenTutor={openTutorForQuestion}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'daily' && (
          <DailyChallenge
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenTutor={openTutorForQuestion}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {activeGame === 'builder' && (
          <BuildYourOwnGame
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBackToMenu={() => setActiveGame(null)}
            onOpenScratchpad={() => setScratchpadOpen(true)}
          />
        )}

        {/* Dashboard Hub View */}
        {activeGame === null && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-700/50 p-6 sm:p-8 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold mb-3">
                  <span className="text-base">⭐</span>
                  <span>Mona's Maths Adventure • {profile.level} Global & Nigerian Edition</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-game leading-tight">
                  Play, Learn & Become a Maths Hero with Mona!
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                  Conquer Mona's Adventure Islands (Addition Island, Subtraction Forest, Multiplication Mountain) alongside Nigerian Landmark Quests (Balogun Market, Zuma Rock, National Stadium) with instant AI step-by-step coaching.
                </p>

                {/* Quick CTA Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => handleSelectGame('adventure')}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm shadow-xl hover:scale-102 active:scale-98 transition"
                  >
                    <Play size={18} className="fill-slate-950" /> Start Quest Adventure
                  </button>
                  <button
                    onClick={() => handleSelectGame('daily')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm shadow-md transition"
                  >
                    <Flame size={17} className="text-orange-500 fill-orange-500" /> Today's Daily Quest
                  </button>
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-600/50 text-indigo-200 font-bold text-sm transition"
                  >
                    <span>📊 Learning Dashboard</span>
                  </button>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute right-4 bottom-2 text-8xl sm:text-9xl opacity-20 select-none pointer-events-none hidden sm:block">
                🦅
              </div>
            </div>

            {/* Visual Learning Dashboard & XP Growth (Visible directly on home preview) */}
            <div className="bg-slate-900/60 border border-indigo-900/50 rounded-3xl p-5 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 rounded-xl bg-indigo-950 border border-indigo-800">📊</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white font-game flex items-center gap-2">
                      <span>Learning Dashboard & XP Growth</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Recharts Live
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Real-time performance tracker and XP growth trajectory across learning sessions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-300 text-xs font-bold transition"
                >
                  <span>Class Settings</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <LearningDashboard profile={profile} />
            </div>

            {/* Quick Practice Filter Bar */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Curriculum Level:
                </span>
                <button
                  onClick={() => setProfileOpen(true)}
                  className="px-3 py-1 rounded-xl bg-indigo-600/30 border border-indigo-400 text-indigo-300 text-xs font-bold hover:bg-indigo-600/50 transition flex items-center gap-1"
                >
                  <span>{profile.level}</span>
                  <span className="text-[10px] text-indigo-200">Change ✏️</span>
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold">Difficulty:</span>
                {(['Easy', 'Medium', 'Hard', 'Genius'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDifficulty(d); soundManager.playClick(); }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      difficulty === d
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* 10 Game Modes Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-game">
                    Choose Your Game Mode (10 Modes)
                  </h2>
                  <p className="text-xs text-slate-400">Playable mechanics with instant answer checking & rewards</p>
                </div>
                <div className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-600/40 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>AI Powered + Offline Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {GAME_MODES.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleSelectGame(game.id)}
                    className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/50 overflow-hidden"
                  >
                    {/* Top Tag & Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl p-2 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner group-hover:scale-110 transition">
                          {game.icon}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 group-hover:bg-indigo-950 group-hover:text-indigo-300 group-hover:border-indigo-700 transition">
                          {game.badge}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white font-game group-hover:text-amber-400 transition">
                        {game.title}
                      </h3>
                      <div className="text-[11px] font-semibold text-indigo-400 mb-1.5">
                        {game.tagline}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {game.description}
                      </p>
                    </div>

                    {/* Bottom Play action */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition">
                        Play Mode
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-amber-500 flex items-center justify-center text-slate-300 group-hover:text-slate-950 transition">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maths Curriculum Topic Grid Exploration */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-game">
                    Browse All Curriculum Topics
                  </h3>
                  <p className="text-xs text-slate-400">Targeted revision matching NERDC Nigerian educational syllabus</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {MATH_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic.id);
                      soundManager.playClick();
                      handleSelectGame('speed');
                    }}
                    className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 text-left transition flex flex-col justify-between group"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition">{topic.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate w-full">
                        {topic.id}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {topic.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Teacher Folake Helper Shortcut */}
      <button
        onClick={() => openTutorForQuestion(
          {
            question: "How do I solve maths word problems involving Naira and everyday market calculations?",
            options: [],
            correctAnswer: "Break the problem down step-by-step and write out the values clearly.",
            explanation: "Always identify the given amounts, determine whether to add, subtract, multiply, or divide, and double-check your arithmetic.",
            hint: "Take it one step at a time!"
          },
          null
        )}
        className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition"
      >
        <span className="text-lg">👩🏾‍🏫</span>
        <span className="hidden sm:inline">Ask Teacher Folake</span>
      </button>

      {/* Interactive Global Modals */}
      <ScratchpadModal
        isOpen={scratchpadOpen}
        onClose={() => setScratchpadOpen(false)}
      />

      <QuestShopModal
        isOpen={shopOpen}
        onClose={() => setShopOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      <BadgesModal
        isOpen={badgesOpen}
        onClose={() => setBadgesOpen(false)}
        unlockedBadgeIds={profile.badges}
      />

      <AITutorModal
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        question={tutorQuestion}
        studentAnswer={tutorStudentAnswer}
        level={profile.level}
      />
    </div>
  );
}
