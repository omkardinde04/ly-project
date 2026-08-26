import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Calendar, ArrowRight, Radio } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';

interface CommunityWidgetProps {
  onNavigate: (tab: string) => void;
}

export function CommunityWidget({ onNavigate }: CommunityWidgetProps) {
  const { language } = useDyslexia();
  const { token } = useAuth();
  const t = getTranslation(language);

  const [postsCount, setPostsCount] = useState<number>(0);
  const [latestPostTitle, setLatestPostTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4000/api/community/posts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.posts && Array.isArray(data.posts)) {
          setPostsCount(data.posts.length);
          if (data.posts[0]?.title) {
            setLatestPostTitle(data.posts[0].title);
          }
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-sm hover:border-blue-200 transition-all"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1A202C]">
                {t.community || 'Peer Study Circle'}
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Collaborative learning & support
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio size={12} className="text-emerald-500 animate-pulse" />
            {postsCount > 0 ? `${postsCount} Discussions` : 'Active Hub'}
          </span>
        </div>

        {/* Live Event / Discussion Preview */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Community Pulse
            </span>
            <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
              <Calendar size={11} /> Live Forum
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-[#1A202C] mt-1.5">
            {latestPostTitle ? latestPostTitle : 'Phonics & Multisensory Reading Exchange'}
          </h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            Share tips, ask peers questions, and participate in daily reading sprints.
          </p>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <span className="font-semibold text-[#64748B]">Inclusive Peer Community</span>
            <span className="font-bold text-[#2563EB]">Join Discussion →</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={() => onNavigate('community')}
        className="w-full h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs sm:text-sm transition-all border border-blue-200/80 flex items-center justify-center gap-2 group shrink-0"
      >
        <MessageCircle size={15} />
        <span>Join Community Hub</span>
        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
