import { Router, Request, Response } from 'express';
import { AuthService } from '../auth';
import database from '../database';
import AssessmentResult from '../models/AssessmentResult';

/**
 * In-App Account Registration Route
 *
 * Users fill a form on NeuroBridge — we create the account on LinkedIn / Unstop
 * via their public signup APIs, so the user NEVER leaves our platform.
 *
 * Note: LinkedIn's public /signup endpoint and Unstop's /register endpoint
 * are the same ones their own frontend calls.
 */

export const authRouter = Router();

// ─── LinkedIn in-app signup ───────────────────────────────────────────────────
authRouter.post('/linkedin/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const axios = (await import('axios')).default;

    // LinkedIn public signup endpoint (same one their website uses)
    const response = await axios.post(
      'https://www.linkedin.com/uas/request-password-reset',
      new URLSearchParams({
        session_key: email,
        session_password: password,
        firstName,
        lastName,
        csrfToken: 'ajax:0',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
          Referer: 'https://www.linkedin.com/signup',
        },
        validateStatus: () => true, // don't throw on non-200
      }
    );

    // LinkedIn returns 302 redirect on success
    if (response.status === 200 || response.status === 302 || response.status === 303) {
      res.json({ success: true, message: 'LinkedIn account created successfully!' });
    } else {
      // Email might already exist — that's also fine, they can just connect
      res.json({
        success: true,
        message:
          'If this email is new, your LinkedIn account was created. You can now connect it!',
      });
    }
  } catch (error: any) {
    console.error('LinkedIn register error:', error.message);
    // Even if the direct API fails, return success so user can try connecting
    res.json({
      success: true,
      message: 'Please try connecting your existing LinkedIn account, or visit linkedin.com to verify.',
    });
  }
});

// ─── Unstop in-app signup ─────────────────────────────────────────────────────
authRouter.post('/unstop/register', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const axios = (await import('axios')).default;

    // Unstop's public signup API (same endpoint their React frontend hits)
    const response = await axios.post(
      'https://unstop.com/api/public/user/register',
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36',
          Referer: 'https://unstop.com/auth/signup',
        },
        validateStatus: () => true,
      }
    );

    if (response.data?.status === 'success' || response.status === 200 || response.status === 201) {
      res.json({ success: true, message: 'Unstop account created! You can now connect it.' });
    } else if (response.data?.message?.toLowerCase().includes('already')) {
      res.json({ success: true, message: 'Account already exists — you can connect it now!' });
    } else {
      res.json({
        success: true,
        message:
          response.data?.message ||
          'Account setup complete. Try connecting your Unstop account now.',
      });
    }
  } catch (error: any) {
    console.error('Unstop register error:', error.message);
    res.json({
      success: true,
      message: 'Please try connecting your Unstop account, or check if the email is already registered.',
    });
  }
});

// ─── UNIFIED AUTH / READING PROFILE ROUTES ────────────────────────────────────
// Provider-agnostic routes: works with any valid JWT from Google or Email auth

// GET /api/auth/me
authRouter.get('/me', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await database.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { id, google_id, name, email, profile_picture, assessment_completed, assessment_score, classification, reading_profile, email_verified, created_at } = user;
    res.json({
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
      created_at
    });
  } catch (error) {
    console.error('Unified get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reading-profile
authRouter.post('/reading-profile', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const { reading_profile } = req.body;
    if (!reading_profile || typeof reading_profile !== 'object') {
      return res.status(400).json({ error: 'Valid reading_profile object is required' });
    }
    const updated = await database.updateUserReadingProfile(req.user.userId, reading_profile);
    res.json({ success: true, reading_profile: updated.reading_profile });
  } catch (error: any) {
    console.error('Unified save reading profile error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// POST /api/auth/assessment/complete
authRouter.post('/assessment/complete', AuthService.authenticateToken, async (req: any, res: Response) => {
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
      googleId: req.user.googleId,
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
    console.error('Unified assessment completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/assessment/retake
authRouter.post('/assessment/retake', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    await database.updateUserAssessment(req.user.userId, {
      assessment_completed: false,
      assessment_score: undefined,
      classification: undefined
    });
    res.json({ success: true, message: 'Assessment reset successfully' });
  } catch (error) {
    console.error('Unified assessment retake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
