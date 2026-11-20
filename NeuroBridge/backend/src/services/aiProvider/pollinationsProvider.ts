import { AIProvider, ChatMessage, AIOptions } from './types';

/**
 * Pollinations Cloud Provider
 * Highly available, high-speed OpenAI-compatible free cloud provider.
 * Guarantees real, dynamic AI responses even if Gemini and Ollama Cloud are unavailable.
 */
export class PollinationsProvider implements AIProvider {
  public readonly name = 'pollinations';
  private endpoint = 'https://text.pollinations.ai/';

  public get modelName(): string {
    return 'openai';
  }

  public isConfigured(): boolean {
    return true; // No API key required, always available
  }

  public async generate(messages: ChatMessage[], options?: AIOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 12000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: this.modelName,
          seed: Math.floor(Math.random() * 100000),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Pollinations API error: HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      if (!text || !text.trim()) {
        throw new Error('Pollinations returned an empty response.');
      }

      return text.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Pollinations connection timeout after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  public async generateStream(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: AIOptions
  ): Promise<string> {
    // When using Pollinations with SSE/streaming or chunked delivery
    const timeoutMs = options?.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 14000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      // Fetch stream with stream: true
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: this.modelName,
          seed: Math.floor(Math.random() * 100000),
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Pollinations streaming error: HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Pollinations stream returned empty body.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        if (options?.signal?.aborted) {
          throw new Error('Request aborted by client');
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // SSE format: data: {"choices":[{"delta":{"content":"..."}}]} or raw token text
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const token =
                parsed?.choices?.[0]?.delta?.content ||
                parsed?.text ||
                parsed?.content;
              if (token) {
                fullText += token;
                onChunk(token);
              }
            } catch {
              // Raw text chunk in data line
              if (dataStr) {
                fullText += dataStr;
                onChunk(dataStr);
              }
            }
          } else {
            // Direct text chunk
            fullText += trimmed + '\n';
            onChunk(trimmed + '\n');
          }
        }
      }

      // If SSE didn't deliver chunks (some versions return complete text directly)
      if (!fullText.trim() && buffer.trim()) {
        fullText = buffer.trim();
        onChunk(fullText);
      }

      // If still empty, fall back to non-streaming generate
      if (!fullText.trim()) {
        const text = await this.generate(messages, options);
        onChunk(text);
        return text;
      }

      return fullText.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Pollinations stream timeout after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}
