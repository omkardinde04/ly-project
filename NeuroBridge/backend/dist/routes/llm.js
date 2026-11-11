"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const mammoth_1 = __importDefault(require("mammoth"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
exports.llmRouter = (0, express_1.Router)();
// ─── Multer — store file in memory ────────────────────────────────────────────
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB to allow audio/video
});
// ─── PDF / DOCX → text extractor ─────────────────────────────────────────────
async function extractText(file) {
    const name = file.originalname.toLowerCase();
    if (name.endsWith('.pdf')) {
        try {
            // Lazy-load pdf-parse core module to avoid ESM require issues and pdf-parse/index.js debug test-file reads
            // @ts-ignore pdf-parse/lib/pdf-parse.js does not ship type declarations
            const pdfParseMod = await import('pdf-parse/lib/pdf-parse.js');
            const pdfParse = pdfParseMod.default || pdfParseMod;
            const data = await pdfParse(file.buffer);
            const text = data.text?.trim();
            if (!text)
                throw new Error('Could not read text from PDF. Try a text-based PDF.');
            return text;
        }
        catch (err) {
            console.error('[PDF Parse Error]:', err.message);
            throw new Error('PDF parsing failed: ' + err.message);
        }
    }
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
        const result = await mammoth_1.default.extractRawText({ buffer: file.buffer });
        const text = result.value?.trim();
        if (!text)
            throw new Error('Could not read text from DOCX file.');
        return text;
    }
    if (name.endsWith('.txt')) {
        return file.buffer.toString('utf-8').trim();
    }
    throw new Error('Unsupported file type for text extraction. Please upload PDF, DOCX, or TXT.');
}
// ─── Media File Handling with Google Gemini 1.5 Pro ─────────────────────────
async function processMediaWithGemini(file, prompt, apiKey) {
    const fileManager = new server_1.GoogleAIFileManager(apiKey);
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    // Write buffer to temp file
    const ext = path_1.default.extname(file.originalname) || '.tmp';
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `gemini_${Date.now()}${ext}`);
    fs_1.default.writeFileSync(tempPath, file.buffer);
    let uploadedFile = null;
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
    }
    finally {
        if (fs_1.default.existsSync(tempPath)) {
            fs_1.default.unlinkSync(tempPath);
        }
        if (uploadedFile) {
            try {
                await fileManager.deleteFile(uploadedFile.file.name);
            }
            catch (e) {
                console.error("Failed to delete remote file", e);
            }
        }
    }
}
// ─── Pure JS Vector RAG Implementation (No Langchain ESM crashes) ───────────
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function chunkText(text, size = 1000, overlap = 200) {
    if (!text)
        return [];
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.substring(i, i + size));
        i += size - overlap;
    }
    return chunks;
}
async function getOllamaEmbedding(text) {
    let res;
    try {
        res = await fetch('http://localhost:11434/api/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'nomic-embed-text', prompt: text })
        });
    }
    catch (err) {
        throw new Error("Cannot connect to Ollama. Is the Ollama app running on your Mac/PC? (Run 'ollama run llama3' in a new terminal)");
    }
    if (!res.ok)
        throw new Error("Ollama embedding failed. Did you pull the embedding model? Run: ollama pull nomic-embed-text");
    const data = await res.json();
    return data.embedding;
}
async function askAI(prompt) {
    // 1. Try local Ollama if available
    try {
        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama3', prompt, stream: false }),
            signal: AbortSignal.timeout(1500),
        });
        if (res.ok) {
            const data = (await res.json());
            if (data.response)
                return data.response;
        }
    }
    catch { }
    // 2. Try Gemini if configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text)
                return text;
        }
        catch { }
    }
    // 3. High-performance fallback: Pollinations AI (free OpenAI-compatible LLM)
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'openai',
            }),
            signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
            const text = await res.text();
            if (text && text.trim())
                return text.trim();
        }
    }
    catch { }
    throw new Error('Could not connect to AI services. Please try again.');
}
async function askOllama(prompt) {
    return askAI(prompt);
}
async function callOllamaRAG(text, prompt) {
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
    const chunkEmbeddings = await Promise.all(chunks.map(async (chunk) => {
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
function makeLLMHandler(actionPrompt, action, isJson = false) {
    return async (req, res) => {
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
                const result = await processMediaWithGemini(req.file, prompt, apiKey);
                res.json({ result, action });
                return;
            }
            // Otherwise it's text (either from file or body)
            let text = '';
            if (req.file) {
                text = await extractText(req.file);
            }
            else {
                const body = req.body;
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
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            console.error(`[LLM/${action}]`, msg);
            res.status(500).json({ error: msg });
        }
    };
}
// ─── Routes ───────────────────────────────────────────────────────────────────
exports.llmRouter.post('/summarize', upload.single('file'), makeLLMHandler('Summarise the provided context in 3-5 short bullet points.', 'summarize'));
exports.llmRouter.post('/explain', upload.single('file'), makeLLMHandler('Explain the provided context clearly. Use an analogy or example to make it easy to understand.', 'explain'));
exports.llmRouter.post('/simplify', upload.single('file'), makeLLMHandler('Rewrite the provided context in the simplest possible English. Use very short sentences. Imagine you are explaining to a 10-year-old.', 'simplify'));
exports.llmRouter.post('/quiz', upload.single('file'), makeLLMHandler('Create exactly 3 simple multiple-choice quiz questions from this context. Format as:\n\nQ1: [question]\nA) [option]\nB) [option]\nC) [option]\nAnswer: [letter]\n\nKeep questions simple and friendly.', 'quiz'));
exports.llmRouter.post('/video-script', upload.single('file'), makeLLMHandler(`Read the context and create a dynamic, engaging video script explaining the core concepts. 
Return EXACTLY a JSON array of 4-6 objects. 
Each object must have:
- "text": a short, simple spoken sentence (max 15 words) explaining a point.
- "keyword": a single specific noun/word (no spaces) to use for fetching a background image (e.g. "brain", "plant", "ocean", "technology").

Example:
[{"text": "Photosynthesis is how plants make food.", "keyword": "leaf"}]

Return ONLY the raw JSON array, nothing else.`, 'video-script', true));
// ─── Jarvis Conversational Agent Endpoint (ChatGPT-style multi-turn chat) ─────
exports.llmRouter.post('/chat', async (req, res) => {
    try {
        const { messages = [], context = {} } = req.body || {};
        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
        if (!lastUserMsg) {
            res.status(400).json({ error: 'No user message provided.' });
            return;
        }
        const systemPrompt = `You are JARVIS, an intelligent, empathetic, and knowledgeable AI assistant inside NeuroBridge, an educational platform for neurodivergent and dyslexic learners.
You behave like ChatGPT / Claude: capable of answering ANY question — science, mathematics, coding, history, writing essays, explaining complex concepts simply, giving study advice, and engaging in natural conversation.

DYSLEXIA-FRIENDLY RESPONSE STYLE:
- Write in clean, structured Markdown.
- Use bullet points, bold key terms, and short, readable paragraphs.
- Keep vocabulary clear and supportive (Grade 6-8 reading level unless advanced detail is requested).
- Be encouraging and warm.

WEBSITE CONTEXT:
- Active Page: "${context.pageTitle || 'NeuroBridge'}" (${context.currentRoute || '/'})
- Learner Name: "${context.userName || 'Learner'}"
- Language: "${context.language || 'en'}"
${context.pageContent ? `- Active Screen Content: "${String(context.pageContent).slice(0, 1200)}"` : ''}

WEBSITE ACTIONS:
If the user explicitly asks you to navigate or perform an on-screen function, append an action tag on its own line at the very end of your response:
[ACTION:navigate_home] -> Go to home
[ACTION:open_dashboard] -> Go to dashboard
[ACTION:open_learn] -> Go to learning hub
[ACTION:open_opportunities] -> Go to opportunities & jobs
[ACTION:open_community] -> Go to community discussions
[ACTION:open_assessment] -> Go to dyslexia assessment
[ACTION:open_nearby] -> Go to nearby care & support
[ACTION:toggle_dyslexia_font] -> Toggle OpenDyslexic font
[ACTION:toggle_high_contrast] -> Toggle high contrast mode
[ACTION:read_page] -> Read the current page aloud
[ACTION:stop_reading] -> Stop reading
Only include an action tag when the user explicitly requests navigation or an on-screen feature. For general questions, explain normally without action tags.`;
        const chatHistory = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-8).map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: String(m.content || ''),
            })),
        ];
        let reply = '';
        // 1. Try Gemini if configured
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const geminiMessages = chatHistory
                    .filter((m) => m.role !== 'system')
                    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                    .join('\n\n');
                const fullPrompt = `${systemPrompt}\n\n${geminiMessages}\n\nAssistant:`;
                const result = await model.generateContent(fullPrompt);
                reply = result.response.text();
            }
            catch (geminiErr) {
                console.warn('[LLM/chat] Gemini API failed:', geminiErr?.message || geminiErr);
            }
        }
        // 2. Try Pollinations AI (High-speed OpenAI-compatible LLM)
        if (!reply) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);
                const pollRes = await fetch('https://text.pollinations.ai/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: chatHistory,
                        model: 'openai',
                        seed: 42,
                    }),
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                if (pollRes.ok) {
                    reply = await pollRes.text();
                }
            }
            catch (pollErr) {
                console.warn('[LLM/chat] Pollinations AI failed:', pollErr?.message);
            }
        }
        // 3. Fallback to Ollama if local instance exists
        if (!reply) {
            try {
                const finalPrompt = `${systemPrompt}\n\nUser: ${lastUserMsg}\n\nAssistant:`;
                reply = await askAI(finalPrompt);
            }
            catch (ollamaErr) {
                console.warn('[LLM/chat] Ollama failed:', ollamaErr?.message);
            }
        }
        // 4. Guaranteed Friendly Response if all networks fail
        if (!reply) {
            reply = `I'm here to help you learn and explore! You asked: "${lastUserMsg}". Feel free to ask me to explain concepts, help with study techniques, or guide you around NeuroBridge.`;
        }
        // Extract action tag if present
        let action = null;
        const actionMatch = reply.match(/\[ACTION:([a-zA-Z0-9_]+)\]/);
        if (actionMatch) {
            action = actionMatch[1];
            reply = reply.replace(/\[ACTION:[a-zA-Z0-9_]+\]/g, '').trim();
        }
        res.json({
            text: reply.trim(),
            action,
            spokenResponse: reply.trim().slice(0, 260),
        });
    }
    catch (error) {
        console.error('[LLM/chat] Unexpected error:', error);
        res.status(500).json({ error: error?.message || 'Chat service error' });
    }
});
