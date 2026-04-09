// AI Response Generator - Core logic for generating human-like responses

import type {
  Language,
  ConversationFlow,
  ConversationState,
  AssistantResponse,
  UserProfile
} from '../types/assistant';
import { getTemplate } from '../utils/assistantPrompts';

// ============================================================================
// RESPONSE GENERATOR ENGINE
// ============================================================================

export class AssistantResponseGenerator {
  private conversationState: ConversationState;
  private userProfile: Partial<UserProfile>;
  private language: Language;
  private externalApiUrl: string | null;

  constructor(initialState: ConversationState, profile: Partial<UserProfile>) {
    this.conversationState = initialState;
    this.userProfile = profile;
    this.language = profile.language || 'en';
    const url = (import.meta.env.VITE_ASSISTANT_API_URL as string | undefined)?.trim();
    this.externalApiUrl = url && url.length > 0 ? url : null;
  }

  updateContext(state: ConversationState, profile: Partial<UserProfile>) {
    this.conversationState = state;
    this.userProfile = profile;
    this.language = profile.language || this.language;
  }

  /**
   * Main method to generate an assistant response based on user input and context
   */
  async generateResponse(userInput: string): Promise<AssistantResponse> {
    // Detect if user needs help (asking for simplify, repeat, help, etc)
    const supportRequest = this.detectSupportRequest(userInput);
    if (supportRequest) {
      return this.handleSupportRequest(supportRequest);
    }
    
    // Detect if user is asking for a tour/features
    if (this.detectTourRequest(userInput)) {
      this.conversationState.currentFlow = 'website-guide';
      this.conversationState.stepIndex = 0;
      const response = await this.processFlowStep(userInput);
      return { ...response, nextFlow: 'website-guide' };
    }

    // Attempt dynamic AI response using Ollama
    const aiText = await this.fetchExternalAIResponse(userInput);
    if (aiText) {
      return {
        text: aiText,
        nextAction: 'wait'
      };
    }

    // Process based on current flow
    const response = await this.processFlowStep(userInput);
    return response;
  }

  /**
   * Process the current flow step and generate appropriate response
   */
  private async processFlowStep(userInput: string): Promise<AssistantResponse> {
    const { currentFlow, stepIndex, sessionData } = this.conversationState;
    const currentTemplate = getTemplate(currentFlow, stepIndex + 1);

    if (!currentTemplate) {
      // End of flow reached, suggest next action
      return this.handleFlowCompletion();
    }

    // Store user input in session data
    sessionData[`step_${stepIndex}_input`] = userInput;

    // Get the template for next step
    const templateText = currentTemplate.text[this.language];
    const responseText = this.interpolateTemplate(templateText, {
      ...sessionData,
      name: this.userProfile.name || 'friend'
    });

    return {
      text: responseText,
      nextAction: currentTemplate.waitForResponse ? 'wait' : 'ask',
      sessionData,
      spotlight: currentTemplate.spotlightTarget
    };
  }

  /**
   * Detect if user is asking for support (repeat, simplify, help, etc)
   */
  private detectSupportRequest(userInput: string): string | null {
    const normalizedInput = userInput.toLowerCase().trim();

    // Repeat request
    if (['repeat', 'again', 'say again', 'say that again', 'दुहराओ', 'फिर से', 'पुन्हा'].includes(normalizedInput)) {
      return 'repeat';
    }

    // Simplify request
    if (['simplify', 'simple', 'easy', 'समझ नहीं', 'सरल', 'सोपी'].includes(normalizedInput)) {
      return 'simplify';
    }

    // Help request
    if (['help', 'i need help', 'मदद', 'मदत'].includes(normalizedInput)) {
      return 'help';
    }

    // Confused
    if (['confused', 'what', 'huh', 'what?', 'i dont understand', 'समझ नहीं आया', 'काय'].includes(normalizedInput)) {
      return 'confused';
    }

    return null;
  }

  /**
   * Detect if user wants a tour or wants to know about features
   */
  private detectTourRequest(userInput: string): boolean {
    const text = userInput.toLowerCase();
    const tourKeywords = ['tour', 'features', 'feature', 'what do you do', 'what does this website do', 'explain', 'show me around', 'guide', 'सुविधाएँ', 'वैशिष्ट्ये'];
    return tourKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Handle support requests (repeat, simplify, help)
   */
  private handleSupportRequest(requestType: string): AssistantResponse {
    const lastMessage = this.conversationState.messages[this.conversationState.messages.length - 1]?.text || '';

    const responses: Record<string, Record<Language, string>> = {
      repeat: {
        en: "Of course! Let me say that again...\n\n" + lastMessage,
        hi: "बिल्कुल! मुझे फिर से कहने दीजिए...\n\n" + lastMessage,
        mr: "नक्की! मुझे पुन्हा सांगू दे...\n\n" + lastMessage
      },
      simplify: {
        en: "I get it, let me explain more simply...\n\nYou can tell me what you want to do, and I'll help step by step. No worries! 😊",
        hi: "मैं समझता हूँ, मुझे और सरलता से समझाने दीजिए...\n\nआप बता सकते हैं कि आप क्या करना चाहते हैं, मैं धीरे-धीरे मदद करूंगा। चिंता मत करो! 😊",
        mr: "मी समजतो, मुझे आणखी सरलरीत्या समजावून सांगू दे...\n\nतुम सांगू शकता काय करायचे आहे, मी धीरे-धीरे मदत करीन. चिंता करु नकोस! 😊"
      },
      help: {
        en: "I'm here for you! 💜\n\nWe can:\n1. Go back to start\n2. Try a different option\n3. Just chat\n\nWhat would help?",
        hi: "मैं आपके लिए यहाँ हूँ! 💜\n\nहम कर सकते हैं:\n1. शुरुआत में वापस जाएं\n2. एक अलग विकल्प आजमाएं\n3. बस बात करें\n\nकौन सा मदद करेगा?",
        mr: "मी तुम्हाला साठी येथे आहे! 💜\n\nआम करू शकतो:\n1. सुरुवातीस परत जा\n2. भिन्न पर्याय प्रयत्न करा\n3. फक्त बोला\n\nकौन मदत करेल?"
      },
      confused: {
        en: "No problem! That's okay. Let's take it one step at a time. What's confusing to you?",
        hi: "कोई समस्या नहीं! बिल्कुल ठीक है। चलिए एक बार में एक कदम सांभालते हैं। आपको क्या समझ नहीं आया?",
        mr: "काही समस्या नाही! ठीक आहे. आम एका वेळी एक पाऊल घेऊ. तुम्हाला काय समज नाही आले?"
      }
    };

    return {
      text: responses[requestType][this.language],
      nextAction: 'wait'
    };
  }

  /**
   * Handle when a flow is complete
   */
  private handleFlowCompletion(): AssistantResponse {
    const completionMessages: Record<Language, string> = {
      en: "Great! 🎉\n\nYou've completed this part. What would you like to do next?\n\n1. Continue\n2. Explore opportunities\n3. Take a break",
      hi: "बहुत अच्छा! 🎉\n\nआपने यह भाग पूरा कर लिया। आप आगे क्या करना चाहते हैं?\n\n1. जारी रखें\n2. अवसरों को देखें\n3. एक ब्रेक लें",
      mr: "खूप छान! 🎉\n\nतुम हा भाग पूर्ण केलेस. तुम पुढे काय करायचे आहे?\n\n1. जारी ठेवा\n2. संधी एक्सप्लोर करा\n3. विश्रांती घे"
    };

    return {
      text: completionMessages[this.language],
      nextFlow: 'general-help',
      nextAction: 'wait'
    };
  }

  private async fetchExternalAIResponse(userInput: string): Promise<string | null> {
    try {
      const systemPrompt = `You are Jarvis, a helpful AI assistant for NeuroBridge. 
NeuroBridge is a web platform that helps people with dyslexia find jobs, build skills, and connect with a community. 
The user is talking to you via a voice/text interface. Keep your answers CONCISE, friendly, and conversational (1-2 short sentences max). 
Language code requested: ${this.language}.`;

      const response = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3', // You can change this to any model you have installed like 'mistral' or 'phi'
          prompt: `${systemPrompt}\n\nUser: ${userInput}\nJarvis:`,
          stream: false
        })
      });

      if (!response.ok) {
        console.warn('Ollama request failed:', response.statusText);
        return null;
      }

      const data = await response.json();
      return typeof data.response === 'string' ? data.response : null;
    } catch (error) {
      console.warn('External AI request failed:', error);
      return null;
    }
  }

  /**
   * Template interpolation with context variables
   */
  private interpolateTemplate(template: string, context: Record<string, any>): string {
    let result = template;
    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });
    return result;
  }

  /**
   * Process text responses for profile building
   */
  processProfileResponse(userInput: string, field: string): Record<string, any> {
    const cleaned = userInput.trim();
    return {
      [field]: cleaned,
      confidence: this.calculateConfidence(cleaned)
    };
  }

  /**
   * Calculate confidence in user's response
   */
  private calculateConfidence(input: string): number {
    // Higher confidence if response is substantial
    if (input.length > 50) return 1.0;
    if (input.length > 20) return 0.8;
    if (input.length > 5) return 0.6;
    return 0.4;
  }

  /**
   * Detect confusion from silence or unclear responses
   */
  detectConfusion(silenceSeconds: number, lastInput?: string): boolean {
    if (silenceSeconds > 5) return true;
    if (!lastInput || lastInput.length < 2) return true;
    return false;
  }

  /**
   * Generate encouraging message if user is confused
   */
  getEncouragementMessage(): string {
    const messages = {
      en: [
        "Take your time, no rush... 😊",
        "We can do this together!",
        "Just tell me what's on your mind.",
        "There's no wrong answer here.",
        "I'm listening... 👂"
      ],
      hi: [
        "अपना समय लें, कोई जल्दबाजी नहीं... 😊",
        "हम यह एक साथ कर सकते हैं!",
        "बस मुझे बताएं क्या चल रहा है।",
        "यहाँ कोई गलत जवाब नहीं है।",
        "मैं सुन रहा हूँ... 👂"
      ],
      mr: [
        "तुमचा वेळ घे, काही जास्ती नाही... 😊",
        "आम हे एकेबरोबर करू शकतो!",
        "फक्त मुझे सांगा काय चल रहे आहे.",
        "येथे काहीही चुकीचे उत्तर नाही.",
        "मी ऐकत आहे... 👂"
      ]
    };

    const langMessages = messages[this.language] || messages.en;
    return langMessages[Math.floor(Math.random() * langMessages.length)];
  }
}

// ============================================================================
// CONVERSATION STATE MANAGER
// ============================================================================

export class ConversationManager {
  private state: ConversationState;

  constructor(initialFlow: ConversationFlow = 'welcome') {
    this.state = {
      currentFlow: initialFlow,
      stepIndex: 0,
      sessionData: {},
      messages: [],
      isListening: false,
      isSpeaking: false,
      silenceCount: 0
    };
  }

  getState(): ConversationState {
    return { ...this.state };
  }

  addMessage(type: 'assistant' | 'user', text: string, language: Language): void {
    this.state.messages.push({
      id: `msg_${Date.now()}_${Math.random()}`,
      type,
      text,
      timestamp: Date.now(),
      language
    });
  }

  advanceStep(): void {
    this.state.stepIndex += 1;
  }

  switchFlow(newFlow: ConversationFlow): void {
    this.state.currentFlow = newFlow;
    this.state.stepIndex = 0;
  }

  setListening(isListening: boolean): void {
    this.state.isListening = isListening;
  }

  setSpeaking(isSpeaking: boolean): void {
    this.state.isSpeaking = isSpeaking;
  }

  updateSessionData(data: Record<string, any>): void {
    this.state.sessionData = { ...this.state.sessionData, ...data };
  }

  recordSilence(): void {
    this.state.silenceCount += 1;
  }

  resetSilence(): void {
    this.state.silenceCount = 0;
  }

  getLastMessage(): string {
    const messages = this.state.messages.filter(m => m.type === 'assistant');
    return messages[messages.length - 1]?.text || '';
  }
}
