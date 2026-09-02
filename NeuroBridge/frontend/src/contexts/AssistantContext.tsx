// Assistant Context - Global state management for the Persistent Dynamic Jarvis AI Web Agent

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type {
  Language,
  ConversationFlow,
  ConversationState,
  UserProfile,
  AssistantResponse
} from '../types/assistant';
import type {
  AgentExecutionStatus,
  PendingConfirmation,
  ActionResult,
  StructuredIntent
} from '../types/jarvisAgent';
import { ConversationManager } from '../services/assistantEngine';
import { JarvisAgentEngine } from '../services/jarvisAgentEngine';
import { JarvisExecutor } from '../services/jarvisExecutor';
import { getPageTitleForRoute } from '../services/jarvisActionRegistry';
import { getSpeechService } from '../services/speechService';
import { useAuth } from './AuthContext';
import { useDyslexia } from './DyslexiaContext';

interface AssistantContextType {
  // Floating Window & Session States
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isAssistantActive: boolean;
  isAutoStarted: boolean;
  wakeWordEnabled: boolean;
  setWakeWordEnabled: (enabled: boolean) => void;
  
  // Agent Execution & Status States
  conversationState: ConversationState;
  userProfile: Partial<UserProfile>;
  agentStatus: AgentExecutionStatus;
  currentActionName: string | null;
  pendingConfirmation: PendingConfirmation | null;

  // Actions & Callbacks
  addMessage: (type: 'assistant' | 'user', text: string) => void;
  processUserInput: (input: string) => Promise<AssistantResponse | null>;
  confirmPendingAction: () => Promise<ActionResult | null>;
  cancelPendingAction: () => void;
  setAgentStatus: (status: AgentExecutionStatus) => void;
  switchFlow: (flow: ConversationFlow) => void;
  advanceStep: () => void;
  spotlightTarget: string | null;
  setSpotlightTarget: (target: string | null) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  updateSessionData: (data: Record<string, any>) => void;
  toggleAssistant: () => void;
  startAssistant: () => void;
  closeAssistant: () => void;
  resetConversation: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const dyslexia = useDyslexia();
  const speechService = useRef(getSpeechService()).current;

  const [conversationManager] = useState(() => new ConversationManager('welcome'));
  const [conversationState, setConversationState] = useState<ConversationState>(conversationManager.getState());
  const [userProfile, setUserProfileState] = useState<Partial<UserProfile>>({ language: 'en' });
  const [isAutoStarted, setIsAutoStarted] = useState(false);
  const [spotlightTarget, setSpotlightTarget] = useState<string | null>(null);

  // Floating Window Persistent States
  const [isOpen, setIsOpen] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);

  // Agent dynamic execution states
  const [agentStatus, setAgentStatus] = useState<AgentExecutionStatus>('idle');
  const [currentActionName, setCurrentActionName] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  // ── 1. First Page Load Session Logic ────────────────────────────────────────
  useEffect(() => {
    try {
      const welcomed = sessionStorage.getItem('neurobridge.jarvis_session_welcomed');
      if (!welcomed) {
        sessionStorage.setItem('neurobridge.jarvis_session_welcomed', 'true');
        setIsOpen(true);
        setIsAutoStarted(true);
        const greeting = `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm JARVIS, your persistent website assistant. You can ask me to navigate, scroll, or adjust reading settings anytime.`;
        conversationManager.addMessage('assistant', greeting, userProfile.language || 'en');
        setConversationState(conversationManager.getState());
      }
    } catch {}
  }, [user?.name, userProfile.language, conversationManager]);

  // Initialize Agent Engine and Executor
  const agentEngine = useMemo(() => new JarvisAgentEngine(), []);
  const executor = useMemo(() => {
    return new JarvisExecutor({
      navigate,
      currentRoute: location.pathname,
      dyslexiaContext: {
        isDyslexiaMode: dyslexia.isDyslexiaMode,
        toggleDyslexiaMode: dyslexia.toggleDyslexiaMode,
        highContrast: dyslexia.highContrast,
        toggleHighContrast: () => dyslexia.setHighContrast(!dyslexia.highContrast),
        textSize: dyslexia.textSize,
        setTextSize: dyslexia.setTextSize,
      },
      authContext: {
        logout,
      },
      assistantContext: {
        closeAssistant: () => setIsOpen(false),
      },
    });
  }, [navigate, location.pathname, dyslexia, logout]);

  // Keep executor dependencies synchronized with current route and contexts
  useEffect(() => {
    executor.updateDependencies({
      navigate,
      currentRoute: location.pathname,
      dyslexiaContext: {
        isDyslexiaMode: dyslexia.isDyslexiaMode,
        toggleDyslexiaMode: dyslexia.toggleDyslexiaMode,
        highContrast: dyslexia.highContrast,
        toggleHighContrast: () => dyslexia.setHighContrast(!dyslexia.highContrast),
        textSize: dyslexia.textSize,
        setTextSize: dyslexia.setTextSize,
      },
      authContext: {
        logout,
      },
      assistantContext: {
        closeAssistant: () => setIsOpen(false),
      },
    });
  }, [executor, navigate, location.pathname, dyslexia, logout]);

  // Update conversation state helper
  const updateConversationState = useCallback(() => {
    setConversationState(conversationManager.getState());
  }, [conversationManager]);

  // Add message to conversation
  const addMessage = useCallback((type: 'assistant' | 'user', text: string) => {
    conversationManager.addMessage(type, text, userProfile.language || 'en');
    updateConversationState();
  }, [conversationManager, updateConversationState, userProfile.language]);

  /**
   * Main Unified Input Pipeline for Jarvis Web Agent (Voice & Text)
   * Pipeline: User Input -> Intent Analysis (Llama 3/NLP) -> Execution -> Verification -> Feedback
   */
  const processUserInput = useCallback(async (input: string): Promise<AssistantResponse | null> => {
    const cleanInput = input.trim();
    if (!cleanInput) return null;

    // Ensure floating window is open
    setIsOpen(true);

    // 1. Record User Message
    addMessage('user', cleanInput);

    // If awaiting confirmation and user answers yes/no
    if (pendingConfirmation) {
      const lower = cleanInput.toLowerCase();
      if (['yes', 'confirm', 'sure', 'do it', 'okay', 'yep', 'होय', 'हाँ'].some(w => lower.includes(w))) {
        setAgentStatus('executing');
        const res = await pendingConfirmation.onConfirm();
        setPendingConfirmation(null);
        setAgentStatus('success');
        setCurrentActionName(null);

        const responseText = res.message;
        addMessage('assistant', responseText);
        setTimeout(() => setAgentStatus('idle'), 2000);

        return {
          text: responseText,
          nextAction: 'wait',
        };
      } else if (['no', 'cancel', 'stop', 'nevermind', 'नाही', 'नहीं'].some(w => lower.includes(w))) {
        pendingConfirmation.onCancel();
        setPendingConfirmation(null);
        setAgentStatus('idle');
        setCurrentActionName(null);

        const cancelMsg = 'Action cancelled.';
        addMessage('assistant', cancelMsg);
        return {
          text: cancelMsg,
          nextAction: 'wait',
        };
      }
    }

    // 2. Set Status to Thinking
    setAgentStatus('thinking');
    setCurrentActionName(null);

    // 3. Build Context Payload for Llama 3
    const contextPayload = {
      currentRoute: location.pathname,
      pageTitle: getPageTitleForRoute(location.pathname),
      userName: user?.name || undefined,
      availableActions: [],
      recentHistory: conversationManager.getState().messages.slice(-6).map(m => ({
        role: m.type,
        content: m.text,
      })),
      language: userProfile.language || 'en',
    };

    // 4. Determine Intent with Llama 3 / Heuristic Engine
    let intent: StructuredIntent;
    try {
      intent = await agentEngine.processInput(cleanInput, contextPayload);
    } catch (e) {
      console.warn('[AssistantContext] Intent processing error, using fallback', e);
      intent = agentEngine.fallbackHeuristicIntent(cleanInput, contextPayload);
    }

    // 5. Handle Sensitive Action Confirmations
    if (intent.type === 'confirmation_required') {
      const confirmationResult = await executor.executeIntent(intent);
      setPendingConfirmation(executor.getPendingConfirmation());
      setAgentStatus('awaiting_confirmation');

      const promptText = confirmationResult.message;
      addMessage('assistant', promptText);

      return {
        text: promptText,
        nextAction: 'ask',
      };
    }

    // 6. Handle Direct Website Action Execution with Lifecycle & Verification
    if (intent.type === 'action' && intent.action) {
      setAgentStatus('executing');
      setCurrentActionName(intent.displayText || 'Executing action...');

      const actionResult = await executor.executeIntent(intent);

      const spokenFeedback = actionResult.spokenResponse || intent.spokenResponse || actionResult.message;
      const displayFeedback = actionResult.message;

      addMessage('assistant', displayFeedback);
      setAgentStatus(actionResult.success ? 'success' : 'error');

      setTimeout(() => {
        setAgentStatus('idle');
        setCurrentActionName(null);
      }, 2200);

      return {
        text: spokenFeedback,
        nextAction: 'wait',
      };
    }

    // 7. Handle Conversational Answer
    setAgentStatus('idle');
    const responseText = intent.displayText || intent.spokenResponse || "I'm ready to help you navigate NeuroBridge.";
    addMessage('assistant', responseText);

    return {
      text: responseText,
      nextAction: 'wait',
    };
  }, [addMessage, pendingConfirmation, location.pathname, user?.name, conversationManager, userProfile.language, agentEngine, executor]);

  // Confirm pending action helper
  const confirmPendingAction = useCallback(async (): Promise<ActionResult | null> => {
    if (!pendingConfirmation) return null;
    setAgentStatus('executing');
    const res = await pendingConfirmation.onConfirm();
    setPendingConfirmation(null);
    setAgentStatus('success');
    setCurrentActionName(null);

    addMessage('assistant', res.message);
    setTimeout(() => setAgentStatus('idle'), 2000);
    return res;
  }, [pendingConfirmation, addMessage]);

  // Cancel pending action helper
  const cancelPendingAction = useCallback(() => {
    if (pendingConfirmation) {
      pendingConfirmation.onCancel();
      setPendingConfirmation(null);
      setAgentStatus('idle');
      setCurrentActionName(null);
      addMessage('assistant', 'Action cancelled.');
    }
  }, [pendingConfirmation, addMessage]);

  const switchFlow = useCallback((flow: ConversationFlow) => {
    conversationManager.switchFlow(flow);
    updateConversationState();
  }, [conversationManager, updateConversationState]);

  const advanceStep = useCallback(() => {
    conversationManager.advanceStep();
    updateConversationState();
  }, [conversationManager, updateConversationState]);

  const setUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUserProfileState(prev => ({ ...prev, ...profile }));
  }, []);

  const updateSessionData = useCallback((data: Record<string, any>) => {
    conversationManager.updateSessionData(data);
    updateConversationState();
  }, [conversationManager, updateConversationState]);

  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const startAssistant = useCallback(() => {
    setIsOpen(true);
    setIsAutoStarted(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetConversation = useCallback(() => {
    conversationManager.resetSilence?.();
    setConversationState(conversationManager.getState());
  }, [conversationManager]);

  const setLanguage = useCallback((lang: Language) => {
    setUserProfileState(prev => ({ ...prev, language: lang }));
  }, []);

  const value: AssistantContextType = {
    isOpen,
    setIsOpen,
    isAssistantActive: isOpen,
    isAutoStarted,
    wakeWordEnabled,
    setWakeWordEnabled,
    conversationState,
    userProfile,
    agentStatus,
    currentActionName,
    pendingConfirmation,
    addMessage,
    processUserInput,
    confirmPendingAction,
    cancelPendingAction,
    setAgentStatus,
    switchFlow,
    advanceStep,
    setUserProfile,
    updateSessionData,
    toggleAssistant,
    startAssistant,
    closeAssistant,
    resetConversation,
    spotlightTarget,
    setSpotlightTarget,
    language: userProfile.language || 'en',
    setLanguage
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

// Hook to use Assistant Context
export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }
  return context;
}
