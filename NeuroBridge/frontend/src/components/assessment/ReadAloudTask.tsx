import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParagraphScenario {
  id: string;
  text: string;
  highlights: string[];
}

export interface ReadAloudMetrics {
  paragraph_id: string;
  transcript: string;
  time_to_start_ms: number;
  total_time_ms: number;
}

interface ReadAloudTaskProps {
  onComplete: (metrics: ReadAloudMetrics) => void;
}

const PARAGRAPHS: ParagraphScenario[] = [
  {
    id: 'p1',
    text: "Today I planned to finish my work early, but I kept procrastinating. I tried to stay focused, and finally completed the assignment before evening.",
    highlights: ["procrastinating", "focused", "assignment"]
  },
  {
    id: 'p2',
    text: "The environment looked calm after the rain. Everyone walked carefully to avoid the slippery path. It was a peaceful afternoon.",
    highlights: ["environment", "slippery", "afternoon"]
  },
  {
    id: 'p3',
    text: "She showed great confidence while speaking. The teacher appreciated her presentation. Everyone listened with attention.",
    highlights: ["confidence", "presentation", "attention"]
  },
  {
    id: 'p4',
    text: "The celebration started in the evening. Children were excited about the performance. The decorations looked beautiful.",
    highlights: ["celebration", "performance", "decorations"]
  }
];

export function ReadAloudTask({ onComplete }: ReadAloudTaskProps) {
  const [selectedParagraph] = useState<ParagraphScenario>(() => 
    PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]
  );
  
  const [phase, setPhase] = useState<'ready' | 'listening' | 'review' | 'finished'>('ready');
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountTime = useRef<number>(Date.now());
  const speakStartTime = useRef<number | null>(null);
  const transcriptRef = useRef('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const stopCurrentRecognition = () => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const startListening = () => {
    stopCurrentRecognition();
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    setTranscript('');
    transcriptRef.current = '';
    speakStartTime.current = null;
    
    const recognition = new SR();
    recognition.continuous = true; 
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      if (!speakStartTime.current) {
        speakStartTime.current = Date.now();
      }
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = currentTranscript;
      if (isMounted.current) setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      if (isMounted.current && phase === 'listening') {
        if (transcriptRef.current.trim()) {
          setPhase('review');
        } else {
          setPhase('ready');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Read Aloud error:', event.error);
      if (isMounted.current) setPhase('ready');
    };

    recognitionRef.current = recognition;
    setPhase('listening');
    
    try {
      recognition.start();
    } catch (e) {
      setPhase('ready');
    }

    // Auto stop after 20 seconds
    autoStopTimeoutRef.current = setTimeout(() => {
      if (isMounted.current && phase === 'listening') {
        stopAndReview();
      }
    }, 20000);
  };

  const stopAndReview = () => {
    stopCurrentRecognition();
    setPhase('review');
  };

  const handleContinue = () => {
    setPhase('finished');
    const now = Date.now();
    const metrics: ReadAloudMetrics = {
      paragraph_id: selectedParagraph.id,
      transcript: transcriptRef.current.trim(),
      time_to_start_ms: speakStartTime.current ? (speakStartTime.current - mountTime.current) : 0,
      total_time_ms: now - mountTime.current
    };

    setTimeout(() => {
      if (isMounted.current) onComplete(metrics);
    }, 1000);
  };

  useEffect(() => {
    return () => stopCurrentRecognition();
  }, []);

  const renderText = () => {
    return selectedParagraph.text.split(' ').map((word, i) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      const isHighlighted = selectedParagraph.highlights.some(h => h.toLowerCase() === cleanWord);
      return (
        <span 
          key={i} 
          className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md transition-colors ${
            isHighlighted ? 'bg-[#EBF4FF] text-[#1A2340] font-bold border border-[#DCEBFF]' : 'text-[#2A3A5A]'
          }`}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-10 border border-blue-50 shadow-sm font-sans flex flex-col items-center justify-center min-h-[480px]">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Read this aloud</h2>
        <p className="text-[#7A8CAA]">Read the paragraph below out loud.</p>
      </div>

      <div className="w-full bg-[#FAFCFF] border border-[#DCEBFF] rounded-2xl p-8 mb-10">
        <div className="text-2xl leading-relaxed text-left" style={{ lineHeight: '1.8' }}>
          {renderText()}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full min-h-[160px]">
        <AnimatePresence mode="wait">
          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startListening}
                className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shadow-lg shadow-blue-100 group border border-blue-100"
              >
                <span className="text-3xl text-blue-400 group-hover:scale-110 transition-transform">🎤</span>
              </motion.button>
              <p className="text-sm font-medium text-gray-400">Tap the mic and start speaking</p>
            </motion.div>
          )}

          {phase === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.2, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-blue-400 rounded-full"
                />
                <div className="relative w-20 h-20 rounded-full bg-blue-400 flex items-center justify-center shadow-xl shadow-blue-200">
                  <span className="text-3xl text-white">🎤</span>
                </div>
              </div>
              <p className="text-sm font-bold text-blue-400 animate-pulse uppercase tracking-wider">Listening...</p>
              <div className="italic text-gray-400 font-medium h-4 max-w-md truncate overflow-hidden">
                {transcript || "Keep reading out loud..."}
              </div>
              <button onClick={stopAndReview} className="text-xs text-blue-500 font-bold hover:underline">Stop manually</button>
            </motion.div>
          )}

          {phase === 'review' && (
            <motion.div 
              key="review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-gray-500">This is what we heard:</p>
                <div className="px-6 py-4 bg-blue-50 rounded-2xl border border-blue-100 text-[#1A2340] font-medium text-lg max-w-lg italic shadow-inner">
                  "{transcript || "..."}"
                </div>
              </div>
              
              <div className="flex gap-4">
                <button onClick={() => setPhase('ready')} className="text-sm text-gray-500 underline">Retry</button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinue}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3.5 px-12 rounded-full shadow-lg shadow-blue-100 transition-colors"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-20 flex flex-col items-center justify-center text-center"
            >
              <div className="text-2xl font-bold text-blue-400 mb-1">Excellent! ✨</div>
              <p className="text-gray-400 text-sm italic">Saving your progress...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        <button 
          onClick={() => onComplete({
            paragraph_id: selectedParagraph.id,
            transcript: "Skipped",
            time_to_start_ms: 0,
            total_time_ms: 0
          })}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Microphone issues? Skip this task
        </button>
      </div>
    </div>
  );
}
