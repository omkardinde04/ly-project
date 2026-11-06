import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

export function AboutPage() {
  const { isDyslexiaMode } = useDyslexia();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* ── Page Header ── */}
      <motion.div {...fade(0)}>
        <div className="inline-flex items-center gap-2 bg-coral-soft text-coral font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          🧠 About NeuroBridge
        </div>
        <h1 className={`font-black text-text leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
          About Us
        </h1>
        <p className="text-text-muted text-lg mt-2 max-w-2xl leading-relaxed">
          Making education and careers accessible for individuals with dyslexia.
        </p>
      </motion.div>

      {/* ── Mission ── */}
      <motion.div {...fade(0.1)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-text mb-2">Our Mission</h2>
        <p className="text-text-muted text-base mb-6">
          Building a more inclusive world with the right tools and support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-surface-2 rounded-xl border border-border p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-coral">🎯</span> What We Do
            </h3>
            <ul className="space-y-2 text-text text-sm">
              {[
                'Dyslexia assessments',
                'Personalised learning',
                'Job opportunities',
                'Supportive communities',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-coral font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-2 rounded-xl border border-border p-5">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-coral">💎</span> Our Values
            </h3>
            <ul className="space-y-2 text-text text-sm">
              {[
                'Inclusivity first',
                'Evidence-based',
                'User-centered',
                'Privacy & security',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 bg-surface-2 rounded-xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-3">Platform Features</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Assess', sub: 'Comprehensive testing' },
              { label: 'Learn', sub: 'Personalised paths' },
              { label: 'Connect', sub: 'Jobs and community' },
            ].map((c, i) => (
              <div key={i} className="bg-surface rounded-xl p-4 text-center shadow-sm border border-border">
                <div className={`text-xl font-black mb-1 text-text`}>{c.label}</div>
                <p className="text-text-muted text-xs">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div {...fade(0.2)}>
        <h2 className="text-2xl font-bold text-text mb-4">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { value: '10K+', label: 'Users supported' },
            { value: '92%', label: 'Report better focus' },
            { value: '3', label: 'Languages supported' },
            { value: '1,200+', label: 'Opportunities listed' },
          ].map((stat, i) => (
            <div key={i} className={`bg-surface border border-border rounded-2xl p-5 text-text shadow-sm`}>
              <div className="text-2xl font-black mb-1 text-text">{stat.value}</div>
              <div className="text-xs font-medium text-text-muted leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-2xl font-bold text-text mb-2">Contact Us</h2>
          <p className="text-text-muted text-base mb-4">Have questions? We'd love to hear from you.</p>
          <div className="inline-flex items-center gap-3 bg-surface-2 rounded-xl px-5 py-3 border border-border">
            <span className="text-text text-lg">✉️</span>
            <div>
              <div className="text-xs text-text-muted font-medium">Email</div>
              <div className="font-bold text-text text-sm">contact@neurobridge.com</div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
