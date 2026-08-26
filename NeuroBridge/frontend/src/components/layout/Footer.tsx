import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../ui/LogoIcon';
import { Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-blue-100/80 pt-12 pb-8 w-full text-[#1A202C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <LogoIcon className="w-full h-full" />
              </div>
              <span className="font-black text-xl text-[#1A202C] tracking-tight">NeuroBridge</span>
            </Link>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed max-w-sm">
              Empowering neurodivergent and dyslexic students with personalized learning tools,
              AI assistance, and career opportunities.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A202C]">Platform</h4>
            <ul className="space-y-2 text-xs font-semibold text-[#64748B]">
              <li>
                <Link to="/learn" className="hover:text-[#2563EB] transition-colors">
                  Learning Arena
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="hover:text-[#2563EB] transition-colors">
                  Inclusive Careers
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-[#2563EB] transition-colors">
                  Peer Community
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-[#2563EB] transition-colors">
                  Cognitive Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Accessibility & Company */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A202C]">Accessibility</h4>
            <ul className="space-y-2 text-xs font-semibold text-[#64748B]">
              <li>
                <Link to="/about" className="hover:text-[#2563EB] transition-colors">
                  About NeuroBridge
                </Link>
              </li>
              <li>
                <span className="text-[#2563EB] font-bold">OpenDyslexic Engine</span>
              </li>
              <li>
                <span className="text-emerald-600 font-bold">WCAG AAA Contrast</span>
              </li>
              <li>
                <span className="text-purple-600 font-bold">JARVIS Voice Assistant</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] font-medium">
          <div>© 2026 NeuroBridge. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <span>Built with care for neurodivergent minds</span>
          </div>
        </div>
      </div>
    </footer>
  );
}