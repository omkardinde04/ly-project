import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Calendar, ArrowRight, BookOpen, FileText, Bot, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

interface DashboardHeaderProps {
  onNavigate: (tab: string) => void;
}

export function DashboardHeader({ onNavigate }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { language, dyslexiaLevel } = useDyslexia();
  const t = getTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');

  // Format today's date nicely
  const todayFormatted = new Date().toLocaleDateString(
    language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US',
    { weekday: 'long', month: 'short', day: 'numeric' }
  );

  const quickActions = [
    { label: 'Reading Practice', tab: 'learning', icon: BookOpen },
    { label: 'Resume Builder', tab: 'resumeBuilder', icon: FileText },
    { label: 'AI Notebook', tab: 'notebook', icon: Bot },
    { label: 'Peer Circle', tab: 'community', icon: Users },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    if (query.includes('resume') || query.includes('cv')) {
      onNavigate('resumeBuilder');
    } else if (query.includes('job') || query.includes('opp') || query.includes('intern')) {
      onNavigate('opportunities');
    } else if (query.includes('note') || query.includes('ai') || query.includes('ask')) {
      onNavigate('notebook');
    } else if (query.includes('peer') || query.includes('comm') || query.includes('friend')) {
      onNavigate('community');
    } else if (query.includes('prog') || query.includes('score') || query.includes('stat')) {
      onNavigate('progress');
    } else if (query.includes('setting') || query.includes('access') || query.includes('font')) {
      onNavigate('accessibility');
    } else {
      onNavigate('learning');
    }
  };

  const getLevelBadge = () => {
    switch (dyslexiaLevel) {
      case 'none':
        return { label: 'Standard Profile', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'mild':
        return { label: 'Mild Support Active', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'moderate':
        return { label: 'Enhanced Support Active', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'severe':
        return { label: 'Max Accessibility Active', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Student Profile', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const levelBadge = getLevelBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-sm relative overflow-hidden"
    >
      {/* Subtle background decorative gradient circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 rounded-full blur-2xl pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-sky-50/70 to-purple-50/30 rounded-full blur-2xl pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: User Welcome & Date */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-100">
              <Calendar size={13} className="text-[#2563EB]" />
              {todayFormatted}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${levelBadge.color}`}>
              <Sparkles size={12} className="mr-1.5" />
              {levelBadge.label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A202C] tracking-tight leading-tight">
            {t.welcomeBack}, <span className="text-[#2563EB]">{user?.name ? user.name.split(' ')[0] : 'Omkar'}</span> 👋
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] font-medium leading-relaxed">
            Here is your learning progress and next best step. Let's make today productive!
          </p>
        </div>

        {/* Right: Search / Quick Navigation */}
        <div className="w-full lg:w-96 flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3.5 text-[#94A3B8] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What would you like to work on?..."
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-[#F8FAFC] border border-blue-100 rounded-2xl text-sm text-[#1A202C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2.5 p-1.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Quick jump pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-[#94A3B8]">Quick:</span>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.tab}
                  onClick={() => onNavigate(action.tab)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F1F5F9] text-[#475569] hover:bg-blue-50 hover:text-[#2563EB] border border-transparent hover:border-blue-200 transition-all"
                >
                  <Icon size={12} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
