import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Globe,
  LogOut,
  AlertTriangle,
  Key,
  Edit2,
  Save,
  Activity,
  Smartphone,
  Camera,
  X,
  Sparkles,
  CheckCircle2,
  Circle,
  FileText,
  Sliders,
  Check,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Bell,
  Layers,
} from 'lucide-react';

const STORAGE_KEY = 'neurobridge-resume-data-v2';

export function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const { isDyslexiaMode, dyslexiaLevel, textSize, lineSpacing } = useDyslexia();
  const navigate = useNavigate();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Local state for personal info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    preferredName: user?.name?.split(' ')[0] || '',
    phone: '',
    location: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'English (US)',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: true,
    platformReminders: true,
  });

  // Calculate live resume stats if saved
  const resumeInfo = useMemo(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = parsed.resumeData;
        const skillsCount = data?.skills?.length || 0;
        const projectsCount = data?.projects?.length || 0;
        return { hasResume: true, skillsCount, projectsCount };
      }
    } catch {}
    return { hasResume: false, skillsCount: 0, projectsCount: 0 };
  }, []);

  // Compute profile completion percentage
  const completionPct = useMemo(() => {
    let score = 30; // base account
    if (user?.name) score += 20;
    if (user?.profile_picture) score += 15;
    if (personalInfo.phone || personalInfo.location) score += 15;
    if (resumeInfo.hasResume) score += 20;
    return Math.min(100, score);
  }, [user?.name, user?.profile_picture, personalInfo, resumeInfo]);

  const handleSavePersonalInfo = async () => {
    const name = personalInfo.fullName.trim();
    if (!name || !token) return;
    try {
      const response = await fetch('http://localhost:4000/api/auth/email/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) return;
      const updated = await response.json();
      updateUser(updated);
      setPersonalInfo((value) => ({
        ...value,
        fullName: updated.name,
        preferredName: updated.name.split(' ')[0],
      }));
      setIsEditingPersonal(false);
    } catch {}
  };

  const handleDeleteAccount = () => {
    logout();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ profile_picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026';

  const isSignedInWithGoogle = !!user?.google_id;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-7 pb-12 animate-in fade-in duration-200">
      {/* ─── 1. PROFILE HEADER CARD ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar with Camera Upload Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-blue-200 shadow-xs">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-[#2563EB]">
                  {getInitials(user?.name || 'Learner')}
                </span>
              )}
            </div>

            {user?.profile_picture && (
              <button
                type="button"
                onClick={() => updateUser({ profile_picture: undefined })}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white hover:bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-colors z-10"
                title="Remove photo"
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}

            <label
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-2xl text-white flex items-center justify-center shadow-md cursor-pointer transition-colors border-2 border-white"
              title="Update profile picture"
            >
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          {/* User Info */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] tracking-tight">
                {user?.name || 'NeuroBridge Student'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" /> Verified Student
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={14} className="text-[#94A3B8]" /> {user?.email}
            </p>

            <p className="text-[11px] font-bold text-[#2563EB] bg-blue-50/80 inline-block px-3 py-1 rounded-xl border border-blue-100 mt-1">
              Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Edit Profile CTA Button */}
        <div>
          {!isEditingPersonal ? (
            <button
              type="button"
              onClick={() => setIsEditingPersonal(true)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Edit2 size={15} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingPersonal(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1A202C] rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </motion.div>

      {/* ─── 2. PROFILE COMPLETION PROGRESS CARD ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#1A202C] uppercase tracking-wider">
            Profile Completion
          </span>
          <span className="text-xs font-black text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {completionPct}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Checklist Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              user?.name
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {user?.name ? <CheckCircle2 size={13} /> : <Circle size={13} />} Basic Details
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              user?.profile_picture
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {user?.profile_picture ? <CheckCircle2 size={13} /> : <Circle size={13} />} Avatar Photo
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
              resumeInfo.hasResume
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {resumeInfo.hasResume ? <CheckCircle2 size={13} /> : <Circle size={13} />} Resume Profile
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Accessibility Calibrated
          </span>
        </div>
      </motion.div>

      {/* ─── 3. TWO-COLUMN RESPONSIVE LAYOUT ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Personal Info, Skills & Preferences (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card A: Personal Information */}
          <div className="bg-white rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#1A202C]">Personal Information</h2>
                  <p className="text-xs text-[#64748B] font-medium">
                    Your contact and student account details.
                  </p>
                </div>
              </div>

              {!isEditingPersonal && (
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(true)}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingPersonal ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] font-medium outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                      Preferred Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.preferredName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, preferredName: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] font-medium outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] font-medium outline-none transition-all placeholder-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, location: e.target.value })
                      }
                      placeholder="City, State"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] font-medium outline-none transition-all placeholder-[#94A3B8]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(false)}
                    className="px-5 py-2 text-[#64748B] font-bold hover:bg-slate-100 rounded-xl transition-colors text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePersonalInfo}
                    className="px-6 py-2 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors flex items-center gap-1.5 shadow-xs text-xs cursor-pointer"
                  >
                    <Save size={14} /> <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <span className="text-[11px] font-bold text-[#94A3B8] block mb-1">Full Name</span>
                  <span className="font-extrabold text-[#1A202C]">{user?.name || 'Not provided'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <span className="text-[11px] font-bold text-[#94A3B8] block mb-1">
                    Preferred Name
                  </span>
                  <span className="font-extrabold text-[#1A202C]">
                    {personalInfo.preferredName || user?.name?.split(' ')[0] || '-'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <span className="text-[11px] font-bold text-[#94A3B8] block mb-1">
                    Email Address
                  </span>
                  <span className="font-extrabold text-[#1A202C] truncate block">{user?.email}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <span className="text-[11px] font-bold text-[#94A3B8] block mb-1">Phone</span>
                  <span className="font-extrabold text-[#1A202C]">
                    {personalInfo.phone || 'Not provided'}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                  <span className="text-[11px] font-bold text-[#94A3B8] block mb-1">Location</span>
                  <span className="font-extrabold text-[#1A202C]">
                    {personalInfo.location || 'India (Default)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card B: Skills & Learning Strengths */}
          <div className="bg-white rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center border border-purple-100">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#1A202C]">
                    Cognitive & Career Strengths
                  </h2>
                  <p className="text-xs text-[#64748B] font-medium">
                    Core skills aligned with your neuro-inclusive profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Multisensory Learning',
                'Visual Problem Solving',
                'Critical Thinking',
                'Web Development',
                'Python & Algorithms',
                'Inclusive Communication',
                'Creative Strategy',
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Card C: Platform & Notifications Preferences */}
          <div className="bg-white rounded-3xl border border-blue-100/80 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Globe size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#1A202C]">Platform Preferences</h2>
                <p className="text-xs text-[#64748B] font-medium">
                  Customize language, regional timing, and notification alerts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Preferred Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] font-semibold outline-none transition-all"
                >
                  <option>English (US)</option>
                  <option>Hindi (हिंदी)</option>
                  <option>Marathi (मराठी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Time Zone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-[#F8FAFC] focus:bg-white text-xs sm:text-sm text-[#1A202C] font-semibold outline-none transition-all"
                >
                  <option>{Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
                  <option>Asia/Kolkata (IST)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                <div>
                  <div className="text-xs font-extrabold text-[#1A202C]">Email Notifications</div>
                  <div className="text-[11px] text-[#64748B]">
                    Updates about opportunities and learning progress
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: !preferences.emailNotifications,
                    })
                  }
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    preferences.emailNotifications ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Email Notifications"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                      preferences.emailNotifications ? 'translate-x-6.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100">
                <div>
                  <div className="text-xs font-extrabold text-[#1A202C]">Platform Reminders</div>
                  <div className="text-[11px] text-[#64748B]">
                    In-app reminders for reading sprints and streak maintenance
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      platformReminders: !preferences.platformReminders,
                    })
                  }
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    preferences.platformReminders ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Platform Reminders"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                      preferences.platformReminders ? 'translate-x-6.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Accessibility Summary, Resume Snapshot & Account (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Accessibility Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center border border-purple-100">
                  <Sliders size={16} />
                </div>
                <h3 className="font-extrabold text-sm text-[#1A202C]">Accessibility Summary</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/accessibility')}
                className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span> <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Dyslexia Mode</span>
                <span
                  className={`font-bold ${
                    isDyslexiaMode ? 'text-purple-700' : 'text-[#1A202C]'
                  }`}
                >
                  {isDyslexiaMode ? 'OpenDyslexic Active' : 'Standard Font'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Calibrated Level</span>
                <span className="font-bold text-[#1A202C] capitalize">
                  {dyslexiaLevel && dyslexiaLevel !== 'none' ? dyslexiaLevel : 'Standard'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Text Scale</span>
                <span className="font-bold text-[#2563EB]">{textSize}% Scale</span>
              </div>
            </div>
          </div>

          {/* Card 2: Resume & Career Snapshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                  <FileText size={16} />
                </div>
                <h3 className="font-extrabold text-sm text-[#1A202C]">Resume Snapshot</h3>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard/resume-builder')}
                className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Builder</span> <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Resume Status</span>
                <span className="font-bold text-emerald-700">
                  {resumeInfo.hasResume ? 'Active Draft Saved' : 'Draft Incomplete'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Key Skills Included</span>
                <span className="font-bold text-[#1A202C]">
                  {resumeInfo.skillsCount > 0 ? `${resumeInfo.skillsCount} Skills` : 'None added'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Project Portfolios</span>
                <span className="font-bold text-[#1A202C]">
                  {resumeInfo.projectsCount > 0
                    ? `${resumeInfo.projectsCount} Projects`
                    : 'None added'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Account & Security */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-100/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                <Shield size={16} />
              </div>
              <h3 className="font-extrabold text-sm text-[#1A202C]">Account & Security</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <Activity size={12} /> Active
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC]">
                <span className="text-[#64748B] font-medium block mb-1">Sign-in Method</span>
                <span className="font-bold text-[#1A202C]">
                  {isSignedInWithGoogle ? 'Google Account Authentication' : 'Email & Password'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center gap-1.5 font-bold text-[#1A202C] mb-0.5">
                  <Smartphone size={14} className="text-[#2563EB]" /> Current Active Session
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Desktop Web Browser · {personalInfo.location || 'India'}
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1A202C] rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut size={14} /> <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* Card 4: Danger Zone */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-red-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-red-100">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-extrabold text-sm text-red-600">Danger Zone</h3>
            </div>

            <p className="text-xs text-[#64748B] font-medium leading-relaxed">
              Permanently delete your student profile and all associated data.
            </p>

            {!isDeletingAccount ? (
              <button
                type="button"
                onClick={() => setIsDeletingAccount(true)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 space-y-2.5">
                <p className="font-bold text-red-700 text-xs">Are you absolutely sure?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeletingAccount(false)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 text-[#1A202C] rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
