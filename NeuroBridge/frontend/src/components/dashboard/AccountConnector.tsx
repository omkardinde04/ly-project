import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioControl } from '../ui/AudioControl';

interface AccountConnectorProps {
  platform: 'LinkedIn' | 'Unstop';
  color: string;
  icon: React.ReactNode;
  onConnect: () => void;
}

type Step = 'question' | 'connecting' | 'create-step-1' | 'create-step-2' | 'create-step-3';

export function AccountConnector({ platform, color, icon, onConnect }: AccountConnectorProps) {
  const [step, setStep] = useState<Step>('question');
  const [connectError, setConnectError] = useState('');

  const signupUrl = platform === 'LinkedIn'
    ? 'https://www.linkedin.com/signup'
    : 'https://unstop.com/auth/signup';

  const handleConnect = async () => {
    setStep('connecting');
    setConnectError('');
    try {
      const res = await fetch(
        `http://localhost:4000/api/opportunities/connect/${platform.toLowerCase()}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Server error');
      onConnect();
    } catch {
      setConnectError('Could not connect. Please try again.');
      setStep('question');
    }
  };

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
          <h2 className="text-2xl font-black text-gray-900">Connect {platform}</h2>
          <p className="text-gray-500 text-base">Safe · Private · One click</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Simple question ── */}
        {step === 'question' && (
          <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <p className="text-xl font-bold text-gray-800 mb-2">
                Do you have a {platform} account?
              </p>
              <p className="text-gray-500 text-base">
                Don't worry — there is no wrong answer here 😊
              </p>
            </div>

            <AudioControl
              text={`Do you have a ${platform} account? Choose yes to connect it safely. Choose no and we will help you make one step by step.`}
              showControls={true}
            />

            {connectError && (
              <p className="text-red-500 text-sm mt-2 text-center">{connectError}</p>
            )}

            <div className="flex flex-col gap-4 mt-6">
              {/* YES */}
              <button
                onClick={handleConnect}
                className="w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg
                           transition-transform hover:scale-105 flex items-center justify-center gap-3"
                style={{ backgroundColor: color }}
              >
                <span>✅</span>
                Yes — Connect my account safely
              </button>

              {/* NO */}
              <button
                onClick={() => setStep('create-step-1')}
                className="w-full py-5 rounded-2xl font-black text-xl border-2 transition-colors
                           flex items-center justify-center gap-3 hover:bg-gray-50"
                style={{ borderColor: color, color }}
              >
                <span>🆕</span>
                No — Help me make one
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Connecting spinner ── */}
        {step === 'connecting' && (
          <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 py-12">
            <svg className="animate-spin h-14 w-14" style={{ color }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xl font-bold text-gray-700">Connecting securely…</p>
            <p className="text-gray-400 text-base">This will only take a moment</p>
          </motion.div>
        )}

        {/* ── Create Step 1: Go to site ── */}
        {step === 'create-step-1' && (
          <motion.div key="create-1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <StepHeader current={1} total={3} />
            <div className="bg-blue-50 rounded-2xl p-6 mb-6 text-center">
              <p className="text-5xl mb-3">🌐</p>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Open {platform}</h3>
              <p className="text-lg text-gray-600">
                We will open {platform} in a new tab. <br />
                Click <strong>Sign Up</strong> on that page.
              </p>
            </div>
            <AudioControl
              text={`Step 1. We will open ${platform} in a new tab. Click the Sign Up button on that page. Come back here when you are done.`}
              showControls={true}
            />
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep('question')}
                className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                ← Back
              </button>
              <button
                onClick={() => { window.open(signupUrl, '_blank'); setStep('create-step-2'); }}
                className="flex-1 py-4 rounded-2xl font-bold text-xl text-white shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              >
                Open {platform} →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Create Step 2: Fill in details ── */}
        {step === 'create-step-2' && (
          <motion.div key="create-2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <StepHeader current={2} total={3} />
            <div className="bg-green-50 rounded-2xl p-6 mb-6">
              <p className="text-5xl mb-3 text-center">📝</p>
              <h3 className="text-2xl font-black text-gray-900 mb-4 text-center">Fill in 3 things</h3>
              <div className="space-y-3">
                {[
                  { icon: '📧', label: 'Your email address' },
                  { icon: '🔑', label: 'A password you will remember' },
                  { icon: '👤', label: 'Your first and last name' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg font-semibold text-gray-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <AudioControl
              text={`Step 2. On the ${platform} page, enter your email, choose a password, and add your name. That is all you need.`}
              showControls={true}
            />
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep('create-step-1')}
                className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                ← Back
              </button>
              <button onClick={() => setStep('create-step-3')}
                className="flex-1 py-4 rounded-2xl font-bold text-xl text-white shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              >
                Done! Next →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Create Step 3: Come back and connect ── */}
        {step === 'create-step-3' && (
          <motion.div key="create-3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <StepHeader current={3} total={3} />
            <div className="bg-purple-50 rounded-2xl p-6 mb-6 text-center">
              <p className="text-5xl mb-3">🎉</p>
              <h3 className="text-2xl font-black text-gray-900 mb-2">You are almost done!</h3>
              <p className="text-lg text-gray-600">
                You have created your {platform} account. <br />
                Now click the button below to connect it here.
              </p>
            </div>
            <AudioControl
              text={`Step 3 and final step. Great job creating your ${platform} account! Now click the Connect button below and we will link it to NeuroBridge.`}
              showControls={true}
            />
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep('create-step-2')}
                className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                ← Back
              </button>
              <button
                onClick={handleConnect}
                className="flex-1 py-4 rounded-2xl font-bold text-xl text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                style={{ backgroundColor: color }}
              >
                🔗 Connect Now
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

// ── Step indicator sub-component ──────────────────────────────────────────────
function StepHeader({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm
            ${i + 1 <= current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-1 rounded-full ${i + 1 < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
      <span className="ml-2 text-gray-500 text-sm font-semibold">Step {current} of {total}</span>
    </div>
  );
}
