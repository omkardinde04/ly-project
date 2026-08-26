import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Sparkles, CheckCircle, ArrowRight, Layers, Trophy } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import type { DashboardData } from '../../hooks/useDashboardData';

interface ContinueLearningCardProps {
  onNavigate: (tab: string) => void;
  dashboardData: DashboardData;
}

export function ContinueLearningCard({ onNavigate, dashboardData }: ContinueLearningCardProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const { activeModule, isLoading } = dashboardData;

  const handleContinue = () => {
    onNavigate('progress');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-sm hover:border-blue-200 transition-all"
    >
      <div className="flex-1 flex flex-col">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
            <Sparkles size={12} className="text-[#2563EB]" />
            Recommended Next Step
          </span>
          <span className="text-xs font-bold text-[#64748B] bg-slate-100 px-2.5 py-0.5 rounded-full">
            Unit {activeModule.moduleNumber}
          </span>
        </div>

        {/* Title & Category */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-1">
            <Layers size={13} className="text-[#2563EB]" />
            <span>
              Module {activeModule.moduleNumber} of {activeModule.totalModules} · {activeModule.construct}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A202C] leading-snug">
            {activeModule.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
            {activeModule.description}
          </p>
        </div>

        {/* Progress Card Section */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 mb-4 shrink-0">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#1A202C]">Module Mastery</span>
            <span className="text-[#2563EB]">{activeModule.completionPercent}% complete</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden mb-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${activeModule.completionPercent}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full"
            />
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium">
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-[#94A3B8]" />
              <span>{activeModule.remainingMinutes} min remaining</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle size={13} className="text-emerald-500" />
              <span>{activeModule.completedActivities} / {activeModule.totalActivities} tasks done</span>
            </div>
          </div>
        </div>

        {/* Mini Preview Chip */}
        <div className="mb-5 flex-1 flex flex-col justify-center">
          {activeModule.isAllCompleted ? (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs flex items-center gap-2.5 text-emerald-800">
              <Trophy size={18} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">You're all caught up!</span>
                <p className="text-[11px] text-emerald-700">Explore peer arena battles to test your skills.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  ▶
                </span>
                <span className="font-bold text-[#1A202C] truncate">
                  Next: {activeModule.nextActivityTitle}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#2563EB] shrink-0">
                {activeModule.nextActivityDuration}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button - Matching height */}
      <button
        onClick={handleContinue}
        className="w-full h-12 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 group shrink-0"
      >
        <Play size={15} className="fill-white" />
        <span>{t.continue || 'Continue Learning'}</span>
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
