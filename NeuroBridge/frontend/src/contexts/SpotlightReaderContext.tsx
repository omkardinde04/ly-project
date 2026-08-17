import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Language } from './DyslexiaContext';
import { ttsService } from '../utils/textToSpeech';

export interface PageWordEntry {
  id: number;
  word: string;
  node: Text;
  startOffset: number;
  endOffset: number;
  element: HTMLElement;
  range: Range;
}

export interface ActiveRect {
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface SpotlightReaderContextType {
  isActive: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  words: PageWordEntry[];
  currentWordIndex: number;
  activeRect: ActiveRect | null;
  activeWordText: string;
  speed: number;
  language: Language;
  startPageReading: (container?: HTMLElement | string) => void;
  startTextReading: (text: string, sourceElement?: HTMLElement | null) => void;
  pauseReading: () => void;
  resumeReading: () => void;
  stopReading: () => void;
  setSpeed: (speed: number) => void;
  jumpToWord: (index: number) => void;
}

const SpotlightReaderContext = createContext<SpotlightReaderContextType | undefined>(undefined);

function extractWordsFromDOM(root: HTMLElement): PageWordEntry[] {
  const words: PageWordEntry[] = [];
  let currentId = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;

      // Ignore scripts, styles, inputs, navbars, modals, and hidden elements
      const tag = parent.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'textarea', 'input', 'select', 'svg'].includes(tag)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (parent.closest('.speech-ignore, [aria-hidden="true"], nav, header')) {
        return NodeFilter.FILTER_REJECT;
      }

      const style = window.getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return NodeFilter.FILTER_REJECT;
      }

      const text = node.textContent || '';
      if (!text.trim()) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode = walker.nextNode() as Text | null;
  while (currentNode) {
    const text = currentNode.textContent || '';
    const regex = /(\S+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const word = match[1];
      const startOffset = match.index;
      const endOffset = startOffset + word.length;

      try {
        const range = document.createRange();
        range.setStart(currentNode, startOffset);
        range.setEnd(currentNode, endOffset);

        const parentEl = currentNode.parentElement || root;

        words.push({
          id: currentId++,
          word,
          node: currentNode,
          startOffset,
          endOffset,
          element: parentEl,
          range,
        });
      } catch (e) {
        // Range creation skipped if detached
      }
    }

    currentNode = walker.nextNode() as Text | null;
  }

  return words;
}

export function SpotlightReaderProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [words, setWords] = useState<PageWordEntry[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [activeRect, setActiveRect] = useState<ActiveRect | null>(null);
  const [activeWordText, setActiveWordText] = useState('');
  const [speed, setSpeedState] = useState(1);
  const [language, setLanguageState] = useState<Language>('en');

  const wordsRef = useRef<PageWordEntry[]>([]);
  wordsRef.current = words;

  const currentIdxRef = useRef(currentWordIndex);
  currentIdxRef.current = currentWordIndex;

  const updateWordPosition = useCallback((wordIdx: number) => {
    const list = wordsRef.current;
    if (wordIdx < 0 || wordIdx >= list.length) {
      setActiveRect(null);
      setActiveWordText('');
      return;
    }

    const item = list[wordIdx];
    try {
      const rect = item.range.getBoundingClientRect();
      const style = window.getComputedStyle(item.element);

      // Scroll smoothly into view if off-screen or near edges
      if (rect.top < 120 || rect.bottom > window.innerHeight - 140) {
        const targetY = window.scrollY + rect.top - window.innerHeight / 2.5;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }

      setActiveWordText(item.word);
      setActiveRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontFamily: style.fontFamily,
      });
    } catch (e) {
      console.warn('Could not measure word rect:', e);
    }
  }, []);

  const stopReading = useCallback(() => {
    ttsService.stop();
    setIsActive(false);
    setIsPlaying(false);
    setIsPaused(false);
    setActiveRect(null);
    setActiveWordText('');
    setWords([]);
  }, []);

  const startPageReading = useCallback((container?: HTMLElement | string) => {
    let targetRoot: HTMLElement | null = null;
    if (typeof container === 'string') {
      targetRoot = document.querySelector(container);
    } else if (container) {
      targetRoot = container;
    }

    if (!targetRoot) {
      targetRoot = (document.querySelector('main') as HTMLElement) || document.body;
    }

    const pageWords = extractWordsFromDOM(targetRoot);
    if (!pageWords.length) return;

    setWords(pageWords);
    wordsRef.current = pageWords;
    setCurrentWordIndex(0);
    currentIdxRef.current = 0;
    setIsActive(true);
    setIsPlaying(true);
    setIsPaused(false);

    // Initial word spotlight
    updateWordPosition(0);

    const fullTextToRead = pageWords.map((w) => w.word).join(' ');

    ttsService.speak(
      fullTextToRead,
      language,
      speed,
      0,
      {
        onWord: (wordIdx) => {
          setCurrentWordIndex(wordIdx);
          currentIdxRef.current = wordIdx;
          updateWordPosition(wordIdx);
        },
        onStart: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onEnd: () => {
          stopReading();
        },
        onPause: () => {
          setIsPlaying(false);
          setIsPaused(true);
        },
        onResume: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onError: () => {
          stopReading();
        },
      }
    );
  }, [language, speed, stopReading, updateWordPosition]);

  const startTextReading = useCallback((text: string, sourceElement?: HTMLElement | null) => {
    if (sourceElement) {
      const elWords = extractWordsFromDOM(sourceElement);
      if (elWords.length > 0) {
        setWords(elWords);
        wordsRef.current = elWords;
        setCurrentWordIndex(0);
        currentIdxRef.current = 0;
        setIsActive(true);
        setIsPlaying(true);
        setIsPaused(false);
        updateWordPosition(0);

        const speechText = elWords.map((w) => w.word).join(' ');
        ttsService.speak(speechText, language, speed, 0, {
          onWord: (wordIdx) => {
            setCurrentWordIndex(wordIdx);
            currentIdxRef.current = wordIdx;
            updateWordPosition(wordIdx);
          },
          onStart: () => setIsPlaying(true),
          onEnd: () => stopReading(),
          onPause: () => setIsPlaying(false),
          onResume: () => setIsPlaying(true),
          onError: () => stopReading(),
        });
        return;
      }
    }

    // Default fallback to reading whole page
    startPageReading();
  }, [language, speed, startPageReading, stopReading, updateWordPosition]);

  const pauseReading = useCallback(() => {
    ttsService.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const resumeReading = useCallback(() => {
    ttsService.resume();
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    ttsService.setSpeed(newSpeed);
  }, []);

  const jumpToWord = useCallback((index: number) => {
    if (index < 0 || index >= wordsRef.current.length) return;
    setCurrentWordIndex(index);
    currentIdxRef.current = index;
    updateWordPosition(index);
    ttsService.jumpToWord(index);
  }, [updateWordPosition]);

  // Handle resize / scroll to re-align active rect
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => {
      if (currentIdxRef.current >= 0) {
        updateWordPosition(currentIdxRef.current);
      }
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isActive, updateWordPosition]);

  // Keyboard shortcuts (Escape to stop, Space to toggle play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        stopReading();
      } else if (
        e.code === 'Space' &&
        isActive &&
        (e.target as HTMLElement)?.tagName !== 'INPUT' &&
        (e.target as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (isPlaying) {
          pauseReading();
        } else if (isPaused) {
          resumeReading();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isPlaying, isPaused, stopReading, pauseReading, resumeReading]);

  return (
    <SpotlightReaderContext.Provider
      value={{
        isActive,
        isPlaying,
        isPaused,
        words,
        currentWordIndex,
        activeRect,
        activeWordText,
        speed,
        language,
        startPageReading,
        startTextReading,
        pauseReading,
        resumeReading,
        stopReading,
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
