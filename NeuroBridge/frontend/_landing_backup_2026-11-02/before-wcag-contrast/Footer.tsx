import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../ui/LogoIcon';
import { useDyslexia } from '../../contexts/DyslexiaContext';

export function Footer() {
  const { isDarkMode } = useDyslexia();

  return (
    <footer className={`border-t pt-12 pb-8 w-full transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#0B1120] border-slate-800 text-slate-300' 
        : 'bg-white border-blue-100/80 text-[#1A202C]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <LogoIcon className="w-full h-full" />
              </div>
              <span className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A202C]'}`}>
                NeuroBridge
              </span>
            </Link>
            <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-sm ${
              isDarkMode ? 'text-slate-400' : 'text-[#64748B]'
            }`}>
              Empowering neurodivergent and dyslexic students with cognitive brain games,
              visual courses, diagnostic assessments, friend chat, and our personalized Chrome reading extension.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5">
            <h4 className={`text-xs font-black uppercase tracking-wider ${
              isDarkMode ? 'text-slate-200' : 'text-[#1A202C]'
            }`}>
              Platform
            </h4>
            <ul className={`space-y-2 text-xs font-semibold ${
              isDarkMode ? 'text-slate-400' : 'text-[#64748B]'
            }`}>
              <li>
                <Link to="/learn" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
                  Play Brain Games
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
                  Dyslexia Courses
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
                  Assessment & Test
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
                  Chrome Extension (Post-Test)
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
                  Chat with Friends
                </Link>
              </li>
            </ul>
          </div>

          {/* Accessibility & Company */}
          <div className="space-y-2.5">
            <h4 className={`text-xs font-black uppercase tracking-wider ${
              isDarkMode ? 'text-slate-200' : 'text-[#1A202C]'
            }`}>
              Accessibility
            </h4>
            <ul className={`space-y-2 text-xs font-semibold ${
              isDarkMode ? 'text-slate-400' : 'text-[#64748B]'
            }`}>
              <li>
                <Link to="/about" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
                  About NeuroBridge
                </Link>
              </li>
              <li>
                <span className="text-[#2563EB] dark:text-blue-400 font-bold">OpenDyslexic Engine</span>
              </li>
              <li>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">WCAG AAA Contrast</span>
              </li>
              <li>
                <span className="text-purple-600 dark:text-purple-400 font-bold">JARVIS Voice Assistant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium ${
          isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-[#64748B]'
        }`}>
          <div>© 2026 NeuroBridge. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <span>Built with care for neurodivergent minds</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
