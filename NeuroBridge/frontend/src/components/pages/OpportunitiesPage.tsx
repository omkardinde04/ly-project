import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export function OpportunitiesPage() {
  const { isDyslexiaMode } = useDyslexia();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* ── Page Header ── */}
      <motion.div {...fade(0)}>
        <div className="inline-flex items-center gap-2 bg-coral-soft text-coral font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          💼 Career Opportunities
        </div>
        <h1 className={`font-black text-text leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
          Opportunities
        </h1>
        <p className="text-text-muted text-lg mt-2 max-w-2xl leading-relaxed">
          Connect with inclusive employers who value your unique strengths.
        </p>
      </motion.div>

      {/* ── What This Offers ── */}
      <motion.div {...fade(0.1)} className="bg-surface rounded-2xl border border-blue-100 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-text mb-2">What This Offers</h2>
        <p className="text-text-muted text-base mb-6">
          Find inclusive career paths.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-bold text-base text-text mb-3 flex items-center gap-2">
              <span className="text-blue-500">✓</span> Job Features
            </h3>
            <ul className="space-y-2 text-text text-sm">
              {[
                'Simplified job descriptions',
                'Audio summaries available',
                'Accessibility-focused employers',
                'One-click assistance',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-2 rounded-xl p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-coral">⭐</span> Competitions & Internships
            </h3>
            <ul className="space-y-2 text-text text-sm">
              {[
                'Hackathons and challenges',
                'Paid internship programs',
                'Clear eligibility criteria',
                'Deadline tracking',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-text-muted">
                  <span className="text-primary font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 bg-surface-2 rounded-xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-3">Partner Platforms</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'LinkedIn', sub: 'Professional networking and jobs', color: 'text-[#0A66C2]' },
              { label: 'Unstop', sub: 'Competitions and internships', color: 'text-[#E93E30]' },
            ].map((c, i) => (
              <div key={i} className="bg-surface rounded-xl p-4 text-center shadow-sm">
                <div className={`text-xl font-black mb-1 ${c.color}`}>{c.label}</div>
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
            { value: '78%', label: 'Dyslexic adults are employed full-time' },
            { value: '2×', label: 'More likely to start own business' },
            { value: '500+', label: 'Inclusive employers worldwide' },
            { value: '91%', label: 'Excel in creative & visual roles' },
          ].map((stat, i) => (
            <div key={i} className={`bg-surface rounded-2xl p-6 text-text shadow-sm border border-border`}>
              <div className="text-3xl font-black mb-2 text-text">{stat.value}</div>
              <div className="text-sm font-medium text-text-muted leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface rounded-xl border border-blue-100 shadow-sm p-5">
            <h3 className="font-bold text-base text-text mb-3 flex items-center gap-2">
              <span className="text-blue-500">💼</span> Career Success Tips
            </h3>
            <ul className="space-y-2.5">
              {[
                'Highlight your unique strengths.',
                'Request reasonable accommodations.',
                'Seek inclusive employers.',
                'Use assistive tools.',
                'Network for mentorship.',
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
              <span className="text-coral">🏆</span> Dyslexic Leaders
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Richard Branson', role: 'CEO, Virgin Group', note: 'Credits his success to dyslexic thinking.' },
                { name: 'Ingvar Kamprad', role: 'Founder, IKEA', note: 'Simplified complex ideas visually.' },
                { name: 'Charles Schwab', role: 'Founder, Charles Schwab', note: 'Revolutionised investing with perseverance.' },
              ].map((leader, i) => (
                <div key={i} className="bg-surface rounded-lg p-3 shadow-sm">
                  <div className="font-bold text-text mb-0.5">{leader.name}</div>
                  <div className="text-primary text-xs font-medium">{leader.role}</div>
                  <div className="text-text-muted text-xs mt-0.5 leading-relaxed">{leader.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 bg-surface-2 border border-border rounded-2xl p-6 text-text shadow-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🔬</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Workplace Research Highlight</h3>
              <p className="text-sm leading-relaxed text-text-muted">
                Research shows dyslexic employees excel in lateral thinking, creative storytelling, and innovation.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
