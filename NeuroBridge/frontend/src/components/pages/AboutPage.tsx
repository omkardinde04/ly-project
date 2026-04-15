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
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          🧠 About NeuroBridge
        </div>
        <h1 className={`font-black text-gray-900 leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
          About Us
        </h1>
        <p className="text-gray-500 text-lg mt-2 max-w-2xl leading-relaxed">
          We're dedicated to making education and career opportunities accessible for individuals with dyslexia through evidence-based, personalised technology.
        </p>
      </motion.div>

      {/* ── Mission ── */}
      <motion.div {...fade(0.1)} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Our Mission</h2>
        <p className="text-gray-500 text-base mb-6">
          NeuroBridge is committed to creating a more inclusive world for individuals with dyslexia. We believe that with the right tools and support, every person can thrive academically and professionally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-blue-500">🎯</span> What We Do
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {[
                'Provide comprehensive dyslexia assessments',
                'Offer personalised learning recommendations',
                'Connect users with job opportunities',
                'Build supportive communities',
                'Advocate for accessibility in education',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 rounded-xl p-5">
            <h3 className="font-bold text-base text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-500">💎</span> Our Values
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {[
                'Inclusivity and accessibility first',
                'Evidence-based approaches',
                'User-centered design',
                'Privacy and data security',
                'Continuous improvement',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Platform Features</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Assess', sub: 'Comprehensive dyslexia testing', color: 'text-blue-600' },
              { label: 'Learn', sub: 'Personalised recommendations', color: 'text-purple-600' },
              { label: 'Connect', sub: 'Jobs and community support', color: 'text-green-600' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className={`text-xl font-black mb-1 ${c.color}`}>{c.label}</div>
                <p className="text-gray-500 text-xs">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div {...fade(0.2)}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { value: '10K+', label: 'Users supported', color: 'from-blue-500 to-blue-600' },
            { value: '92%', label: 'Report better focus', color: 'from-purple-500 to-purple-600' },
            { value: '3', label: 'Languages supported', color: 'from-pink-500 to-pink-600' },
            { value: '1,200+', label: 'Opportunities listed', color: 'from-green-500 to-green-600' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-md`}>
              <div className="text-2xl font-black mb-1">{stat.value}</div>
              <div className="text-xs font-medium opacity-90 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Us</h2>
          <p className="text-gray-500 text-base mb-4">Have questions or feedback? We'd love to hear from you.</p>
          <div className="inline-flex items-center gap-3 bg-blue-50 rounded-xl px-5 py-3 border border-blue-100">
            <span className="text-blue-500 text-lg">✉️</span>
            <div>
              <div className="text-xs text-gray-500 font-medium">Email</div>
              <div className="font-bold text-blue-600 text-sm">contact@neurobridge.com</div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
