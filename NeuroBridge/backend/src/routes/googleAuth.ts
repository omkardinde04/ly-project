import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import axios from 'axios';
import { AuthService } from '../auth';
import database from '../database';
import AssessmentResult from '../models/AssessmentResult';
import AdaptiveParams from '../models/AdaptiveParams';

export const googleAuthRouter = Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// ── Helper: Initialize ML adaptive parameters after assessment ──────────────
async function initializeMLAdaptiveParams(userId: string, cognitiveProfile: any) {
  try {
    // Check if ML service is available
    const healthResponse = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
    if (healthResponse.data?.status !== 'ok') {
      console.warn('⚠️  ML service not healthy, skipping initialization');
      return null;
    }

    // Call ML service to get initial parameters
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/init-params`,
      { cognitiveProfile },
      { timeout: 5000 }
    );

    if (!mlResponse.data?.params) {
      console.warn('⚠️  Invalid response from ML service');
      return null;
    }

    // Store adaptive params in database
    const adaptiveParams = await AdaptiveParams.findOneAndUpdate(
      { userId },
      {
        userId,
        phase: 'phase1',
        params: mlResponse.data.params,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ ML adaptive parameters initialized for user:', userId);
    return adaptiveParams.params;
  } catch (error: any) {
    console.warn('⚠️  ML initialization failed (non-critical):', error.message);
    return null;
  }
}

// Configure Google OAuth Strategy
const googleClientID = process.env.GOOGLE_CLIENT_ID ?? '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
const googleCallbackURL = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:4000/api/auth/google/callback';

if (!googleClientID || !googleClientSecret) {
  console.warn('⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env. Google Login will not work.');
} else {
  passport.use(new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackURL
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Extract user information from Google profile
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const profilePicture = profile.photos?.[0]?.value;

      if (!email) {
        return done(new Error('Email is required from Google profile'), undefined);
      }

      // Check if user exists in database
      let user = await database.findUserByGoogleId(googleId);
      
      if (!user) {
        // Check if user exists with same email (maybe registered with different method)
        const existingUser = await database.findUserByEmail(email);
        
        if (existingUser && existingUser.id) {
          // User exists with email but not Google ID - link Google ID to existing account
          user = await database.updateUserWithGoogle(existingUser.id, googleId, profilePicture || '');
        } else {
          // Create new user automatically (email is verified via Google)
          user = await database.createUser({
            google_id: googleId,
            name,
            email,
            profile_picture: profilePicture || '',
            assessment_completed: false,
            email_verified: true
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await database.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
googleAuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

googleAuthRouter.get('/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5147'}?error=Authentication failed` }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      // Generate JWT token
      const token = AuthService.generateToken(user);

      // Determine redirect based on assessment completion
      const redirectUrl = user.assessment_completed ? '/dashboard' : '/assessment';

      // Redirect to frontend auth handler with token and redirect URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5147';
      res.redirect(`${frontendUrl}/auth-redirect?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(redirectUrl)}`);
      
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get current user info (protected route)
googleAuthRouter.get('/me', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await database.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info without sensitive data
    const { id, google_id, name, email, profile_picture, assessment_completed, assessment_score, classification, created_at } = user;
    res.json({
      id,
      google_id,
      name,
      email,
      profile_picture,
      assessment_completed,
      assessment_score,
      classification,
      created_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assessment completion
googleAuthRouter.post('/assessment/complete', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const { assessment_score, classification, assessment_metrics } = req.body;
    
    if (!assessment_score || !classification) {
      return res.status(400).json({ error: 'Assessment score and classification are required' });
    }

    await database.updateUserAssessment(req.user.userId, {
      assessment_completed: true,
      assessment_score,
      classification,
      assessment_metrics
    });

    // Save detailed results to MongoDB
    let parsedMetrics: any = {};
    try {
      if (assessment_metrics) {
        parsedMetrics = JSON.parse(assessment_metrics);
      }
    } catch (e) {
      console.error('Error parsing metrics:', e);
    }

    const newResult = new AssessmentResult({
      userId: req.user.userId,
      googleId: req.user.googleId,
      score: assessment_score,
      classification: classification,
      metrics: parsedMetrics
    });
    
    await newResult.save();

    // ── Call ML service to initialize adaptive parameters (Phase 1) ──────────
    let adaptiveParams = null;
    try {
      // Extract cognitive profile from metrics
      const cognitiveProfile = {
        phonological: parsedMetrics.phonological || 50,
        visual: parsedMetrics.visual || 50,
        workingMemory: parsedMetrics.memory || parsedMetrics.workingMemory || 50,
        processingSpeed: parsedMetrics.processing_speed || parsedMetrics.processingSpeed || 50,
        orthographic: parsedMetrics.orthographic || 50,
        executive: parsedMetrics.executive || 50
      };

      adaptiveParams = await initializeMLAdaptiveParams(req.user.userId, cognitiveProfile);
    } catch (mlError) {
      console.warn('⚠️  ML initialization error (non-critical):', mlError);
      // Continue without ML params - system still works
    }

    res.json({ 
      success: true, 
      message: 'Assessment completed successfully',
      adaptiveParams: adaptiveParams || null
    });
  } catch (error) {
    console.error('Assessment completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retake assessment
googleAuthRouter.post('/assessment/retake', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    await database.updateUserAssessment(req.user.userId, {
      assessment_completed: false,
      assessment_score: undefined,
      classification: undefined
    });

    res.json({ success: true, message: 'Assessment reset successfully' });
  } catch (error) {
    console.error('Assessment retake error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
googleAuthRouter.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// ── Initialize ML adaptive parameters for existing users (retroactive) ──────
// This endpoint is for users who completed assessment before ML integration
googleAuthRouter.post('/ml/init-adaptive-params', AuthService.authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    // Check if user already has adaptive params
    const existingParams = await AdaptiveParams.findOne({ userId });
    if (existingParams) {
      return res.json({
        success: true,
        message: 'Adaptive parameters already initialized',
        params: existingParams.params
      });
    }

    // Get user's assessment metrics
    const user = await database.getUserById(userId);
    if (!user || !user.assessment_completed) {
      return res.status(400).json({ error: 'User has not completed assessment' });
    }

    // Parse stored metrics
    let parsedMetrics: any = {};
    try {
      if (user.assessment_metrics) {
        parsedMetrics = JSON.parse(user.assessment_metrics);
      }
    } catch (e) {
      console.error('Error parsing metrics:', e);
    }

    // Extract cognitive profile
    const cognitiveProfile = {
      phonological: parsedMetrics.phonological || 50,
      visual: parsedMetrics.visual || 50,
      workingMemory: parsedMetrics.memory || parsedMetrics.workingMemory || 50,
      processingSpeed: parsedMetrics.processing_speed || parsedMetrics.processingSpeed || 50,
      orthographic: parsedMetrics.orthographic || 50,
      executive: parsedMetrics.executive || 50
    };

    // Initialize ML adaptive parameters
    const adaptiveParams = await initializeMLAdaptiveParams(userId, cognitiveProfile);

    if (adaptiveParams) {
      res.json({
        success: true,
        message: 'Adaptive parameters initialized successfully',
        params: adaptiveParams
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'ML service unavailable, but will retry on next session'
      });
    }
  } catch (error) {
    console.error('ML init adaptive params error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
