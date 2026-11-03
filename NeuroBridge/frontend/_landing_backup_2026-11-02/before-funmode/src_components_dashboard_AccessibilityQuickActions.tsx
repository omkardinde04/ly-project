import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Type, Eye, Volume2, Sparkles, Sliders, ArrowRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

interface AccessibilityQuickActionsProps {
  onNavigate: (tab: string) => void;
}

export function AccessibilityQuickActions({ onNavigate }: AccessibilityQuickActionsProps) {
  const {
    language,
    isDyslexiaMode,
    toggleDyslexiaMode,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    resetVisualPreferences,
  } = useDyslexia();

  const t = getTranslation(language);

  const increaseTextSize = () => {
    setTextSize(Math.min(140, textSize + 10));
  };

  const decreaseTextSize = () => {
    setTextSize(Math.max(90, textSize - 10));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Sliders size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1A202C]">
                {t.navSettings || 'Accessibility Quick Controls'}
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Instant sensory & reading adjustments
              </p>
            </div>
          </div>

          <button
            onClick={resetVisualPreferences}
            title="Reset to defaults"
            className="p-2 text-[#94A3B8] hover:text-[#1A202C] hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Quick Adjustment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Text Size Control */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A202C]">Text Size</div>
              <div className="text-[11px] text-[#64748B] font-semibold">{textSize}%</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={decreaseTextSize}
                disabled={textSize <= 90}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#475569] font-bold hover:bg-blue-50 hover:text-[#2563EB] disabled:opacity-40 flex items-center justify-center transition-colors text-xs"
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={increaseTextSize}
                disabled={textSize >= 140}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#475569] font-bold hover:bg-blue-50 hover:text-[#2563EB] disabled:opacity-40 flex items-center justify-center transition-colors text-xs"
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Dyslexia Mode Toggle */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A202C]">Dyslexia Font</div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                {isDyslexiaMode ? 'Lexend On' : 'Standard'}
              </div>
            </div>
            <button
              onClick={toggleDyslexiaMode}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                isDyslexiaMode
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-[#475569] border-slate-200 hover:bg-purple-50'
              }`}
            >
              {isDyslexiaMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* High Contrast Toggle */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A202C]">High Contrast</div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                {highContrast ? 'Enhanced' : 'Off'}
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                highContrast
                  ? 'bg-[#1A202C] text-white border-[#1A202C] shadow-sm'
                  : 'bg-white text-[#475569] border-slate-200 hover:bg-slate-50'
              }`}
            >
              {highContrast ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Reduce Motion Toggle */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A202C]">Reduce Motion</div>
              <div className="text-[11px] text-[#64748B] font-semibold">
                {reduceMotion ? 'Calm' : 'Standard'}
              </div>
            </div>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                reduceMotion
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                  : 'bg-white text-[#475569] border-slate-200 hover:bg-blue-50'
              }`}
            >
              {reduceMotion ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={() => onNavigate('accessibility')}
        className="w-full py-3.5 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs sm:text-sm transition-all border border-purple-200/80 flex items-center justify-center gap-2 group"
      >
        <Settings size={16} />
        <span>Open All Visual & Reading Preferences</span>
        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
