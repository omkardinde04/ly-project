/**
 * Shared types for NeuroBridge AI Provider Architecture
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestContext {
  currentRoute?: string;
  pageTitle?: string;
  pageContent?: string;
  userName?: string;
  language?: string;
}

export interface AIOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  requestId?: string;
}

export interface AIStreamCallbacks {
  onChunk: (chunkText: string) => void;
  onReset?: (reason?: string) => void;
}

export interface CandidateAttempt {
  provider: string;
  model: string;
  success: boolean;
  latencyMs: number;
  error?: string;
  statusCode?: number;
}

export interface DetailedProviderResult {
  text: string;
  actualModel: string;
  attempts: CandidateAttempt[];
}

export interface AIProvider {
  readonly name: string;
  readonly modelName: string;
  isConfigured(): boolean;
  generate(messages: ChatMessage[], options?: AIOptions): Promise<string>;
  generateStream(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: AIOptions
  ): Promise<string>;
  generateDetailed?(messages: ChatMessage[], options?: AIOptions): Promise<DetailedProviderResult>;
  generateStreamDetailed?(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    options?: AIOptions
  ): Promise<DetailedProviderResult>;
}

export interface AIServiceResult {
  text: string;
  action: string | null;
  spokenResponse: string;
  requestId: string;
  provider: string;
  model: string;
  latencyMs: number;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  fallbackProvider?: string;
  fallbackModel?: string;
  fallbackLatencyMs?: number;
  candidateAttempts?: CandidateAttempt[];
}

export interface AIExecutionLog {
  requestId: string;
  endpoint?: string;
  inputLength?: number;
  contextIncluded?: boolean;
  primaryProvider: string;
  primaryModel: string;
  primaryLatencyMs: number;
  fallbackTriggered: boolean;
  fallbackReason?: string;
  fallbackProvider?: string;
  fallbackModel?: string;
  fallbackLatencyMs?: number;
  candidateAttempts?: CandidateAttempt[];
  finalProvider: string;
  finalModel: string;
  success: boolean;
  error?: string;
}
