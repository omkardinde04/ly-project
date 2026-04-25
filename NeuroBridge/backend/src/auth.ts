import jwt from 'jsonwebtoken';
import { User } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: number;
  googleId?: string;
  email: string;
  assessmentCompleted: boolean;
}

export class AuthService {
  // Generate JWT token
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id!,
      googleId: user.google_id,
      email: user.email,
      assessmentCompleted: user.assessment_completed
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Middleware to authenticate requests
  static authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = AuthService.verifyToken(token);
    if (!payload) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    next();
  }
}
