import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

if (!process.env.VERCEL && typeof __dirname !== 'undefined') {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

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
  // In Vercel, if MONGO_URI is not provided, do not block or try localhost
  if (process.env.VERCEL && !process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI is not set in Vercel environment variables.');
    return;
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurobridge';
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      bufferCommands: false   // fail fast instead of buffering ops when disconnected
    });
    isDbConnected = true;
    console.log(`✅ Connected to MongoDB at ${mongoUri.replace(/\/\/[^@]*@/, "//***@")}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// Ensure database is connected for every request without crashing
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
  } catch (err: any) {
    console.error('Database connection middleware error:', err.message);
  }
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
  res.json({ status: 'ok', service: 'NeuroBridge backend', health: '/api/health' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NeuroBridge backend',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState,
    googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  });
});

// Global Error Handler to catch any unhandled route or middleware error
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('💥 Unhandled backend error:', err);
  res.status(500).json({
    error: err?.message || 'Internal Server Error'
  });
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

// Export Express app as default for Vercel (@vercel/backends)
export default app;
export { app };
