import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, ChatMessage, AIOptions, DetailedProviderResult, CandidateAttempt } from './types';

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';

  public get modelName(): string {
    return (process.env.GEMINI_MODEL || 'gemini-flash-lite-latest').trim();
  }

  private getApiKey(): string {
    return (process.env.GEMINI_API_KEY || '').trim();
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  /**
   * Resilient model candidates to ensure requests never fail due to a single model's quota or deprecation.
   */
  private getModelCandidates(): string[] {
    const configured = this.modelName;
    const fallbacks = [
      'gemini-3.1-flash-lite-preview',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
    ];
    return Array.from(new Set([configured, ...fallbacks]));
  }

  private formatContents(messages: ChatMessage[]): { systemText: string; contents: Array<{ role: string; parts: Array<{ text: string }> }> } {
    const systemMessage = messages.find((m) => m.role === 'system');
    const systemText = systemMessage?.content || '';

    const nonSystem = messages.filter((m) => m.role !== 'system');
    const contents = nonSystem.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    return { systemText, contents };
  }

  public async generate(messages: ChatMessage[], options?: AIOptions): Promise<string> {
    const res = await this.generateDetailed(messages, options);
    return res.text;
  }

  public async generateDetailed(messages: ChatMessage[], options?: AIOptions): Promise<DetailedProviderResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { systemText, contents } = this.formatContents(messages);
    const timeoutMs = options?.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 9000;
    const candidates = this.getModelCandidates();
    const attempts: CandidateAttempt[] = [];

    let lastError: any = null;

    for (const modelCandidate of candidates) {
      const startCandidate = Date.now();
      try {
        const model = genAI.getGenerativeModel({
          model: modelCandidate,
          systemInstruction: systemText ? { role: 'system', parts: [{ text: systemText }] } : undefined,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini (${modelCandidate}) timeout after ${timeoutMs}ms`)), timeoutMs)
        );

        const generatePromise = model.generateContent({ contents });
        const result = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = result.response.text();
        const latencyMs = Date.now() - startCandidate;

        if (responseText && responseText.trim()) {
          attempts.push({
            provider: 'gemini',
            model: modelCandidate,
            success: true,
            latencyMs,
          });
          return {
            text: responseText.trim(),
            actualModel: modelCandidate,
            attempts,
          };
        } else {
          throw new Error(`Empty response returned by ${modelCandidate}`);
        }
      } catch (err: any) {
        const latencyMs = Date.now() - startCandidate;
        lastError = err;
        const msg = err?.message || String(err);
        const statusMatch = msg.match(/\b(503|500|429|404|403|401)\b/);
        const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : (err?.status || undefined);

        attempts.push({
          provider: 'gemini',
          model: modelCandidate,
          success: false,
          latencyMs,
          error: msg,
          statusCode,
        });

        console.warn(`[GeminiProvider] Model ${modelCandidate} failed (${statusCode || 'error'}): ${msg}. Attempting next candidate...`);
        // If aborted by user, don't keep looping
        if (options?.signal?.aborted) {
          throw err;
        }
      }
    }

    const failureErr: any = lastError || new Error('All Gemini model candidates failed.');
    failureErr.attempts = attempts;
    throw failureErr;
  }

  public async generateStream(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: AIOptions
  ): Promise<string> {
    const res = await this.generateStreamDetailed(messages, onChunk, options);
    return res.text;
  }

  public async generateStreamDetailed(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: AIOptions
  ): Promise<DetailedProviderResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { systemText, contents } = this.formatContents(messages);
    const timeoutMs = options?.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 10000;
    const candidates = this.getModelCandidates();
    const attempts: CandidateAttempt[] = [];

    let lastError: any = null;

    for (const modelCandidate of candidates) {
      const startCandidate = Date.now();
      try {
        const model = genAI.getGenerativeModel({
          model: modelCandidate,
          systemInstruction: systemText ? { role: 'system', parts: [{ text: systemText }] } : undefined,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini stream (${modelCandidate}) timeout after ${timeoutMs}ms`)), timeoutMs)
        );

        const streamPromise = model.generateContentStream({ contents });
        const streamingResult = await Promise.race([streamPromise, timeoutPromise]);

        let fullText = '';
        for await (const chunk of streamingResult.stream) {
          if (options?.signal?.aborted) {
            throw new Error('Request aborted by client');
          }
          const text = chunk.text();
          if (text) {
            fullText += text;
            onChunk(text);
          }
        }

        const latencyMs = Date.now() - startCandidate;

        if (fullText.trim()) {
          attempts.push({
            provider: 'gemini',
            model: modelCandidate,
            success: true,
            latencyMs,
          });
          return {
            text: fullText.trim(),
            actualModel: modelCandidate,
            attempts,
          };
        } else {
          throw new Error(`Empty stream returned by ${modelCandidate}`);
        }
      } catch (err: any) {
        const latencyMs = Date.now() - startCandidate;
        lastError = err;
        const msg = err?.message || String(err);
        const statusMatch = msg.match(/\b(503|500|429|404|403|401)\b/);
        const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : (err?.status || undefined);

        attempts.push({
          provider: 'gemini',
          model: modelCandidate,
          success: false,
          latencyMs,
          error: msg,
          statusCode,
        });

        console.warn(`[GeminiProvider] Stream model ${modelCandidate} failed (${statusCode || 'error'}): ${msg}. Attempting next candidate...`);
        if (options?.signal?.aborted) {
          throw err;
        }
      }
    }

    const failureErr: any = lastError || new Error('All Gemini streaming model candidates failed.');
    failureErr.attempts = attempts;
    throw failureErr;
  }
}
