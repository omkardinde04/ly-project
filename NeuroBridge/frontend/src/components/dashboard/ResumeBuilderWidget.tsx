import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { useNavigate } from 'react-router-dom';
import type { DashboardData } from '../../hooks/useDashboardData';

interface ResumeBuilderWidgetProps {
  onNavigate: (tab: string) => void;
  dashboardData: DashboardData;
}

export function ResumeBuilderWidget({ onNavigate, dashboardData }: ResumeBuilderWidgetProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const { resume } = dashboardData;

  const checklist = [
    { label: 'Personal & Contact Info', done: resume.personalComplete },
    { label: 'Education Details', done: resume.educationComplete },
    { label: 'Neuro-Inclusive Strengths & Skills', done: resume.skillsComplete },
    { label: 'Projects & Experience', done: resume.projectsComplete },
  ];

  const handleOpenResume = () => {
    navigate('/dashboard/resume-builder');
    onNavigate('resumeBuilder');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-sm hover:border-blue-200 transition-all"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50/70 rounded-full blur-xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <FileText size={20} />
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
            {resume.completionPercent}% Ready
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-[#1A202C] mb-1">
          {t.resumeBuilder || 'Resume Builder'}
        </h3>
        <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
          {resume.completionPercent === 100
            ? 'Your neuro-inclusive resume is complete and ready to export!'
            : resume.completionPercent > 0
            ? `Your ATS-optimized resume is ${resume.completionPercent}% complete.`
            : 'Build your accessible, strengths-first resume in minutes.'}
        </p>

        {/* Progress meter bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#2563EB] rounded-full transition-all duration-700"
            style={{ width: `${resume.completionPercent}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-2 mb-6">
          {checklist.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs font-medium"
            >
              {item.done ? (
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={14} className="text-slate-300 shrink-0" />
              )}
              <span className={item.done ? 'text-[#475569]' : 'text-[#1A202C] font-semibold'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleOpenResume}
        className="w-full h-11 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 group shrink-0"
      >
        <span>
          {resume.completionPercent === 100
            ? 'View & Export Resume'
            : resume.completionPercent > 0
            ? t.openResumeBuilder || 'Continue Resume Builder'
            : 'Start Resume Builder'}
        </span>
        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
