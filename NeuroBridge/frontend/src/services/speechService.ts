// Speech Service - Handles conversational TTS and dual-phase Voice Recognition (Wake Word + Command Recognition)

import type { Language, TextToSpeechOptions } from '../types/assistant';
import {
  getNaturalVoiceConfig,
  splitTextIntoSpeechSegments,
  getLoadedVoices,
  sleep,
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
    this.initRecognizers();
  }

  private initRecognizers() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.commandRecognition = new SpeechRecognition();
        this.commandRecognition.continuous = false;
        this.commandRecognition.interimResults = true;

        this.wakeWordRecognition = new SpeechRecognition();
        this.wakeWordRecognition.continuous = true;
        this.wakeWordRecognition.interimResults = true;
      } catch (e) {
        console.warn('[SpeechService] Recognition init error:', e);
      }
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
    const segments = splitTextIntoSpeechSegments(text, voiceLanguage);
    if (!segments.length) {
      this.isSpeakingActive = false;
      return;
    }

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

          let tonePitchMultiplier = 1.0;
          let toneRateMultiplier = 1.0;

          switch (segment.tone) {
            case 'celebrating':
              tonePitchMultiplier = 1.1;
              toneRateMultiplier = 1.05;
              break;
            case 'warning':
              tonePitchMultiplier = 0.95;
              toneRateMultiplier = 0.9;
              break;
            case 'encouraging':
              tonePitchMultiplier = 1.05;
              toneRateMultiplier = 1.02;
              break;
            case 'explaining':
              tonePitchMultiplier = 0.98;
              toneRateMultiplier = 0.92;
              break;
            default:
              break;
          }

          if (segment.isQuestion) {
            tonePitchMultiplier *= 1.06;
          }

          const finalPitch = Math.max(0.5, Math.min(2.0, config.pitch * tonePitchMultiplier));
          const finalRate = Math.max(0.5, Math.min(2.0, config.rate * toneRateMultiplier));

          utterance.rate = options.speed !== undefined ? options.speed : finalRate;
          utterance.pitch = options.pitch !== undefined ? options.pitch : finalPitch;
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

        if (i < segments.length - 1 && !this.cancelCurrentSpeech) {
          await sleep(segment.pauseAfterMs);
        }
      }
    } finally {
      this.isSpeakingActive = false;
    }
  }

  private wakeWordLocked: boolean = false;
  private lastWakeWordTime: number = 0;

  // ─── WAKE WORD LISTENING ("Hey Jarvis") ─────────────────────────────────────

  /**
   * Starts background listening specifically for the wake word "Hey Jarvis"
   */
  startWakeWordDetection(
    onWakeWord: () => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    if (!this.wakeWordRecognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isCommandListening || this.isSpeakingActive) {
      return;
    }

    this.isWakeWordListening = true;

    const languageMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.wakeWordRecognition.lang = languageMap[language] || 'en-US';

    this.wakeWordRecognition.onresult = (event: any) => {
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

        onWakeWord();
      }
    };

    this.wakeWordRecognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[WakeWord] Recognition error:', event.error);
      }
    };

    this.wakeWordRecognition.onend = () => {
      // Automatically restart wake-word listening if still active and not taking command
      if (this.isWakeWordListening && !this.isCommandListening && !this.wakeWordLocked) {
        if (this.wakeWordRestartTimer) clearTimeout(this.wakeWordRestartTimer);
        this.wakeWordRestartTimer = setTimeout(() => {
          if (this.isWakeWordListening && !this.isCommandListening && !this.wakeWordLocked) {
            try {
              this.wakeWordRecognition.start();
            } catch {}
          }
        }, 400);
      }
    };

    try {
      this.wakeWordRecognition.start();
    } catch {}
  }

  stopWakeWordDetection(): void {
    this.isWakeWordListening = false;
    if (this.wakeWordRestartTimer) clearTimeout(this.wakeWordRestartTimer);
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.onresult = null;
        this.wakeWordRecognition.stop();
      } catch {}
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

    if (!this.commandRecognition) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.isCommandListening = true;

    const languageMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.commandRecognition.lang = languageMap[language] || 'en-US';

    this.commandRecognition.onresult = (event: any) => {
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

    this.commandRecognition.onerror = (event: any) => {
      this.isCommandListening = false;
      onError(event.error || 'Speech recognition error');
    };

    this.commandRecognition.onend = () => {
      this.isCommandListening = false;
    };

    try {
      this.commandRecognition.start();
    } catch {}
  }

  stopCommandListening(): void {
    this.isCommandListening = false;
    if (this.commandRecognition) {
      try {
        this.commandRecognition.stop();
      } catch {}
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
