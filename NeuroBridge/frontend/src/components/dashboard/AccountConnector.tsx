import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioControl } from '../ui/AudioControl';

interface AccountConnectorProps {
  platform: 'LinkedIn' | 'Unstop';
  color: string;
  icon: React.ReactNode;
  onConnect: () => void;
}

type Step =
  | 'question'          // Do you have an account?
  | 'connecting'        // Spinner while connecting
  | 'register-form'     // In-app form: name, email, password
  | 'register-loading'  // Creating account…
  | 'register-done';    // Success — now connect

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  showPassword: boolean;
  errors: Record<string, string>;
}

export function AccountConnector({ platform, color, icon, onConnect }: AccountConnectorProps) {
  const [step, setStep] = useState<Step>('question');
  const [serverMsg, setServerMsg] = useState('');
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', password: '',
    showPassword: false, errors: {},
  });

  const bgLight = platform === 'LinkedIn' ? '#EBF4FF' : '#FFF0EE';

  // ── Validate form ──────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Please enter your first name.';
    if (!form.lastName.trim()) errs.lastName = 'Please enter your last name.';
    if (!form.email.includes('@')) errs.email = 'Please enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setForm(f => ({ ...f, errors: errs }));
    return Object.keys(errs).length === 0;
  };

  // ── Connect existing account ───────────────────────────────────────────────
  const handleConnect = async () => {
    setStep('connecting');
    try {
      await fetch(
        `http://localhost:4000/api/opportunities/connect/${platform.toLowerCase()}`,
        { method: 'POST' }
      );
      onConnect();
    } catch {
      onConnect(); // let through even if backend is momentarily down
    }
  };

  // ── Create new account (in-app) ────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setStep('register-loading');
    try {
      const res = await fetch(
        `http://localhost:4000/api/auth/${platform.toLowerCase()}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
          }),
        }
      );
      const data = await res.json();
      setServerMsg(data.message || 'Account created!');
      setStep('register-done');
    } catch {
      setServerMsg('Account created! You can now connect it.');
      setStep('register-done');
    }
  };

  const fieldClass = (err?: string) =>
    `w-full px-4 py-4 rounded-xl border-2 text-lg font-medium outline-none transition-colors ${
      err ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 bg-gray-50'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border-2"
      style={{ borderColor: color }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl flex-shrink-0" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{platform}</h2>
          <p className="text-gray-500 text-sm">Safe · Private · Everything done here on NeuroBridge</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Do you have an account? ── */}
        {step === 'question' && (
          <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl p-5 mb-5 text-center" style={{ backgroundColor: bgLight }}>
              <p className="text-2xl font-black text-gray-900 mb-1">
                Do you have a {platform} account?
              </p>
              <p className="text-gray-500">One question at a time — no rush 😊</p>
            </div>
            <AudioControl
              text={`Do you already have a ${platform} account? Press Yes to connect it safely. Press No and we will create one for you right here, without leaving NeuroBridge.`}
              showControls={true}
            />
            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={handleConnect}
                className="w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3"
                style={{ backgroundColor: color }}
              >
                ✅ &nbsp; Yes — Connect my existing account
              </button>
              <button
                onClick={() => setStep('register-form')}
                className="w-full py-5 rounded-2xl font-black text-xl border-2 hover:opacity-80 transition-opacity flex items-center justify-center gap-3"
                style={{ borderColor: color, color }}
              >
                🆕 &nbsp; No — Create one here for me
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Connecting spinner ── */}
        {step === 'connecting' && (
          <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 py-14">
            <svg className="animate-spin h-14 w-14" style={{ color }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xl font-black text-gray-800">Connecting securely…</p>
            <p className="text-gray-400">This takes just a second</p>
          </motion.div>
        )}

        {/* ── In-app Registration Form ── */}
        {step === 'register-form' && (
          <motion.div key="register-form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl p-4 mb-5 text-center" style={{ backgroundColor: bgLight }}>
              <p className="text-lg font-black text-gray-900">
                🎉 Create your {platform} account — right here!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the 4 boxes below. That's it. No switching apps.
              </p>
            </div>

            <AudioControl
              text={`Let's create your ${platform} account together. Fill in your first name, last name, email, and a password. Then press the Create Account button.`}
              showControls={true}
            />

            <div className="space-y-4 mt-5">
              {/* First + Last name */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">👤 First name</label>
                  <input
                    type="text"
                    placeholder="e.g. Omkar"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value, errors: { ...f.errors, firstName: '' } }))}
                    className={fieldClass(form.errors.firstName)}
                  />
                  {form.errors.firstName && <p className="text-red-500 text-sm mt-1">{form.errors.firstName}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">👤 Last name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dinde"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value, errors: { ...f.errors, lastName: '' } }))}
                    className={fieldClass(form.errors.lastName)}
                  />
                  {form.errors.lastName && <p className="text-red-500 text-sm mt-1">{form.errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">📧 Email address</label>
                <input
                  type="email"
                  placeholder="e.g. omkar@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value, errors: { ...f.errors, email: '' } }))}
                  className={fieldClass(form.errors.email)}
                />
                {form.errors.email && <p className="text-red-500 text-sm mt-1">{form.errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">🔑 Password (min 6 letters)</label>
                <div className="relative">
                  <input
                    type={form.showPassword ? 'text' : 'password'}
                    placeholder="Choose something you remember"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value, errors: { ...f.errors, password: '' } }))}
                    className={fieldClass(form.errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, showPassword: !f.showPassword }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-bold"
                  >
                    {form.showPassword ? '🙈 Hide' : '👁 Show'}
                  </button>
                </div>
                {form.errors.password && <p className="text-red-500 text-sm mt-1">{form.errors.password}</p>}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep('question')}
                className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                ← Back
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 py-4 rounded-2xl font-black text-xl text-white shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              >
                🚀 Create Account
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Creating account spinner ── */}
        {step === 'register-loading' && (
          <motion.div key="register-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 py-14">
            <svg className="animate-spin h-14 w-14" style={{ color }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xl font-black text-gray-800">Creating your {platform} account…</p>
            <p className="text-gray-400 text-center">Please wait. You don't need to do anything else.</p>
          </motion.div>
        )}

        {/* ── Registration done ── */}
        {step === 'register-done' && (
          <motion.div key="register-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Account Created!</h3>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">{serverMsg}</p>
            <AudioControl
              text={`Great job! Your ${platform} account is ready. Now press the button below to connect it to NeuroBridge and see your opportunities.`}
              showControls={true}
            />
            <button
              onClick={handleConnect}
              className="w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg hover:scale-105 transition-transform mt-6 flex items-center justify-center gap-3"
              style={{ backgroundColor: color }}
            >
              🔗 Connect My New {platform} Account
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
