import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ThumbsUp } from 'lucide-react';

export function HandRaisingTask({ question, onComplete }: { question: any, onComplete: (isCorrect: boolean) => void }) {
  const [stage, setStage] = useState<'tutorial' | 'assessment'>('tutorial');
  const [phase, setPhase] = useState<'standby' | 'initializing' | 'preparing' | 'detecting' | 'completed'>('standby');
  const [targetHand, setTargetHand] = useState<'left' | 'right'>('left');
  const [countdown, setCountdown] = useState(3);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);
  const cameraHardwareRef = useRef<any>(null);
  
  const detectionCount = useRef(0);
  const isCorrectRef = useRef<boolean>(false);
  const phaseRef = useRef(phase);

  useEffect(() => {
    setTargetHand(Math.random() > 0.5 ? 'left' : 'right');
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Start camera only after tutorial is done
  useEffect(() => {
    if (stage === 'tutorial') return;
    setPhase('initializing');

    let isMounted = true;
    
    if (!(window as any).Hands || !(window as any).Camera) {
      console.error("MediaPipe Hands not loaded.");
      if (isMounted) setPhase('completed');
      return;
    }

    const hands = new (window as any).Hands({locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    handsRef.current = hands;

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results: any) => {
      if (!isMounted) return;
      
      if (phaseRef.current === 'detecting' && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Anatomical hand validation
        const handedness = results.multiHandedness[0].label.toLowerCase(); // 'left' or 'right'
        let actualHand = handedness;
        
        // Check if hand is raised (Index finger tip [8] is above wrist [0])
        const wrist = results.multiHandLandmarks[0][0];
        const indexFinger = results.multiHandLandmarks[0][8];
        const isRaised = indexFinger.y < (wrist.y - 0.15); // Hand must be visibly raised up
        
        if (isRaised && actualHand) {
           // We found a raised hand!
           // Check if it matches the target
           const isMatch = actualHand === targetHand;
           
           if (isMatch) {
             detectionCount.current += 1;
           } else {
             detectionCount.current -= 1; // Penalty for wrong hand
           }
           
           // Require 10 solid frames of correct hand
           if (detectionCount.current > 10) { 
              isCorrectRef.current = true;
              setPhase('completed');
              if (cameraHardwareRef.current) cameraHardwareRef.current.stop();
           } else if (detectionCount.current < -10) {
              isCorrectRef.current = false;
              setPhase('completed');
              if (cameraHardwareRef.current) cameraHardwareRef.current.stop();
           }
        } else {
          // Hand is down or not raised, reset count slightly
          detectionCount.current = 0;
        }
      }
    });

    if (videoRef.current) {
      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (isMounted && handsRef.current && (phaseRef.current === 'detecting' || phaseRef.current === 'initializing')) {
            await handsRef.current.send({image: videoRef.current});
          }
        },
        width: 320,
        height: 240
      });
      cameraHardwareRef.current = camera;
      camera.start().then(() => {
        if (isMounted) {
          setPhase('preparing');
        }
      }).catch((e: any) => {
        console.error(e);
        if (isMounted) setPhase('completed');
      });
    }

    return () => {
      isMounted = false;
      if (cameraHardwareRef.current) cameraHardwareRef.current.stop();
      if (handsRef.current) handsRef.current.close();
    };
  }, [stage, targetHand]);

  useEffect(() => {
    if (phase === 'preparing') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('detecting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'completed') {
      onComplete(isCorrectRef.current);
    }
  }, [phase, onComplete]);

  const handleStartAssessment = () => {
    setStage('assessment');
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-white relative p-4 h-full overflow-hidden w-full">
      <div className="w-full max-w-2xl flex flex-col items-center h-full gap-4 pt-4 sm:pt-8">
        
        {/* 1. Instruction */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center flex flex-col items-center"
        >
          <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1A202C] leading-snug tracking-wide">
            {question?.instruction || 'Raise your left or right hand as instructed.'}
          </h2>
          
          <AnimatePresence>
            {stage === 'tutorial' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex flex-col items-center z-10 overflow-hidden"
              >
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 mb-1.5 drop-shadow-md">
                  <ArrowUp size={36} strokeWidth={2.5} />
                </motion.div>
                <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm flex items-center gap-3 border border-blue-500">
                  <span className="font-medium">Read instructions.</span>
                  <button onClick={handleStartAssessment} title="Got it" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shrink-0 cursor-pointer">
                    <ThumbsUp size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 2. Camera Interface */}
        <AnimatePresence>
          {stage === 'assessment' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center flex-1 mt-4"
            >
              <div 
                className="w-full max-w-xl flex-1 max-h-[300px] bg-gradient-to-br from-[#F8FAFC] to-blue-50/40 rounded-3xl border border-blue-100 overflow-hidden flex flex-col items-center justify-center p-6 transition-all duration-300 relative shadow-inner"
              >
                {/* We now show the video feed so the user knows what the camera sees */}
                <video 
                  ref={videoRef} 
                  className={`absolute inset-0 w-full h-full object-cover rounded-3xl transition-opacity duration-500 scale-x-[-1] ${phase === 'detecting' || phase === 'preparing' ? 'opacity-30' : 'opacity-0 pointer-events-none'}`} 
                  muted 
                  playsInline 
                />
                
                {phase === 'initializing' && (
                  <div className="text-blue-500 animate-pulse text-lg font-medium flex flex-col items-center relative z-10">
                    <span className="text-5xl mb-4">📷</span>
                    Accessing camera...
                  </div>
                )}

                {phase === 'preparing' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center relative z-10"
                  >
                    <h2 className="text-3xl font-black text-slate-800 mb-2 text-center">
                      Get Ready...
                    </h2>
                    <p className="text-slate-600 font-bold mb-4 text-center">
                      Instruction: Raise your <span className="text-blue-600 uppercase underline decoration-4 underline-offset-4">{targetHand}</span> hand.
                    </p>
                    <motion.div 
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl font-black text-blue-600"
                    >
                      {countdown}
                    </motion.div>
                  </motion.div>
                )}

                {phase === 'detecting' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center relative z-10 bg-white/80 p-6 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm"
                  >
                    <span className="text-6xl mb-4">✋</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 text-center leading-tight">
                      Raise your <span className="text-blue-600 uppercase underline decoration-4 underline-offset-4">{targetHand}</span> hand.
                    </h2>
                    <p className="text-slate-600 font-bold text-center text-sm">Keep your hand up until detected...</p>
                    <div className="mt-6 flex gap-2 justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </motion.div>
                )}

                {phase === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                       <span className="text-4xl">📸</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Hand Detected!</h3>
                    <p className="text-slate-500 font-medium mb-2">Your response has been recorded.</p>
                  </motion.div>
                )}
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
