/**
 * One reliable microphone + speech-to-text hook for the voice questions.
 *
 * Fixes the old per-task code:
 *  • State is read through refs, so "time's up" and Chrome's own stop
 *    (it ends recognition after a pause) are handled — no more being stuck on
 *    "Listening…".
 *  • Chrome stops after a short silence; we quietly restart until the
 *    student presses Stop or the time limit is reached.
 *  • The JARVIS "Hey Jarvis" listener is paused while a voice question is on
 *    screen (Chrome lets only one speech recogniser use the mic at a time).
 *  • Mic permission is asked for up front, errors become plain messages, and a
 *    live level meter shows the mic is hearing you.
 *  • Browsers without speech-to-text still work: we record the level only.
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
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const ERROR_TEXT: Record<string, string> = {
  'not-allowed':
    'The microphone is blocked. Click the lock icon next to the web address, allow Microphone, then press Try again.',
  'service-not-allowed':
    'This browser blocked speech-to-text. Please use Google Chrome or Microsoft Edge.',
  'audio-capture': 'No microphone was found. Plug one in or check your sound settings.',
  NotFoundError: 'No microphone was found. Plug one in or check your sound settings.',
  NotReadableError: 'Another app is using the microphone. Close it (Zoom, Meet, etc.) and try again.',
  network: 'Speech-to-text needs the internet. Check your connection and try again.',
  insecure: 'The microphone only works on a secure page (https or localhost).',
  unknown: 'The microphone could not start. Please try again.',
};

export function useSpeechCapture({ maxMs = 15000, lang = 'en-US' }: { maxMs?: number; lang?: string } = {}) {
  const [status, setStatus] = useState<MicStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<MicError | null>(null);
  const [heardSound, setHeardSound] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const supported = typeof window !== 'undefined' && !!getRecognitionCtor();

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const wantListeningRef = useRef(false);
  const finalTextRef = useRef('');
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const firstSpeechAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

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
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (mountedRef.current) setLevel(0);
  }, []);

  const finish = useCallback(
    (next: MicStatus = 'stopped') => {
      wantListeningRef.current = false;
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      if (rec) {
        rec.onend = null;
        rec.onerror = null;
        rec.onresult = null;
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }
      releaseAudio();
      if (mountedRef.current) setStatus(next);
    },
    [releaseAudio],
  );

  const fail = useCallback(
    (code: string) => {
      if (mountedRef.current) setError({ code, message: ERROR_TEXT[code] || ERROR_TEXT.unknown });
      finish('error');
    },
    [finish],
  );

  const startRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionLike) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) finalTextRef.current += `${piece} `;
        else interim += piece;
      }
      if (!firstSpeechAtRef.current) firstSpeechAtRef.current = Date.now();
      if (mountedRef.current) setTranscript(`${finalTextRef.current}${interim}`.replace(/\s+/g, ' ').trim());
    };

    rec.onerror = (event: SpeechRecognitionLike) => {
      const code = String(event?.error || 'unknown');
      // Silence and our own restarts are normal
      if (code === 'no-speech' || code === 'aborted') return;
      fail(code);
    };

    rec.onend = () => {
      // Chrome ends after a pause: keep going until Stop / time limit
      if (wantListeningRef.current && Date.now() - startedAtRef.current < maxMs) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through */
        }
      }
      if (recognitionRef.current === rec) finish('stopped');
    };

    recognitionRef.current = rec;
    rec.start();
  }, [fail, finish, lang, maxMs]);

  const start = useCallback(async () => {
    finish('idle');
    setError(null);
    setTranscript('');
    setHeardSound(false);
    setElapsedMs(0);
    finalTextRef.current = '';
    firstSpeechAtRef.current = null;
    setStatus('starting');

    if (!window.isSecureContext) return fail('insecure');
    if (!navigator.mediaDevices?.getUserMedia) return fail('audio-capture');

    // Ask for the mic first: clear permission prompt + level meter
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      return fail(name === 'NotAllowedError' || name === 'SecurityError' ? 'not-allowed' : name || 'unknown');
    }
    if (!mountedRef.current) return releaseAudio();

    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(streamRef.current).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let smooth = 0;
      let shown = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        smooth = smooth * 0.7 + Math.min(1, rms * 5) * 0.3;
        if (Math.abs(smooth - shown) > 0.03) {
          shown = smooth;
          setLevel(smooth);
        }
        if (smooth > 0.12) setHeardSound(true);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is a nice-to-have */
    }

    startedAtRef.current = Date.now();
    wantListeningRef.current = true;
    timerRef.current = window.setInterval(() => {
      const ms = Date.now() - startedAtRef.current;
      setElapsedMs(ms);
      if (ms >= maxMs) finish('stopped');
    }, 200);

    if (getRecognitionCtor()) {
      try {
        startRecognition();
      } catch {
        return fail('unknown');
      }
    }
    setStatus('listening');
  }, [fail, finish, maxMs, releaseAudio, startRecognition]);

  const stop = useCallback(() => finish('stopped'), [finish]);

  const reset = useCallback(() => {
    finish('idle');
    setError(null);
    setTranscript('');
    setHeardSound(false);
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
