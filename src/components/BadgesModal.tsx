import React from 'react';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';
import { BADGES } from '../data/curriculum';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds: string[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  unlockedBadgeIds
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-yellow-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-yellow-700 via-amber-800 to-yellow-900 border-b border-yellow-600/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-600/50 flex items-center justify-center text-2xl border border-yellow-300/40">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-game">Trophies & Badges</h3>
              <p className="text-xs text-yellow-200">
                {unlockedBadgeIds.length} of {BADGES.length} Badges Unlocked
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-yellow-200 hover:text-white rounded-lg hover:bg-yellow-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Badge Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES.map((b) => {
              const isUnlocked = unlockedBadgeIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                    isUnlocked
                      ? 'bg-slate-800/90 border-yellow-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-yellow-500/20 border border-yellow-400/40' : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}>
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className={`font-bold text-xs truncate ${isUnlocked ? 'text-yellow-300' : 'text-slate-400'}`}>
                        {b.title}
                      </h5>
                      {isUnlocked ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Lock size={12} className="text-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                      {b.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
