import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Trophy,
  Cloud,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Flame,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { fetchTopScores, CloudScore } from '../firebase/db';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { user, loginWithGoogle, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'leaderboard'>('account');
  const [leaderboard, setLeaderboard] = useState<CloudScore[]>([]);
  const [loadingScores, setLoadingScores] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && activeTab === 'leaderboard') {
      setLoadingScores(true);
      fetchTopScores(10)
        .then((scores) => {
          setLeaderboard(scores);
        })
        .catch((err) => console.warn('Could not load leaderboard:', err))
        .finally(() => setLoadingScores(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login was not completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl shadow-indigo-950/70 text-white p-5 sm:p-7 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg ring-2 ring-indigo-400/30 shrink-0">
            {user ? '👑' : '🔐'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Cloud Database & Auth
              </span>
              {user && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {user ? 'Learner Account & Cloud Sync' : 'Sign In to Maths Quest'}
            </h2>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Account & Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={14} />
            <span>Global Leaderboard</span>
          </button>
        </div>

        {/* Tab 1: Account & Login */}
        {activeTab === 'account' && (
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
            {user ? (
              /* Signed In State */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Profile'}
                      className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-xl font-bold text-white">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-white text-sm truncate">
                        {user.displayName || profile.name}
                      </p>
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-xs text-emerald-200/80 truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      UID: <span className="font-mono text-slate-300">{user.uid.slice(0, 10)}...</span>
                    </p>
                  </div>
                </div>

                {/* Cloud Sync Stats Card */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Cloud size={14} className="text-indigo-400" /> Cloud Backup Status
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Live Firestore Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Total XP</p>
                      <p className="font-black text-amber-300 text-sm">{profile.xp.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Naira Coins</p>
                      <p className="font-black text-emerald-400 text-sm">₦{profile.nairaCoins.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700">
                      <p className="text-[10px] text-slate-400">Stars</p>
                      <p className="font-black text-yellow-400 text-sm">⭐ {profile.stars || 0}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your learning stats, unlocked badges ({profile.badges.length}), and purchased items are safely saved in the cloud. You can switch devices anytime and keep playing!
                  </p>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            ) : (
              /* Guest / Not Logged In State */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <h3 className="font-bold text-sm text-indigo-200 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-400" />
                    Why Sign In with Google?
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><strong>Save Progress Forever:</strong> Never lose your XP, coins, and levels when clearing cookies or updating your phone.</li>
                    <li><strong>Cross-Device Play:</strong> Play on your computer at school and continue on Android phone at home.</li>
                    <li><strong>Global Leaderboard:</strong> Compete with other learners across Nigeria and the world!</li>
                  </ul>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Google Sign In Button */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  🔒 Safe & secure authentication powered by Google Firebase. Zero passwords to remember!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Global Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Top Math Champions</span>
              <span>Cloud Firestore Live</span>
            </div>

            {loadingScores ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading live scores from Firebase...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-2xl">🏆</p>
                <p className="text-sm font-bold text-white">Be the First on the Leaderboard!</p>
                <p className="text-xs text-slate-400">
                  Play Speed Challenge, Maths Basketball, or Treasure Hunt while signed in to submit your high score!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.scoreId || index}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                      index === 0
                        ? 'bg-amber-950/40 border-amber-500/40'
                        : index === 1
                        ? 'bg-slate-800/80 border-slate-600'
                        : index === 2
                        ? 'bg-amber-900/30 border-amber-700/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-slate-200">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <p className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                          <span>{item.userAvatar || '⭐'}</span>
                          <span>{item.userName}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.gameMode} • {item.level}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-emerald-400 text-sm">
                        {item.score.toLocaleString()} pts
                      </p>
                      <p className="text-[10px] text-amber-300">
                        +{item.xpEarned} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
