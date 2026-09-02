export type JarvisActionType =
  | 'action'
  | 'navigate'
  | 'navigate_tab'
  | 'scroll'
  | 'click'
  | 'toggle_setting'
  | 'goback'
  | 'goforward'
  | 'conversation'
  | 'confirmation_required'
  | 'confirm_action'
  | 'unsupported';

export type ActionSafetyLevel = 'safe' | 'sensitive';

export type AgentExecutionStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'executing'
  | 'success'
  | 'error'
  | 'awaiting_confirmation';

export interface JarvisActionDefinition {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'scrolling' | 'page_interaction' | 'accessibility' | 'system';
  safetyLevel: ActionSafetyLevel;
  parametersSchema?: Record<string, { type: string; description: string; required?: boolean }>;
  synonyms?: string[];
  requiresPath?: string; // Optional: only available when on a specific path
}

export interface StructuredIntent {
  type: JarvisActionType;
  action?: string;
  parameters?: Record<string, any>;
  displayText: string;
  spokenResponse: string;
  confidence?: number;
  confirmationPrompt?: string;
}

export interface JarvisContext {
  currentRoute: string;
  pageTitle: string;
  activeTab?: string;
  availableActions: string[];
  recentHistory: Array<{ role: 'user' | 'assistant'; content: string; actionExecuted?: string }>;
  userName?: string;
  language: 'en' | 'hi' | 'mr';
}

export interface ActionResult {
  success: boolean;
  actionId?: string;
  message: string;
  spokenResponse?: string;
  redirectUrl?: string;
  details?: any;
}

export interface PendingConfirmation {
  intent: StructuredIntent;
  prompt: string;
  spokenPrompt: string;
  onConfirm: () => Promise<ActionResult>;
  onCancel: () => void;
}
