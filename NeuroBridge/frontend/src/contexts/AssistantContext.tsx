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
import { getSpeechService, type JarvisVoiceState } from '../services/speechService';
import { useAuth } from './AuthContext';
import { useDyslexia } from './DyslexiaContext';
import { useSpotlightReader } from './SpotlightReaderContext';
import { extractCleanPageText, getSelectedPageText } from '../services/pageContentExtractor';

interface AssistantContextType {
  // Floating Window & Session States
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isAssistantActive: boolean;
  isAutoStarted: boolean;
  wakeWordEnabled: boolean;
  setWakeWordEnabled: (enabled: boolean) => void;
  
  // Voice State Machine & Live Transcripts
  voiceState: JarvisVoiceState;
  liveTranscript: string;
  setLiveTranscript: (text: string) => void;
  streamingText: string;
  interrupt: () => void;

  // Agent Execution & Status States
  conversationState: ConversationState;
  userProfile: Partial<UserProfile>;
  agentStatus: AgentExecutionStatus;
  currentActionName: string | null;
  pendingConfirmation: PendingConfirmation | null;

  // Page Reading Controls
  isReadingPage: boolean;
  startPageReading: () => void;
  pauseReading: () => void;
  resumeReading: () => void;
  stopReading: () => void;

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
  const spotlightReader = useSpotlightReader();
  const speechService = useRef(getSpeechService()).current;

  const [conversationManager] = useState(() => new ConversationManager('welcome'));
  const [conversationState, setConversationState] = useState<ConversationState>(conversationManager.getState());
  const [userProfile, setUserProfileState] = useState<Partial<UserProfile>>({ language: 'en' });
  const [isAutoStarted, setIsAutoStarted] = useState(false);
  const [spotlightTarget, setSpotlightTarget] = useState<string | null>(null);

  // Floating Window Persistent States
  const [isOpen, setIsOpen] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

  // Voice State Machine & Streaming States
  const [voiceState, setVoiceState] = useState<JarvisVoiceState>('IDLE');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [streamingText, setStreamingText] = useState<string>('');
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Subscribe to Master Voice State Machine
  useEffect(() => {
    const unsubscribe = speechService.onStateChange((nextState) => {
      setVoiceState(nextState);
    });
    return () => unsubscribe();
  }, [speechService]);

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
        const firstName = user?.name ? user.name.split(' ')[0] : 'there';
        const greeting = `Hi ${firstName}! I'm JARVIS. I can read pages out loud with word highlighting, summarize articles, navigate anywhere, or answer your questions. Tap the microphone or type below to talk to me.`;
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
        // Dark mode
        isDarkMode: dyslexia.isDarkMode,
        toggleDarkMode: dyslexia.toggleDarkMode,
        setDarkMode: (enabled: boolean) => {
          if (enabled !== dyslexia.isDarkMode) dyslexia.toggleDarkMode();
        },
        // Fun mode
        isDyslexiaMode: dyslexia.isDyslexiaMode,
        toggleDyslexiaMode: dyslexia.toggleDyslexiaMode,
        enableFunMode: dyslexia.enableFunMode,
        disableFunMode: () => { if (dyslexia.isDyslexiaMode) dyslexia.toggleDyslexiaMode(); },
        // Fun font
        funFont: dyslexia.funFont,
        setFunFont: dyslexia.setFunFont,
        // Line spacing
        funLineHeight: dyslexia.funLineHeight,
        setFunLineHeight: dyslexia.setFunLineHeight,
        // Font weight
        funWeight: dyslexia.funWeight,
        setFunWeight: dyslexia.setFunWeight,
        // Letter spacing
        funLetterSpacing: dyslexia.funLetterSpacing,
        setFunLetterSpacing: dyslexia.setFunLetterSpacing,
        // Reset
        resetFunSettings: dyslexia.resetFunSettings,
        // High contrast
        highContrast: dyslexia.highContrast,
        setHighContrast: dyslexia.setHighContrast,
        // Text size
        textSize: dyslexia.textSize,
        setTextSize: dyslexia.setTextSize,
        // Motion
        reduceMotion: dyslexia.reduceMotion,
        setReduceMotion: dyslexia.setReduceMotion,
      },
      authContext: {
        logout,
      },
      assistantContext: {
        closeAssistant: () => setIsOpen(false),
      },
      spotlightReaderContext: {
        isActive: spotlightReader.isActive,
        isPlaying: spotlightReader.isPlaying,
        isPaused: spotlightReader.isPaused,
        startPageReading: spotlightReader.startPageReading,
        startTextReading: spotlightReader.startTextReading,
        pauseReading: spotlightReader.pauseReading,
        resumeReading: spotlightReader.resumeReading,
        stopReading: spotlightReader.stopReading,
        restartReading: spotlightReader.restartReading,
        nextWord: spotlightReader.nextWord,
        prevWord: spotlightReader.prevWord,
        nextParagraph: spotlightReader.nextParagraph,
        prevParagraph: spotlightReader.prevParagraph,
        setSpeed: spotlightReader.setSpeed,
        speed: spotlightReader.speed,
      },
    });
  }, [navigate, location.pathname, dyslexia, logout, spotlightReader]);

  // Keep executor dependencies synchronized with current route and contexts
  useEffect(() => {
    executor.updateDependencies({
      navigate,
      currentRoute: location.pathname,
      dyslexiaContext: {
        // Dark mode
        isDarkMode: dyslexia.isDarkMode,
        toggleDarkMode: dyslexia.toggleDarkMode,
        setDarkMode: (enabled: boolean) => {
          if (enabled !== dyslexia.isDarkMode) dyslexia.toggleDarkMode();
        },
        // Fun mode
        isDyslexiaMode: dyslexia.isDyslexiaMode,
        toggleDyslexiaMode: dyslexia.toggleDyslexiaMode,
        enableFunMode: dyslexia.enableFunMode,
        disableFunMode: () => { if (dyslexia.isDyslexiaMode) dyslexia.toggleDyslexiaMode(); },
        // Fun font
        funFont: dyslexia.funFont,
        setFunFont: dyslexia.setFunFont,
        // Line spacing
        funLineHeight: dyslexia.funLineHeight,
        setFunLineHeight: dyslexia.setFunLineHeight,
        // Font weight
        funWeight: dyslexia.funWeight,
        setFunWeight: dyslexia.setFunWeight,
        // Letter spacing
        funLetterSpacing: dyslexia.funLetterSpacing,
        setFunLetterSpacing: dyslexia.setFunLetterSpacing,
        // Reset
        resetFunSettings: dyslexia.resetFunSettings,
        // High contrast
        highContrast: dyslexia.highContrast,
        setHighContrast: dyslexia.setHighContrast,
        // Text size
        textSize: dyslexia.textSize,
        setTextSize: dyslexia.setTextSize,
        // Motion
        reduceMotion: dyslexia.reduceMotion,
        setReduceMotion: dyslexia.setReduceMotion,
      },
      authContext: {
        logout,
      },
      assistantContext: {
        closeAssistant: () => setIsOpen(false),
      },
      spotlightReaderContext: {
        isActive: spotlightReader.isActive,
        isPlaying: spotlightReader.isPlaying,
        isPaused: spotlightReader.isPaused,
        startPageReading: spotlightReader.startPageReading,
        startTextReading: spotlightReader.startTextReading,
        pauseReading: spotlightReader.pauseReading,
        resumeReading: spotlightReader.resumeReading,
        stopReading: spotlightReader.stopReading,
        restartReading: spotlightReader.restartReading,
        nextWord: spotlightReader.nextWord,
        prevWord: spotlightReader.prevWord,
        nextParagraph: spotlightReader.nextParagraph,
        prevParagraph: spotlightReader.prevParagraph,
        setSpeed: spotlightReader.setSpeed,
        speed: spotlightReader.speed,
      },
    });
  }, [executor, navigate, location.pathname, dyslexia, logout, spotlightReader]);

  // Update conversation state helper
  const updateConversationState = useCallback(() => {
    setConversationState(conversationManager.getState());
  }, [conversationManager]);

  // Add message to conversation
  const addMessage = useCallback((type: 'assistant' | 'user', text: string) => {
    conversationManager.addMessage(type, text, userProfile.language || 'en');
    updateConversationState();
  }, [conversationManager, updateConversationState, userProfile.language]);

  // Interrupt active speech and AI stream
  const interrupt = useCallback(() => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
      activeAbortControllerRef.current = null;
    }
    speechService.interrupt();
    setStreamingText('');
    setAgentStatus('idle');
  }, [speechService]);

  /**
   * Main Unified Input Pipeline for Jarvis Web Agent (Voice & Text)
   * Pipeline: User Input -> Real-time Streaming Intent (SSE) -> Word-by-Word Display -> Sentence TTS -> Execution -> Feedback
   */
  const processUserInput = useCallback(async (input: string): Promise<AssistantResponse | null> => {
    const cleanInput = input.trim();
    if (!cleanInput) return null;

    // Ensure floating window is open
    setIsOpen(true);

    // Cancel any previous in-flight AI stream
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;
    speechService.setAbortController(abortController);

    // 1. Record User Message
    addMessage('user', cleanInput);
    setLiveTranscript('');
    setStreamingText('');

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

    // 3. Build Context Payload for Siri-like Engine
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
      pageContent: extractCleanPageText(1200),
      selectedText: getSelectedPageText(),
    };

    // 4. Initialize assistant placeholder message for live progressive streaming
    let hasCreatedAssistantBubble = false;

    // 5. Stream Intent & Response from LLM
    let intent: StructuredIntent;
    try {
      intent = await agentEngine.processInputStream(cleanInput, contextPayload, {
        signal: abortController.signal,
        onChunk: (_token, accumulated) => {
          setStreamingText(accumulated);
          if (!hasCreatedAssistantBubble) {
            hasCreatedAssistantBubble = true;
            addMessage('assistant', accumulated);
          } else {
            conversationManager.updateLastMessage(accumulated);
            updateConversationState();
          }
        },
        onSentence: (sentence) => {
          // Immediately speak sentence while subsequent response continues streaming!
          speechService.enqueueSentenceToSpeak(sentence, {
            language: userProfile.language || 'en',
          });
        },
        onReset: (reason?: string) => {
          console.warn('[AssistantContext] AI Provider fallback reset triggered:', reason);
          speechService.interrupt();
          setStreamingText('');
          if (hasCreatedAssistantBubble) {
            conversationManager.updateLastMessage('');
            updateConversationState();
          }
        },
      });
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return null;
      }
      console.warn('[AssistantContext] Intent processing error, using fallback', e);
      intent = agentEngine.fallbackHeuristicIntent(cleanInput, contextPayload);
    } finally {
      activeAbortControllerRef.current = null;
      speechService.setAbortController(null);
      setStreamingText('');
    }

    if (!intent) return null;

    // 6. Handle Sensitive Action Confirmations
    if (intent.type === 'confirmation_required') {
      const confirmationResult = await executor.executeIntent(intent);
      setPendingConfirmation(executor.getPendingConfirmation());
      setAgentStatus('awaiting_confirmation');

      const promptText = confirmationResult.message;
      if (!hasCreatedAssistantBubble) {
        addMessage('assistant', promptText);
      } else {
        conversationManager.updateLastMessage(promptText);
        updateConversationState();
      }

      return {
        text: promptText,
        nextAction: 'ask',
      };
    }

    // 7. Handle Direct Website Action Execution with Lifecycle & Verification
    if (intent.type === 'action' && intent.action) {
      setAgentStatus('executing');
      setCurrentActionName(intent.displayText || 'Executing action...');

      // Prevent audio clobbering: If starting page reading, immediately interrupt assistant voice
      if (intent.action === 'read_page') {
        speechService.interrupt();
      }

      const actionResult = await executor.executeIntent(intent);

      const spokenFeedback = actionResult.spokenResponse || intent.spokenResponse || actionResult.message;
      const displayFeedback = actionResult.message;

      if (!hasCreatedAssistantBubble) {
        addMessage('assistant', displayFeedback);
      } else {
        conversationManager.updateLastMessage(displayFeedback);
        updateConversationState();
      }

      setAgentStatus(actionResult.success ? 'success' : 'error');

      // Only speak action feedback if NOT reading the page (page reader speaks the content directly)
      if (intent.action !== 'read_page' && actionResult.success && actionResult.spokenResponse) {
        speechService.enqueueSentenceToSpeak(actionResult.spokenResponse, {
          language: userProfile.language || 'en',
        });
      }

      setTimeout(() => {
        setAgentStatus('idle');
        setCurrentActionName(null);
      }, 2200);

      return {
        text: spokenFeedback,
        nextAction: 'wait',
      };
    }

    // 8. Handle Conversational Answer
    setAgentStatus('idle');
    const responseText = intent.displayText || intent.spokenResponse || "I'm ready to help you navigate NeuroBridge.";
    if (!hasCreatedAssistantBubble) {
      addMessage('assistant', responseText);
    } else {
      conversationManager.updateLastMessage(responseText);
      updateConversationState();
    }

    return {
      text: responseText,
      nextAction: 'wait',
    };
  }, [addMessage, pendingConfirmation, location.pathname, user?.name, conversationManager, userProfile.language, agentEngine, executor, updateConversationState, speechService]);

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
    voiceState,
    liveTranscript,
    setLiveTranscript,
    streamingText,
    interrupt,
    conversationState,
    userProfile,
    agentStatus,
    currentActionName,
    pendingConfirmation,
    isReadingPage: spotlightReader.isPlaying,
    startPageReading: () => spotlightReader.startPageReading(),
    pauseReading: () => spotlightReader.pauseReading(),
    resumeReading: () => spotlightReader.resumeReading(),
    stopReading: () => spotlightReader.stopReading(),
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
