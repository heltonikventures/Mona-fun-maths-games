import React from 'react';
import { X, ShoppingBag, Shield, Clock, HelpCircle, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { AVATARS } from '../data/curriculum';
import { saveProfile } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface QuestShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const QuestShopModal: React.FC<QuestShopModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  if (!isOpen) return null;

  const buyAvatar = (avatarId: string, cost: number, emoji: string) => {
    if (profile.nairaCoins < cost) {
      soundManager.playWrong();
      return;
    }
    soundManager.playCorrect();
    const updated: UserProfile = {
      ...profile,
      nairaCoins: profile.nairaCoins - cost,
      unlockedAvatars: [...profile.unlockedAvatars, avatarId],
      avatar: emoji
    };
    onUpdateProfile(updated);
    saveProfile(updated);
  };

  const equipAvatar = (emoji: string) => {
    soundManager.playClick();
    const updated: UserProfile = {
      ...profile,
      avatar: emoji
    };
    onUpdateProfile(updated);
    saveProfile(updated);
  };

  const buyPowerup = (type: 'fiftyFifty' | 'extraTime' | 'shield', cost: number) => {
    if (profile.nairaCoins < cost) {
      soundManager.playWrong();
      return;
    }
    soundManager.playCorrect();
    const updated: UserProfile = {
      ...profile,
      nairaCoins: profile.nairaCoins - cost,
      unlockedPowerups: {
        ...profile.unlockedPowerups,
        [type]: profile.unlockedPowerups[type] + 1
      }
    };
    onUpdateProfile(updated);
    saveProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 border-b border-amber-600/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600/50 flex items-center justify-center text-2xl border border-amber-300/40">
              🛒
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-game">Naira Quest Bazaar</h3>
              <p className="text-xs text-amber-200">Unlock fresh avatars & game boosts with your earned coins!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-amber-400/30 text-amber-300 font-bold text-sm">
              <span>₦</span>
              <span>{profile.nairaCoins.toLocaleString()}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-amber-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Shop Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Power-ups Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧪</span>
              <h4 className="text-base font-bold text-amber-400 font-game">Game Power-Up Potions</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 50/50 */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <HelpCircle size={22} />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
                      Owned: {profile.unlockedPowerups.fiftyFifty}
                    </span>
                  </div>
                  <h5 className="font-bold text-white mt-2 text-sm">50/50 Eliminator</h5>
                  <p className="text-xs text-slate-400 mt-1">Removes two incorrect multiple choice options in a snap!</p>
                </div>
                <button
                  onClick={() => buyPowerup('fiftyFifty', 100)}
                  disabled={profile.nairaCoins < 100}
                  className="mt-4 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  Buy for ₦100
                </button>
              </div>

              {/* Extra Time */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                      <Clock size={22} />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700">
                      Owned: {profile.unlockedPowerups.extraTime}
                    </span>
                  </div>
                  <h5 className="font-bold text-white mt-2 text-sm">Chronos Freeze</h5>
                  <p className="text-xs text-slate-400 mt-1">Adds +15 seconds in Speed Challenge & Escape Classroom!</p>
                </div>
                <button
                  onClick={() => buyPowerup('extraTime', 150)}
                  disabled={profile.nairaCoins < 150}
                  className="mt-4 w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  Buy for ₦150
                </button>
              </div>

              {/* Shield */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Shield size={22} />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                      Owned: {profile.unlockedPowerups.shield}
                    </span>
                  </div>
                  <h5 className="font-bold text-white mt-2 text-sm">Aegis Math Shield</h5>
                  <p className="text-xs text-slate-400 mt-1">Blocks 1 wrong answer strike or Boss counter-attack!</p>
                </div>
                <button
                  onClick={() => buyPowerup('shield', 200)}
                  disabled={profile.nairaCoins < 200}
                  className="mt-4 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                >
                  Buy for ₦200
                </button>
              </div>
            </div>
          </div>

          {/* Avatars Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎭</span>
              <h4 className="text-base font-bold text-amber-400 font-game">Quest Champion Avatars</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AVATARS.map((av) => {
                const isUnlocked = profile.unlockedAvatars.includes(av.id) || av.cost === 0;
                const isEquipped = profile.avatar === av.emoji;

                return (
                  <div
                    key={av.id}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                      isEquipped 
                        ? 'bg-amber-950/40 border-amber-500 shadow-md' 
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="text-4xl my-2 p-2 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-inner">
                      {av.emoji}
                    </div>
                    <div className="font-bold text-white text-xs mt-1 truncate w-full">{av.name}</div>
                    
                    <div className="mt-3 w-full">
                      {isEquipped ? (
                        <div className="py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1">
                          <Check size={12} /> Equipped
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => equipAvatar(av.emoji)}
                          className="w-full py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold transition"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          onClick={() => buyAvatar(av.id, av.cost, av.emoji)}
                          disabled={profile.nairaCoins < av.cost}
                          className="w-full py-1 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <span>₦{av.cost}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
