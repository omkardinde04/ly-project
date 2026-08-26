import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Send, ArrowRight, MessageSquare } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

interface AINotebookWidgetProps {
  onNavigate: (tab: string) => void;
}

export function AINotebookWidget({ onNavigate }: AINotebookWidgetProps) {
  const { language } = useDyslexia();
  const t = getTranslation(language);
  const [quickInput, setQuickInput] = useState('');

  const promptSuggestions = [
    'Summarize Lesson 3',
    'Explain Phonemes simply',
    'Quiz my memory',
  ];

  const handleAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onNavigate('notebook');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-3xl p-6 border border-blue-100/80 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all"
    >
      {/* Decorative gradient corner */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-50/60 rounded-full blur-xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Bot size={22} />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
            <Sparkles size={11} /> Smart AI Copilot
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-[#1A202C] mb-1">
          {t.aiNotebook || 'AI Notebook'}
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] mb-4">
          Ask questions, simplify complex text, or generate audio study guides.
        </p>

        {/* Mini prompt workspace input */}
        <form onSubmit={handleAsk} className="relative mb-3">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ask AI anything about your lesson..."
            className="w-full pl-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-blue-100 rounded-xl text-xs text-[#1A202C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 p-1.5 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors"
          >
            <Send size={12} />
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {promptSuggestions.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onNavigate('notebook')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50/60 hover:bg-blue-100 text-[#2563EB] border border-blue-100/60 transition-all text-left truncate max-w-[170px]"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onNavigate('notebook')}
        className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
      >
        <span>Ask AI Notebook</span>
        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
