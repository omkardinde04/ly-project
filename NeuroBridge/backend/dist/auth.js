"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
class AuthService {
    // Generate JWT token
    static generateToken(user) {
        const payload = {
            userId: user.id,
            googleId: user.google_id,
            email: user.email,
            assessmentCompleted: user.assessment_completed
        };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    }
    // Verify JWT token
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }
    // Middleware to authenticate requests
    static authenticateToken(req, res, next) {
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
exports.AuthService = AuthService;
