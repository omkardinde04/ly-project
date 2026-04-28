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
import { mlRouter } from './routes/ml';

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

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
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
app.use('/api/ml', mlRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurobridge';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB at ${mongoUri}`);
    
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();
