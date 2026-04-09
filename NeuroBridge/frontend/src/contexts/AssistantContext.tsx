// Assistant Context - Global state management for the AI Assistant

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Language,
  ConversationFlow,
  ConversationState,
  UserProfile,
  AssistantResponse
} from '../types/assistant';
import { ConversationManager, AssistantResponseGenerator } from '../services/assistantEngine';

interface AssistantContextType {
  // State
  conversationState: ConversationState;
  userProfile: Partial<UserProfile>;
  isAssistantActive: boolean;
  isAutoStarted: boolean;

  // Actions
  addMessage: (type: 'assistant' | 'user', text: string) => void;
  processUserInput: (input: string) => Promise<AssistantResponse | null>;
  switchFlow: (flow: ConversationFlow) => void;
  advanceStep: () => void;
  spotlightTarget: string | null;
  setSpotlightTarget: (target: string | null) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  updateSessionData: (data: Record<string, any>) => void;
  toggleAssistant: () => void;
  startAssistant: () => void;
  resetConversation: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [conversationManager] = useState(() => new ConversationManager('welcome'));
  const [conversationState, setConversationState] = useState<ConversationState>(conversationManager.getState());
  const [userProfile, setUserProfileState] = useState<Partial<UserProfile>>({ language: 'en' });
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [isAutoStarted, setIsAutoStarted] = useState(false);
  const [spotlightTarget, setSpotlightTarget] = useState<string | null>(null);
  const [responseGenerator] = useState(() =>
    new AssistantResponseGenerator(conversationState, userProfile)
  );

  // Update conversation state when manager changes
  const updateConversationState = useCallback(() => {
    setConversationState(conversationManager.getState());
  }, [conversationManager]);

  // Add message to conversation
  const addMessage = useCallback((type: 'assistant' | 'user', text: string) => {
    conversationManager.addMessage(type, text, userProfile.language || 'en');
    updateConversationState();
  }, [conversationManager, updateConversationState, userProfile.language]);

  // Process user input
  const processUserInput = useCallback(async (input: string): Promise<AssistantResponse | null> => {
    // Add user message
    addMessage('user', input);

    // Ensure the generator has the latest state and profile before generating
    responseGenerator.updateContext(conversationManager.getState(), userProfile);

    // Generate response
    const response = await responseGenerator.generateResponse(input);

    if (response) {
      // Add assistant response
      addMessage('assistant', response.text);

      // Update session data if provided
      if (response.sessionData) {
        conversationManager.updateSessionData(response.sessionData);
      }

      // Advance step
      if (response.nextAction === 'wait') {
        conversationManager.advanceStep();
      }

      if (response.spotlight) {
        setSpotlightTarget(response.spotlight);
        if (response.spotlight === 'none') setSpotlightTarget(null);
      } else {
        setSpotlightTarget(null);
      }

      // Switch flow if needed
      if (response.nextFlow) {
        conversationManager.switchFlow(response.nextFlow);
      }

      updateConversationState();
    }

    return response;
  }, [addMessage, responseGenerator, conversationManager, updateConversationState, userProfile]);

  // Switch to different flow
  const switchFlow = useCallback((flow: ConversationFlow) => {
    conversationManager.switchFlow(flow);
    updateConversationState();
  }, [conversationManager, updateConversationState]);

  // Advance to next step
  const advanceStep = useCallback(() => {
    conversationManager.advanceStep();
    updateConversationState();
  }, [conversationManager, updateConversationState]);

  // Update user profile
  const setUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUserProfileState(prev => ({ ...prev, ...profile }));
  }, []);

  // Update session data
  const updateSessionData = useCallback((data: Record<string, any>) => {
    conversationManager.updateSessionData(data);
    updateConversationState();
  }, [conversationManager, updateConversationState]);

  // Toggle assistant visibility
  const toggleAssistant = useCallback(() => {
    setIsAssistantActive(prev => !prev);
  }, []);

  // Start assistant (auto-start)
  const startAssistant = useCallback(() => {
    setIsAssistantActive(true);
    setIsAutoStarted(true);
  }, []);

  // Reset conversation
  const resetConversation = useCallback(() => {
    conversationManager.resetSilence?.();
    setConversationState(conversationManager.getState());
  }, [conversationManager]);

  // Set language
  const setLanguage = useCallback((lang: Language) => {
    setUserProfileState(prev => ({ ...prev, language: lang }));
  }, []);

  const value: AssistantContextType = {
    conversationState,
    userProfile,
    isAssistantActive,
    isAutoStarted,
    addMessage,
    processUserInput,
    switchFlow,
    advanceStep,
    setUserProfile,
    updateSessionData,
    toggleAssistant,
    startAssistant,
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
