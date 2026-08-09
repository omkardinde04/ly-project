import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export function Learn() {
  const { isDyslexiaMode } = useDyslexia();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* ── Page Header ── */}
      <motion.div {...fade(0)}>
        <div className="inline-flex items-center gap-2 bg-coral-soft text-coral font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          📚 Learning Platform
        </div>
        <h1 className={`font-black text-text leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
          Learn Your Way
        </h1>
        <p className="text-text-muted text-lg mt-2 max-w-2xl leading-relaxed">
          Personalised, visual-first learning.
        </p>
      </motion.div>

      {/* ── What This Offers ── */}
      <motion.div {...fade(0.1)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-text mb-2">What This Offers</h2>
        <p className="text-text-muted text-base mb-6">
          Education made accessible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface-2 rounded-xl p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">✓</span> Key Features
            </h3>
            <ul className="space-y-2 text-text text-sm">
              {[
                'Audio-supported lessons',
                'Visual learning aids',
                'Self-paced progress',
                'Interactive exercises',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-2 rounded-xl p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">💡</span> Learning Methods
            </h3>
            <ul className="space-y-2 text-text text-sm">
              {[
                'Phonics-based reading',
                'Multisensory techniques',
                'Gamified experiences',
                'Personalised paths',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 bg-surface-2 rounded-xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-3">Course Categories</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Reading', sub: 'Phonics, fluency' },
              { label: 'Writing', sub: 'Spelling, grammar' },
              { label: 'Math', sub: 'Problem-solving' },
            ].map((c, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4 text-center shadow-sm">
                <div className={`text-xl font-black mb-1 text-text`}>{c.label}</div>
                <p className="text-text-muted text-xs">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Insights ── */}
      <motion.div {...fade(0.2)}>
        <h2 className="text-2xl font-bold text-text mb-4">Insights</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { value: '1 in 5', label: 'People have dyslexia' },
            { value: '3×', label: 'Faster learning' },
            { value: '85%', label: 'Improve with phonics' },
            { value: '40+', label: 'Languages supported' },
          ].map((stat, i) => (
            <div key={i} className={`bg-surface border border-border rounded-2xl p-5 text-text shadow-sm`}>
              <div className="text-2xl font-black mb-1 text-text">{stat.value}</div>
              <div className="text-xs font-medium text-text-muted leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">💡</span> Expert Learning Tips
            </h3>
            <ul className="space-y-2.5">
              {[
                'Break reading into 10–15 min chunks.',
                'Use overlays to reduce visual stress.',
                'Listen to text read aloud.',
                'Practice spelling with movement.',
                'Celebrate small wins daily.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-coral-soft text-coral text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-text-muted">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-2 rounded-xl border border-border shadow-sm p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-coral">🌟</span> Success Spotlight
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Richard Branson', note: 'Founder of Virgin Group.' },
                { name: 'Agatha Christie', note: 'Best-selling novelist.' },
                { name: 'Steven Spielberg', note: 'Legendary filmmaker.' },
              ].map((p, i) => (
                <div key={i} className="bg-surface border border-border rounded-lg p-3 shadow-sm">
                  <div className="font-bold text-text text-sm">{p.name}</div>
                  <div className="text-text-muted text-xs mt-0.5 leading-relaxed">{p.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 bg-surface-2 border border-border rounded-2xl p-6 text-text shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">📊</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Research Highlight</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                Studies show dyslexic individuals excel in spatial reasoning and creative problem-solving.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
