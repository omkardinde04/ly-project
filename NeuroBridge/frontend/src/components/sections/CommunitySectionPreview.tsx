import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ── Static data ───────────────────────────────────────────────────────────────

const PREVIEW_CARDS = [
  {
    id: 'reading',
    icon: '📖',
    color: 'bg-blue-50 text-blue-600',
    ringColor: 'group-hover:ring-blue-200',
    title: 'Reading Strategies',
    desc: 'Discover what helps others while reading',
  },
  {
    id: 'learning',
    icon: '🎧',
    color: 'bg-purple-50 text-purple-600',
    ringColor: 'group-hover:ring-purple-200',
    title: 'Learning Preferences',
    desc: 'Explore visual, audio, and simplified learning styles',
  },
  {
    id: 'experiences',
    icon: '🤝',
    color: 'bg-emerald-50 text-emerald-600',
    ringColor: 'group-hover:ring-emerald-200',
    title: 'Shared Experiences',
    desc: 'Understand how others manage daily challenges',
  },
  {
    id: 'tools',
    icon: '🛠️',
    color: 'bg-amber-50 text-amber-600',
    ringColor: 'group-hover:ring-amber-200',
    title: 'Tools That Help',
    desc: 'Find accessibility tools used by community members',
  },
];

const CHIPS = [
  { label: 'Audio learning helps', icon: '🎧' },
  { label: 'Large text helps', icon: '🔡' },
  { label: 'Visuals help', icon: '🖼️' },
  { label: 'Short instructions help', icon: '📝' },
];

const TIPS = [
  { text: 'Using increased line spacing improved my reading speed noticeably.', author: 'Community member' },
  { text: 'Audio summaries help reduce reading fatigue on long documents.', author: 'Community member' },
];

const SECTION_SPEAK_TEXT =
  'Community Support. Connect with others, share learning strategies, and explore dyslexia-friendly experiences. ' +
  'Preview cards include: Reading Strategies, Learning Preferences, Shared Experiences, and Tools That Help.';

// ── Component ─────────────────────────────────────────────────────────────────

export function CommunitySectionPreview() {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(SECTION_SPEAK_TEXT);
    u.rate = 0.88;
    window.speechSynthesis.speak(u);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };

  return (
    <section
      id="community-preview"
      className="w-full mx-auto max-w-7xl"
      aria-label="Community Support Preview"
    >
      {/* ── Outer container ── */}
      <div className="bg-[#F5F9FD] rounded-[40px] p-8 md:p-12 lg:p-16 border border-white/50 shadow-sm">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-[#75A1DF] text-[#306CBE] bg-transparent px-5 py-1.5 rounded-full text-sm font-bold shadow-sm mb-4">
              <span>👥</span> Community
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1A2639] tracking-tight leading-tight">
              Learn from others<br className="hidden md:block" /> like you
            </h2>
            <p className="text-[#566B85] text-base md:text-lg font-medium mt-3 max-w-xl leading-relaxed">
              Connect with others, share learning strategies, and explore dyslexia-friendly experiences.
            </p>
          </div>

          <button
            onClick={handleSpeak}
            className="shrink-0 flex items-center gap-2 bg-white hover:bg-blue-50 border-2 border-[#D1E4F9] hover:border-blue-300 text-[#306CBE] font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            Listen to this section
          </button>
        </div>

        {/* ── Preview Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PREVIEW_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCard(activeCard === card.id ? null : card.id)}
              className={`group text-left bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ring-4 ring-transparent ${card.ringColor} ${
                activeCard === card.id ? 'border-blue-400 shadow-md' : 'border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-[#1A2639] text-base mb-1.5 leading-tight">{card.title}</h3>
              <p className="text-[#566B85] text-sm leading-relaxed">{card.desc}</p>
              {activeCard === card.id && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 text-xs text-blue-600 font-semibold bg-blue-50 rounded-lg px-3 py-1.5"
                >
                  Explore this in the community →
                </motion.p>
              )}
            </motion.button>
          ))}
        </div>

        {/* ── Quick interaction chips ── */}
        <div className="mb-10">
          <p className="text-xs font-bold text-[#566B85] uppercase tracking-wider mb-3">
            What community members say helps them:
          </p>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((chip) => {
              const active = activeChip === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => setActiveChip(active ? null : chip.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                    active
                      ? 'bg-[#4A90E2] text-white border-[#4A90E2] shadow-sm'
                      : 'bg-white text-[#306CBE] border-[#D1E4F9] hover:border-[#4A90E2] hover:bg-blue-50'
                  }`}
                >
                  <span>{chip.icon}</span>
                  {chip.label}
                </button>
              );
            })}
          </div>
          {activeChip && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-[#306CBE] font-medium bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 inline-block"
            >
              ✓ Many community members agree — this is one of the top-rated strategies.
            </motion.p>
          )}
        </div>

        {/* ── Static tip previews ── */}
        <div className="mb-10">
          <p className="text-xs font-bold text-[#566B85] uppercase tracking-wider mb-3">
            From the community:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg shrink-0">
                  💡
                </div>
                <div>
                  <p className="text-[#1A2639] text-sm font-medium leading-relaxed">
                    "{tip.text}"
                  </p>
                  <p className="text-[#566B85] text-xs mt-1.5">— {tip.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA button ── */}
        <div className="flex justify-center">
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 bg-[#4A90E2] hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all text-base"
          >
            <span>👥</span>
            Explore Community
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ACCESS GATE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* ── Gradient header ── */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 pt-8 pb-12">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-4xl mb-3">👥</div>
              <h2 className="text-2xl font-black text-white leading-tight">Join the Community</h2>
              <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                Choose how you'd like to get started — the community is personalised just for you!
              </p>
            </div>

            {/* ── Options (overlap the header slightly) ── */}
            <div className="px-8 pt-6 pb-4 -mt-4 space-y-4">

              {/* Login */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowModal(false); navigate('/login'); }}
                className="w-full flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:shadow-blue-200 transition-shadow">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-black text-gray-800 text-base">Login to your account</div>
                  <div className="text-gray-500 text-sm mt-0.5">Already have an account? Sign in to continue.</div>
                </div>
                <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Assessment */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowModal(false); navigate('/assessment'); }}
                className="w-full flex items-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:shadow-purple-200 transition-shadow">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-black text-gray-800 text-base">Take the Assessment</div>
                  <div className="text-gray-500 text-sm mt-0.5">New here? Start with a quick dyslexia assessment.</div>
                </div>
                <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center">
              <p className="text-gray-400 text-xs">
                🔒 Your data is private and secure. We never share personal information.
              </p>
            </div>

          </motion.div>
        </div>
      )}

    </section>
  );
}
