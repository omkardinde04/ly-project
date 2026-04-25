import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import type { Recommendations } from './PersonalizedRecommendations';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

// ─── Skill suggestions that apply to all users ────────────────────────────────
const UNIVERSAL_SKILLS = [
  'Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking',
  'Creativity', 'Adaptability', 'Time Management', 'Research',
  'Accessibility Awareness', 'Inclusive Design', 'Leadership', 'Empathy',
];

const INTEREST_OPTIONS = [
  { label: 'Design & Art', icon: '🎨' },
  { label: 'Technology', icon: '💻' },
  { label: 'Education', icon: '📚' },
  { label: 'Healthcare', icon: '🏥' },
  { label: 'Environment', icon: '🌿' },
  { label: 'Business', icon: '📊' },
  { label: 'Social Impact', icon: '🌍' },
  { label: 'Creative Writing', icon: '✍️' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface LinkedInProfile {
  linkedin_id?: string;
  name?: string;
  email?: string;
  profile_photo?: string;
  access_token?: string;
  connected_at?: string;
  locale?: { country?: string; language?: string };
}

type Phase = 'disconnected' | 'consent' | 'skill_confirm' | 'loading' | 'done' | 'token_expired';

function parseLinkedInFromUrl(): LinkedInProfile | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get('linkedin_connected') && params.get('profile')) {
    try {
      return JSON.parse(atob(params.get('profile')!)) as LinkedInProfile;
    } catch { return null; }
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LinkedInConnect() {
  const { cognitiveProfile, dyslexiaLevel } = useDyslexia();

  const [phase, setPhase]               = useState<Phase>('disconnected');
  const [profile, setProfile]           = useState<LinkedInProfile | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Skill confirm state
  const [selectedSkills, setSelectedSkills]   = useState<string[]>([]);
  const [customSkill, setCustomSkill]         = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isRegenerating, setIsRegenerating]   = useState(false);

  // ── On mount: check URL callback params + localStorage ────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedinError = params.get('linkedin_error');
    if (linkedinError) {
      setError(decodeURIComponent(linkedinError));
      setPhase('disconnected');
    }

    const fromUrl = parseLinkedInFromUrl();
    if (fromUrl) {
      setProfile(fromUrl);
      localStorage.setItem('linkedin_profile', JSON.stringify(fromUrl));
      window.history.replaceState({}, '', window.location.pathname);
      // Pre-seed skills from cognitive profile
      seedSkillsFromProfile(fromUrl);
      setPhase('skill_confirm');
    } else {
      const saved = localStorage.getItem('linkedin_profile');
      if (saved) {
        try {
          const p = JSON.parse(saved) as LinkedInProfile;
          setProfile(p);
          // Check if recommendations were saved
          const savedRecs = localStorage.getItem('linkedin_recommendations');
          if (savedRecs) {
            setRecommendations(JSON.parse(savedRecs));
            setPhase('done');
          } else {
            seedSkillsFromProfile(p);
            setPhase('skill_confirm');
          }
        } catch { /* ignore */ }
      }
    }
  }, []);

  const seedSkillsFromProfile = (p: LinkedInProfile) => {
    const auto: string[] = ['Accessibility Awareness', 'Inclusive Learning'];
    // Add skills based on cognitive profile strengths
    if (cognitiveProfile) {
      if (cognitiveProfile.visual >= 70) auto.push('Visual Design', 'Pattern Recognition');
      if (cognitiveProfile.executive >= 70) auto.push('Time Management', 'Planning');
      if (cognitiveProfile.workingMemory >= 70) auto.push('Research', 'Analysis');
    }
    // Parse from name if any signals
    const name = (p.name ?? '').toLowerCase();
    if (/design|art|ux/.test(name)) auto.push('Design', 'UX/UI');
    if (/tech|dev|code|engineer/.test(name)) auto.push('Technology', 'Problem Solving');
    setSelectedSkills([...new Set(auto)]);
  };

  // ── Connect LinkedIn ───────────────────────────────────────────────────────
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/linkedin/auth`);
      const data = await res.json() as { authUrl?: string; error?: string };
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error ?? 'Failed to get auth URL');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Connection failed');
      setIsConnecting(false);
    }
  };

  // ── Disconnect LinkedIn ────────────────────────────────────────────────────
  const handleDisconnect = () => {
    setProfile(null);
    setRecommendations(null);
    setSelectedSkills([]);
    setSelectedInterests([]);
    setError(null);
    localStorage.removeItem('linkedin_profile');
    localStorage.removeItem('linkedin_recommendations');
    setPhase('disconnected');
  };

  // ── Generate Recommendations ───────────────────────────────────────────────
  const generateRecommendations = useCallback(async (regenerating = false) => {
    if (regenerating) setIsRegenerating(true);
    else setPhase('loading');
    setError(null);

    try {
      const body = {
        cognitiveProfile: cognitiveProfile ?? {
          phonological: 70, visual: 70, workingMemory: 70,
          processingSpeed: 70, orthographic: 70, executive: 70,
        },
        dyslexiaLevel,
        linkedinProfile: profile ? { name: profile.name, email: profile.email } : undefined,
        confirmedSkills: selectedSkills,
        interests: selectedInterests,
      };

      const res  = await fetch(`${BACKEND_URL}/api/llm/recommend`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Recommendation API error: ${res.status}`);
      const data = await res.json() as { recommendations: Recommendations };
      setRecommendations(data.recommendations);
      localStorage.setItem('linkedin_recommendations', JSON.stringify(data.recommendations));
      setPhase('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate recommendations');
      setPhase('skill_confirm');
    } finally {
      setIsRegenerating(false);
    }
  }, [cognitiveProfile, dyslexiaLevel, profile, selectedSkills, selectedInterests]);

  // ── Skill toggle ───────────────────────────────────────────────────────────
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render phases
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Phase: Disconnected ──────────────────────────────────────────── */}
        {phase === 'disconnected' && (
          <motion.div key="disconnected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
              {/* Hero */}
              <div className="bg-gradient-to-r from-[#0077B5] to-[#00a0dc] p-8 text-white text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" className="w-11 h-11 fill-white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-black mb-2">Connect LinkedIn</h1>
                <p className="text-sm opacity-80 font-medium max-w-md mx-auto leading-relaxed">
                  Auto-detect your skills and get a personalised career roadmap,
                  internships, and opportunities — built for neurodiverse learners.
                </p>
              </div>

              {/* Feature grid */}
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                  {[
                    { icon: '🧠', title: 'AI-Powered Match', desc: 'Based on your cognitive profile + LinkedIn data' },
                    { icon: '🎯', title: 'Personalised Paths', desc: 'Career, learning & internship recommendations' },
                    { icon: '🔒', title: 'Privacy First', desc: 'Only name, email & picture are used' },
                  ].map((f, i) => (
                    <div key={i} className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                      <div className="text-2xl mb-2">{f.icon}</div>
                      <div className="text-sm font-bold text-gray-800">{f.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Consent notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                    📋 <strong>Consent Notice:</strong> By connecting, you allow NeuroBridge to read your basic
                    LinkedIn profile (name, email, profile picture) using official LinkedIn OAuth.
                    This data is used only to personalise your learning experience and is never shared externally.
                    You can disconnect at any time.
                  </p>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full py-4 bg-[#0077B5] hover:bg-[#005fa3] disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-3"
                >
                  {isConnecting ? (
                    <><div className="w-5 h-5 border-2 border-white border-b-transparent rounded-full animate-spin" /> Connecting…</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      Sign in with LinkedIn
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                  Connecting is optional — you can also{' '}
                  <button onClick={() => setPhase('skill_confirm')} className="underline hover:text-gray-600">
                    enter skills manually
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Phase: Token expired ─────────────────────────────────────────── */}
        {phase === 'token_expired' && (
          <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-200 p-8 text-center">
              <div className="text-5xl mb-4">🔁</div>
              <h2 className="text-xl font-black text-gray-800 mb-2">Reconnect LinkedIn</h2>
              <p className="text-gray-500 text-sm font-medium mb-6 max-w-sm mx-auto">
                Your LinkedIn session expired. Reconnect to refresh your personalised recommendations.
              </p>
              <button onClick={handleConnect} disabled={isConnecting}
                className="px-8 py-3 bg-[#0077B5] hover:bg-[#005fa3] text-white font-bold rounded-2xl transition-all shadow-md disabled:opacity-50">
                {isConnecting ? 'Reconnecting…' : '🔗 Reconnect LinkedIn'}
              </button>
              <button onClick={handleDisconnect} className="block mx-auto mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Clear & start over
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Phase: Skill Confirmation ────────────────────────────────────── */}
        {phase === 'skill_confirm' && (
          <motion.div key="skills" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-5">
              {/* Profile mini-card (if connected) */}
              {profile && (
                <div className="bg-white rounded-3xl shadow-md border-2 border-[#0077B5]/20 p-5 flex items-center gap-4">
                  {profile.profile_photo ? (
                    <img src={profile.profile_photo} alt={profile.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#0077B5]" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#0077B5] flex items-center justify-center text-white text-2xl font-black">
                      {profile.name?.charAt(0) ?? 'L'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-gray-800">{profile.name ?? 'LinkedIn User'}</h3>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">✓ Connected</span>
                    </div>
                    {profile.email && <p className="text-sm text-gray-500">{profile.email}</p>}
                  </div>
                  <button onClick={handleDisconnect} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
                    Disconnect
                  </button>
                </div>
              )}

              {!profile && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                  <p className="text-sm text-blue-700 font-semibold">
                    💡 No LinkedIn connected — you can still get personalised recommendations!
                  </p>
                  <button onClick={() => setPhase('disconnected')} className="text-xs text-blue-500 underline font-medium">
                    Connect now
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}

              {/* Skills selection */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-800 mb-1">Confirm Your Skills</h2>
                <p className="text-sm text-gray-500 font-medium mb-5 leading-relaxed">
                  We auto-suggested some skills from your profile and assessment.
                  Select what fits you best, then add your own.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {UNIVERSAL_SKILLS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-[#0077B5] border-[#0077B5] text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
                    </button>
                  ))}
                </div>

                {/* Custom skill add */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                    placeholder="Add your own skill…"
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm font-medium"
                  />
                  <button onClick={addCustomSkill}
                    className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl text-sm transition-all">
                    + Add
                  </button>
                </div>

                {selectedSkills.length > 0 && (
                  <p className="text-xs text-gray-400 font-medium">
                    {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Interests */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-black text-gray-800 mb-1">Your Interests</h2>
                <p className="text-sm text-gray-500 font-medium mb-4">
                  Pick the areas you're most drawn to.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INTEREST_OPTIONS.map(({ label, icon }) => (
                    <button
                      key={label}
                      onClick={() => toggleInterest(label)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${
                        selectedInterests.includes(label)
                          ? 'bg-purple-100 border-purple-400 text-purple-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-200'
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-xs font-bold leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={() => generateRecommendations(false)}
                disabled={selectedSkills.length === 0}
                className="w-full py-4 bg-gradient-to-r from-[#0077B5] to-purple-600 hover:from-[#005fa3] hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-black text-base rounded-2xl shadow-lg transition-all"
              >
                {selectedSkills.length === 0
                  ? 'Select at least one skill to continue'
                  : '✨ Generate My Personalised Plan →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Phase: Loading ───────────────────────────────────────────────── */}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#0077B5] to-purple-500 flex items-center justify-center"
              >
                <span className="text-3xl">🧠</span>
              </motion.div>
              <h2 className="text-2xl font-black text-gray-800 mb-3">Building Your Plan…</h2>
              <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
                Our AI is analysing your cognitive profile and skills to create your personalised roadmap.
              </p>
              <div className="mt-6 flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-[#0077B5]"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Phase: Done — show recommendations ──────────────────────────── */}
        {phase === 'done' && recommendations && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <PersonalizedRecommendations
              recommendations={recommendations}
              userName={profile?.name}
              onDisconnect={handleDisconnect}
              onRegenerate={() => generateRecommendations(true)}
              isRegenerating={isRegenerating}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
