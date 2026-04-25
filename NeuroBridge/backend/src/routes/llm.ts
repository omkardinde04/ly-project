import { Router, Request, Response } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
const pdfParse = require('pdf-parse');

export const llmRouter = Router();

// ─── Multer — store file in memory ────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB to allow audio/video
});

// ─── PDF / DOCX → text extractor ─────────────────────────────────────────────
async function extractText(file: Express.Multer.File): Promise<string> {
  const name = file.originalname.toLowerCase();

  if (name.endsWith('.pdf')) {
    const data = await pdfParse(file.buffer);
    const text = data.text?.trim();
    if (!text) throw new Error('Could not read text from PDF. Try a text-based PDF.');
    return text;
  }

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    const text = result.value?.trim();
    if (!text) throw new Error('Could not read text from DOCX file.');
    return text;
  }

  if (name.endsWith('.txt')) {
    return file.buffer.toString('utf-8').trim();
  }

  throw new Error('Unsupported file type for text extraction. Please upload PDF, DOCX, or TXT.');
}

// ─── Media File Handling with Google Gemini 1.5 Pro ─────────────────────────
async function processMediaWithGemini(file: Express.Multer.File, prompt: string, apiKey: string): Promise<string> {
  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Write buffer to temp file
  const ext = path.extname(file.originalname) || '.tmp';
  const tempPath = path.join(os.tmpdir(), `gemini_${Date.now()}${ext}`);
  fs.writeFileSync(tempPath, file.buffer);

  let uploadedFile: any = null;
  try {
    uploadedFile = await fileManager.uploadFile(tempPath, {
      mimeType: file.mimetype,
      displayName: file.originalname,
    });

    // Wait for file to be ready
    let fileInfo = await fileManager.getFile(uploadedFile.file.name);
    while (fileInfo.state === "PROCESSING") {
      await new Promise(resolve => setTimeout(resolve, 3000));
      fileInfo = await fileManager.getFile(uploadedFile.file.name);
    }
    if (fileInfo.state === "FAILED") {
      throw new Error("Audio/Video file processing failed.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadedFile.file.mimeType,
          fileUri: uploadedFile.file.uri
        }
      },
      { text: prompt },
    ]);
    return result.response.text();
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    if (uploadedFile) {
      try {
        await fileManager.deleteFile(uploadedFile.file.name);
      } catch (e) {
        console.error("Failed to delete remote file", e);
      }
    }
  }
}

// ─── Pure JS Vector RAG Implementation (No Langchain ESM crashes) ───────────

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function chunkText(text: string, size = 1000, overlap = 200): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.substring(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

async function getOllamaEmbedding(text: string): Promise<number[]> {
  let res;
  try {
    res = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', prompt: text })
    });
  } catch (err) {
    throw new Error("Cannot connect to Ollama. Is the Ollama app running on your Mac? (Run 'ollama run llama3' in a new terminal)");
  }
  if (!res.ok) throw new Error("Ollama embedding failed. Did you pull the llama3 model?");
  const data = await res.json() as { embedding: number[] };
  return data.embedding;
}

async function askOllama(prompt: string): Promise<string> {
  let res;
  try {
    res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3', prompt, stream: false })
    });
  } catch (err) {
    throw new Error("Cannot connect to Ollama. Is the Ollama app running on your Mac? (Run 'ollama run llama3' in a new terminal)");
  }
  if (!res.ok) throw new Error("Ollama generation failed. Did you pull the llama3 model?");
  const data = await res.json() as { response: string };
  return data.response;
}

async function callOllamaRAG(text: string, prompt: string): Promise<string> {
  // FAST PATH: If the text is short enough to fit in the context window (~8000 chars),
  // skip the extremely slow embedding/RAG process and just send it directly!
  if (text.length < 8000) {
    const finalPrompt = `Use the following context to complete the task.\n\nContext:\n${text}\n\nTask:\n${prompt}`;
    return await askOllama(finalPrompt);
  }

  // 1. Chunking for large documents only
  const chunks = chunkText(text, 2000, 400); // Larger chunks = fewer embedding API calls = faster
  if (chunks.length === 0) {
    return await askOllama(prompt);
  }

  // 2. Compute embeddings dynamically
  const queryEmbedding = await getOllamaEmbedding(prompt);
  const chunkEmbeddings = await Promise.all(chunks.map(async chunk => {
    return {
      text: chunk,
      embedding: await getOllamaEmbedding(chunk)
    };
  }));
  
  // 3. FAISS-style Similarity Search
  const scoredChunks = chunkEmbeddings.map(ce => ({
    text: ce.text,
    score: cosineSimilarity(queryEmbedding, ce.embedding)
  }));
  
  // Sort descending
  scoredChunks.sort((a, b) => b.score - a.score);
  
  // 4. Retrieve top 3
  const topChunks = scoredChunks.slice(0, 3).map(c => c.text);
  const context = topChunks.join('\n\n');
  
  // 5. Query Ollama
  const finalPrompt = `Use the following context to complete the task.\n\nContext:\n${context}\n\nTask:\n${prompt}`;
  return await askOllama(finalPrompt);
}

// ─── Dyslexia-friendly system prompt ─────────────────────────────────────────
const DYSLEXIA_NOTE = `
You are an AI assistant in NeuroBridge, a dyslexia-friendly learning platform.
Keep your responses:
- Short, clear sentences (max 15 words per sentence)
- Simple vocabulary (Grade 6 level)
- Use bullet points and numbered lists where helpful
- Avoid jargon
- Be warm and encouraging
`;

// ─── Shared handler factory ───────────────────────────────────────────────────
function makeLLMHandler(
  actionPrompt: string,
  action: string,
  isJson: boolean = false
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      let prompt = `${DYSLEXIA_NOTE}\n\nTask: ${actionPrompt}`;
      if (isJson) {
        prompt += "\n\nCRITICAL INSTRUCTION: You MUST return ONLY valid JSON. No markdown formatting, no code blocks, no backticks. Just the raw JSON array.";
      }

      // Check if it's an audio/video file
      const isMedia = req.file && (req.file.mimetype.startsWith('audio/') || req.file.mimetype.startsWith('video/'));

      if (isMedia) {
        const apiKey = process.env.GEMINI_API_KEY ?? '';
        if (!apiKey) {
          res.status(500).json({ error: 'Gemini API key not configured for media summarization.' });
          return;
        }
        // Use Gemini for Audio/Video summarization
        const result = await processMediaWithGemini(req.file!, prompt, apiKey);
        res.json({ result, action });
        return;
      }

      // Otherwise it's text (either from file or body)
      let text = '';
      if (req.file) {
        text = await extractText(req.file);
      } else {
        const body = req.body as { text?: string };
        text = body.text?.trim() ?? '';
      }

      if (!text) {
        res.status(400).json({ error: 'No text or file provided.' });
        return;
      }

      // Truncate text just in case it's absurdly large for local Ollama
      const truncated = text.slice(0, 50000); 

      // Use Pure JS RAG + Ollama
      const result = await callOllamaRAG(truncated, prompt);
      res.json({ result, action });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error(`[LLM/${action}]`, msg);
      res.status(500).json({ error: msg });
    }
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────
llmRouter.post(
  '/summarize',
  upload.single('file'),
  makeLLMHandler(
    'Summarise the provided context in 3-5 short bullet points.',
    'summarize'
  )
);

llmRouter.post(
  '/explain',
  upload.single('file'),
  makeLLMHandler(
    'Explain the provided context clearly. Use an analogy or example to make it easy to understand.',
    'explain'
  )
);

llmRouter.post(
  '/simplify',
  upload.single('file'),
  makeLLMHandler(
    'Rewrite the provided context in the simplest possible English. Use very short sentences. Imagine you are explaining to a 10-year-old.',
    'simplify'
  )
);

llmRouter.post(
  '/quiz',
  upload.single('file'),
  makeLLMHandler(
    'Create exactly 3 simple multiple-choice quiz questions from this context. Format as:\n\nQ1: [question]\nA) [option]\nB) [option]\nC) [option]\nAnswer: [letter]\n\nKeep questions simple and friendly.',
    'quiz'
  )
);


// ─── POST /api/llm/recommend ──────────────────────────────────────────────────
// ML Recommendation engine: merges dyslexia assessment + LinkedIn profile →
// Gemini generates personalized careers, learning path, internships, skill gaps.
// ──────────────────────────────────────────────────────────────────────────────

interface CognitiveProfile {
  phonological: number;
  visual: number;
  workingMemory: number;
  processingSpeed: number;
  orthographic: number;
  executive: number;
}

interface LinkedInProfileInput {
  name?: string;
  email?: string;
}

interface RecommendInput {
  cognitiveProfile: CognitiveProfile;
  dyslexiaLevel: 'none' | 'mild' | 'moderate' | 'severe';
  linkedinProfile?: LinkedInProfileInput;
  confirmedSkills: string[];
  interests: string[];
}

llmRouter.post('/recommend', async (req: Request, res: Response): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY ?? '';
  if (!apiKey) {
    res.status(500).json({ error: 'Gemini API key not configured' });
    return;
  }

  const body = req.body as RecommendInput;
  const { cognitiveProfile, dyslexiaLevel, linkedinProfile, confirmedSkills, interests } = body;

  if (!cognitiveProfile) {
    res.status(400).json({ error: 'cognitiveProfile is required' });
    return;
  }

  // Find the top cognitive strengths (above 70)
  const strengthLabels: Record<string, string> = {
    phonological:     'Phonological Awareness (sound/language processing)',
    visual:           'Visual Attention (pattern recognition, attention to detail)',
    workingMemory:    'Working Memory (holding and processing info)',
    processingSpeed:  'Processing Speed (quick thinking)',
    orthographic:     'Word Recognition (reading, writing)',
    executive:        'Executive Function (planning, time management)',
  };

  const strengths = Object.entries(cognitiveProfile)
    .filter(([, v]) => v >= 60)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => strengthLabels[k] ?? k)
    .join(', ');

  const skillsStr   = confirmedSkills.length > 0 ? confirmedSkills.join(', ') : 'not specified';
  const interestStr = interests.length > 0 ? interests.join(', ') : 'general learning';
  const nameStr     = linkedinProfile?.name ?? 'the user';

  const prompt = `
You are a career counsellor specialising in neurodiverse learners (dyslexia, learning differences).
You must return ONLY valid JSON — no markdown, no prose, no code fences.

User profile for ${nameStr}:
- Dyslexia level: ${dyslexiaLevel}
- Top cognitive strengths: ${strengths || 'balanced across all areas'}
- Confirmed skills: ${skillsStr}
- Interests: ${interestStr}
- LinkedIn connected: ${linkedinProfile ? 'yes' : 'no'}

Generate personalised recommendations. Return this exact JSON shape:
{
  "careers": [
    { "title": string, "match": number (0-100), "reason": string (max 20 words), "icon": single emoji }
  ],
  "learningPath": [
    { "step": number, "title": string, "duration": string, "type": "visual"|"audio"|"practical"|"reading", "icon": single emoji }
  ],
  "internships": [
    { "title": string, "org": string, "deadline": string, "tags": string[] }
  ],
  "competitions": [
    { "title": string, "prize": string, "tags": string[] }
  ],
  "skillGaps": [
    { "skill": string, "currentLevel": number (0-100), "targetLevel": number (0-100), "tip": string (max 15 words) }
  ]
}

Rules:
- careers: exactly 3 items, matched to cognitive strengths and skills
- learningPath: exactly 4 steps, ordered beginner → advanced, favour visual/practical types for dyslexia
- internships: exactly 3 items relevant to skills and interests
- competitions: exactly 2 items
- skillGaps: exactly 3 items — skills they should build next
- All text must be simple, encouraging, Grade-6 reading level
- DO NOT add any text outside the JSON
`;

  try {
    const raw = await callGemini(prompt, apiKey);

    // Strip possible markdown code fences if Gemini wraps output
    const clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

    let recommendations;
    try {
      recommendations = JSON.parse(clean);
    } catch {
      // Return a safe structured fallback if JSON parse fails
      recommendations = {
        careers: [
          { title: 'UX / Accessibility Designer', match: 88, reason: 'Your visual strengths suit UI design.', icon: '🎨' },
          { title: 'Content Creator', match: 80, reason: 'Creative thinking + inclusive storytelling.', icon: '✍️' },
          { title: 'Peer Learning Mentor', match: 75, reason: 'Empathy and lived experience are superpowers.', icon: '🌟' },
        ],
        learningPath: [
          { step: 1, title: 'Intro to Design Thinking', duration: '1 week', type: 'visual', icon: '💡' },
          { step: 2, title: 'Figma for Beginners', duration: '2 weeks', type: 'practical', icon: '🖥️' },
          { step: 3, title: 'Accessibility & Inclusive Design', duration: '2 weeks', type: 'visual', icon: '♿' },
          { step: 4, title: 'Portfolio Project', duration: '3 weeks', type: 'practical', icon: '📁' },
        ],
        internships: [
          { title: 'UX Design Intern', org: 'Inclusive Labs', deadline: 'May 2025', tags: ['remote', 'design'] },
          { title: 'Accessibility Researcher', org: 'Google.org', deadline: 'June 2025', tags: ['research', 'tech'] },
          { title: 'Content & Creative Intern', org: 'NGO Design Hub', deadline: 'Ongoing', tags: ['creative', 'impact'] },
        ],
        competitions: [
          { title: 'Unstop Design Challenge', prize: '₹25,000', tags: ['design', 'open to all'] },
          { title: 'NASA Space Apps (Accessibility Track)', prize: 'Global Prize', tags: ['tech', 'accessibility'] },
        ],
        skillGaps: [
          { skill: 'Prototyping', currentLevel: 30, targetLevel: 75, tip: 'Practice with free Figma templates daily.' },
          { skill: 'Public Speaking', currentLevel: 40, targetLevel: 70, tip: 'Join a Toastmasters online club.' },
          { skill: 'Data Literacy', currentLevel: 25, targetLevel: 60, tip: 'Try Google Data Studio free course.' },
        ],
      };
    }

    res.json({ recommendations });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[LLM/recommend]', msg);
    res.status(500).json({ error: msg });
  }
});

llmRouter.post(
  '/video-script',
  upload.single('file'),
  makeLLMHandler(
    `Read the context and create a dynamic, engaging video script explaining the core concepts. 
Return EXACTLY a JSON array of 4-6 objects. 
Each object must have:
- "text": a short, simple spoken sentence (max 15 words) explaining a point.
- "keyword": a single specific noun/word (no spaces) to use for fetching a background image (e.g. "brain", "plant", "ocean", "technology").

Example:
[{"text": "Photosynthesis is how plants make food.", "keyword": "leaf"}]

Return ONLY the raw JSON array, nothing else.`,
    'video-script',
    true
  )
);
