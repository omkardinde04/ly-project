import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Situation {
  id: string;
  scenario: string;
  /** Give every option an image to show the step as a 2×2 picture grid. */
  options: { id: string; text: string; image?: string }[];
}

interface SituationResponse {
  situationId: string;
  selectedOptionId: string;
  timeTakenMs: number;
}

export interface SituationSeriesData {
  responses: SituationResponse[];
  totalTimeMs: number;
}

interface SituationSeriesTaskProps {
  onComplete: (data: SituationSeriesData) => void;
  scenarios: Situation[][]; // Array of possible scenarios (each scenario is an array of situations/parts)
  title?: string;
}

export function SituationSeriesTask({ onComplete, scenarios, title = "Imagine this..." }: SituationSeriesTaskProps) {
  // Randomly pick ONE scenario from the provided scenarios list
  const [selectedScenario] = useState<Situation[]>(() => {
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SituationResponse[]>([]);
  const startTime = useRef<number>(0);
  const stepStartTime = useRef<number>(0);

  useEffect(() => {
    if (!startTime.current) startTime.current = Date.now();
    stepStartTime.current = Date.now();
  }, [currentStep]);

  const [picked, setPicked] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    if (picked) return;
    const now = Date.now();
    const timeTaken = now - stepStartTime.current;
    
    const newResponse: SituationResponse = {
      situationId: selectedScenario[currentStep].id,
      selectedOptionId: optionId,
      timeTakenMs: timeTaken
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);
    setPicked(optionId);

    // Short pause so the choice is visibly confirmed before moving on
    window.setTimeout(() => {
      setPicked(null);
      if (currentStep < selectedScenario.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete({
          responses: newResponses,
          totalTimeMs: now - startTime.current
        });
      }
    }, 450);
  };

  const step = selectedScenario[currentStep];
  const isPictureStep = step.options.every((o) => !!o.image);

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#F5F9FF] rounded-2xl p-5 sm:p-8 shadow-sm font-sans flex flex-col items-center justify-center min-h-[420px]">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[#1A2340] mb-2">{title}</h2>
        <div className="h-1 w-12 bg-[#4DA6FF] rounded-full mx-auto opacity-50" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col items-center"
        >
          <p className="text-lg text-[#2A3A5A] text-center mb-2 leading-relaxed font-bold px-4">
            {step.scenario}
          </p>
          <p className="text-sm text-[#64748B] text-center mb-6 font-medium">
            {isPictureStep ? 'What would you do? Tap a picture.' : 'What would you do? Pick one.'}
          </p>

          {isPictureStep ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-2xl mx-auto" role="group" aria-label="Pick a picture">
              {step.options.map((option) => {
                const isPicked = picked === option.id;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileHover={picked ? undefined : { y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleOptionSelect(option.id)}
                    aria-label={option.text}
                    aria-pressed={isPicked}
                    className={`group relative overflow-hidden rounded-2xl border-4 bg-white text-left shadow-sm transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
                      isPicked
                        ? 'border-emerald-500 shadow-lg shadow-emerald-100'
                        : picked
                          ? 'border-transparent opacity-50'
                          : 'border-transparent hover:border-[#4DA6FF]'
                    }`}
                  >
                    <img
                      src={option.image}
                      alt=""
                      draggable={false}
                      className="block w-full h-auto"
                    />
                    <span className="block px-2.5 py-2 text-xs sm:text-sm font-bold text-[#1A2340] bg-white leading-snug">{option.text}</span>
                    {isPicked && (
                      <span className="absolute top-2 right-2 w-9 h-9 rounded-full bg-emerald-500 text-white text-lg font-black flex items-center justify-center shadow">
                        ✓
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 w-full max-w-lg mx-auto">
              {step.options.map((option) => (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={{ scale: 1.02, backgroundColor: '#EBF4FF' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full py-4 px-6 bg-surface border rounded-xl text-[#1A2340] font-semibold text-left transition-colors shadow-sm hover:border-[#4DA6FF] flex items-center justify-between group cursor-pointer ${
                    picked === option.id ? 'border-emerald-500 bg-emerald-50' : 'border-[#DCEBFF]'
                  }`}
                >
                  <span>{option.text}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4DA6FF]">→</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-2">
        {selectedScenario.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-[#4DA6FF]' : 'w-2 bg-[#DCEBFF]'}`} 
          />
        ))}
      </div>
    </div>
  );
}
