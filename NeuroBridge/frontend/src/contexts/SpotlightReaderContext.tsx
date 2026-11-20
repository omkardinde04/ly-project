import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Language } from './DyslexiaContext';
import { extractPageParagraphs, type PageParagraphBlock } from '../services/pageContentExtractor';
import { getNaturalVoiceConfig } from '../utils/naturalVoice';

export interface PageWordEntry {
  id: number;
  word: string;
  startChar: number;
  endChar: number;
  spanElement?: HTMLSpanElement;
}

export interface ActiveRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type ReaderLifecycleState =
  | 'IDLE'
  | 'EXTRACTING'
  | 'READY'
  | 'READING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'STOPPED'
  | 'ERROR';

export interface SpotlightReaderContextType {
  isActive: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  readerState: ReaderLifecycleState;
  // Paragraph tracking
  paragraphs: PageParagraphBlock[];
  currentParagraphIndex: number;
  totalParagraphs: number;
  activeParagraphText: string;
  // Word-by-word tracking
  words: PageWordEntry[];
  currentWordIndex: number;
  totalWords: number;
  activeWordText: string;
  activeRect: ActiveRect | null;
  // Controls
  speed: number;
  language: Language;
  startPageReading: (container?: HTMLElement | string) => boolean;
  startTextReading: (text: string, sourceElement?: HTMLElement | null) => boolean;
  pauseReading: () => void;
  resumeReading: () => void;
  stopReading: () => void;
  restartReading: () => void;
  nextWord: () => void;
  prevWord: () => void;
  nextParagraph: () => void;
  prevParagraph: () => void;
  setSpeed: (speed: number) => void;
  jumpToWord: (index: number) => void;
}

const SpotlightReaderContext = createContext<SpotlightReaderContextType | undefined>(undefined);

interface WrappedBlockState {
  element: HTMLElement;
  originalHTML: string;
  words: PageWordEntry[];
  wordSpans: HTMLSpanElement[];
}

export function SpotlightReaderProvider({ children }: { children: ReactNode }) {
  const [readerState, setReaderState] = useState<ReaderLifecycleState>('IDLE');
  const [paragraphs, setParagraphs] = useState<PageParagraphBlock[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [language, setLanguageState] = useState<Language>('en');

  // Track wrapped element to cleanly restore original DOM on paragraph switch / stop
  const wrappedBlockRef = useRef<WrappedBlockState | null>(null);
  const paragraphsRef = useRef<PageParagraphBlock[]>([]);
  paragraphsRef.current = paragraphs;

  const currentParaIdxRef = useRef(0);
  currentParaIdxRef.current = currentParagraphIndex;

  const currentWordIdxRef = useRef(0);
  currentWordIdxRef.current = currentWordIndex;

  const sessionIdRef = useRef(0);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fallback timer ref for browsers where onboundary is absent or delayed
  const fallbackTimerRef = useRef<number | undefined>(undefined);
  const hasNativeBoundaryRef = useRef(false);

  const isActive = readerState === 'READING' || readerState === 'PAUSED';
  const isPlaying = readerState === 'READING';
  const isPaused = readerState === 'PAUSED';

  /**
   * Restores original DOM structure of any wrapped paragraph, removing injected spans
   */
  const unwrapCurrentBlock = useCallback(() => {
    if (wrappedBlockRef.current) {
      try {
        const { element, originalHTML } = wrappedBlockRef.current;
        if (element && element.isConnected) {
          element.innerHTML = originalHTML;
          element.classList.remove('nb-reading-spotlight');
        }
      } catch {}
      wrappedBlockRef.current = null;
    }

    if (typeof document !== 'undefined') {
      const strayActive = document.querySelectorAll('.nb-reading-word-active');
      strayActive.forEach((el) => el.classList.remove('nb-reading-word-active'));
      const strayHighlights = document.querySelectorAll('.nb-reading-spotlight');
      strayHighlights.forEach((el) => el.classList.remove('nb-reading-spotlight'));
    }
  }, []);

  /**
   * Stops reading completely, cancels speech synthesis, and cleans up DOM
   */
  const stopReading = useCallback(() => {
    sessionIdRef.current++;
    if (fallbackTimerRef.current !== undefined) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = undefined;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    activeUtteranceRef.current = null;
    unwrapCurrentBlock();
    setReaderState('STOPPED');
    setTimeout(() => {
      setReaderState('IDLE');
    }, 150);
    setCurrentParagraphIndex(0);
    setCurrentWordIndex(0);
  }, [unwrapCurrentBlock]);

  /**
   * Highlights a specific word index inside the currently wrapped block
   */
  const highlightWordAtIndex = useCallback((wordIdx: number) => {
    const wrapped = wrappedBlockRef.current;
    if (!wrapped || !wrapped.wordSpans || wrapped.wordSpans.length === 0) return;

    const clampedIdx = Math.max(0, Math.min(wordIdx, wrapped.wordSpans.length - 1));
    setCurrentWordIndex(clampedIdx);
    currentWordIdxRef.current = clampedIdx;

    // Clear previous word highlight
    wrapped.wordSpans.forEach((span, idx) => {
      if (idx === clampedIdx) {
        if (!span.classList.contains('nb-reading-word-active')) {
          span.classList.add('nb-reading-word-active');
        }
      } else {
        if (span.classList.contains('nb-reading-word-active')) {
          span.classList.remove('nb-reading-word-active');
        }
      }
    });

    // Auto-scroll keeping active word comfortably in view without fighting user scrolling
    const activeSpan = wrapped.wordSpans[clampedIdx];
    if (activeSpan && activeSpan.isConnected) {
      try {
        const rect = activeSpan.getBoundingClientRect();
        const topMargin = 72; // Nav height
        const bottomMargin = 80;
        const outOfView = rect.top < topMargin || rect.bottom > window.innerHeight - bottomMargin;
        if (outOfView) {
          activeSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      } catch {}
    }
  }, []);

  /**
   * Wraps readable words inside an element into individual spans for spotlighting
   */
  const wrapWordsInElement = useCallback((element: HTMLElement, text: string): WrappedBlockState => {
    const originalHTML = element.innerHTML;

    // Tokenize text into words with char boundaries
    const words: PageWordEntry[] = [];
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;
    let wordId = 0;

    while ((match = wordRegex.exec(text)) !== null) {
      words.push({
        id: wordId++,
        word: match[0],
        startChar: match.index,
        endChar: match.index + match[0].length,
      });
    }

    // Split text nodes and wrap each word
    element.innerHTML = '';
    const wordSpans: HTMLSpanElement[] = [];

    let currentOffset = 0;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      // Append any space/punctuation between words
      if (w.startChar > currentOffset) {
        const spacer = text.slice(currentOffset, w.startChar);
        element.appendChild(document.createTextNode(spacer));
      }

      const span = document.createElement('span');
      span.className = 'nb-reading-word';
      span.dataset.wordIdx = String(i);
      span.textContent = w.word;
      element.appendChild(span);
      wordSpans.push(span);
      w.spanElement = span;

      currentOffset = w.endChar;
    }

    // Append any trailing characters
    if (currentOffset < text.length) {
      element.appendChild(document.createTextNode(text.slice(currentOffset)));
    }

    element.classList.add('nb-reading-spotlight');

    return {
      element,
      originalHTML,
      words,
      wordSpans,
    };
  }, []);

  /**
   * Reads a paragraph block with word-by-word synchronization
   */
  const readParagraphAtIndex = useCallback(
    (index: number, session: number, startingWordIdx: number = 0) => {
      if (session !== sessionIdRef.current) return;

      const list = paragraphsRef.current;
      if (index < 0 || index >= list.length) {
        // Complete reading
        stopReading();
        setReaderState('COMPLETED');
        setTimeout(() => setReaderState('IDLE'), 350);
        return;
      }

      // 1. Unwrap previous block
      unwrapCurrentBlock();

      const block = list[index];
      setCurrentParagraphIndex(index);
      currentParaIdxRef.current = index;

      // 2. Wrap words in DOM
      const wrapped = wrapWordsInElement(block.element, block.text);
      wrappedBlockRef.current = wrapped;

      if (!wrapped.words.length) {
        // Advance if empty
        readParagraphAtIndex(index + 1, session);
        return;
      }

      // 3. Highlight initial word
      highlightWordAtIndex(startingWordIdx);

      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel();
      } catch {}

      // Calculate spoken slice if starting from a specific word
      const textToSpeak =
        startingWordIdx > 0 && wrapped.words[startingWordIdx]
          ? block.text.slice(wrapped.words[startingWordIdx].startChar)
          : block.text;

      const config = getNaturalVoiceConfig(language, speed);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = config.lang;
      if (config.voice) {
        utterance.voice = config.voice;
      }
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;

      activeUtteranceRef.current = utterance;
      hasNativeBoundaryRef.current = false;

      // Offset for charIndex mapping if slice was used
      const charOffset = startingWordIdx > 0 && wrapped.words[startingWordIdx] ? wrapped.words[startingWordIdx].startChar : 0;

      utterance.onstart = () => {
        if (session === sessionIdRef.current) {
          setReaderState('READING');

          // Fallback timer loop for engines that do not fire onboundary
          const startFallbackProgression = (wordIdx: number) => {
            if (session !== sessionIdRef.current || hasNativeBoundaryRef.current) return;
            if (wordIdx >= wrapped.words.length) return;

            highlightWordAtIndex(wordIdx);

            const word = wrapped.words[wordIdx].word;
            // Base duration calculated from speech rate (standard ~150 wpm)
            let duration = (Math.max(word.length, 3) / 5) * (60 / (155 * speed)) * 1000;
            // Extend pause for punctuation
            if (/[,;:]$/.test(word)) duration += 120;
            if (/[.?!]$/.test(word)) duration += 240;

            fallbackTimerRef.current = window.setTimeout(() => {
              if (session === sessionIdRef.current && !hasNativeBoundaryRef.current) {
                startFallbackProgression(wordIdx + 1);
              }
            }, Math.max(120, duration));
          };

          // Give native onboundary 250ms to fire before starting fallback timer
          fallbackTimerRef.current = window.setTimeout(() => {
            if (!hasNativeBoundaryRef.current && session === sessionIdRef.current) {
              startFallbackProgression(startingWordIdx + 1);
            }
          }, 260);
        }
      };

      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        if (session !== sessionIdRef.current) return;

        // Mark that native boundary events are working so fallback timer yields
        hasNativeBoundaryRef.current = true;
        if (fallbackTimerRef.current !== undefined) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = undefined;
        }

        // On word boundaries or when charIndex is reported
        const absoluteChar = e.charIndex + charOffset;

        // Find matching word
        for (let i = 0; i < wrapped.words.length; i++) {
          const w = wrapped.words[i];
          if (absoluteChar >= w.startChar && absoluteChar <= w.endChar) {
            highlightWordAtIndex(i);
            break;
          }
        }
      };

      utterance.onend = () => {
        if (session === sessionIdRef.current) {
          if (fallbackTimerRef.current !== undefined) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = undefined;
          }
          // Advance to next paragraph after a tiny natural pause
          setTimeout(() => {
            if (session === sessionIdRef.current) {
              readParagraphAtIndex(index + 1, session, 0);
            }
          }, 240);
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        console.warn('[SpotlightReader] Utterance error:', e);
        if (session === sessionIdRef.current) {
          readParagraphAtIndex(index + 1, session, 0);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[SpotlightReader] Speak error:', err);
      }
    },
    [highlightWordAtIndex, language, speed, stopReading, unwrapCurrentBlock, wrapWordsInElement]
  );

  /**
   * Starts reading the page from the beginning
   */
  const startPageReading = useCallback(
    (container?: HTMLElement | string): boolean => {
      stopReading();
      const currentSession = ++sessionIdRef.current;
      setReaderState('EXTRACTING');

      const blocks = extractPageParagraphs(container);
      if (!blocks || blocks.length === 0) {
        setReaderState('ERROR');
        setTimeout(() => setReaderState('IDLE'), 1800);
        return false;
      }

      setParagraphs(blocks);
      paragraphsRef.current = blocks;
      setCurrentParagraphIndex(0);
      currentParaIdxRef.current = 0;
      setCurrentWordIndex(0);
      currentWordIdxRef.current = 0;
      setReaderState('READY');

      readParagraphAtIndex(0, currentSession, 0);
      return true;
    },
    [readParagraphAtIndex, stopReading]
  );

  /**
   * Starts reading specific text or element
   */
  const startTextReading = useCallback(
    (text: string, sourceElement?: HTMLElement | null): boolean => {
      if (sourceElement) {
        return startPageReading(sourceElement);
      }
      return startPageReading();
    },
    [startPageReading]
  );

  /**
   * Pauses reading
   */
  const pauseReading = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
    if (fallbackTimerRef.current !== undefined) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = undefined;
    }
    setReaderState('PAUSED');
  }, []);

  /**
   * Resumes reading from current word position
   */
  const resumeReading = useCallback(() => {
    if (readerState !== 'PAUSED') return;

    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        setReaderState('READING');
        return;
      } catch {}
    }

    // If native resume fails, restart from current word
    const currentSession = ++sessionIdRef.current;
    setReaderState('READING');
    readParagraphAtIndex(currentParaIdxRef.current, currentSession, currentWordIdxRef.current);
  }, [readParagraphAtIndex, readerState]);

  /**
   * Restarts reading from the very beginning
   */
  const restartReading = useCallback(() => {
    stopReading();
    setTimeout(() => {
      startPageReading();
    }, 100);
  }, [startPageReading, stopReading]);

  /**
   * Jumps to the next word
   */
  const nextWord = useCallback(() => {
    const wrapped = wrappedBlockRef.current;
    if (!wrapped || wrapped.words.length === 0) return;

    const currentIdx = currentWordIdxRef.current;
    if (currentIdx + 1 < wrapped.words.length) {
      const nextIdx = currentIdx + 1;
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current, currentSession, nextIdx);
    } else if (currentParaIdxRef.current + 1 < paragraphsRef.current.length) {
      // Jump to first word of next paragraph
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current + 1, currentSession, 0);
    }
  }, [readParagraphAtIndex]);

  /**
   * Jumps to the previous word
   */
  const prevWord = useCallback(() => {
    const wrapped = wrappedBlockRef.current;
    if (!wrapped || wrapped.words.length === 0) return;

    const currentIdx = currentWordIdxRef.current;
    if (currentIdx > 0) {
      const targetIdx = currentIdx - 1;
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current, currentSession, targetIdx);
    } else if (currentParaIdxRef.current > 0) {
      // Jump to previous paragraph
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current - 1, currentSession, 0);
    }
  }, [readParagraphAtIndex]);

  /**
   * Jumps to the next paragraph
   */
  const nextParagraph = useCallback(() => {
    if (currentParaIdxRef.current + 1 < paragraphsRef.current.length) {
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current + 1, currentSession, 0);
    }
  }, [readParagraphAtIndex]);

  /**
   * Jumps to the previous paragraph
   */
  const prevParagraph = useCallback(() => {
    if (currentParaIdxRef.current > 0) {
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current - 1, currentSession, 0);
    }
  }, [readParagraphAtIndex]);

  /**
   * Sets reading speed
   */
  const setSpeed = useCallback(
    (newSpeed: number) => {
      const clamped = Math.max(0.5, Math.min(2.5, newSpeed));
      setSpeedState(clamped);
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.rate = clamped;
      }
    },
    []
  );

  /**
   * Jumps to a specific word index in current block
   */
  const jumpToWord = useCallback(
    (index: number) => {
      const currentSession = ++sessionIdRef.current;
      readParagraphAtIndex(currentParaIdxRef.current, currentSession, index);
    },
    [readParagraphAtIndex]
  );

  // Keyboard shortcut listener: Escape stops reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        stopReading();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, stopReading]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      unwrapCurrentBlock();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [unwrapCurrentBlock]);

  const activeWords = wrappedBlockRef.current?.words || [];
  const activeWord = activeWords[currentWordIndex]?.word || '';
  const activeParagraphText = paragraphs[currentParagraphIndex]?.text || '';

  return (
    <SpotlightReaderContext.Provider
      value={{
        isActive,
        isPlaying,
        isPaused,
        readerState,
        paragraphs,
        currentParagraphIndex,
        totalParagraphs: paragraphs.length,
        activeParagraphText,
        words: activeWords,
        currentWordIndex,
        totalWords: activeWords.length,
        activeWordText: activeWord,
        activeRect: null,
        speed,
        language,
        startPageReading,
        startTextReading,
        pauseReading,
        resumeReading,
        stopReading,
        restartReading,
        nextWord,
        prevWord,
        nextParagraph,
        prevParagraph,
        setSpeed,
        jumpToWord,
      }}
    >
      {children}
    </SpotlightReaderContext.Provider>
  );
}

export function useSpotlightReader() {
  const context = useContext(SpotlightReaderContext);
  if (!context) {
    throw new Error('useSpotlightReader must be used within a SpotlightReaderProvider');
  }
  return context;
}
