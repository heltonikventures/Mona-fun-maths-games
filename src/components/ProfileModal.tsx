import React, { useState } from 'react';
import { 
  X, GraduationCap, RotateCcw, Download, BarChart3 
} from 'lucide-react';

import { UserProfile, SchoolLevel } from '../types';
import { SCHOOL_LEVELS } from '../data/curriculum';
import { saveProfile, DEFAULT_PROFILE } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { LearningDashboard } from './LearningDashboard';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  initialTab?: 'dashboard' | 'settings';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  initialTab = 'dashboard'
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>(initialTab);
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<SchoolLevel>(profile.level);

  if (!isOpen) return null;

  const handleSave = () => {
    soundManager.playCorrect();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Learner',
      level
    };
    onUpdateProfile(updated);
    saveProfile(updated);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your local progress to beginner?')) {
      onUpdateProfile(DEFAULT_PROFILE);
      saveProfile(DEFAULT_PROFILE);
      onClose();
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mathsquest_save_${profile.name.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-800 via-purple-900 to-slate-900 border-b border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/90 flex items-center justify-center text-3xl border border-indigo-400/40 shadow-inner">
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-game">{profile.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-bold text-indigo-200">
                  {profile.level}
                </span>
              </div>
              <p className="text-xs text-indigo-200">Personal Mathematics Performance & Growth Profile</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-indigo-800/60 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2">
          <button
            onClick={() => { setActiveTab('dashboard'); soundManager.playClick(); }}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={15} />
            <span>Learning Dashboard</span>
          </button>
          <button
            onClick={() => { setActiveTab('settings'); soundManager.playClick(); }}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap size={15} />
            <span>Class & Profile Settings</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'dashboard' ? (
            /* Embedded Learning Dashboard with Recharts */
            <LearningDashboard profile={profile} />
          ) : (
            /* Profile & Class Settings Tab */
            <div className="space-y-5">
              {/* Edit Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Learner Name / Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium text-sm focus:outline-hidden focus:border-indigo-500 transition"
                  placeholder="e.g. Chinedu, Amina, Tolu"
                />
              </div>

              {/* School Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Class / School Level (Nigerian Curriculum)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SCHOOL_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setLevel(lvl.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left flex flex-col ${
                        level === lvl.id
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-white">{lvl.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{lvl.ageRange}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Backup & Reset Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 transition py-1"
                >
                  <Download size={14} /> Export Progress JSON
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition py-1"
                >
                  <RotateCcw size={14} /> Reset Progress
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-t border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {activeTab === 'dashboard' ? 'Tracking real-time mathematical progress' : 'Curriculum changes take effect immediately'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition"
            >
              Close
            </button>
            {activeTab === 'settings' && (
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
