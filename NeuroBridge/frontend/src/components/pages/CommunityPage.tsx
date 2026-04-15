import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CommunityIllustration } from '../ui/PageIllustrations';


// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    icon: '🤝',
    color: 'bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100',
    title: 'Peer Support',
    desc: 'Connect with users who share similar learning styles and experiences.',
  },
  {
    icon: '💡',
    color: 'bg-purple-50',
    iconBg: 'bg-purple-100 text-purple-600',
    border: 'border-purple-100',
    title: 'Learning Strategies',
    desc: 'Explore reading and writing techniques that have worked for others.',
  },
  {
    icon: '🌱',
    color: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
    title: 'Shared Experiences',
    desc: 'Understand how others manage day-to-day challenges with dyslexia.',
  },
];

const CHIPS = [
  { label: 'Audio learning preference', icon: '🎧' },
  { label: 'Large text preference', icon: '🔡' },
  { label: 'Visual examples help', icon: '🖼️' },
  { label: 'Short instructions preferred', icon: '📝' },
];

const STATIC_TIPS = [
  {
    tag: 'Reading Strategy',
    tagColor: 'bg-blue-100 text-blue-700',
    text: '"Increased spacing between lines improved my readability significantly."',
    avatar: '🌸',
  },
  {
    tag: 'Learning Preference',
    tagColor: 'bg-purple-100 text-purple-700',
    text: '"Audio summaries help me reduce reading load on long documents."',
    avatar: '🌿',
  },
];

const HOW_IT_HELPS = [
  { icon: '💬', text: 'Share your own experiences without pressure' },
  { icon: '🔍', text: 'Discover strategies that work for people like you' },
  { icon: '📚', text: 'Learn from others\' reading and writing journeys' },
  { icon: '🛠️', text: 'Explore accessibility tools recommended by the community' },
];

const AUDIO_TEXT =
  'Community Support. Connect with others, share learning strategies, and explore dyslexia-friendly experiences. ' +
  'Features include Peer Support, Learning Strategies, and Shared Experiences. ' +
  'Join the community to discover what helps others like you.';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CommunityPage() {
  const navigate = useNavigate();
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* ── Page Header ── */}
      <motion.div {...fade(0)}>
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          👥 Community Support
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
          Learn From Others <span className="text-blue-600">Like You</span>
        </h1>
        <p className="text-gray-500 text-lg mt-2 max-w-2xl leading-relaxed">
          Connect with others, share learning strategies, and explore dyslexia-friendly experiences.
        </p>
      </motion.div>

      {/* ══ SECTION 1 — WHAT WE OFFER ════════════════════════════════════════ */}
      <motion.div {...fade(0.1)}>
        <h2 className="text-xl font-black text-gray-800 mb-4">What the Community Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`${card.color} border-2 ${card.border} rounded-2xl p-6 cursor-default`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${card.iconBg}`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1.5">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══ SECTION 2 — INTERACTION PREVIEW CHIPS ═══════════════════════════ */}
      <motion.div {...fade(0.2)} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-800 mb-1">Community Preferences Preview</h2>
        <p className="text-gray-400 text-sm mb-4">Tap to preview — these are example interactions</p>
        <div className="flex flex-wrap gap-2.5">
          {CHIPS.map((chip) => {
            const active = activeChip === chip.label;
            return (
              <button
                key={chip.label}
                onClick={() => setActiveChip(active ? null : chip.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                    : 'bg-slate-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span>{chip.icon}</span>
                {chip.label}
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {activeChip && (
            <motion.div
              key={activeChip}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3"
            >
              <span className="text-blue-500 text-xl">✓</span>
              <p className="text-blue-700 text-sm font-semibold">
                Many community members share this preference — you're not alone.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ══ SECTION 3 — STATIC COMMUNITY TIPS ═══════════════════════════════ */}
      <motion.div {...fade(0.25)}>
        <h2 className="text-lg font-black text-gray-800 mb-4">From the Community</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATIC_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg shrink-0">
                {tip.avatar}
              </div>
              <div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tip.tagColor} mb-2 inline-block`}>
                  {tip.tag}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{tip.text}</p>
                <p className="text-gray-400 text-xs mt-2">— Community member <span className="italic">(preview)</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══ SECTION 4 — HOW IT HELPS ═════════════════════════════════════════ */}
      <motion.div {...fade(0.3)} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 p-6">
        <h2 className="text-lg font-black text-gray-800 mb-4">How It Helps You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOW_IT_HELPS.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100 shadow-sm">
              <span className="text-xl shrink-0">{item.icon}</span>
              <p className="text-gray-700 text-sm font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══ SECTION 5 — CTA ══════════════════════════════════════════════════ */}
      <motion.div {...fade(0.35)} className="text-center pb-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="text-4xl mb-3">👥</div>
            <h2 className="text-2xl font-black mb-2">Ready to join?</h2>
            <p className="text-blue-100 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Create an account or log in to access the full community experience.
            </p>

            <div className="flex items-center justify-center">
              <motion.button
                onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white text-blue-700 font-black px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                Join Community
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══ ACCESS GATE MODAL ══════════════════════════════════════════════════ */}
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
            {/* Gradient header */}
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

            {/* Options */}
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
    </div>
  );
}
