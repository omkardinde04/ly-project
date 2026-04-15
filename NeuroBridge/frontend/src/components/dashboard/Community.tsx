import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PATHS = [
  { id: 'study', label: 'Study Help', icon: '📚', color: 'from-blue-500 to-blue-600' },
  { id: 'reading', label: 'Reading Support', icon: '📖', color: 'from-purple-500 to-purple-600' },
  { id: 'writing', label: 'Writing Help', icon: '✏️', color: 'from-emerald-500 to-emerald-600' },
  { id: 'tools', label: 'Find Tools', icon: '🛠️', color: 'from-amber-500 to-amber-600' },
];

const PROMPTS = [
  {
    id: 'reading-help',
    question: 'What helps you while reading?',
    icon: '📖',
    options: ['Large text', 'Audio version', 'Highlighted lines', 'Short paragraphs', 'Dark mode'],
  },
  {
    id: 'learning-format',
    question: 'Which learning format works best?',
    icon: '🎯',
    options: ['Videos', 'Audio clips', 'Visual diagrams', 'Bullet points', 'Step-by-step'],
  },
  {
    id: 'struggle',
    question: 'What do you find most challenging?',
    icon: '💭',
    options: ['Long paragraphs', 'Remembering text', 'Writing clearly', 'Following instructions', 'Exams'],
  },
  {
    id: 'tool',
    question: 'What tool improved your experience?',
    icon: '🛠️',
    options: ['Text-to-speech', 'Spell checker', 'Dyslexia fonts', 'Note recorder', 'Screen tint'],
  },
];

const REACTIONS = [
  { id: 'audio', label: 'I prefer audio learning', icon: '🎧', count: 148 },
  { id: 'track', label: 'I lose track while reading', icon: '🔄', count: 213 },
  { id: 'large', label: 'Large text helps me', icon: '🔡', count: 179 },
  { id: 'toomuch', label: 'Too much text feels heavy', icon: '😮‍💨', count: 267 },
  { id: 'visual', label: 'Visual examples help me', icon: '🖼️', count: 195 },
  { id: 'quiet', label: 'I need a quiet environment', icon: '🤫', count: 134 },
];

const EXPERIENCE_GROUPS = [
  { id: 'audio-first', label: 'Audio-First Learners', icon: '🎧', color: 'bg-purple-100 text-purple-700', count: 218 },
  { id: 'visual', label: 'Visual Learners', icon: '👁️', color: 'bg-blue-100 text-blue-700', count: 194 },
  { id: 'short-text', label: 'Short Text Preference', icon: '📝', color: 'bg-emerald-100 text-emerald-700', count: 156 },
  { id: 'slow-read', label: 'Slow Reading Pace', icon: '🐢', color: 'bg-amber-100 text-amber-700', count: 143 },
  { id: 'text-speech', label: 'Text-to-Speech Users', icon: '🔊', color: 'bg-pink-100 text-pink-700', count: 201 },
  { id: 'structured', label: 'Need Structure', icon: '🗂️', color: 'bg-teal-100 text-teal-700', count: 88 },
];

const GROUP_TIPS: Record<string, string[]> = {
  'audio-first': ['Use text-to-speech for all emails', 'Listen to audiobooks at 1.5× speed', 'Record voice notes instead of writing'],
  'visual': ['Use mind maps for planning', 'Color-code your notes', 'Draw diagrams before writing'],
  'short-text': ['Break every task into 3-step chunks', 'Use bullet points always', 'Delete filler words first'],
  'slow-read': ['Use a ruler or finger to track lines', 'Read first and last sentences of each paragraph', 'Take regular short breaks'],
  'text-speech': ['Set reading speed to 0.85×', 'Use a different voice per topic', 'Pair listening with highlighting'],
  'structured': ['Always use checklists', 'Set a timer for each task', 'Use table of contents for every doc'],
};

const SCENARIOS = [
  {
    id: 'long-para',
    label: 'Reading Long Paragraphs',
    icon: '📄',
    tips: ['Break it at every full stop', 'Read one sentence at a time', 'Use a screen overlay to focus one line'],
  },
  {
    id: 'instructions',
    label: 'Following Instructions',
    icon: '📋',
    tips: ['Rewrite them in your own words', 'Number each step yourself', 'Highlight action words'],
  },
  {
    id: 'notes',
    label: 'Taking Notes',
    icon: '✏️',
    tips: ['Record audio instead of writing', 'Use bullet points, not sentences', 'Draw a quick sketch for key ideas'],
  },
  {
    id: 'emails',
    label: 'Reading Emails',
    icon: '📧',
    tips: ['Use text-to-speech to listen', 'Look for the main ask first', 'Reply with bullet points'],
  },
  {
    id: 'exams',
    label: 'Exam Preparation',
    icon: '📝',
    tips: ['Make flashcards with one fact each', 'Use spaced repetition apps', 'Speak answers aloud to remember'],
  },
];

const STRATEGIES = [
  { what: 'Large line spacing (1.8×)', usedFor: 'Reading paragraphs', by: 'Aisha M.' },
  { what: 'Text-to-speech for all emails', usedFor: 'Workplace reading', by: 'Daniel K.' },
  { what: 'Yellow screen overlay', usedFor: 'Reducing eye strain', by: 'Priya S.' },
  { what: 'Voice notes instead of writing', usedFor: 'Study revision', by: 'Rohan T.' },
  { what: 'Lexend font everywhere', usedFor: 'All reading tasks', by: 'Sara L.' },
  { what: 'Chunk reading into 3 sentences', usedFor: 'Long documents', by: 'Amir R.' },
];

const POLLS = [
  {
    id: 'helps',
    question: 'What helps you most?',
    options: [
      { label: 'Audio', votes: 87 },
      { label: 'Large text', votes: 64 },
      { label: 'Colors', votes: 41 },
      { label: 'Spacing', votes: 73 },
    ],
  },
  {
    id: 'reading-pref',
    question: 'Reading preference?',
    options: [
      { label: 'Short text', votes: 102 },
      { label: 'Bullet points', votes: 91 },
      { label: 'Visuals', votes: 78 },
      { label: 'Audio', votes: 115 },
    ],
  },
];

const VOICE_CARDS = [
  { id: 1, title: 'How I manage long readings', duration: '0:28', avatar: '🌸' },
  { id: 2, title: 'My favourite dyslexia tool', duration: '0:41', avatar: '🌿' },
  { id: 3, title: 'What helped in exams', duration: '0:19', avatar: '🌊' },
  { id: 4, title: 'My reading strategy at work', duration: '0:33', avatar: '🌻' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0">{icon}</div>
      <div>
        <h2 className="font-black text-gray-800 text-lg leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={() => speak(title + '. ' + (subtitle ?? ''))}
        className="ml-auto text-gray-300 hover:text-blue-400 text-xl transition-colors shrink-0" title="Listen">🔊</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Community() {
  // Path selection
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Prompts
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});
  const [promptText, setPromptText] = useState('');

  // Reactions
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [reactionCounts, setReactionCounts] = useState(() =>
    Object.fromEntries(REACTIONS.map(r => [r.id, r.count]))
  );

  // Experience groups
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Scenarios
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Polls
  const [pollVotes, setPollVotes] = useState<Record<string, string>>({});
  const [pollCounts, setPollCounts] = useState(() =>
    Object.fromEntries(POLLS.map(p => [p.id, Object.fromEntries(p.options.map(o => [o.label, o.votes]))]))
  );

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'done'>('idle');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleReaction = (id: string) => {
    const next = new Set(userReactions);
    if (next.has(id)) {
      next.delete(id);
      setReactionCounts(prev => ({ ...prev, [id]: prev[id] - 1 }));
    } else {
      next.add(id);
      setReactionCounts(prev => ({ ...prev, [id]: prev[id] + 1 }));
    }
    setUserReactions(next);
  };

  const handlePollVote = (pollId: string, option: string) => {
    if (pollVotes[pollId]) return; // already voted
    setPollVotes(prev => ({ ...prev, [pollId]: option }));
    setPollCounts(prev => ({
      ...prev,
      [pollId]: { ...prev[pollId], [option]: prev[pollId][option] + 1 },
    }));
  };

  const handleStartRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge for voice recording.'); return; }
    const r = new SR();
    recognitionRef.current = r;
    r.lang = 'en-US';
    r.onstart = () => { setIsRecording(true); setRecordingStatus('recording'); };
    r.onend = () => { setIsRecording(false); setRecordingStatus('done'); recognitionRef.current = null; };
    r.onerror = () => { setIsRecording(false); setRecordingStatus('idle'); };
    r.start();
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
  };

  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => REACTIONS.find(r => r.id === id)!);

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">

      {/* ══════════════════════════════════ HEADER */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-6 text-white">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black mb-1">Community Space</h1>
              <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                Guided, structured, and low-pressure. Share experiences through simple interactions.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['No long posts', 'Voice-first', 'Guided prompts', 'Safe space'].map(tag => (
                  <span key={tag} className="bg-white/15 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => speak('Welcome to Community Space. A guided, structured, low-pressure space to share your experiences.')}
              className="shrink-0 bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all"
              title="Listen to welcome"
            ><span className="text-2xl">🔊</span></button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════ 1. PATH SELECTION */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="🧭" title="What do you need today?" subtitle="Choose a path — we'll show you relevant content" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PATHS.map(path => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                selectedPath === path.id
                  ? `bg-gradient-to-br ${path.color} text-white border-transparent shadow-md`
                  : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-2xl">{path.icon}</span>
              {path.label}
            </button>
          ))}
        </div>
        {selectedPath && (
          <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-blue-600 font-semibold bg-blue-50 rounded-xl px-4 py-2">
            ✓ Showing content for: {PATHS.find(p => p.id === selectedPath)?.label}
          </motion.p>
        )}
      </motion.section>

      {/* ══════════════════════════════════ 2. PROMPT CARDS */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="💬" title="Guided Prompts" subtitle="Tap a question — answer with one click or your voice" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {PROMPTS.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => setActivePrompt(activePrompt === prompt.id ? null : prompt.id)}
              className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                activePrompt === prompt.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-slate-50 hover:border-blue-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{prompt.icon}</span>
                <p className="font-semibold text-gray-800 text-sm leading-snug">{prompt.question}</p>
                <svg className={`ml-auto h-4 w-4 text-gray-400 shrink-0 transition-transform ${activePrompt === prompt.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded prompt */}
        <AnimatePresence>
          {activePrompt && (() => {
            const prompt = PROMPTS.find(p => p.id === activePrompt)!;
            const answered = promptAnswers[activePrompt];
            return (
              <motion.div key={activePrompt} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 mb-3">{prompt.question}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prompt.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPromptAnswers(prev => ({ ...prev, [activePrompt]: opt }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                          answered === opt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                        }`}
                      >{opt}</button>
                    ))}
                  </div>
                  {answered && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-blue-700 font-semibold bg-blue-100 rounded-lg px-3 py-2">
                      ✓ You selected: <strong>{answered}</strong> — shared with community
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </motion.section>

      {/* ══════════════════════════════════ 3. QUICK REACTION BOARD */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="⚡" title="Quick Reaction Board" subtitle="Tap what describes you — see what others relate to" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {REACTIONS.map(r => {
            const active = userReactions.has(r.id);
            const count = reactionCounts[r.id];
            return (
              <button
                key={r.id}
                onClick={() => handleReaction(r.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span className="text-xl shrink-0">{r.icon}</span>
                <span className="flex-1 text-sm font-semibold">{r.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top results */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Most users relate to:</p>
          <div className="space-y-2">
            {topReactions.map((r, i) => {
              const count = reactionCounts[r.id];
              const max = Math.max(...Object.values(reactionCounts));
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{r.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-gray-700">{r.label}</span>
                      <span className="text-xs font-bold text-blue-600">{count}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-400' : 'bg-blue-300'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════ 4. EXPERIENCE MATCH */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="🤝" title="Users with Similar Experiences" subtitle="Tap a group to see tips from people like you" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EXPERIENCE_GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                activeGroup === group.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-100 bg-slate-50 hover:border-blue-200'
              }`}
            >
              <span className={`px-2.5 py-1 rounded-lg text-lg ${group.color} font-bold`}>{group.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">{group.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{group.count} members</p>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {activeGroup && (
            <motion.div key={activeGroup} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} className="mt-4">
              <div className="bg-slate-50 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Tips from {EXPERIENCE_GROUPS.find(g => g.id === activeGroup)?.label}
                </p>
                <div className="space-y-2">
                  {(GROUP_TIPS[activeGroup] ?? []).map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                      <span className="text-blue-400 font-black text-sm mt-0.5">→</span>
                      <p className="text-sm text-gray-700 flex-1">{tip}</p>
                      <button onClick={() => speak(tip)} className="text-gray-300 hover:text-blue-400 shrink-0">🔊</button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ══════════════════════════════════ 5. SCENARIO DISCUSSIONS */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="🎭" title="Scenario Discussions" subtitle="Select a situation — see tips from the community" />
        <div className="flex flex-wrap gap-2 mb-4">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(activeScenario === s.id ? null : s.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                activeScenario === s.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {activeScenario && (() => {
            const scenario = SCENARIOS.find(s => s.id === activeScenario)!;
            return (
              <motion.div key={activeScenario}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{scenario.icon}</span>
                    <p className="font-bold text-purple-800 text-sm">{scenario.label} — Community Tips</p>
                  </div>
                  <div className="space-y-2">
                    {scenario.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white rounded-lg px-3 py-3 border border-purple-100">
                        <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-700 flex-1 leading-relaxed">{tip}</p>
                        <button onClick={() => speak(tip)} className="text-gray-300 hover:text-purple-400 shrink-0">🔊</button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </motion.section>

      {/* ══════════════════════════════════ 6. VOICE SECTION */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="🎙️" title="Voice Community" subtitle="Listen to others. Share your own voice — no typing needed" />

        {/* Record */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border-2 mb-5 transition-all ${
          recordingStatus === 'recording' ? 'border-red-300 bg-red-50' : 'border-dashed border-gray-200 bg-slate-50'
        }`}>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">⭐</div>
          <div className="flex-1">
            {recordingStatus === 'idle' && <p className="text-sm text-gray-600 font-medium">Share a short voice message with the community</p>}
            {recordingStatus === 'recording' && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <p className="text-sm text-red-600 font-bold">Recording… speak now</p>
              </div>
            )}
            {recordingStatus === 'done' && <p className="text-sm text-green-600 font-semibold">✓ Message recorded! It will appear in the community.</p>}
          </div>
          {recordingStatus !== 'recording' ? (
            <button
              onClick={handleStartRecording}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all"
            >🎤 Record</button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all"
            >⏹ Stop</button>
          )}
        </div>

        {/* Voice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VOICE_CARDS.map(card => (
            <div key={card.id}
              className="flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-200 transition-all">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">{card.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{card.title}</p>
                <p className="text-xs text-gray-400">{card.duration}</p>
              </div>
              <button
                onClick={() => { setPlayingId(playingId === card.id ? null : card.id); speak(card.title); }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  playingId === card.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500'
                }`}
              >
                {playingId === card.id ? '⏸' : '▶'}
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════ 7. STRATEGIES WALL */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="💡" title="Helpful Strategies Wall" subtitle="What worked — shared in simple, structured cards" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRATEGIES.map((s, i) => (
            <div key={i} className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="mb-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">What helped</p>
                <p className="text-sm font-bold text-gray-800">{s.what}</p>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Used for</p>
                <p className="text-sm text-gray-600">{s.usedFor}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                <p className="text-xs text-gray-400">— {s.by}</p>
                <button onClick={() => speak(`${s.what}. Used for ${s.usedFor}`)}
                  className="text-gray-300 hover:text-blue-400 transition-colors">🔊</button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════ 8. POLLS */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <SectionHeader icon="📊" title="Community Polls" subtitle="One tap to vote — see live results instantly" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {POLLS.map(poll => {
            const voted = pollVotes[poll.id];
            const counts = pollCounts[poll.id];
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            return (
              <div key={poll.id} className="bg-slate-50 border border-gray-200 rounded-xl p-4">
                <p className="font-bold text-gray-800 text-sm mb-3">{poll.question}</p>
                <div className="space-y-2">
                  {poll.options.map(opt => {
                    const pct = Math.round((counts[opt.label] / total) * 100);
                    const isVoted = voted === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handlePollVote(poll.id, opt.label)}
                        disabled={!!voted}
                        className={`w-full text-left rounded-lg overflow-hidden border-2 transition-all ${
                          isVoted ? 'border-blue-500' : voted ? 'border-gray-100' : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative px-3 py-2">
                          {voted && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={`absolute inset-y-0 left-0 rounded-lg ${isVoted ? 'bg-blue-100' : 'bg-gray-100'}`}
                            />
                          )}
                          <div className="relative flex items-center justify-between">
                            <span className={`text-sm font-semibold ${isVoted ? 'text-blue-700' : 'text-gray-700'}`}>
                              {isVoted && '✓ '}{opt.label}
                            </span>
                            {voted && <span className="text-xs font-bold text-gray-500">{pct}%</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!voted && <p className="text-xs text-gray-400 mt-2 text-center">Tap to vote</p>}
                {voted && <p className="text-xs text-blue-600 font-semibold mt-2 text-center">✓ {total} responses so far</p>}
              </div>
            );
          })}
        </div>
      </motion.section>

    </div>
  );
}
