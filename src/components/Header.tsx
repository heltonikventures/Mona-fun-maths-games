import React, { useState } from 'react';
import { Volume2, VolumeX, Edit3, ShoppingBag, Award, User, Flame, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateLevelInfo } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  profile: UserProfile;
  onOpenScratchpad: () => void;
  onOpenShop: () => void;
  onOpenBadges: () => void;
  onOpenProfile: () => void;
  onOpenInstall?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenScratchpad,
  onOpenShop,
  onOpenBadges,
  onOpenProfile,
  onOpenInstall,
  onGoHome
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(soundManager.isEnabled());
  const levelInfo = calculateLevelInfo(profile.xp);

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundOn(newState);
    if (newState) soundManager.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-indigo-900/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 p-0.5 shadow-md group-hover:rotate-6 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-xl">
              ⭐
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-300 font-game">
                MONA'S MATHS QUEST
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {profile.level}
              </span>
            </div>
            <p className="text-[10px] font-bold text-amber-300 hidden sm:block tracking-wide">
              PLAY • LEARN • BECOME A MATHS HERO!
            </p>
          </div>
        </div>

        {/* Player Stats (Stars, Coins, Sync Status, Streak) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Sync Status (from Mona Maths) */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced</span>
            <span>☁️</span>
          </div>

          {/* Stars Counter (from Mona Maths) */}
          <div 
            className="flex items-center gap-1 bg-yellow-950/50 border border-yellow-500/40 px-2.5 py-1.5 rounded-xl text-yellow-300 font-extrabold text-xs sm:text-sm shadow-xs"
            title={`${profile.stars || 0} Total Adventure Stars`}
          >
            <span className="text-amber-300">⭐</span>
            <span>{profile.stars || 0}</span>
          </div>

          {/* Naira Coins */}
          <button 
            onClick={onOpenShop}
            className="flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-amber-300 font-bold text-xs sm:text-sm shadow-sm transition"
            title="Naira & Gold Coins Bazaar"
          >
            <span className="text-amber-400 font-extrabold">₦</span>
            <span>{profile.nairaCoins.toLocaleString()}</span>
          </button>

          {/* Streak Flame */}
          <div 
            className="hidden sm:flex items-center gap-1 bg-orange-950/50 border border-orange-500/40 px-2.5 py-1.5 rounded-xl text-orange-400 font-bold text-xs sm:text-sm"
            title={`${profile.streak} Day Quest Streak`}
          >
            <Flame size={15} className="text-orange-500 fill-orange-500" />
            <span>{profile.streak}d</span>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Scratchpad */}
            <button
              onClick={onOpenScratchpad}
              className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 border border-slate-700 text-slate-300 transition"
              title="Open Calculation Scratchpad"
            >
              <Edit3 size={17} />
            </button>

            {/* Shop */}
            <button
              onClick={onOpenShop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950 hover:text-amber-300 border border-slate-700 text-slate-300 transition"
              title="Open Quest Shop"
            >
              <ShoppingBag size={17} />
            </button>

            {/* Badges */}
            <button
              onClick={onOpenBadges}
              className="p-2 rounded-xl bg-slate-800 hover:bg-yellow-950 hover:text-yellow-300 border border-slate-700 text-slate-300 transition relative"
              title="View Trophies & Badges"
            >
              <Award size={17} />
              {profile.badges.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {profile.badges.length}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              title={soundOn ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundOn ? <Volume2 size={17} className="text-emerald-400" /> : <VolumeX size={17} className="text-slate-500" />}
            </button>

            {/* Install on Android Button */}
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition hover:scale-105 active:scale-95 cursor-pointer"
                title="Install Maths Quest on your Android Phone (Web App / APK)"
              >
                <span className="text-sm">📱</span>
                <span className="hidden md:inline font-bold">Install on Android</span>
                <span className="md:hidden font-bold">Install</span>
              </button>
            )}

            {/* Learning Dashboard Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-bold text-xs transition"
              title="Open Learning Dashboard & XP Growth Chart"
            >
              <span className="text-sm">📊</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-600/50 rounded-xl transition"
              title="Manage Profile & Class Level"
            >
              <span className="text-lg">{profile.avatar}</span>
              <span className="text-xs font-bold text-slate-200 hidden md:inline-block max-w-[70px] truncate">
                {profile.name}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
