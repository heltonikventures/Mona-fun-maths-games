import React from 'react';
import { 
  TrendingUp, Sparkles, CheckCircle, Flame, Award, 
  ArrowUpRight, BarChart3, HelpCircle, Target 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

import { UserProfile } from '../types';
import { calculateLevelInfo, getInitialXpHistory } from '../utils/storage';

interface LearningDashboardProps {
  profile: UserProfile;
  compact?: boolean;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({ profile, compact = false }) => {
  const levelInfo = calculateLevelInfo(profile.xp);

  // Prepare chart data from profile history
  const chartData = (profile.xpHistory && profile.xpHistory.length > 0)
    ? profile.xpHistory
    : getInitialXpHistory();

  const firstXp = chartData[0]?.xp || 0;
  const currentTotalXp = profile.xp;
  const xpGainedRecent = Math.max(0, currentTotalXp - firstXp);
  const totalQuestionsSolved = chartData[chartData.length - 1]?.questionsSolved || Math.round(profile.xp / 5);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-indigo-500/50 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs z-50">
          <p className="font-bold text-white font-game mb-1.5 flex items-center justify-between gap-3">
            <span>{data.date}</span>
            <span className="text-[10px] text-indigo-400 font-mono">Recorded</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-slate-300">Total Experience:</span>
            <span className="font-extrabold text-indigo-300 font-mono">{data.xp} XP</span>
          </div>
          {data.questionsSolved !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Questions Solved:</span>
              <span className="font-extrabold text-emerald-300 font-mono">{data.questionsSolved}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 w-full">
      {/* 4 Quick Stat Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Total XP</span>
            <Sparkles size={13} className="text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">
            {profile.xp}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-medium">
            <ArrowUpRight size={11} /> +{xpGainedRecent} XP recent
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Questions Solved</span>
            <CheckCircle size={13} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">
            {totalQuestionsSolved}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            100% Verified Answers
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Day Streak</span>
            <Flame size={13} className="text-orange-400 fill-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1 font-mono">
            {profile.streak}d
          </div>
          <div className="text-[10px] text-amber-300 mt-0.5">
            Active Study Flame
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Naira Coins</span>
            <span className="text-amber-400 font-extrabold">₦</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1 font-mono">
            ₦{profile.nairaCoins.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Earned via Quests
          </div>
        </div>
      </div>

      {/* Visual XP Growth Chart Card */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp size={18} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white font-game flex items-center gap-2">
                <span>XP Growth Over Time</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Track
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Continuous progression curve across math topics and challenge modes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/60">
              Curriculum: {profile.level}
            </span>
          </div>
        </div>

        {/* Recharts Area / Line Chart with explicit minHeight & initialDimension */}
        <div 
          className="w-full pt-3" 
          style={{ width: '100%', height: compact ? 190 : 230, minHeight: compact ? 190 : 230 }}
        >
          <ResponsiveContainer 
            width="100%" 
            height="100%"
            minWidth={280}
            minHeight={compact ? 190 : 230}
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashboardXpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="#818cf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#dashboardXpGradient)"
              />
              <Line
                type="monotone"
                dataKey="xp"
                stroke="#a5b4fc"
                strokeWidth={2}
                dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Level Progress Bar Banner */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-300">
          <span className="font-bold text-indigo-400 flex items-center gap-1.5">
            <Award size={15} /> Level {levelInfo.levelNum} Progress
          </span>
          <span className="font-bold text-white font-mono">{profile.xp} / {levelInfo.nextLevelXP} XP</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Current Rank: <strong className="text-slate-200">{levelInfo.title}</strong></span>
          <span className="font-mono">{levelInfo.nextLevelXP - profile.xp} XP to rank up</span>
        </div>
      </div>
    </div>
  );
};
