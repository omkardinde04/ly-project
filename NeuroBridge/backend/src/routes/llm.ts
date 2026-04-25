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