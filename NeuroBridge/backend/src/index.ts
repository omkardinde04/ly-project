import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { jobsRouter } from './routes/jobs';
import { authRouter } from './routes/auth';
import { llmRouter } from './routes/llm';
import { linkedinRouter } from './routes/linkedin';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 4000;
const geminiKey = process.env.GEMINI_API_KEY;
const linkedinId = process.env.LINKEDIN_CLIENT_ID;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  NeuroBridge Backend Starting…');
console.log(`  Port        : ${PORT}`);
console.log(`  Gemini Key  : ${geminiKey ? '✅ Loaded (ends …' + geminiKey.slice(-6) + ')' : '❌ NOT FOUND'}`);
console.log(`  LinkedIn ID : ${linkedinId ? '✅ Loaded' : '❌ NOT FOUND'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/opportunities', jobsRouter);
app.use('/api/auth', authRouter);
app.use('/api/llm', llmRouter);
app.use('/api/linkedin', linkedinRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
