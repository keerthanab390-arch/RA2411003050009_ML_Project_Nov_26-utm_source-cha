import React from 'react';

interface ProgressDotsProps {
  currentStep: number; // 1, 2, 3, 4
  totalSteps?: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ currentStep, totalSteps = 4 }) => {
  return (
    <div className="flex items-center justify-center gap-2.5 my-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum <= currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div
                className={`h-[1.5px] w-6 sm:w-10 transition-all duration-300 ${
                  isActive ? 'bg-showroom-cream' : 'bg-showroom-700'
                }`}
              />
            )}
            <div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-showroom-cream'
                  : 'bg-showroom-800 border border-showroom-700'
              } ${isCurrent ? 'ring-4 ring-showroom-cream/20' : ''}`}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};
