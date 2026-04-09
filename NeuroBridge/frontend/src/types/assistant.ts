// Types for the Jarvis-like AI Assistant System

export type Language = 'en' | 'hi' | 'mr';
export type ConversationFlow =
  | 'welcome'
  | 'website-guide'
  | 'profile-builder'
  | 'opportunity-assistant'
  | 'assessment-guide'
  | 'community-guide'
  | 'general-help';

export type UserInput = 'text' | 'voice' | 'button' | 'silence';

export interface Message {
  id: string;
  type: 'assistant' | 'user';
  text: string;
  audioUrl?: string;
  timestamp: number;
  language: Language;
}

export interface ConversationState {
  currentFlow: ConversationFlow;
  stepIndex: number;
  sessionData: Record<string, any>;
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  lastUserInput?: string;
  silenceCount: number;
}

export interface UserProfile {
  name?: string;
  email?: string;
  education?: string;
  skills?: string[];
  interests?: string[];
  language: Language;
  dyslexiaLevel?: string;
}

export interface AssistantResponse {
  text: string;
  audioUrl?: string;
  nextAction?: 'wait' | 'ask' | 'guide' | 'confirm' | 'explain';
  nextFlow?: ConversationFlow;
  sessionData?: Record<string, any>;
  options?: string[];
  spotlight?: string;
}

export interface PromptTemplate {
  id: string;
  flow: ConversationFlow;
  step: number;
  text: Record<Language, string>;
  voiceStyle?: 'warm' | 'encouraging' | 'calm' | 'playful';
  waitForResponse: boolean;
  responseHandlers?: Record<string, ConversationFlow | string>;
  alternativePhrasings?: Record<Language, string[]>;
  spotlightTarget?: string;
}

export interface ConversationMemory {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActiveTime: number;
  profile: Partial<UserProfile>;
  conversationHistory: Message[];
  completedFlows: ConversationFlow[];
}

export interface TextToSpeechOptions {
  language: Language;
  speed: number;
  pitch: number;
  volume: number;
}

export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  language: Language;
  isFinal: boolean;
}
