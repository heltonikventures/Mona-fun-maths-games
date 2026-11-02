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
  Copy,
  Check,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import {
  fetchTopScores,
  CloudScore,
  saveLearnerBackupToFirestore,
  restoreLearnerBackupFromFirestore,
  getOrCreateCloudSyncCode,
} from '../firebase/db';
import { CANONICAL_INSTALL_URL } from './InstallAndroidModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  initialTab?: 'backup' | 'google' | 'leaderboard';
  onProfileRestored?: (profile: UserProfile) => void;
}

function formatFriendlyError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const rawMsg = err.message || String(err);
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed.error) {
      if (parsed.error.includes('Missing or insufficient permissions')) {
        return 'Cloud permission check failed. Please ensure your cloud sync code is valid.';
      }
      if (parsed.error.includes('offline') || parsed.error.includes('unavailable')) {
        return 'Network is offline. Your progress is saved locally and will sync once internet is reconnected.';
      }
      return parsed.error;
    }
  } catch {
    // Not JSON
  }
  if (err.code === 'auth/unauthorized-domain') {
    return 'This web domain is awaiting authorization in Firebase Console. You can still back up and restore 100% of your progress on any phone or laptop using the Cloud Sync Code tab below!';
  }
  if (err.code === 'auth/popup-blocked') {
    return 'Browser blocked the login popup. Please allow pop-ups for this site, or open Maths Quest in a direct browser tab.';
  }
  if (err.code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was cancelled before completion.';
  }
  if (err.code === 'auth/network-request-failed') {
    return 'Network connection failed. Please check your internet connection.';
  }
  return rawMsg;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  profile,
  initialTab = 'backup',
  onProfileRestored,
}) => {
  const { user, loginWithGoogle, logout, syncProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'backup' | 'google' | 'leaderboard'>(initialTab);
  const [leaderboard, setLeaderboard] = useState<CloudScore[]>([]);
  const [loadingScores, setLoadingScores] = useState<boolean>(false);
  const [syncCode, setSyncCode] = useState<string>(() =>
    getOrCreateCloudSyncCode(profile.name)
  );
  const [inputCode, setInputCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSyncCode(getOrCreateCloudSyncCode(profile.name));
      setErrorMsg(null);
      setBackupSuccess(null);
      setRestoreSuccess(null);
    }
  }, [isOpen, initialTab, profile.name]);

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

  // 1-Click Instant Cloud Backup to Firestore
  const handleInstantCloudBackup = async () => {
    setBackupLoading(true);
    setErrorMsg(null);
    setBackupSuccess(null);
    try {
      const res = await saveLearnerBackupToFirestore(profile, syncCode);
      await syncProfile(profile);
      setBackupSuccess(`Successfully saved to Firestore cloud at ${new Date(res.timestamp).toLocaleTimeString()}!`);
      setTimeout(() => setBackupSuccess(null), 6000);
    } catch (err: any) {
      console.error('Instant cloud backup error:', err);
      setErrorMsg(formatFriendlyError(err));
    } finally {
      setBackupLoading(false);
    }
  };

  // Restore Progress from Cloud Sync Code
  const handleRestoreFromCode = async () => {
    const codeToRestore = inputCode.trim().toUpperCase();
    if (!codeToRestore) return;

    setRestoreLoading(true);
    setErrorMsg(null);
    setRestoreSuccess(null);
    try {
      const restored = await restoreLearnerBackupFromFirestore(codeToRestore);
      if (restored) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mathsquest_profile_v2', JSON.stringify(restored));
        }
        if (onProfileRestored) {
          onProfileRestored(restored);
        }
        setRestoreSuccess(`Restored "${restored.name}" (${restored.xp.toLocaleString()} XP, ₦${restored.nairaCoins.toLocaleString()})! Reloading...`);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 1200);
      } else {
        setErrorMsg(`No cloud backup found for code "${codeToRestore}". Please check the spelling.`);
      }
    } catch (err: any) {
      setErrorMsg(formatFriendlyError(err));
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleCopySyncCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(syncCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(formatFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err: any) {
      setErrorMsg(formatFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl shadow-indigo-950/70 text-white p-5 sm:p-7 overflow-hidden flex flex-col max-h-[92vh]">
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
            {user ? '👑' : '☁️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Cloud Database Active
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firestore Online
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Cloud Backup & Login
            </h2>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud size={14} />
            <span>Cloud Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Google Account</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy size={14} />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Tab 1: Instant Cloud Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
            {/* Quick Backup Action Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-400" />
                    1-Click Cloud Database Save
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Saves all XP, Naira coins, adventure stages & badges to Firestore.
                  </p>
                </div>
              </div>

              {/* Progress Summary Pills */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                  <p className="text-[10px] text-slate-400">Total XP</p>
                  <p className="font-black text-amber-300 text-sm">{profile.xp.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                  <p className="text-[10px] text-slate-400">Naira Coins</p>
                  <p className="font-black text-emerald-400 text-sm">₦{profile.nairaCoins.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                  <p className="text-[10px] text-slate-400">Stars</p>
                  <p className="font-black text-yellow-400 text-sm">⭐ {profile.stars || 0}</p>
                </div>
              </div>

              {backupSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{backupSuccess}</span>
                </div>
              )}

              <button
                onClick={handleInstantCloudBackup}
                disabled={backupLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {backupLoading ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Back Up My Progress to Cloud Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Learner Cloud Sync Code */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound size={13} className="text-amber-400" /> Your Cloud Sync Code:
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Device Key
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={syncCode}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-300 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopySyncCode}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Save this code! You can use it on any Android phone, tablet, or laptop to restore your exact progress.
              </p>
            </div>

            {/* Restore from Sync Code */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Download size={13} className="text-indigo-400" /> Restore From Another Device:
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Cloud Sync Code (e.g. MQ-HERO-1234)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 uppercase focus:outline-none"
                />
                <button
                  onClick={handleRestoreFromCode}
                  disabled={restoreLoading || !inputCode.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  {restoreLoading ? <RefreshCw size={13} className="animate-spin" /> : <span>Restore</span>}
                </button>
              </div>
              {restoreSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 mt-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{restoreSuccess}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Google Account Login */}
        {activeTab === 'google' && (
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
                      Google Account Connected
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Cloud size={14} className="text-indigo-400" /> Auto-Sync Active
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      /users/{user.uid.slice(0, 6)}...
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Your levels, coins, and leaderboard scores are automatically synced to your Google Account document in Firestore.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out of Google Account</span>
                </button>
              </div>
            ) : (
              /* Signed Out State */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                  <h3 className="font-bold text-sm text-indigo-200 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-400" />
                    Sign In with Google
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connect your Google account to automatically preserve your coins, levels, and rank across devices forever.
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleLogin}
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

                {/* Open in Direct Browser for iframe compatibility */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between gap-2">
                  <span className="text-slate-400">If popup is blocked in preview:</span>
                  <a
                    href={CANONICAL_INSTALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 underline"
                  >
                    <span>Open in Direct Tab</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Global Leaderboard */}
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
