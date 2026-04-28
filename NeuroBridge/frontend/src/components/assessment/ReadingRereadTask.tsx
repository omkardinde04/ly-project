import { useState, useEffect, useRef } from 'react';

export function ReadingRereadTask({ onComplete }: { onComplete: (rereadCount: number) => void }) {
  const [paragraphs] = useState([
    "The vast ocean covers most of our planet and is home to countless mysterious creatures. Many people dream of exploring its deepest trenches, where the sunlight never reaches. The pressure down there is immense, yet life still finds a way to thrive in the darkness. We still have so much to learn about the ocean.",
    "A dense forest can feel like a completely different world, filled with towering trees and a thick canopy that blocks out the sky. As you walk through the woods, you can hear the crunch of dry leaves under your boots and the distant call of exotic birds. Nature has a unique way of making us feel both small and connected.",
    "Space exploration has always captured the imagination of humanity, inspiring us to look up at the stars and wonder what lies beyond. Building rockets requires incredible precision and thousands of hours of testing by brilliant engineers. One day, we might even establish a permanent colony on another planet in our solar system.",
    "Learning a new language opens up doors to new cultures and entirely different ways of thinking about the world. It can be challenging at first, especially when trying to memorize unfamiliar grammar rules and vocabulary. However, the feeling of having your first real conversation with a native speaker makes all the effort worthwhile.",
    "The history of ancient civilizations is full of fascinating mysteries and monumental architectural achievements. For example, the great pyramids were built using techniques that historians and engineers are still trying to fully understand today. These ancient structures stand as a testament to human ingenuity and perseverance over time."
  ]);
  
  const [selectedParagraph] = useState(() => paragraphs[Math.floor(Math.random() * paragraphs.length)]);
  const [words] = useState(selectedParagraph.split(' '));
  
  const [phase, setPhase] = useState<'idle' | 'listening' | 'done'>('idle');
  const [wordStatuses, setWordStatuses] = useState<('idle' | 'green' | 'red' | 'yellow')[]>(Array(words.length).fill('idle'));
  const [rereadCount, setRereadCount] = useState(0);
  const [transcript, setTranscript] = useState('');

  const recogRef = useRef<any>(null);
  const isMounted = useRef(true);
  const transcriptRef = useRef('');

  useEffect(() => {
    return () => { isMounted.current = false; stopCurrentRecognition(); };
  }, []);

  const stopCurrentRecognition = () => {
    if (recogRef.current) {
      try {
        recogRef.current.onresult = null;
        recogRef.current.onend = null;
        recogRef.current.onerror = null;
        recogRef.current.stop();
      } catch (e) {}
      recogRef.current = null;
    }
  };

  const startListening = () => {
    stopCurrentRecognition();
    
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
       alert("Speech recognition not supported in this browser.");
       setPhase('done');
       onComplete(0);
       return;
    }

    setTranscript('');
    transcriptRef.current = '';
    
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let currentTranscript = '';
      for (let i = 0; i < e.results.length; ++i) {
        currentTranscript += e.results[i][0].transcript;
      }
      transcriptRef.current = currentTranscript;
      if (isMounted.current) setTranscript(currentTranscript);
    };

    rec.onend = () => {
      // Re-start ONLY if deliberate
      if (isMounted.current && phase === 'listening') {
        try { rec.start(); } catch (err) {}
      }
    };

    rec.onerror = (e: any) => {
      console.error('Reading Review recognition error:', e.error);
      if (e.error === 'not-allowed') {
        alert("Camera and Mic permission required for this task.");
      }
    };

    recogRef.current = rec;
    setPhase('listening');
    
    try {
      rec.start();
    } catch (e) {
      console.error('Failed to start reading review:', e);
      setPhase('idle');
    }
  };

  const stopListening = () => {
    stopCurrentRecognition();
    setPhase('done');
    onComplete(rereadCount);
  };

  useEffect(() => {
    if (phase !== 'listening') return;
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    if (spokenWords.length === 0) return;

    setWordStatuses((prev) => {
      const newStatuses = [...prev];
      let spokenCursor = 0;
      let textCursor = 0;
      let newRereadCount = rereadCount;

      let maxMatchedIndex = -1;

      while (spokenCursor < spokenWords.length && textCursor < words.length) {
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
             for (let nextIdx = textCursor + 1; nextIdx <= Math.min(textCursor + 2, words.length - 1); nextIdx++) {
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
      return newStatuses;
    });
  }, [transcript]);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full bg-slate-50">
       <div className="mb-4">
         <h2 className="text-2xl font-bold text-slate-800">Reading Fluency</h2>
         <p className="text-slate-600">Please read the paragraph aloud. We will highlight words you read fluently in green, and words you repeat in red.</p>
       </div>

       {phase === 'idle' && (
         <button onClick={startListening} className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
           🎤 Start Recording
         </button>
       )}
       {phase === 'listening' && (
         <div className="flex flex-col items-center mb-6">
           <button onClick={stopListening} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 animate-pulse">
             🛑 Finish Reading
           </button>
         </div>
       )}
       {phase === 'done' && (
         <div className="mb-6 bg-green-100 text-green-700 px-6 py-3 rounded-xl border border-green-200 font-bold text-lg flex items-center gap-2">
           ✅ Done! Proceed to the next question.
         </div>
       )}

       <div className="text-2xl leading-relaxed max-w-3xl text-left p-8 bg-white rounded-2xl border-2 border-slate-200 shadow-sm" style={{ lineHeight: '2.5' }}>
         {words.map((word, idx) => {
           let statusClass = 'text-gray-400';
           if (wordStatuses[idx] === 'green') statusClass = 'text-green-600 bg-green-50 rounded px-1 font-semibold';
           if (wordStatuses[idx] === 'red') statusClass = 'text-red-600 bg-red-100 rounded px-1 font-bold line-through decoration-red-400 decoration-2';
           if (wordStatuses[idx] === 'yellow') statusClass = 'text-yellow-600 bg-yellow-100 rounded px-1 font-semibold';

           return (
             <span key={idx} className={`inline-block mx-0.5 transition-colors duration-300 ${statusClass}`}>
               {word}
             </span>
           );
         })}
       </div>
       
       <div className="mt-4 text-sm text-slate-500 font-medium flex gap-4 justify-center">
         <span className="inline-block"><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Read perfectly</span>
         <span className="inline-block"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span> Mispronounced / Skipped</span>
         <span className="inline-block"><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> Repeated / Re-read</span>
       </div>
    </div>
  );
}
