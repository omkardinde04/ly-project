import {
  AIProvider,
  ChatMessage,
  AIRequestContext,
  AIOptions,
  AIStreamCallbacks,
  AIServiceResult,
  AIExecutionLog,
  CandidateAttempt,
} from './types';
import { GeminiProvider } from './geminiProvider';
import { OllamaCloudProvider } from './ollamaCloudProvider';
import { PollinationsProvider } from './pollinationsProvider';

export class AIService {
  private primaryProvider: AIProvider;
  private secondaryProvider: AIProvider;
  private cloudFallbackProvider: AIProvider;
  private fallbackEnabled: boolean;

  constructor() {
    this.primaryProvider = new GeminiProvider();
    this.secondaryProvider = new OllamaCloudProvider();
    this.cloudFallbackProvider = new PollinationsProvider();
    this.fallbackEnabled = process.env.AI_FALLBACK_ENABLED !== 'false';
  }

  /**
   * Generates a unique request ID for distributed tracing and structured logs.
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Formats structured execution log without exposing keys or credentials.
   * Accurately logs candidate attempts, intermediate errors (like 503s), and fallbacks.
   */
  private logExecution(log: AIExecutionLog): void {
    const divider = '─'.repeat(60);
    console.log(`\n🤖 [AI Request Tracing] ID: ${log.requestId}`);
    if (log.endpoint) console.log(`   Endpoint          : ${log.endpoint}`);
    if (log.inputLength !== undefined) console.log(`   Input Length      : ${log.inputLength} chars`);
    if (log.contextIncluded !== undefined) console.log(`   Context Included  : ${log.contextIncluded ? 'YES' : 'NO'}`);
    console.log(`   Primary Provider  : ${log.primaryProvider} (${log.primaryModel})`);
    console.log(`   Primary Latency   : ${log.primaryLatencyMs}ms`);

    if (log.candidateAttempts && log.candidateAttempts.length > 0) {
      console.log(`   Candidate Attempts:`);
      log.candidateAttempts.forEach((att, idx) => {
        const statusIcon = att.success ? '✅ SUCCESS' : '❌ FAILED';
        const codeInfo = att.statusCode ? ` (${att.statusCode})` : '';
        const errInfo = att.error ? ` - ${att.error.slice(0, 70)}` : '';
        console.log(`     [${idx + 1}] ${att.provider} (${att.model}): ${statusIcon}${codeInfo} [${att.latencyMs}ms]${errInfo}`);
      });
    }

    if (log.fallbackTriggered) {
      console.log(`   ⚠️ Fallback Triggered: YES`);
      console.log(`   ⚠️ Fallback Reason   : ${log.fallbackReason}`);
      console.log(`   Fallback Provider : ${log.fallbackProvider} (${log.fallbackModel})`);
      console.log(`   Fallback Latency  : ${log.fallbackLatencyMs}ms`);
    } else {
      console.log(`   Fallback Triggered: NO`);
    }

    console.log(`   Final Provider    : ${log.finalProvider} (${log.finalModel})`);
    console.log(`   Status            : ${log.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (log.error) {
      console.log(`   Error Message     : ${log.error}`);
    }
    console.log(divider + '\n');
  }

  /**
   * Builds the comprehensive, dyslexia-friendly system prompt with application context.
   */
  public buildSystemPrompt(context: AIRequestContext = {}): string {
    return `You are JARVIS, an intelligent, empathetic, and knowledgeable AI voice and web assistant inside NeuroBridge, an educational and assistive platform for neurodivergent and dyslexic learners.
You behave like a world-class AI assistant: capable of answering ANY question — science, mathematics, programming, technology, history, reasoning, summaries, writing essays and emails, creative brainstorming, and engaging in natural conversation.
Always maintain context from previous conversational turns (understand "it", "that", "why", "give an example", "explain more simply").

DYSLEXIA-FRIENDLY & VOICE RESPONSE STYLE:
- Write in clean, structured Markdown.
- Use short, clear sentences (10 to 18 words per sentence).
- Use bullet points, bold key terms, and short paragraphs for readability.
- Avoid robotic disclaimers ("As an AI...", "Certainly!", "Sure thing!").
- Keep vocabulary supportive and clear.
- Be encouraging, confident, and direct.

CURRENT APPLICATION CONTEXT:
- Active Screen / Page: "${context.pageTitle || 'NeuroBridge'}" (${context.currentRoute || '/'})
- Learner Name: "${context.userName || 'Learner'}"
- Language: "${context.language || 'en'}"
${context.pageContent ? `- Active Screen Content Snippet: "${String(context.pageContent).slice(0, 1000)}"` : ''}

NAVIGATION & ON-SCREEN ACTIONS:
Only when the user explicitly requests navigation or an on-screen function, append an action tag on its own line at the very end of your response:
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
[ACTION:stop_reading] -> Stop reading aloud
For all general questions (science, math, programming, reasoning, writing, brainstorming, explanations), DO NOT append any action tag.`;
  }

  /**
   * Prepares the full message list with system prompt and history.
   */
  public prepareMessages(
    userInput: string,
    history: Array<{ role: string; content: string }> = [],
    context: AIRequestContext = {}
  ): ChatMessage[] {
    const systemPrompt = this.buildSystemPrompt(context);
    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

    // Include recent history (up to last 8 turns)
    const recent = history.slice(-8);
    for (const msg of recent) {
      if (msg.role === 'assistant' || msg.role === 'model') {
        messages.push({ role: 'assistant', content: String(msg.content || '') });
      } else if (msg.role === 'user') {
        messages.push({ role: 'user', content: String(msg.content || '') });
      }
    }

    // Add current user input
    messages.push({ role: 'user', content: userInput.trim() });
    return messages;
  }

  /**
   * Extracts action tag, clean response text, and spoken summary.
   */
  private processResponse(rawText: string, log: AIExecutionLog): AIServiceResult {
    let cleanText = rawText.trim();
    let action: string | null = null;

    const actionMatch = cleanText.match(/\[ACTION:([a-zA-Z0-9_]+)\]/);
    if (actionMatch) {
      action = actionMatch[1];
      cleanText = cleanText.replace(/\[ACTION:[a-zA-Z0-9_]+\]/g, '').trim();
    }

    // Spoken response: First 2-3 clean sentences, max 260 chars
    const spokenResponse = cleanText.slice(0, 260).replace(/[*#`_]/g, '').trim();

    return {
      text: cleanText,
      action,
      spokenResponse,
      requestId: log.requestId,
      provider: log.finalProvider,
      model: log.finalModel,
      latencyMs: log.primaryLatencyMs + (log.fallbackLatencyMs || 0),
      fallbackTriggered: log.fallbackTriggered,
      fallbackReason: log.fallbackReason,
      fallbackProvider: log.fallbackProvider,
      fallbackModel: log.fallbackModel,
      fallbackLatencyMs: log.fallbackLatencyMs,
      candidateAttempts: log.candidateAttempts,
    };
  }

  /**
   * Unified Non-Streaming Chat Execution with Multi-Tier Cloud Fallback
   * 1. Primary: Gemini (multi-model with truthful attempt tracing)
   * 2. Secondary: Ollama Cloud (if configured)
   * 3. Tertiary: Pollinations Cloud (high-availability instant fallback)
   */
  public async chat(
    messages: ChatMessage[],
    options?: AIOptions
  ): Promise<AIServiceResult> {
    const requestId = options?.requestId || this.generateRequestId();
    const primaryStart = Date.now();

    const userMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const log: AIExecutionLog = {
      requestId,
      endpoint: '/api/llm/chat',
      inputLength: userMsg.length,
      contextIncluded: messages.length > 2,
      primaryProvider: this.primaryProvider.name,
      primaryModel: this.primaryProvider.modelName,
      primaryLatencyMs: 0,
      fallbackTriggered: false,
      candidateAttempts: [],
      finalProvider: this.primaryProvider.name,
      finalModel: this.primaryProvider.modelName,
      success: false,
    };

    // 1. Attempt Primary Provider (Gemini)
    try {
      let responseText = '';
      if (typeof this.primaryProvider.generateDetailed === 'function') {
        const detailed = await this.primaryProvider.generateDetailed(messages, {
          ...options,
          requestId,
        });
        responseText = detailed.text;
        log.candidateAttempts = detailed.attempts;
        log.primaryModel = detailed.actualModel;
        log.finalModel = detailed.actualModel;
      } else {
        responseText = await this.primaryProvider.generate(messages, {
          ...options,
          requestId,
        });
        log.candidateAttempts = [
          {
            provider: this.primaryProvider.name,
            model: this.primaryProvider.modelName,
            success: true,
            latencyMs: Date.now() - primaryStart,
          },
        ];
      }

      log.primaryLatencyMs = Date.now() - primaryStart;
      log.success = true;
      this.logExecution(log);

      return this.processResponse(responseText, log);
    } catch (primaryErr: any) {
      log.primaryLatencyMs = Date.now() - primaryStart;
      log.fallbackReason = primaryErr?.message || String(primaryErr);
      if (primaryErr?.attempts && Array.isArray(primaryErr.attempts)) {
        log.candidateAttempts = primaryErr.attempts;
      } else if (!log.candidateAttempts || log.candidateAttempts.length === 0) {
        log.candidateAttempts = [
          {
            provider: this.primaryProvider.name,
            model: this.primaryProvider.modelName,
            success: false,
            latencyMs: log.primaryLatencyMs,
            error: log.fallbackReason,
          },
        ];
      }

      if (!this.fallbackEnabled) {
        log.error = `Primary provider failed and fallback is disabled: ${log.fallbackReason}`;
        this.logExecution(log);
        throw primaryErr;
      }

      log.fallbackTriggered = true;
      const fallbackStart = Date.now();

      // 2. Attempt Secondary Provider (Ollama Cloud if configured)
      if (this.secondaryProvider.isConfigured()) {
        const secStart = Date.now();
        try {
          const secondaryResponse = await this.secondaryProvider.generate(messages, {
            ...options,
            requestId,
          });

          const secLatency = Date.now() - secStart;
          log.candidateAttempts?.push({
            provider: this.secondaryProvider.name,
            model: this.secondaryProvider.modelName,
            success: true,
            latencyMs: secLatency,
          });

          log.fallbackLatencyMs = Date.now() - fallbackStart;
          log.fallbackProvider = this.secondaryProvider.name;
          log.fallbackModel = this.secondaryProvider.modelName;
          log.finalProvider = this.secondaryProvider.name;
          log.finalModel = this.secondaryProvider.modelName;
          log.success = true;
          this.logExecution(log);

          return this.processResponse(secondaryResponse, log);
        } catch (secondaryErr: any) {
          const secLatency = Date.now() - secStart;
          log.candidateAttempts?.push({
            provider: this.secondaryProvider.name,
            model: this.secondaryProvider.modelName,
            success: false,
            latencyMs: secLatency,
            error: secondaryErr?.message,
          });
          console.warn(`[AIService] Secondary (${this.secondaryProvider.name}) failed: ${secondaryErr.message}. Trying cloud fallback...`);
        }
      }

      // 3. High-Availability Cloud Fallback (Pollinations AI)
      const cloudStart = Date.now();
      try {
        const cloudResponse = await this.cloudFallbackProvider.generate(messages, {
          ...options,
          requestId,
        });

        const cloudLatency = Date.now() - cloudStart;
        log.candidateAttempts?.push({
          provider: this.cloudFallbackProvider.name,
          model: this.cloudFallbackProvider.modelName,
          success: true,
          latencyMs: cloudLatency,
        });

        log.fallbackLatencyMs = Date.now() - fallbackStart;
        log.fallbackProvider = this.cloudFallbackProvider.name;
        log.fallbackModel = this.cloudFallbackProvider.modelName;
        log.finalProvider = this.cloudFallbackProvider.name;
        log.finalModel = this.cloudFallbackProvider.modelName;
        log.success = true;
        this.logExecution(log);

        return this.processResponse(cloudResponse, log);
      } catch (cloudErr: any) {
        const cloudLatency = Date.now() - cloudStart;
        log.candidateAttempts?.push({
          provider: this.cloudFallbackProvider.name,
          model: this.cloudFallbackProvider.modelName,
          success: false,
          latencyMs: cloudLatency,
          error: cloudErr?.message,
        });

        log.fallbackLatencyMs = Date.now() - fallbackStart;
        log.error = `All AI providers failed. Primary: "${log.fallbackReason}". Cloud fallback: "${cloudErr?.message}".`;
        this.logExecution(log);

        throw new Error(
          `AI service unavailable. Primary (${this.primaryProvider.name}) error: ${log.fallbackReason}. Cloud fallback error: ${cloudErr?.message}`
        );
      }
    }
  }

  /**
   * Unified Real-Time Streaming Chat Execution with Multi-Tier Cloud Fallback
   */
  public async chatStream(
    messages: ChatMessage[],
    callbacks: AIStreamCallbacks,
    options?: AIOptions
  ): Promise<AIServiceResult> {
    const requestId = options?.requestId || this.generateRequestId();
    const primaryStart = Date.now();

    const userMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const log: AIExecutionLog = {
      requestId,
      endpoint: '/api/llm/chat/stream',
      inputLength: userMsg.length,
      contextIncluded: messages.length > 2,
      primaryProvider: this.primaryProvider.name,
      primaryModel: this.primaryProvider.modelName,
      primaryLatencyMs: 0,
      fallbackTriggered: false,
      candidateAttempts: [],
      finalProvider: this.primaryProvider.name,
      finalModel: this.primaryProvider.modelName,
      success: false,
    };

    let streamedToUserChars = 0;

    // 1. Attempt Primary Streaming (Gemini)
    try {
      let fullText = '';
      if (typeof this.primaryProvider.generateStreamDetailed === 'function') {
        const detailed = await this.primaryProvider.generateStreamDetailed(
          messages,
          (token) => {
            streamedToUserChars += token.length;
            callbacks.onChunk(token);
          },
          { ...options, requestId }
        );
        fullText = detailed.text;
        log.candidateAttempts = detailed.attempts;
        log.primaryModel = detailed.actualModel;
        log.finalModel = detailed.actualModel;
      } else {
        fullText = await this.primaryProvider.generateStream(
          messages,
          (token) => {
            streamedToUserChars += token.length;
            callbacks.onChunk(token);
          },
          { ...options, requestId }
        );
        log.candidateAttempts = [
          {
            provider: this.primaryProvider.name,
            model: this.primaryProvider.modelName,
            success: true,
            latencyMs: Date.now() - primaryStart,
          },
        ];
      }

      log.primaryLatencyMs = Date.now() - primaryStart;
      log.success = true;
      this.logExecution(log);

      return this.processResponse(fullText, log);
    } catch (primaryErr: any) {
      log.primaryLatencyMs = Date.now() - primaryStart;
      log.fallbackReason = primaryErr?.message || String(primaryErr);

      if (primaryErr?.attempts && Array.isArray(primaryErr.attempts)) {
        log.candidateAttempts = primaryErr.attempts;
      } else if (!log.candidateAttempts || log.candidateAttempts.length === 0) {
        log.candidateAttempts = [
          {
            provider: this.primaryProvider.name,
            model: this.primaryProvider.modelName,
            success: false,
            latencyMs: log.primaryLatencyMs,
            error: log.fallbackReason,
          },
        ];
      }

      if (!this.fallbackEnabled) {
        log.error = `Primary provider stream failed and fallback is disabled: ${log.fallbackReason}`;
        this.logExecution(log);
        throw primaryErr;
      }

      log.fallbackTriggered = true;

      // Crucial: If partial text was already streamed to the user before Gemini failed,
      // signal a clean reset so we don't concatenate two different AI answers!
      if (streamedToUserChars > 0 && callbacks.onReset) {
        callbacks.onReset(log.fallbackReason || 'provider_fallback');
      }

      const fallbackStart = Date.now();

      // 2. Attempt Secondary Provider (Ollama Cloud if configured)
      if (this.secondaryProvider.isConfigured()) {
        const secStart = Date.now();
        try {
          let secondaryAccumulated = '';
          const secondaryFullText = await this.secondaryProvider.generateStream(
            messages,
            (token) => {
              secondaryAccumulated += token;
              callbacks.onChunk(token);
            },
            { ...options, requestId }
          );

          const secLatency = Date.now() - secStart;
          log.candidateAttempts?.push({
            provider: this.secondaryProvider.name,
            model: this.secondaryProvider.modelName,
            success: true,
            latencyMs: secLatency,
          });

          log.fallbackLatencyMs = Date.now() - fallbackStart;
          log.fallbackProvider = this.secondaryProvider.name;
          log.fallbackModel = this.secondaryProvider.modelName;
          log.finalProvider = this.secondaryProvider.name;
          log.finalModel = this.secondaryProvider.modelName;
          log.success = true;
          this.logExecution(log);

          return this.processResponse(secondaryFullText || secondaryAccumulated, log);
        } catch (secondaryErr: any) {
          const secLatency = Date.now() - secStart;
          log.candidateAttempts?.push({
            provider: this.secondaryProvider.name,
            model: this.secondaryProvider.modelName,
            success: false,
            latencyMs: secLatency,
            error: secondaryErr?.message,
          });
          console.warn(`[AIService] Secondary stream failed: ${secondaryErr.message}. Trying cloud fallback stream...`);
        }
      }

      // 3. High-Availability Cloud Fallback Stream (Pollinations AI)
      const cloudStart = Date.now();
      try {
        let cloudAccumulated = '';
        const cloudFullText = await this.cloudFallbackProvider.generateStream(
          messages,
          (token) => {
            cloudAccumulated += token;
            callbacks.onChunk(token);
          },
          { ...options, requestId }
        );

        const cloudLatency = Date.now() - cloudStart;
        log.candidateAttempts?.push({
          provider: this.cloudFallbackProvider.name,
          model: this.cloudFallbackProvider.modelName,
          success: true,
          latencyMs: cloudLatency,
        });

        log.fallbackLatencyMs = Date.now() - fallbackStart;
        log.fallbackProvider = this.cloudFallbackProvider.name;
        log.fallbackModel = this.cloudFallbackProvider.modelName;
        log.finalProvider = this.cloudFallbackProvider.name;
        log.finalModel = this.cloudFallbackProvider.modelName;
        log.success = true;
        this.logExecution(log);

        return this.processResponse(cloudFullText || cloudAccumulated, log);
      } catch (cloudErr: any) {
        const cloudLatency = Date.now() - cloudStart;
        log.candidateAttempts?.push({
          provider: this.cloudFallbackProvider.name,
          model: this.cloudFallbackProvider.modelName,
          success: false,
          latencyMs: cloudLatency,
          error: cloudErr?.message,
        });

        log.fallbackLatencyMs = Date.now() - fallbackStart;
        log.error = `All AI streaming providers failed. Primary: "${log.fallbackReason}". Cloud fallback: "${cloudErr?.message}".`;
        this.logExecution(log);

        throw new Error(
          `AI streaming service unavailable. Primary (${this.primaryProvider.name}) error: ${log.fallbackReason}. Cloud fallback error: ${cloudErr?.message}`
        );
      }
    }
  }
}
