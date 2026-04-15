/**
 * GlobalReader — A floating, persistent "Read Page" bar.
 *
 * Strategy:
 *  • Extracts visible text from the page's <main> element (or body as fallback)
 *  • Strips nav/header/footer/SVG/script nodes automatically
 *  • Provides Play / Pause / Stop / Speed controls
 *  • Shows a progress bar of how far through the page it has read
 *  • Persists across route changes — attaches to App root, not to pages
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { ttsService } from '../../utils/textToSpeech';

// ── Nodes to skip when extracting page text ───────────────────────────────
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD',
  'NAV', 'HEADER', 'FOOTER',
  'SVG', 'PATH', 'G', 'CIRCLE', 'RECT',
  'BUTTON', // skip buttons - just UI chrome
]);

function extractPageText(): string {
  // Prefer <main>, fall back to <body>
  const root = document.querySelector('main') ?? document.body;
  const parts: string[] = [];

  function walk(node: Node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (SKIP_TAGS.has(tag)) return;
      if (el.getAttribute('aria-hidden') === 'true') return;
      if (el.getAttribute('role') === 'button') return;

      // Use aria-label where it exists (icons etc.)
      const label = el.getAttribute('aria-label');
      if (label) { parts.push(label); return; }

      for (const child of Array.from(node.childNodes)) {
        walk(child);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim();
      if (text.length > 1) parts.push(text);
    }
  }

  walk(root);

  // Deduplicate consecutive identical strings, join with spaces
  const deduped: string[] = [];
  for (const part of parts) {
    if (deduped[deduped.length - 1] !== part) deduped.push(part);
  }
  return deduped.join(' ').replace(/\s+/g, ' ').trim();
}

type State = 'idle' | 'playing' | 'paused';

export function GlobalReader() {
  const { language, audioSpeed } = useDyslexia();
  const [state, setState] = useState<State>('idle');
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [minimised, setMinimised] = useState(false);
  const [pageText, setPageText] = useState('');
  const charIndexRef = useRef(0);
  const totalLenRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  // ── Re-extract text when the URL / page content changes ──────────────────
  useEffect(() => {
    // Small delay so React has rendered the new page
    const timer = setTimeout(() => {
      const text = extractPageText();
      setPageText(text);
      totalLenRef.current = text.length || 1;
      // Stop previous reading on page change
      if (ttsService.isSpeaking()) {
        ttsService.stop();
        setState('idle');
        setProgress(0);
        charIndexRef.current = 0;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Also re-extract on URL changes inside SPA
  useEffect(() => {
    const handler = () => {
      setTimeout(() => {
        const text = extractPageText();
        setPageText(text);
        totalLenRef.current = text.length || 1;
        ttsService.stop();
        setState('idle');
        setProgress(0);
        charIndexRef.current = 0;
      }, 400);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // ── Progress tracker via requestAnimationFrame ────────────────────────────
  const trackProgress = useCallback(() => {
    if (!ttsService.isSpeaking() && !ttsService.isPaused()) {
      // Speech ended naturally
      setState('idle');
      setProgress(100);
      charIndexRef.current = 0;
      return;
    }
    setProgress(Math.min(100, Math.round((charIndexRef.current / totalLenRef.current) * 100)));
    rafRef.current = requestAnimationFrame(trackProgress);
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handlePlay = () => {
    const text = pageText || extractPageText();
    if (!text) return;

    if (state === 'paused') {
      ttsService.resume();
      setState('playing');
      rafRef.current = requestAnimationFrame(trackProgress);
      return;
    }

    // Fresh start
    charIndexRef.current = 0;
    setProgress(0);
    totalLenRef.current = text.length;

    const synth = window.speechSynthesis;
    synth.cancel();

    const chunks = splitIntoChunks(text, 200);
    let chunkIndex = 0;
    let charsSpoken = 0;

    function speakChunk(i: number) {
      if (i >= chunks.length) {
        setState('idle');
        setProgress(100);
        return;
      }
      const utt = new SpeechSynthesisUtterance(chunks[i]);
      utt.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'mr-IN';
      utt.rate = speed;
      utt.pitch = 1;

      utt.onboundary = (e) => {
        if (e.name === 'word') {
          charIndexRef.current = charsSpoken + e.charIndex;
        }
      };

      utt.onend = () => {
        charsSpoken += chunks[i].length + 1;
        chunkIndex++;
        speakChunk(chunkIndex);
      };

      utt.onerror = () => {
        setState('idle');
      };

      synth.speak(utt);
    }

    speakChunk(0);
    setState('playing');
    rafRef.current = requestAnimationFrame(trackProgress);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState('paused');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setState('idle');
    setProgress(0);
    charIndexRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handleSpeed = (s: number) => {
    setSpeed(s);
    // Restart at same position with new speed
    if (state === 'playing') {
      handleStop();
      setTimeout(() => handlePlay(), 100);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── UI ────────────────────────────────────────────────────────────────────
  const isActive = state !== 'idle';

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      style={{ width: minimised ? 'auto' : 'min(540px, calc(100vw - 2rem))' }}
    >
      <div
        className={`rounded-2xl shadow-xl border transition-all duration-300 ${
          isActive
            ? 'bg-white border-blue-200 shadow-blue-100'
            : 'bg-white/90 backdrop-blur-md border-gray-200'
        }`}
      >
        {/* Progress bar at top */}
        {isActive && (
          <div className="h-1 w-full bg-gray-100 rounded-t-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Speaker icon */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-blue-600' : 'bg-blue-100'}`}>
            <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          </div>

          {!minimised && (
            <>
              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 leading-none">
                  {state === 'playing' ? 'Reading page…' : state === 'paused' ? 'Paused' : 'Read this page aloud'}
                </p>
                {isActive && (
                  <p className="text-xs text-gray-400 mt-0.5">{progress}% complete</p>
                )}
              </div>

              {/* Speed selector */}
              <div className="flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
                {[0.75, 1, 1.5].map(s => (
                  <button
                    key={s}
                    onClick={() => handleSpeed(s)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all ${
                      speed === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              {/* Play / Pause / Stop */}
              <div className="flex items-center gap-1.5">
                {state === 'playing' ? (
                  <button
                    onClick={handlePause}
                    className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                    Pause
                  </button>
                ) : state === 'paused' ? (
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePlay}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                    Listen
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={handleStop}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                    title="Stop"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}

          {/* Minimise / expand toggle */}
          <button
            onClick={() => setMinimised(!minimised)}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            title={minimised ? 'Expand reader' : 'Minimise'}
          >
            {minimised ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helper — split long text into TTS-safe chunks ────────────────────────────
function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  return chunks;
}
