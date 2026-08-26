import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sliders, CheckCircle2, RotateCcw, Volume2, Type, Eye, AlertCircle, Sparkles } from 'lucide-react';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';

interface DashboardStatusCardsProps {
  onNavigate: (tab: string) => void;
  onRetakeAssessment?: () => void;
  isRetaking?: boolean;
}

export function DashboardStatusCards({ onNavigate, onRetakeAssessment, isRetaking }: DashboardStatusCardsProps) {
  const { user } = useAuth();
  const { dyslexiaLevel, testScore, language, isDyslexiaMode, highContrast, reduceMotion } = useDyslexia();
  const t = getTranslation(language);

  // Score value from context or user profile
  const rawScore = testScore ?? (typeof user?.assessment_score === 'number' ? user.assessment_score : null);
  const isAssessmentCompleted = Boolean(user?.assessment_completed || rawScore !== null);
  const displayScore = rawScore !== null ? Math.min(100, Math.max(0, Math.round(rawScore))) : 0;

  // Determine effective dyslexia level dynamically
  const getEffectiveLevel = (): DyslexiaLevel => {
    if (user?.classification) {
      const cls = user.classification.toLowerCase();
      if (cls.includes('severe')) return 'severe';
      if (cls.includes('moderate')) return 'moderate';
      if (cls.includes('mild')) return 'mild';
      if (cls.includes('no dyslexia') || cls.includes('none') || cls.includes('standard')) return 'none';
    }
    if (dyslexiaLevel && dyslexiaLevel !== 'none') return dyslexiaLevel;
    if (isAssessmentCompleted && rawScore !== null) {
      if (displayScore >= 80) return 'severe';
      if (displayScore >= 60) return 'moderate';
      if (displayScore >= 45) return 'mild';
      return 'none';
    }
    return dyslexiaLevel || 'none';
  };

  const effectiveLevel = getEffectiveLevel();

  const scoreRadius = 28;
  const circumference = 2 * Math.PI * scoreRadius;
  const strokeDashoffset = isAssessmentCompleted ? circumference - (displayScore / 100) * circumference : circumference;

  const getLevelDetails = (level: DyslexiaLevel) => {
    switch (level) {
      case 'none':
        return {
          title: t.standard || 'Standard Profile',
          badge: 'Calm & Optimal',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          glowClass: 'bg-emerald-50/70',
          desc: 'Standard visual layout & typography active.',
        };
      case 'mild':
        return {
          title: t.levelMild || 'Mild Dyslexia',
          badge: 'Assisted Mode',
          badgeClass: 'bg-blue-50 text-[#2563EB] border-blue-200',
          iconClass: 'bg-blue-50 text-[#2563EB] border-blue-100',
          glowClass: 'bg-blue-50/70',
          desc: 'Readable spacing & clear word guides active.',
        };
      case 'moderate':
        return {
          title: t.levelModerate || 'Moderate Dyslexia',
          badge: 'Structured Support',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          iconClass: 'bg-amber-50 text-amber-600 border-amber-100',
          glowClass: 'bg-amber-50/70',
          desc: 'Enhanced reading guide & font assistance active.',
        };
      case 'severe':
        return {
          title: t.levelSevere || 'Severe Dyslexia',
          badge: 'Maximum Support',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          iconClass: 'bg-purple-50 text-[#8B5CF6] border-purple-100',
          glowClass: 'bg-purple-50/70',
          desc: 'Full audio support, high contrast & large spacing active.',
        };
    }
  };

  const levelInfo = getLevelDetails(effectiveLevel);

  // Active accessibility tags count
  const activeFeatures = [
    { label: 'TTS Audio', active: true, icon: Volume2, color: 'bg-blue-50 text-[#2563EB] border-blue-100' },
    { label: isDyslexiaMode ? 'Dyslexia Font' : 'Readable Font', active: isDyslexiaMode, icon: Type, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'High Contrast', active: highContrast, icon: Eye, color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { label: 'Calm Motion', active: reduceMotion, icon: Sparkles, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ].filter(f => f.active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
      {/* Card 1: Dyslexia Level with Severity Theming */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-sm hover:border-blue-200 transition-all h-full text-left"
      >
        <div className={`absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform ${levelInfo.glowClass}`} />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${levelInfo.iconClass}`}>
              <CheckCircle2 size={20} />
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${levelInfo.badgeClass}`}>
              {levelInfo.badge}
            </span>
          </div>

          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
            {t.yourLevel || 'Your Dyslexia Level'}
          </div>
          <h3 className="text-xl font-black text-[#1A202C] mb-1.5">{levelInfo.title}</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {levelInfo.desc}
          </p>
        </div>

        {/* Uniform Bottom Footer 1 */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B]">Profile State</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-xl border ${levelInfo.badgeClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Active
          </span>
        </div>
      </motion.div>

      {/* Card 2: Performance Index */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-sm hover:border-blue-200 transition-all h-full text-left"
      >
        <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-blue-50/70 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Award size={20} />
            </div>
            {isAssessmentCompleted && onRetakeAssessment && (
              <button
                onClick={onRetakeAssessment}
                disabled={isRetaking}
                title="Retake Cognitive Assessment"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw size={12} className={isRetaking ? 'animate-spin' : ''} />
                {isRetaking ? 'Resetting...' : 'Retake'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                Performance Index
              </div>

              {isAssessmentCompleted ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#1A202C]">{displayScore}</span>
                    <span className="text-sm font-bold text-[#94A3B8]">/ 100</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 font-medium">Cognitive readiness index</p>
                </>
              ) : (
                <>
                  <div className="text-base font-bold text-amber-700 flex items-center gap-1.5 mt-1">
                    <AlertCircle size={16} /> Pending
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">Take assessment to calibrate</p>
                </>
              )}
            </div>

            {/* Circular Progress Gauge */}
            {isAssessmentCompleted ? (
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 70 70">
                  <circle
                    cx="35"
                    cy="35"
                    r={scoreRadius}
                    stroke="#E2E8F0"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r={scoreRadius}
                    stroke="#2563EB"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-[#2563EB]">
                  {displayScore}%
                </span>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('assessment')}
                className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Start
              </button>
            )}
          </div>
        </div>

        {/* Uniform Bottom Footer 2 */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748B]">Readiness Tier</span>
          <span className="inline-flex items-center text-xs font-extrabold text-[#2563EB] bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-xl">
            {!isAssessmentCompleted
              ? 'Not Calibrated'
              : displayScore >= 80
              ? 'Proficient'
              : displayScore >= 60
              ? 'Developing'
              : 'Foundational'}
          </span>
        </div>
      </motion.div>

      {/* Card 3: Accessibility Mode with Active Tags */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:shadow-sm hover:border-blue-200 transition-all h-full text-left"
      >
        <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-purple-50/70 blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Sliders size={20} />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {t.active || 'Active'}
            </span>
          </div>

          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
            {t.accessibilityMode || 'Accessibility Mode'}
          </div>
          <h3 className="text-xl font-black text-[#1A202C] mb-1.5">Workspace Tuned</h3>

          {/* Dynamic Active Accessibility Feature Tags */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {activeFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${f.color}`}>
                  <Icon size={11} /> {f.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Uniform Bottom Footer 3 */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onNavigate('accessibility')}
            className="text-xs font-extrabold text-[#8B5CF6] hover:text-purple-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Customize preferences →
          </button>
          <span className="inline-flex items-center text-xs font-extrabold text-[#1A202C] bg-slate-100 border border-slate-200/90 px-2.5 py-1 rounded-xl">
            {activeFeatures.length} Active
          </span>
        </div>
      </motion.div>
    </div>
  );
}
