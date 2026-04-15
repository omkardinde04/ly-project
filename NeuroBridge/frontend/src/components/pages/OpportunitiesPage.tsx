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
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          💼 Career Opportunities
        </div>
        <h1 className={`font-black text-gray-900 leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
          Opportunities
        </h1>
        <p className="text-gray-500 text-lg mt-2 max-w-2xl leading-relaxed">
          Connect with dyslexia-friendly employers and career paths that value your unique strengths and thinking style.
        </p>
      </motion.div>

      {/* ── What This Offers ── */}
      <motion.div {...fade(0.1)} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What This Offers</h2>
        <p className="text-gray-500 text-base mb-6">
          Our Opportunities platform connects you with inclusive employers and career paths that value your strengths.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-blue-500">✓</span> Job Features
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {[
                'Simplified job descriptions',
                'Audio summaries for each position',
                'Accessibility-focused employers',
                'One-click application assistance',
                'Visual company information',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 rounded-xl p-5">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-500">⭐</span> Competitions & Internships
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {[
                'Hackathons and challenges',
                'Paid internship programs',
                'Clear eligibility criteria',
                'Deadline tracking',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Partner Platforms</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'LinkedIn', sub: 'Professional networking and jobs', color: 'text-[#0A66C2]' },
              { label: 'Unstop', sub: 'Competitions and internships', color: 'text-[#E93E30]' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className={`text-xl font-black mb-1 ${c.color}`}>{c.label}</div>
                <p className="text-gray-500 text-xs">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Insights ── */}
      <motion.div {...fade(0.2)}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Insights</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { value: '78%', label: 'Dyslexic adults are employed full-time', color: 'from-blue-500 to-blue-600' },
            { value: '2×', label: 'More likely to start own business', color: 'from-purple-500 to-purple-600' },
            { value: '500+', label: 'Inclusive employers worldwide', color: 'from-orange-500 to-orange-600' },
            { value: '91%', label: 'Excel in creative & visual roles', color: 'from-green-500 to-green-600' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-md`}>
              <div className="text-2xl font-black mb-1">{stat.value}</div>
              <div className="text-xs font-medium opacity-90 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-blue-500">💼</span> Career Success Tips
            </h3>
            <ul className="space-y-2.5">
              {[
                'Highlight your strengths — creativity, big-picture thinking, spatial skills.',
                'Request reasonable accommodations early — extra time, written instructions.',
                'Seek employers with neurodiversity inclusion policies.',
                'Use assistive tools: spell-checkers, voice-to-text, mind-mapping apps.',
                'Network in neurodiversity communities for peer mentorship.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 shadow-sm p-5">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-500">🏆</span> Dyslexic Leaders
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Richard Branson', role: 'CEO, Virgin Group', note: 'Attributes business success to dyslexic out-of-the-box thinking.' },
                { name: 'Ingvar Kamprad', role: 'Founder, IKEA', note: 'Built a global empire by simplifying complex ideas visually.' },
                { name: 'Charles Schwab', role: 'Founder, Charles Schwab Corp.', note: 'Revolutionised investing, crediting perseverance shaped by dyslexia.' },
              ].map((leader, i) => (
                <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="font-bold text-gray-800 text-sm">{leader.name}</div>
                  <div className="text-purple-600 text-xs font-medium">{leader.role}</div>
                  <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{leader.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🔬</div>
            <div>
              <h3 className="font-bold text-lg mb-1">Workplace Research Highlight</h3>
              <p className="text-sm leading-relaxed opacity-90">
                Research by the British Dyslexia Association found that dyslexic employees score significantly higher in roles requiring lateral thinking, creative storytelling, and innovation — making them invaluable in tech, design, architecture, and leadership.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
