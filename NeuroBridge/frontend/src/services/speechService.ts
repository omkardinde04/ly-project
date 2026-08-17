// Speech Service - Handles human-like conversational text-to-speech with Siri-style sentence halts and natural turn-taking

import type { Language, TextToSpeechOptions } from '../types/assistant';
import {
  getNaturalVoiceConfig,
  splitTextIntoSpeechSegments,
  getLoadedVoices,
  sleep,
} from '../utils/naturalVoice';

export class SpeechService {
  private speechSynthesis: SpeechSynthesis;
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeakingActive: boolean = false;
  private cancelCurrentSpeech: boolean = false;

  constructor() {
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : ({} as SpeechSynthesis);

    // Initialize speech recognition if available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
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
   * Text-to-speech - speak assistant message with Siri-style natural cadence and sentence-level breath pauses
   */
  async speak(
    text: string,
    options: Partial<TextToSpeechOptions> = {}
  ): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    await this.ensureVoicesLoaded();

    // Cancel any ongoing speech
    this.stopSpeaking();
    this.cancelCurrentSpeech = false;
    this.isSpeakingActive = true;

    const segments = splitTextIntoSpeechSegments(text);
    if (!segments.length) {
      this.isSpeakingActive = false;
      return;
    }

    const voiceLanguage = (options.language || 'en') as Language;
    const speedMultiplier = options.speed ?? 1.0;
    const config = getNaturalVoiceConfig(voiceLanguage, speedMultiplier);

    try {
      for (let i = 0; i < segments.length; i++) {
        if (this.cancelCurrentSpeech) break;

        const segment = segments[i];

        await new Promise<void>((resolve, reject) => {
          if (this.cancelCurrentSpeech) {
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(segment.text);
          utterance.lang = config.lang;
          if (config.voice) {
            utterance.voice = config.voice;
          }

          // Slightly rise pitch for questions, normal warm pitch for statements
          const segmentPitch = segment.isQuestion ? config.pitch * 1.04 : config.pitch;
          utterance.rate = options.speed !== undefined ? options.speed : config.rate;
          utterance.pitch = options.pitch !== undefined ? options.pitch : segmentPitch;
          utterance.volume = options.volume !== undefined ? options.volume : config.volume;

          utterance.onstart = () => {
            if (this.speechSynthesis.paused) {
              this.speechSynthesis.resume();
            }
          };

          utterance.onend = () => {
            resolve();
          };

          utterance.onerror = (event: any) => {
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
              console.warn('Speech synthesis segment error', event);
              reject(new Error(event.error || 'Speech synthesis error'));
            } else {
              resolve();
            }
          };

          this.speechSynthesis.speak(utterance);
        });

        // Natural breath pause / halt after each sentence (Siri style), unless it was the last sentence
        if (i < segments.length - 1 && !this.cancelCurrentSpeech) {
          await sleep(segment.pauseAfterMs);
        }
      }
    } finally {
      this.isSpeakingActive = false;
    }
  }

  /**
   * Start listening for user input with a natural turn-taking delay
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

    const languageMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.recognition.lang = languageMap[language] || 'en-US';

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

    this.recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

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
    this.cancelCurrentSpeech = true;
    this.isSpeakingActive = false;
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeakingActive || (this.speechSynthesis ? this.speechSynthesis.speaking : false);
  }

  private async ensureVoicesLoaded(): Promise<void> {
    const loaded = getLoadedVoices();
    if (loaded.length > 0) return;

    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 300);
      const checkVoices = () => {
        const v = getLoadedVoices();
        if (v.length > 0) {
          window.clearTimeout(timeout);
          resolve();
        }
      };
      window.addEventListener('voiceschanged', checkVoices, { once: true });
    });
  }

  /**
   * Get available voices for a language
   */
  getVoicesForLanguage(language: Language = 'en'): SpeechSynthesisVoice[] {
    const voices = getLoadedVoices();
    const languageMap: Record<Language, string> = {
      en: 'en',
      hi: 'hi',
      mr: 'mr',
    };
    const lang = languageMap[language];
    return voices.filter((v) => v.lang.toLowerCase().includes(lang));
  }

  /**
   * Pause synthesis
   */
  pause(): void {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
    }
  }

  /**
   * Resume synthesis
   */
  resume(): void {
    if (this.speechSynthesis && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
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
