import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  steps: string[];
  onStepClick: (index: number) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8 justify-center">
      {steps.map((label, index) => {
        const isActive = currentStep === index;
        const isCompleted = index < currentStep;

        return (
          <button
            key={label}
            onClick={() => onStepClick(index)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-300 font-bold text-lg shadow-sm
              ${isActive ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-blue-200' : 
                isCompleted ? 'bg-green-50 border-green-200 text-green-700' : 
                'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
            style={{ fontFamily: 'OpenDyslexic, sans-serif' }}
          >
            <div className="relative">
              {isCompleted ? (
                <CheckCircle2 size={24} className="text-green-500" />
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs
                  ${isActive ? 'border-white' : 'border-gray-300'}`}>
                  {index + 1}
                </div>
              )}
            </div>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
