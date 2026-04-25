import { Router, Request, Response } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
const pdfParse = require('pdf-parse');

export const llmRouter = Router();

// ─── Multer — store file in memory ────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Gemini helper ────────────────────────────────────────────────────────────
// The free tier has model-specific quotas (e.g. 20/day for 2.5-flash).
// We use a fallback array to automatically switch models if one runs out.
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest'
];

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  let lastError = new Error('Unknown error');

  for (const model of GEMINI_MODELS) {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const retries = 3;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`Gemini API error ${response.status} on ${model}: ${errText}`);
        
        // 503 is High Demand — wait and retry the current model.
        if (response.status === 503 && attempt < retries) {
          const waitTime = attempt * 1500;
          console.warn(`[Gemini API] 503 High Demand on ${model}. Retrying ${attempt + 1}/${retries} in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // 429 is Resource Exhausted (Quota reached) — break out of retry loop to skip to the next model immediately.
        if (response.status === 429) {
          console.warn(`[Gemini API] 429 Quota Exceeded on ${model}. Falling back to next model...`);
          break; // move to outer loop (next model)
        }

        throw lastError; // For other errors (e.g. 400 Bad Request), fail immediately
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
      );
    }
  }
  
  throw lastError;
}

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

  throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
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
  buildPrompt: (text: string) => string,
  action: string
) {
  return async (req: Request, res: Response): Promise<void> => {
    const apiKey = process.env.GEMINI_API_KEY ?? '';
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    try {
      let text = '';

      // Case 1: file upload (multipart/form-data)
      if (req.file) {
        text = await extractText(req.file);
      }

      // Case 2: plain text in JSON body
      if (!text) {
        const body = req.body as { text?: string };
        text = body.text?.trim() ?? '';
      }

      if (!text) {
        res.status(400).json({ error: 'No text or file provided.' });
        return;
      }

      // Truncate to ~12 000 chars (≈ 3000 tokens) so we don't hit limits
      const truncated = text.slice(0, 12000);

      const prompt = buildPrompt(truncated);
      const result = await callGemini(prompt, apiKey);
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
    text =>
      `${DYSLEXIA_NOTE}\n\nSummarise the following text in 3-5 short bullet points:\n\n${text}`,
    'summarize'
  )
);

llmRouter.post(
  '/explain',
  upload.single('file'),
  makeLLMHandler(
    text =>
      `${DYSLEXIA_NOTE}\n\nExplain the following text clearly. Use an analogy or example to make it easy to understand:\n\n${text}`,
    'explain'
  )
);

llmRouter.post(
  '/simplify',
  upload.single('file'),
  makeLLMHandler(
    text =>
      `${DYSLEXIA_NOTE}\n\nRewrite the following text in the simplest possible English. Use very short sentences. Imagine you are explaining to a 10-year-old:\n\n${text}`,
    'simplify'
  )
);

llmRouter.post(
  '/quiz',
  upload.single('file'),
  makeLLMHandler(
    text =>
      `${DYSLEXIA_NOTE}\n\nCreate exactly 3 simple multiple-choice quiz questions from this text. Format as:\n\nQ1: [question]\nA) [option]\nB) [option]\nC) [option]\nAnswer: [letter]\n\nQ2: ...\nQ3: ...\n\nKeep questions simple and friendly.\n\nText:\n${text}`,
    'quiz'
  )
);
