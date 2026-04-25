import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

interface LinkedInProfile {
  linkedin_id?: string;
  name?: string;
  email?: string;
  profile_photo?: string;
  access_token?: string;
}

function parseLinkedInFromUrl(): LinkedInProfile | null {
  const params = new URLSearchParams(window.location.search);
  const profileParam = params.get('profile');
  const connected = params.get('linkedin_connected');
  if (connected && profileParam) {
    try {
      return JSON.parse(atob(profileParam)) as LinkedInProfile;
    } catch { return null; }
  }
  return null;
}

export function LinkedInConnect() {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  // Check URL params on mount (after OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedinError = params.get('linkedin_error');
    if (linkedinError) setError(decodeURIComponent(linkedinError));

    const fromUrl = parseLinkedInFromUrl();
    if (fromUrl) {
      setProfile(fromUrl);
      // Save to localStorage for persistence
      localStorage.setItem('linkedin_profile', JSON.stringify(fromUrl));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Try to restore from localStorage
      const saved = localStorage.getItem('linkedin_profile');
      if (saved) {
        try { setProfile(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/linkedin/auth`);
      const data = await res.json() as { authUrl?: string; error?: string };
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error ?? 'Failed to get auth URL');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connection failed';
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setProfile(null);
    localStorage.removeItem('linkedin_profile');
  };

  const handleUpdateLinkedIn = async () => {
    if (!profile?.access_token || !profile?.linkedin_id) return;
    setUpdateStatus('loading');
    try {
      await fetch(`${BACKEND_URL}/api/linkedin/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: profile.access_token,
          linkedin_id: profile.linkedin_id,
          skill: 'Dyslexia-Friendly Learning',
          certificate: 'Learning Accessibility Certified — NeuroBridge',
        }),
      });
      setUpdateStatus('done');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    } catch { setUpdateStatus('idle'); }
  };

  if (profile) {
    return (
      <div className="space-y-5">
        {/* Connected Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-[#0077B5]/20 p-6"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#0077B5]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#0077B5] flex items-center justify-center text-white text-2xl font-black">
                  {profile.name?.charAt(0) ?? 'L'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0077B5]">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <h3 className="text-lg font-black text-gray-800">{profile.name ?? 'LinkedIn User'}</h3>
              </div>
              {profile.email && (
                <p className="text-sm text-gray-500 font-medium">{profile.email}</p>
              )}
              <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                ✓ Connected
              </span>
            </div>

            <button onClick={handleDisconnect}
              className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors">
              Disconnect
            </button>
          </div>

          {/* Auto-filled profile fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Name', value: profile.name ?? '—', icon: '👤' },
              { label: 'Email', value: profile.email ?? '—', icon: '✉️' },
              { label: 'Training Status', value: 'In Progress', icon: '📚' },
              { label: 'Assessment', value: 'Completed', icon: '🧠' },
            ].map((field, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                  {field.icon} {field.label}
                </div>
                <div className="text-sm font-bold text-gray-800 truncate">{field.value}</div>
              </div>
            ))}
          </div>

          {/* Update LinkedIn */}
          <button
            onClick={handleUpdateLinkedIn}
            disabled={updateStatus === 'loading'}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              updateStatus === 'done'
                ? 'bg-green-500 text-white'
                : updateStatus === 'loading'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#0077B5] hover:bg-[#005fa3] text-white'
            }`}
          >
            {updateStatus === 'loading' ? '⏳ Updating…' : updateStatus === 'done' ? '✅ LinkedIn Updated!' : '📤 Add Certificate & Skill to LinkedIn'}
          </button>
        </motion.div>

        {/* Sync Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
            🔄 What Gets Synced
          </h4>
          <ul className="space-y-1.5 text-sm text-gray-600">
            {[
              'Your name and email auto-filled from LinkedIn',
              'Skill added: Dyslexia-Friendly Learning',
              'Certificate: Learning Accessibility Certified',
              'Training status synced after course completion',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold flex-shrink-0">›</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Not connected
  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 text-center"
      >
        <div className="flex items-center justify-center mb-5">
          <div className="w-20 h-20 rounded-3xl bg-[#0077B5] flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-2">Connect LinkedIn</h2>
        <p className="text-gray-500 text-sm font-medium mb-6 max-w-sm mx-auto leading-relaxed">
          Sync your profile automatically. Your skills and certificates will be added after completing learning modules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
          {[
            { icon: '🔄', title: 'Auto Sync', desc: 'Profile auto-filled from LinkedIn' },
            { icon: '🏆', title: 'Certificates', desc: 'Added after course completion' },
            { icon: '💼', title: 'Skills', desc: 'Dyslexia-friendly skills posted' },
          ].map((item, i) => (
            <div key={i} className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm font-bold text-gray-800">{item.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full sm:w-auto px-10 py-4 bg-[#0077B5] hover:bg-[#005fa3] disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 mx-auto"
        >
          {isLoading ? (
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

        <p className="text-xs text-gray-400 mt-4 font-medium">
          We only read your profile — we never post without your permission.
        </p>
      </motion.div>
    </div>
  );
}
