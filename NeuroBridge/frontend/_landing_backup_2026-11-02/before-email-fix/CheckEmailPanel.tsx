import { useCallback, useEffect, useRef, useState } from 'react';
import { MailCheck, ExternalLink, RotateCw, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { AUTH_CHANNEL, EMAIL_AUTH_API as API, mailProviderFor, openInboxBeside } from '../../utils/emailVerification';

const POLL_MS = 4000;
const RESEND_COOLDOWN_S = 30;


interface CheckEmailPanelProps {
  email: string;
  pendingId?: string;
  emailSent: boolean;
  devVerifyLink?: string;
  /** Called once when we learn the address has been verified. */
  onVerified: () => void;
  onBack: () => void;
  /** "Already clicked the link?" — just go to the log-in form. */
  onGoToLogin: () => void;
}

export function CheckEmailPanel({ email, pendingId, emailSent, devVerifyLink, onVerified, onBack, onGoToLogin }: CheckEmailPanelProps) {
  const provider = mailProviderFor(email);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const popupRef = useRef<Window | null>(null);
  const doneRef = useRef(false);

  const markVerified = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setVerified(true);
    try {
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    } catch {
      /* the popup may already be gone */
    }
    window.focus();
    onVerified();
  }, [onVerified]);

  // 1) Instant: the /verify-email page announces success on this channel
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = (event) => {
      const data = event.data as { type?: string; email?: string } | null;
      if (data?.type !== 'email-verified') return;
      if (!data.email || data.email.toLowerCase() === email.toLowerCase()) markVerified();
    };
    return () => channel.close();
  }, [email, markVerified]);

  // 2) Fallback: ask the server (covers the link being opened on a phone)
  useEffect(() => {
    if (!pendingId) return;
    let stopped = false;
    const check = async () => {
      // Keeps going in the background too: the inbox window may cover this one
      if (stopped || doneRef.current) return;
      try {
        const res = await fetch(`${API}/verification-status/${encodeURIComponent(pendingId)}`);
        if (res.status === 404) {
          stopped = true;
          return;
        }
        const data = await res.json();
        if (data?.verified) markVerified();
      } catch {
        /* offline for a moment — try again on the next tick */
      }
    };
    const timer = window.setInterval(check, POLL_MS);
    const onFocus = () => void check();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [pendingId, markVerified]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const openInbox = () => {
    popupRef.current = openInboxBeside(provider.url);
  };

  const resend = async () => {
    if (cooldown > 0 || resendState === 'sending') return;
    setResendState('sending');
    try {
      const res = await fetch(`${API}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data?.success) {
        setResendState('sent');
        setCooldown(RESEND_COOLDOWN_S);
      } else if (typeof data?.error === 'string' && /already verified/i.test(data.error)) {
        markVerified();
      } else {
        setResendState('error');
      }
    } catch {
      setResendState('error');
    }
  };

  if (verified) {
    return (
      <div className="text-center space-y-4 py-4" role="status">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={34} className="text-emerald-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A202C]">Email verified!</h2>
        <p className="text-sm text-[#64748B] font-medium">Your account is ready. Log in to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left" data-check-email>
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          <MailCheck size={30} className="text-[#2563EB]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A202C] tracking-tight">Check your email</h2>
        <p className="text-sm text-[#475569] font-medium leading-relaxed">
          {emailSent ? 'We sent a link to' : 'Your account is made for'}
          <br />
          <span className="font-bold text-[#1A202C] break-all">{email}</span>
        </p>
        {emailSent && (
          <p className="text-sm text-[#475569] font-medium">Click the link in that email to turn on your account.</p>
        )}
      </div>

      {emailSent ? (
        <button
          type="button"
          onClick={openInbox}
          className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2"
        >
          <span>{`Open ${provider.name}`}</span>
          <ExternalLink size={15} />
        </button>
      ) : (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold space-y-1.5">
          <p>The server could not send the email (email is not set up yet).</p>
          {devVerifyLink && (
            <a
              href={devVerifyLink}
              target="_blank"
              rel="noreferrer"
              className="text-[#2563EB] underline font-bold break-all"
            >
              Open the verify link
            </a>
          )}
        </div>
      )}

      {emailSent && (
        <p className="text-xs text-[#64748B] font-medium text-center leading-relaxed">
          {provider.name} opens next to this page. Keep this page open, it moves on by itself once you click the link.
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#64748B]" aria-live="polite">
        <Loader2 size={14} className="animate-spin motion-reduce:animate-none text-[#2563EB]" aria-hidden />
        <span>Waiting for you to click the link…</span>
      </div>

      <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 space-y-2">
        <p className="text-xs font-bold text-[#1A202C]">Can't find it?</p>
        <ul className="text-xs text-[#475569] font-medium space-y-1 list-disc pl-4">
          <li>Look in the Spam or Promotions folder.</li>
          <li>The link works for 24 hours.</li>
        </ul>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0 || resendState === 'sending'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline disabled:text-[#94A3B8] disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCw size={13} className={resendState === 'sending' ? 'animate-spin motion-reduce:animate-none' : ''} />
            {cooldown > 0 ? `Send again in ${cooldown}s` : 'Send the email again'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#475569] hover:text-[#1A202C] hover:underline cursor-pointer"
          >
            Wrong email? Go back
          </button>
        </div>
        {resendState === 'sent' && <p className="text-xs font-semibold text-emerald-700">Sent! Check your inbox again.</p>}
        {resendState === 'error' && <p className="text-xs font-semibold text-red-600">Could not send. Please try again.</p>}
      </div>

      <p className="text-center text-xs text-[#64748B] font-medium">
        Already clicked the link?{' '}
        <button
          type="button"
          onClick={onGoToLogin}
          className="font-bold text-[#2563EB] hover:underline cursor-pointer inline-flex items-center gap-0.5"
        >
          Log in <ArrowRight size={12} />
        </button>
      </p>
    </div>
  );
}
