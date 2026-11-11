import { motion } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { FeatureAccessCTA } from '../ui/FeatureAccessCTA';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const FEATURES = [
  {
    emoji: '💬',
    title: 'Discussions',
    desc: 'Ask questions, share tips and read what other learners found helpful.',
  },
  {
    emoji: '🤝',
    title: 'Peer Circle',
    desc: 'Find learners like you and add them as study friends.',
  },
  {
    emoji: '✉️',
    title: 'Messages',
    desc: 'Chat one-to-one with your study friends.',
  },
];

/** Public overview of Community, shown before someone can use the real thing. */
export function CommunityPreview() {
  const { isDyslexiaMode } = useDyslexia();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <motion.div {...fade(0)}>
        <div className="inline-flex items-center gap-2 bg-coral-soft text-coral font-bold text-sm px-4 py-1.5 rounded-full mb-3">
          👥 Community
        </div>
        <h1 className={`font-black text-text leading-tight ${isDyslexiaMode ? 'text-4xl' : 'text-4xl md:text-5xl'}`}>
          Learn Together
        </h1>
        <p className="text-text-muted text-lg mt-2 max-w-2xl leading-relaxed">
          A friendly, safe place to learn with people who read and think like you.
        </p>
      </motion.div>

      <motion.div {...fade(0.1)} className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-text mb-2">What This Offers</h2>
        <p className="text-text-muted text-base mb-6">Support from peers who understand.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface-2 rounded-xl border border-border p-5">
              <div className="text-3xl mb-3" aria-hidden="true">{f.emoji}</div>
              <h3 className="text-lg font-bold text-text mb-1">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-surface-2 rounded-xl p-5 border border-border">
          <h3 className="text-lg font-bold text-text mb-3">Why join?</h3>
          <ul className="space-y-2 text-text text-sm">
            {[
              'No judgement: everyone here is learning too',
              'Short, easy-to-read posts',
              'Make friends to study and practise with',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div {...fade(0.2)}>
        <FeatureAccessCTA featureName="Community" />
      </motion.div>
    </div>
  );
}
