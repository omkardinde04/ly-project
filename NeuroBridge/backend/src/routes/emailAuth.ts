import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthService } from '../auth';
import database from '../database';
import crypto from 'crypto';
// @ts-ignore
import nodemailer from 'nodemailer';

export const emailAuthRouter = Router();

// ─── Email Transporter ─────────────────────────────────────────────────────────
// Uses Gmail with App Password. Set EMAIL_USER and EMAIL_PASSWORD in .env
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Helper: generate a secure random token
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper: send email — logs detailed error if sending fails
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPass || emailPass === 'your-gmail-app-password-here') {
    console.error('❌ EMAIL NOT CONFIGURED: Set EMAIL_USER and EMAIL_PASSWORD in backend/.env');
    console.error('   Get a Gmail App Password at: https://myaccount.google.com/apppasswords');
    return false;
  }

  try {
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || `NeuroBridge <${emailUser}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} — Message ID: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Email send error:', error?.message || error);
    return false;
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

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // ── Check duplicate email ────────────────────────────────────────────────
    const existingUser = await database.findUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      if (!existingUser.email_verified) {
        // Resend verification email for unverified accounts
        const newToken = generateToken();
        await database.saveVerificationToken(existingUser.email, newToken, 24 * 60);
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5147'}/verify-email?token=${newToken}`;
        await sendEmail(email, 'Verify Your NeuroBridge Account', verificationEmailHtml(verificationLink));

        return res.status(400).json({
          error: 'Account already exists but email not verified. A new verification email has been sent — please check your inbox.',
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
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5147'}/verify-email?token=${verificationToken}`;
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
        user: { id: user.id, name: user.name, email: user.email, email_verified: false },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Account created! We sent a verification email to ${normalizedEmail}. Please check your inbox (and spam folder) and click the link to activate your account.`,
      emailSent: true,
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
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
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
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5147'}/verify-email?token=${newToken}`;
    await sendEmail(user.email, 'Verify Your NeuroBridge Account', verificationEmailHtml(verificationLink));

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

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5147'}/reset-password?token=${resetToken}`;
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

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
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

    const { id, google_id, name, email, profile_picture, assessment_completed, assessment_score, classification, email_verified, created_at } = user;
    return res.json({
      id,
      google_id,
      name,
      email,
      profile_picture,
      assessment_completed,
      assessment_score,
      classification,
      email_verified,
      created_at,
    });
  } catch (error) {
    console.error('Get email user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
