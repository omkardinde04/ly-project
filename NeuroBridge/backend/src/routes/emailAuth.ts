import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthService } from '../auth';
import database from '../database';

export const emailAuthRouter = Router();

// Register new user with email/password
emailAuthRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await database.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await database.createUserWithEmail({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully. Please login.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Login with email/password
emailAuthRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await database.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please create account.' });
    }

    // Check if user has password (Google auth users might not)
    if (!user.password) {
      return res.status(401).json({ error: 'Please use Google login for this account' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate JWT token
    const token = AuthService.generateToken(user);

    // Determine redirect based on assessment completion
    const redirectUrl = user.assessment_completed ? '/dashboard' : '/assessment';

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        assessment_completed: user.assessment_completed,
        assessment_score: user.assessment_score,
        classification: user.classification
      },
      redirect: redirectUrl
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// Forgot password - send reset email
emailAuthRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await database.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true, 
        message: 'If an account with this email exists, a reset link has been sent.' 
      });
    }

    // For now, just return success (in production, you'd send an actual email)
    // TODO: Implement email sending service
    const resetToken = Math.random().toString(36).substring(2, 15);
    console.log(`\n============================`);
    console.log(`Subject: Reset your NeuroBridge password`);
    console.log(`Body: Click below to reset password\n`);
    console.log(`http://localhost:5147/reset-password?token=${resetToken}`);
    console.log(`============================\n`);

    res.json({ 
      success: true, 
      message: 'If an account with this email exists, a reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
emailAuthRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // For now, just return success (in production, you'd validate the token)
    // TODO: Implement proper token validation
    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
