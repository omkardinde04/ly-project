import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Clock, CheckCircle2, ArrowRight, BarChart2, AlertCircle } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import type { DashboardData } from '../../hooks/useDashboardData';

interface LearningProgressCardProps {
  onNavigate: (tab: string) => void;
  dashboardData: DashboardData;
}

export function LearningProgressCard({ onNavigate, dashboardData }: LearningProgressCardProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const {
    isLoading,
    lessonsCompleted,
    completedToday,
    learningStreak,
    timeSpentThisWeekFormatted,
    weeklyGoalPercent,
    weekActivity,
    maxDayMinutes,
    hasWeekActivity,
  } = dashboardData;

  const metrics = [
    {
      label: 'Lessons Done',
      value: String(lessonsCompleted),
      sub: completedToday > 0 ? `+${completedToday} today` : 'Ready to start',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Streak',
      value: `${learningStreak} ${learningStreak === 1 ? 'Day' : 'Days'}`,
      sub: learningStreak > 0 ? 'Active 🔥' : 'Start streak',
      icon: Flame,
      color: 'text-[#E86F51]',
      bg: 'bg-orange-50 border-orange-100',
    },
    {
      label: 'Time This Week',
      value: timeSpentThisWeekFormatted,
      sub: 'Active sessions',
      icon: Clock,
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50 border-blue-100',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1A202C] leading-none">
                {t.trackProgress || 'Learning Progress'}
              </h2>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Weekly mastery & activity tracking
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
            <BarChart2 size={13} />
            Goal: {weeklyGoalPercent}%
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5 shrink-0">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between hover:border-blue-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#64748B] truncate">{m.label}</span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${m.bg} ${m.color}`}>
                    <Icon size={14} />
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-6 w-12 bg-slate-200 animate-pulse rounded my-1" />
                ) : (
                  <div className="text-lg sm:text-xl font-black text-[#1A202C] leading-tight truncate">
                    {m.value}
                  </div>
                )}
                <div className="text-[10px] font-bold text-slate-400 truncate">{m.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Weekly Activity Visualizer Chart Area */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 mb-5 flex-1 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Weekly Activity (Minutes)
            </span>
            <span className="text-xs font-medium text-[#94A3B8]">Mon – Sun</span>
          </div>

          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2563EB]" />
            </div>
          ) : !hasWeekActivity ? (
            <div className="h-24 flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs font-medium text-[#64748B]">
                No learning activity recorded this week yet.
              </p>
              <span className="text-[11px] text-[#94A3B8] mt-0.5">
                Complete a session to see your progress chart!
              </span>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-24 pt-2 px-1">
              {weekActivity.map((d, index) => {
                // Ensure non-zero sessions have a visible bar height (min 20%, max 100%)
                const heightPercent = d.minutes > 0
                  ? Math.max(20, Math.min(100, Math.round((d.minutes / maxDayMinutes) * 100)))
                  : 0;
                const isHovered = hoveredDay === index;

                return (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer relative h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-10 z-20 px-2.5 py-1 bg-[#1A202C] text-white rounded-lg text-[11px] font-bold shadow-lg whitespace-nowrap pointer-events-none"
                      >
                        {d.day}: {d.minutes > 0 ? `${d.minutes} min` : 'No activity'}
                        {d.lessons > 0 ? ` (${d.lessons} tasks)` : ''}
                      </motion.div>
                    )}

                    {/* Bar Container */}
                    <div className="w-full max-w-[32px] bg-slate-200/60 rounded-lg h-16 flex items-end p-0.5 relative overflow-hidden">
                      {d.minutes > 0 ? (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.5, delay: index * 0.04 }}
                          className={`w-full rounded-md transition-colors ${
                            d.isToday
                              ? 'bg-[#2563EB] shadow-xs'
                              : 'bg-[#60A5FA] group-hover:bg-[#2563EB]'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-1 bg-slate-300/80 rounded-full my-0.5" />
                      )}
                    </div>

                    {/* Day Label */}
                    <span
                      className={`text-[11px] font-bold transition-colors ${
                        d.isToday
                          ? 'text-[#2563EB] underline decoration-2 underline-offset-2'
                          : d.active
                          ? 'text-[#475569]'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Primary CTA Button */}
      <button
        onClick={() => onNavigate('progress')}
        className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 group shrink-0"
      >
        <span>{t.viewProgress || 'View Detailed Progress'}</span>
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
