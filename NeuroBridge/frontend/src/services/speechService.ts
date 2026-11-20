// Speech Service - State-of-the-Art Voice Architecture & Speech Pipeline
// Features: Unified Voice State Machine, Fast Audio Chime, Dynamic Silence VAD,
// Streaming Sentence-by-Sentence TTS, Continuous Wake Word, and Instant Interruption.

import type { Language, TextToSpeechOptions } from '../types/assistant';
import {
  getNaturalVoiceConfig,
  splitTextIntoSpeechChunks,
  getLoadedVoices,
} from '../utils/naturalVoice';
import { playActivationChime, playDeactivationChime, playStopChime } from '../utils/audioChime';

export type JarvisVoiceState =
  | 'IDLE'
  | 'WAKE_WORD_LISTENING'
  | 'ACTIVATED'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'ERROR';

export type VoiceStateListener = (state: JarvisVoiceState, details?: any) => void;

const WAKE_WORDS = [
  'hey jarvis',
  'jarvis',
  'ok jarvis',
  'okay jarvis',
  'हे जार्विस',
  'जार्विस',
  'हाय जार्विस',
  'जार्व्हिस',
];

const STOP_WORDS = [
  'stop',
  'cancel',
  'quiet',
  'shut up',
  'jarvis stop',
  'stop talking',
  'that is enough',
  "that's enough",
  'थांब',
  'बंद कर',
  'रुक जाओ',
  'चुप',
];

export class SpeechService {
  private speechSynthesis: SpeechSynthesis;
  private recognizer: any = null;
  private currentState: JarvisVoiceState = 'IDLE';
  private stateListeners: Set<VoiceStateListener> = new Set();

  // Mode: 'wake_word' | 'command' | 'inactive'
  private recognizerMode: 'wake_word' | 'command' | 'inactive' = 'inactive';
  private currentLanguage: Language = 'en';

  // Wake word callbacks
  private onWakeWordCallback: ((trailingCommand?: string) => void) | null = null;
  private onCommandResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onCommandErrorCallback: ((error: string) => void) | null = null;

  // Timers
  private silenceTimer: any = null;
  private noSpeechTimeout: any = null;
  private restartTimer: any = null;
  private wakeCooldownTimer: any = null;
  private isWakeCooldown: boolean = false;

  // Transcripts buffer
  private accumulatedCommandText: string = '';
  private lastSpokenTime: number = 0;

  // TTS Queue & Streaming Voice Output
  private sentenceQueue: string[] = [];
  private isSpeakingActive: boolean = false;
  private isStreamDone: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeAbortController: AbortController | null = null;

  constructor() {
    this.speechSynthesis =
      typeof window !== 'undefined' ? window.speechSynthesis : ({} as SpeechSynthesis);
    this.initMasterRecognizer();
  }

  // ─── MASTER RECOGNIZER INITIALIZATION ──────────────────────────────────────
  private initMasterRecognizer() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[SpeechService] Web Speech API not supported on this browser.');
      return;
    }

    try {
      this.recognizer = new SpeechRecognition();
      this.recognizer.continuous = true;
      this.recognizer.interimResults = true;
      this.recognizer.maxAlternatives = 1;

      this.recognizer.onresult = (event: any) => this.handleRecognitionResult(event);
      this.recognizer.onerror = (event: any) => this.handleRecognitionError(event);
      this.recognizer.onend = () => this.handleRecognitionEnd();
    } catch (err) {
      console.warn('[SpeechService] Recognizer initialization failed:', err);
    }
  }

  // ─── STATE MACHINE ─────────────────────────────────────────────────────────
  public getState(): JarvisVoiceState {
    return this.currentState;
  }

  public onStateChange(listener: VoiceStateListener): () => void {
    this.stateListeners.add(listener);
    // Emit immediate current state
    listener(this.currentState);
    return () => this.stateListeners.delete(listener);
  }

  public setState(nextState: JarvisVoiceState, details?: any) {
    if (this.currentState === nextState) return;
    this.currentState = nextState;
    this.stateListeners.forEach((fn) => {
      try {
        fn(nextState, details);
      } catch (e) {
        console.error('[SpeechService] State listener error:', e);
      }
    });
  }

  // ─── MASTER RECOGNITION RESULT ROUTER ──────────────────────────────────────
  private handleRecognitionResult(event: any) {
    let finalChunk = '';
    let interimChunk = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const item = event.results[i];
      const text = item[0]?.transcript || '';
      if (item.isFinal) {
        finalChunk += text + ' ';
      } else {
        interimChunk += text;
      }
    }

    const currentSpeech = (finalChunk + interimChunk).trim();
    if (!currentSpeech) return;

    const lower = currentSpeech.toLowerCase();

    // ── Check for Immediate Interruption / Stop Command ──
    if (
      this.currentState === 'SPEAKING' ||
      this.currentState === 'PROCESSING' ||
      this.isSpeakingActive
    ) {
      if (STOP_WORDS.some((word) => lower.includes(word))) {
        this.interrupt();
        return;
      }
    }

    // ── Mode: WAKE WORD LISTENING ──
    if (this.recognizerMode === 'wake_word') {
      if (this.isWakeCooldown) return;

      const matchedWake = WAKE_WORDS.find((word) => lower.includes(word));
      if (matchedWake) {
        this.isWakeCooldown = true;
        if (this.wakeCooldownTimer) clearTimeout(this.wakeCooldownTimer);
        this.wakeCooldownTimer = setTimeout(() => {
          this.isWakeCooldown = false;
        }, 1500);

        // Extract any command spoken right after the wake word in the same breath
        // e.g. "Hey Jarvis what is dyslexia" -> "what is dyslexia"
        const wakeIdx = lower.indexOf(matchedWake);
        const afterWake = currentSpeech.slice(wakeIdx + matchedWake.length).trim();

        // 1. Instant Audio & Visual Chime (Immediate tactile feedback)
        playActivationChime();

        // 2. Transition state to ACTIVATED
        this.setState('ACTIVATED');

        // 3. Switch mode to Command Listening
        this.recognizerMode = 'command';
        this.accumulatedCommandText = afterWake;

        if (this.onWakeWordCallback) {
          this.onWakeWordCallback(afterWake);
        }

        // Transition to LISTENING immediately
        setTimeout(() => {
          if (this.recognizerMode === 'command') {
            this.setState('LISTENING');
            if (afterWake && this.onCommandResultCallback) {
              this.onCommandResultCallback(afterWake, false);
            }
            this.armSilenceDetection();
          }
        }, 80);
      }
      return;
    }

    // ── Mode: COMMAND LISTENING (VAD & Intelligent Silence Detection) ──
    if (this.recognizerMode === 'command') {
      this.lastSpokenTime = Date.now();
      const fullTranscript = (this.accumulatedCommandText + ' ' + currentSpeech).trim();

      if (this.onCommandResultCallback) {
        this.onCommandResultCallback(fullTranscript, false);
      }

      // Check if user spoke a stop word during command mode
      if (STOP_WORDS.some((w) => fullTranscript.toLowerCase() === w)) {
        this.interrupt();
        return;
      }

      // Reset dynamic silence timer: 850ms of silence finishes the command!
      this.armSilenceDetection(fullTranscript);
    }
  }

  // ─── DYNAMIC VOICE ACTIVITY DETECTION (VAD) TIMER ─────────────────────────
  private armSilenceDetection(currentTranscript?: string) {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.noSpeechTimeout) clearTimeout(this.noSpeechTimeout);

    // Dynamic silence detection: 850ms of quiet after speaking finalizes the prompt
    this.silenceTimer = setTimeout(() => {
      const textToFinalize = (currentTranscript || this.accumulatedCommandText).trim();
      if (textToFinalize && this.recognizerMode === 'command') {
        this.finalizeCommand(textToFinalize);
      }
    }, 850);

    // Absolute fallback: If no speech within 5.5 seconds, timeout safely
    this.noSpeechTimeout = setTimeout(() => {
      if (this.recognizerMode === 'command') {
        const fallbackText = this.accumulatedCommandText.trim();
        if (fallbackText) {
          this.finalizeCommand(fallbackText);
        } else {
          this.returnToWakeWordOrIdle();
        }
      }
    }, 5500);
  }

  private finalizeCommand(finalText: string) {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.noSpeechTimeout) clearTimeout(this.noSpeechTimeout);

    this.recognizerMode = 'inactive';
    this.setState('PROCESSING');

    if (this.onCommandResultCallback) {
      this.onCommandResultCallback(finalText, true);
    }
  }

  // ─── ERROR & END HANDLERS ──────────────────────────────────────────────────
  private handleRecognitionError(event: any) {
    const error = event?.error || 'recognition-error';

    // Benign errors that naturally happen during standby
    if (error === 'no-speech' || error === 'aborted') {
      return;
    }

    console.warn('[SpeechService] Recognition error:', error);

    if (error === 'not-allowed' || error === 'service-not-allowed') {
      this.setState('ERROR', 'Microphone permission was denied.');
      if (this.onCommandErrorCallback) {
        this.onCommandErrorCallback('Microphone access denied. You can type commands below.');
      }
      this.recognizerMode = 'inactive';
      return;
    }

    if (this.onCommandErrorCallback && this.recognizerMode === 'command') {
      this.onCommandErrorCallback(error);
    }
  }

  private handleRecognitionEnd() {
    // If we're supposed to be in wake_word mode, automatically restart cleanly
    if (this.recognizerMode === 'wake_word') {
      if (this.restartTimer) clearTimeout(this.restartTimer);
      this.restartTimer = setTimeout(() => {
        if (this.recognizerMode === 'wake_word') {
          this.safeStartRecognizer();
        }
      }, 150);
      return;
    }

    if (this.recognizerMode === 'command' && this.currentState === 'LISTENING') {
      // If user finished speech and engine ended, finalize what we have
      if (this.accumulatedCommandText.trim()) {
        this.finalizeCommand(this.accumulatedCommandText.trim());
      } else {
        this.returnToWakeWordOrIdle();
      }
    }
  }

  private safeStartRecognizer() {
    if (!this.recognizer) return;
    try {
      this.recognizer.start();
    } catch (e: any) {
      // InvalidStateError occurs if it's already running - which is fine
      if (!String(e?.message).includes('already started')) {
        // Retry shortly if in transitional state
        setTimeout(() => {
          try {
            if (this.recognizerMode !== 'inactive') this.recognizer.start();
          } catch {}
        }, 300);
      }
    }
  }

  private safeStopRecognizer() {
    if (!this.recognizer) return;
    try {
      this.recognizer.stop();
    } catch {}
  }

  // ─── PUBLIC WAKE WORD CONTROLS ─────────────────────────────────────────────
  public startWakeWordDetection(
    onWakeWord: (trailingCommand?: string) => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    if (!this.recognizer) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    this.onWakeWordCallback = onWakeWord;
    this.onCommandErrorCallback = onError;
    this.currentLanguage = language;
    this.recognizerMode = 'wake_word';

    const langMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.recognizer.lang = langMap[language] || 'en-US';

    this.setState('WAKE_WORD_LISTENING');
    this.safeStartRecognizer();
  }

  public stopWakeWordDetection(): void {
    if (this.restartTimer) clearTimeout(this.restartTimer);
    if (this.recognizerMode === 'wake_word') {
      this.recognizerMode = 'inactive';
      this.safeStopRecognizer();
      if (this.currentState === 'WAKE_WORD_LISTENING') {
        this.setState('IDLE');
      }
    }
  }

  // ─── PUBLIC COMMAND LISTENING CONTROLS (MIC CLICK / WAKE TRIGGER) ───────────
  public startCommandListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    if (!this.recognizer) {
      onError('Speech recognition is not supported in this browser.');
      return;
    }

    playActivationChime();

    this.onCommandResultCallback = onResult;
    this.onCommandErrorCallback = onError;
    this.currentLanguage = language;
    this.recognizerMode = 'command';
    this.accumulatedCommandText = '';

    const langMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.recognizer.lang = langMap[language] || 'en-US';

    this.setState('LISTENING');
    this.safeStartRecognizer();
    this.armSilenceDetection();
  }

  public stopCommandListening(): void {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.noSpeechTimeout) clearTimeout(this.noSpeechTimeout);

    if (this.recognizerMode === 'command') {
      this.recognizerMode = 'inactive';
      this.safeStopRecognizer();
    }
  }

  // Backward compatibility alias
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language: Language = 'en'
  ): void {
    this.startCommandListening(onResult, onError, language);
  }

  public stopListening(): void {
    this.stopCommandListening();
  }

  public getIsListening(): boolean {
    return this.currentState === 'LISTENING' || this.currentState === 'ACTIVATED';
  }

  public getIsWakeWordListening(): boolean {
    return this.currentState === 'WAKE_WORD_LISTENING';
  }

  public getIsSpeaking(): boolean {
    return this.isSpeakingActive || (this.speechSynthesis?.speaking ?? false);
  }

  // ─── TEXT-TO-SPEECH WITH STREAMING SENTENCE QUEUE ──────────────────────────
  public async speak(text: string, options: Partial<TextToSpeechOptions> = {}): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stopSpeaking();
    await this.ensureVoicesLoaded();

    const voiceLanguage = (options.language || this.currentLanguage || 'en') as Language;
    const chunks = splitTextIntoSpeechChunks(text);
    if (!chunks.length) return;

    this.isSpeakingActive = true;
    this.setState('SPEAKING');

    const config = getNaturalVoiceConfig(voiceLanguage, options.speed ?? 1.0);

    try {
      for (const chunk of chunks) {
        if (!this.isSpeakingActive) break;

        await new Promise<void>((resolve) => {
          if (!this.isSpeakingActive) {
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = config.voice?.lang || config.lang;
          if (config.voice) utterance.voice = config.voice;
          utterance.rate = options.speed ?? config.rate;
          utterance.pitch = options.pitch ?? config.pitch;
          utterance.volume = options.volume ?? config.volume;

          utterance.onstart = () => {
            if (this.speechSynthesis.paused) this.speechSynthesis.resume();
          };
          utterance.onend = () => resolve();
          utterance.onerror = (e: any) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('[SpeechService] Utterance error:', e.error);
            }
            resolve();
          };

          this.activeUtterance = utterance;
          this.speechSynthesis.speak(utterance);
        });
      }
    } finally {
      this.isSpeakingActive = false;
      this.activeUtterance = null;
      this.returnToWakeWordOrIdle();
    }
  }

  /**
   * Streaming sentence TTS: Speak sentences incrementally while AI is still streaming text!
   */
  public enqueueSentenceToSpeak(sentence: string, options: Partial<TextToSpeechOptions> = {}) {
    const clean = sentence.trim();
    if (!clean) return;

    this.sentenceQueue.push(clean);
    if (!this.isSpeakingActive) {
      this.processSentenceQueue(options);
    }
  }

  private async processSentenceQueue(options: Partial<TextToSpeechOptions> = {}) {
    if (this.isSpeakingActive) return;
    this.isSpeakingActive = true;
    this.setState('SPEAKING');

    await this.ensureVoicesLoaded();
    const voiceLanguage = (options.language || this.currentLanguage || 'en') as Language;
    const config = getNaturalVoiceConfig(voiceLanguage, options.speed ?? 1.05);

    try {
      while (this.sentenceQueue.length > 0 && this.isSpeakingActive) {
        const chunk = this.sentenceQueue.shift();
        if (!chunk) continue;

        await new Promise<void>((resolve) => {
          if (!this.isSpeakingActive) {
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = config.voice?.lang || config.lang;
          if (config.voice) utterance.voice = config.voice;
          utterance.rate = options.speed ?? config.rate;
          utterance.pitch = options.pitch ?? config.pitch;
          utterance.volume = options.volume ?? config.volume;

          utterance.onstart = () => {
            if (this.speechSynthesis.paused) this.speechSynthesis.resume();
          };
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();

          this.activeUtterance = utterance;
          this.speechSynthesis.speak(utterance);
        });
      }
    } finally {
      this.isSpeakingActive = false;
      this.activeUtterance = null;
      if (this.sentenceQueue.length === 0) {
        this.returnToWakeWordOrIdle();
      }
    }
  }

  // ─── IMMEDIATE INTERRUPTION ("Jarvis, stop") ───────────────────────────────
  public interrupt(): void {
    playStopChime();
    this.stopSpeaking();
    this.stopCommandListening();
    this.sentenceQueue = [];
    this.isSpeakingActive = false;

    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    this.setState('INTERRUPTED');
    setTimeout(() => {
      this.returnToWakeWordOrIdle();
    }, 400);
  }

  public stopSpeaking(): void {
    this.isSpeakingActive = false;
    this.sentenceQueue = [];
    this.activeUtterance = null;
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  public pause(): void {
    if (this.speechSynthesis?.speaking) {
      this.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.speechSynthesis?.paused) {
      this.speechSynthesis.resume();
    }
  }

  public setAbortController(controller: AbortController | null) {
    this.activeAbortController = controller;
  }

  // ─── RETURN TO WAKE WORD OR IDLE STANDBY ──────────────────────────────────
  private returnToWakeWordOrIdle() {
    this.recognizerMode = 'wake_word';
    this.setState('WAKE_WORD_LISTENING');
    this.safeStartRecognizer();
  }

  private async ensureVoicesLoaded(): Promise<void> {
    const loaded = getLoadedVoices();
    if (loaded.length > 0) return;

    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 250);
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
}

// Singleton instance
let speechServiceInstance: SpeechService | null = null;

export function getSpeechService(): SpeechService {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService();
  }
  return speechServiceInstance;
}
