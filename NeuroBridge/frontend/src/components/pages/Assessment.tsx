import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardEdit,
  Timer,
  BarChart2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Volume2,
  Eye,
  Sliders,
} from 'lucide-react';
import { AssessmentTest } from '../assessment/AssessmentTest';
import { ReportGenerator } from '../assessment/ReportGenerator';
import { CognitiveTaskAssessment } from '../assessment/CognitiveTaskAssessment';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';
import { DyslexiaToggle } from '../ui/DyslexiaToggle';

export function AssessmentPage() {
  const { language, completeCognitiveTasks } = useDyslexia();
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const t = getTranslation(language);
  const [testState, setTestState] = useState<'intro' | 'partA' | 'partB' | 'report'>('intro');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [assessmentMetrics, setAssessmentMetrics] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartTest = () => {
    setTestState('partA');
  };

  const handlePartAComplete = (score: number, metrics: any) => {
    setFinalScore(score);
    setAssessmentMetrics(metrics);
    setTestState('partB');
  };

  const handlePartBComplete = async (profile: any) => {
    completeCognitiveTasks(profile);
    setTestState('report');

    // Save assessment completion to database
    if (user && token) {
      await saveAssessmentResults(finalScore, assessmentMetrics);
    }
  };

  const saveAssessmentResults = async (score: number, metrics: any) => {
    let assessmentType = 'No Dyslexia Indicators';
    if (score >= 70) {
      assessmentType = 'Severe Dyslexia Indicators';
    } else if (score >= 40) {
      assessmentType = 'Moderate Dyslexia Indicators';
    } else if (score >= 20) {
      assessmentType = 'Mild Dyslexia Indicators';
    }

    const tempAssessment = {
      score,
      classification: assessmentType,
      metrics,
      completed_at: new Date().toISOString(),
    };
    localStorage.setItem('temp_assessment', JSON.stringify(tempAssessment));

    if (token && user) {
      setIsSaving(true);
      try {
        const response = await fetch('http://localhost:4000/api/auth/google/assessment/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assessment_score: score,
            classification: assessmentType,
            assessment_metrics: JSON.stringify(metrics),
          }),
        });

        if (response.ok) {
          updateUser({
            assessment_completed: true,
            assessment_score: score,
            classification: assessmentType,
          });
          localStorage.removeItem('temp_assessment');
        }
      } catch (error) {
        console.error('Error saving assessment results:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRetake = () => {
    setTestState('partA');
  };

  const handleContinue = () => {
    if (!user || !token) {
      navigate('/login', { state: { createAccount: true } });
    } else {
      navigate('/dashboard');
    }
  };

  if (testState === 'partA') {
    return <AssessmentTest onComplete={handlePartAComplete} />;
  }

  if (testState === 'partB') {
    return <CognitiveTaskAssessment onComplete={handlePartBComplete} />;
  }

  if (testState === 'report') {
    return (
      <ReportGenerator
        score={finalScore}
        metrics={assessmentMetrics}
        onRetake={handleRetake}
        onContinue={handleContinue}
      />
    );
  }

  // Calm Intro Workspace
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl sm:rounded-[36px] shadow-xs border border-blue-100/90 p-6 sm:p-10 md:p-12 space-y-8 text-left relative overflow-hidden">
        {/* Decorative subtle ambient circle */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/40 via-purple-50/30 to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

        {/* 1. Header & Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Sparkles size={28} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/80 text-xs font-black">
            <span>Adaptive Cognitive Calibration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1A202C] tracking-tight">
            {t.assessmentTitle || 'Discover Your Learning Strengths'}
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed max-w-xl mx-auto">
            {t.assessmentSubtitle ||
              'A calm, pressure-free assessment designed to calibrate your personal typography, line spacing, and sensory support tools.'}
          </p>
        </div>

        {/* 2. Key Highlights Strip (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center">
              <ClipboardEdit size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-[#1A202C]">15 Quick Prompts</h3>
            <p className="text-xs text-[#64748B] font-medium leading-relaxed">
              Interactive phonics and visual questions tailored to your pace.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8B5CF6] border border-purple-100 flex items-center justify-center">
              <Timer size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-[#1A202C]">5–10 Minutes</h3>
            <p className="text-xs text-[#64748B] font-medium leading-relaxed">
              Take your time with zero pressure—there are no wrong answers.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-[#1A202C]">Instant Personal Report</h3>
            <p className="text-xs text-[#64748B] font-medium leading-relaxed">
              Immediate recommendations for font scale, speech pace, and contrast.
            </p>
          </div>
        </div>

        {/* 3. What to Expect Card */}
        <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-7 border border-blue-100 space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#2563EB]" />
            <h3 className="font-extrabold text-sm text-[#1A202C]">What to Expect</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#1A202C] font-semibold">
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>One question per screen for comfortable focus</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Full audio & TTS support available for each prompt</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Visual illustrations to assist comprehension</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>You can step back and adjust answers anytime</span>
            </div>
          </div>
        </div>

        {/* 4. Primary CTA & Reassurance */}
        <div className="text-center pt-2 space-y-3 relative z-10">
          <button
            type="button"
            onClick={handleStartTest}
            className="px-10 py-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm sm:text-base transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2.5 cursor-pointer group"
          >
            <span>{t.startAssessment || 'Start Assessment'}</span>
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-xs text-[#64748B] font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#2563EB]" />
            <span>Used exclusively to personalize your NeuroBridge study environment</span>
          </p>
        </div>
      </div>
    </div>
  );
}
