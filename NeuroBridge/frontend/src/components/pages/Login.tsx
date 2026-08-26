import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Sliders,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import brain from '../assets/brain.png';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';
import { GoogleLogin } from '../auth/GoogleLogin';

export function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDyslexiaMode, language, reduceMotion } = useDyslexia();
  const { login } = useAuth();
  const t = getTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Check for URL parameters (Google OAuth errors or tokens)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get('error');
    const token = params.get('token');

    if (urlError) {
      setError(decodeURIComponent(urlError));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) {
      login(token);
      const redirect = params.get('redirect') || '/dashboard';
      navigate(redirect);
    }
  }, [location.search, login, navigate]);

  useEffect(() => {
    if (location.state?.createAccount) {
      setActiveTab('register');
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/email/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await login(data.token);
        navigate(data.redirect || '/dashboard');
      } else {
        if (data.needsVerification) {
          setError(data.error + ' Click "Resend Verification" below if you need a new link.');
          setSuccess('');
        } else {
          setError(data.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address above first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:4000/api/auth/email/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Verification email resent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend verification email.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/email/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, password: '', confirmPassword: '' });

        if (data.devVerifyLink) {
          setSuccess(
            `Account created! (Email not configured) Click to verify: ${data.devVerifyLink}`
          );
        } else {
          setSuccess(data.message || 'Account created! Check your email to verify your account.');
        }

        setTimeout(() => {
          setActiveTab('login');
          setSuccess('');
        }, 5000);
      } else {
        setError(data.error || 'Registration failed. Please check your details.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[350px] bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[300px] bg-purple-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ─── LEFT: BRAND & PRODUCT PREVIEW (5 COLS, DESKTOP ONLY) ───── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:col-span-5 flex-col space-y-6 text-left"
        >
          {/* Logo & Headline */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] p-2.5 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <img src={brain} alt="NeuroBridge Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-2xl text-[#1A202C] tracking-tight">
                NeuroBridge
              </span>
            </Link>

            <h2 className="text-3xl font-black text-[#1A202C] tracking-tight leading-tight pt-2">
              Learning should work <br />
              <span className="text-[#2563EB]">for your brain.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
              An accessible learning and career platform designed around how your mind works best.
            </p>
          </div>

          {/* Mini Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-blue-100/80 shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-[#1A202C] block">JARVIS AI Assistant</span>
                <span className="text-[11px] text-[#64748B]">
                  Voice & speech study companion
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-blue-100/80 shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Sliders size={16} />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-[#1A202C] block">
                  OpenDyslexic Typography
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Calibrated contrast & letter anchors
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-blue-100/80 shadow-2xs backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-[#1A202C] block">ATS Resume Builder</span>
                <span className="text-[11px] text-[#64748B]">
                  Match with neuro-inclusive employers
                </span>
              </div>
            </div>
          </div>

          {/* Accessibility Indicator */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] pt-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>WCAG AAA Accessible & Student Verified</span>
          </div>
        </motion.div>

        {/* ─── RIGHT: AUTHENTICATION CARD (7 COLS) ────────────────────── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-9 border border-blue-100/90 shadow-xs relative"
        >
          {/* Top Pill Tab Switcher */}
          <div className="flex bg-[#F8FAFC] border border-slate-200 p-1 rounded-2xl mb-7">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#2563EB] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1A202C]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#2563EB] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1A202C]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6 text-left space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] tracking-tight">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium">
              {activeTab === 'login'
                ? 'Continue your personalized learning journey.'
                : 'Start building a learning experience that works for you.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
                {activeTab === 'login' && error.includes('Resend Verification') && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-[#2563EB] font-bold underline block cursor-pointer"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Success Alert */}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-start gap-2.5"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                {success.includes('http') ? (
                  <>
                    <p className="mb-1">
                      Account created! (Email not configured) Click link to verify:
                    </p>
                    <a
                      href={success.split('verify: ')[1]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#2563EB] underline break-all font-bold"
                    >
                      {success.split('verify: ')[1]}
                    </a>
                  </>
                ) : (
                  success
                )}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form
            onSubmit={activeTab === 'login' ? handleEmailLogin : handleRegister}
            className="space-y-4 text-left"
          >
            {/* Full Name (Sign Up only) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white rounded-2xl text-xs sm:text-sm font-medium text-[#1A202C] placeholder-[#94A3B8] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white rounded-2xl text-xs sm:text-sm font-medium text-[#1A202C] placeholder-[#94A3B8] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider">
                  Password
                </label>
                {activeTab === 'login' && (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={activeTab === 'login' ? '••••••••' : 'At least 6 characters'}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white rounded-2xl text-xs sm:text-sm font-medium text-[#1A202C] placeholder-[#94A3B8] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#1A202C] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white rounded-2xl text-xs sm:text-sm font-medium text-[#1A202C] placeholder-[#94A3B8] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#1A202C] transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>{activeTab === 'login' ? 'Signing you in...' : 'Creating account...'}</span>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Log In' : 'Create My Account'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="my-6 relative flex items-center">
            <div className="grow border-t border-slate-200" />
            <span className="shrink-0 mx-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              or continue with
            </span>
            <div className="grow border-t border-slate-200" />
          </div>

          {/* Google OAuth Login Button */}
          <div>
            <GoogleLogin />
          </div>

          {/* Bottom Switcher */}
          <div className="text-center pt-5 border-t border-slate-100 mt-6">
            <p className="text-xs font-semibold text-[#64748B]">
              {activeTab === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[#2563EB] font-black hover:underline cursor-pointer ml-1"
                  >
                    Create one free →
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[#2563EB] font-black hover:underline cursor-pointer ml-1"
                  >
                    Log In →
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}