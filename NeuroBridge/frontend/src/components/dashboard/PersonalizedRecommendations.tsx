import { motion } from 'framer-motion';

export interface Career {
  title: string;
  match: number;
  reason: string;
  icon: string;
}

export interface LearningStep {
  step: number;
  title: string;
  duration: string;
  type: 'visual' | 'audio' | 'practical' | 'reading';
  icon: string;
}

export interface Internship {
  title: string;
  org: string;
  deadline: string;
  tags: string[];
}

export interface Competition {
  title: string;
  prize: string;
  tags: string[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  tip: string;
}

export interface Recommendations {
  careers: Career[];
  learningPath: LearningStep[];
  internships: Internship[];
  competitions: Competition[];
  skillGaps: SkillGap[];
}

interface Props {
  recommendations: Recommendations;
  userName?: string;
  onDisconnect: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  visual:    'bg-purple-100 text-purple-700',
  audio:     'bg-blue-100 text-blue-700',
  practical: 'bg-green-100 text-green-700',
  reading:   'bg-orange-100 text-orange-700',
};

function MatchBar({ value }: { value: number }) {
  const color = value >= 85 ? 'from-green-400 to-emerald-500'
    : value >= 70 ? 'from-blue-400 to-cyan-500'
    : 'from-orange-400 to-amber-500';
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <span className="text-xs font-black text-gray-600 w-10 text-right">{value}%</span>
    </div>
  );
}

export function PersonalizedRecommendations({ recommendations, userName, onDisconnect, onRegenerate, isRegenerating }: Props) {
  const { careers, learningPath, internships, competitions, skillGaps } = recommendations;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0077B5] to-[#00a0dc] rounded-3xl p-6 text-white flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white opacity-80">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-sm font-bold opacity-80">LinkedIn + Assessment Powered</span>
          </div>
          <h2 className="text-2xl font-black">
            🎯 Your Personalised Plan{userName ? `, ${userName.split(' ')[0]}` : ''}
          </h2>
          <p className="text-sm opacity-80 mt-1 font-medium">
            Based on your cognitive profile and LinkedIn data
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {isRegenerating ? '⏳ Refreshing…' : '🔄 Refresh'}
          </button>
          <button
            onClick={onDisconnect}
            className="text-xs text-white/60 hover:text-white/90 transition-colors"
          >
            Disconnect LinkedIn
          </button>
        </div>
      </motion.div>

      {/* Career Paths */}
      <Section title="🚀 Recommended Career Paths" delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {careers.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-5"
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <h3 className="font-black text-gray-800 text-base mb-1">{c.title}</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2">{c.reason}</p>
              <MatchBar value={c.match} />
              <p className="text-xs text-gray-400 mt-1">Match score</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Learning Roadmap */}
      <Section title="📚 Your Learning Roadmap" delay={0.1}>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-blue-100" />
          <div className="space-y-4">
            {learningPath.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-4 relative"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-blue-200 flex items-center justify-center text-xl flex-shrink-0 shadow-sm z-10">
                  {step.icon}
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-blue-500">Step {step.step}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[step.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {step.type}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{step.title}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">⏱ {step.duration}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Internships + Competitions — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Internships */}
        <Section title="💼 Internships for You" delay={0.15}>
          <div className="space-y-3">
            {internships.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-4"
              >
                <div className="font-bold text-gray-800 text-sm mb-0.5">{item.title}</div>
                <div className="text-xs text-teal-700 font-semibold mb-2">{item.org}</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {item.tags.map((tag, ti) => (
                    <span key={ti} className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 font-medium">📅 Deadline: {item.deadline}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Competitions */}
        <Section title="🏆 Competitions" delay={0.2}>
          <div className="space-y-3">
            {competitions.map((comp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4"
              >
                <div className="font-bold text-gray-800 text-sm mb-1">{comp.title}</div>
                <div className="text-base font-black text-amber-600 mb-2">🎁 {comp.prize}</div>
                <div className="flex flex-wrap gap-1.5">
                  {comp.tags.map((tag, ti) => (
                    <span key={ti} className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>

      {/* Skill Gaps */}
      <Section title="📈 Skills to Build Next" delay={0.25}>
        <div className="space-y-4">
          {skillGaps.map((gap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800 text-sm">{gap.skill}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {gap.currentLevel}% → {gap.targetLevel}%
                </span>
              </div>
              {/* Current level bar */}
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gap.targetLevel}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 + i * 0.07 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-200 to-blue-300"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gap.currentLevel}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 + i * 0.07 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1.5 italic">💡 {gap.tip}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Privacy notice */}
      <div className="text-center text-xs text-gray-400 font-medium py-2">
        🔒 Data used only for personalisation · Not shared externally ·{' '}
        <button onClick={onDisconnect} className="underline hover:text-gray-600 transition-colors">
          Disconnect LinkedIn
        </button>
      </div>
    </div>
  );
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
    >
      <h3 className="text-lg font-black text-gray-800 mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}
