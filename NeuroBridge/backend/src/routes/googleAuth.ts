import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../auth';
import database from '../database';

export const googleAuthRouter = Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: "http://localhost:4000/api/auth/google/callback"
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
        // Create new user automatically
        user = await database.createUser({
          google_id: googleId,
          name,
          email,
          profile_picture: profilePicture || '',
          assessment_completed: false
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
}));

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

googleAuthRouter.get('/google/callback', 
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

      // Redirect to frontend with token and redirect URL
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5147'}?token=${token}&redirect=${redirectUrl}`);
      
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
    const { assessment_score, classification } = req.body;
    
    if (!assessment_score || !classification) {
      return res.status(400).json({ error: 'Assessment score and classification are required' });
    }

    await database.updateUserAssessment(req.user.userId, {
      assessment_completed: true,
      assessment_score,
      classification
    });

    res.json({ success: true, message: 'Assessment completed successfully' });
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
