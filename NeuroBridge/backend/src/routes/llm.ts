import { Router, Request, Response } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { AIService } from '../services/aiProvider';

export const llmRouter = Router();
const aiService = new AIService();

// ─── Multer — store file in memory ────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB to allow audio/video
});

// ─── PDF / DOCX → text extractor ─────────────────────────────────────────────
async function extractText(file: Express.Multer.File): Promise<string> {
  const name = file.originalname.toLowerCase();

  if (name.endsWith('.pdf')) {
    try {
      // Lazy-load pdf-parse core module to avoid ESM require issues and pdf-parse/index.js debug test-file reads
      // @ts-ignore pdf-parse/lib/pdf-parse.js does not ship type declarations
      const pdfParseMod: any = await import('pdf-parse/lib/pdf-parse.js');
      const pdfParse = pdfParseMod.default || pdfParseMod;
      const data = await pdfParse(file.buffer);
      const text = data.text?.trim();
      if (!text) throw new Error('Could not read text from PDF. Try a text-based PDF.');
      return text;
    } catch (err: any) {
      console.error('[PDF Parse Error]:', err.message);
      throw new Error('PDF parsing failed: ' + err.message);
    }
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

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
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

// ─── Environment & Provider Configuration ─────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const configuredProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

/**
 * Returns true ONLY if local Ollama is explicitly requested in local development.
 * Never allows calling localhost:11434 in production or on Vercel.
 */
function isOllamaAllowed(): boolean {
  if (isProduction) return false;
  return configuredProvider === 'ollama';
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// ─── Pure JS Vector RAG Implementation (Optional Local Dev Only) ───────────

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
  if (!isOllamaAllowed()) {
    throw new Error('Local Ollama embeddings are disabled in this environment.');
  }
  let res;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err: any) {
    throw new Error(`Cannot connect to Ollama: ${err?.message || err}`);
  }
  if (!res.ok) throw new Error('Ollama embedding request failed.');
  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
}

/**
 * Unified AI Query Execution via AIService (Gemini primary -> Ollama Cloud fallback)
 */
async function askAI(prompt: string): Promise<string> {
  try {
    const result = await aiService.chat([{ role: 'user', content: prompt }]);
    return result.text;
  } catch (err: any) {
    console.warn('[LLM/askAI] AI Service call failed, using emergency fallback:', err?.message);
    return generateIntelligentResponse(prompt);
  }
}

async function askOllama(prompt: string): Promise<string> {
  return askAI(prompt);
}

/**
 * Document AI Analysis (Summarize, Explain, Simplify, Quiz, Script):
 * - In local dev with Ollama enabled: supports chunked RAG if requested.
 * - In production / cloud: sends full document directly to Gemini (1M token context window)
 *   with fallback to Pollinations and smart extractive synthesis. Never throws "Cannot connect to Ollama".
 */
async function callDocumentAI(text: string, prompt: string): Promise<string> {
  // If local Ollama is active and document is massive, chunk using Ollama
  if (isOllamaAllowed() && text.length >= 8000) {
    try {
      const chunks = chunkText(text, 2000, 400);
      const queryEmbedding = await getOllamaEmbedding(prompt);
      const chunkEmbeddings = await Promise.all(
        chunks.map(async (chunk) => ({
          text: chunk,
          embedding: await getOllamaEmbedding(chunk),
        }))
      );
      const scoredChunks = chunkEmbeddings.map((ce) => ({
        text: ce.text,
        score: cosineSimilarity(queryEmbedding, ce.embedding),
      }));
      scoredChunks.sort((a, b) => b.score - a.score);
      const context = scoredChunks.slice(0, 3).map((c) => c.text).join('\n\n');
      const finalPrompt = `Use the following context to complete the task.\n\nContext:\n${context}\n\nTask:\n${prompt}`;
      return await askAI(finalPrompt);
    } catch (ragErr) {
      console.warn('[LLM/callDocumentAI] Local Ollama RAG failed, falling back to direct cloud generation:', ragErr);
    }
  }

  // Cloud/Production: Gemini handles whole documents up to 60k chars effortlessly
  const safeText = text.slice(0, 60000);
  const finalPrompt = `Use the following context to complete the task.\n\nContext:\n${safeText}\n\nTask:\n${prompt}`;
  return await askAI(finalPrompt);
}

async function callOllamaRAG(text: string, prompt: string): Promise<string> {
  return callDocumentAI(text, prompt);
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

      // Safe truncate to avoid memory spikes
      const truncated = text.slice(0, 50000); 

      // Process document with Hosted / Cloud AI (or local Ollama if explicitly enabled)
      const result = await callDocumentAI(truncated, prompt);
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

// ─── Jarvis Conversational Agent Endpoint (ChatGPT-style multi-turn chat) ─────
llmRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages = [], context = {} } = req.body || {};
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    if (!lastUserMsg) {
      res.status(400).json({ error: 'No user message provided.' });
      return;
    }

    const chatMessages = aiService.prepareMessages(
      lastUserMsg,
      messages.slice(0, -1),
      context
    );

    const result = await aiService.chat(chatMessages);

    res.json({
      text: result.text,
      action: result.action,
      spokenResponse: result.spokenResponse,
      provider: result.provider,
      model: result.model,
      latencyMs: result.latencyMs,
      fallbackTriggered: result.fallbackTriggered,
      fallbackReason: result.fallbackReason,
      candidateAttempts: result.candidateAttempts,
    });
  } catch (error: any) {
    console.error('[LLM/chat] Fatal error:', error);
    const fallbackText = generateIntelligentResponse(
      [...(req.body?.messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '',
      req.body?.messages || [],
      req.body?.context || {}
    );
    res.json({
      text: fallbackText,
      action: null,
      spokenResponse: fallbackText.slice(0, 260),
      provider: 'offline-emergency',
      model: 'knowledge-engine',
      fallbackTriggered: true,
      fallbackReason: error?.message,
    });
  }
});

// ─── Real-Time Streaming Jarvis Conversational Agent (Server-Sent Events) ─────
llmRouter.post('/chat/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages = [], context = {} } = req.body || {};
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    if (!lastUserMsg) {
      res.status(400).json({ error: 'No user message provided.' });
      return;
    }

    // Initialize Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    let isClientDisconnected = false;
    const clientAbortController = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) {
        isClientDisconnected = true;
        clientAbortController.abort();
      }
    });

    const sendSSE = (data: any) => {
      if (!isClientDisconnected && !res.writableEnded) {
        try {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch {}
      }
    };

    const chatMessages = aiService.prepareMessages(
      lastUserMsg,
      messages.slice(0, -1),
      context
    );

    const result = await aiService.chatStream(
      chatMessages,
      {
        onChunk: (token: string) => {
          sendSSE({ text: token });
        },
        onReset: (reason?: string) => {
          // Primary provider failed after partial streaming - notify client to reset cleanly
          sendSSE({ reset: true, reason });
        },
      },
      {
        signal: clientAbortController.signal,
      }
    );

    // Signal stream completion
    sendSSE({
      done: true,
      action: result.action,
      fullText: result.text,
      spokenResponse: result.spokenResponse,
      provider: result.provider,
      model: result.model,
      fallbackTriggered: result.fallbackTriggered,
      candidateAttempts: result.candidateAttempts,
    });

    if (!res.writableEnded) {
      res.end();
    }
  } catch (error: any) {
    console.error('[LLM/chat/stream] Fatal stream error:', error);
    if (!res.writableEnded) {
      try {
        const emergencyText = generateIntelligentResponse(
          [...(req.body?.messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '',
          req.body?.messages || [],
          req.body?.context || {}
        );
        res.write(`data: ${JSON.stringify({ text: emergencyText })}\n\n`);
        res.write(`data: ${JSON.stringify({
          done: true,
          action: null,
          fullText: emergencyText,
          spokenResponse: emergencyText.slice(0, 260),
          provider: 'emergency-knowledge',
          model: 'offline',
          fallbackTriggered: true,
          fallbackReason: error?.message,
        })}\n\n`);
      } catch {}
      res.end();
    }
  }
});

// ─── Personalized Recommendations (LinkedIn / Dashboard Integration) ─────────
llmRouter.post('/recommend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitiveProfile = {}, dyslexiaLevel = 'mild', confirmedSkills = [], interests = [] } = req.body || {};

    const prompt = `You are an AI career and education advisor specialized in neurodiversity and dyslexia.
Given a learner's profile:
- Dyslexia Level: ${dyslexiaLevel}
- Confirmed Skills: ${confirmedSkills.join(', ') || 'General skills'}
- Interests: ${interests.join(', ') || 'Technology and Design'}
- Cognitive Profile: ${JSON.stringify(cognitiveProfile)}

Generate a personalized recommendations JSON object matching this schema:
{
  "careers": [
    { "title": "Career Name", "match": 92, "reason": "Why it suits their strengths", "icon": "🎨" }
  ],
  "learningPath": [
    { "step": 1, "title": "Skill to learn", "duration": "2 weeks", "type": "visual", "icon": "💡" }
  ],
  "internships": [
    { "title": "Role", "org": "Company/Org", "deadline": "Rolling", "tags": ["Remote", "Inclusive"] }
  ],
  "competitions": [
    { "title": "Hackathon/Contest", "prize": "$1,000", "tags": ["Beginner Friendly"] }
  ],
  "skillGaps": [
    { "skill": "Skill", "currentLevel": 40, "targetLevel": 80, "tip": "Dyslexia-friendly learning tip" }
  ]
}

Provide 3 careers, 4 learning steps, 3 internships, 2 competitions, and 3 skill gaps.
Return ONLY valid JSON. No markdown, no code blocks, no backticks.`;

    let resultJson = '';
    try {
      const raw = await askAI(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultJson = jsonMatch[0];
      }
    } catch {}

    let recommendations: any = null;
    if (resultJson) {
      try {
        recommendations = JSON.parse(resultJson);
      } catch {}
    }

    if (!recommendations || !recommendations.careers) {
      recommendations = generateDefaultRecommendations(confirmedSkills, interests, dyslexiaLevel);
    }

    res.json({ recommendations });
  } catch (err: any) {
    console.error('[LLM/recommend] Error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

function generateDefaultRecommendations(skills: string[], interests: string[], _dyslexiaLevel: string) {
  const isVisual = interests.some((i: string) => /design|art|creative|media/i.test(i));
  return {
    careers: [
      {
        title: isVisual ? 'UI/UX & Visual Designer' : 'Frontend Accessibility Engineer',
        match: 94,
        reason: 'Exceptional spatial reasoning, pattern recognition, and creative problem-solving abilities suited for neurodivergent minds.',
        icon: isVisual ? '🎨' : '💻',
      },
      {
        title: 'Creative Technologist',
        match: 88,
        reason: 'Blends big-picture systemic thinking with technical implementation, bypassing linear text bottlenecks.',
        icon: '🚀',
      },
      {
        title: 'Product Strategy & Innovation Specialist',
        match: 85,
        reason: 'Leverages holistic thinking to identify workflow bottlenecks and intuitive user experiences.',
        icon: '📊',
      },
    ],
    learningPath: [
      { step: 1, title: 'Master Visual Information Mapping', duration: '2 weeks', type: 'visual', icon: '🗺️' },
      { step: 2, title: 'Interactive Accessibility Prototyping', duration: '3 weeks', type: 'practical', icon: '🛠️' },
      { step: 3, title: 'Audio-Assisted Code & Architecture Review', duration: '2 weeks', type: 'audio', icon: '🎧' },
      { step: 4, title: 'Portfolio Project Showcase', duration: '4 weeks', type: 'practical', icon: '🏆' },
    ],
    internships: [
      { title: 'Neuroinclusive Product Intern', org: 'NeuroBridge Labs', deadline: 'Rolling Admissions', tags: ['Remote', 'Inclusive Mentorship'] },
      { title: 'Accessibility Experience Associate', org: 'Global Tech Foundation', deadline: '30 Days Left', tags: ['Hybrid', 'Flexible Hours'] },
      { title: 'Junior Frontend Developer', org: 'OpenSource Innovators', deadline: 'Open Now', tags: ['Mentorship', 'Project-based'] },
    ],
    competitions: [
      { title: 'Global Accessibility Design Challenge', prize: '$5,000 & Mentorship', tags: ['Dyslexia Friendly', 'Team or Solo'] },
      { title: 'Inclusive Tech Innovation Sprint', prize: 'Top 10 Finalist Incubation', tags: ['Beginner Friendly', 'Virtual'] },
    ],
    skillGaps: [
      { skill: 'Multimodal Documentation', currentLevel: 45, targetLevel: 85, tip: 'Use mind maps and voice recordings instead of dense linear text blocks.' },
      { skill: 'Design System Typography', currentLevel: 55, targetLevel: 90, tip: 'Practice applying dyslexia-optimized font weights and fluid letter-spacing.' },
      { skill: 'Assistive Tech Testing', currentLevel: 50, targetLevel: 80, tip: 'Test web interfaces using screen readers and high-contrast accessibility tools.' },
    ],
  };
}

/**
 * Offline Emergency Fallback
 * Only triggered if all external cloud AI providers (Gemini, Ollama, and Pollinations)
 * are completely unreachable due to zero network connectivity.
 */
function generateIntelligentResponse(
  query: string,
  _messages: any[] = [],
  _context: any = {}
): string {
  const cleanQ = query.trim() || 'your question';
  return `I am currently unable to reach the cloud AI services to answer: "${cleanQ}".\n\nPlease check your internet connection and try again. In the meantime, you can ask me to navigate the site, read pages aloud, or toggle dyslexia accessibility tools.`;
}