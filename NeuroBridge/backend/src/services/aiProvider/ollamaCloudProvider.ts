import { AIProvider, ChatMessage, AIOptions } from './types';

export class OllamaCloudProvider implements AIProvider {
  public readonly name = 'ollama-cloud';
  private endpoint = 'https://ollama.com/api/chat';

  public get modelName(): string {
    return (process.env.OLLAMA_MODEL || 'glm-5.3-flash').trim();
  }

  private getApiKey(): string {
    return (process.env.OLLAMA_API_KEY || '').trim();
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 5);
  }

  public async generate(messages: ChatMessage[], options?: AIOptions): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OLLAMA_API_KEY is not configured on the server. Please set it in environment variables.');
    }

    const timeoutMs = options?.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 8000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errDetail = '';
        try {
          const errJson = await response.json();
          errDetail = errJson.error || JSON.stringify(errJson);
        } catch {
          errDetail = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`Ollama Cloud API error (${response.status}): ${errDetail}`);
      }

      const data = (await response.json()) as any;
      const text = data?.message?.content;
      if (!text || !text.trim()) {
        throw new Error('Ollama Cloud returned an empty message.');
      }

      return text.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Ollama Cloud connection timeout after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  public async generateStream(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: AIOptions
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OLLAMA_API_KEY is not configured on the server. Please set it in environment variables.');
    }

    const timeoutMs = options?.timeoutMs || Number(process.env.AI_REQUEST_TIMEOUT_MS) || 8000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    if (options?.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errDetail = '';
        try {
          const errJson = await response.json();
          errDetail = errJson.error || JSON.stringify(errJson);
        } catch {
          errDetail = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`Ollama Cloud streaming API error (${response.status}): ${errDetail}`);
      }

      if (!response.body) {
        throw new Error('Ollama Cloud streaming returned empty response body.');
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
          try {
            const parsed = JSON.parse(trimmed);
            const token = parsed?.message?.content;
            if (token) {
              fullText += token;
              onChunk(token);
            }
          } catch {
            // Non-JSON line or incomplete chunk
          }
        }
      }

      // Flush any trailing line in buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          const token = parsed?.message?.content;
          if (token) {
            fullText += token;
            onChunk(token);
          }
        } catch {}
      }

      if (!fullText.trim()) {
        throw new Error('Ollama Cloud stream finished with no tokens.');
      }

      return fullText.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Ollama Cloud stream connection timeout after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}
