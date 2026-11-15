/**
 * One reliable microphone + speech-to-text hook for the voice questions.
 *
 * Architecture:
 *  • Real-time audio stream monitor via Web Audio AnalyserNode (source -> analyser)
 *    provides reliable, local volume metering and voice activity detection without
 *    relying on cloud speech servers or exclusive driver locks.
 *  • SpeechRecognition is managed through isolated, ephemeral instances.
 *    Chrome stops recognition after brief pauses; we gracefully spawn a fresh
 *    instance so DOMException / InvalidStateError cannot crash the session.
 *  • If speech-to-text encounters a cloud/network glitch (common with VPNs,
 *    restricted networks, or Brave Shields), the local audio monitor continues
 *    capturing speech so the student is never blocked from finishing their task.
 *  • Automatically pauses JARVIS background wake-word listening while active.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAssistant } from '../../contexts/AssistantContext';
import { getSpeechService } from '../../services/speechService';

export type MicStatus = 'idle' | 'starting' | 'listening' | 'stopped' | 'error';

export interface MicError {
  code: string;
  message: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionLike = any;

const getRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const ERROR_TEXT: Record<string, string> = {
  'not-allowed':
    'Microphone access was denied or blocked. Click the lock / site settings icon in your browser address bar, set Microphone to "Allow", and try again.',
  'service-not-allowed':
    'This browser does not permit speech recognition. You can still speak aloud, or switch to Google Chrome or Microsoft Edge.',
  'audio-capture': 'No microphone was found on this device. Please plug in or select a microphone in your sound settings.',
  'permission-denied':
    'Microphone access was denied. Click the lock icon in your browser address bar to allow Microphone, then try again.',
  NotFoundError: 'No microphone was detected. Please verify your microphone is connected and enabled.',
  NotReadableError: 'Another app is currently using your microphone. Please close other meeting or voice apps (Zoom, Teams, Meet) and try again.',
  network:
    'Speech recognition cloud connection is unavailable. Your voice level is still being recorded; you may continue reading or speaking.',
  insecure: 'Microphone access requires a secure connection (HTTPS or localhost).',
  unknown: 'The microphone could not be started. Please click "Try again".',
};

export function useSpeechCapture({ maxMs = 15000, lang = 'en-US' }: { maxMs?: number; lang?: string } = {}) {
  const [status, setStatus] = useState<MicStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<MicError | null>(null);
  const [heardSound, setHeardSound] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const supported = typeof window !== 'undefined' && (!!getRecognitionCtor() || !!navigator.mediaDevices?.getUserMedia);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wantListeningRef = useRef(false);
  const heardSoundRef = useRef(false);
  const finalTextRef = useRef('');
  const startedAtRef = useRef(0);
  const firstSpeechAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const networkRetryRef = useRef(0);

  // ── Pause "Hey Jarvis" while this question is on screen ──────────────────
  const { wakeWordEnabled, setWakeWordEnabled } = useAssistant();
  const wakeWasOnRef = useRef(wakeWordEnabled);
  useEffect(() => {
    const wasOn = wakeWasOnRef.current;
    getSpeechService().stopWakeWordDetection();
    setWakeWordEnabled(false);
    return () => {
      if (wasOn) setWakeWordEnabled(true);
    };
  }, [setWakeWordEnabled]);

  const releaseAudio = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== 'closed') {
      void audioContext.close().catch(() => {});
    }
    if (mountedRef.current) setLevel(0);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (next: MicStatus = 'stopped') => {
      wantListeningRef.current = false;
      clearTimer();

      const rec = recognitionRef.current;
      recognitionRef.current = null;
      if (rec) {
        rec.onend = null;
        rec.onerror = null;
        rec.onresult = null;
        try {
          rec.abort();
        } catch {}
      }

      releaseAudio();
      if (mountedRef.current) setStatus(next);
    },
    [clearTimer, releaseAudio],
  );

  const fail = useCallback(
    (code: string) => {
      if (mountedRef.current) {
        setError({ code, message: ERROR_TEXT[code] || ERROR_TEXT.unknown });
      }
      finish('error');
    },
    [finish],
  );

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    clearTimer();

    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onend = null;
      rec.onerror = null;
      rec.onresult = null;
      try {
        rec.stop();
      } catch {}
    }

    releaseAudio();
    if (mountedRef.current) setStatus('stopped');
  }, [clearTimer, releaseAudio]);

  /** Spawns a fresh SpeechRecognition instance without reusing stale or ended objects */
  const spawnRecognizer = useCallback(() => {
    if (!wantListeningRef.current || !mountedRef.current) return;

    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    // Clean up previous instance cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        if (mountedRef.current && wantListeningRef.current) {
          setStatus('listening');
        }
      };

      rec.onresult = (event: SpeechRecognitionLike) => {
        networkRetryRef.current = 0;
        heardSoundRef.current = true;
        if (mountedRef.current) setHeardSound(true);

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0]?.transcript ?? '';
          if (event.results[i].isFinal) {
            finalTextRef.current += `${piece} `;
          } else {
            interim += piece;
          }
        }
        if (!firstSpeechAtRef.current) firstSpeechAtRef.current = Date.now();
        if (mountedRef.current) {
          setTranscript(`${finalTextRef.current}${interim}`.replace(/\s+/g, ' ').trim());
        }
      };

      rec.onerror = (event: SpeechRecognitionLike) => {
        const code = String(event?.error || 'unknown');
        if (code === 'no-speech' || code === 'aborted') return;

        if (code === 'network') {
          console.warn('[useSpeechCapture] Cloud speech-to-text network notice');
          if (wantListeningRef.current && networkRetryRef.current < 2) {
            networkRetryRef.current += 1;
            restartTimerRef.current = window.setTimeout(() => {
              restartTimerRef.current = null;
              spawnRecognizer();
            }, 500);
            return;
          }
          // If the hardware mic is actively streaming, don't fail out the student
          if (streamRef.current || heardSoundRef.current) {
            return;
          }
        }

        if (code === 'not-allowed' || code === 'service-not-allowed') {
          fail(code);
        } else if (!streamRef.current) {
          fail(code);
        }
      };

      rec.onend = () => {
        // When Chrome ends recognition due to silence or interval, quietly spawn a fresh instance
        if (wantListeningRef.current && Date.now() - startedAtRef.current < maxMs) {
          restartTimerRef.current = window.setTimeout(() => {
            restartTimerRef.current = null;
            if (wantListeningRef.current && mountedRef.current) {
              spawnRecognizer();
            }
          }, 200);
          return;
        }

        if (recognitionRef.current === rec) {
          finish('stopped');
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.warn('[useSpeechCapture] Recognizer start notice:', e);
      // If hardware microphone is active, don't break the user's reading flow
      if (!streamRef.current && !heardSoundRef.current) {
        fail('unknown');
      }
    }
  }, [fail, finish, lang, maxMs]);

  /** Live microphone volume meter using Web Audio AnalyserNode */
  const startAudioMonitor = useCallback((stream: MediaStream) => {
    if (!wantListeningRef.current || !mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    streamRef.current = stream;

    try {
      const AudioCtx =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        void audioContext.resume().catch(() => {});
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser); // No destination connection needed: prevents audio feedback

      const samples = new Uint8Array(analyser.fftSize);
      let smoothed = 0;
      let lastReported = 0;

      const measureLevel = () => {
        if (!wantListeningRef.current || !mountedRef.current || audioContextRef.current !== audioContext) {
          return;
        }

        analyser.getByteTimeDomainData(samples);
        let sumSquares = 0;
        for (let i = 0; i < samples.length; i++) {
          const norm = (samples[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / samples.length);
        smoothed = smoothed * 0.7 + Math.min(1, rms * 4.5) * 0.3;

        if (smoothed > 0.035) {
          heardSoundRef.current = true;
          setHeardSound(true);
        }

        if (Math.abs(smoothed - lastReported) >= 0.02) {
          lastReported = smoothed;
          setLevel(smoothed);
        }

        animationFrameRef.current = requestAnimationFrame(measureLevel);
      };

      animationFrameRef.current = requestAnimationFrame(measureLevel);
    } catch (monitorError) {
      console.warn('[useSpeechCapture] Audio monitor notice:', monitorError);
    }
  }, []);

  const start = useCallback(() => {
    finish('idle');
    setError(null);
    setTranscript('');
    setHeardSound(false);
    heardSoundRef.current = false;
    setLevel(0);
    setElapsedMs(0);
    networkRetryRef.current = 0;
    finalTextRef.current = '';
    firstSpeechAtRef.current = null;
    setStatus('starting');

    if (!window.isSecureContext) return fail('insecure');
    if (!navigator.mediaDevices?.getUserMedia) return fail('audio-capture');

    startedAtRef.current = Date.now();
    wantListeningRef.current = true;

    timerRef.current = window.setInterval(() => {
      const ms = Date.now() - startedAtRef.current;
      setElapsedMs(ms);
      if (ms >= maxMs) stop();
    }, 200);

    // Request microphone access for audio monitoring + permission acquisition
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((stream) => {
        if (!wantListeningRef.current || !mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        startAudioMonitor(stream);
        setStatus('listening');

        // Start speech recognition once microphone access is active
        if (getRecognitionCtor()) {
          spawnRecognizer();
        }
      })
      .catch((err) => {
        if (!wantListeningRef.current || !mountedRef.current) return;
        const name = (err as DOMException)?.name;
        if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
          fail('not-allowed');
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          fail('audio-capture');
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          fail('NotReadableError');
        } else {
          fail('unknown');
        }
      });
  }, [fail, finish, maxMs, spawnRecognizer, startAudioMonitor, stop]);

  const reset = useCallback(() => {
    finish('idle');
    setError(null);
    setTranscript('');
    setHeardSound(false);
    heardSoundRef.current = false;
    setLevel(0);
    setElapsedMs(0);
    finalTextRef.current = '';
  }, [finish]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      finish('idle');
    };
  }, [finish]);

  return {
    status,
    transcript,
    level,
    error,
    heardSound,
    elapsedMs,
    maxMs,
    supported,
    /** ms from pressing the mic to the first recognised word */
    timeToFirstWord: () => (firstSpeechAtRef.current ? firstSpeechAtRef.current - startedAtRef.current : null),
    start,
    stop,
    reset,
  };
}

/** One short status line for the mic area. */
export function micStatusText(status: MicStatus, heardSound: boolean, supported: boolean): string {
  if (status === 'starting') return 'Getting the mic ready… If a pop-up asks to use the microphone, press Allow.';
  if (status === 'listening') return heardSound ? 'Listening… tap the red button when you finish' : 'Listening… start talking';
  if (!supported) return 'Tap the mic. (This browser can’t turn speech into text, but we still count it.)';
  return 'Tap the blue mic and talk';
}
