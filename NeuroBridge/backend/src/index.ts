import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { jobsRouter } from './routes/jobs';
import { authRouter } from './routes/auth';
import { llmRouter } from './routes/llm';
import { linkedinRouter } from './routes/linkedin';
import { brainRouter } from './routes/brain';
import { googleAuthRouter } from './routes/googleAuth';
import { emailAuthRouter } from './routes/emailAuth';
import { progressRouter } from './routes/progress';
import { resumeRouter } from './routes/resume';
import { communityRouter } from './routes/community';
import { courseRouter } from './routes/courses';
import { courseCreatorRouter } from './routes/courseCreator';
import { adminRouter } from './routes/admin';
import { statsRouter } from './routes/stats';
import { adaptivePracticeRouter } from './routes/adaptivePractice';

const PORT = process.env.PORT || 4000;
const geminiKey = process.env.GEMINI_API_KEY;
const linkedinId = process.env.LINKEDIN_CLIENT_ID;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  NeuroBridge Backend Starting…');
console.log(`  Port        : ${PORT}`);
console.log(`  Gemini Key  : ${geminiKey ? '✅ Loaded (ends …' + geminiKey.slice(-6) + ')' : '❌ NOT FOUND'}`);
console.log(`  LinkedIn ID : ${linkedinId ? '✅ Loaded' : '❌ NOT FOUND'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

import mongoose from 'mongoose';

const app = express();

// Trust proxy for Vercel / reverse proxy deployments
app.set('trust proxy', 1);

// Database connection helper for serverless & local
let isDbConnected = false;
export const connectToDatabase = async () => {
  if (isDbConnected || mongoose.connection.readyState >= 1) {
    isDbConnected = true;
    return;
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurobridge';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    isDbConnected = true;
    console.log(`✅ Connected to MongoDB at ${mongoUri}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// Ensure database is connected for every request
app.use(async (_req, _res, next) => {
  await connectToDatabase();
  next();
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' && !process.env.DEV_MODE,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/opportunities', jobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/auth/google', googleAuthRouter);
app.use('/api/auth/email', emailAuthRouter);
app.use('/api/llm', llmRouter);
app.use('/api/linkedin', linkedinRouter);
app.use('/api/brain', brainRouter);
app.use('/api/progress', progressRouter);
app.use('/api/game-zone', progressRouter);
app.use('/api/progress/adaptive', adaptivePracticeRouter);
app.use('/api/game-zone/adaptive', adaptivePracticeRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/community', communityRouter);
app.use('/api/courses', courseRouter);
app.use('/api/creator', courseCreatorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'NeuroBridge backend', health: '/health' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start standalone server locally; on Vercel the app is invoked serverless
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

// Export app for both ES modules and CommonJS Vercel serverless handlers
module.exports = app;
module.exports.default = app;
module.exports.app = app;
export default app;
export { app };
