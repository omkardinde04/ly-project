import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Situation {
  id: string;
  scenario: string;
  options: { id: string; text: string }[];
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
  const startTime = useRef<number>(Date.now());
  const stepStartTime = useRef<number>(Date.now());

  useEffect(() => {
    stepStartTime.current = Date.now();
  }, [currentStep]);

  const handleOptionSelect = (optionId: string) => {
    const now = Date.now();
    const timeTaken = now - stepStartTime.current;
    
    const newResponse: SituationResponse = {
      situationId: selectedScenario[currentStep].id,
      selectedOptionId: optionId,
      timeTakenMs: timeTaken
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    if (currentStep < selectedScenario.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        responses: newResponses,
        totalTimeMs: now - startTime.current
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#F5F9FF] rounded-2xl p-8 shadow-sm font-sans flex flex-col items-center justify-center min-h-[420px]">
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
          <p className="text-lg text-[#2A3A5A] text-center mb-8 leading-relaxed font-medium px-4">
            {selectedScenario[currentStep].scenario}
          </p>

          <div className="grid grid-cols-1 gap-3 w-full">
            {selectedScenario[currentStep].options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02, backgroundColor: '#EBF4FF' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(option.id)}
                className="w-full py-4 px-6 bg-white border border-[#DCEBFF] rounded-xl text-[#1A2340] font-semibold text-left transition-colors shadow-sm hover:border-[#4DA6FF] flex items-center justify-between group"
              >
                <span>{option.text}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4DA6FF]">→</span>
              </motion.button>
            ))}
          </div>
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
