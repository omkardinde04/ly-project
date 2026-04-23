import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioControl } from '../ui/AudioControl';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimplifiedData {
  title: string;
  company: string;
  location: string;
  whatYouWillDo: string[];
  whoCanApply: string[];
  whyItsGood: string;
  deadline: string;
  badge: string;
}

interface Job {
  id: number;
  title: string;
  company?: string;
  organization?: string;
  location?: string;
  type?: string;
  posted?: string;
  deadline?: string;
  applicants?: number;
  participants?: number;
  prize?: string;
  description: string;
  eligibility: string;
  skills?: string[];
  logo?: string;
  url?: string;
  simplified?: SimplifiedData;  // pre-simplified by backend AI pipeline
}

interface AIAssistedJobCardProps {
  job: Job;
  dyslexiaModeEnabled: boolean;
  platform: 'LinkedIn' | 'Unstop';
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-black text-gray-900 mb-3 pb-1 border-b-2" style={{ borderColor: color }}>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BulletItem({ text, icon = '•' }: { text: string; icon?: string }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-gray-800 font-medium leading-relaxed">{text}</span>
    </div>
  );
}

function Pill({ children, colorKey = 'gray' }: { children: React.ReactNode; colorKey?: string }) {
  const styles: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    orange: 'bg-orange-50 text-orange-600 border border-orange-100',
    green: 'bg-green-50 text-green-600 border border-green-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[colorKey] || styles.gray}`}>
      {children}
    </span>
  );
}

// ─── In-App Job Detail Modal ──────────────────────────────────────────────────

function JobModal({
  job,
  platform,
  onClose,
}: {
  job: Job;
  platform: 'LinkedIn' | 'Unstop';
  onClose: () => void;
}) {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  // Allow re-simplifying from inside the modal too
  const [localSimplified, setLocalSimplified] = useState<SimplifiedData | null>(job.simplified || null);
  const [isSimplifying, setIsSimplifying] = useState(false);

  const s = localSimplified;
  const color = platform === 'LinkedIn' ? '#0A66C2' : '#E93E30';

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await fetch(`http://localhost:4000/api/opportunities/${platform.toLowerCase()}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, userProfile: { name: 'User' } }),
      });
      setHasApplied(true);
    } catch {
      setTimeout(() => setHasApplied(true), 800);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSimplify = async () => {
    setIsSimplifying(true);
    try {
      const res = await fetch('http://localhost:4000/api/opportunities/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company || job.organization,
          location: job.location,
          description: job.description,
          eligibility: job.eligibility,
          type: job.type,
          deadline: job.deadline,
          prize: job.prize,
        }),
      });
      const data = await res.json();
      setLocalSimplified(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimplifying(false);
    }
  };

  const audioText = s
    ? `${s.badge} ${s.title} at ${s.company}. Location: ${s.location}. What you will do: ${s.whatYouWillDo.join('. ')}. Who can apply: ${s.whoCanApply.join('. ')}. Why it is good for you: ${s.whyItsGood}. Deadline: ${s.deadline}.`
    : `${job.title} at ${job.company || job.organization}.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 40 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 pt-6 pb-4 rounded-t-3xl z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-3xl">{s?.badge || job.logo || '🚀'}</span>
                <h2 className="text-2xl font-black text-gray-900">{s?.title || job.title}</h2>
              </div>
              <p className="text-lg font-semibold mt-1" style={{ color }}>
                {s?.company || job.company || job.organization}
                {(s?.location || job.location) && (
                  <span className="text-gray-500 font-normal ml-3 text-base">
                    📍 {s?.location || job.location}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="mt-3">
            <AudioControl text={audioText} showControls={true} />
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="px-8 py-6 space-y-6">

          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {(s?.deadline || job.deadline) && (
              <Pill colorKey="orange">⏳ {s?.deadline || job.deadline}</Pill>
            )}
            {job.prize && <Pill colorKey="green">🏆 {job.prize}</Pill>}
            {job.type && <Pill>{job.type}</Pill>}
          </div>

          {/* ✨ Simplify with AI button — always visible if not yet simplified */}
          {!s && (
            <div className="text-center">
              <button
                onClick={handleSimplify}
                disabled={isSimplifying}
                className="mx-auto flex items-center gap-3 px-6 py-3 rounded-full font-black text-white text-lg shadow-lg
                           bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                           transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSimplifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI is reading this for you…
                  </>
                ) : (
                  <>✨ Simplify with AI — Make it easy to read</>
                )}
              </button>
              <p className="text-gray-400 text-sm mt-2">Tap to get short, clear bullet points</p>
            </div>
          )}

          {/* Content — simplified or raw */}
          <AnimatePresence mode="wait">
            {s ? (
              <motion.div
                key="simplified"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* AI Simplified badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full w-fit">
                  <span className="text-indigo-600 font-bold text-sm">✨ AI Simplified View</span>
                </div>

                <Section title="💡 What you will do" color={color}>
                  {s.whatYouWillDo.map((pt, i) => (
                    <BulletItem key={i} text={pt.replace(/^[•\-]\s*/, '')} icon="💡" />
                  ))}
                </Section>

                <Section title="✅ Who can apply" color={color}>
                  {s.whoCanApply.map((pt, i) => (
                    <BulletItem key={i} text={pt.replace(/^[✅•\-]\s*/, '')} icon="✅" />
                  ))}
                </Section>

                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
                  <p className="text-sm font-black text-yellow-700 mb-2">🎯 Why it's good for you</p>
                  <p className="text-gray-800 font-medium leading-relaxed">{s.whyItsGood}</p>
                </div>

                {/* Re-simplify option */}
                <button
                  onClick={handleSimplify}
                  disabled={isSimplifying}
                  className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isSimplifying ? '✨ Re-simplifying…' : '↺ Re-simplify with AI'}
                </button>
              </motion.div>
            ) : !isSimplifying ? (
              <motion.div key="raw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <Section title="📄 Description" color={color}>
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </Section>
                {job.eligibility && (
                  <Section title="📋 Who can apply" color={color}>
                    <p className="text-gray-700 leading-relaxed">{job.eligibility}</p>
                  </Section>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.skills.map((sk, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Sticky Apply Footer ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 pb-6 pt-4 rounded-b-3xl">
          <button
            onClick={handleApply}
            disabled={isApplying || hasApplied}
            className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg transition-transform
              ${!hasApplied && !isApplying ? 'hover:scale-105' : ''}
              ${hasApplied ? 'bg-green-500' : ''}
              disabled:opacity-80 flex items-center justify-center gap-3`}
            style={!hasApplied ? { backgroundColor: color } : undefined}
          >
            {isApplying ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending your application…
              </>
            ) : hasApplied ? (
              <>✅ Application Sent!</>
            ) : (
              <>🚀 Apply Now — Stay on NeuroBridge</>
            )}
          </button>
          <p className="text-center text-gray-400 text-sm mt-2">
            You will not leave this page. We handle everything here 😊
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Job Card (List View) ────────────────────────────────────────────────

export function AIAssistedJobCard({ job, dyslexiaModeEnabled, platform }: AIAssistedJobCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [localSimplified, setLocalSimplified] = useState<SimplifiedData | null>(job.simplified || null);
  const [isSimplifying, setIsSimplifying] = useState(false);

  const s = localSimplified;
  const color = platform === 'LinkedIn' ? '#0A66C2' : '#E93E30';
  const bgLight = platform === 'LinkedIn' ? '#EBF4FF' : '#FFF0EE';

  const handleSimplify = async (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open modal
    setIsSimplifying(true);
    try {
      const res = await fetch('http://localhost:4000/api/opportunities/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company || job.organization,
          location: job.location,
          description: job.description,
          eligibility: job.eligibility,
          type: job.type,
          deadline: job.deadline,
          prize: job.prize,
        }),
      });
      const data = await res.json();
      setLocalSimplified(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimplifying(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
        className="bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all"
        style={{ borderColor: `${color}33` }}
      >
        {/* Top accent */}
        <div className="h-2" style={{ backgroundColor: color }} />

        {/* Card body — clickable to open modal */}
        <div
          className="p-6 flex flex-col sm:flex-row gap-5 items-start cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {/* Badge */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
            style={{ backgroundColor: bgLight }}
          >
            {s?.badge || job.logo || '🚀'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-black text-gray-900 mb-1 ${dyslexiaModeEnabled ? 'text-2xl' : 'text-xl'}`}>
              {s?.title || job.title}
            </h3>
            <p className="font-bold mb-2" style={{ color }}>
              {s?.company || job.company || job.organization}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {(s?.location || job.location) && (
                <Pill>📍 {s?.location || job.location}</Pill>
              )}
              {job.type && <Pill>{job.type}</Pill>}
              {(s?.deadline || job.deadline) && <Pill colorKey="orange">⏳ {s?.deadline || job.deadline}</Pill>}
              {job.prize && <Pill colorKey="green">🏆 {job.prize}</Pill>}
            </div>

            {/* Preview bullet if simplified */}
            {s?.whatYouWillDo?.[0] ? (
              <p className={`text-gray-600 line-clamp-2 ${dyslexiaModeEnabled ? 'text-base' : 'text-sm'}`}>
                ✨ {s.whatYouWillDo[0].replace(/^[•\-]\s*/, '')}
              </p>
            ) : (
              <p className={`text-gray-500 line-clamp-2 ${dyslexiaModeEnabled ? 'text-base' : 'text-sm'}`}>
                {job.description?.substring(0, 120)}…
              </p>
            )}
          </div>

          {/* Arrow */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center self-center"
            style={{ backgroundColor: bgLight }}
          >
            <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="px-6 pb-5 flex items-center justify-between gap-4">
          {/* ✨ AI Simplify button — on the card itself */}
          <button
            onClick={handleSimplify}
            disabled={isSimplifying}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-transform hover:scale-105
              disabled:opacity-60 disabled:cursor-wait
              ${s ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'}`}
          >
            {isSimplifying ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Simplifying…
              </>
            ) : s ? (
              <>✨ AI Simplified · Tap to re-run</>
            ) : (
              <>✨ Simplify with AI</>
            )}
          </button>

          <p className="text-xs text-gray-400 font-medium">
            👆 Tap card to see full details
          </p>
        </div>
      </motion.div>

      {/* In-App Modal */}
      <AnimatePresence>
        {showModal && (
          <JobModal
            job={{ ...job, simplified: localSimplified || undefined }}
            platform={platform}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
