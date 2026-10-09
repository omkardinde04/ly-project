import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, CheckCircle2, ThumbsUp } from 'lucide-react';

interface ReadingRereadTaskProps {
  question: any;
  onComplete?: (rereadCount: number) => void;
}

export function ReadingRereadTask({ question, onComplete }: ReadingRereadTaskProps) {
  const [phase, setPhase] = useState<'instruction' | 'reading' | 'done'>('instruction');
  const [transcript, setTranscript] = useState('');
  const [rereadCount, setRereadCount] = useState(0);
  const isMounted = useRef(true);

  // Use fixed paragraph for testing if none provided
  const paragraphText = question?.paragraph || 'Dyslexia is not a reflection of intelligence. It is simply a different way that the brain processes language. Many highly successful people are dyslexic.';
  const words = typeof paragraphText === 'string' ? paragraphText.split(/\s+/) : paragraphText[0].split(/\s+/);
  
  const [wordStatuses, setWordStatuses] = useState<('idle' | 'green' | 'yellow' | 'red')[]>(Array(words.length).fill('idle'));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (recogRef.current) {
        try { recogRef.current.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  const handleStartReading = () => {
    setPhase('reading');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
       console.warn("Speech recognition not supported in this browser.");
       return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    recogRef.current = rec;

    rec.onresult = (e: any) => {
      let currentTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        currentTranscript += e.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    rec.start();
  };

  const handleFinishReading = () => {
    if (recogRef.current) {
      try { recogRef.current.stop(); } catch (e) { /* ignore */ }
    }
    setPhase('done');
    setIsCompleted(true);
    if (onComplete) onComplete(rereadCount);
  };

  useEffect(() => {
    if (phase !== 'reading') return;
    
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    if (spokenWords.length === 0) return;

    setWordStatuses((prev) => {
      const newStatuses = [...prev];
      let spokenCursor = 0;
      let textCursor = 0;
      let newRereadCount = rereadCount;
      let maxMatchedIndex = currentWordIndex > 0 ? currentWordIndex - 1 : -1;
      let finalMaxIndex = maxMatchedIndex;

      for (let i = 0; i < 500; i++) { // safeguard
        if (spokenCursor >= spokenWords.length || textCursor >= words.length) break;

        const expectedWord = words[textCursor].toLowerCase().replace(/[^a-z0-9]/g, '');
        const currentSpoken = spokenWords[spokenCursor].replace(/[^a-z0-9]/g, '');

        if (currentSpoken === expectedWord) {
          if (textCursor <= maxMatchedIndex) {
            newStatuses[textCursor] = 'red';
          } else {
            if (newStatuses[textCursor] !== 'red') {
               newStatuses[textCursor] = 'green';
            }
            maxMatchedIndex = textCursor;
          }
          spokenCursor++;
          textCursor++;
        } else {
          let foundEarlier = false;
          for (let prevIdx = 0; prevIdx <= maxMatchedIndex; prevIdx++) {
            const earlierWord = words[prevIdx].toLowerCase().replace(/[^a-z0-9]/g, '');
            if (currentSpoken === earlierWord) {
               textCursor = prevIdx;
               foundEarlier = true;
               newRereadCount++;
               break;
            }
          }
          
          if (!foundEarlier) {
             let foundAhead = false;
             let targetNextIdx = textCursor + 1;
             for (let nextIdx = textCursor + 1; nextIdx <= Math.min(textCursor + 3, words.length - 1); nextIdx++) {
                const aheadWord = words[nextIdx].toLowerCase().replace(/[^a-z0-9]/g, '');
                if (currentSpoken === aheadWord) {
                   targetNextIdx = nextIdx;
                   foundAhead = true;
                   break;
                }
             }
             if (foundAhead) {
                  for (let skipIdx = textCursor; skipIdx < targetNextIdx; skipIdx++) {
                      if (newStatuses[skipIdx] === 'idle') {
                          newStatuses[skipIdx] = 'yellow';
                      }
                  }
                  textCursor = targetNextIdx;
             } else {
                spokenCursor++;
             }
          }
        }
      }

      setRereadCount(newRereadCount);
      finalMaxIndex = maxMatchedIndex;
      
      if (textCursor >= words.length - 1) {
        setTimeout(() => {
          if (isMounted.current && !isCompleted) {
            handleFinishReading();
          }
        }, 1500);
      }
      
      return newStatuses;
    });

    setCurrentWordIndex(Math.min(finalMaxIndex + 1, words.length - 1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  return (
    <div className="w-full flex flex-col items-center bg-transparent py-6 sm:py-8 px-4" style={{ minHeight: '0' }}>
      
      <div className="w-full max-w-[520px] flex flex-col gap-6 sm:gap-8 mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-black tracking-wider text-slate-800 mb-1 uppercase">READING TIME</h2>
          <p className="text-base font-bold text-slate-500 mb-4">Follow the path →</p>
        </div>

        {/* Phase: Instruction */}
        <AnimatePresence mode="wait">
          {phase === 'instruction' && (
            <motion.div
              key="instruction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center w-full gap-6"
            >
              <div className="text-center text-lg font-normal text-slate-700 flex flex-col gap-1 w-full">
                <p>Read the paragraph at your own pace.</p>
                <p>Any way that feels comfortable is fine.</p>
              </div>

              <div className="flex flex-col items-center gap-3 mt-4">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500">
                  <ArrowUp size={32} strokeWidth={2.5} />
                </motion.div>
                <div className="bg-blue-600 text-white text-[17px] font-medium py-2 pl-6 pr-2 rounded-xl shadow-md flex items-center gap-4">
                  <span>Read instructions.</span>
                  <button
                    onClick={handleStartReading}
                    title="Start Reading"
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <ThumbsUp size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase: Reading / Done */}
          {(phase === 'reading' || phase === 'done') && (
            <motion.div 
              key="reading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full gap-5"
            >
              {phase === 'reading' && (
                <div className="bg-blue-50/80 px-4 py-2 rounded-xl border border-blue-100 flex items-center justify-center gap-2 shadow-sm w-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-blue-800 font-semibold text-sm">Start reading aloud when you are ready.</span>
                </div>
              )}

              <div 
                className="text-left bg-[#FAFAFA] rounded-3xl border border-slate-100 shadow-sm w-full p-6 text-lg sm:text-xl text-slate-700" 
                style={{ lineHeight: 1.7, letterSpacing: '0.02em' }}
              >
                {words.map((word, idx) => {
                  let statusClass = 'text-slate-700';
                  if (wordStatuses[idx] === 'green') statusClass = 'text-emerald-700 bg-emerald-50 rounded-lg px-1 transition-colors duration-300';
                  if (wordStatuses[idx] === 'red') statusClass = 'text-rose-700 bg-rose-50 rounded-lg px-1 transition-colors duration-300';
                  if (wordStatuses[idx] === 'yellow') statusClass = 'text-slate-700'; 
                  
                  const isSpotlight = idx === currentWordIndex && phase === 'reading';
                  if (isSpotlight) {
                    statusClass = 'text-blue-900 bg-blue-100/80 rounded-md border-b-2 border-blue-400 font-medium z-10 relative';
                  }
                  
                  return (
                    <span key={idx} className={`inline-block mx-0.5 transition-all duration-200 ${statusClass}`}>
                      {word}
                    </span>
                  );
                })}
              </div>
              
              <div className="w-full text-center text-sm text-slate-400 italic overflow-hidden text-ellipsis whitespace-nowrap min-h-[20px]">
                {transcript || (phase === 'reading' ? "Listening for your voice..." : "")}
              </div>
              
              <div className="flex justify-center mt-2">
                {phase === 'reading' ? (
                  <button 
                    onClick={handleFinishReading} 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-base shadow-lg shadow-emerald-200/50 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                    Finish Reading
                  </button>
                ) : (
                  <div className="text-emerald-600 font-bold flex items-center gap-2 px-8 py-3 bg-emerald-50 rounded-full border border-emerald-200">
                    <CheckCircle2 size={24} />
                    Activity Completed
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
