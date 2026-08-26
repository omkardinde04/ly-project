import React from 'react';
import { Check, Circle } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  steps: { key: string; label: string }[];
  onStepClick: (index: number) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  steps,
  onStepClick,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = index < currentStep;

        return (
          <button
            key={step.key}
            type="button"
            onClick={() => onStepClick(index)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              isActive
                ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-xs'
                : isCompleted
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-white border-slate-200/80 text-[#64748B] hover:border-blue-200 hover:text-[#2563EB]'
            }`}
          >
            <div className="flex items-center justify-center shrink-0">
              {isCompleted ? (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check size={11} strokeWidth={3} />
                </div>
              ) : (
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive
                      ? 'bg-white text-[#2563EB]'
                      : 'bg-slate-100 text-[#64748B] border border-slate-300'
                  }`}
                >
                  {index + 1}
                </div>
              )}
            </div>
            <span>{step.label}</span>
          </button>
        );
      })}
    </div>
  );
};
