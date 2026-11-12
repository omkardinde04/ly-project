import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthService } from '../auth';
import database from '../database';
import crypto from 'crypto';
import UserModel from '../models/User';
import AssessmentResult from '../models/AssessmentResult';
// @ts-ignore
import nodemailer from 'nodemailer';

export const emailAuthRouter = Router();

// ─── EMAIL SENDING ────────────────────────────────────────────────────────────
// Order of attempts:
//   1. Gmail SMTP on port 465 (SSL)        — EMAIL_USER + EMAIL_PASSWORD (App Password)
//   2. Gmail SMTP on port 587 (STARTTLS)   — some networks block 465 but allow 587
//   3. Resend HTTPS API                    — RESEND_API_KEY; works where SMTP ports are
//      blocked (college / office Wi-Fi). Note: with the shared sender
//      onboarding@resend.dev, Resend only delivers to the Resend account's own email.
// The last failure reason is kept so the UI and /email-status can explain it.

type EmailAttempt = { via: string; ok: boolean; error?: string };
let lastEmailReport: { at: string; to: string; attempts: EmailAttempt[] } | null = null;

const gmailConfigured = () => {
  const pass = process.env.EMAIL_PASSWORD;
  return !!process.env.EMAIL_USER && !!pass && pass !== 'your-gmail-app-password-here';
};

const smtpTransport = (port: 465 | 587) =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.EMAIL_USER,
      // App Passwords are shown with spaces ("abcd efgh ijkl mnop"); Gmail wants them without
      pass: (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, ''),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

/** Turn nodemailer / network errors into something a person can act on. */
const explainEmailError = (error: any): string => {
  const code = error?.code || '';
  const responseCode = error?.responseCode;
  const msg = String(error?.message || error);
  if (code === 'EAUTH' || responseCode === 535 || /BadCredentials|Username and Password not accepted/i.test(msg)) {
    return 'Gmail rejected the login. The App Password is wrong or was revoked — make a new one at https://myaccount.google.com/apppasswords (2-Step Verification must be on) and put it in EMAIL_PASSWORD.';
  }
  if (['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ESOCKET', 'EDNS', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNECTION'].includes(code) || /timeout/i.test(msg)) {
    return `Could not reach the mail server (${code || 'timeout'}). This network is probably blocking email ports 465/587 — try another Wi-Fi or a phone hotspot, or set up Resend.`;
  }
  return `${code ? code + ': ' : ''}${msg}`.slice(0, 300);
};

const sendViaResend = async (to: string, subject: string, html: string): Promise<void> => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.RESEND_FROM || 'NeuroBridge <onboarding@resend.dev>', to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`);
  }
};

// Helper: send email — returns true when any method delivered it to the mail server
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const attempts: EmailAttempt[] = [];
  const fromAddress = process.env.EMAIL_FROM || `NeuroBridge <${process.env.EMAIL_USER}>`;

  if (gmailConfigured()) {
    for (const port of [465, 587] as const) {
      try {
        const info = await smtpTransport(port).sendMail({ from: fromAddress, to, subject, html });
        attempts.push({ via: `gmail:${port}`, ok: true });
        lastEmailReport = { at: new Date().toISOString(), to, attempts };
        console.log(`✅ Email sent to ${to} via Gmail port ${port} — Message ID: ${info.messageId}`);
        return true;
      } catch (error: any) {
        const reason = explainEmailError(error);
        attempts.push({ via: `gmail:${port}`, ok: false, error: reason });
        console.error(`❌ Gmail (port ${port}) failed: ${reason}`);
        if (error?.code === 'EAUTH') break; // wrong password — the other port won't help
      }
    }
  } else {
    attempts.push({ via: 'gmail', ok: false, error: 'EMAIL_USER / EMAIL_PASSWORD are not set in backend/.env' });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(to, subject, html);
      attempts.push({ via: 'resend', ok: true });
      lastEmailReport = { at: new Date().toISOString(), to, attempts };
      console.log(`✅ Email sent to ${to} via Resend`);
      return true;
    } catch (error: any) {
      const reason = String(error?.message || error).slice(0, 300);
      attempts.push({ via: 'resend', ok: false, error: reason });
      console.error(`❌ Resend failed: ${reason}`);
    }
  }

  lastEmailReport = { at: new Date().toISOString(), to, attempts };
  return false;
};

/** Short reason for the most recent failed send (shown on the sign-up screen in dev). */
const lastEmailError = (): string | undefined =>
  lastEmailReport?.attempts.find((a) => !a.ok && a.via.startsWith('gmail'))?.error ||
  lastEmailReport?.attempts.find((a) => !a.ok)?.error;

// Check Gmail login once at local startup (skip on serverless cold starts)
if (!process.env.VERCEL) {
  if (gmailConfigured()) {
    smtpTransport(465)
      .verify()
      .then(() => console.log(`✅ Email ready: Gmail login OK for ${process.env.EMAIL_USER}`))
      .catch((error: any) => console.error(`⚠️  Email check failed: ${explainEmailError(error)}`));
  } else {
    console.warn('⚠️  Email not configured: set EMAIL_USER and EMAIL_PASSWORD in backend/.env');
  }
}

// Helper: generate a secure random token
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// ─── PASSWORD POLICY ──────────────────────────────────────────────────────────
// Same rules as the sign-up form: 6+ characters, at least one number and at
// least one special character (anything that is not a letter or a digit).
const passwordProblem = (password: unknown): string | null => {
  if (typeof password !== 'string' || password.length < 6) return 'Password must be at least 6 characters long';
  if (password.length > 128) return 'Password must be 128 characters or fewer';
  if (!/\d/.test(password)) return 'Password must include at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character (for example ! @ # $)';
  return null;
};

// ─── LINK BASE URL ────────────────────────────────────────────────────────────
// Where links in emails point. FRONTEND_URL wins, except a localhost value on a
// deployed (Vercel) backend — then use the project's public production URL,
// which Vercel provides at runtime. Never taken from request headers, so a
// forged Origin/Host cannot redirect a verification link to another site.
const appBaseUrl = (): string => {
  const configured = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured);
  if (configured && !(isLocal && process.env.VERCEL)) return configured;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (process.env.VERCEL && vercelHost) return `https://${vercelHost}`;
  return configured || 'http://localhost:5147';
};

// ─── PENDING SIGN-UPS ─────────────────────────────────────────────────────────
// After sign-up the browser gets an opaque id it can poll to learn when the
// email link has been clicked (so the page can move on by itself). The id is
// the email + expiry encrypted with AES-256-GCM, so it reveals nothing about the
// address and needs no server memory — serverless instances don't share memory.
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;
const pendingKey = crypto
  .createHash('sha256')
  .update(`pending-signup:${process.env.JWT_SECRET || process.env.SESSION_SECRET || 'neurobridge-dev-secret'}`)
  .digest();

const createPendingId = (email: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', pendingKey, iv);
  const payload = JSON.stringify({ e: email, x: Date.now() + PENDING_TTL_MS });
  const data = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
};

/** Returns the email for a valid, unexpired pending id, otherwise null. */
const readPendingId = (id: string): string | null => {
  try {
    const raw = Buffer.from(id, 'base64url');
    if (raw.length < 29) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', pendingKey, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8'));
    if (typeof payload?.e !== 'string' || typeof payload?.x !== 'number' || payload.x < Date.now()) return null;
    return payload.e;
  } catch {
    return null;
  }
};

// ─── Email HTML Templates ──────────────────────────────────────────────────────
const verificationEmailHtml = (link: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify Your Email – NeuroBridge</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1D64D8,#3B82F6);padding:40px 40px 30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">NeuroBridge</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Empowering every kind of mind</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 12px;color:#1a202c;font-size:22px;font-weight:700;">Verify Your Email Address</h2>
          <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
            Welcome to NeuroBridge! Click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#1D64D8,#3B82F6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
              ✅ Verify My Email
            </a>
          </div>
          <p style="margin:0 0 8px;color:#718096;font-size:13px;">Or paste this link into your browser:</p>
          <p style="margin:0 0 24px;word-break:break-all;"><a href="${link}" style="color:#1D64D8;font-size:13px;">${link}</a></p>
          <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:20px;">
            <p style="margin:0;color:#a0aec0;font-size:13px;">⏰ This link expires in <strong>24 hours</strong>. If you didn't create this account, you can safely ignore this email.</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const resetPasswordEmailHtml = (link: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Your Password – NeuroBridge</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f0f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#7C3AED,#A855F7);padding:40px 40px 30px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">NeuroBridge</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Password Reset Request</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 12px;color:#1a202c;font-size:22px;font-weight:700;">Reset Your Password</h2>
          <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
            We received a request to reset your NeuroBridge password. Click the button below to set a new password.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#A855F7);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
              🔑 Reset My Password
            </a>
          </div>
          <p style="margin:0 0 8px;color:#718096;font-size:13px;">Or paste this link into your browser:</p>
          <p style="margin:0 0 24px;word-break:break-all;"><a href="${link}" style="color:#7C3AED;font-size:13px;">${link}</a></p>
          <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:20px;">
            <p style="margin:0;color:#a0aec0;font-size:13px;">⏰ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email — your account is safe.</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── REGISTER ──────────────────────────────────────────────────────────────────
// POST /api/auth/email/register
// Creates user (unverified) and sends verification email
emailAuthRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const pwProblem = passwordProblem(password);
    if (pwProblem) {
      return res.status(400).json({ error: pwProblem });
    }

    // ── Check duplicate email ────────────────────────────────────────────────
    const existingUser = await database.findUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      if (!existingUser.email_verified) {
        // Resend verification email for unverified accounts
        const newToken = generateToken();
        await database.saveVerificationToken(existingUser.email, newToken, 24 * 60);
        const verificationLink = `${appBaseUrl()}/verify-email?token=${newToken}`;
        const resent = await sendEmail(existingUser.email, 'Verify Your NeuroBridge Account', verificationEmailHtml(verificationLink));

        return res.status(400).json({
          error: 'Account already exists but email not verified. A new verification email has been sent — please check your inbox.',
          needsVerification: true,
          emailSent: resent,
          emailError: !resent && process.env.NODE_ENV !== 'production' ? lastEmailError() : undefined,
          devVerifyLink: !resent && process.env.NODE_ENV !== 'production' ? verificationLink : undefined,
          pendingId: createPendingId(existingUser.email),
        });
      }
      return res.status(400).json({ error: 'An account with this email already exists. Please login.' });
    }

    // ── Hash password & create user ──────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);
    const normalizedEmail = email.toLowerCase().trim();

    const user = await database.createUserWithEmail({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // ── Save verification token ──────────────────────────────────────────────
    const verificationToken = generateToken();
    await database.saveVerificationToken(normalizedEmail, verificationToken, 24 * 60); // 24 hours

    // ── Send verification email ──────────────────────────────────────────────
    const verificationLink = `${appBaseUrl()}/verify-email?token=${verificationToken}`;
    const emailSent = await sendEmail(
      normalizedEmail,
      'Verify Your NeuroBridge Account',
      verificationEmailHtml(verificationLink)
    );

    if (!emailSent) {
      console.warn(`⚠️  Could not send verification email to ${normalizedEmail}. Token: ${verificationToken}`);
      // Still create account but warn about email
      return res.status(201).json({
        success: true,
        message: 'Account created! However, the verification email could not be sent (email not configured). Please contact support.',
        emailSent: false,
        // In dev mode expose the link so you can test without email
        devVerifyLink: process.env.NODE_ENV !== 'production' ? verificationLink : undefined,
        emailError: process.env.NODE_ENV !== 'production' ? lastEmailError() : undefined,
        pendingId: createPendingId(normalizedEmail),
        user: { id: user.id, name: user.name, email: user.email, email_verified: false },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Account created! We sent a verification email to ${normalizedEmail}. Please check your inbox (and spam folder) and click the link to activate your account.`,
      emailSent: true,
      pendingId: createPendingId(normalizedEmail),
      user: { id: user.id, name: user.name, email: user.email, email_verified: false },
    });
  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : error);
    res.status(500).json({
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV !== 'production' ? (error instanceof Error ? error.message : String(error)) : undefined,
    });
  }
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
// POST /api/auth/email/verify-email
// Called from the /verify-email frontend page with the token from the email link
emailAuthRouter.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await database.verifyEmailToken(token);
    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification link. Please register again to get a new link.',
      });
    }

    await database.markEmailVerified(user.id!);

    return res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      email: user.email,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// ─── EMAIL + DATABASE STATUS (development only, this computer only) ──────────
// GET /api/auth/email/email-status        → which database users go to + mail setup
// GET /api/auth/email/email-status?test=1 → also logs in to Gmail right now
emailAuthRouter.get('/email-status', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || '';
  const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
  if (process.env.NODE_ENV === 'production' || !isLocal) return res.status(404).end();

  const conn = UserModel.db;
  let gmailLogin: string | undefined;
  if (req.query.test && gmailConfigured()) {
    gmailLogin = await smtpTransport(465)
      .verify()
      .then(() => 'ok')
      .catch((error: any) => explainEmailError(error));
  }
  const recent = await UserModel.find({}, { email: 1, email_verified: 1, google_id: 1, created_at: 1 })
    .sort({ created_at: -1 })
    .limit(5)
    .lean();
  return res.json({
    database: { host: conn.host, port: conn.port, name: conn.name, collection: UserModel.collection.collectionName },
    users: await UserModel.countDocuments(),
    recentUsers: recent.map((u: any) => ({
      email: u.email,
      verified: !!u.email_verified,
      google: !!u.google_id,
      created_at: u.created_at,
    })),
    email: {
      gmailUser: process.env.EMAIL_USER || null,
      gmailPasswordSet: gmailConfigured(),
      resendKeySet: !!process.env.RESEND_API_KEY,
      gmailLogin,
      lastSend: lastEmailReport,
    },
  });
});

// ─── VERIFICATION STATUS ──────────────────────────────────────────────────────
// GET /api/auth/email/verification-status/:pendingId
// Polled by the "check your email" screen right after sign-up.
emailAuthRouter.get('/verification-status/:pendingId', async (req: Request, res: Response) => {
  try {
    const email = readPendingId(String(req.params.pendingId || ''));
    if (!email) {
      return res.status(404).json({ error: 'Unknown or expired sign-up' });
    }
    const user = await database.findUserByEmail(email);
    return res.json({ verified: !!user?.email_verified });
  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Could not check verification status' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/email/login
emailAuthRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await database.findUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please create an account first.' });
    }

    // Google-only account trying to use email/password login
    if (!user.password) {
      return res.status(401).json({
        error: 'This account was created with Google. Please use "Continue with Google" to sign in.',
      });
    }

    // Email not verified yet
    if (!user.email_verified) {
      return res.status(401).json({
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: user.email,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password. Please try again or use Forgot Password.' });
    }

    const token = AuthService.generateToken(user);
    const redirectUrl = user.assessment_completed ? '/dashboard' : '/assessment';

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        assessment_completed: user.assessment_completed,
        assessment_score: user.assessment_score,
        classification: user.classification,
      },
      redirect: redirectUrl,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
// POST /api/auth/email/resend-verification
emailAuthRouter.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await database.findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.json({ success: true, message: 'If an account with this email exists, a verification email will be sent.' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'This email is already verified. Please log in.' });
    }

    const newToken = generateToken();
    await database.saveVerificationToken(user.email, newToken, 24 * 60);
    const verificationLink = `${appBaseUrl()}/verify-email?token=${newToken}`;
    const sent = await sendEmail(user.email, 'Verify Your NeuroBridge Account', verificationEmailHtml(verificationLink));
    if (!sent) {
      return res.status(502).json({
        error: 'Could not send the email right now. Please try again in a minute.',
        emailError: process.env.NODE_ENV !== 'production' ? lastEmailError() : undefined,
        devVerifyLink: process.env.NODE_ENV !== 'production' ? verificationLink : undefined,
      });
    }

    return res.json({ success: true, message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email.' });
  }
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
// POST /api/auth/email/forgot-password
// Sends a password reset link to the user's email
emailAuthRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await database.findUserByEmail(email.toLowerCase().trim());

    // Security: don't reveal if email exists or not
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Google-only accounts (no password) can still set a password via reset
    const resetToken = generateToken();
    await database.saveResetToken(user.email, resetToken, 60); // 1 hour

    const resetLink = `${appBaseUrl()}/reset-password?token=${resetToken}`;
    const emailSent = await sendEmail(
      user.email,
      'Reset Your NeuroBridge Password',
      resetPasswordEmailHtml(resetLink)
    );

    if (!emailSent) {
      console.warn(`⚠️  Could not send reset email to ${user.email}. Reset link: ${resetLink}`);
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
        // Expose link in dev if email not configured
        devResetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
      });
    }

    return res.json({
      success: true,
      message: 'Password reset link sent! Please check your inbox (and spam folder). The link expires in 1 hour.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
// POST /api/auth/email/reset-password
// Validates the token and updates the user's password
emailAuthRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const newPwProblem = passwordProblem(newPassword);
    if (newPwProblem) {
      return res.status(400).json({ error: newPwProblem });
    }

    // Validate the reset token
    const user = await database.verifyResetToken(token);
    if (!user) {
      return res.status(400).json({
        error: 'This reset link is invalid or has expired. Please request a new password reset.',
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear the reset token
    const success = await database.resetPasswordWithToken(token, hashedPassword);
    if (!success) {
      return res.status(400).json({ error: 'Password reset failed. Please try requesting a new reset link.' });
    }

    // Also mark email as verified (in case they never verified but are resetting password)
    if (!user.email_verified) {
      await database.markEmailVerified(user.id!);
    }

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed. Please try again.' });
  }
});

// ─── GET USER INFO ────────────────────────────────────────────────────────────
// GET /api/auth/email/me  (used by AuthContext for email-login users)
emailAuthRouter.get('/me', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await database.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id, google_id, name, email, profile_picture, assessment_completed, assessment_score, classification, reading_profile, email_verified, created_at } = user;
    return res.json({
      id,
      google_id,
      name,
      email,
      profile_picture,
      assessment_completed,
      assessment_score,
      classification,
      reading_profile: reading_profile || null,
      email_verified,
      created_at,
    });
  } catch (error) {
    console.error('Get email user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

emailAuthRouter.patch('/me', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const updateData: any = {};
    if (req.body?.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name || name.length > 80) return res.status(400).json({ error: 'Name must be between 1 and 80 characters' });
      updateData.name = name;
    }
    if (req.body?.profile_picture !== undefined) {
      updateData.profile_picture = String(req.body.profile_picture || '');
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    const user = await database.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await UserModel.findByIdAndUpdate(req.user.userId, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ id: String(updated._id), name: updated.name, email: updated.email, profile_picture: updated.profile_picture, assessment_completed: updated.assessment_completed, email_verified: updated.email_verified, created_at: updated.created_at });
  } catch (error) { console.error('Update profile error:', error); res.status(500).json({ error: 'Could not update profile' }); }
});

// ─── READING PROFILE & ASSESSMENT (Email Authenticated) ───────────────────────
emailAuthRouter.post('/reading-profile', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const { reading_profile } = req.body;
    if (!reading_profile || typeof reading_profile !== 'object') {
      return res.status(400).json({ error: 'Valid reading_profile object is required' });
    }
    const updated = await database.updateUserReadingProfile(req.user.userId, reading_profile);
    res.json({ success: true, reading_profile: updated.reading_profile });
  } catch (error: any) {
    console.error('Email save reading profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

emailAuthRouter.post('/assessment/complete', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const { assessment_score, classification, assessment_metrics, reading_profile } = req.body;

    if (
      typeof assessment_score !== 'number' ||
      !Number.isFinite(assessment_score) ||
      assessment_score < 0 ||
      assessment_score > 100 ||
      typeof classification !== 'string' ||
      !classification.trim()
    ) {
      return res.status(400).json({ error: 'Assessment score and classification are required' });
    }

    let parsedReadingProfile: any = null;
    if (reading_profile) {
      parsedReadingProfile = typeof reading_profile === 'string' ? JSON.parse(reading_profile) : reading_profile;
    }

    await database.updateUserAssessment(req.user.userId, {
      assessment_completed: true,
      assessment_score,
      classification,
      assessment_metrics,
      ...(parsedReadingProfile ? { reading_profile: parsedReadingProfile } : {})
    });

    let parsedMetrics: any = {};
    try {
      if (assessment_metrics) {
        parsedMetrics = JSON.parse(assessment_metrics);
      }
    } catch (e) {
      console.error('Error parsing metrics:', e);
    }

    if (parsedReadingProfile) {
      parsedMetrics.readingProfile = parsedReadingProfile;
    }

    const newResult = new AssessmentResult({
      userId: req.user.userId,
      score: assessment_score,
      classification: classification,
      metrics: parsedMetrics
    });

    await newResult.save();

    res.json({
      success: true,
      message: 'Assessment completed successfully',
      reading_profile: parsedReadingProfile
    });
  } catch (error) {
    console.error('Email assessment completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

emailAuthRouter.post('/assessment/retake', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    await database.updateUserAssessment(req.user.userId, {
      assessment_completed: false,
      assessment_score: undefined,
      classification: undefined
    });
    res.json({ success: true, message: 'Assessment reset successfully' });
  } catch (error) {
    console.error('Email assessment retake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
