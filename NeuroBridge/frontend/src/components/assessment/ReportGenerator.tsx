import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useDyslexia, type DyslexiaLevel } from '../../contexts/DyslexiaContext';
import { getTranslation, type Translation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';
import { useAuth } from '../../contexts/AuthContext';
import { ProgressGame } from '../dashboard/ProgressGame';
import { SkillRadar, BandDonut } from './ReportCharts';
import { DARK, LIGHT } from './chartPalette';
import { getAssessmentSeverity } from '../../utils/assessmentScoring';
import {
  BAND_INFO,
  BAND_ORDER,
  TARGET,
  bandCounts,
  computeSkills,
  focusAreas,
  formatDuration,
  type Band,
  type QuestionMetricLike,
} from './reportData';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Volume2,
  Brain,
  Chrome,
  Download,
  Target,
  Lightbulb,
  BarChart3,
  Timer,
  Shuffle,
  Undo2,
  Type,
  Contrast,
  AlignJustify,
  Loader2,
  PieChart,
  Gamepad2,
  X,
} from 'lucide-react';

interface AssessmentMetrics {
  totalTime: number;
  averageTimePerQuestion: number;
  confusionCount: number;
  backtrackCount: number;
  audioReplayCount: number;
  questionMetrics: QuestionMetricLike[];
}

interface ReportGeneratorProps {
  score: number;
  partAPerformance: number;
  partBPerformance: number;
  metrics?: AssessmentMetrics;
  onRetake: () => void;
  onContinue: () => void;
}

type GuestGame = {
  skillId: 'sound' | 'focus' | 'memory' | 'speed';
  skillName: string;
  construct: string;
};

const guestGames: Record<string, GuestGame> = {
  phonological: { skillId: 'sound', skillName: 'Sound match', construct: 'Hear and compare word sounds' },
  visual: { skillId: 'focus', skillName: 'Spot the letters', construct: 'Notice visual details' },
  workingMemory: { skillId: 'memory', skillName: 'Sequence memory', construct: 'Remember and repeat a sequence' },
  processingSpeed: { skillId: 'speed', skillName: 'Pattern match', construct: 'Compare two patterns' },
  orthographic: { skillId: 'focus', skillName: 'Spot the letters', construct: 'Notice letter differences' },
  executive: { skillId: 'memory', skillName: 'Sequence memory', construct: 'Remember and repeat a sequence' },
};

export function ReportGenerator({ score, partAPerformance, partBPerformance, metrics, onRetake, onContinue }: ReportGeneratorProps) {
  const { language, cognitiveProfile, isDarkMode, reduceMotion } = useDyslexia();
  const { user } = useAuth();
  const t = getTranslation(language);
  const [practiceGame, setPracticeGame] = useState<GuestGame | null>(null);

  const level = getAssessmentSeverity(score);

  const getLevelText = (level: DyslexiaLevel): string => {
    const levelMap: Record<DyslexiaLevel, keyof Translation> = {
      none: 'levelNone',
      mild: 'levelMild',
      moderate: 'levelModerate',
      severe: 'levelSevere',
    };
    return t[levelMap[level]] || level;
  };

  const getLevelColor = (level: DyslexiaLevel) => {
    switch (level) {
      case 'none':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'mild':
        return 'text-[#2563EB] bg-blue-50 border-blue-200';
      case 'moderate':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'severe':
        return 'text-purple-700 bg-purple-50 border-purple-200';
    }
  };

  const getRecommendations = (level: DyslexiaLevel) => {
    const recommendations = {
      none: {
        fontSize: 'Try the standard text size; adjust it whenever you prefer',
        contrast: 'Start with normal contrast; change it if reading feels tiring',
        audio: 'Try audio narration when it is useful',
        spacing: 'Start with standard spacing; adjust for comfort',
      },
      mild: {
        fontSize: 'Try slightly larger text (about 110%)',
        contrast: 'Try a softer background if it feels more comfortable',
        audio: 'Try audio summaries for longer text',
        spacing: 'Try a little more line spacing',
      },
      moderate: {
        fontSize: 'Try larger text (about 120%)',
        contrast: 'Try higher contrast or a reading guide',
        audio: 'Try speech narration alongside text',
        spacing: 'Try wider line spacing',
      },
      severe: {
        fontSize: 'Try larger text or the OpenDyslexic font',
        contrast: 'Try high contrast if it improves readability',
        audio: 'Try listening while following the text',
        spacing: 'Try wider letter and line spacing',
      },
    };
    return recommendations[level];
  };

  const getLearningStyle = () => {
    if (score >= 60) {
      return {
        primary: 'Try visual and spoken supports',
        description: 'You could try pairing diagrams or examples with spoken explanations.',
        tips: [
          'Use interactive mind maps & diagrams',
          'Listen to TTS audio summaries',
          'Break reading sprints into 15-minute intervals',
          'Leverage JARVIS AI speech narration',
        ],
      };
    } else if (score >= 30) {
      return {
        primary: 'Try mixing learning formats',
        description: 'You could try combining short reading, listening, and hands-on practice.',
        tips: [
          'Combine text with speech audio',
          'Use color-coded topic notes',
          'Break complex tasks into small steps',
          'Practice interactive phonics modules',
        ],
      };
    } else {
      return {
        primary: 'Choose the format that feels comfortable',
        description: 'Try standard text, audio, or visual supports and use whichever helps you most.',
        tips: [
          'Standard text layout works smoothly',
          'Supplement with visual aids when useful',
          'Use voice speech for long reading sprints',
          'Experiment with OpenDyslexic letterforms',
        ],
      };
    }
  };

  const learningStyle = getLearningStyle();
  const recommendations = getRecommendations(level);

  const reportText = `Your support indicator is ${getLevelText(level)}. The indicator score is ${score} out of 100; higher scores mean more observed difficulty signals. This is a learning aid, not a medical diagnosis.`;

  // ── Real per-skill results (Part A answers + Part B tasks) ────────────────
  const skills = useMemo(() => computeSkills(metrics, cognitiveProfile), [metrics, cognitiveProfile]);
  const focus = useMemo(() => focusAreas(skills), [skills]);
  const ranked = useMemo(() => [...skills].sort((a, b) => a.score - b.score), [skills]);
  const levels = useMemo(() => bandCounts(skills), [skills]);
  const growCount = skills.filter((s) => s.score < TARGET).length;
  const palette = isDarkMode ? DARK : LIGHT;

  const LEVEL_HEX: Record<DyslexiaLevel, string> = {
    none: '#059669',
    mild: '#2563EB',
    moderate: '#B45309',
    severe: '#7C3AED',
  };

  /** Band colours that read well on both light and dark cards. */
  const bandStyle = (band: Band) => {
    const info = BAND_INFO[band];
    return isDarkMode
      ? { background: `${info.color}22`, color: info.color, borderColor: `${info.color}55` }
      : { background: info.soft, color: info.text, borderColor: `${info.color}55` };
  };

  const [pdfState, setPdfState] = useState<'idle' | 'working' | 'error'>('idle');
  const handleDownload = async () => {
    if (pdfState === 'working') return;
    setPdfState('working');
    try {
      const { downloadReportPdf } = await import('./downloadReportPdf');
      await downloadReportPdf({
        studentName: user?.name,
        levelLabel: String(getLevelText(level)),
        levelColor: LEVEL_HEX[level],
        score,
        partAPerformance,
        partBPerformance,
        skills,
        focus,
        levels,
        metrics,
        recommendations: [
          recommendations.fontSize,
          recommendations.contrast,
          recommendations.audio,
          recommendations.spacing,
        ],
        learningStyle,
      });
      setPdfState('idle');
    } catch (error) {
      console.error('Report PDF error:', error);
      setPdfState('error');
    }
  };

  const enter = (delay = 0) =>
    reduceMotion
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  const card = 'bg-white rounded-3xl p-5 sm:p-7 border border-blue-100/90 shadow-xs';
  const cardTitle = (icon: ReactNode, title: string, tone = 'bg-blue-50 text-[#2563EB] border-blue-100') => (
    <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${tone}`}>{icon}</div>
      <h2 className="text-base font-extrabold text-[#1A202C]" style={{ fontSize: '1rem' }}>
        {title}
      </h2>
    </div>
  );

  const downloadButton = (full = false) => (
    <button
      type="button"
      onClick={handleDownload}
      disabled={pdfState === 'working'}
      className={`${full ? 'w-full sm:w-auto' : ''} px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2`}
    >
      {pdfState === 'working' ? (
        <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
      ) : (
        <Download size={16} />
      )}
      <span>{pdfState === 'working' ? 'Making your PDF…' : 'Download report (PDF)'}</span>
    </button>
  );

  const workStats = [
    { icon: <Timer size={18} />, label: 'Time taken', value: formatDuration(metrics?.totalTime) },
    { icon: <Shuffle size={18} />, label: 'Answers changed', value: String(metrics?.confusionCount ?? 0) },
    { icon: <Volume2 size={18} />, label: 'Listened again', value: String(metrics?.audioReplayCount ?? 0) },
    { icon: <Undo2 size={18} />, label: 'Went back', value: String(metrics?.backtrackCount ?? 0) },
  ];

  const settingChips = [
    { icon: <Type size={18} />, label: 'Text size', text: recommendations.fontSize },
    { icon: <Contrast size={18} />, label: 'Contrast', text: recommendations.contrast },
    { icon: <Volume2 size={18} />, label: 'Read aloud', text: recommendations.audio },
    { icon: <AlignJustify size={18} />, label: 'Spacing', text: recommendations.spacing },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 px-4 sm:px-6 text-left">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/80 text-xs font-black mb-2">
            <Sparkles size={13} />
            <span>Calibration Complete</span>
          </div>
          <h1
            className="font-black text-[#1A202C] tracking-tight"
            style={{ fontSize: 'clamp(1.6rem, 1.2rem + 1.4vw, 2.4rem)', lineHeight: 1.15 }}
          >
            {t.reportTitle || 'Your Personal Learning Profile'}
          </h1>
          <p className="text-[#64748B] font-medium mt-1" style={{ fontSize: '0.875rem' }}>
            See what is strong and what to practise next.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <AudioControl text={reportText} showControls={false} />
          {downloadButton()}
        </div>
      </div>
      {pdfState === 'error' && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          Could not make the PDF. Please try again.
        </p>
      )}

      {/* 2. Score summary */}
      <motion.section
        {...enter(0)}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        aria-labelledby="score-summary"
      >
        <div className="grid gap-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#475569]">
              <Brain size={18} className="text-[#7C3AED]" />
              <h2 id="score-summary">Your support indicator</h2>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className="text-6xl font-black leading-none tracking-tight text-[#1E293B] tabular-nums">{score}</span>
              <span className="pb-1 text-base font-bold text-[#64748B]">/ 100</span>
              <span className={`mb-1 rounded-xl border px-3 py-1.5 text-sm font-black ${getLevelColor(level)}`}>
                {getLevelText(level)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-4 sm:p-5">
            <div
              className="h-3 overflow-hidden rounded-full bg-slate-200"
              role="meter"
              aria-label="Support indicator score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-purple-600 transition-all"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
        <p className="border-t border-slate-100 px-5 py-4 text-[11px] italic text-[#64748B] sm:px-8">
          *This is a learning-support estimate, not a medical diagnosis.
        </p>
      </motion.section>

      {/* 3. Radar + focus areas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.section {...enter(0.05)} className={`${card} lg:col-span-2`} aria-labelledby="skills-glance">
          <div id="skills-glance">{cardTitle(<Brain size={16} />, 'Your skills at a glance', 'bg-purple-50 text-[#8B5CF6] border-purple-100')}</div>
          <SkillRadar skills={skills} palette={palette} />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <svg width="18" height="6" aria-hidden>
                <line x1="0" y1="3" x2="18" y2="3" stroke={palette.target} strokeWidth="2" strokeDasharray="4 3" />
              </svg>
              Goal ({TARGET})
            </span>
            {(Object.keys(BAND_INFO) as Band[]).map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: BAND_INFO[b].color }} aria-hidden />
                {BAND_INFO[b].label}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section {...enter(0.1)} className={`${card} lg:col-span-3`} aria-labelledby="grow-first">
          <div id="grow-first">{cardTitle(<Target size={16} />, 'Where to grow first', 'bg-amber-50 text-amber-600 border-amber-100')}</div>
          {growCount === 0 && (
            <p className="mb-3 text-sm font-semibold text-emerald-700">No big gaps. Keep practising to stay strong!</p>
          )}
          <ol className="space-y-3">
            {focus.map((s, i) => (
              <li key={s.id} className="rounded-2xl border p-4" style={bandStyle(s.band)}>
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0"
                    style={{ background: BAND_INFO[s.band].color }}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-extrabold text-[#1A202C]" style={{ fontSize: '0.95rem' }}>
                        {s.name}
                      </h3>
                      <span className="font-black" style={{ fontSize: '1.1rem' }}>
                        {s.score}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-white/70 overflow-hidden" aria-hidden>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: BAND_INFO[s.band].color }}
                        initial={reduceMotion ? false : { width: 0 }}
                        animate={{ width: `${Math.max(s.score, 3)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-10">
                  <p className="flex items-start gap-1.5 text-xs font-semibold text-[#1A202C]">
                    <Lightbulb size={14} className="shrink-0 mt-0.5" style={{ color: BAND_INFO[s.band].color }} />
                    <span>{s.tip}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPracticeGame(guestGames[s.id])}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    <span>Try a practice game</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#64748B]">Try a short game now—no account needed. Guest scores are not saved.</span>
            <button
              type="button"
              onClick={() => setPracticeGame(guestGames.phonological)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            >
              <Gamepad2 size={14} />
              <span>Play a quick game</span>
            </button>
          </div>
        </motion.section>
      </div>

      {/* 4. All skills ranked */}
      <motion.section {...enter(0.15)} className={card} aria-labelledby="all-skills">
        <div id="all-skills">{cardTitle(<BarChart3 size={16} />, 'All skills, lowest first')}</div>
        <ul className="space-y-3.5">
          {ranked.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[minmax(7rem,9rem)_1fr_auto] sm:grid-cols-[10rem_1fr_7.5rem] items-center gap-3">
              <span className="text-xs sm:text-sm font-bold text-[#1A202C] truncate">{s.name}</span>
              <div className="relative h-4 rounded-full bg-slate-100" aria-hidden>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: BAND_INFO[s.band].color }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${Math.max(s.score, 3)}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
                />
                <span
                  className="absolute -top-1 -bottom-1 w-0 border-l-2 border-dashed"
                  style={{ left: `${TARGET}%`, borderColor: palette.target }}
                />
              </div>
              <span className="flex items-center gap-2 justify-end sm:justify-start">
                <span className="font-black text-sm tabular-nums" style={{ color: BAND_INFO[s.band].color }}>
                  {s.score}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full border text-[10px] font-black" style={bandStyle(s.band)}>
                  {BAND_INFO[s.band].label}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] font-semibold text-[#64748B] flex items-center gap-1.5">
          <svg width="14" height="12" aria-hidden>
            <line x1="7" y1="0" x2="7" y2="12" stroke={palette.target} strokeWidth="2" strokeDasharray="3 2" />
          </svg>
          The dashed line is the goal ({TARGET}). Each skill mixes your answers and your task results.
        </p>
      </motion.section>

      {/* 5. Answers donut + how you worked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.section {...enter(0.2)} className={card} aria-labelledby="by-level">
          <div id="by-level">{cardTitle(<PieChart size={16} />, 'Skills by level', 'bg-emerald-50 text-emerald-600 border-emerald-100')}</div>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <BandDonut counts={levels} palette={palette} />
            <ul className="space-y-2.5 w-full">
              {BAND_ORDER.map((band, i) => (
                <li key={band} className="flex items-center gap-2.5 text-xs font-bold text-[#1A202C]">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: BAND_INFO[band].color }} aria-hidden />
                  <span className="flex-1">{BAND_INFO[band].label}</span>
                  <span className="tabular-nums text-[#64748B]">{levels[i]}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section
          {...enter(0.25)}
          className={card}
          aria-labelledby="how-worked"
        >
          <div id="how-worked">{cardTitle(<Timer size={16} />, 'How you worked')}</div>
          <div className="grid grid-cols-2 gap-3">
            {workStats.map((st) => (
              <div key={st.label} className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4">
                <div className="text-[#2563EB] mb-2" aria-hidden>
                  {st.icon}
                </div>
                <p className="font-black text-[#1A202C] leading-none tabular-nums" style={{ fontSize: '1.35rem' }}>
                  {st.value}
                </p>
                <p className="text-[11px] font-bold text-[#64748B] mt-1">{st.label}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* 6. Settings + learning style (short) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.section {...enter(0.3)} className={card}>
          {cardTitle(<Sliders size={16} />, t.recommendedSettings || 'Recommended Reading Settings')}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {settingChips.map((c) => (
              <div key={c.label} className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-3.5 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0" aria-hidden>
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#64748B] uppercase tracking-wider">{c.label}</p>
                  <p className="text-xs font-semibold text-[#1A202C] mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...enter(0.35)} className={card}>
          {cardTitle(<Sparkles size={16} />, 'Support ideas to try', 'bg-purple-50 text-[#8B5CF6] border-purple-100')}
          <p className="inline-block px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 font-black text-sm text-[#7C3AED]">
            {learningStyle.primary}
          </p>
          <p className="text-xs text-[#64748B] font-medium mt-2">{learningStyle.description}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {learningStyle.tips.map((tip) => (
              <li
                key={tip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-[#1A202C]"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                {tip}
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      {/* 7. Chrome extension */}
      <motion.div
        {...enter(0.4)}
        className="rounded-3xl p-6 sm:p-7 border border-blue-200 bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
            <Chrome size={26} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black mb-1">
              <CheckCircle2 size={12} />
              <span>Assessment Completed • Extension Unlocked</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#1A202C]">Download NeuroBridge Chrome Extension</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-lg mt-0.5">
              Get the OpenDyslexic font and a line-tracking reading ruler on every website you visit.
            </p>
          </div>
        </div>

        <a
          href="/assets/neurobridge-chrome-extension.zip"
          download="neurobridge-chrome-extension.zip"
          className="shrink-0 w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download size={16} />
          <span>Download Chrome Extension</span>
        </a>
      </motion.div>

      <p className="text-center text-[11px] italic text-[#64748B]">
        *This is a learning-support estimate, not a medical diagnosis.
      </p>

      {/* 8. Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <button
          type="button"
          onClick={onRetake}
          className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1A202C] font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw size={15} />
          <span>{t.retakeTest || 'Retake Assessment'}</span>
        </button>
        {downloadButton(true)}
        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#1E293B] hover:bg-[#0F172A] text-white font-extrabold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t.goToDashboard || 'Continue to Dashboard'}</span>
          <ArrowRight size={15} />
        </button>
      </div>
      {practiceGame && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${practiceGame.skillName} practice game`}
        >
          <div className="relative my-auto w-full max-w-3xl rounded-3xl bg-white p-3 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setPracticeGame(null)}
              className="absolute right-4 top-4 z-10 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Close practice game"
            >
              <X size={18} />
            </button>
            <ProgressGame
              key={practiceGame.skillId}
              {...practiceGame}
              rating={800}
              language={language}
              showRating={false}
              onComplete={() => {}}
              onExit={() => setPracticeGame(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
