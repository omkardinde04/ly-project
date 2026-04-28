import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlphabetScenario {
  id: string;
  instruction: string;
  display: string;
  expected: string[];
}

export interface VoiceAlphabetMetrics {
  scenario_id: string;
  transcript: string;
  time_taken_ms: number;
}

interface VoiceAlphabetTaskProps {
  onComplete: (metrics: VoiceAlphabetMetrics[]) => void;
}

const SCENARIOS: AlphabetScenario[] = [
  { id: 'continue', instruction: 'Say the next few letters after:', display: 'C, D, E ...', expected: ['f', 'g', 'h'] },
  { id: 'start_mid', instruction: 'Say the letters starting from:', display: 'M', expected: ['m', 'n', 'o', 'p'] },
  { id: 'missing', instruction: 'Say the missing letters:', display: 'A, B, __ , __ , E', expected: ['c', 'd'] },
  { id: 'reverse', instruction: 'Say these letters in reverse:', display: 'H I J', expected: ['j', 'i', 'h'] },
];

export function VoiceAlphabetTask({ onComplete }: VoiceAlphabetTaskProps) {
  type Phase = 'ready' | 'listening' | 'review' | 'transition';
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [allMetrics, setAllMetrics] = useState<VoiceAlphabetMetrics[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef<number>(0);
  
  const transcriptRef = useRef('');

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        transcriptRef.current = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        // Only trigger finish if we were actually listening
        if (recognitionRef.current?.isManuallyStopped) return;
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.error('Recognition error:', event.error);
          setPhase('ready');
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    transcriptRef.current = '';
    startTime.current = Date.now();
    setPhase('listening');
    
    if (recognitionRef.current) {
      recognitionRef.current.isManuallyStopped = false;
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }

    // Auto stop after 15 seconds
    autoStopTimeoutRef.current = setTimeout(() => {
      stopAndReview();
    }, 15000);
  };

  const stopAndReview = () => {
    if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.isManuallyStopped = true;
      recognitionRef.current.stop();
    }
    setPhase('review');
  };

  const handleContinue = () => {
    const scenario = SCENARIOS[currentIdx];
    const metric: VoiceAlphabetMetrics = {
      scenario_id: scenario.id,
      transcript: transcriptRef.current.trim(),
      time_taken_ms: Date.now() - startTime.current
    };

    const updatedMetrics = [...allMetrics, metric];
    setAllMetrics(updatedMetrics);

    if (currentIdx < SCENARIOS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setTranscript('');
      transcriptRef.current = '';
      setPhase('ready');
    } else {
      setPhase('transition');
      setTimeout(() => {
        onComplete(updatedMetrics);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-10 border border-blue-50 shadow-sm font-sans flex flex-col items-center justify-center min-h-[460px]">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Say the letters</h2>
        <div className="h-1 w-12 bg-blue-400 rounded-full mx-auto opacity-50" />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'transition' ? (
          <motion.div
            key="transition"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-2">🚀</div>
            <p className="text-xl font-bold text-[#1A2340]">Great progress!</p>
            <p className="text-gray-500 italic">Moving to next puzzle...</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${currentIdx}-${phase}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center text-center"
          >
            <p className="text-gray-500 text-lg mb-4">{SCENARIOS[currentIdx].instruction}</p>
            <div className="text-4xl font-bold text-[#1A2340] mb-12 tracking-wider h-12">
              {SCENARIOS[currentIdx].display}
            </div>

            <div className="relative flex flex-col items-center gap-8 w-full min-h-[160px]">
              {phase === 'ready' && (
                <div className="flex flex-col items-center gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startListening}
                    className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shadow-lg shadow-blue-100 group border border-blue-100"
                  >
                    <span className="text-3xl text-blue-400 group-hover:scale-110 transition-transform">🎤</span>
                  </motion.button>
                  <p className="text-sm font-medium text-gray-400">Tap the mic and start speaking</p>
                </div>
              )}

              {phase === 'listening' && (
                <div className="flex flex-col items-center gap-6">
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
                  <div className="italic text-gray-400 font-medium h-4 max-w-xs truncate overflow-hidden">
                    {transcript || "Wait, we're listening..."}
                  </div>
                </div>
              )}

              {phase === 'review' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-gray-500">This is what we heard:</p>
                    <div className="px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100 text-[#1A2340] font-bold text-xl min-w-[120px]">
                      {transcript || "..."}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinue}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 px-10 rounded-full shadow-lg shadow-blue-100 transition-colors"
                  >
                    Continue
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex gap-2">
        {SCENARIOS.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'w-8 bg-blue-400' : i < currentIdx ? 'w-2 bg-blue-200' : 'w-2 bg-blue-50'}`} 
          />
        ))}
      </div>
    </div>
  );
}
