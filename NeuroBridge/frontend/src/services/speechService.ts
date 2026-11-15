// Speech Service - Handles conversational TTS and dual-phase Voice Recognition (Wake Word + Command Recognition)

import type { Language, TextToSpeechOptions } from '../types/assistant';
import {
  getNaturalVoiceConfig,
  splitTextIntoSpeechChunks,
  getLoadedVoices,
} from '../utils/naturalVoice';

export class SpeechService {
  private speechSynthesis: SpeechSynthesis;
  private commandRecognition: any = null;
  private wakeWordRecognition: any = null;
  private isCommandListening: boolean = false;
  private isWakeWordListening: boolean = false;
  private isSpeakingActive: boolean = false;
  private cancelCurrentSpeech: boolean = false;
  private wakeWordRestartTimer: any = null;

  constructor() {
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : ({} as SpeechSynthesis);
  }

  private createRecognizer(): any {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    try {
      return new SpeechRecognition();
    } catch (e) {
      console.warn('[SpeechService] Recognition creation error:', e);
      return null;
    }
  }

  /**
   * Text-to-speech - speaks with natural cadence and tone variation
   */
  async speak(
    text: string,
    options: Partial<TextToSpeechOptions> = {}
  ): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    await this.ensureVoicesLoaded();

    this.stopSpeaking();
    this.cancelCurrentSpeech = false;
    this.isSpeakingActive = true;

    const voiceLanguage = (options.language || 'en') as Language;
    // Speak in flowing chunks of a few sentences (see splitTextIntoSpeechChunks)
    const chunks = splitTextIntoSpeechChunks(text);
    if (!chunks.length) {
      this.isSpeakingActive = false;
      return;
    }

    const speedMultiplier = options.speed ?? 1.0;
    const config = getNaturalVoiceConfig(voiceLanguage, speedMultiplier);

    try {
      for (const chunk of chunks) {
        if (this.cancelCurrentSpeech) break;

        await new Promise<void>((resolve, reject) => {
          if (this.cancelCurrentSpeech) {
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = config.voice?.lang || config.lang;
          if (config.voice) {
            utterance.voice = config.voice;
          }
          // One steady pitch and pace: the voice adds its own natural expression
          utterance.rate = options.speed !== undefined ? options.speed : config.rate;
          utterance.pitch = options.pitch !== undefined ? options.pitch : config.pitch;
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
              console.warn('Speech synthesis error', event);
              reject(new Error(event.error || 'Speech synthesis error'));
            } else {
              resolve();
            }
          };

          this.speechSynthesis.speak(utterance);
        });
      }
    } finally {
      this.isSpeakingActive = false;
    }
  }

  private wakeWordLocked: boolean = false;
  private lastWakeWordTime: number = 0;
  private wakeWordCallback: (() => void) | null = null;
  private wakeWordErrorCallback: ((err: string) => void) | null = null;
  private wakeWordLanguage: Language = 'en';

  // ─── WAKE WORD LISTENING ("Hey Jarvis") ─────────────────────────────────────

  private startWakeWordInstance(): void {
    if (!this.isWakeWordListening || this.isCommandListening || this.wakeWordLocked || this.isSpeakingActive) {
      return;
    }

    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.onresult = null;
        this.wakeWordRecognition.onerror = null;
        this.wakeWordRecognition.onend = null;
        this.wakeWordRecognition.abort();
      } catch {}
      this.wakeWordRecognition = null;
    }

    const rec = this.createRecognizer();
    if (!rec) {
      if (this.wakeWordErrorCallback) {
        this.wakeWordErrorCallback('Speech recognition is not supported in this browser.');
      }
      return;
    }

    this.wakeWordRecognition = rec;

    const languageMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = languageMap[this.wakeWordLanguage] || 'en-US';

    rec.onresult = (event: any) => {
      // Cooldown check (prevent repeated triggers within 4 seconds)
      if (this.wakeWordLocked || Date.now() - this.lastWakeWordTime < 4000) {
        return;
      }

      let combinedTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        combinedTranscript += event.results[i][0].transcript + ' ';
      }

      const lower = combinedTranscript.toLowerCase().trim();
      const wakeWords = ['hey jarvis', 'jarvis', 'ok jarvis', 'okay jarvis', 'हे जार्विस', 'जार्विस', 'हाय जार्विस', 'जार्व्हिस'];

      if (wakeWords.some((w) => lower.includes(w))) {
        this.wakeWordLocked = true;
        this.lastWakeWordTime = Date.now();

        // Immediately stop and clear listener to discard remaining interim results
        this.stopWakeWordDetection();

        // Unlock after cooldown
        setTimeout(() => {
          this.wakeWordLocked = false;
        }, 4000);

        if (this.wakeWordCallback) {
          this.wakeWordCallback();
        }
      }
    };

    rec.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[WakeWord] Recognition error:', event.error);
        if (event.error === 'network') this.stopWakeWordDetection();
      }
    };

    rec.onend = () => {
      // Automatically restart wake-word listening with a fresh instance
      if (this.isWakeWordListening && !this.isCommandListening && !this.wakeWordLocked) {
        if (this.wakeWordRestartTimer) clearTimeout(this.wakeWordRestartTimer);
        this.wakeWordRestartTimer = setTimeout(() => {
          this.startWakeWordInstance();
        }, 400);
      }
    };

    try {
      rec.start();
    } catch (e) {
      console.warn('[SpeechService] Wake word start error:', e);
    }
  }

  /**
   * Starts background listening specifically for the wake word "Hey Jarvis"
   */
  startWakeWordDetection(
    onWakeWord: () => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    if (this.isCommandListening || this.isSpeakingActive) {
      return;
    }

    this.isWakeWordListening = true;
    this.wakeWordCallback = onWakeWord;
    this.wakeWordErrorCallback = onError;
    this.wakeWordLanguage = language;

    this.startWakeWordInstance();
  }

  stopWakeWordDetection(): void {
    this.isWakeWordListening = false;
    if (this.wakeWordRestartTimer) clearTimeout(this.wakeWordRestartTimer);
    this.wakeWordRestartTimer = null;
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.onresult = null;
        this.wakeWordRecognition.onerror = null;
        this.wakeWordRecognition.onend = null;
        this.wakeWordRecognition.abort();
      } catch {}
      this.wakeWordRecognition = null;
    }
  }

  // ─── COMMAND LISTENING ──────────────────────────────────────────────────────

  /**
   * Starts active command listening after user clicks microphone or wake word triggers
   */
  startCommandListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    // Suspend wake word listener while taking active command
    this.stopWakeWordDetection();

    // Clean up any existing command recognition
    if (this.commandRecognition) {
      try {
        this.commandRecognition.onresult = null;
        this.commandRecognition.onerror = null;
        this.commandRecognition.onend = null;
        this.commandRecognition.abort();
      } catch {}
      this.commandRecognition = null;
    }

    const rec = this.createRecognizer();
    if (!rec) {
      this.isCommandListening = false;
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.commandRecognition = rec;
    this.isCommandListening = true;

    const languageMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    rec.lang = languageMap[language] || 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
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

    rec.onerror = (event: any) => {
      this.isCommandListening = false;
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError(event.error || 'Speech recognition error');
      } else if (event.error === 'no-speech') {
        onError('no-speech');
      }
    };

    rec.onend = () => {
      this.isCommandListening = false;
    };

    try {
      rec.start();
    } catch (error: any) {
      this.isCommandListening = false;
      onError(error?.name || 'Speech recognition could not start');
    }
  }

  stopCommandListening(): void {
    this.isCommandListening = false;
    if (this.commandRecognition) {
      try {
        this.commandRecognition.onresult = null;
        this.commandRecognition.onerror = null;
        this.commandRecognition.onend = null;
        this.commandRecognition.abort();
      } catch {}
      this.commandRecognition = null;
    }
  }

  // Alias for backward compatibility
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    this.startCommandListening(onResult, onError, language);
  }

  stopListening(): void {
    this.stopCommandListening();
  }

  getIsListening(): boolean {
    return this.isCommandListening;
  }

  getIsWakeWordListening(): boolean {
    return this.isWakeWordListening;
  }

  stopSpeaking(): void {
    this.cancelCurrentSpeech = true;
    this.isSpeakingActive = false;
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

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

  pause(): void {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
    }
  }

  resume(): void {
    if (this.speechSynthesis && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
  }
}

// Singleton instance
let speechServiceInstance: SpeechService | null = null;

export function getSpeechService(): SpeechService {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService();
  }
  return speechServiceInstance;
}
