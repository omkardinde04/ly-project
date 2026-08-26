import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  Type,
  Eye,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Zap,
  ShieldCheck,
  Play,
  Pause,
  Layers,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import type { LineSpacing, LetterSpacing, ContentWidth } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

export function AccessibilitySettings() {
  const {
    language,
    isDyslexiaMode,
    toggleDyslexiaMode,
    textSize,
    setTextSize,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    contentWidth,
    setContentWidth,
    audioSpeed,
    setAudioSpeed,
    dyslexiaLevel,
    testScore,
    resetVisualPreferences,
  } = useDyslexia();

  const t = getTranslation(language);
  const [isPlayingSampleAudio, setIsPlayingSampleAudio] = useState(false);

  // Helper mappings for CSS values
  const getLineHeight = (val: LineSpacing) => {
    if (val === 'normal') return 1.5;
    if (val === 'comfortable') return 1.8;
    return 2.2; // spacious
  };

  const getLetterSpacing = (val: LetterSpacing) => {
    if (val === 'normal') return 'normal';
    if (val === 'comfortable') return '0.05em';
    return '0.1em'; // wide
  };

  const getContentWidth = (val: ContentWidth) => {
    if (val === 'normal') return '100%';
    if (val === 'comfortable') return '85%';
    return '65%'; // narrow
  };

  const playAudioSample = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingSampleAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingSampleAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const sampleText =
      'NeuroBridge adapts to your reading pace and sensory needs. Learning should feel natural and empowering.';
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = audioSpeed || 1;
    utterance.onend = () => setIsPlayingSampleAudio(false);
    utterance.onerror = () => setIsPlayingSampleAudio(false);
    setIsPlayingSampleAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const activeFeaturesCount = [
    isDyslexiaMode,
    textSize !== 100,
    lineSpacing !== 'normal',
    letterSpacing !== 'normal',
    highContrast,
    reduceMotion,
    contentWidth !== 'normal',
    audioSpeed !== 1,
  ].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* ─── 1. PAGE HEADER ────────────────────────────────────────────── */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] p-2.5 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Sliders size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-[#1A202C] tracking-tight">Accessibility</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-500" /> Personalized Engine Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium truncate">
              Personalize NeuroBridge to make learning more comfortable and accessible for you.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetVisualPreferences}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#64748B] hover:text-[#1A202C] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw size={13} />
          <span>Reset Defaults</span>
        </button>
      </motion.div>

      {/* ─── 2. ACCESSIBILITY STATUS OVERVIEW CARD ─────────────────────── */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-[#1A202C] uppercase tracking-wider">
              Your Accessibility Setup — Active ({activeFeaturesCount} Enhancements)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] font-medium">
            Tailored specifically to support neurodivergent reading flow and focus.
          </p>

          {/* Active Settings Pill Cluster */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDyslexiaMode
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              OpenDyslexic Font: {isDyslexiaMode ? 'Enabled' : 'Standard'}
            </span>

            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
              Text Size: {textSize}%
            </span>

            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 capitalize">
              Line Spacing: {lineSpacing}
            </span>

            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 capitalize">
              Letter Spacing: {letterSpacing}
            </span>

            {highContrast && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                High Contrast: Active
              </span>
            )}

            {reduceMotion && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Calm Motion: Active
              </span>
            )}
          </div>
        </div>

        {/* Master Dyslexia Mode Fast Toggle */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 shrink-0">
          <div className="text-left">
            <div className="text-xs font-bold text-[#1A202C]">Dyslexia Mode</div>
            <div className="text-[11px] text-[#64748B]">OpenDyslexic font</div>
          </div>
          <button
            type="button"
            onClick={toggleDyslexiaMode}
            className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
              isDyslexiaMode ? 'bg-[#2563EB]' : 'bg-slate-300'
            }`}
            aria-label="Toggle Dyslexia Mode"
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                isDyslexiaMode ? 'translate-x-6.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* ─── 3. TWO-COLUMN WORKSPACE: CONTROLS & LIVE PREVIEW ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Modular Setting Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card A: Reading & Typography */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                <Type size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1A202C]">Reading & Typography</h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Adjust text scale, line height, and letter tracking for effortless scanning.
                </p>
              </div>
            </div>

            {/* 1. Text Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">
                  Text Scale
                </label>
                <span className="text-xs font-black text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {textSize}%
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="140"
                step="10"
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-bold mt-1 px-1">
                <span>80%</span>
                <span>100% (Default)</span>
                <span>120%</span>
                <span>140%</span>
              </div>
            </div>

            {/* 2. Line Spacing */}
            <div>
              <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider block mb-2">
                Line Spacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'comfortable', 'spacious'] as LineSpacing[]).map((spacing) => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => setLineSpacing(spacing)}
                    className={`py-2 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      lineSpacing === spacing
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F8FAFC] text-[#1A202C] border border-slate-200/80 hover:border-blue-200 hover:text-[#2563EB]'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Letter Spacing */}
            <div>
              <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider block mb-2">
                Letter Spacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'comfortable', 'wide'] as LetterSpacing[]).map((spacing) => (
                  <button
                    key={spacing}
                    type="button"
                    onClick={() => setLetterSpacing(spacing)}
                    className={`py-2 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      letterSpacing === spacing
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F8FAFC] text-[#1A202C] border border-slate-200/80 hover:border-blue-200 hover:text-[#2563EB]'
                    }`}
                  >
                    {spacing}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card B: Visual & Motion Controls */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center border border-purple-100">
                <Eye size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1A202C]">Focus & Visual Comfort</h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Optimize reading width and sensory contrast to reduce visual fatigue.
                </p>
              </div>
            </div>

            {/* Content Width Segmented Control */}
            <div>
              <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider block mb-2">
                Reading Column Width
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'comfortable', 'narrow'] as ContentWidth[]).map((width) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => setContentWidth(width)}
                    className={`py-2 rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      contentWidth === width
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F8FAFC] text-[#1A202C] border border-slate-200/80 hover:border-blue-200 hover:text-[#2563EB]'
                    }`}
                  >
                    {width} {width === 'narrow' ? '(Focus)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Rows: High Contrast & Reduce Motion */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                <div>
                  <div className="text-xs font-extrabold text-[#1A202C]">High Contrast Mode</div>
                  <div className="text-[11px] text-[#64748B]">
                    Boost visual clarity and sharpen boundaries
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    highContrast ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle High Contrast"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                      highContrast ? 'translate-x-6.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                <div>
                  <div className="text-xs font-extrabold text-[#1A202C]">Calm Motion</div>
                  <div className="text-[11px] text-[#64748B]">
                    Minimize interface animations and transitions
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReduceMotion(!reduceMotion)}
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    reduceMotion ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Reduce Motion"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                      reduceMotion ? 'translate-x-6.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card C: Audio & Listening Preferences */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Volume2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#1A202C]">Audio & Listening</h2>
                  <p className="text-xs text-[#64748B] font-medium">
                    Customize speech-to-text and reading narration speed.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={playAudioSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {isPlayingSampleAudio ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlayingSampleAudio ? 'Stop Sample' : 'Test Speech'}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">
                  Narration Speed
                </label>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {audioSpeed || 1}x Speed
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setAudioSpeed(speed)}
                    className={`py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      (audioSpeed || 1) === speed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#F8FAFC] text-[#1A202C] border border-slate-200/80 hover:border-emerald-200 hover:text-emerald-700'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Cognitive Profile (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          {/* Card 1: Interactive Real-time Live Preview */}
          <div
            className={`rounded-3xl p-6 sm:p-7 border shadow-xs transition-colors ${
              highContrast ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100/80'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100/30 mb-4">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  highContrast ? 'text-slate-300' : 'text-[#64748B]'
                }`}
              >
                Live Typography Preview
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  highContrast
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-blue-50 text-[#2563EB] border border-blue-100'
                }`}
              >
                {isDyslexiaMode ? 'OpenDyslexic' : 'Standard Font'}
              </span>
            </div>

            {/* Simulated Reading Box */}
            <div
              style={{
                width: getContentWidth(contentWidth),
                margin: '0 auto',
                transition: reduceMotion ? 'none' : 'width 0.3s ease',
              }}
              className={`p-5 rounded-2xl border transition-all ${
                highContrast
                  ? 'bg-slate-800/80 border-slate-700 text-white'
                  : 'bg-[#F8FAFC] border-slate-200/80 text-[#1A202C]'
              }`}
            >
              <div
                style={{
                  fontSize: `${(textSize / 100) * 15}px`,
                  lineHeight: getLineHeight(lineSpacing),
                  letterSpacing: getLetterSpacing(letterSpacing),
                  fontFamily: isDyslexiaMode ? 'OpenDyslexic, sans-serif' : 'inherit',
                  transition: reduceMotion ? 'none' : 'all 0.3s ease',
                }}
              >
                <h3
                  className={`font-black mb-2 ${highContrast ? 'text-white' : 'text-[#1A202C]'}`}
                  style={{ fontSize: '1.2em' }}
                >
                  Learning should feel natural.
                </h3>
                <p className={`${highContrast ? 'text-slate-200' : 'text-[#64748B]'}`}>
                  NeuroBridge dynamically calibrates spacing, letter anchoring, and visual contrast
                  so reading stays smooth and comfortable for your unique thinking style.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Cognitive Profile Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center border border-purple-100">
                <ShieldCheck size={16} />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A202C]">Cognitive Profile Alignment</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Dyslexia Level</span>
                <span className="font-extrabold text-[#1A202C] capitalize">
                  {dyslexiaLevel && dyslexiaLevel !== 'none' ? dyslexiaLevel : 'Standard Calibrated'}
                </span>
              </div>

              {testScore !== null && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                  <span className="text-[#64748B] font-medium">Assessment Score</span>
                  <span className="font-extrabold text-[#2563EB]">{testScore} / 100</span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Active Enhancements</span>
                <span className="font-extrabold text-emerald-700">{activeFeaturesCount} Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
