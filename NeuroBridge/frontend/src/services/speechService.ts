// Speech Service - Handles text-to-speech and speech recognition

import type { Language, TextToSpeechOptions } from '../types/assistant';

export class SpeechService {
  private speechSynthesis: SpeechSynthesis;
  private recognition: any = null;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.loadVoices();
    if (this.speechSynthesis) {
      this.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
    
    // Initialize speech recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private loadVoices() {
    if (this.speechSynthesis) {
      this.voices = this.speechSynthesis.getVoices();
    }
  }

  /**
   * Setup speech recognition with default settings
   */
  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  /**
   * Text-to-speech - speak assistant message
   */
  async speak(
    text: string,
    options: Partial<TextToSpeechOptions> = {}
  ): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    await this.ensureVoicesLoaded();

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language
      const languageMap: Record<Language, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        mr: 'mr-IN'
      };
      const voiceLanguage = options.language || 'en';
      utterance.lang = languageMap[voiceLanguage as Language] || 'en-US';

      // Choose the most natural available voice for the language
      const preferredVoice = this.chooseNaturalVoice(voiceLanguage as Language);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Set voice properties for a more natural tone
      utterance.rate = options.speed ?? 0.92;
      utterance.pitch = options.pitch ?? 0.9;
      utterance.volume = options.volume ?? 1.0;

      // Handle start and completion
      utterance.onstart = () => {
        if (this.speechSynthesis.paused) {
          this.speechSynthesis.resume();
        }
      };

      utterance.onend = () => resolve();
      utterance.onerror = (event: any) => {
        console.warn('Speech synthesis error', event);
        reject(new Error(event.error || 'Speech synthesis error'));
      };

      this.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Start listening for user input
   */
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    this.isListening = true;

    // Set language
    const languageMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN'
    };
    this.recognition.lang = languageMap[language] || 'en-US';

    // Handle results
    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error');
    };

    // Handle end
    this.recognition.onend = () => {
      this.isListening = false;
    };

    // Start listening
    this.recognition.start();
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    this.speechSynthesis.cancel();
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.speechSynthesis.speaking;
  }

  private async ensureVoicesLoaded(): Promise<void> {
    if (this.voices.length > 0) {
      return;
    }

    this.loadVoices();
    if (this.voices.length > 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 300);
      const checkVoices = () => {
        this.loadVoices();
        if (this.voices.length > 0) {
          window.clearTimeout(timeout);
          resolve();
        }
      };
      window.addEventListener('voiceschanged', checkVoices, { once: true });
    });
  }

  private chooseNaturalVoice(language: Language): SpeechSynthesisVoice | null {
    if (!this.voices.length) {
      this.loadVoices();
    }

    const preferences: Record<Language, string[]> = {
      en: [
        'Google UK English Female',
        'Google US English',
        'Samantha',
        'Alloy',
        'Alex',
        'Daniel',
        'Karen',
        'Microsoft Zira',
        'Microsoft David'
      ],
      hi: [
        'Google हिन्दी',
        'Google Hindi',
        'Microsoft Kalpana',
        'Hindi'
      ],
      mr: [
        'Google मराठी',
        'Google Marathi',
        'Microsoft Marathi',
        'Marathi'
      ]
    };

    const candidates = this.voices.filter((voice) => {
      const langMatch = voice.lang.toLowerCase().includes(language);
      return langMatch;
    });

    const preferredNames = preferences[language] || preferences.en;
    for (const preferred of preferredNames) {
      const match = candidates.find((voice) => voice.name.includes(preferred) || voice.voiceURI.includes(preferred));
      if (match) return match;
    }

    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Get available voices for a language
   */
  getVoicesForLanguage(language: Language = 'en'): SpeechSynthesisVoice[] {
    if (!this.voices.length) {
      this.loadVoices();
    }

    const languageMap: Record<Language, string> = {
      en: 'en',
      hi: 'hi',
      mr: 'mr'
    };
    const lang = languageMap[language];
    return this.voices.filter(v => v.lang.toLowerCase().includes(lang));
  }

  /**
   * Pause synthesis
   */
  pause(): void {
    if (this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    } else {
      this.speechSynthesis.pause();
    }
  }

  /**
   * Resume synthesis
   */
  resume(): void {
    this.speechSynthesis.resume();
  }
}

// Singleton instance
let speechServiceInstance: SpeechService | null = null;

/**
 * Get or create speech service instance
 */
export function getSpeechService(): SpeechService {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService();
  }
  return speechServiceInstance;
}
