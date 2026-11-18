import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Check } from 'lucide-react';

export const PrefSavedScreen: React.FC = () => {
  const { goToScreen, resetAll } = useApp();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        step={4}
        showBack={true}
        showProgress={true}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 max-w-md mx-auto w-full text-center my-auto">
        
        {/* Big Circular Checkmark Badge in Cream */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-showroom-cream flex items-center justify-center mb-8 shadow-2xl bg-showroom-900/60">
          <Check className="w-12 h-12 text-showroom-cream stroke-[2.5]" />
        </div>

        {/* Heading & Confirmation matching exact spec */}
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight uppercase mb-3">
          ALL SET
        </h1>

        <p className="text-sm sm:text-base text-showroom-muted font-normal max-w-xs mb-10 leading-relaxed">
          Your face profile and style preferences have been saved.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3.5">
          {/* VIEW SUMMARY */}
          <button
            onClick={() => goToScreen('summary')}
            id="kiosk-view-summary-btn"
            className="w-full flex items-center justify-center py-4 px-8 rounded-full bg-showroom-cream hover:bg-showroom-creamHover text-showroom-950 font-semibold text-sm sm:text-base tracking-wider uppercase shadow-kiosk-button transition-all touch-btn"
          >
            <span>VIEW SUMMARY</span>
          </button>

          {/* START OVER */}
          <button
            onClick={resetAll}
            id="kiosk-start-over-btn"
            className="w-full flex items-center justify-center py-3.5 sm:py-4 px-8 rounded-full bg-showroom-850 hover:bg-showroom-800 border border-showroom-700 text-showroom-ivory font-semibold text-xs sm:text-sm tracking-wider uppercase transition-colors touch-btn"
          >
            <span>START OVER</span>
          </button>
        </div>

      </div>
    </div>
  );
};
